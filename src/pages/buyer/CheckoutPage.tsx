import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import { getCart, clearCart } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { sanitizeCartItems } from '../../utils/cartValidation';
import { validateAddress, validatePayment, validateCart } from '../../utils/purchaseValidation';
import showAppToast from '../../utils/toast';
import { logger } from '../../utils/logger';
// import { createVNPayPayment, getUserIpAddress, VNPAY_BANK_CODES } from '../../services/vnpayService.ts'; // Temporarily disabled

const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface CheckoutPageProps { onClearCart?: () => void; }

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onClearCart }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');

  // Address selection states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [street, setStreet] = useState('');

  useEffect(() => {
    logger.debug('CheckoutPage', 'fetching provinces from API');
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProvinces(data);
        logger.info('CheckoutPage', 'provinces loaded', { count: data.length });
      })
      .catch(err => {
        logger.error('CheckoutPage', 'failed to fetch provinces', err);
        alert('❌ Không thể tải danh sách tỉnh/thành. Vui lòng kiểm tra kết nối mạng.');
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      logger.debug('CheckoutPage', 'fetching districts', { provinceCode: selectedProvince });
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setDistricts(data.districts);
          logger.debug('CheckoutPage', 'districts loaded', { count: data.districts.length });
        })
        .catch(err => {
          logger.error('CheckoutPage', 'failed to fetch districts', { provinceCode: selectedProvince, error: err.message });
          alert('❌ Không thể tải danh sách quận/huyện. Vui lòng thử lại.');
        });
    } else {
      setDistricts([]);
    }
    setSelectedDistrict('');
    setWards([]);
    setSelectedWard('');
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      logger.debug('CheckoutPage', 'fetching wards', { districtCode: selectedDistrict });
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          setWards(data.wards);
          logger.debug('CheckoutPage', 'wards loaded', { count: data.wards.length });
        })
        .catch(err => {
          logger.error('CheckoutPage', 'failed to fetch wards', { districtCode: selectedDistrict, error: err.message });
          alert('❌ Không thể tải danh sách phường/xã. Vui lòng thử lại.');
        });
    } else {
      setWards([]);
    }
    setSelectedWard('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && street) {
      const p = provinces.find(x => x.code == selectedProvince)?.name;
      const d = districts.find(x => x.code == selectedDistrict)?.name;
      const w = wards.find(x => x.code == selectedWard)?.name;
      if (p && d && w) {
        setAddress(`${street}, ${w}, ${d}, ${p}`);
      }
    } else {
      setAddress('');
    }
  }, [selectedProvince, selectedDistrict, selectedWard, street, provinces, districts, wards]);

  const [loadingRef, setLoadingRef] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod' | 'qr'>('cod'); // Payment method selection - VNPay temporarily disabled

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Always read from localStorage (ignore propCart to ensure latest data)
        const stored = await getCart();
        if (!mounted) return;
        setCart(sanitizeCartItems(stored.items as any));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0);
  const total = subtotal; // Không tính phí ship và giảm giá trong code, sẽ có chương trình khuyến mãi sau

  const handleCODOrder = async () => {
    // Validate address components
    const addressValidation = validateAddress(
      provinces.find(p => p.code == selectedProvince)?.name || '',
      districts.find(d => d.code == selectedDistrict)?.name || '',
      wards.find(w => w.code == selectedWard)?.name || '',
      street
    );

    if (!addressValidation.isValid) {
      showAppToast(addressValidation.errors[0] || 'Địa chỉ không hợp lệ', 'error', 2500);
      return;
    }

    // Validate cart before payment
    const cartValidation = validateCart(cart);
    if (!cartValidation.isValid) {
      showAppToast(cartValidation.errors[0] || 'Giỏ hàng có lỗi', 'error', 2500);
      return;
    }

    // Validate payment details
    const paymentValidation = validatePayment(cart, address, total);
    if (!paymentValidation.isValid) {
      showAppToast(paymentValidation.errors[0] || 'Thông tin thanh toán không hợp lệ', 'error', 2500);
      return;
    }

    // Show warnings if any
    if (paymentValidation.warnings.length > 0) {
      showAppToast(paymentValidation.warnings[0], 'warning', 2500);
    }

    setLoadingRef(true);
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        showAppToast('Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm vào giỏ trước.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 1: Create delivery address first
      logger.debug('CheckoutPage', 'creating delivery address for COD');
      const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
      const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
      const wardName = wards.find(w => w.code == selectedWard)?.name || '';

      const addressData = {
        recipientName: 'Khách hàng',
        street: street || 'Không có',
        city: provinceName,
        state: `${districtName}, ${wardName}`,
        zipCode: '',
        country: 'Vietnam',
        isDefault: false
      };

      const createdAddress = await addressService.createAddress(addressData);
      logger.info('CheckoutPage', 'address created for COD', { addressId: createdAddress.id });

      // Step 2: Create payment method for COD
      logger.debug('CheckoutPage', 'creating COD payment method');
      const paymentMethodData = {
        type: 'cod',
        cardholderName: 'Thanh toán khi nhận hàng',
        isDefault: true
      };

      const createdPaymentMethod = await paymentMethodService.createPaymentMethod(paymentMethodData);
      logger.info('CheckoutPage', 'COD payment method created', { paymentMethodId: createdPaymentMethod.id });

      // Verify address exists before proceeding
      try {
        await addressService.getAddressById(createdAddress.id);
        logger.debug('CheckoutPage', 'address verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'address verification failed', verifyError);
        showAppToast('Địa chỉ không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Verify payment method exists before proceeding
      try {
        await paymentMethodService.getPaymentMethodById(createdPaymentMethod.id);
        logger.debug('CheckoutPage', 'payment method verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'payment method verification failed', verifyError);
        showAppToast('Phương thức thanh toán không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 3: Validate cart has items before creating order
      if (cart.length === 0) {
        showAppToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      console.log('=== COD CHECKOUT DEBUG ===');
      console.log('Cart items count:', cart.length);
      console.log('Cart items:', cart);
      console.log('CartId:', cartId);
      console.log('==========================');

      // Step 4: Create order with COD payment
      const orderData = {
        CartId: cartId,
        DeliveryAddressId: createdAddress.id,
        PaymentMethodId: createdPaymentMethod.id,
        SpecialInstructions: `💵 Thanh toán khi nhận hàng (COD)\nĐịa chỉ: ${address}\n📦 Miễn phí vận chuyển cho tất cả đơn hàng!\n🎉 Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới!`
      };

      logger.debug('CheckoutPage', 'creating COD order via API', orderData);

      try {
        const order = await orderService.createOrder(orderData);

        logger.info('CheckoutPage', 'COD order created successfully', { orderId: order.id || (order as any)?.Id });

        // Backend might return Id (PascalCase) instead of id (camelCase)
        const orderId = order.id || (order as any)?.Id;

        if (!orderId) {
          throw new Error('Order created but no ID returned from server');
        }

        // Save order ID for tracking
        localStorage.setItem('currentOrderId', orderId);

        // Clear cart after successful COD order
        await clearCart();
        if (onClearCart) onClearCart();

        setLoadingRef(false);

        showAppToast(`✅ Đơn hàng #${orderId.substring(0, 8)} đã được tạo thành công! Vui lòng chuẩn bị tiền mặt khi nhận hàng.`, 'success', 3000);

        // Redirect to order confirmation page
        setTimeout(() => {
          navigate(`/buyer/orders/${orderId}`);
        }, 1500);

      } catch (createOrderError: any) {
        const errorMsg = createOrderError.message || createOrderError.toString();
        logger.error('CheckoutPage', 'COD order creation failed', { error: errorMsg, orderData });

        if (errorMsg.includes('entity changes') || errorMsg.includes('database')) {
          showAppToast('⚠️ Lỗi hệ thống khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.', 'error', 4000);
        } else if (errorMsg.includes('Cart')) {
          showAppToast('Giỏ hàng không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        } else if (errorMsg.includes('Address')) {
          showAppToast('Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.', 'error', 3000);
        } else if (errorMsg.includes('Payment')) {
          showAppToast('Phương thức thanh toán không hợp lệ.', 'error', 3000);
        } else {
          showAppToast('Không thể tạo đơn hàng. Vui lòng thử lại sau.', 'error', 3000);
        }

        setLoadingRef(false);
        return;
      }

    } catch (orderError: any) {
      logger.error('CheckoutPage', 'COD checkout process failed', orderError);
      const errorMsg = orderError.message || 'Đã xảy ra lỗi trong quá trình đặt hàng';
      showAppToast(errorMsg, 'error', 3000);
      setLoadingRef(false);
      return;
    }
  };

  const handleQRPaymentOrder = async () => {
    // Validate address components
    const addressValidation = validateAddress(
      provinces.find(p => p.code == selectedProvince)?.name || '',
      districts.find(d => d.code == selectedDistrict)?.name || '',
      wards.find(w => w.code == selectedWard)?.name || '',
      street
    );

    if (!addressValidation.isValid) {
      showAppToast(addressValidation.errors[0] || 'Địa chỉ không hợp lệ', 'error', 2500);
      return;
    }

    // Validate cart before payment
    const cartValidation = validateCart(cart);
    if (!cartValidation.isValid) {
      showAppToast(cartValidation.errors[0] || 'Giỏ hàng có lỗi', 'error', 2500);
      return;
    }

    // Validate payment details
    const paymentValidation = validatePayment(cart, address, total);
    if (!paymentValidation.isValid) {
      showAppToast(paymentValidation.errors[0] || 'Thông tin thanh toán không hợp lệ', 'error', 2500);
      return;
    }

    setLoadingRef(true);
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        showAppToast('Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm vào giỏ trước.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 1: Create delivery address
      logger.debug('CheckoutPage', 'creating delivery address for QR payment');
      const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
      const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
      const wardName = wards.find(w => w.code == selectedWard)?.name || '';

      const addressData = {
        recipientName: 'Khách hàng',
        street: street || 'Không có',
        city: provinceName,
        state: `${districtName}, ${wardName}`,
        zipCode: '',
        country: 'Vietnam',
        isDefault: false
      };

      const createdAddress = await addressService.createAddress(addressData);
      logger.info('CheckoutPage', 'address created for QR payment', { addressId: createdAddress.id });

      // Step 2: Create payment method for QR
      logger.debug('CheckoutPage', 'creating QR payment method');
      const paymentMethodData = {
        type: 'qr_payment',
        cardholderName: 'Thanh toán QR Code',
        isDefault: true
      };

      const createdPaymentMethod = await paymentMethodService.createPaymentMethod(paymentMethodData);
      logger.info('CheckoutPage', 'QR payment method created', { paymentMethodId: createdPaymentMethod.id });

      // Verify address exists
      try {
        await addressService.getAddressById(createdAddress.id);
        logger.debug('CheckoutPage', 'address verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'address verification failed', verifyError);
        showAppToast('Địa chỉ không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Verify payment method exists
      try {
        await paymentMethodService.getPaymentMethodById(createdPaymentMethod.id);
        logger.debug('CheckoutPage', 'payment method verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'payment method verification failed', verifyError);
        showAppToast('Phương thức thanh toán không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 3: Validate cart has items
      if (cart.length === 0) {
        showAppToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 4: Create order with QR payment
      const orderData = {
        CartId: cartId,
        DeliveryAddressId: createdAddress.id,
        PaymentMethodId: createdPaymentMethod.id,
        SpecialInstructions: `📱 Thanh toán qua QR Code\nĐịa chỉ: ${address}\n📦 Miễn phí vận chuyển cho tất cả đơn hàng!\n🎉 Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới!`
      };

      logger.debug('CheckoutPage', 'creating QR order via API', orderData);

      try {
        const order = await orderService.createOrder(orderData);
        logger.info('CheckoutPage', 'QR order created successfully', { orderId: order.id || (order as any)?.Id });

        // Backend might return Id (PascalCase) instead of id (camelCase)
        const orderId = order.id || (order as any)?.Id;

        if (!orderId) {
          throw new Error('Order created but no ID returned from server');
        }

        // Save order ID for tracking
        localStorage.setItem('currentOrderId', orderId);

        // Save order details for QR payment page
        localStorage.setItem('qrPaymentOrder', JSON.stringify({
          orderId: orderId,
          amount: total,
          items: cart,
          address: address,
          timestamp: new Date().toISOString()
        }));

        setLoadingRef(false);

        showAppToast(`✅ Đơn hàng #${orderId.substring(0, 8)} đã được tạo! Đang chuyển đến trang thanh toán...`, 'success', 2000);

        // Redirect to QR payment page
        setTimeout(() => {
          navigate(`/buyer/qr-payment/${orderId}`);
        }, 1500);

      } catch (createOrderError: any) {
        const errorMsg = createOrderError.message || createOrderError.toString();
        logger.error('CheckoutPage', 'QR order creation failed', { error: errorMsg, orderData });

        if (errorMsg.includes('entity changes') || errorMsg.includes('database')) {
          showAppToast('⚠️ Lỗi hệ thống khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.', 'error', 4000);
        } else if (errorMsg.includes('Cart')) {
          showAppToast('Giỏ hàng không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        } else if (errorMsg.includes('Address')) {
          showAppToast('Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.', 'error', 3000);
        } else if (errorMsg.includes('Payment')) {
          showAppToast('Phương thức thanh toán không hợp lệ.', 'error', 3000);
        } else {
          showAppToast('Không thể tạo đơn hàng. Vui lòng thử lại sau.', 'error', 3000);
        }

        setLoadingRef(false);
        return;
      }

    } catch (orderError: any) {
      logger.error('CheckoutPage', 'QR checkout process failed', orderError);
      const errorMsg = orderError.message || 'Đã xảy ra lỗi trong quá trình đặt hàng';
      showAppToast(errorMsg, 'error', 3000);
      setLoadingRef(false);
      return;
    }
  };

  /* VNPay Payment Functions - Temporarily Disabled
  const createLocalPaymentRef = async () => {
    // Validate address components
    const addressValidation = validateAddress(
      provinces.find(p => p.code == selectedProvince)?.name || '',
      districts.find(d => d.code == selectedDistrict)?.name || '',
      wards.find(w => w.code == selectedWard)?.name || '',
      street
    );

    if (!addressValidation.isValid) {
      showAppToast(addressValidation.errors[0] || 'Địa chỉ không hợp lệ', 'error', 2500);
      return;
    }

    // Validate cart before payment
    const cartValidation = validateCart(cart);
    if (!cartValidation.isValid) {
      showAppToast(cartValidation.errors[0] || 'Giỏ hàng có lỗi', 'error', 2500);
      return;
    }

    // Validate payment details
    const paymentValidation = validatePayment(cart, address, total);
    if (!paymentValidation.isValid) {
      showAppToast(paymentValidation.errors[0] || 'Thông tin thanh toán không hợp lệ', 'error', 2500);
      return;
    }

    // Show warnings if any
    if (paymentValidation.warnings.length > 0) {
      showAppToast(paymentValidation.warnings[0], 'warning', 2500);
    }

    // 🆕 CREATE ORDER VIA API BEFORE SHOWING PAYMENT
    setLoadingRef(true);
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        showAppToast('Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm vào giỏ trước.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 1: Create delivery address first
      logger.debug('CheckoutPage', 'creating delivery address');
      const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
      const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
      const wardName = wards.find(w => w.code == selectedWard)?.name || '';

      const addressData = {
        recipientName: 'Khách hàng', // Can be enhanced with user input
        street: street || 'Không có',
        city: provinceName,
        state: `${districtName}, ${wardName}`,
        zipCode: '',
        country: 'Vietnam',
        isDefault: false
      };

      const createdAddress = await addressService.createAddress(addressData);
      logger.info('CheckoutPage', 'address created', { addressId: createdAddress.id });

      // Step 2: Create payment method
      logger.debug('CheckoutPage', 'creating payment method');
      const paymentMethodData = {
        type: 'bank_transfer',
        cardholderName: 'Khách hàng',
        isDefault: true
      };

      const createdPaymentMethod = await paymentMethodService.createPaymentMethod(paymentMethodData);
      logger.info('CheckoutPage', 'payment method created', { paymentMethodId: createdPaymentMethod.id });

      // Verify address exists before proceeding
      try {
        await addressService.getAddressById(createdAddress.id);
        logger.debug('CheckoutPage', 'address verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'address verification failed', verifyError);
        showAppToast('Địa chỉ không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Verify payment method exists before proceeding
      try {
        await paymentMethodService.getPaymentMethodById(createdPaymentMethod.id);
        logger.debug('CheckoutPage', 'payment method verified in database');
      } catch (verifyError) {
        logger.error('CheckoutPage', 'payment method verification failed', verifyError);
        showAppToast('Phương thức thanh toán không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      // Step 3: Validate cart has items before creating order
      if (cart.length === 0) {
        showAppToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.', 'error', 3000);
        setLoadingRef(false);
        return;
      }

      console.log('=== CHECKOUT DEBUG ===');
      console.log('Cart items count:', cart.length);
      console.log('Cart items:', cart);
      console.log('CartId:', cartId);
      console.log('=====================');

      // Step 4: Create order with address ID and payment method ID
      const orderData = {
        CartId: cartId,
        DeliveryAddressId: createdAddress.id,
        PaymentMethodId: createdPaymentMethod.id,
        SpecialInstructions: `Địa chỉ: ${address}\n📦 Miễn phí vận chuyển cho tất cả đơn hàng!\n🎉 Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới!`
      };

      logger.debug('CheckoutPage', 'creating order via API', orderData);

      try {
        const order = await orderService.createOrder(orderData);

        logger.info('CheckoutPage', 'order created successfully', { orderId: order.id || (order as any)?.Id });

        // Backend might return Id (PascalCase) instead of id (camelCase)
        const orderId = order.id || (order as any)?.Id;

        if (!orderId) {
          throw new Error('Order created but no ID returned from server');
        }

        // Save order ID for tracking
        localStorage.setItem('currentOrderId', orderId);

        // Save order details for payment reference
        localStorage.setItem('pendingPaymentOrder', JSON.stringify({
          orderId: orderId,
          amount: total,
          timestamp: new Date().toISOString()
        }));

        showAppToast(`✅ Đơn hàng #${orderId.substring(0, 8)} đã được tạo thành công! Đang chuyển đến VNPay...`, 'success', 2000);

        // Redirect to VNPay payment instead of order confirmation
        try {
          logger.info('CheckoutPage', 'redirecting to VNPay payment', { orderId: orderId, amount: total });

          // Get user's IP address (required by VNPay)
          const ipAddress = await getUserIpAddress();

          // Create VNPay payment URL
          const vnpayResult = await createVNPayPayment({
            orderId: orderId,
            amount: total,
            orderInfo: `Thanh toan don hang FSOURCING #${orderId.substring(0, 8)}`,
            ipAddress,
            bankCode: VNPAY_BANK_CODES.NCB
          });

          setLoadingRef(false);

          if (!vnpayResult.success || !vnpayResult.paymentUrl) {
            showAppToast(`❌ ${vnpayResult.error || 'Không thể tạo thanh toán VNPay'}`, 'error', 3000);
            logger.error('CheckoutPage', 'VNPay payment creation failed', vnpayResult);
            return;
          }

          // Save payment info to localStorage
          localStorage.setItem('vnpayPaymentInfo', JSON.stringify({
            orderId: orderId,
            amount: total,
            timestamp: new Date().toISOString()
          }));

          logger.info('CheckoutPage', 'redirecting to VNPay', { paymentUrl: vnpayResult.paymentUrl });

          // Redirect to VNPay payment page
          setTimeout(() => {
            window.location.href = vnpayResult.paymentUrl!;
          }, 500);

          return;
        } catch (vnpayError: any) {
          logger.error('CheckoutPage', 'VNPay payment failed', vnpayError);
          setLoadingRef(false);
          showAppToast(`⚠️ ${vnpayError.message || 'Không thể kết nối đến VNPay'}`, 'error', 3000);
          return;
        }
      } catch (createOrderError: any) {
        // More specific error handling
        const errorMsg = createOrderError.message || createOrderError.toString();
        logger.error('CheckoutPage', 'order creation failed', { error: errorMsg, orderData });

        if (errorMsg.includes('entity changes') || errorMsg.includes('database')) {
          showAppToast('⚠️ Lỗi hệ thống khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.', 'error', 4000);
        } else if (errorMsg.includes('Cart')) {
          showAppToast('Giỏ hàng không hợp lệ. Vui lòng thử lại.', 'error', 3000);
        } else if (errorMsg.includes('Address')) {
          showAppToast('Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.', 'error', 3000);
        } else if (errorMsg.includes('Payment')) {
          showAppToast('Phương thức thanh toán không hợp lệ.', 'error', 3000);
        } else {
          showAppToast('Không thể tạo đơn hàng. Vui lòng thử lại sau.', 'error', 3000);
        }

        setLoadingRef(false);
        return;
      }

    } catch (orderError: any) {
      logger.error('CheckoutPage', 'checkout process failed', orderError);
      const errorMsg = orderError.message || 'Đã xảy ra lỗi trong quá trình đặt hàng';
      showAppToast(errorMsg, 'error', 3000);
      setLoadingRef(false);
      return;
    }
  };

  const handleVNPayPayment = async () => {
    try {
      // Validate address first
      const addressValidation = validateAddress(
        provinces.find(p => p.code == selectedProvince)?.name || '',
        districts.find(d => d.code == selectedDistrict)?.name || '',
        wards.find(w => w.code == selectedWard)?.name || '',
        street
      );

      if (!addressValidation.isValid) {
        showAppToast(addressValidation.errors[0] || 'Địa chỉ không hợp lệ', 'error', 2500);
        return;
      }

      setLoadingRef(true);

      // Check if order already exists
      let currentOrderId = localStorage.getItem('currentOrderId');

      // If no order exists, create one first
      if (!currentOrderId) {
        logger.debug('CheckoutPage', 'no existing order, creating new order before VNPay payment');

        try {
          const cartId = localStorage.getItem('cartId');
          if (!cartId) {
            showAppToast('Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm vào giỏ trước.', 'error', 3000);
            setLoadingRef(false);
            return;
          }

          // Create delivery address
          const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
          const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
          const wardName = wards.find(w => w.code == selectedWard)?.name || '';

          const addressData = {
            recipientName: 'Khách hàng',
            street: street || 'Không có',
            city: provinceName,
            state: `${districtName}, ${wardName}`,
            zipCode: '',
            country: 'Vietnam',
            isDefault: false
          };

          const createdAddress = await addressService.createAddress(addressData);

          // Create payment method
          const paymentMethodData = {
            type: 'vnpay',
            cardholderName: 'VNPay Payment',
            isDefault: true
          };

          const createdPaymentMethod = await paymentMethodService.createPaymentMethod(paymentMethodData);

          // Create order
          const orderData = {
            CartId: cartId,
            DeliveryAddressId: createdAddress.id,
            PaymentMethodId: createdPaymentMethod.id,
            SpecialInstructions: `Địa chỉ: ${address}\n📦 Miễn phí vận chuyển cho tất cả đơn hàng!\n🎉 Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới!`
          };

          const order = await orderService.createOrder(orderData);

          // Backend might return Id (PascalCase) instead of id (camelCase)
          currentOrderId = order.id || (order as any)?.Id;

          if (!currentOrderId) {
            throw new Error('Order created but no ID returned from server');
          }

          localStorage.setItem('currentOrderId', currentOrderId);

          logger.info('CheckoutPage', 'order created before VNPay payment', { orderId: currentOrderId });
        } catch (createError: any) {
          logger.error('CheckoutPage', 'failed to create order for VNPay', createError);
          showAppToast('Không thể tạo đơn hàng. Vui lòng thử lại.', 'error', 3000);
          setLoadingRef(false);
          return;
        }
      }

      logger.info('CheckoutPage', 'initiating VNPay payment', { orderId: currentOrderId, amount: total });

      // Get user's IP address (required by VNPay)
      const ipAddress = await getUserIpAddress();

      // Create VNPay payment URL
      const vnpayResult = await createVNPayPayment({
        orderId: currentOrderId,
        amount: total,
        orderInfo: `Thanh toan don hang FSOURCING #${currentOrderId.substring(0, 8)}`,
        ipAddress,
        bankCode: VNPAY_BANK_CODES.NCB // Use NCB for sandbox testing
      });

      setLoadingRef(false);

      if (!vnpayResult.success || !vnpayResult.paymentUrl) {
        showAppToast(`❌ ${vnpayResult.error || 'Không thể tạo thanh toán VNPay'}`, 'error', 3000);
        logger.error('CheckoutPage', 'VNPay payment creation failed', vnpayResult);
        return;
      }

      // Save payment info to localStorage
      localStorage.setItem('vnpayPaymentInfo', JSON.stringify({
        orderId: currentOrderId,
        amount: total,
        timestamp: new Date().toISOString()
      }));

      logger.info('CheckoutPage', 'redirecting to VNPay', { paymentUrl: vnpayResult.paymentUrl });

      // Redirect to VNPay payment page
      showAppToast('🔄 Đang chuyển đến trang thanh toán VNPay...', 'info', 2000);

      setTimeout(() => {
        window.location.href = vnpayResult.paymentUrl!;
      }, 500);

    } catch (error: any) {
      logger.error('CheckoutPage', 'VNPay payment failed', error);
      setLoadingRef(false);
      showAppToast(`⚠️ ${error.message || 'Không thể kết nối đến VNPay'}`, 'error', 3000);
    }
  };
  */ // End of VNPay Payment Functions



  if (!cart || cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống.</h2>
          <p className="text-gray-600">Hãy chọn một vài sản phẩm để bắt đầu.</p>
        </div>
      </div>
    );
  }

  // Show loading state while processing
  if (loadingRef) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý đơn hàng...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans py-8">
      <main className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Xác nhận đơn hàng (Mô phỏng)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-4 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <ul className="divide-y">
                  {cart.map(item => (
                    <li key={item.id} className="py-3 flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{currency((Number(item.price) || 0) * (item.quantity || 1))}</div>
                        <div className="text-xs text-gray-400">{currency(Number(item.price) || 0)} / cái</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2">Địa chỉ giao hàng</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tỉnh / Thành phố</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedProvince}
                      onChange={e => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quận / Huyện</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phường / Xã</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedWard}
                      onChange={e => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số nhà, tên đường</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
                  />
                </div>
                {address && <div className="mt-2 text-sm text-gray-500 italic">Địa chỉ đầy đủ: {address}</div>}
              </div>
            </div>

            <aside className="md:col-span-1 bg-gray-50 p-4 rounded">
              {/* Thông báo khuyến mãi - Marketing */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-bold text-blue-800 mb-2">
                    Miễn phí vận chuyển!
                  </div>
                  <div className="text-sm text-blue-600">
                    Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block font-semibold mb-3 text-gray-800">Phương thức thanh toán</label>
                <div className="space-y-3">
                  {/* VNPay Option - Temporarily Disabled */}
                  {/* <div
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'vnpay'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    \u003cdiv className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={() => setPaymentMethod('vnpay')}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">VNPay</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Khuyến nghị</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán online qua cổng VNPay</p>
                      </div>
                    </div>
                  </div> */}

                  {/* QR Payment Option */}
                  <div
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'qr'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="qr"
                        checked={paymentMethod === 'qr'}
                        onChange={() => setPaymentMethod('qr')}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">QR Code</span>
                          <span className="text-2xl">📱</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Quét mã QR để thanh toán</p>
                      </div>
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">Tiền mặt (COD)</span>
                          <span className="text-2xl">💵</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán khi nhận hàng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{currency(total)}</span>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${address.trim()
                  ? paymentMethod === 'qr'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
                onClick={paymentMethod === 'qr' ? handleQRPaymentOrder : handleCODOrder}
                disabled={!address.trim()}
              >
                {paymentMethod === 'qr'
                  ? '📱 Thanh toán qua QR'
                  : '💵 Đặt hàng COD'}
              </button>

              <button
                className="w-full mt-3 py-2 rounded-lg border border-gray-300 text-gray-700"
                onClick={() => window.history.back()}
              >
                Tiếp tục mua sắm
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

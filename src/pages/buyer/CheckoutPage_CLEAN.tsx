import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import { getCart } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { sanitizeCartItems } from '../../utils/cartValidation';
import { validateAddress, validatePayment, validateCart } from '../../utils/purchaseValidation';
import showAppToast from '../../utils/toast';
import { logger } from '../../utils/logger';
import { createVNPayPayment, getUserIpAddress, VNPAY_BANK_CODES } from '../../services/vnpayService.ts';
import VNPayTestInfoModal from '../../components/VNPayTestInfoModal';

const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface CheckoutPageProps { 
  onClearCart?: () => void; 
}

const CheckoutPage: React.FC<CheckoutPageProps> = () => {
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
  
  const [loadingRef, setLoadingRef] = useState(false);
  
  // VNPay test modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
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
        type: 'vnpay',
        cardholderName: 'VNPay Payment',
        isDefault: true
      };

      const createdPaymentMethod = await paymentMethodService.createPaymentMethod(paymentMethodData);
      logger.info('CheckoutPage', 'payment method created', { paymentMethodId: createdPaymentMethod.id });

      // Step 3: Create order with address ID and payment method ID
      
      const orderData = {
        CartId: cartId,
        DeliveryAddressId: createdAddress.id,
        PaymentMethodId: createdPaymentMethod.id,
        SpecialInstructions: `Địa chỉ: ${address}\n📦 Miễn phí vận chuyển cho tất cả đơn hàng!\n🎉 Theo dõi trang để nhận nhiều ưu đãi hấp dẫn sắp tới!`
      };

      logger.debug('CheckoutPage', 'creating order via API', orderData);
      
      const order = await orderService.createOrder(orderData);
      logger.info('CheckoutPage', 'order created successfully', { orderId: order.id });

      // Save order ID for tracking
      localStorage.setItem('currentOrderId', order.id);
      
      // Save order details for payment reference
      localStorage.setItem('pendingPaymentOrder', JSON.stringify({
        orderId: order.id,
        amount: total,
        timestamp: new Date().toISOString()
      }));

      showAppToast(`✅ Đơn hàng #${order.id.substring(0, 8)} đã được tạo thành công! Đang chuyển đến VNPay...`, 'success', 2000);
      
      // Redirect to VNPay payment
      logger.info('CheckoutPage', 'redirecting to VNPay payment', { orderId: order.id, amount: total });
      
      // Get user's IP address (required by VNPay)
      const ipAddress = await getUserIpAddress();

      // Create VNPay payment URL
      const vnpayResult = await createVNPayPayment({
        orderId: order.id,
        amount: total,
        orderInfo: `Thanh toan don hang FSOURCING #${order.id.substring(0, 8)}`,
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
        orderId: order.id,
        amount: total,
        timestamp: new Date().toISOString()
      }));

      logger.info('CheckoutPage', 'redirecting to VNPay', { paymentUrl: vnpayResult.paymentUrl });
      
      // Show test info modal before redirect
      setPendingPaymentUrl(vnpayResult.paymentUrl!);
      setShowTestModal(true);
      
    } catch (orderError: any) {
      logger.error('CheckoutPage', 'checkout process failed', orderError);
      const errorMsg = orderError.message || 'Đã xảy ra lỗi trong quá trình đặt hàng';
      showAppToast(errorMsg, 'error', 3000);
      setLoadingRef(false);
    }
  };

  const handleContinueToVNPay = () => {
    if (pendingPaymentUrl) {
      window.location.href = pendingPaymentUrl;
    }
  };

  const handleCloseTestModal = () => {
    setShowTestModal(false);
    setPendingPaymentUrl(null);
    setLoadingRef(false);
  };

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
      {/* VNPay Test Info Modal */}
      <VNPayTestInfoModal
        isOpen={showTestModal}
        onClose={handleCloseTestModal}
        onContinue={handleContinueToVNPay}
        countdownSeconds={10}
      />

      <main className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h2>
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
              {/* Marketing message thay vì tính phí và giảm giá */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-bold text-blue-800 mb-2">Miễn phí vận chuyển!</div>
                  <div className="text-sm text-gray-700 mb-2">Áp dụng cho tất cả đơn hàng</div>
                  <div className="text-xs text-purple-600 font-medium">
                    🎁 Theo dõi fanpage để nhận voucher giảm giá hấp dẫn!
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Phí vận chuyển</span>
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
                className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${
                  address.trim() && !loadingRef ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
                onClick={createLocalPaymentRef}
                disabled={!address.trim() || loadingRef}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {loadingRef ? 'Đang xử lý...' : 'Thanh toán qua VNPay'}
              </button>

              <button
                className="w-full mt-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => navigate('/buyer/products')}
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

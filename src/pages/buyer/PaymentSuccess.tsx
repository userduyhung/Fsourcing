import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Clock, MapPin, Mail } from 'lucide-react';
import emailService from '../../services/emailService';
import { showAppToast } from '../../utils/toast';
import { logger } from '../../utils/logger';

interface PaymentSuccessProps {
  orderId?: string;
  amount?: number;
  transactionId?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderId, amount, transactionId }) => {
  const location = useLocation();
  const { reference, total, cartItems = [] } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const emailSentRef = useRef(false); // Flag để tránh gửi 2 lần

  // Generate stable values - ONLY ONCE using useMemo or useState
  const [orderInfo] = useState(() => {
    return {
      demoOrderId: orderId || `FS${Date.now().toString().slice(-8)}`,
      demoAmount: amount || total || 0,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      orderDate: new Date().toLocaleDateString('vi-VN')
    };
  });

  const { demoOrderId, demoAmount, estimatedDelivery, orderDate } = orderInfo;

  // Confetti effect
  useEffect(() => {
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // Send confirmation email - CHỈ CHẠY 1 LẦN DUY NHẤT
  useEffect(() => {
    const sendEmailConfirmation = async () => {
      // Kiểm tra đã gửi chưa bằng useRef (persistent across renders)
      if (emailSentRef.current) {
        logger.debug('PaymentSuccess', 'email already sent - skipping');
        return;
      }

      // Đánh dấu đã gửi NGAY LẬP TỨC để tránh race condition
      emailSentRef.current = true;

      try {
        // Lấy thông tin buyer từ localStorage
        const buyerProfileStr = localStorage.getItem('buyerProfile');
        if (!buyerProfileStr) {
          logger.warn('PaymentSuccess', 'buyerProfile not found in localStorage');
          return;
        }

        const buyerProfile = JSON.parse(buyerProfileStr);
        const { email, name, address } = buyerProfile;

        if (!email) {
          logger.warn('PaymentSuccess', 'no email in buyerProfile');
          return;
        }

        // LƯU ĐỢN HÀNG VÀO LOCALSTORAGE
        const newOrder = {
          id: Date.now(),
          items: cartItems,
          total: demoAmount,
          address: address || 'Đang cập nhật',
          date: orderDate,
          orderId: demoOrderId,
          status: 'pending', // pending, completed, cancelled
          estimatedDelivery: estimatedDelivery
        };

        // Lấy danh sách đơn hàng hiện tại
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        // Thêm đơn hàng mới vào đầu mảng
        existingOrders.unshift(newOrder);
        // Lưu lại vào localStorage
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        logger.debug('PaymentSuccess', 'order saved to localStorage', { orderId: newOrder.orderId });

        // SỚ DỤNG CART ITEMS TỪ LOCATION.STATE (đã được truyền từ CheckoutPage)
        logger.debug('PaymentSuccess', 'cart items from checkout', { itemCount: cartItems.length });

        // Format cart items cho email (bao gồm cả hình ảnh)
        const orderItems = cartItems.map((item: any) => ({
          productName: item.name || 'Sản phẩm',
          quantity: item.quantity || 1,
          price: item.price || 0,
          subtotal: (item.price || 0) * (item.quantity || 1),
          imageUrl: item.image || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'  // Ảnh sản phẩm
        }));

        logger.debug('PaymentSuccess', 'sending email for order', { orderId: demoOrderId, itemCount: orderItems.length });

        // Gửi email xác nhận
        const result = await emailService.sendOrderConfirmation({
          orderId: demoOrderId,
          buyerName: name || 'Khách hàng',
          buyerEmail: email,
          orderDate: orderDate,
          estimatedDelivery: estimatedDelivery,
          totalAmount: demoAmount,
          items: orderItems,
          paymentMethod: 'Chuyển khoản ngân hàng (VietQR)',
          shippingAddress: address || 'Đang cập nhật'
        });

        if (result.success) {
          setEmailSent(true);
          showAppToast('✅ Email xác nhận đã được gửi đến ' + email, 'success');
          logger.info('PaymentSuccess', 'email sent successfully', { to: email });
        } else {
          logger.warn('PaymentSuccess', 'email sending failed', { message: result.message });
          if (!emailService.isConfigured()) {
            showAppToast('⚠️ EmailJS chưa được cấu hình. Vui lòng kiểm tra emailService.ts', 'warning');
          }
        }
      } catch (error) {
        logger.error('PaymentSuccess', 'error sending email', error);
      }
    };

    sendEmailConfirmation();
    
    // KHÔNG CÓ DEPENDENCIES → CHỈ CHẠY 1 LẦN KHI COMPONENT MOUNT
  }, []);

  const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen font-sans py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Success Icon with Animation */}
        <div className="text-center mb-8 animate-bounce">
          <div className="inline-block bg-gradient-to-r from-green-400 to-green-600 rounded-full p-6 shadow-2xl">
            <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">🎉 Thanh toán thành công!</h1>
            <p className="text-green-100 text-lg">Đơn hàng của bạn đã được xác nhận</p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600 font-medium">Mã đơn hàng</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{demoOrderId}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm text-gray-600 font-medium">Tổng thanh toán</span>
                </div>
                <p className="text-xl font-bold text-purple-700">{currency(demoAmount)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">Dự kiến giao hàng</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{estimatedDelivery}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-l-4 border-orange-500">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600 font-medium">Trạng thái</span>
                </div>
                <p className="text-xl font-bold text-orange-600">Đang xử lý</p>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
              <p className="text-center text-gray-700 leading-relaxed">
                <span className="text-2xl mb-3 block">🙏</span>
                <strong className="text-lg text-gray-900">Cảm ơn bạn đã tin tưởng Fsourcing!</strong><br />
                <span className="text-sm mt-2 block">
                  Đơn hàng của bạn đang được đóng gói và sẽ sớm được giao đến tay bạn.
                  <br />Chúng tôi sẽ gửi thông báo cập nhật qua email và tin nhắn.
                </span>
              </p>
              
              {/* Email Status Indicator */}
              {emailSent && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-700 bg-green-100 py-2 px-4 rounded-lg">
                  <Mail className="w-4 h-4" />
                  <span>Email xác nhận đã được gửi thành công!</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/buyer/orders`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl text-center transform hover:-translate-y-0.5"
              >
                📦 Xem đơn hàng của tôi
              </Link>
              
              <Link
                to="/products"
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-center transform hover:-translate-y-0.5"
              >
                🛍️ Tiếp tục mua sắm
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Bạn có thắc mắc? Liên hệ với chúng tôi qua <strong>hotline: 1900-xxxx</strong> hoặc email: <strong>support@fsourcing.com</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Tips */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <span className="text-2xl animate-pulse">⭐</span>
            <span className="text-sm text-gray-700 font-medium">
              Đánh giá sản phẩm để nhận voucher giảm giá lần mua tiếp theo!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

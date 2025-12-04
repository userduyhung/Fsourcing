import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { verifyVNPayCallback, parseVNPayResponseCode } from '../../services/vnpayService';
import { orderService } from '../../services/orderService';
import { logger } from '../../utils/logger';
import showAppToast from '../../utils/toast';

const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'invalid'>('success');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Check if this is a VNPay callback
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // Order ID
        const vnp_Amount = searchParams.get('vnp_Amount');
        const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
        const vnp_BankCode = searchParams.get('vnp_BankCode');
        const vnp_PayDate = searchParams.get('vnp_PayDate');

        if (vnp_ResponseCode) {
          // This is VNPay callback
          logger.info('PaymentSuccess', 'VNPay callback received', { 
            responseCode: vnp_ResponseCode, 
            orderId: vnp_TxnRef 
          });

          // Build query params object for verification
          const queryParams: any = {};
          searchParams.forEach((value, key) => {
            queryParams[key] = value;
          });

          // Verify VNPay signature
          const isValid = verifyVNPayCallback(queryParams);
          
          if (!isValid) {
            logger.error('PaymentSuccess', 'VNPay signature verification failed');
            setPaymentStatus('invalid');
            setErrorMessage('Chữ ký thanh toán không hợp lệ. Giao dịch có thể bị giả mạo.');
            setVerifying(false);
            return;
          }

          // Check response code
          if (vnp_ResponseCode === '00') {
            // Payment successful
            logger.info('PaymentSuccess', 'VNPay payment successful', { 
              orderId: vnp_TxnRef,
              transactionNo: vnp_TransactionNo,
              amount: vnp_Amount
            });

            setPaymentStatus('success');

            // Update order status on backend
            if (vnp_TxnRef) {
              try {
                await orderService.markAsPaid(vnp_TxnRef, vnp_TransactionNo || undefined);
                logger.info('PaymentSuccess', 'order payment status updated');
              } catch (updateError) {
                logger.error('PaymentSuccess', 'failed to update order status', updateError);
                showAppToast('⚠️ Thanh toán thành công nhưng không thể cập nhật đơn hàng', 'warning', 3000);
              }
            }

            // Build order info
            setOrderInfo({
              orderId: vnp_TxnRef,
              transactionNo: vnp_TransactionNo,
              amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0,
              bankCode: vnp_BankCode,
              payDate: vnp_PayDate,
              cartItems: location.state?.cartItems || [],
              shippingFee: location.state?.shippingFee || 0
            });

            // Clear localStorage
            localStorage.removeItem('currentOrderId');
            localStorage.removeItem('vnpayPaymentInfo');
            localStorage.removeItem('lastQRCode');
            
          } else {
            // Payment failed
            const errorMsg = parseVNPayResponseCode(vnp_ResponseCode);
            logger.warn('PaymentSuccess', 'VNPay payment failed', { 
              responseCode: vnp_ResponseCode,
              message: errorMsg 
            });

            setPaymentStatus('failed');
            setErrorMessage(errorMsg);
            
            setOrderInfo({
              orderId: vnp_TxnRef,
              transactionNo: vnp_TransactionNo,
              responseCode: vnp_ResponseCode
            });
          }
          
        } else {
          // Legacy flow (QR code payment simulation)
          logger.debug('PaymentSuccess', 'legacy payment flow detected');
          
          const orderId = location.state?.orderId || localStorage.getItem('currentOrderId');
          const total = location.state?.total || 0;
          
          setPaymentStatus('success');
          setOrderInfo({
            orderId,
            amount: total,
            cartItems: location.state?.cartItems || [],
            shippingFee: location.state?.shippingFee || 0,
            isLegacy: true
          });

          // Clear localStorage
          localStorage.removeItem('currentOrderId');
          localStorage.removeItem('lastQRCode');
        }

        setVerifying(false);

      } catch (error) {
        logger.error('PaymentSuccess', 'verification error', error);
        setPaymentStatus('failed');
        setErrorMessage('Đã xảy ra lỗi khi xác minh thanh toán');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, location.state]);

  if (verifying) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xác minh thanh toán...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'invalid') {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Giao dịch không hợp lệ</h2>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            onClick={() => navigate('/buyer/orders')}
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Thanh toán không thành công</h2>
          <p className="text-gray-700 mb-2">{errorMessage || 'Giao dịch đã bị hủy hoặc thất bại'}</p>
          {orderInfo?.orderId && (
            <p className="text-sm text-gray-500 mb-6">Mã đơn hàng: #{orderInfo.orderId.substring(0, 8)}</p>
          )}
          <div className="flex flex-col gap-3">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
              onClick={() => navigate('/buyer/checkout')}
            >
              Thử lại thanh toán
            </button>
            <button 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold"
              onClick={() => navigate('/buyer/orders')}
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment successful
  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans py-8">
      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-2">✅ Thanh toán thành công!</h1>
          <p className="text-gray-600 mb-8">Cảm ơn bạn đã mua hàng tại FSourceing</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h2>
            
            {orderInfo?.orderId && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold">#{orderInfo.orderId.substring(0, 8)}</span>
              </div>
            )}
            
            {orderInfo?.transactionNo && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Mã giao dịch VNPay:</span>
                <span className="font-semibold">{orderInfo.transactionNo}</span>
              </div>
            )}
            
            {orderInfo?.bankCode && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold">{orderInfo.bankCode}</span>
              </div>
            )}
            
            {orderInfo?.amount > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-blue-600">{currency(orderInfo.amount)}</span>
              </div>
            )}
            
            {orderInfo?.payDate && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-semibold">{formatVNPayDate(orderInfo.payDate)}</span>
              </div>
            )}

            {orderInfo?.isLegacy && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ℹ️ Đơn hàng được thanh toán qua QR Code (mô phỏng)
              </div>
            )}
          </div>

          {orderInfo?.cartItems && orderInfo.cartItems.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-lg mb-4">Sản phẩm đã mua</h2>
              <ul className="divide-y">
                {orderInfo.cartItems.map((item: any, index: number) => (
                  <li key={index} className="py-3 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-blue-600">{currency(item.price * item.quantity)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
              onClick={() => navigate('/buyer/orders')}
            >
              Xem đơn hàng của tôi
            </button>
            <button 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold"
              onClick={() => navigate('/buyer/products')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function to format VNPay date (yyyyMMddHHmmss)
function formatVNPayDate(dateString: string): string {
  try {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  } catch (error) {
    return dateString;
  }
}

export default PaymentSuccessPage;

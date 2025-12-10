import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { QRCodeSVG } from 'qrcode.react'; // Uncomment if switching back to dynamic QR
import { orderService } from '../../services/orderService';
import { clearCart } from '../../services/cartService';
import { CartItem } from '../../types';
import showAppToast from '../../utils/toast';
import { logger } from '../../utils/logger';

const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface QRPaymentData {
    orderId: string;
    amount: number;
    items: CartItem[];
    address: string;
    timestamp: string;
}

const QRPaymentPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [paymentData, setPaymentData] = useState<QRPaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Load payment data from localStorage
        const storedData = localStorage.getItem('qrPaymentOrder');
        if (storedData) {
            try {
                const data = JSON.parse(storedData) as QRPaymentData;
                if (data.orderId === orderId) {
                    setPaymentData(data);
                    logger.info('QRPaymentPage', 'payment data loaded', { orderId });
                } else {
                    logger.error('QRPaymentPage', 'orderId mismatch', { expected: orderId, found: data.orderId });
                    showAppToast('Thông tin đơn hàng không khớp', 'error', 3000);
                    navigate('/buyer/cart');
                }
            } catch (error) {
                logger.error('QRPaymentPage', 'failed to parse payment data', error);
                showAppToast('Lỗi khi tải thông tin thanh toán', 'error', 3000);
                navigate('/buyer/cart');
            }
        } else {
            logger.warn('QRPaymentPage', 'no payment data found');
            showAppToast('Không tìm thấy thông tin thanh toán', 'error', 3000);
            navigate('/buyer/cart');
        }
        setLoading(false);
    }, [orderId, navigate]);

    // Generate QR code content (Not used with static image - uncomment if switching back to dynamic QR)
    /*
    const generateQRContent = () => {
        if (!paymentData) return '';

        // QR code content: Bank info + Order ID + Amount
        const qrData = {
            bank: 'Techcombank',
            accountNumber: '7033359999',
            accountName: 'HUANG TAI PHONG',
            amount: paymentData.amount,
            content: `FSOURCING ${orderId?.substring(0, 8)}`,
            orderId: paymentData.orderId
        };

        return JSON.stringify(qrData);
    };
    */

    const handleComplete = async () => {
        if (!orderId) return;

        setProcessing(true);
        try {
            // Mark order as paid using the payment status endpoint
            logger.info('QRPaymentPage', 'completing payment, marking order as paid', { orderId });

            // Generate a transaction reference for tracking
            const transactionRef = `QR_${orderId.substring(0, 8)}_${Date.now()}`;
            await orderService.markAsPaid(orderId, transactionRef);

            // Clear cart and localStorage
            await clearCart();
            localStorage.removeItem('qrPaymentOrder');
            localStorage.removeItem('currentOrderId');

            logger.info('QRPaymentPage', 'payment completed successfully', { orderId, transactionRef });
            showAppToast(`✅ Thanh toán thành công! Đơn hàng #${orderId.substring(0, 8)} đã được xác nhận thanh toán.`, 'success', 3000);

            setProcessing(false);

            // Redirect to order details
            setTimeout(() => {
                navigate(`/buyer/orders/${orderId}`);
            }, 1500);

        } catch (error: any) {
            logger.error('QRPaymentPage', 'failed to complete payment', error);
            const errorMsg = error.message || 'Không thể hoàn thành thanh toán';
            showAppToast(`❌ ${errorMsg}`, 'error', 3000);
            setProcessing(false);
        }
    };

    const handleBackToHome = () => {
        // Clear payment data from localStorage
        localStorage.removeItem('qrPaymentOrder');

        // Keep currentOrderId so user can check order later
        // Order remains in Pending status waiting for payment confirmation

        logger.info('QRPaymentPage', 'user navigating to home, order remains pending', { orderId });
        showAppToast('Đơn hàng đang chờ xác nhận thanh toán. Bạn có thể kiểm tra trong "Đơn hàng của tôi".', 'info', 3000);

        // Navigate to home page
        navigate('/');
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang tải...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return null;
    }

    return (
        <div className="bg-[#f8ecd7] min-h-screen font-sans py-8">
            <main className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">Thanh toán QR Code</h2>

                    {/* QR Code Section */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-xl mb-4">
                            {/* Static QR Code Image - Replace with your own QR image */}
                            <img
                                src="https://res.cloudinary.com/dcworyvtj/image/upload/v1765338336/qr_thanh_to%C3%A1n_c%E1%BB%A7a_a_phong_j6x7qp.jpg"
                                alt="QR Code thanh toán"
                                className="w-64 h-64 object-contain"
                            />
                            {/* 
                            HƯỚNG DẪN SỬ DỤNG:
                            1. Lưu ảnh QR của bạn vào: public/assets/qr-payment.png
                            2. Hoặc đổi tên file trong src="/assets/qr-payment.png" thành tên ảnh của bạn
                            3. Ảnh nên có kích thước vuông (ví dụ: 512x512px) để hiển thị đẹp
                            4. Định dạng hỗ trợ: .png, .jpg, .jpeg, .webp
                            
                            Nếu muốn dùng QR động (như cũ), uncomment code bên dưới:
                            <QRCodeSVG
                                value={generateQRContent()}
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                            */}
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                            <p className="text-sm text-gray-600 mb-1">Sử dụng ứng dụng ngân hàng để quét mã</p>
                            <p className="text-sm font-medium text-purple-600">Đơn hàng #{orderId?.substring(0, 8)}</p>
                        </div>

                        {/* Bank Info */}
                        <div className="w-full max-w-md bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Thông tin chuyển khoản:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngân hàng:</span>
                                    <span className="font-medium">Techcombank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số tài khoản:</span>
                                    <span className="font-medium">7033359999</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Chủ tài khoản:</span>
                                    <span className="font-medium">HUANG TAI PHONG</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số tiền:</span>
                                    <span className="font-bold text-purple-600">{currency(paymentData.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nội dung:</span>
                                    <span className="font-medium">FSOURCING {orderId?.substring(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-8 border-t pt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h3>

                        {/* Items List */}
                        <div className="mb-4">
                            <ul className="divide-y divide-gray-200">
                                {paymentData.items.map((item) => (
                                    <li key={item.id} className="py-3 flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{item.name}</div>
                                            <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-purple-600">
                                                {currency((Number(item.price) || 0) * (item.quantity || 1))}
                                            </div>
                                            <div className="text-xs text-gray-400">{currency(Number(item.price) || 0)} / cái</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Delivery Address */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Địa chỉ giao hàng:</h4>
                            <p className="text-gray-700">{paymentData.address}</p>
                        </div>

                        {/* Price Summary */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tạm tính:</span>
                                <span className="font-medium">{currency(paymentData.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className="font-medium text-green-600">Miễn phí</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                <span>Tổng cộng:</span>
                                <span className="text-purple-600">{currency(paymentData.amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleComplete}
                            disabled={processing}
                            className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? '⏳ Đang xử lý...' : '✅ Hoàn thành thanh toán'}
                        </button>
                        <button
                            onClick={handleBackToHome}
                            disabled={processing}
                            className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            🏠 Về trang chủ
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">📝 Hướng dẫn thanh toán:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                            <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
                            <li>Kiểm tra và xác nhận giao dịch</li>
                            <li>Sau khi chuyển khoản thành công, nhấn "Hoàn thành thanh toán"</li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-3">
                            ⚠️ Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý nhanh hơn
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QRPaymentPage;

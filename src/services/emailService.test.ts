// ========================================
// FILE DEMO: Test EmailJS Service
// ========================================
// Chạy file này trong browser console để test EmailJS

import emailService from './emailService';

/**
 * Demo data - Giống như dữ liệu thật từ PaymentSuccess
 */
const demoOrderData = {
  orderId: 'FS12345678',
  buyerName: 'Nguyễn Duy Hưng',
  buyerEmail: 'nduyhung111@gmail.com', // ← THAY ĐỔI EMAIL CỦA BẠN ĐỂ TEST
  orderDate: new Date().toLocaleDateString('vi-VN'),
  estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
  totalAmount: 1500000,
  items: [
    {
      productName: 'Bàn làm việc gỗ cao cấp',
      quantity: 2,
      price: 500000,
      subtotal: 1000000
    },
    {
      productName: 'Ghế văn phòng ergonomic',
      quantity: 1,
      price: 500000,
      subtotal: 500000
    }
  ],
  paymentMethod: 'Chuyển khoản ngân hàng (VietQR)',
  shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
};

/**
 * Test function - Gửi email demo
 */
export async function testEmailService() {
  console.log('🧪 Bắt đầu test EmailJS...');
  console.log('📧 Demo data:', demoOrderData);

  try {
    // Kiểm tra cấu hình
    if (!emailService.isConfigured()) {
      console.error('❌ EmailJS chưa được cấu hình!');
      console.log('👉 Vui lòng cập nhật SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY trong emailService.ts');
      return;
    }

    console.log('✅ EmailJS đã được cấu hình');
    console.log('📤 Đang gửi email...');

    // Gửi email
    const result = await emailService.sendOrderConfirmation(demoOrderData);

    // Kiểm tra kết quả
    if (result.success) {
      console.log('✅ EMAIL ĐÃ GỬI THÀNH CÔNG!');
      console.log('📧 Kiểm tra hộp thư của bạn:', demoOrderData.buyerEmail);
      console.log('⏱️ Email thường đến trong vòng vài giây đến 1 phút');
      console.log('🗑️ Nếu không thấy, kiểm tra trong Spam/Junk');
    } else {
      console.error('❌ GỬI EMAIL THẤT BẠI:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ LỖI KHÔNG MONG MUỐN:', error);
    throw error;
  }
}

/**
 * Test minimal - Chỉ gửi thông tin cơ bản
 */
export async function testEmailMinimal() {
  console.log('🧪 Test với dữ liệu tối thiểu...');

  const minimalData = {
    orderId: 'FS99999999',
    buyerName: 'Test User',
    buyerEmail: 'test@example.com', // ← THAY EMAIL CỦA BẠN
    orderDate: new Date().toLocaleDateString('vi-VN'),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
    totalAmount: 100000,
  };

  const result = await emailService.sendOrderConfirmation(minimalData);
  
  if (result.success) {
    console.log('✅ Minimal email sent!');
  } else {
    console.error('❌ Failed:', result.message);
  }

  return result;
}

/**
 * Kiểm tra cấu hình
 */
export function checkConfig() {
  console.log('🔍 Kiểm tra cấu hình EmailJS...');
  
  const isConfigured = emailService.isConfigured();
  
  if (isConfigured) {
    console.log('✅ EmailJS đã được cấu hình đầy đủ');
    console.log('👉 Bạn có thể chạy testEmailService() để gửi email thử nghiệm');
  } else {
    console.error('❌ EmailJS chưa được cấu hình!');
    console.log('📝 Các bước cấu hình:');
    console.log('1. Tạo tài khoản tại https://www.emailjs.com/');
    console.log('2. Tạo Email Service và lấy SERVICE_ID');
    console.log('3. Tạo Email Template và lấy TEMPLATE_ID');
    console.log('4. Lấy Public Key từ Account settings');
    console.log('5. Cập nhật 3 giá trị trên vào src/services/emailService.ts');
    console.log('');
    console.log('📖 Xem hướng dẫn chi tiết trong EMAILJS_SETUP_GUIDE.md');
  }
  
  return isConfigured;
}

// Export all test functions
export default {
  testEmailService,
  testEmailMinimal,
  checkConfig
};

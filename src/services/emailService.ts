import emailjs from '@emailjs/browser';

// ===================================
// CẤU HÌNH EMAILJS
// ===================================
// Bạn cần tạo tài khoản tại: https://www.emailjs.com/
// Sau đó lấy các thông tin sau:
const EMAILJS_CONFIG = {
  SERVICE_ID: 'Fsourcing_abc1234',        // VD: 'service_abc123'
  TEMPLATE_ID: 'template_OrdCrf',      // VD: 'template_xyz789'
  PUBLIC_KEY: 'RHItwH7chkFR9DYVg',        // VD: 'user_abcdef123456'
};

// ===================================
// INTERFACES
// ===================================
export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface EmailOrderData {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  items?: OrderItem[];
  paymentMethod?: string;
  shippingAddress?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ===================================
// EMAIL SERVICE
// ===================================
class EmailService {
  /**
   * Khởi tạo EmailJS với public key
   */
  initialize() {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }

  /**
   * Gửi email xác nhận đơn hàng
   */
  async sendOrderConfirmation(orderData: EmailOrderData): Promise<EmailResponse> {
    try {
      // Kiểm tra cấu hình
      if (!this.isConfigured()) {
        console.warn('EmailJS chưa được cấu hình đầy đủ');
        return {
          success: false,
          message: 'EmailJS chưa được cấu hình',
          error: 'Missing configuration'
        };
      }

      // Format dữ liệu cho template
      const templateParams = {
        // Thông tin đơn hàng
        order_id: orderData.orderId,
        order_date: orderData.orderDate,
        estimated_delivery: orderData.estimatedDelivery,
        
        // Thông tin khách hàng
        buyer_name: orderData.buyerName,
        buyer_email: orderData.buyerEmail,
        
        // Thông tin thanh toán
        total_amount: this.formatCurrency(orderData.totalAmount),
        payment_method: orderData.paymentMethod || 'Chuyển khoản ngân hàng',
        
        // Địa chỉ giao hàng
        shipping_address: orderData.shippingAddress || 'Đang cập nhật',
        
        // Danh sách sản phẩm (format thành HTML table)
        items_list: this.formatItemsList(orderData.items || []),
        items_count: orderData.items?.length || 0,
        
        // Thông tin hệ thống
        company_name: 'Fsourcing',
        support_email: 'support@fsourcing.com',
        website_url: window.location.origin,
      };

      // Gửi email qua EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log('✅ Email đã gửi thành công:', response);

      return {
        success: true,
        message: 'Email xác nhận đã được gửi thành công'
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi gửi email:', error);
      
      return {
        success: false,
        message: 'Không thể gửi email xác nhận',
        error: error.text || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Kiểm tra xem EmailJS đã được cấu hình chưa
   */
  isConfigured(): boolean {
    return (
      EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
      EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
      EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
    );
  }

  /**
   * Format số tiền theo định dạng VND
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Format danh sách sản phẩm thành HTML table
   */
  private formatItemsList(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return '<p>Không có sản phẩm trong đơn hàng</p>';
    }

    let html = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Sản phẩm</th>
            <th style="padding: 12px; text-align: center; font-weight: 600;">SL</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Đơn giá</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      html += `
        <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px;">${item.productName}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">${this.formatCurrency(item.price)}</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatCurrency(item.subtotal)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }
}

// Singleton instance
const emailService = new EmailService();
emailService.initialize();

export default emailService;

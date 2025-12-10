import emailjs from '@emailjs/browser';
import { logger } from '../utils/logger';

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
  imageUrl?: string;  // URL hình ảnh sản phẩm
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
        logger.warn('EmailService', 'EmailJS not configured');
        return {
          success: false,
          message: 'EmailJS chưa được cấu hình',
          error: 'Missing configuration'
        };
      }

      // Format dữ liệu cho template
      const templateParams: any = {
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
        
        // Số lượng sản phẩm
        items_count: orderData.items?.length || 0,
        
        // Danh sách sản phẩm HTML (HỖ TRỢ KHÔNG GIỚI HẠN số lượng)
        items_list: this.formatItemsList(orderData.items || []),
        
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

      logger.info('EmailService', 'email sent successfully', { status: response.status });

      return {
        success: true,
        message: 'Email xác nhận đã được gửi thành công'
      };

    } catch (error: any) {
      logger.error('EmailService', 'error sending email', { message: error.text || error.message });
      
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
   * Format danh sách sản phẩm thành HTML cards với hình ảnh (hỗ trợ KHÔNG GIỚI HẠN số lượng)
   */
  private formatItemsList(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return '<p style="color: #666; text-align: center; padding: 20px;">Không có sản phẩm trong đơn hàng</p>';
    }

    let html = '<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">';
    
    items.forEach((item, index) => {
      const imageUrl = item.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
      
      html += `
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; margin-bottom: 10px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td width="100" style="padding: 10px; vertical-align: middle; text-align: center; background-color: #f9fafb;">
              <img src="${imageUrl}" alt="${item.productName}" width="80" height="80" style="object-fit: cover; border-radius: 6px; display: block; border: 1px solid #e5e7eb; margin: 0 auto;">
            </td>
            <td style="padding: 10px; vertical-align: top;">
              <div style="font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 4px;">
                ${index + 1}. ${item.productName}
              </div>
              <div style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                Số lượng: <strong style="color: #000;">${item.quantity}</strong><br>
                Đơn giá: ${this.formatCurrency(item.price)}<br>
                Thành tiền: <strong style="color: #2563eb;">${this.formatCurrency(item.subtotal)}</strong>
              </div>
            </td>
          </tr>
        </table>
      `;
    });
    
    html += '</div>';
    return html;
  }
}

// Singleton instance
const emailService = new EmailService();
emailService.initialize();

export default emailService;

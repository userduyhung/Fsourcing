import { logger } from '../utils/logger';

/**
 * VNPay Payment Gateway Service
 * Now uses backend API for payment URL generation
 */

export interface VNPayPaymentParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddress?: string;
  bankCode?: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

/**
 * Create VNPay payment URL via backend API
 */
export async function createVNPayPayment(params: VNPayPaymentParams): Promise<VNPayPaymentResponse> {
  try {
    logger.debug('VNPayService', 'creating payment URL via backend', params);

    // Validate amount
    if (!params.amount || params.amount < 10000) {
      return {
        success: false,
        error: 'Số tiền thanh toán phải lớn hơn 10,000 VND'
      };
    }

    // Call backend API to create payment URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    const response = await fetch(`${apiBaseUrl}/VNPay/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: params.orderId,
        amount: params.amount,
        orderInfo: params.orderInfo || `Thanh toan don hang ${params.orderId}`,
        bankCode: params.bankCode || 'NCB'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('VNPayService', 'backend API error', error);
      return {
        success: false,
        error: error.error || 'Không thể tạo URL thanh toán'
      };
    }

    const result = await response.json();

    logger.info('VNPayService', 'payment URL created successfully via backend', { 
      orderId: params.orderId,
      amount: params.amount 
    });

    return {
      success: result.success,
      paymentUrl: result.paymentUrl,
      error: result.error
    };
  } catch (error: any) {
    logger.error('VNPayService', 'failed to create payment URL', error);
    return {
      success: false,
      error: error.message || 'Không thể kết nối đến server'
    };
  }
}

/**
 * Verify VNPay callback via backend API
 */
export async function verifyVNPayCallback(queryParams: any): Promise<boolean> {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    const queryString = new URLSearchParams(queryParams).toString();
    
    const response = await fetch(`${apiBaseUrl}/VNPay/callback?${queryString}`, {
      method: 'GET'
    });

    if (!response.ok) {
      logger.error('VNPayService', 'callback verification failed');
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    logger.error('VNPayService', 'callback verification error', error);
    return false;
  }
}

/**
 * Parse VNPay response code
 */
export function parseVNPayResponseCode(code: string): string {
  const codes: { [key: string]: string } = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày.',
    '70': 'Giao dịch không thành công do: Sai chữ ký',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
  };

  return codes[code] || 'Lỗi không xác định';
}

/**
 * Get user's IP address (for VNPay requirement)
 */
export async function getUserIpAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '127.0.0.1';
  } catch (error) {
    logger.warn('VNPayService', 'failed to get IP address, using default', error);
    return '127.0.0.1';
  }
}

/**
 * Bank codes for VNPay
 */
export const VNPAY_BANK_CODES = {
  VNPAYQR: 'VNPAYQR', // Thanh toán qua QR Code
  VNBANK: 'VNBANK',   // Ngân hàng nội địa
  INTCARD: 'INTCARD', // Thẻ quốc tế
  NCB: 'NCB',         // Ngân hàng NCB
  VIETCOMBANK: 'ICB', // Vietcombank
  TECHCOMBANK: 'TCB', // Techcombank
  VIETINBANK: 'CTG',  // VietinBank
  AGRIBANK: 'ARG',    // Agribank
  SACOMBANK: 'STB',   // Sacombank
  MBBANK: 'MB',       // MB Bank
  TPBANK: 'TPB',      // TPBank
  BIDV: 'BIDV'        // BIDV
};

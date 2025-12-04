// Admin Payment Service - For admin to view all payment transactions
import axiosClient from './axiosClient';
import { logger } from '../utils/logger';

export interface AdminPaymentDto {
  id: string;
  orderId?: string;
  orderNumber?: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerName?: string;
  sellerEmail?: string;
  amount: number;
  currency: string;
  paymentProvider?: string;
  providerTransactionId?: string;
  paymentMethod?: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  // Optional items included for convenience in admin UI
  items?: Array<{
    productId?: string;
    productName?: string;
    name?: string;
    quantity?: number;
    qty?: number;
  }>;
}

export interface AdminPaymentListResponse {
  success: boolean;
  data: {
    items: AdminPaymentDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

class AdminPaymentService {
  /**
   * Get all payment transactions in the system (Admin only)
   */
  async getAllPayments(page: number = 1, pageSize: number = 50): Promise<AdminPaymentListResponse> {
    try {
      logger.debug('AdminPaymentService', 'fetching all payments', { page, pageSize });
      
      const response = await axiosClient.get('/admin/payments', {
        params: { page, pageSize }
      });
      
      logger.info('AdminPaymentService', 'payments fetched', { 
        count: response.data?.data?.items?.length || 0 
      });
      
      return response.data as AdminPaymentListResponse;
    } catch (error: any) {
      logger.error('AdminPaymentService', 'failed to fetch payments', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải danh sách giao dịch');
    }
  }

  /**
   * Get payment details by ID (Admin view)
   */
  async getPaymentById(paymentId: string): Promise<AdminPaymentDto> {
    try {
      logger.debug('AdminPaymentService', 'fetching payment details', { paymentId });
      
      const response = await axiosClient.get(`/admin/payments/${paymentId}`);
      
      return response.data?.data || response.data as AdminPaymentDto;
    } catch (error: any) {
      logger.error('AdminPaymentService', 'failed to fetch payment', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải thông tin giao dịch');
    }
  }

  /**
   * Get payment statistics (Admin dashboard)
   */
  async getPaymentStatistics(): Promise<{
    totalTransactions: number;
    pendingTransactions: number;
    completedTransactions: number;
    totalRevenue: number;
    totalRefunds: number;
  }> {
    try {
      logger.debug('AdminPaymentService', 'fetching payment statistics');
      
      const response = await axiosClient.get('/admin/payments/statistics');
      
      return response.data?.data || response.data;
    } catch (error: any) {
      logger.error('AdminPaymentService', 'failed to fetch payment statistics', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải thống kê giao dịch');
    }
  }

  /**
   * Get payments by order ID
   */
  async getPaymentsByOrderId(orderId: string): Promise<AdminPaymentDto[]> {
    try {
      logger.debug('AdminPaymentService', 'fetching payments by order', { orderId });
      
      const response = await axiosClient.get(`/admin/payments/order/${orderId}`);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      logger.error('AdminPaymentService', 'failed to fetch order payments', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải giao dịch của đơn hàng');
    }
  }
}

export default new AdminPaymentService();

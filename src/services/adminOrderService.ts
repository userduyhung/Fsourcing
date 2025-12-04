// Admin Order Service - For admin to view all orders in the system
import axiosClient from  './axiosClient';
import { logger } from '../utils/logger';

export interface AdminOrderDto {
  id: string;
  status: string;
  paymentStatus?: string;
  cartId: string;
  deliveryAddressId: string;
  paymentMethodId: string;
  specialInstructions?: string;
  total: number;
  totalAmount: number;
  items: AdminOrderItemDto[];
  createdAt: string;
  updatedAt: string;
  shippedWith?: string;
  trackingNumber?: string;
  notes?: string;
  // Admin-specific fields
  buyerId?: string;
  buyerEmail?: string;
  buyerName?: string;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
}

export interface AdminOrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminOrderListResponse {
  success: boolean;
  data: {
    items: AdminOrderDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

class AdminOrderService {
  /**
   * Get all orders in the system (Admin only)
   */
  async getAllOrders(page: number = 1, pageSize: number = 50): Promise<AdminOrderListResponse> {
    try {
      logger.debug('AdminOrderService', 'fetching all orders', { page, pageSize });
      
      const response = await axiosClient.get('/admin/orders', {
        params: { page, pageSize }
      });
      
      logger.info('AdminOrderService', 'orders fetched', { 
        count: response.data?.data?.items?.length || 0 
      });
      
      return response.data as AdminOrderListResponse;
    } catch (error: any) {
      logger.error('AdminOrderService', 'failed to fetch orders', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    }
  }

  /**
   * Get order details by ID (Admin view)
   */
  async getOrderById(orderId: string): Promise<AdminOrderDto> {
    try {
      logger.debug('AdminOrderService', 'fetching order details', { orderId });
      
      const response = await axiosClient.get(`/admin/orders/${orderId}`);
      
      return response.data?.data || response.data as AdminOrderDto;
    } catch (error: any) {
      logger.error('AdminOrderService', 'failed to fetch order', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    }
  }

  /**
   * Update order status (Admin override)
   */
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<AdminOrderDto> {
    try {
      logger.debug('AdminOrderService', 'updating order status', { orderId, status });
      
      const response = await axiosClient.put(`/admin/orders/${orderId}/status`, {
        status,
        notes
      });
      
      logger.info('AdminOrderService', 'order status updated', { orderId, status });
      
      return response.data?.data || response.data as AdminOrderDto;
    } catch (error: any) {
      logger.error('AdminOrderService', 'failed to update order status', error);
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  }

  /**
   * Update payment status for an order (admin)
   */
  async updatePaymentStatus(orderId: string, isPaid: boolean, transactionId?: string): Promise<AdminOrderDto> {
    try {
      logger.debug('AdminOrderService', 'updating payment status (admin)', { orderId, isPaid });
      const response = await axiosClient.put(`/orders/admin/${orderId}/payment-status`, { isPaid, transactionId, paidAt: isPaid ? new Date().toISOString() : undefined });
      return response.data?.data || response.data as AdminOrderDto;
    } catch (error: any) {
      logger.error('AdminOrderService', 'failed to update payment status (admin)', error);
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
    }
  }

  /**
   * Get order statistics (Admin dashboard)
   */
  async getOrderStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    try {
      logger.debug('AdminOrderService', 'fetching order statistics');
      
      const response = await axiosClient.get('/admin/orders/statistics');
      
      return response.data?.data || response.data;
    } catch (error: any) {
      logger.error('AdminOrderService', 'failed to fetch statistics', error);
      throw new Error(error?.response?.data?.message || 'Không thể tải thống kê đơn hàng');
    }
  }
}

export default new AdminOrderService();

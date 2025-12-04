import axiosClient from './axiosClient';

/**
 * Dashboard Service - Handles dashboard and statistics API calls
 * Based on BE: DashboardController.cs
 */

// ==================== INTERFACES ====================

export interface SalesStatistics {
  itemsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  conversionRate: number;
  topSellingProducts?: any[];
  salesOverTime?: any[];
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  unreadNotifications: number;
  salesStats?: SalesStatistics;
}

// ==================== DASHBOARD SERVICE ====================

class DashboardService {
  /**
   * Get seller profile
   * GET /api/profile/seller
   */
  async getProfile(): Promise<any> {
    try {
      const response = await axiosClient.get('/profile/seller');
      return response?.data?.data || response?.data || null;
    } catch (error) {
      console.warn('Failed to fetch seller profile:', error);
      return null;
    }
  }

  /**
   * Get sales statistics for current seller
   * GET /api/dashboard/sales-stats
   * @param startDate Optional start date for statistics
   * @param endDate Optional end date for statistics
   */
  async getSalesStatistics(startDate?: Date, endDate?: Date): Promise<SalesStatistics> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const response = await axiosClient.get('/dashboard/sales-stats', { params });
    return response.data;
  }

  /**
   * Get comprehensive dashboard statistics
   * Combines data from multiple endpoints
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [productsResp, ordersResp, notificationsResp] = await Promise.allSettled([
        axiosClient.get('/products', { params: { sellerId: 'current' } }),
        axiosClient.get('/orders/received'),
        axiosClient.get('/notifications/unread-count')
      ]);

      const stats: DashboardStats = {
        totalProducts: 0,
        totalOrders: 0,
        unreadNotifications: 0
      };

      // Extract products count
      if (productsResp.status === 'fulfilled') {
        const data = productsResp.value?.data || productsResp.value;
        stats.totalProducts = Array.isArray(data) ? data.length : (data?.totalCount || 0);
      }

      // Extract orders count
      if (ordersResp.status === 'fulfilled') {
        const data = ordersResp.value?.data || ordersResp.value;
        stats.totalOrders = data?.total || data?.totalCount || 0;
      }

      // Extract notifications count
      if (notificationsResp.status === 'fulfilled') {
        const data = notificationsResp.value?.data || notificationsResp.value;
        stats.unreadNotifications = data?.unreadCount || 0;
      }

      return stats;
    } catch (error) {
      console.warn('Failed to fetch dashboard stats:', error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        unreadNotifications: 0
      };
    }
  }
}

export const dashboardService = new DashboardService();

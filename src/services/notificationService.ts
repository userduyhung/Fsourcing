import axiosClient from './axiosClient';

/**
 * Notification Service - Handles notification-related API calls
 * Based on BE: NotificationsController.cs
 */

// ==================== INTERFACES ====================

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    items: NotificationDto[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface UnreadCountResponse {
  message: string;
  unreadCount: number;
  timestamp: string;
}

// ==================== NOTIFICATION SERVICE ====================

class NotificationService {
  /**
   * Get notifications with pagination
   * GET /api/Notifications
   */
  async getNotifications(page: number = 1, pageSize: number = 10): Promise<NotificationListResponse> {
    const response = await axiosClient.get('/notifications', {
      params: { page, pageSize }
    });
    return response.data;
  }

  /**
   * Get unread notifications count
   * GET /api/Notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response: UnreadCountResponse = await axiosClient.get('/notifications/unread-count');
      return response.unreadCount || 0;
    } catch (error) {
      console.warn('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * PUT /api/Notifications/{id}/mark-read
   */
  async markAsRead(id: string): Promise<void> {
    await axiosClient.put(`/notifications/${id}/mark-read`);
  }

  /**
   * Mark notification as read (alternative endpoint)
   * PUT /api/Notifications/{id}/read
   */
  async markAsReadAlt(id: string): Promise<void> {
    await axiosClient.put(`/notifications/${id}/read`);
  }

  /**
   * Mark all notifications as read
   * PUT /api/Notifications/mark-all-read
   */
  async markAllAsRead(): Promise<void> {
    await axiosClient.put('/notifications/mark-all-read');
  }

  /**
   * Delete notification
   * DELETE /api/Notifications/{id}
   */
  async deleteNotification(id: string): Promise<void> {
    await axiosClient.delete(`/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();

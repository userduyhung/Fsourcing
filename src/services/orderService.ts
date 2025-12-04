import axiosClient from './axiosClient';

/**
 * Order Service - Handles order-related API calls
 * Based on BE: OrderController.cs
 */

// ==================== CONSTANTS ====================

export const OrderStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded'
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Failed: 'Failed',
  Refunded: 'Refunded'
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// ==================== INTERFACES ====================

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string; // Product image URL
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price?: number; // Legacy field
}

export interface CreateOrderDto {
  CartId?: string;
  DeliveryAddressId?: string;
  PaymentMethodId?: string;
  SpecialInstructions?: string;
}

export interface OrderDto {
  id: string;
  userId?: string;
  sellerId?: string;
  cartId?: string;
  deliveryAddressId?: string;
  deliveryAddressText?: string; // Human-readable address string
  deliveryAddress?: {
    id: string;
    recipientName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethodId?: string;
  status: OrderStatusType;
  paymentStatus?: PaymentStatusType;
  totalAmount: number;
  currency?: string;
  specialInstructions?: string;
  trackingNumber?: string;
  shippedWith?: string;
  shippingCost?: number;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  message?: string;
  totalCost?: number;
  // Legacy fields for backwards compatibility
  total?: number;
  items?: OrderItemDto[];
  shippingMethod?: string;
}

export interface OrderListResponse {
  success: boolean;
  data: {
    items: OrderDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasItems: boolean;
    summary?: {
      count: number;
    };
    status?: string;
  };
}

// ==================== ORDER SERVICE ====================

class OrderService {
  /**
   * Create new order
   * POST /api/orders
   */
  async createOrder(dto: CreateOrderDto): Promise<OrderDto> {
    const response = await axiosClient.post('/orders', dto);
    // Backend returns { success: true, data: Order }
    // axiosClient returns full response, so we need response.data.data
    return response.data?.data || response.data;
  }

  /**
   * Get orders for current user
   * GET /api/orders
   */
  async getOrders(page: number = 1, pageSize: number = 10): Promise<OrderListResponse> {
    const response = await axiosClient.get('/orders', {
      params: { page, pageSize }
    });
    // axiosClient returns full response, need to unwrap response.data
    return response.data as OrderListResponse;
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  async getOrderById(id: string): Promise<OrderDto> {
    const response = await axiosClient.get(`/orders/${id}`);
    
    // Backend may return { success: true, data: { ...order, items: [...] } }
    // or directly { ...order, items: [...] }
    const orderData = response.data?.data || response.data;
    
    // Ensure items array exists and is properly formatted
    if (orderData && !orderData.items) {
      orderData.items = [];
    }
    
    return orderData as OrderDto;
  }

  /**
   * Get received orders (for sellers)
   * GET /api/orders/received
   */
  async getReceivedOrders(page: number = 1, pageSize: number = 10): Promise<OrderListResponse> {
    try {
      const response = await axiosClient.get('/orders/received', {
        params: { page, pageSize }
      });
      // axiosClient returns full response, need to unwrap response.data
      return response.data as OrderListResponse;
    } catch (error) {
      console.warn('Failed to fetch received orders:', error);
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          hasItems: false
        }
      };
    }
  }

  /**
   * Get received order by ID (for sellers)
   * Workaround: Fetch from list API since backend doesn't have GET /orders/received/{id}
   */
  async getReceivedOrderById(orderId: string): Promise<OrderDto> {
    try {
      // Try to get all orders and find the specific one
      const response = await this.getReceivedOrders(1, 1000); // Get large page to find order
      const responseData = (response as any)?.data || response;
      const orders = responseData?.data?.items || responseData?.items || [];
      
      const order = orders.find((o: OrderDto) => o.id === orderId);
      
      if (order) {
        return order;
      }
      
      throw new Error('Order not found or does not belong to seller');
    } catch (error) {
      console.error('Failed to fetch received order by ID:', error);
      throw error;
    }
  }

  /**
   * Confirm order
   * POST /api/orders/{id}/confirm
   */
  async confirmOrder(id: string): Promise<void> {
    await axiosClient.post(`/orders/${id}/confirm`);
  }

  /**
   * Update order status
   * PUT /api/orders/{id}/status
   */
  async updateOrderStatus(id: string, status: string, notes?: string): Promise<void> {
    await axiosClient.put(`/orders/${id}/status`, { status, notes: notes || '' });
  }

  /**
   * Get order tracking
   * GET /api/orders/{id}/tracking
   */
  async getOrderTracking(id: string): Promise<any> {
    const response = await axiosClient.get(`/orders/${id}/tracking`);
    // axiosClient returns full response, need to unwrap response.data
    return response.data;
  }

  /**
   * Update payment status
   * PUT /api/orders/{id}/payment-status
   */
  async updatePaymentStatus(id: string, isPaid: boolean, transactionId?: string): Promise<OrderDto> {
    const response = await axiosClient.put(`/orders/${id}/payment-status`, {
      isPaid,
      transactionId,
      paidAt: isPaid ? new Date().toISOString() : undefined
    });
    // axiosClient returns full response, need to unwrap response.data.data
    return response.data?.data || response.data as OrderDto;
  }

  /**
   * Mark order as paid (shortcut method)
   */
  async markAsPaid(id: string, transactionId?: string): Promise<OrderDto> {
    return this.updatePaymentStatus(id, true, transactionId);
  }

  /**
   * Cancel order
   * POST /api/orders/{id}/cancel
   */
  async cancelOrder(id: string, reason?: string): Promise<void> {
    await axiosClient.post(`/orders/${id}/cancel`, { reason });
  }
}

export const orderService = new OrderService();

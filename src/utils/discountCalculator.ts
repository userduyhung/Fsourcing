/**
 * Discount Calculator Utilities
 * Tính toán giảm giá cho đơn hàng
 */

export interface DiscountResult {
  isApplicable: boolean;
  discountPercent: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  message: string;
}

/**
 * Kiểm tra xem đây có phải đơn hàng đầu tiên trong tuần không
 */
function isFirstOrderThisWeek(): boolean {
  const orders = localStorage.getItem('orders');
  if (!orders) return true; // Chưa có đơn hàng nào
  
  try {
    const orderList = JSON.parse(orders);
    if (!Array.isArray(orderList) || orderList.length === 0) return true;
    
    // Lấy ngày đầu tuần (Thứ Hai)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ hai,...
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Tính số ngày đến thứ Hai
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Kiểm tra có đơn hàng nào trong tuần này không
    const hasOrderThisWeek = orderList.some((order: any) => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      return orderDate >= monday;
    });
    
    return !hasOrderThisWeek;
  } catch (e) {
    console.error('Error checking first order:', e);
    return true; // Nếu lỗi, cho phép giảm giá
  }
}

/**
 * Tính giảm giá 30% cho đơn hàng đầu tiên trong tuần (áp dụng cho đơn từ 20k trở lên)
 */
export function calculateFirstOrderDiscount(subtotal: number): DiscountResult {
  const MIN_ORDER_FOR_DISCOUNT = 20000; // 20,000 VND
  const DISCOUNT_PERCENT = 30;
  
  // Kiểm tra điều kiện
  if (subtotal < MIN_ORDER_FOR_DISCOUNT) {
    return {
      isApplicable: false,
      discountPercent: 0,
      discountAmount: 0,
      originalAmount: subtotal,
      finalAmount: subtotal,
      message: `Đơn hàng cần từ ${MIN_ORDER_FOR_DISCOUNT.toLocaleString('vi-VN')} ₫ trở lên để được giảm giá`
    };
  }
  
  // Kiểm tra đơn đầu tiên trong tuần
  if (!isFirstOrderThisWeek()) {
    return {
      isApplicable: false,
      discountPercent: 0,
      discountAmount: 0,
      originalAmount: subtotal,
      finalAmount: subtotal,
      message: 'Bạn đã có đơn hàng trong tuần này. Khuyến mãi chỉ áp dụng cho đơn đầu tiên!'
    };
  }
  
  // Tính giảm giá
  const discountAmount = Math.round((subtotal * DISCOUNT_PERCENT) / 100);
  const finalAmount = subtotal - discountAmount;
  
  return {
    isApplicable: true,
    discountPercent: DISCOUNT_PERCENT,
    discountAmount: discountAmount,
    originalAmount: subtotal,
    finalAmount: finalAmount,
    message: `🎉 Giảm ${DISCOUNT_PERCENT}% cho đơn đầu tiên trong tuần!`
  };
}

/**
 * Format số tiền theo VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
}

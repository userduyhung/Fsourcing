/**
 * Purchase Flow Validation Utilities
 * Validates each step of the buyer purchase journey
 */

import { CartItem } from '../types';

// ==================== VALIDATION TYPES ====================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProductValidation extends ValidationResult {
  productId?: string;
  productName?: string;
}

export interface CartValidation extends ValidationResult {
  totalItems: number;
  totalAmount: number;
  invalidItems: string[];
}

export interface AddressValidation extends ValidationResult {
  fullAddress?: string;
}

export interface PaymentValidation extends ValidationResult {
  amount: number;
  paymentMethod?: string;
}

// ==================== PRODUCT VALIDATION ====================

/**
 * Validate product before adding to cart
 */
export function validateProduct(product: any, quantity: number = 1): ProductValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check product ID (must be valid GUID)
  if (!product?.id) {
    errors.push('Sản phẩm không có ID hợp lệ');
  } else {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!guidRegex.test(product.id)) {
      errors.push('ID sản phẩm không đúng định dạng GUID');
    }
  }

  // Check product name
  if (!product?.name || product.name.trim() === '') {
    errors.push('Sản phẩm không có tên');
  } else if (product.name.length > 200) {
    warnings.push('Tên sản phẩm quá dài');
  }

  // Check product price
  if (product?.price === undefined || product.price === null) {
    errors.push('Sản phẩm không có giá');
  } else {
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.\-]/g, ''));
    if (isNaN(price) || price < 0) {
      errors.push('Giá sản phẩm không hợp lệ');
    } else if (price === 0) {
      warnings.push('Sản phẩm có giá 0 đồng');
    } else if (price > 10000000000) { // 10 billion VND
      warnings.push('Giá sản phẩm rất cao, vui lòng kiểm tra lại');
    }
  }

  // Check quantity
  if (quantity < 1) {
    errors.push('Số lượng phải lớn hơn 0');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Số lượng phải là số nguyên');
  } else if (quantity > 10000) {
    warnings.push('Số lượng rất lớn, vui lòng kiểm tra lại');
  }

  // Check product availability
  if (product?.quantity !== undefined) {
    const availableQty = parseInt(String(product.quantity), 10);
    if (!isNaN(availableQty) && availableQty < quantity) {
      warnings.push(`Chỉ còn ${availableQty} sản phẩm, bạn đang chọn ${quantity}`);
    }
  }

  // Check product image
  if (!product?.image) {
    warnings.push('Sản phẩm không có hình ảnh');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    productId: product?.id,
    productName: product?.name
  };
}

// ==================== CART VALIDATION ====================

/**
 * Validate entire cart before checkout
 */
export function validateCart(cart: CartItem[]): CartValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const invalidItems: string[] = [];

  // Check if cart is empty
  if (!cart || cart.length === 0) {
    errors.push('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
    return {
      isValid: false,
      errors,
      warnings,
      totalItems: 0,
      totalAmount: 0,
      invalidItems
    };
  }

  // Validate each cart item
  let totalAmount = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    const itemErrors: string[] = [];

    // Validate item ID
    if (!item.id) {
      itemErrors.push(`Sản phẩm thứ ${index + 1}: Thiếu ID`);
    }

    // Validate item name
    if (!item.name || item.name.trim() === '') {
      itemErrors.push(`Sản phẩm thứ ${index + 1}: Thiếu tên`);
    }

    // Validate item price
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
      itemErrors.push(`${item.name || 'Sản phẩm'}: Giá không hợp lệ`);
    }

    // Validate item quantity
    if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
      itemErrors.push(`${item.name || 'Sản phẩm'}: Số lượng không hợp lệ`);
    }

    // Validate item image
    if (!item.image) {
      warnings.push(`${item.name || 'Sản phẩm'}: Không có hình ảnh`);
    }

    // Calculate totals if item is valid
    if (itemErrors.length === 0) {
      totalAmount += (item.price || 0) * (item.quantity || 0);
      totalItems += item.quantity || 0;
    } else {
      invalidItems.push(item.name || `Item ${index + 1}`);
      errors.push(...itemErrors);
    }
  });

  // Validate total amount
  if (totalAmount <= 0) {
    errors.push('Tổng giá trị đơn hàng phải lớn hơn 0');
  } else if (totalAmount > 50000000000) { // 50 billion VND
    warnings.push('Đơn hàng có giá trị rất cao, vui lòng liên hệ bộ phận hỗ trợ');
  }

  // Check for duplicate items
  const itemIds = cart.map(item => item.id);
  const duplicates = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    warnings.push('Giỏ hàng có sản phẩm trùng lặp');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalItems,
    totalAmount,
    invalidItems
  };
}

/**
 * Validate cart item quantity update
 */
export function validateQuantityUpdate(newQuantity: number, maxAvailable?: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (newQuantity < 1) {
    errors.push('Số lượng phải lớn hơn 0');
  } else if (!Number.isInteger(newQuantity)) {
    errors.push('Số lượng phải là số nguyên');
  } else if (newQuantity > 10000) {
    warnings.push('Số lượng rất lớn, vui lòng kiểm tra lại');
  }

  if (maxAvailable !== undefined && newQuantity > maxAvailable) {
    errors.push(`Chỉ còn ${maxAvailable} sản phẩm trong kho`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== ADDRESS VALIDATION ====================

/**
 * Validate shipping address
 */
export function validateAddress(
  province: string,
  district: string,
  ward: string,
  street: string
): AddressValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!province || province.trim() === '') {
    errors.push('Vui lòng chọn Tỉnh/Thành phố');
  }

  if (!district || district.trim() === '') {
    errors.push('Vui lòng chọn Quận/Huyện');
  }

  if (!ward || ward.trim() === '') {
    errors.push('Vui lòng chọn Phường/Xã');
  }

  if (!street || street.trim() === '') {
    errors.push('Vui lòng nhập số nhà và tên đường');
  } else if (street.length < 5) {
    warnings.push('Địa chỉ có vẻ quá ngắn, vui lòng kiểm tra lại');
  } else if (street.length > 200) {
    errors.push('Địa chỉ quá dài (tối đa 200 ký tự)');
  }

  // Build full address if valid
  let fullAddress: string | undefined;
  if (errors.length === 0) {
    fullAddress = `${street}, ${ward}, ${district}, ${province}`;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fullAddress
  };
}

/**
 * Validate full address string
 */
export function validateFullAddress(address: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!address || address.trim() === '') {
    errors.push('Địa chỉ giao hàng không được để trống');
  } else if (address.length < 10) {
    warnings.push('Địa chỉ có vẻ quá ngắn, vui lòng kiểm tra lại');
  } else if (address.length > 300) {
    errors.push('Địa chỉ quá dài (tối đa 300 ký tự)');
  } else {
    // Check if address has minimum components (number, street, ward, district, province)
    const commaCount = (address.match(/,/g) || []).length;
    if (commaCount < 2) {
      warnings.push('Địa chỉ nên bao gồm: số nhà, phường/xã, quận/huyện, tỉnh/thành phố');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== PAYMENT VALIDATION ====================

/**
 * Validate payment details before processing
 */
export function validatePayment(
  cart: CartItem[],
  address: string,
  totalAmount: number
): PaymentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cart
  const cartValidation = validateCart(cart);
  if (!cartValidation.isValid) {
    errors.push(...cartValidation.errors);
  }

  // Validate address
  const addressValidation = validateFullAddress(address);
  if (!addressValidation.isValid) {
    errors.push(...addressValidation.errors);
  }

  // Validate amount
  if (!totalAmount || totalAmount <= 0) {
    errors.push('Tổng số tiền thanh toán không hợp lệ');
  } else if (totalAmount < cartValidation.totalAmount) {
    // Total must be at least the cart subtotal (can be higher with shipping fee)
    errors.push('Tổng số tiền không khớp với giỏ hàng');
  }

  // Check minimum order value (e.g., 10,000 VND)
  const MIN_ORDER_VALUE = 10000;
  if (totalAmount < MIN_ORDER_VALUE) {
    errors.push(`Giá trị đơn hàng tối thiểu là ${MIN_ORDER_VALUE.toLocaleString('vi-VN')} ₫`);
  }

  // Warning for large orders
  if (totalAmount > 100000000) { // 100 million VND
    warnings.push('Đơn hàng lớn có thể yêu cầu xác nhận thêm từ bộ phận bán hàng');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    amount: totalAmount,
    paymentMethod: 'bank_transfer' // Currently only support bank transfer
  };
}

/**
 * Validate VietQR payment configuration
 */
export function validateVietQRConfig(config: {
  accountNo: string;
  accountName: string;
  acqId: string;
  amount: number;
  addInfo: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate account number
  if (!config.accountNo || config.accountNo.trim() === '') {
    errors.push('Thiếu số tài khoản ngân hàng');
  } else if (!/^\d{9,14}$/.test(config.accountNo)) {
    errors.push('Số tài khoản không hợp lệ (9-14 chữ số)');
  }

  // Validate account name
  if (!config.accountName || config.accountName.trim() === '') {
    errors.push('Thiếu tên chủ tài khoản');
  }

  // Validate bank code
  if (!config.acqId || config.acqId.trim() === '') {
    errors.push('Thiếu mã ngân hàng');
  } else if (!/^\d{6}$/.test(config.acqId)) {
    warnings.push('Mã ngân hàng không đúng định dạng (6 chữ số)');
  }

  // Validate amount
  if (!config.amount || config.amount <= 0) {
    errors.push('Số tiền thanh toán không hợp lệ');
  }

  // Validate transfer content
  if (!config.addInfo || config.addInfo.trim() === '') {
    warnings.push('Nội dung chuyển khoản trống');
  } else if (config.addInfo.length > 100) {
    warnings.push('Nội dung chuyển khoản quá dài');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== AUTHENTICATION VALIDATION ====================

/**
 * Check if user is authenticated
 */
export function validateAuthentication(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const buyerToken = localStorage.getItem('buyerToken');
  const sellerToken = localStorage.getItem('sellerToken');
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');

  const isAuthenticated = !!(buyerToken || sellerToken || adminToken || token);

  if (!isAuthenticated) {
    errors.push('Bạn cần đăng nhập để thực hiện thao tác này');
  }

  // Check if token is expired
  const activeToken = buyerToken || sellerToken || adminToken || token;
  if (activeToken) {
    try {
      const parts = activeToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          errors.push('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        }
      }
    } catch (e) {
      warnings.push('Không thể xác thực token');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate buyer role
 */
export function validateBuyerRole(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const authValidation = validateAuthentication();
  if (!authValidation.isValid) {
    return authValidation;
  }

  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'buyer') {
    errors.push('Chỉ người mua mới có thể thực hiện thao tác này');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format validation errors for display
 */
export function formatValidationErrors(validation: ValidationResult): string {
  if (validation.isValid) return '';
  return validation.errors.join('\n');
}

/**
 * Format validation warnings for display
 */
export function formatValidationWarnings(validation: ValidationResult): string {
  if (validation.warnings.length === 0) return '';
  return validation.warnings.join('\n');
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...validations: ValidationResult[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  validations.forEach(v => {
    allErrors.push(...v.errors);
    allWarnings.push(...v.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

export default {
  validateProduct,
  validateCart,
  validateQuantityUpdate,
  validateAddress,
  validateFullAddress,
  validatePayment,
  validateVietQRConfig,
  validateAuthentication,
  validateBuyerRole,
  formatValidationErrors,
  formatValidationWarnings,
  combineValidations
};

// Tính phí giao hàng dựa trên tỉnh/thành phố

export interface ShippingFeeResult {
  fee: number;
  region: 'TP.HCM' | 'Miền Nam' | 'Miền Trung' | 'Miền Bắc';
  message: string;
}

// Danh sách tỉnh/thành theo vùng miền
const PROVINCES_BY_REGION = {
  HCMC: ['Thành phố Hồ Chí Minh', 'Hồ Chí Minh'],
  
  SOUTH: [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bến Tre', 
    'Bình Dương', 'Bình Phước', 'Cà Mau', 'Cần Thơ', 
    'Đồng Nai', 'Đồng Tháp', 'Hậu Giang', 'Kiên Giang', 
    'Long An', 'Sóc Trăng', 'Tây Ninh', 'Tiền Giang', 
    'Trà Vinh', 'Vĩnh Long'
  ],
  
  CENTRAL: [
    'Bình Định', 'Bình Thuận', 'Đà Nẵng', 'Đắk Lắk', 
    'Đắk Nông', 'Gia Lai', 'Khánh Hòa', 'Kon Tum', 
    'Lâm Đồng', 'Ninh Thuận', 'Phú Yên', 'Quảng Bình', 
    'Quảng Nam', 'Quảng Ngãi', 'Quảng Trị', 'Thừa Thiên Huế'
  ],
  
  NORTH: [
    'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Cao Bằng', 
    'Điện Biên', 'Hà Giang', 'Hà Nam', 'Hà Nội', 
    'Hải Dương', 'Hải Phòng', 'Hòa Bình', 'Hưng Yên', 
    'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 
    'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ninh', 
    'Sơn La', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 
    'Tuyên Quang', 'Vĩnh Phúc', 'Yên Bái'
  ]
};

// Phí giao hàng theo vùng
const SHIPPING_FEES = {
  HCMC: 0,           // Free ship TP.HCM
  SOUTH: 5000,       // Miền Nam
  CENTRAL: 7000,     // Miền Trung
  NORTH: 10000       // Miền Bắc
};

/**
 * Xác định vùng miền dựa trên tên tỉnh/thành
 */
function getRegion(provinceName: string): 'HCMC' | 'SOUTH' | 'CENTRAL' | 'NORTH' {
  if (!provinceName) return 'NORTH'; // Default
  
  const normalizedProvince = provinceName.trim();
  
  // Kiểm tra TP.HCM
  if (PROVINCES_BY_REGION.HCMC.some(p => normalizedProvince.includes(p))) {
    return 'HCMC';
  }
  
  // Kiểm tra Miền Nam
  if (PROVINCES_BY_REGION.SOUTH.some(p => normalizedProvince.includes(p))) {
    return 'SOUTH';
  }
  
  // Kiểm tra Miền Trung
  if (PROVINCES_BY_REGION.CENTRAL.some(p => normalizedProvince.includes(p))) {
    return 'CENTRAL';
  }
  
  // Mặc định Miền Bắc
  return 'NORTH';
}

/**
 * Tính phí giao hàng dựa trên tỉnh/thành
 * @param provinceName - Tên tỉnh/thành phố
 * @returns ShippingFeeResult - Thông tin phí ship và vùng miền
 */
export function calculateShippingFee(provinceName: string): ShippingFeeResult {
  const region = getRegion(provinceName);
  const fee = SHIPPING_FEES[region];
  
  let message = '';
  let regionName: 'TP.HCM' | 'Miền Nam' | 'Miền Trung' | 'Miền Bắc' = 'Miền Bắc';
  
  switch (region) {
    case 'HCMC':
      message = '🎉 Miễn phí giao hàng cho TP.HCM';
      regionName = 'TP.HCM';
      break;
    case 'SOUTH':
      message = '📦 Phí giao hàng Miền Nam: 5.000đ';
      regionName = 'Miền Nam';
      break;
    case 'CENTRAL':
      message = '📦 Phí giao hàng Miền Trung: 7.000đ';
      regionName = 'Miền Trung';
      break;
    case 'NORTH':
      message = '📦 Phí giao hàng Miền Bắc: 10.000đ';
      regionName = 'Miền Bắc';
      break;
  }
  
  return {
    fee,
    region: regionName,
    message
  };
}

/**
 * Format tiền tệ VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

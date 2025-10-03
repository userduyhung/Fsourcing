# Hướng dẫn thêm Logo vào Fsourcing Website

## Cách thêm ảnh logo vào project

### Bước 1: Chuẩn bị file ảnh logo
1. Chuẩn bị file ảnh logo của bạn (định dạng PNG, JPG, hoặc SVG)
2. Đặt tên file phù hợp, ví dụ: `logo.png`, `fsourcing-logo.svg`
3. Kích thước khuyến nghị: 32x32px hoặc 64x64px cho logo nhỏ

### Bước 2: Copy ảnh vào thư mục assets
1. Copy file logo vào thư mục: `src/assets/images/`
2. Ví dụ: `src/assets/images/logo.png`

### Bước 3: Cập nhật component Logo
Mở file `src/components/Logo.tsx` và thay đổi như sau:

```tsx
import React from 'react';
import logoImage from '../assets/images/logo.png'; // Thay đổi tên file theo logo của bạn

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", alt = "Fsourcing Logo" }) => {
  return (
    <img 
      src={logoImage} 
      alt={alt}
      className={className}
    />
  );
};

export default Logo;
```

### Bước 4: Kiểm tra kết quả
1. Chạy lệnh: `npm run dev`
2. Mở trình duyệt và kiểm tra logo trong header

## Các tùy chọn khác

### Sử dụng logo SVG
Nếu bạn có file SVG, có thể import trực tiếp:

```tsx
import LogoSVG from '../assets/images/logo.svg';

const Logo: React.FC<LogoProps> = ({ className, alt }) => {
  return (
    <img 
      src={LogoSVG} 
      alt={alt}
      className={className}
    />
  );
};
```

### Sử dụng logo từ URL
Nếu logo được host online:

```tsx
const Logo: React.FC<LogoProps> = ({ className, alt }) => {
  const logoUrl = "https://your-domain.com/logo.png";
  
  return (
    <img 
      src={logoUrl} 
      alt={alt}
      className={className}
    />
  );
};
```

### Thay đổi kích thước logo
Có thể điều chỉnh kích thước logo bằng cách thay đổi class CSS:
- `h-6 w-6`: 24x24px
- `h-8 w-8`: 32x32px (mặc định)
- `h-10 w-10`: 40x40px
- `h-12 w-12`: 48x48px

## Lưu ý quan trọng
1. Đảm bảo file ảnh có kích thước phù hợp để tránh làm chậm website
2. Sử dụng định dạng WebP hoặc SVG để tối ưu hiệu suất
3. Logo sẽ tự động hiển thị responsive trên mobile
4. Nếu không có logo, component sẽ hiển thị chữ "F" trong một hộp màu xanh

## Troubleshooting
- Nếu logo không hiển thị, kiểm tra đường dẫn import có đúng không
- Đảm bảo file ảnh tồn tại trong thư mục `src/assets/images/`
- Kiểm tra console browser để xem có lỗi import nào không
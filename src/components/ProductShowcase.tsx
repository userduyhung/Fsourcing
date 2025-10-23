import React from 'react';
import ProductCard from './ProductCard';

const products = [
  {
    image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg',
    price: 120000,
    quantity: 500,
    unit: 'Cái',
    name: 'Áo choàng tắm cao cấp',
    description: 'Chất liệu cotton mềm mại, thấm hút tốt, phù hợp cho gia đình và khách sạn.',
  },
  {
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
    price: 250000,
    quantity: 48,
    unit: 'Chai',
    name: 'Nước hoa nam hương gỗ',
    description: 'Hương thơm nam tính, lưu hương lâu, thích hợp dùng hàng ngày.',
  },
  {
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
    price: 950000,
    quantity: 200,
    unit: 'Thùng',
    name: 'Máy sấy tóc công suất lớn',
    description: 'Thiết kế hiện đại, sấy nhanh, bảo vệ tóc khỏi nhiệt độ cao.',
  },
  {
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
    price: 12000,
    quantity: 417,
    unit: 'Cái',
    name: 'Túi đựng điện thoại chống nước',
    description: 'Bảo vệ điện thoại khi đi mưa, đi biển, chất liệu bền đẹp.',
  },
  {
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
    price: 250000,
    quantity: 500,
    unit: 'Cái',
    name: 'Sạc đa năng 3 trong 1',
    description: 'Sạc nhanh cho điện thoại, đồng hồ thông minh và tai nghe.',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 48000,
    quantity: 1000,
    unit: 'Bình',
    name: 'Bình nước giữ nhiệt',
    description: 'Giữ nóng/lạnh lên đến 12h, dung tích 500ml, nhiều màu sắc.',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 350000,
    quantity: 300,
    unit: 'Cái',
    name: 'Loa Bluetooth mini',
    description: 'Âm thanh sống động, kết nối không dây, pin dùng 8 giờ.',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 190000,
    quantity: 600,
    unit: 'Cái',
    name: 'Đèn bàn LED cảm ứng',
    description: 'Điều chỉnh độ sáng, tiết kiệm điện, phù hợp học tập và làm việc.',
  },
  // ...có thể thêm sản phẩm khác với tên, mô tả, đơn vị tiếng Việt
];

const columns = 5;
const displayProducts = products.slice(0, products.length - (products.length % columns));

const ProductShowcase: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {
  const navigateToProducts = () => {
    window.location.href = '/products';
  };

  return (
    <section className="bg-gray-50 rounded-xl p-4 mt-8 flex justify-center font-sans">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl">Mới</span>
            <span className="font-bold text-xl text-gray-900">Sản phẩm</span>
            <span className="ml-3 text-gray-500 font-medium text-sm">Khám phá các sản phẩm nổi bật trong 2 tuần qua</span>
          </div>
          <button onClick={navigateToProducts} className="text-gray-500 hover:text-blue-600 font-medium text-sm bg-transparent border-none cursor-pointer font-sans">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={idx}
              image={product.image}
              name={product.name}
              description={product.description}
              price={Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              quantity={`${product.quantity} ${product.unit}`}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

    </section>
  );
};

export default ProductShowcase;

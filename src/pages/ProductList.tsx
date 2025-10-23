import React from 'react';
import ProductCard from '../components/ProductCard';
import ProductCategoryTabs from '../components/ProductCategoryTabs';
import SearchBar from '../components/SearchBar';

const categories = [
  {
    name: 'Điện thoại & Thiết bị di động',
    products: [
      { image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', price: '199.000₫', quantity: '100 chiếc', name: 'Điện thoại X1', description: 'Điện thoại thông minh màn hình lớn, pin lâu.' },
      { image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg', price: '29.000₫', quantity: '200 chiếc', name: 'Tai nghe Bluetooth', description: 'Tai nghe không dây chất lượng cao.' },
      { image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg', price: '49.000₫', quantity: '150 chiếc', name: 'Đồng hồ thông minh', description: 'Theo dõi sức khỏe, thông báo thông minh.' },
      { image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg', price: '15.000₫', quantity: '300 chiếc', name: 'Pin dự phòng', description: 'Dung lượng lớn, sạc nhanh.' },
      { image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg', price: '8.000₫', quantity: '500 chiếc', name: 'Ốp lưng điện thoại', description: 'Bảo vệ điện thoại, nhiều mẫu mã.' },
    ]
  },
  {
    name: 'Ô tô & Phụ kiện xe',
    products: [
      { image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg', price: '299.000₫', quantity: '50 chiếc', name: 'Định vị GPS xe hơi', description: 'Thiết bị định vị chính xác cho xe.' },
      { image: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg', price: '120.000₫', quantity: '80 chiếc', name: 'Camera hành trình', description: 'Ghi lại hành trình di chuyển.' },
      { image: 'https://m.media-amazon.com/images/I/71IVuzyEs6L.jpg', price: '35.000₫', quantity: '200 chiếc', name: 'Bọc ghế xe hơi', description: 'Chất liệu cao cấp, dễ vệ sinh.' },
      { image: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg', price: '60.000₫', quantity: '100 chiếc', name: 'Vô lăng xe hơi', description: 'Thiết kế tiện lợi, bền đẹp.' },
      { image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg', price: '25.000₫', quantity: '300 chiếc', name: 'Nước hoa ô tô', description: 'Khử mùi, tạo hương thơm dễ chịu.' },
    ]
  },
  {
    name: 'Làm đẹp & Chăm sóc cá nhân',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: '10.000₫', quantity: '48 chiếc', name: 'Nước hoa', description: 'Hương thơm quyến rũ, đa dạng.' },
      { image: 'https://i5.walmartimages.com/seo/Revlon-1875W-Compact-Hair-Dryer-Black_9b619d96-02a9-470c-8c84-8ec2fda3cf6c.5afe0804f72f7d268cdb573c763bdaaa.jpeg', price: '39.990₫', quantity: '200 thùng', name: 'Máy sấy tóc', description: 'Công suất lớn, sấy nhanh.' },
      { image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg', price: '5.000₫', quantity: '500 chiếc', name: 'Áo choàng tắm', description: 'Chất liệu mềm mại, thấm hút tốt.' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: '22.000₫', quantity: '120 chiếc', name: 'Mặt nạ dưỡng da', description: 'Dưỡng ẩm, làm sáng da.' },
      { image: 'https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg', price: '18.000₫', quantity: '250 chiếc', name: 'Bộ chăm sóc da', description: 'Bộ sản phẩm dưỡng da toàn diện.' },
    ]
  },
  {
    name: 'Thiết bị điện tử tiêu dùng',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: '99.000₫', quantity: '60 chiếc', name: 'Loa Bluetooth', description: 'Âm thanh sống động, kết nối nhanh.' },
      { image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg', price: '49.000₫', quantity: '150 chiếc', name: 'Tivi LED', description: 'Hình ảnh sắc nét, tiết kiệm điện.' },
      { image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg', price: '15.000₫', quantity: '300 chiếc', name: 'Chuột không dây', description: 'Thiết kế nhỏ gọn, tiện lợi.' },
      { image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg', price: '8.000₫', quantity: '500 chiếc', name: 'USB lưu trữ', description: 'Dung lượng lớn, tốc độ cao.' },
      { image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', price: '199.000₫', quantity: '100 chiếc', name: 'Máy tính bảng', description: 'Màn hình lớn, đa chức năng.' },
    ]
  },
  {
    name: 'Linh kiện điện tử',
    products: [
      { image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg', price: '2.000₫', quantity: '1000 chiếc', name: 'Điện trở', description: 'Linh kiện cơ bản cho mạch điện.' },
      { image: 'https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/F7111340-01?pgw=1', price: '3.000₫', quantity: '800 chiếc', name: 'Tụ điện', description: 'Lưu trữ năng lượng điện.' },
      { image: 'https://images.pexels.com/photos/3862373/pexels-photo-3862373.jpeg', price: '1.500₫', quantity: '1200 chiếc', name: 'Diode', description: 'Linh kiện bán dẫn, chỉnh lưu.' },
      { image: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg', price: '4.000₫', quantity: '900 chiếc', name: 'Transistor', description: 'Khuếch đại tín hiệu điện.' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: '2.500₫', quantity: '1100 chiếc', name: 'Chip IC', description: 'Vi mạch tích hợp đa chức năng.' },
    ]
  },
  {
    name: 'Phụ kiện thời trang & Giày dép',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: '25.000₫', quantity: '400 chiếc', name: 'Giày thể thao', description: 'Thiết kế năng động, thoải mái.' },
      { image: 'https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?cs=srgb&dl=pexels-catscoming-1204464.jpg&fm=jpg', price: '12.000₫', quantity: '600 chiếc', name: 'Túi xách', description: 'Kiểu dáng thời trang, tiện dụng.' },
      { image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg', price: '8.000₫', quantity: '700 chiếc', name: 'Kính mát', description: 'Bảo vệ mắt, phong cách.' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: '19.000₫', quantity: '350 chiếc', name: 'Đồng hồ', description: 'Thời trang, đa chức năng.' },
      { image: 'https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg', price: '15.000₫', quantity: '500 chiếc', name: 'Thắt lưng', description: 'Chất liệu bền đẹp, nhiều màu sắc.' },
    ]
  }
];

export const ProductList: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {

  const [selectedCategory, setSelectedCategory] = React.useState('Tất cả');

  // Lấy từ khoá tìm kiếm từ URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  // Hàm loại bỏ dấu tiếng Việt
  function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Nếu có từ khoá tìm kiếm, chỉ hiển thị các danh mục có sản phẩm liên quan tới từ khoá
  let filteredCategories = categories;
  if (searchQuery) {
    const normalizedQuery = removeAccents(searchQuery).trim();
    filteredCategories = categories
      .map(cat => {
        const filteredProducts = cat.products.filter(product => {
          const name = removeAccents(product.name?.toLowerCase() || '');
          const desc = removeAccents(product.description?.toLowerCase() || '');
          // Tìm kiếm từ khoá trong tên hoặc mô tả
          return (
            name.includes(normalizedQuery) ||
            desc.includes(normalizedQuery)
          );
        });
        return filteredProducts.length > 0 ? { ...cat, products: filteredProducts } : null;
      })
      .filter(Boolean) as typeof categories;
  }

  // Lấy tất cả sản phẩm từ các danh mục đã lọc
  const allProducts = filteredCategories.flatMap(cat => 
    cat.products.map(p => ({ ...p, category: cat.name }))
  );

  return (
    <div className="bg-[#f8ecd7] min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <SearchBar />
        </div>
        <ProductCategoryTabs onSelect={setSelectedCategory} />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory}
        </h1>
        {selectedCategory === 'Tất cả' ? (
          filteredCategories.map(category => (
            <div key={category.name} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{category.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {category.products.map((product, idx) => (
                  <ProductCard key={idx} {...product} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allProducts.map((product, idx) => (
              <ProductCard key={idx} {...product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


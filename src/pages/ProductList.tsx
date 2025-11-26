import React from 'react';
import ProductCard from '../components/ProductCard';
import ProductCategoryTabs from '../components/ProductCategoryTabs';
import SearchBar from '../components/SearchBar';

const categories = [
  {
    name: 'Bia, nước giải khát',
    products: [
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', image: 'https://bizweb.dktcdn.net/100/446/647/products/bia-tiger-sleek-5-abv-lon-330ml-281124-112850-1732768166826.jpg?v=1732768294907', price: 12000, quantity: '1200 chai', name: 'Bia Tiger A', description: 'Bia lager nhẹ, phù hợp uống mát.' },
      { id: '1c6b147e-3d6b-4e1d-9b6f-2e8a2f9b9b6a', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=820,h=820,quality=80,f=auto/media/sys_b2bpcm/images/h02/h06/50575/95001617_1.png', price: 8000, quantity: '2000 chai', name: 'Nước ngọt Cola', description: 'Hương vị truyền thống, sủi bọt.' },
      { id: '8a4f5c8b-9d3e-4f2a-8a7f-2f3b4c5d6e7f', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=250,h=250,quality=80,f=webp/media/sys_b2bpcm/images/h95/h05/14807/d18429e2-c022-4f5f-af07-8c32560d5ffe.png', price: 15000, quantity: '800 chai', name: 'Trà C2 Freeze vị chanh tuyết bạc hà chai 455ml', description: 'Từ hoa quả tươi, không chất bảo quản.' },
      { id: '2b7d3a6e-0b4f-4a1c-9e2d-4b5c6d7e8f90', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=820,h=820,quality=80,f=auto/media/sys_b2bpcm/images/h9a/h05/19001/11%20(16).png', price: 9000, quantity: '1500 lon', name: 'Trà Bí đao Wonderfarm', description: 'Hương trà tự nhiên, giải khát.' },
      { id: '5d6e7f80-1a2b-4c3d-9e0f-1234567890ab', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=820,h=820,quality=80,f=auto/media/sys_b2bpcm/images/he7/h05/41627/95002844_1.png', price: 20000, quantity: '600 chai', name: 'Nước gạo buổi sáng (Morning Rice)', description: 'Bổ sung điện giải, năng lượng.' },
    ]
  },
  {
    name: 'Bánh kẹo, trà, cà phê',
    products: [
      { id: 'a1b2c3d4-1111-2222-3333-444455556666', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=250,h=250,quality=80,f=webp/media/sys_b2bpcm/images/h77/h06/94684/95008771.png', price: 25000, quantity: '500 gói', name: 'Bánh gạo nướng An vị tự nhiên gói 151.2g', description: 'Giòn, ngọt vừa phải, nhiều vị.' },
      { id: 'b2c3d4e5-2222-3333-4444-555566667777', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=820,h=820,quality=80,f=auto/media/sys_b2bpcm/images/h2e/h00/1523/a6fc501f-bd61-42d1-9e63-464dae5e0d54.png', price: 60000, quantity: '300 hộp', name: 'Bánh CHOCO-PIE ORION vị truyền thống hộp 396g', description: 'Bánh Choco-Pie là sản phẩm bánh cao cấp của thương hiệu Orion từ lâu đã được đông đảo người tiêu dùng yêu thích. Sản phẩm sử dụng các thành phần nguyên liệu tự nhiên như: bột mì, đường glucose, chất béo thực vật, bột cacao, lúa mì, bột vani, marshmallow… mang đến hương vị bánh thơm ngon, hấp dẫn.' },
      { id: 'c3d4e5f6-3333-4444-5555-666677778888', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764063288/c%C3%A0_ph%C3%AA_g7_t3k7j6.avif', price: 120000, quantity: '200 gói', name: 'Cà phê hòa tan G7 3in1 túi 800g', description: 'Chiết xuất trực tiếp từ những hạt cà phê sạch, thuần khiết từ vùng đất đỏ bazan huyền thoại Buôn Ma Thuột kết hợp với công nghệ rang và trung tâm điều khiển tại Đức, Trung Nguyên đã tạo ra một loại cà phê hòa tan thứ thiệt thơm lừng, tuyệt ngon. Cà phê hòa tan 3in1 G7 đem đến cho bạn một món đồ uống ngon với vị đắng gắt, mùi thơm dịu nhẹ pha lẫn hương vị đậm đà.' },
      { id: 'd4e5f6a7-4444-5555-6666-777788889999', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764063391/tr%C3%A0_l%C3%A0i_th%C3%A1i_nguy%C3%AAn_v2sknm.png', price: 30000, quantity: '400 gói', name: 'Trà lài thái nguyên', description: 'Trà chất lượng cao, dễ pha.' },
      { id: 'e5f6a7b8-5555-6666-7777-888899990000', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764063448/k%E1%BA%B9o_h%C6%B0%C6%A1ng_v%E1%BB%8B_tr%C3%A1i_c%C3%A2y_mjrfkx.jpg', price: 18000, quantity: '800 gói', name: 'Kẹo hương trái cây', description: 'Nhiều vị, phù hợp cả trẻ em.' },
    ]
  },
  {
    name: 'Thực phẩm khô, gia vị',
    products: [
      { id: 'f6a7b8c9-6666-7777-8888-999900001111', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764064556/m%C3%AC_h%E1%BA%A3o_h%E1%BA%A3o_na4gen.avif', price: 10000, quantity: '200 gói', name: 'Mì hảo hảo tôm chua cay', description: 'Mì hảo hảo tôm chua cay, cơ sở tốt, cơ sở tốt, cơ sở tốt.' },
      { id: '07b8c9d0-7777-8888-9999-000011112222', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764064678/ph%E1%BB%9F_%C4%91%E1%BB%87_nh%E1%BA%A5t_acecook_p6wraj.avif', price: 10000, quantity: '300 gói', name: 'Phở đệ nhất Acecook', description: 'Sợi phở Đệ Nhất được làm từ những hạt gạo thơm ngon' },
      { id: '18c9d0e1-8888-9999-0000-111122223333', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764064854/d%E1%BA%A7u_h%C3%A0o_magi_nvsxif.jpg', price: 35000, quantity: '500 chai', name: 'Dầu Hào Magi', description: 'Hỗn hợp gia vị phổ biến cho bữa ăn.' },
      { id: '29d0e1f2-9999-0000-1111-222233334444', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066021/nc_m%E1%BA%AFn_man_ng%C6%B0_lt16vq.jpg', price: 60000, quantity: '150 chai', name: 'Nước Mắm Nam Ngư', description: 'Nước Mắm Nam Ngư, cơ sở tốt, cơ sở tốt, cơ sở tốt.' },
      { id: '3ae1f203-0000-1111-2222-333344445555', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764064081/muoi-ot-tay-ninh-120-g-2-700x467_nsi3kd.jpg', price: 28000, quantity: '400 gói', name: 'Muối ớt Tây Ninh', description: 'Ăn liền, nhâm nhi tiện lợi.' },
    ]
  },
  {
    name: 'Chăm sóc cá nhân',
    products: [
      { id: '4bf2a314-1111-2222-3333-444455556666', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066485/s%E1%BB%ADa_r%E1%BB%ADa_m%E1%BA%B7t_accness_ldujfq.png', price: 70000, quantity: '200 cái', name: 'Kem rửa mặt ngừa mụn Acnes Creamy Wash Rohto (100g)', description: 'Làm sạch nhẹ nhàng, không gây khô da.' },
      { id: '5c3d4e25-2222-3333-4444-555566667777', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066570/d%E1%BA%A7u_g%E1%BB%99i_%C4%91%E1%BA%A7u_sunsilk_mtzqma.avif', price: 85000, quantity: '300 cái', name: 'Dầu gội đầu Sunshilk', description: 'Giữ độ ẩm cho tóc, mượt mà.' },
      { id: '6d84f536-3333-4444-5555-666677778888', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066620/kem_%C4%91%C3%A1nh_r%C4%83ng_colgate_ib5rtn.avif', price: 40000, quantity: '500 cái', name: 'Kem đánh răng Colgate', description: 'Sản phẩm chăm sóc răng miệng hàng ngày, được thiết kế để bảo vệ răng khỏi sâu răng và mang lại hơi thở thơm mát' },
      { id: '7e115647-4444-5555-6666-777788889999', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066695/bvs_diana_sensei_mboxcz.avif', price: 45000, quantity: '120 chiếc', name: 'Băng vệ sinh Diana Sensei', description: ' Sản phẩm thiết kế Smart-Fit tự động nâng lên, ôm theo cơ thể giúp thấm ngay chất dịch và ngăn thấm lan, khô thoáng tức thì.' },
      { id: '8f1a6758-5555-6666-7777-888899990000', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066369/ddvs-d%E1%BA%A1_h%C6%B0%C6%A1ng_wh7nwo.jpg', price: 40000, quantity: '400 chai', name: 'Dung dịch vệ sinh phụ nữ Dạ Hương trà xanh khử mùi (Chai 100ml)', description: 'dung dịch vệ sinh phụ nữ Dạ Hương trà xanh làm sạch, ngăn mùi suốt 24h' },
    ]
  },
  {
    name: 'Sữa và Sản phẩm từ sữa',
    products: [
      { id: '9a1b7869-6666-7777-8888-999900001111', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066893/s%E1%BB%AFa_fami_ye3trn.avif', price: 15000, quantity: '800 hộp', name: 'Sữa Fami', description: 'Sữa đậu nành FAMI nguyên chất ít đường là thức uống dinh dưỡng quen thuộc.' },
      { id: 'ab1a8970-7777-8888-9999-000011112222', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764066989/s%E1%BB%AFa_ensure_keqaux.avif', price: 55000, quantity: '600 chai', name: 'Thực phẩm dinh dưỡng y học ENSURE hương vani', description: 'Thực phẩm dinh dưỡng y học Ensure hương vani là sản phẩm bổ sung dinh dưỡng cân đối giúp tăng cường sức khỏe cho người lớn tuổi. Sản phẩm sữa nước pha sẵn tiện lợi, thơm ngon, dễ dàng sử dụng, đồng thời vẫn giữ nguyên hàm lượng dinh dưỡng như sữa bột.' },
      { id: 'b1a2c3d4-0000-1111-2222-333344445555', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764067051/s%E1%BB%ADa_th_true_milk_t9rv5u.avif', price: 12000, quantity: '300 hộp', name: 'STTT Nguyên Chất TH true MILK', description: 'Sữa tươi tiệt trùng nguyên chất TH True MILK với thành phần và hương liệu tự nhiên đem đến hương vị thơm ngon cũng như cung cấp các dưỡng chất thiết yếu cho sự phát triển trí lực và thể chất của cả gia đình.' },
      { id: 'c10a1b82-8888-9999-0000-111122223333', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764067137/s%E1%BB%AFa_t%C6%B0%C6%A1i_vinamilk_lnn3b0.avif', price: 12000, quantity: '400 hộp', name: 'Sữa Sữa tươi tiệt trùng VINAMILK giảm béo vị chuối hộp 180ml', description: 'Sữa tươi tiệt trùng VINAMILK giảm béo vị chuối là một thức uống dinh dưỡng độc đáo, mang đến sự kết hợp hoàn hảo giữa vị tươi ngon của sữa tươi và hương vị chuối tự nhiên thơm lưng' },
      { id: 'd21a2b93-9999-0000-1111-222233334444', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764067286/sua_milo_hop_180ml_a78qtx.jpg', price: 12000, quantity: '200 hộp', name: 'Sữa Mlio', description: 'thức uống có lợi cho sức khỏe với thành phần nhiều chất dinh dưỡng, giúp cung cấp dưỡng chất cân bằng, luôn tràn đầy năng lượng và khỏe mạnh.' },
    ]
  },
  // 'Hóa phẩm và giấy' category removed per request
];

export const CATEGORIES = categories;

export const ProductList: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {

  // Lấy từ khoá tìm kiếm và industry từ URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const rawInitialIndustry = searchParams.get('industry') || 'Tất cả';
  const availableCategories = categories.map(c => c.name);
  const initialIndustry = availableCategories.includes(rawInitialIndustry) ? rawInitialIndustry : 'Tất cả';
  const [selectedCategory, setSelectedCategory] = React.useState(initialIndustry);

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

  // Nếu người dùng đã chọn 1 ngành cụ thể, chỉ hiển thị sản phẩm thuộc ngành đó
  const productsForSelectedCategory = selectedCategory === 'Tất cả'
    ? allProducts
    : (filteredCategories.find(cat => cat.name === selectedCategory)?.products || []).map(p => ({ ...p, category: selectedCategory }));

  return (
    <div className="bg-app min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <SearchBar />
        </div>
        <ProductCategoryTabs onSelect={setSelectedCategory} selected={selectedCategory} />
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
            {productsForSelectedCategory.map((product, idx) => (
              <ProductCard key={idx} {...product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductCategoryTabs from '../components/ProductCategoryTabs';
import SearchBar from '../components/SearchBar';
import apiClient from '../services/apiClient';

// Danh mục cố định - khớp với ProductCategoryTabs và AddProduct
const FIXED_CATEGORIES = [
  'Bia, nước giải khát',
  'Bánh kẹo, trà, cà phê',
  'Gói mì, gói phở',
  'Thực phẩm khô, gia vị',
  'Chăm sóc cá nhân',
  'Sữa và Sản phẩm từ sữa'
];

interface Product {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  category?: string;
  referencePrice: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Thêm các trường để tương thích với UI cũ
  image: string;
  price: number;
  quantity: string;
  sellerProfileId?: string;
  sellerName?: string;
}

interface CategoryData {
  name: string;
  products: Product[];
}

export const ProductList: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy từ khoá tìm kiếm và industry từ URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const rawInitialIndustry = searchParams.get('industry') || 'Tất cả';
  const initialIndustry = FIXED_CATEGORIES.includes(rawInitialIndustry) ? rawInitialIndustry : 'Tất cả';
  const [selectedCategory, setSelectedCategory] = React.useState(initialIndustry);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call GET /Products API
        const response = await apiClient.client.get('/Products');
        const data = response?.data?.data ?? response?.data;

        // Filter only active products
        const activeProducts: Product[] = (Array.isArray(data) ? data : [])
          .filter((p: any) => p.isActive === true)
          .map((p: any) => ({
            // Normalize id from various possible shapes returned by backend or legacy data
            id: String(p.id ?? p.Id ?? p.productId ?? p.productID ?? p._id ?? (p.product && (p.product.id || p.product.productId)) ?? ''),
            name: p.name,
            description: p.description || 'Không có mô tả',
            imagePath: p.imagePath,
            category: p.category || 'Khác',
            referencePrice: p.referencePrice,
            stockQuantity: p.stockQuantity,
            isActive: p.isActive,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            // Map to old format for compatibility
            image: p.imagePath || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
            price: p.referencePrice,
            quantity: `${p.stockQuantity} cái`,
            // Seller information (backend provides sellerProfileId / sellerId)
            sellerProfileId: p.sellerProfileId || p.sellerId || undefined,
            sellerName: p.sellerName || (p.seller && (p.seller.companyName || p.seller.name)) || undefined
          }));

        setAllProducts(activeProducts);
        // If some products have sellerProfileId but no sellerName, try to fetch seller display names
        const idsToResolve = Array.from(new Set(activeProducts
          .filter(p => (p.sellerProfileId || p.sellerName) && !p.sellerName)
          .map(p => p.sellerProfileId)
          .filter(Boolean) as string[]));

        if (idsToResolve.length > 0) {
          try {
            const sellerFetches = idsToResolve.map(id =>
              apiClient.client.get(`/Profile/${id}`).then(resp => ({ id, data: resp?.data?.data ?? resp?.data })).catch(() => ({ id, data: null }))
            );
            const sellers = await Promise.all(sellerFetches);
            const nameById: Record<string, string> = {};
            sellers.forEach(s => {
              const d = s.data;
              if (d) {
                nameById[s.id] = d.companyName || d.CompanyName || d.contactName || d.ContactName || d.fullName || d.name || '';
              }
            });

            if (Object.keys(nameById).length > 0) {
              const merged = activeProducts.map(p => ({ ...p, sellerName: p.sellerName || (p.sellerProfileId ? nameById[p.sellerProfileId] : undefined) }));
              setAllProducts(merged);
            }
          } catch (e) {
            // swallow - optional enhancement, not required for baseline functionality
            console.warn('Could not resolve seller names:', e);
          }
        }
        console.log('✅ Loaded', activeProducts.length, 'active products from API');
      } catch (err: any) {
        console.error('❌ Failed to fetch products:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại.');
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Hàm loại bỏ dấu tiếng Việt
  function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Group products by category
  const categories: CategoryData[] = FIXED_CATEGORIES.map(catName => ({
    name: catName,
    products: allProducts.filter(p => p.category === catName)
  })).filter(cat => cat.products.length > 0);

  // Nếu có từ khoá tìm kiếm, lọc sản phẩm
  let filteredCategories = categories;
  if (searchQuery) {
    const normalizedQuery = removeAccents(searchQuery).trim();
    filteredCategories = categories
      .map(cat => {
        const filteredProducts = cat.products.filter(product => {
          const name = removeAccents(product.name?.toLowerCase() || '');
          const desc = removeAccents(product.description?.toLowerCase() || '');
          return (
            name.includes(normalizedQuery) ||
            desc.includes(normalizedQuery)
          );
        });
        return filteredProducts.length > 0 ? { ...cat, products: filteredProducts } : null;
      })
      .filter(Boolean) as CategoryData[];
  }

  // Lấy tất cả sản phẩm từ các danh mục đã lọc
  const allFilteredProducts = filteredCategories.flatMap(cat =>
    cat.products.map(p => ({ ...p, category: cat.name }))
  );

  // Nếu người dùng đã chọn 1 ngành cụ thể, chỉ hiển thị sản phẩm thuộc ngành đó
  const productsForSelectedCategory = selectedCategory === 'Tất cả'
    ? allFilteredProducts
    : (filteredCategories.find(cat => cat.name === selectedCategory)?.products || []).map(p => ({ ...p, category: selectedCategory }));

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Search Section - More compact */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
              🛒 Khám phá hàng nghìn sản phẩm chất lượng
            </h1>
            <p className="text-white/90 text-center mb-4 text-sm md:text-base">
              Tìm kiếm và mua sắm dễ dàng với giá tốt nhất thị trường
            </p>
            <SearchBar />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <ProductCategoryTabs onSelect={setSelectedCategory} selected={selectedCategory} />
        </div>

        {/* Category Header */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold">
              {selectedCategory === 'Tất cả' ? '🏪' : '📦'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedCategory === 'Tất cả'
                  ? `${allFilteredProducts.length} sản phẩm có sẵn`
                  : `${productsForSelectedCategory.length} sản phẩm`
                }
              </p>
            </div>
          </div>
          <div className="hidden md:block text-sm text-gray-500">
            💡 Nhấn vào sản phẩm để xem chi tiết
          </div>
        </div>

        {/* Products Display */}
        {selectedCategory === 'Tất cả' && allFilteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🔎</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-4">Không có sản phẩm nào khớp với "{searchQuery || ''}".</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  try {
                    const u = new URL(window.location.href);
                    u.searchParams.delete('search');
                    window.history.replaceState({}, '', u.toString());
                    window.location.reload();
                  } catch (e) {
                    window.location.href = window.location.pathname;
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Xóa tìm kiếm
              </button>
              <button
                onClick={() => setSelectedCategory('Tất cả')}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:shadow"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          </div>
        )}

        {selectedCategory === 'Tất cả' && allFilteredProducts.length > 0 && (
          <div className="space-y-10">
            {filteredCategories.map((category, categoryIdx) => (
              <div key={category.name} className="animate-fade-in" style={{ animationDelay: `${categoryIdx * 0.1}s` }}>
                {/* Category Title Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 mb-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <span className="text-2xl">
                          {categoryIdx === 0 ? '🍺' : categoryIdx === 1 ? '🍪' : categoryIdx === 2 ? '🍜' : categoryIdx === 3 ? '🧴' : '🥛'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{category.name}</h2>
                        <p className="text-white/80 text-sm">{category.products.length} sản phẩm</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                </div>

                {/* Products Grid - Larger cards with fewer columns */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {category.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="transform hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <ProductCard {...product} onAddToCart={addToCart} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCategory !== 'Tất cả' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {productsForSelectedCategory.map((product, idx) => (
                <div
                  key={idx}
                  className="transform hover:scale-105 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <ProductCard {...product} onAddToCart={addToCart} />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {productsForSelectedCategory.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-4">Thử tìm kiếm với từ khóa khác</p>
                <button
                  onClick={() => setSelectedCategory('Tất cả')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-center shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            🎉 Chưa tìm được sản phẩm phù hợp?
          </h3>
          <p className="text-white/90 mb-6">
            Liên hệ với chúng tôi để được tư vấn và báo giá sản phẩm theo nhu cầu
          </p>
          <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all">
            📞 Liên hệ ngay
          </button>
        </div>
      </div>
    </div>
      );
};  
export default ProductList;


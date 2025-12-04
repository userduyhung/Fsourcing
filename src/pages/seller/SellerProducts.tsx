import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Grid,
  List,
  Eye,
  EyeOff,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useApiToast } from '../../hooks/useApiToast';
import apiClient from '../../services/apiClient';
import { logger } from '../../utils/logger';

// Backend ProductDto interface
interface Product {
  id: string;
  sellerProfileId?: string;
  name: string;
  description?: string;
  imagePath?: string | null;  // Backend uses imagePath, not image
  category?: string;
  referencePrice: number;     // Backend uses referencePrice, not price
  stockQuantity: number;      // Backend uses stockQuantity, not quantity
  isActive: boolean;          // Backend uses isActive
  createdAt: string;
  updatedAt: string;
}

const SellerProducts: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInactive, setShowInactive] = useState<boolean>(false); // Toggle to show/hide inactive products


  useEffect(() => {
    // Debug: Check authentication
    const buyerToken = localStorage.getItem('buyerToken');
    const sellerToken = localStorage.getItem('sellerToken');
    const token = buyerToken || sellerToken || localStorage.getItem('token');
    console.log('🔑 Authentication status:', {
      hasToken: !!token,
      tokenType: buyerToken ? 'buyer' : sellerToken ? 'seller' : 'generic',
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    fetchProducts();
    
    const onProductsUpdated = () => fetchProducts();
    window.addEventListener('sellerProductsUpdated', onProductsUpdated as EventListener);

    // Track seller profile completion
    try {
      const sp = localStorage.getItem('sellerProfile');
      const parsed = sp ? JSON.parse(sp) : null;
      const completed = !!(parsed && (parsed.companyName || parsed.company || parsed.fullName));
      localStorage.setItem('sellerProfileCompleted', completed ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('sellerProfileCompleted', { detail: { completed } }));
    } catch (e) {
      localStorage.setItem('sellerProfileCompleted', 'false');
    }

    return () => {
      window.removeEventListener('sellerProductsUpdated', onProductsUpdated as EventListener);
    };
  }, []);

  // Refetch when showInactive changes
  useEffect(() => {
    fetchProducts();
  }, [showInactive]);

  // Filter products when search query or filter status changes
  useEffect(() => {
    let filtered = [...products];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => 
        filterStatus === 'active' ? p.isActive === true : p.isActive === false
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterStatus]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching products from API...');
      
      // ✅ Step 1: Get seller profile ID from backend using Bearer token
      // Backend's /Profile endpoint returns seller profile with 'id' field (sellerProfileId)
      let sellerProfileId: string | null = null;
      
      try {
        const profileResp = await apiClient.client.get('/Profile');
        const profileData = profileResp?.data?.data ?? profileResp?.data;
        
        if (profileData?.id) {
          sellerProfileId = profileData.id;
          console.log('✅ Got sellerProfileId from Profile API:', sellerProfileId);
        } else {
          console.error('❌ Profile API did not return id field:', profileData);
          showError('Không thể lấy thông tin seller profile. Vui lòng thử lại.');
          setProducts([]);
          setLoading(false);
          return;
        }
      } catch (profileError: any) {
        console.error('❌ Failed to fetch seller profile:', profileError);
        showError('Không thể kết nối API. Vui lòng kiểm tra token hoặc đăng nhập lại.');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // ✅ Step 2: Fetch products filtered by sellerProfileId
      const params: any = { sellerId: sellerProfileId };
      
      const resp = await apiClient.client.get('/Products', { params });
      console.log('✅ Products API response:', {
        status: resp.status,
        dataType: typeof resp.data,
        isArray: Array.isArray(resp.data)
      });
      
      // Extract array from response - backend returns {success: true, data: [...]}
      let rawData: any[] = [];
      if (Array.isArray(resp.data)) {
        rawData = resp.data;
      } else if (resp?.data?.data && Array.isArray(resp.data.data)) {
        rawData = resp.data.data;
      } else if (resp?.data?.items && Array.isArray(resp.data.items)) {
        rawData = resp.data.items;
      }
      
      console.log(`📦 Fetched ${rawData.length} products`);
      
      // Transform backend ProductDto to FE Product format
      const items: Product[] = rawData
        .filter((p: any) => p && p.id)
        .map((p: any) => ({
          id: p.id,
          sellerProfileId: p.sellerProfileId || p.sellerId,
          name: p.name,
          description: p.description,
          imagePath: p.imagePath || p.image || null,
          category: p.category,
          referencePrice: p.referencePrice || p.price || 0,
          stockQuantity: p.stockQuantity || p.quantity || 0,
          isActive: p.isActive !== undefined ? p.isActive : true,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }));
      
      // Apply frontend filter based on showInactive toggle
      const displayItems = showInactive 
        ? items 
        : items.filter((p: Product) => p.isActive);
      
      console.log('✅ Displaying', displayItems.length, 'products');
      
      setProducts(displayItems);
      logger.debug('SellerProducts', 'products loaded from API', { count: displayItems.length });
    } catch (err: any) {
      console.error('❌ Failed to fetch products:', err);
      logger.error('SellerProducts', 'failed to fetch products', err);
      showError('Không thể tải sản phẩm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string | number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);

    try {
      console.log('🗑️ Deleting product:', deleteId);
      logger.debug('SellerProducts', 'deleting product', { productId: deleteId });
      
      const response = await apiClient.client.delete(`/Products/${deleteId}`);
      console.log('✅ Delete response:', response.status, response.data);
      
      // Backend returns 204 No Content on success
      if (response.status === 204 || response.status === 200) {
        setProducts(prev => prev.filter(p => p.id !== deleteId));
        showSuccess('✅ Xóa sản phẩm thành công!');
        logger.info('SellerProducts', 'product deleted successfully', { productId: deleteId });

        try {
          window.dispatchEvent(new CustomEvent('sellerProductsUpdated', { 
            detail: { deletedId: deleteId } 
          }));
        } catch (e) {
          window.dispatchEvent(new Event('sellerProductsUpdated'));
        }

        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (err: any) {
      console.error('❌ Failed to delete product:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      logger.error('SellerProducts', 'failed to delete product', { productId: deleteId, error: err });
      
      const errorMsg = err.response?.status === 401 
        ? '❌ Bạn cần đăng nhập để xóa sản phẩm'
        : err.response?.status === 403
        ? '❌ Bạn không có quyền xóa sản phẩm này'
        : err.response?.status === 404
        ? '❌ Không tìm thấy sản phẩm'
        : '❌ Xóa sản phẩm thất bại. Vui lòng thử lại.';
      
      showError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 font-body">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2">Quản Lý Sản Phẩm</h1>
              <p className="text-blue-100">Danh sách {products.length} sản phẩm của bạn</p>
            </div>
            <button
              onClick={() => navigate('/seller/add-product')}
              className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên, mô tả, danh mục..."
                  className="w-full outline-none"
                />
              </div>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 flex-1">
                <Filter className="w-5 h-5 text-gray-400 mr-3" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full outline-none bg-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Đã ẩn</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredProducts.length} / {products.length} sản phẩm
              {searchQuery && ` • Tìm kiếm: "${searchQuery}"`}
              {filterStatus !== 'all' && ` • Lọc: ${filterStatus === 'active' ? 'Đang bán' : 'Đã ẩn'}`}
            </div>
            
            {/* Toggle Show Inactive */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                showInactive 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              {showInactive ? 'Đang hiển thị tất cả' : 'Hiển thị sản phẩm ẩn'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">Tạo sản phẩm đầu tiên để bắt đầu bán hàng</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/seller/add-product')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-xl transition-all font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm sản phẩm
              </button>
              <button
                onClick={() => navigate('/seller/profile')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-xl transition-all font-bold"
              >
                Hoàn thiện hồ sơ
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {product.imagePath ? (
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.placeholder-content')) {
                          parent.innerHTML = `
                            <div class="placeholder-content flex flex-col items-center justify-center h-full">
                              <svg class="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-gray-500 text-sm font-medium">Chưa có hình ảnh</p>
                            </div>
                          `;
                        }
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm font-medium">Chưa có hình ảnh</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm ${
                        product.isActive
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}
                    >
                      {product.isActive ? (
                        <>
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          Đang bán
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Đã ẩn
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  {product.category && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Tag className="w-4 h-4 mr-1" />
                      {product.category}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description || 'Không có mô tả'}
                  </p>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Giá tham khảo</p>
                      <p className="text-xl font-bold text-blue-600 flex items-center gap-1">
                        {(Number(product.referencePrice) || 0).toLocaleString('vi-VN')}
                        <span className="text-base">₫</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Kho hàng</p>
                      <div className="flex items-center justify-end gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Package className="w-4 h-4 text-gray-600" />
                        <p className="text-lg font-bold text-gray-900">
                          {product.stockQuantity || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/seller/edit-product/${product.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => confirmDelete(product.id)}
                      className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && filteredProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Hình ảnh</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Tên sản phẩm</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Danh mục</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Số lượng</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Giá tiền</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Trạng thái</th>
                  <th className="p-4 text-left text-sm font-bold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {product.imagePath ? (
                          <img
                            src={product.imagePath}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.placeholder-icon')) {
                                parent.innerHTML = `
                                  <div class="placeholder-icon flex items-center justify-center h-full">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {product.description || 'Không có mô tả'}
                      </p>
                    </td>
                    <td className="p-4">
                      {product.category && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="w-4 h-4 mr-1" />
                          {product.category}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{product.stockQuantity || 0}</td>
                    <td className="p-4">
                      <div className="flex items-center text-blue-600 font-bold gap-1">
                        {(Number(product.referencePrice) || 0).toLocaleString('vi-VN')}
                        <span className="text-sm">₫</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md ${
                          product.isActive
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Đang bán
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Đã ẩn
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/seller/edit-product/${product.id}`}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Link>
                        <button
                          onClick={() => confirmDelete(product.id)}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;

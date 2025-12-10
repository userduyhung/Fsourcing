import axiosClient from './axiosClient';

/**
 * Product Service - Handles product-related API calls
 * Based on BE: ProductsController.cs
 */

// ==================== INTERFACES ====================

export interface ProductDto {
  id: string;
  sellerId?: string;
  sellerProfileId?: string;
  name: string;
  description?: string;
  price?: number;
  referencePrice?: number;
  category?: string;
  image?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  stockQuantity?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  referencePrice: number;
  category: string;
  imagePath?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  referencePrice?: number;
  category?: string;
  imagePath?: string;
  isActive?: boolean;
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: ProductDto[];
  totalCount: number;
  filters?: any;
  timestamp: string;
}

// ==================== PRODUCT SERVICE ====================

class ProductService {
  /**
   * Get all products with optional filtering
   * GET /api/Products
   */
  async getProducts(category?: string, sellerId?: string): Promise<ProductDto[]> {
    const params: any = {};
    if (category) params.category = category;
    if (sellerId) params.sellerId = sellerId;

    const response = await axiosClient.get('/products', { params });
    return response.data || [];
  }

  /**
   * Get products for current seller
   * GET /api/Products?sellerId=current
   */
  async getMyProducts(): Promise<ProductDto[]> {
    try {
      const response = await axiosClient.get('/products');
      // Filter by current seller or return all if filtering is done on BE
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Get latest products with pagination
   * GET /api/Products/latest
   */
  async getLatestProducts(page: number = 1, pageSize: number = 10): Promise<ProductListResponse> {
    const response = await axiosClient.get('/products/latest', {
      params: { page, pageSize }
    });
    return response.data;
  }

  /**
   * Get product by ID
   * GET /api/Products/{id}
   */
  async getProductById(id: string): Promise<ProductDto> {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  }

  /**
   * Create new product
   * POST /api/Products
   */
  async createProduct(product: CreateProductDto): Promise<ProductDto> {
    const response = await axiosClient.post('/products', product);
    return response.data;
  }

  /**
   * Update product
   * PUT /api/Products/{id}
   */
  async updateProduct(id: string, product: UpdateProductDto): Promise<ProductDto> {
    const response = await axiosClient.put(`/products/${id}`, product);
    return response.data;
  }

  /**
   * Delete product
   * DELETE /api/Products/{id}
   */
  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`/products/${id}`);
  }

  /**
   * Update product inventory
   * PUT /api/Products/{id}/inventory
   */
  async updateInventory(id: string, quantity: number): Promise<void> {
    await axiosClient.put(`/products/${id}/inventory`, { quantity });
  }
}

export const productService = new ProductService();

// Cart API service
// Handles cart operations: get, add, update, delete items
// TEMPORARY: Using localStorage instead of backend API (in-memory DB issue)

import { logger } from '../utils/logger';

// Keep these for future use when backend is ready
// During development prefer relative '/api' so Vite dev proxy handles requests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = (function() {
  try {
    const win = window as any;
    if (win && win.__API_BASE) return win.__API_BASE;
    if (win && win.__ENV && win.__ENV.VITE_API_BASE) return win.__ENV.VITE_API_BASE;
  } catch (e) {}
  return import.meta.env.VITE_API_BASE || '/api';
})();

// GUID validation helper
function isValidGuid(id: string): boolean {
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(id);
}

function getAuthToken(): string | null {
  const buyerToken = localStorage.getItem('buyerToken');
  const sellerToken = localStorage.getItem('sellerToken');
  const token = localStorage.getItem('token');
  
  const selectedToken = buyerToken || sellerToken || token || null;
  
  // Decode token payload to check expiry (concise logs)
  if (selectedToken) {
    try {
      const parts = selectedToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp ? (payload.exp * 1000 < Date.now()) : false;
        logger.debug('CartService', 'token payload', { userId: payload.sub || payload.userId || payload.nameid || payload.id || null, isExpired });
        if (isExpired) {
          logger.warn('CartService', 'token expired - clearing tokens');
          localStorage.removeItem('buyerToken');
          localStorage.removeItem('sellerToken');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return null;
        }
      }
    } catch (e) {
      logger.error('CartService', 'invalid JWT format', e);
    }
  } else {
    logger.debug('CartService', 'no auth token found');
  }
  
  return selectedToken;
}

// Keep these for future use when backend is ready
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleResponse(res: Response) {
  const text = await res.text().catch(() => '');
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status} ${res.statusText}`);
  }
  return data;
}

export interface CartItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  price?: number;
  image?: string;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get current user's cart from backend
 */
export async function getCart(): Promise<Cart> {
  logger.debug('CartService', 'getCart from API');
  
  const token = getAuthToken();
  if (!token) {
    logger.warn('CartService', 'no auth token - returning empty cart');
    localStorage.removeItem('cartId');
    localStorage.removeItem('lastCartUserId');
    return { items: [], totalAmount: 0 };
  }
  
  // Extract userId from token to validate cart ownership
  let currentUserId: string | null = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      currentUserId = payload.sub || payload.userId || payload.nameid || payload.id || null;
    }
  } catch (e) {
    logger.error('CartService', 'failed to decode token', e);
  }
  
  try {
    // Get cartId from localStorage or create new cart
    let cartId = localStorage.getItem('cartId');
    let lastCartUserId = localStorage.getItem('lastCartUserId');
    let needsNewCart = false;
    
    // Check if user has changed
    if (currentUserId && lastCartUserId && currentUserId !== lastCartUserId) {
      logger.warn('CartService', 'user changed, clearing old cart', { 
        oldUserId: lastCartUserId, 
        newUserId: currentUserId 
      });
      localStorage.removeItem('cartId');
      cartId = null;
      needsNewCart = true;
    }
    
    // Verify cart ownership if cartId exists
    if (cartId && currentUserId) {
      try {
        const verifyRes = await fetch(`${API_BASE}/Cart/${cartId}`, {
          method: 'GET',
          headers: getHeaders(),
        });
        
        // If cart doesn't exist or doesn't belong to current user, clear it
        if (verifyRes.status === 404 || verifyRes.status === 403 || verifyRes.status === 400) {
          logger.warn('CartService', 'cached cartId invalid or does not belong to user, clearing');
          localStorage.removeItem('cartId');
          cartId = null;
          needsNewCart = true;
        }
      } catch (e) {
        logger.warn('CartService', 'failed to verify cart ownership', e);
        localStorage.removeItem('cartId');
        cartId = null;
        needsNewCart = true;
      }
    }
    
    if (!cartId) {
      // Create new cart
      const createRes = await fetch(`${API_BASE}/Cart`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const createData = await handleResponse(createRes);
      cartId = createData.data?.id;
      if (cartId) {
        localStorage.setItem('cartId', cartId);
        // Track which user owns this cart
        if (currentUserId) {
          localStorage.setItem('lastCartUserId', currentUserId);
        }
        logger.info('CartService', 'new cart created', { cartId, userId: currentUserId });
      }
    }
    
    if (!cartId) {
      return { items: [], totalAmount: 0 };
    }
    
    // Get cart items
    const res = await fetch(`${API_BASE}/Cart/${cartId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await handleResponse(res);
    const items = data.data || [];
    
    logger.debug('CartService', 'cart retrieved from API', { itemCount: items.length });
    
    // Fetch product details for each cart item
    const itemsWithDetails = await Promise.all(
      items.map(async (item: any) => {
        try {
          const productRes = await fetch(`${API_BASE}/Products/${item.productId}`, {
            method: 'GET',
            headers: getHeaders(),
          });
          
          if (productRes.ok) {
            const productData = await productRes.json();
            const product = productData.data || productData;
            
            logger.debug('CartService', `product data for ${item.productId}`, { 
              name: product.name, 
              image: product.image,
              rawProduct: product
            });
            
            return {
              id: item.id,
              productId: item.productId,
              productName: product.name || product.productName || product.Name || 'Sản phẩm',
              quantity: item.quantity,
              price: item.price || product.price || product.Price || 0,
              image: product.image || product.Image || product.imagePath || product.ImagePath || 'https://via.placeholder.com/150'
            };
          } else {
            logger.warn('CartService', `failed to fetch product ${item.productId}`, { status: productRes.status });
          }
        } catch (err) {
          logger.error('CartService', `error fetching product ${item.productId}`, err);
        }
        
        // Fallback if product fetch fails
        return {
          id: item.id,
          productId: item.productId,
          productName: 'Sản phẩm không xác định',
          quantity: item.quantity,
          price: item.price,
          image: 'https://via.placeholder.com/150'
        };
      })
    );
    
    return {
      id: cartId,
      items: itemsWithDetails,
      totalAmount: itemsWithDetails.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    };
  } catch (error) {
    logger.error('CartService', 'failed to get cart', error);
    return { items: [], totalAmount: 0 };
  }
}

/**
 * Add item to cart using backend API
 */
export async function addCartItem(
  productId: string, 
  quantity = 1,
  productInfo?: { name?: string; price?: number; image?: string }
): Promise<Cart> {
  // Validate productId is a valid GUID
  if (!isValidGuid(productId)) {
    throw new Error(`Invalid product ID format: "${productId}". Expected a valid GUID.`);
  }
  
  logger.debug('CartService', 'addCartItem to API', { productId, quantity });
  
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required to add items to cart');
  }
  
  // Get or create cartId - validation happens in getCart()
  let cartId = localStorage.getItem('cartId');
  let lastCartUserId = localStorage.getItem('lastCartUserId');
  
  // Get current user ID from token
  let currentUserId: string | null = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      currentUserId = payload.sub || payload.userId || payload.nameid || payload.id || null;
    }
  } catch (e) {
    logger.error('CartService', 'failed to decode token', e);
  }
  
  // Check if user has changed
  if (currentUserId && lastCartUserId && currentUserId !== lastCartUserId) {
    logger.warn('CartService', 'user changed, clearing old cart for add item', { 
      oldUserId: lastCartUserId, 
      newUserId: currentUserId 
    });
    localStorage.removeItem('cartId');
    cartId = null;
  }
  
  if (!cartId) {
    const createRes = await fetch(`${API_BASE}/Cart`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const createData = await handleResponse(createRes);
    cartId = createData.data?.id;
    if (cartId) {
      localStorage.setItem('cartId', cartId);
      // Track which user owns this cart
      if (currentUserId) {
        localStorage.setItem('lastCartUserId', currentUserId);
      }
      logger.info('CartService', 'new cart created for add item', { cartId, userId: currentUserId });
    }
  }
  
  if (!cartId) {
    throw new Error('Failed to create cart');
  }
  
  const payload = {
    productId,
    quantity,
    price: productInfo?.price || 0
  };
  
  const res = await fetch(`${API_BASE}/Cart/${cartId}/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  
  await handleResponse(res);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  // Refresh and return cart
  return await getCart();
}

/**
 * Update cart item quantity using backend API
 */
export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  logger.debug('CartService', 'updateCartItem via API', { productId, quantity });
  
  const cartId = localStorage.getItem('cartId');
  if (!cartId) {
    throw new Error('No cart found');
  }
  
  if (quantity <= 0) {
    return await deleteCartItem(productId);
  }
  
  const res = await fetch(`${API_BASE}/Cart/${cartId}/items/${productId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });
  
  await handleResponse(res);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  return await getCart();
}

/**
 * Delete item from cart using backend API
 */
export async function deleteCartItem(productId: string): Promise<Cart> {
  logger.debug('CartService', 'deleteCartItem via API', { productId });
  
  const cartId = localStorage.getItem('cartId');
  if (!cartId) {
    throw new Error('No cart found');
  }
  
  const res = await fetch(`${API_BASE}/Cart/${cartId}/items/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  await handleResponse(res);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  return await getCart();
}

/**
 * Clear entire cart by removing cartId
 */
export async function clearCart(): Promise<void> {
  logger.debug('CartService', 'clearCart');
  
  localStorage.removeItem('cartId');
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
}

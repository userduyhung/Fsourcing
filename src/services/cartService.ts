// Cart API service
// Handles cart operations: get, add, update, delete items
// TEMPORARY: Using localStorage instead of backend API (in-memory DB issue)

import { logger } from '../utils/logger';
import { productsApi } from './apiClient';

// Keep these for future use when backend is ready
// During development prefer relative '/api' so Vite dev proxy handles requests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = (function() {
  try {
    const win = window as any;
    // Priority:
    // 1. window.__API_BASE (explicit runtime override)
    // 2. window.__ENV.VITE_API_BASE_URL (runtime env.js canonical)
    // 3. window.__ENV.VITE_API_BASE (alternate runtime key)
    // 4. build-time import.meta.env values
    if (win && win.__API_BASE) {
      console.info('[CartService] using window.__API_BASE (runtime) ->', win.__API_BASE);
      return win.__API_BASE;
    }
    if (win && win.__ENV && win.__ENV.VITE_API_BASE_URL) {
      console.info('[CartService] using window.__ENV.VITE_API_BASE_URL (runtime) ->', win.__ENV.VITE_API_BASE_URL);
      return win.__ENV.VITE_API_BASE_URL;
    }
    if (win && win.__ENV && win.__ENV.VITE_API_BASE) {
      console.info('[CartService] using window.__ENV.VITE_API_BASE (runtime) ->', win.__ENV.VITE_API_BASE);
      return win.__ENV.VITE_API_BASE;
    }
  } catch (e) {}

  const buildApi = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
  if (buildApi) {
    console.info('[CartService] using build-time API base ->', buildApi);
    return buildApi;
  }

  // If running on the known FE host but no runtime/build env exists, prefer Railway backend
  try {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname.includes('fsourcing.vercel.app')) {
      const fallback = 'https://uni-b2b-fixed-production.up.railway.app/api';
      console.warn('[CartService] No runtime/build API base found - using Railway fallback ->', fallback);
      return fallback;
    }
  } catch (e) {}

  return '/api';
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

  // Try to parse JSON, fall back to raw text if parsing fails
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
  }

  if (!res.ok) {
    // Provide helpful error with body (either parsed JSON or raw text)
    const msg = data?.message || data?.error || text || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
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
    // No auth token: keep guest cart in localStorage as a fallback so refreshing the page
    // doesn't immediately clear the user's cart. We avoid removing `cartId` here because
    // some deployments may rely on anonymous carts or the frontend may store items locally.
    logger.warn('CartService', 'no auth token - attempting guest cart fallback');
    try {
      const raw = localStorage.getItem('guestCart');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          items: parsed.items || [],
          totalAmount: parsed.totalAmount || (parsed.items ? parsed.items.reduce((s: number, it: any) => s + ((it.price || 0) * (it.quantity || 0)), 0) : 0)
        };
      }
    } catch (e) {
      logger.error('CartService', 'failed to parse guestCart', e);
    }

    // If no guest cart found, return empty cart but DO NOT aggressively remove cartId/local markers.
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
          try {
            // Use centralized API client which handles baseURL and auth header
            const productResp: any = await productsApi.get(item.productId);
            // productsApi.get may return the product directly or an envelope; normalize
            const product = (productResp && (productResp.data || productResp)) || productResp;

            logger.debug('CartService', `product data for ${item.productId}`, {
              name: product?.name,
              image: product?.image || product?.imagePath,
              rawProduct: product
            });

            if (product) {
              return {
                id: item.id,
                productId: item.productId,
                productName: product.name || product.productName || product.Name || 'Sản phẩm',
                quantity: item.quantity,
                price: item.price || product.price || product.ReferencePrice || product.Price || 0,
                image: product.image || product.Image || product.imagePath || product.ImagePath || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
              };
            }
          } catch (err: any) {
            // Log that the direct fetch failed
            logger.warn('CartService', `failed to fetch product ${item.productId} directly`, err?.response || err?.message || err);

            // Fallback strategy: fetch product list and try to match by several heuristics.
            try {
              const resp = await fetch(`${API_BASE}/Products`, { method: 'GET', headers: getHeaders() });
              const json = await resp.json().catch(() => null);
              const list = (json && (json.data || json)) || [];

              // Try to find by exact match first
              let found = list.find((p: any) => String(p.id) === String(item.productId) || String(p.Id) === String(item.productId) || String(p.productId) === String(item.productId));

              // Try matching ID without hyphens (some storages remove hyphens)
              if (!found) {
                const compact = String(item.productId).replace(/-/g, '');
                found = list.find((p: any) => String(p.id).replace(/-/g, '') === compact || String(p.Id || '').replace(/-/g, '') === compact);
              }

              // Try match by name as last resort (may generate false positives)
              if (!found) {
                found = list.find((p: any) => {
                  try {
                    return p.name && String(p.name).toLowerCase() === String(item.productName || '').toLowerCase();
                  } catch { return false; }
                });
              }

              if (found) {
                logger.info('CartService', `resolved missing product ${item.productId} via list lookup -> ${found.id || found.Id || found.productId}`);
                return {
                  id: item.id,
                  productId: item.productId,
                  productName: found.name || found.productName || 'Sản phẩm',
                  quantity: item.quantity,
                  price: item.price || found.price || found.referencePrice || found.ReferencePrice || 0,
                  image: found.image || found.imagePath || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
                };
              }
            } catch (listErr) {
              logger.warn('CartService', `fallback product list lookup failed for ${item.productId}`, listErr);
            }

            // If still not found, proceed to fallback return below
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
          image: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
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
  // const token = getAuthToken();
  if (!token) {
    // Guest fallback: persist items locally so unauthenticated users can add and
    // keep cart items across page reloads. This mirrors server-side cart but
    // stores minimal product info until the user logs in.
    logger.warn('CartService', 'no auth token - using guest cart fallback for addCartItem');
    try {
      const raw = localStorage.getItem('guestCart');
      const parsed = raw ? JSON.parse(raw) : { items: [] as any[] };
      const newItem = {
        id: `g_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        productId,
        productName: productInfo?.name || 'Sản phẩm',
        quantity,
        price: productInfo?.price || 0,
        image: productInfo?.image || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
      };
      parsed.items = parsed.items || [];
      parsed.items.push(newItem);
      parsed.totalAmount = parsed.items.reduce((s: number, it: any) => s + ((it.price || 0) * (it.quantity || 0)), 0);
      localStorage.setItem('guestCart', JSON.stringify(parsed));
      window.dispatchEvent(new Event('cartUpdated'));
      return {
        items: parsed.items,
        totalAmount: parsed.totalAmount
      } as Cart;
    } catch (e) {
      logger.error('CartService', 'failed to update guestCart', e);
      throw e;
    }
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
  // Also clear guest cart stored locally so UI shows empty immediately
  localStorage.removeItem('guestCart');
  localStorage.removeItem('lastCartUserId');
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
}

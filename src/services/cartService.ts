// Cart API service
// Handles cart operations: get, add, update, delete items
// TEMPORARY: Using localStorage instead of backend API (in-memory DB issue)

// Keep these for future use when backend is ready
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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
  
  // Debug: decode JWT to check payload and expiry
  if (selectedToken) {
    try {
      const parts = selectedToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔍 JWT Payload:', payload);
        console.log('🔍 User ID claim:', payload.sub || payload.userId || payload.nameid || payload.id || 'NOT FOUND');
        console.log('🔍 Token exp:', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiry');
        
        const isExpired = payload.exp ? (payload.exp * 1000 < Date.now()) : false;
        console.log('🔍 Token expired?', isExpired);
        
        // If token is expired, clear it and return null
        if (isExpired) {
          console.warn('⚠️ Token expired, clearing localStorage and redirecting to login...');
          localStorage.removeItem('buyerToken');
          localStorage.removeItem('sellerToken');
          localStorage.removeItem('token');
          // Redirect to login page
          window.location.href = '/login';
          return null;
        }
      }
    } catch (e) {
      console.error('❌ Invalid JWT format:', e);
    }
  } else {
    console.warn('⚠️ No auth token found in localStorage');
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
 * Get current user's cart
 * TEMPORARY: Using local storage instead of backend API
 */
export async function getCart(): Promise<Cart> {
  console.log('📦 Getting LOCAL cart (API disabled)');
  const existingCartJson = localStorage.getItem('localCart');
  
  if (!existingCartJson) {
    const emptyCart: Cart = { items: [], totalAmount: 0 };
    console.log('✅ No cart found, returning empty cart');
    return emptyCart;
  }
  
  const cart: Cart = JSON.parse(existingCartJson);
  
  // Migration: Check if items have required fields (name, price, image)
  // If any item is missing these fields, clear the cart (old data format)
  const hasInvalidItems = cart.items.some(item => 
    !item.productName && !item.price && !item.image
  );
  
  if (hasInvalidItems) {
    console.warn('⚠️ Found old cart data format without product details. Clearing cart...');
    const emptyCart: Cart = { items: [], totalAmount: 0 };
    localStorage.setItem('localCart', JSON.stringify(emptyCart));
    return emptyCart;
  }
  
  console.log('✅ Local cart retrieved:', cart);
  return cart;
  
  /* ORIGINAL API CODE (DISABLED)
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res);
  */
}

/**
 * Add item to cart
 * TEMPORARY: Using local storage instead of backend API (in-memory DB issue)
 */
export async function addCartItem(
  productId: string, 
  quantity = 1,
  productInfo?: { name?: string; price?: number; image?: string }
): Promise<Cart> {
  // Validate productId is a valid GUID
  if (!isValidGuid(productId)) {
    throw new Error(`Invalid product ID format: "${productId}". Expected a valid GUID (e.g., "3fa85f64-5717-4562-b3fc-2c963f66afa6").`);
  }
  
  console.log('📦 Adding to LOCAL cart (API disabled):', { productId, quantity, productInfo });
  
  // Get existing cart from localStorage
  const existingCartJson = localStorage.getItem('localCart');
  const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalAmount: 0 };
  
  // Check if item already exists
  const existingItemIndex = existingCart.items.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    // Update quantity and merge product info if provided
    existingCart.items[existingItemIndex] = {
      ...existingCart.items[existingItemIndex],
      quantity: existingCart.items[existingItemIndex].quantity + quantity,
      ...(productInfo?.name && { productName: productInfo.name }),
      ...(productInfo?.price !== undefined && { price: productInfo.price }),
      ...(productInfo?.image && { image: productInfo.image }),
    };
  } else {
    // Add new item with all available info
    existingCart.items.push({
      id: `local-${Date.now()}`,
      productId,
      quantity,
      ...(productInfo?.name && { productName: productInfo.name }),
      ...(productInfo?.price !== undefined && { price: productInfo.price }),
      ...(productInfo?.image && { image: productInfo.image }),
    });
  }
  
  // Save back to localStorage
  localStorage.setItem('localCart', JSON.stringify(existingCart));
  console.log('✅ Local cart updated:', existingCart);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  return existingCart;
  
  /* ORIGINAL API CODE (DISABLED)
  const payload = {
    productId,
    quantity,
  };
  
  console.log('📤 Adding to cart:', payload);
  
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.error('❌ Cart API Error:', {
      status: res.status,
      statusText: res.statusText,
      body: errorText
    });
    
    if (errorText.includes('Product not found')) {
      throw new Error(`Product with ID "${productId}" does not exist in backend database. Please ensure products are created in backend first, or fetch products from /api/products endpoint instead of using mock data.`);
    }
    
    throw new Error(errorText || `Request failed: ${res.status} ${res.statusText}`);
  }
  
  return handleResponse(res);
  */
}

/**
 * Update cart item quantity
 * TEMPORARY: Using local storage instead of backend API
 */
export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  console.log('📦 Updating LOCAL cart item (API disabled):', { itemId, quantity });
  
  const existingCartJson = localStorage.getItem('localCart');
  const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalAmount: 0 };
  
  const itemIndex = existingCart.items.findIndex(item => item.id === itemId);
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      existingCart.items.splice(itemIndex, 1);
    } else {
      // Keep all existing fields (name, price, image, etc) and only update quantity
      existingCart.items[itemIndex] = {
        ...existingCart.items[itemIndex],
        quantity
      };
    }
  }
  
  localStorage.setItem('localCart', JSON.stringify(existingCart));
  console.log('✅ Local cart updated:', existingCart);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  return existingCart;
  
  /* ORIGINAL API CODE (DISABLED)
  const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(res);
  */
}

/**
 * Delete item from cart
 * TEMPORARY: Using local storage instead of backend API
 */
export async function deleteCartItem(itemId: string): Promise<Cart> {
  console.log('📦 Deleting from LOCAL cart (API disabled):', itemId);
  
  const existingCartJson = localStorage.getItem('localCart');
  const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalAmount: 0 };
  
  existingCart.items = existingCart.items.filter(item => item.id !== itemId);
  
  localStorage.setItem('localCart', JSON.stringify(existingCart));
  console.log('✅ Local cart updated:', existingCart);
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  return existingCart;
  
  /* ORIGINAL API CODE (DISABLED)
  const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
  */
}

/**
 * Clear entire cart
 * TEMPORARY: Using local storage instead of backend API
 */
export async function clearCart(): Promise<void> {
  console.log('📦 Clearing LOCAL cart (API disabled)');
  
  const emptyCart: Cart = { items: [], totalAmount: 0 };
  localStorage.setItem('localCart', JSON.stringify(emptyCart));
  console.log('✅ Local cart cleared');
  
  // Emit custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
  
  /* ORIGINAL API CODE (DISABLED)
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  await handleResponse(res);
  */
}

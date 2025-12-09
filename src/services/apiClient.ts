import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import createGeneratedApi, { RequestFn } from './api-client.generated';

function getRuntimeApiBase() {
  try {
    const win = window as any;
    if (win && win.__API_BASE) return win.__API_BASE;
    if (win && win.__ENV && win.__ENV.VITE_API_BASE) return win.__ENV.VITE_API_BASE;
  } catch (e) {}
  return import.meta.env.VITE_API_BASE || 'https://uni-b2b-fixed-production.up.railway.app/api';
}

const API_BASE = getRuntimeApiBase();

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically when present in localStorage
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const buyerToken = localStorage.getItem('buyerToken');
    const sellerToken = localStorage.getItem('sellerToken');
    const token = buyerToken || sellerToken || localStorage.getItem('token');
    if (token) {
      // headers type on InternalAxiosRequestConfig is stricter; cast to any for assignment
      (config.headers as any) = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Basic wrapper
async function request(method: 'get' | 'post' | 'put' | 'delete' | 'patch', path: string, data?: any, params?: any) {
  const res = await client.request({
    method,
    url: path,
    data,
    params,
  });
  
  // Backend wraps response in { data: ... }
  // Unwrap if present, otherwise return as-is
  const responseData = res.data;
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
}

// Instantiate generated API wrappers using the request function
const generatedApi = createGeneratedApi(request as RequestFn);

// Auth endpoints
export const authApi = {
  login: (payload: { email: string; password: string }) => generatedApi.auth.login(payload),
  register: (payload: any) => generatedApi.auth.register(payload),
  // fallback endpoints still use the raw request (not present in spec)
  forgotPassword: (payload: { email: string }) => request('post', '/Auth/forgot-password', payload),
  resetPassword: (payload: any) => request('post', '/Auth/reset-password', payload),
  changePassword: (payload: any) => request('put', '/Auth/change-password', payload),
};

// Messages
export const messagesApi = {
  list: () => generatedApi.messages.list(),
  conversation: (conversationId: string) => generatedApi.messages.conversation(conversationId),
  send: (payload: any) => generatedApi.messages.send(payload),
};

// Notifications
export const notificationsApi = {
  unreadCount: () => generatedApi.notifications.unreadCount(),
  list: () => generatedApi.notifications.list(),
  markRead: (id: string) => generatedApi.notifications.markRead(id),
};

// Profile
export const profileApi = {
  get: () => generatedApi.profile.get(),
  update: (payload: any) => generatedApi.profile.update(payload),
  buyerProfile: (payload: any) => generatedApi.profile.buyerProfile(payload),
  sellerProfile: (payload: any) => generatedApi.profile.sellerProfile(payload),
};

// Products & Search
export const productsApi = {
  list: (params?: any) => generatedApi.products.list(params),
  // Create product: if OpenAPI defines POST /products, generatedApi may provide it; otherwise use raw request
  create: (payload: any) => {
    // prefer generated method if exists
    // @ts-ignore
    if (generatedApi.products.create) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return generatedApi.products.create(payload);
    }
    return request('post', '/products', payload);
  },
  latest: () => generatedApi.productsExtra.latest(),
  get: (id: string) => generatedApi.products.get(Number(id)),
  search: (params?: any) => generatedApi.search.products(params),
};

// Cart operations (using cartService)
export { getCart, addCartItem, updateCartItem, deleteCartItem, clearCart } from './cartService';

export default {
  client,
  request,
  authApi,
  messagesApi,
  notificationsApi,
  profileApi,
  productsApi,
};

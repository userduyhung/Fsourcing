import { paths } from './api-types';

type LoginRequest = paths['/auth/login']['post']['requestBody']['content']['application/json'];
type LoginResponse = paths['/auth/login']['post']['responses'][200]['content']['application/json'];

type RegisterRequest = paths['/auth/register']['post']['requestBody']['content']['application/json'];
type RegisterResponse = paths['/auth/register']['post']['responses'][201]['content']['application/json'];

type ProductsListResponse = paths['/products']['get']['responses'][200]['content']['application/json'];
type ProductDetailResponse = paths['/products/{id}']['get']['responses'][200]['content']['application/json'];

export type RequestFn = (method: 'get' | 'post' | 'put' | 'delete' | 'patch', path: string, data?: any, params?: any) => Promise<any>;

export function createGeneratedApi(request: RequestFn) {
  return {
    auth: {
      login: (payload: LoginRequest) => request('post', '/auth/login', payload) as Promise<LoginResponse>,
      register: (payload: RegisterRequest) => request('post', '/auth/register', payload) as Promise<RegisterResponse>,
    },

    products: {
      list: (params?: { q?: string; category?: string }) => request('get', '/products', undefined, params) as Promise<ProductsListResponse>,
      get: (id: number) => request('get', `/products/${id}`) as Promise<ProductDetailResponse>,
    },
    // Non-spec endpoints present in the codebase (typed as any until the OpenAPI is expanded)
    messages: {
      list: () => request('get', '/Messages') as Promise<any>,
      conversation: (conversationId: string) => request('get', `/Messages/conversation/${conversationId}`) as Promise<any>,
      send: (payload: any) => request('post', '/Messages', payload) as Promise<any>,
    },
    notifications: {
      unreadCount: () => request('get', '/Notifications/unread-count') as Promise<any>,
      list: () => request('get', '/Notifications') as Promise<any>,
      markRead: (id: string) => request('put', `/Notifications/${id}/read`) as Promise<any>,
    },
    profile: {
      get: () => request('get', '/Profile') as Promise<any>,
      update: (payload: any) => request('put', '/Profile', payload) as Promise<any>,
      buyerProfile: (payload: any) => request('post', '/Profile/buyer', payload) as Promise<any>,
      sellerProfile: (payload: any) => request('post', '/Profile/seller', payload) as Promise<any>,
    },
    // Additional product/search endpoints not present in the OpenAPI file
    search: {
      products: (params?: any) => request('get', '/Search/products', undefined, params) as Promise<any>,
    },
    productsExtra: {
      latest: () => request('get', '/Products/latest') as Promise<any>,
    },
    // Additional auth helpers (forgot/reset/change password)
    authExtra: {
      forgotPassword: (payload: { email: string }) => request('post', '/Auth/forgot-password', payload) as Promise<any>,
      resetPassword: (payload: any) => request('post', '/Auth/reset-password', payload) as Promise<any>,
      changePassword: (payload: any) => request('put', '/Auth/change-password', payload) as Promise<any>,
    },
  };
}

export default createGeneratedApi;

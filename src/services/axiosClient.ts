import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';

// Tạo axios instance với config mặc định
const axiosClient = axios.create({
  // Prefer explicit env var when provided. During development use relative '/api' so Vite dev-server proxy handles requests
  // This avoids direct calls to http://localhost:5000 which may be blocked by browser extensions or CORS issues.
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout
});

// Request Interceptor: Tự động gắn token vào mọi request
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token dựa vào URL để xác định đúng role
    let token: string | null = null;
    
    // Nếu request đến admin endpoints, ưu tiên adminToken
    if (config.url?.includes('/admin')) {
      token = localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
    }
    // Nếu request đến seller endpoints, ưu tiên sellerToken
    else if (config.url?.includes('/orders/received') || config.url?.includes('/seller')) {
      token = localStorage.getItem('sellerToken') || localStorage.getItem('authToken');
    } 
    // Nếu request đến buyer endpoints, ưu tiên buyerToken
    else if (config.url?.includes('/buyer') || config.url?.includes('/cart') || config.url?.includes('/checkout')) {
      token = localStorage.getItem('buyerToken') || localStorage.getItem('authToken');
    }
    // Fallback: lấy token theo thứ tự ưu tiên
    else {
      token = localStorage.getItem('authToken')
        || localStorage.getItem('token')
        || localStorage.getItem('buyerToken') 
        || localStorage.getItem('sellerToken')
        || localStorage.getItem('adminToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request
    logger.info('AxiosClient', `📡 ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      body: config.data,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE',
      tokenSource: token === localStorage.getItem('adminToken') ? 'adminToken' :
                   token === localStorage.getItem('sellerToken') ? 'sellerToken' :
                   token === localStorage.getItem('buyerToken') ? 'buyerToken' :
                   token === localStorage.getItem('token') ? 'token' : 'authToken'
    });
    
    return config;
  },
  (error) => {
    logger.error('AxiosClient', '❌ Request Error', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý response và lỗi tự động
axiosClient.interceptors.response.use(
  (response) => {
    // Log success response
    logger.info('AxiosClient', `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    // Xử lý 204 No Content - trả về empty array cho list endpoints
    if (response.status === 204) {
      logger.info('AxiosClient', '📭 204 No Content - returning empty result');
      return {
        ...response,
        data: {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
            hasItems: false
          }
        }
      };
    }
    
    // KHÔNG unwrap response.data - giữ nguyên structure từ backend
    // Backend trả về: { success: true, data: { items: [...] } }
    // OrderList expect: response.data.items
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const responseData: any = error.response?.data;

    logger.error('AxiosClient', `❌ ${status} ${method} ${url}`, {
      status,
      error: responseData,
      message: error.message
    });

    // Xử lý các lỗi HTTP phổ biến
    let errorMessage = 'Unknown error';
    
    if (status === 400) {
      // Validation errors
      if (responseData?.errors) {
        const validationErrors = Object.entries(responseData.errors)
          .map(([field, messages]) => `  - ${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        errorMessage = `Validation Error (400):\n${validationErrors}`;
      } else {
        errorMessage = responseData?.title || responseData?.message || 'Bad Request';
      }
    } else if (status === 401) {
      errorMessage = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
      // Optional: Auto logout
      // localStorage.clear();
      // window.location.href = '/buyer/login';
    } else if (status === 403) {
      errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
    } else if (status === 404) {
      errorMessage = `Endpoint không tồn tại: ${url}`;
    } else if (status === 500) {
      errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc backend có đang chạy không.';
    } else {
      errorMessage = responseData?.message || responseData?.title || error.message;
    }

    // Throw error với message rõ ràng
    const customError = new Error(errorMessage);
    (customError as any).status = status;
    (customError as any).response = responseData;
    
    return Promise.reject(customError);
  }
);

export default axiosClient;

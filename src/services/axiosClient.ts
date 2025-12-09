import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';

// Resolve API base at runtime. Priority (highest -> lowest):
// 1. `window.__API_BASE` (injected by host at runtime via /env.js)
// 2. `window.__ENV.VITE_API_BASE_URL` or `window.__ENV.VITE_API_BASE` (runtime object)
// 3. `VITE_LOCAL_BACKEND` (runtime or build-time) when on localhost (optional direct local BE)
// 4. `import.meta.env.VITE_API_BASE_URL` or `import.meta.env.VITE_API_BASE` (build-time)
// 5. '/api' when running on localhost to let Vite proxy handle CORS
// 6. Production fallback for known FE host -> Railway backend
// 7. Final fallback: '/api'
function getRuntimeApiBase() {
  // If running in the browser on localhost, allow an explicit local backend
  // override (VITE_LOCAL_BACKEND) but otherwise force the relative `/api`
  // so the Vite dev server proxy forwards requests to the backend and
  // prevents CORS issues.
  try {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') {
        const win = window as any;
        // 1) Runtime local override (served by /env.js during dev if desired)
        if (win?.__ENV?.VITE_LOCAL_BACKEND) {
          // eslint-disable-next-line no-console
          console.info('[RuntimeAPI] Detected localhost - using runtime VITE_LOCAL_BACKEND ->', win.__ENV.VITE_LOCAL_BACKEND);
          return win.__ENV.VITE_LOCAL_BACKEND;
        }

        // 2) Build-time local override
        if (import.meta.env.VITE_LOCAL_BACKEND) {
          // eslint-disable-next-line no-console
          console.info('[RuntimeAPI] Detected localhost - using build VITE_LOCAL_BACKEND ->', import.meta.env.VITE_LOCAL_BACKEND);
          return import.meta.env.VITE_LOCAL_BACKEND;
        }

        // 3) Default to proxy
        // eslint-disable-next-line no-console
        console.info('[RuntimeAPI] Detected localhost - forcing /api to use dev proxy');
        return '/api';
      }
    }
  } catch (e) {
    // ignore
  }

  let resolved: string | undefined;
  let reason = '';

  try {
    const win = typeof window !== 'undefined' ? (window as any) : undefined;

    // 1) Explicit runtime override via /env.js
    if (win?.__API_BASE) {
      resolved = win.__API_BASE;
      reason = 'window.__API_BASE (runtime)';
    }

    // 2) Vite-style runtime env object
    if (!resolved && win?.__ENV?.VITE_API_BASE_URL) {
      resolved = win.__ENV.VITE_API_BASE_URL;
      reason = 'window.__ENV.VITE_API_BASE_URL (runtime)';
    }
    if (!resolved && win?.__ENV?.VITE_API_BASE) {
      resolved = win.__ENV.VITE_API_BASE;
      reason = 'window.__ENV.VITE_API_BASE (runtime)';
    }

    // 3) Runtime local backend override (only applied on localhost)
    const hostname = win?.location?.hostname || '';
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && win?.__ENV?.VITE_LOCAL_BACKEND) {
      resolved = win.__ENV.VITE_LOCAL_BACKEND;
      reason = 'window.__ENV.VITE_LOCAL_BACKEND (runtime, localhost)';
    }
  } catch (e) {
    // ignore runtime access errors
  }

  // 4) Build-time envs
  const buildApi = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
  const buildLocal = import.meta.env.VITE_LOCAL_BACKEND;
  try {
    if (!resolved && typeof window !== 'undefined') {
      const host = window.location.hostname;
      if ((host === 'localhost' || host === '127.0.0.1') && buildLocal) {
        resolved = buildLocal;
        reason = 'VITE_LOCAL_BACKEND (build-time, localhost)';
      }
    }
  } catch (e) {
    // ignore
  }

  if (!resolved && buildApi) {
    resolved = buildApi;
    reason = 'import.meta.env VITE_API_BASE* (build-time)';
  }

  // 5) If still no base and we are running locally, prefer '/api' so Vite proxy handles CORS
  try {
    if (!resolved && typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        resolved = '/api';
        reason = 'localhost -> use /api (Vite proxy)';
      }
    }
  } catch (e) {
    // ignore
  }

  // 6) Production fallback for known FE host
  try {
    if (!resolved && typeof window !== 'undefined' && window.location.hostname.includes('fsourcing.vercel.app')) {
      resolved = 'https://uni-b2b-fixed-production.up.railway.app/api';
      reason = 'fallback for fsourcing.vercel.app -> Railway backend';
      // eslint-disable-next-line no-console
      console.warn('[RuntimeAPI] No env found — using Railway backend fallback');
    }
  } catch (e) {
    // ignore
  }

  // Final fallback
  if (!resolved) {
    resolved = '/api';
    reason = 'final fallback /api';
  }

  // Debug: print resolved API base and reason
  try {
    // eslint-disable-next-line no-console
    console.info('[RuntimeAPI] Resolved API base ->', resolved, '(', reason, ')');
  } catch (e) {
    // ignore
  }

  return resolved;
}

// Tạo axios instance với config mặc định
const axiosClient = axios.create({
  baseURL: getRuntimeApiBase(),
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

    // Also print the full response body (stringified) to help debugging server 500 details
    try {
      // eslint-disable-next-line no-console
      console.error('[AxiosClient] Full error response data:', JSON.stringify(responseData, null, 2));
      if (responseData && (responseData as any).details) {
        // eslint-disable-next-line no-console
        console.error('[AxiosClient] Server error details:', (responseData as any).details);
      }
    } catch (e) {
      // ignore stringify errors
    }

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

    const customError = new Error(errorMessage);
    (customError as any).status = status;
    (customError as any).response = responseData;

    return Promise.reject(customError);
  }
);

// export default axiosClient;
// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
// import { logger } from '../utils/logger';

// // Resolve API base at runtime. Priority:
// // 1. `window.__API_BASE` (injected by host at runtime)
// // 2. `window.__ENV?.VITE_API_BASE` (runtime env object if provided)
// // 3. `import.meta.env.VITE_API_BASE_URL` or `import.meta.env.VITE_API_BASE` (build-time)
// // 4. fallback to '/api' (relative -> let dev proxy handle it)
// function getRuntimeApiBase() {
//   try {
//     const win = window as any;
//     if (win && win.__API_BASE) return win.__API_BASE;
//     if (win && win.__ENV && win.__ENV.VITE_API_BASE) return win.__ENV.VITE_API_BASE;
//   } catch (e) {
//     // ignore
//   }
//   const buildBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
//   if (buildBase) return buildBase;

//   // If no runtime or build-time base provided, and we're running on the
//   // production frontend host (e.g. fsourcing.vercel.app), default to the
//   // Railway backend you provided so the FE doesn't try to call its own host.
//   try {
//     const host = window.location && window.location.hostname ? window.location.hostname : '';
//     if (host && host.includes('fsourcing.vercel.app')) {
//       function getRuntimeApiBase() {
//         // Determine runtime context and allow these flows:
//         // - Production: use `window.__API_BASE` or `window.__ENV.VITE_API_BASE_URL` (from /env.js)
//         // - Local dev (localhost): use '/api' so Vite proxy handles CORS
//         // - Optionally allow a direct local backend via `VITE_LOCAL_BACKEND` (runtime or build-time)
//         // - Fallback: for known FE host (fsourcing.vercel.app) prefer Railway backend

//         let resolved: string | undefined;
//         let reason = '';

//         try {
//           const win = typeof window !== 'undefined' ? (window as any) : undefined;

//           // 1) Explicit runtime override (served by /env.js on production)
//           if (win?.__API_BASE) {
//             resolved = win.__API_BASE;
//             reason = 'window.__API_BASE (runtime)';
//           }

//           // 2) Vite-style runtime env object (from /env.js)
//           if (!resolved && win?.__ENV?.VITE_API_BASE_URL) {
//             resolved = win.__ENV.VITE_API_BASE_URL;
//             reason = 'window.__ENV.VITE_API_BASE_URL (runtime)';
//           }

//           if (!resolved && win?.__ENV?.VITE_API_BASE) {
//             resolved = win.__ENV.VITE_API_BASE;
//             reason = 'window.__ENV.VITE_API_BASE (runtime)';
//           }

//           // 3) If running on localhost and runtime provides a direct local backend, use it
//           const host = win?.location?.hostname || '';
//           if ((host === 'localhost' || host === '127.0.0.1') && win?.__ENV?.VITE_LOCAL_BACKEND) {
//             resolved = win.__ENV.VITE_LOCAL_BACKEND;
//             reason = 'window.__ENV.VITE_LOCAL_BACKEND (runtime, localhost)';
//           }
//         } catch (e) {
//           // ignore runtime access errors
//         }

//         // 4) Build-time envs (set at build) - allow build-time local backend override too
//         const buildApi = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
//         const buildLocal = import.meta.env.VITE_LOCAL_BACKEND;
//         if (!resolved && typeof window !== 'undefined') {
//           const host = window.location.hostname;
//           if ((host === 'localhost' || host === '127.0.0.1') && buildLocal) {
//             resolved = buildLocal;
//             reason = 'VITE_LOCAL_BACKEND (build-time, localhost)';
//           }
//         }

//         if (!resolved && buildApi) {
//           resolved = buildApi;
//           reason = 'import.meta.env VITE_API_BASE* (build-time)';
//         }

//         // 5) If still no base and we are running locally, prefer '/api' so Vite proxy handles CORS
//         try {
//           if (!resolved && typeof window !== 'undefined') {
//             const host = window.location.hostname;
//             if (host === 'localhost' || host === '127.0.0.1') {
//               resolved = '/api';
//               reason = 'localhost -> use /api (Vite proxy)';
//             }
//           }
//         } catch (e) {
//           // ignore
//         }

//         // 6) Production fallback for known FE host
//         try {
//           if (!resolved && typeof window !== 'undefined' && window.location.hostname.includes('fsourcing.vercel.app')) {
//             resolved = 'https://uni-b2b-fixed-production.up.railway.app/api';
//             reason = 'fallback for fsourcing.vercel.app -> Railway backend';
//             // eslint-disable-next-line no-console
//             console.warn('[RuntimeAPI] No env found — using Railway backend fallback');
//           }
//         } catch (e) {
//           // ignore
//         }

//         // Final fallback
//         if (!resolved) {
//           resolved = '/api';
//           reason = 'final fallback /api';
//         }

//         // Debug: print resolved API base and reason
//         try {
//           // eslint-disable-next-line no-console
//           console.info('[RuntimeAPI] Resolved API base ->', resolved, '(', reason, ')');
//         } catch (e) {
//           // ignore
//         }

//         return resolved;
//       }
//             total: 0,
//             page: 1,
//             pageSize: 10,
//             totalPages: 0,
//             hasItems: false
//           }
//         }
//       };
//     }
    
//     // KHÔNG unwrap response.data - giữ nguyên structure từ backend
//     // Backend trả về: { success: true, data: { items: [...] } }
//     // OrderList expect: response.data.items
//     return response;
//   },
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     const url = error.config?.url;
//     const method = error.config?.method?.toUpperCase();
//     const responseData: any = error.response?.data;

//     logger.error('AxiosClient', `❌ ${status} ${method} ${url}`, {
//       status,
//       error: responseData,
//       message: error.message
//     });

//     // Xử lý các lỗi HTTP phổ biến
//     let errorMessage = 'Unknown error';
    
//     if (status === 400) {
//       // Validation errors
//       if (responseData?.errors) {
//         const validationErrors = Object.entries(responseData.errors)
//           .map(([field, messages]) => `  - ${field}: ${(messages as string[]).join(', ')}`)
//           .join('\n');
//         errorMessage = `Validation Error (400):\n${validationErrors}`;
//       } else {
//         errorMessage = responseData?.title || responseData?.message || 'Bad Request';
//       }
//     } else if (status === 401) {
//       errorMessage = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
//       // Optional: Auto logout
//       // localStorage.clear();
//       // window.location.href = '/buyer/login';
//     } else if (status === 403) {
//       errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
//     } else if (status === 404) {
//       errorMessage = `Endpoint không tồn tại: ${url}`;
//     } else if (status === 500) {
//       errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
//     } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
//       errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc backend có đang chạy không.';
//     } else {
//       errorMessage = responseData?.message || responseData?.title || error.message;
//     }

//     // Throw error với message rõ ràng
//     const customError = new Error(errorMessage);
//     (customError as any).status = status;
//     (customError as any).response = responseData;
    
//     return Promise.reject(customError);
//   }
// );

export default axiosClient;

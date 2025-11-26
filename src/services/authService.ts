// Authentication Service for API integration

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  company?: string;
  phone?: string;
  country?: string;
  contactName?: string;
  role?: 'buyer' | 'seller';
}

export interface AuthResponse {
  token?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    company?: string;
    role?: string;
    [key: string]: any;
  };
  // Alternative response formats from backend
  data?: {
    token?: string;
    user?: any;
  };
  result?: any;
  [key: string]: any;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

import apiClient from './apiClient';

class AuthService {
  /**
   * Normalize different backend response formats
   */
  private normalizeAuthResponse(response: any): AuthResponse {
    console.log('==== NORMALIZING AUTH RESPONSE ====');
    console.log('Raw response:', response);

    // NEW: Backend format: {data: {token, user, userId, expiresIn}, timestamp}
    if (response.data?.token && response.data?.user) {
      console.log('✓ Matched format: data.token + data.user');
      const normalized = {
        token: response.data.token,
        user: {
          id: response.data.user.Id || response.data.user.id,
          email: response.data.user.Email || response.data.user.email,
          fullName: response.data.user.FullName || response.data.user.fullName,
          company: response.data.user.Company || response.data.user.company,
          role: (response.data.user.Role || response.data.user.role)?.toLowerCase(),
          phone: response.data.user.Phone || response.data.user.phone,
          country: response.data.user.Country || response.data.user.country,
          joinDate: response.data.user.CreatedAt || response.data.user.createdAt
        },
        message: response.message
      };
      console.log('Normalized:', normalized);
      console.log('===================================');
      return normalized;
    }

    // Direct format: {token, user, message}
    if (response.token && response.user) {
      console.log('✓ Matched format: direct token + user');
      return {
        token: response.token,
        user: response.user,
        message: response.message
      };
    }

    // Nested in result: {result: {token, user}}
    if (response.result?.token && response.result?.user) {
      console.log('✓ Matched format: result.token + result.user');
      return {
        token: response.result.token,
        user: response.result.user,
        message: response.message || response.result.message
      };
    }

    // Token in data, user at top level
    if (response.data?.token && response.user) {
      console.log('✓ Matched format: data.token + user');
      return {
        token: response.data.token,
        user: response.user,
        message: response.message
      };
    }

    // User in data, token at top level
    if (response.token && response.data?.user) {
      console.log('✓ Matched format: token + data.user');
      return {
        token: response.token,
        user: response.data.user,
        message: response.message
      };
    }

    // Return as-is if none of the patterns match
    console.warn('==== UNRECOGNIZED RESPONSE FORMAT ====');
    console.warn('Response:', response);
    console.warn('======================================');
    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('==== LOGIN REQUEST (apiClient) ====');
      console.log('Payload:', data);
      const result = await apiClient.authApi.login(data);

      // apiClient returns the response body or throws on HTTP error
      const normalizedResponse = this.normalizeAuthResponse(result);

      console.log('==== NORMALIZED RESPONSE ====');
      console.log('Has token:', !!normalizedResponse.token);
      console.log('Has user:', !!normalizedResponse.user);
      if (normalizedResponse.user) {
        console.log('User role:', normalizedResponse.user.role);
        console.log('User email:', normalizedResponse.user.email);
        console.log('User fullName:', normalizedResponse.user.fullName);
      }
      console.log('=============================');

      return normalizedResponse;
    } catch (error) {
      console.error('==== LOGIN ERROR ====');
      console.error('Error:', error);
      console.error('====================');
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('==== REGISTER REQUEST (apiClient) ====');
      console.log('Payload:', data);
      const result = await apiClient.authApi.register(data);

      // Note: many register endpoints do not auto-login; we return whatever the API returns
      console.log('==== REGISTER RESPONSE (apiClient) ====');
      console.log('Response Data:', result);
      console.log('===========================');

      return result;
    } catch (error: any) {
      console.error('==== REGISTER ERROR ====');
      console.error('Error:', error?.response?.data || error?.message || error);
      console.error('=======================');
      if (error?.response?.status === 409) {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    }
  }

  /**
   * Forgot password - request reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.authApi.forgotPassword(data);
      return result;
    } catch (error: any) {
      if (error?.response?.data?.message) throw new Error(error.response.data.message);
      if (error instanceof Error) throw error;
      throw new Error('Network error. Please try again.');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.authApi.resetPassword(data);
      return result;
    } catch (error: any) {
      if (error?.response?.data?.message) throw new Error(error.response.data.message);
      if (error instanceof Error) throw error;
      throw new Error('Network error. Please try again.');
    }
  }

  /**
   * Change password for logged in user
   */
  async changePassword(data: ChangePasswordRequest, token: string): Promise<AuthResponse> {
    try {
      // Temporarily set token on client for this request
      const previous = localStorage.getItem('tempAuthToken');
      localStorage.setItem('tempAuthToken', token);
      try {
        // apiClient will read tokens from localStorage automatically
        const result = await apiClient.authApi.changePassword(data);
        return result;
      } finally {
        if (previous) localStorage.setItem('tempAuthToken', previous);
        else localStorage.removeItem('tempAuthToken');
      }
    } catch (error: any) {
      if (error?.response?.data?.message) throw new Error(error.response.data.message);
      if (error instanceof Error) throw error;
      throw new Error('Network error. Please try again.');
    }
  }
}

export default new AuthService();

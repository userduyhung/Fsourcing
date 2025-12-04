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
import { logger } from '../utils/logger';

class AuthService {
  /**
   * Normalize different backend response formats
   */
  private normalizeAuthResponse(response: any): AuthResponse {
    logger.debug('AuthService', 'normalizeAuthResponse', { hasData: !!response.data, hasToken: !!response.token });

    // NEW: Backend format: {data: {token, user, userId, expiresIn}, timestamp}
    if (response.data?.token && response.data?.user) {
      logger.debug('AuthService', 'matched format: data.token + data.user');
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
      logger.debug('AuthService', 'normalized response', { token: !!normalized.token, userId: normalized.user?.id });
      return normalized;
    }

    // Direct format: {token, user, message}
    if (response.token && response.user) {
      logger.debug('AuthService', 'matched format: direct token + user');
      return {
        token: response.token,
        user: response.user,
        message: response.message
      };
    }

    // Nested in result: {result: {token, user}}
    if (response.result?.token && response.result?.user) {
      logger.debug('AuthService', 'matched format: result.token + result.user');
      return {
        token: response.result.token,
        user: response.result.user,
        message: response.message || response.result.message
      };
    }

    // Token in data, user at top level
    if (response.data?.token && response.user) {
      logger.debug('AuthService', 'matched format: data.token + user');
      return {
        token: response.data.token,
        user: response.user,
        message: response.message
      };
    }

    // User in data, token at top level
    if (response.token && response.data?.user) {
      logger.debug('AuthService', 'matched format: token + data.user');
      return {
        token: response.token,
        user: response.data.user,
        message: response.message
      };
    }

    // Return as-is if none of the patterns match
    logger.warn('AuthService', 'unrecognized response format', { hasToken: !!response.token, hasUser: !!response.user });
    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      logger.debug('AuthService', 'login request', { email: data.email });
      const result = await apiClient.authApi.login(data);

      // apiClient returns the response body or throws on HTTP error
      const normalizedResponse = this.normalizeAuthResponse(result);

      logger.debug('AuthService', 'login success', { hasToken: !!normalizedResponse.token, hasUser: !!normalizedResponse.user, role: normalizedResponse.user?.role });

      return normalizedResponse;
    } catch (error) {
      logger.error('AuthService', 'login error', error);
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
      logger.debug('AuthService', 'register request', { email: data.email, role: data.role });
      const result = await apiClient.authApi.register(data);
      logger.debug('AuthService', 'register response received', { success: !!result });

      // Normalize the registration response
      const normalized = this.normalizeAuthResponse(result);
      
      logger.debug('AuthService', 'normalized register response', { hasToken: !!normalized.token, hasUser: !!normalized.user });

      // Return normalized response with success indicator
      return {
        ...normalized,
        success: true,
        message: normalized.message || 'Đăng ký thành công!'
      };
    } catch (error: any) {
      logger.error('AuthService', 'register error', error?.response?.data || error?.message || error);
      if (error?.response?.status === 409) {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      }
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
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

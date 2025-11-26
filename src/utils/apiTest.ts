/**
 * API Testing Utility
 * Dùng file này để test API endpoints trong browser console
 */

const API_BASE_URL = 'http://localhost:5000/api/Auth';

export const testAPI = {
  /**
   * Test connection to backend
   */
  async testConnection() {
    try {
      const response = await fetch(API_BASE_URL, { method: 'GET' });
      console.log('Backend connection test:', {
        status: response.status,
        ok: response.ok
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  },

  /**
   * Test register endpoint
   */
  async testRegister() {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123456',
      fullName: 'Test User',
      company: 'Test Company',
      phone: '0123456789',
      country: 'Vietnam',
      role: 'buyer'
    };

    try {
      console.log('Testing register with:', testUser);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const data = await response.json();
      console.log('Register test result:', {
        status: response.status,
        ok: response.ok,
        data
      });
      return data;
    } catch (error) {
      console.error('Register test failed:', error);
      return null;
    }
  },

  /**
   * Test login endpoint
   */
  async testLogin(email: string, password: string) {
    try {
      console.log('Testing login with:', { email, password: '***' });
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log('Login test result:', {
        status: response.status,
        ok: response.ok,
        data
      });
      return data;
    } catch (error) {
      console.error('Login test failed:', error);
      return null;
    }
  }
};

// Export to window for console access
if (typeof window !== 'undefined') {
  (window as any).apiTest = testAPI;
}

export default testAPI;

/**
 * Debug utility for checking localStorage tokens
 * 
 * Usage in browser console:
 * > checkTokens()
 */

/**
 * Decode JWT token (without verification)
 */
export function decodeJWT(token: string): any {
  try {
    // Remove 'Bearer ' prefix if exists
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    
    // JWT has 3 parts: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Decode payload (base64url)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    // Check expiration
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      decoded._isExpired = now > decoded.exp;
      decoded._expiresIn = decoded.exp - now;
      decoded._expiresAt = new Date(decoded.exp * 1000).toLocaleString();
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error}`);
  }
}

export function checkTokens() {
  console.group('🔍 LocalStorage Token Debug');
  
  // Check all possible token keys
  const tokenKeys = ['buyerToken', 'authToken', 'sellerToken', 'token', 'accessToken'];
  const foundTokens: Record<string, string> = {};
  
  tokenKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      foundTokens[key] = value;
      console.log(`✅ ${key}:`, value.substring(0, 30) + '...');
      
      // Try to decode JWT
      try {
        const decoded = decodeJWT(value);
        console.log(`   📋 Decoded:`, decoded);
      } catch (e) {
        console.log(`   ⚠️ Not a valid JWT or cannot decode`);
      }
    } else {
      console.log(`❌ ${key}: NOT FOUND`);
    }
  });
  
  // Check all localStorage keys
  console.log('\n📦 All localStorage keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      const preview = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '';
      console.log(`  - ${key}: ${preview}`);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Total localStorage items: ${localStorage.length}`);
  console.log(`  Tokens found: ${Object.keys(foundTokens).length}`);
  
  if (Object.keys(foundTokens).length === 0) {
    console.warn('⚠️ WARNING: No tokens found! User needs to login first.');
  } else {
    console.log('✅ Token(s) available for API calls');
  }
  
  console.groupEnd();
  
  return foundTokens;
}

export function clearAllTokens() {
  console.group('🗑️ Clearing all tokens');
  
  const tokenKeys = ['buyerToken', 'authToken', 'sellerToken', 'token', 'accessToken'];
  tokenKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    }
  });
  
  console.log('✅ All tokens cleared');
  console.groupEnd();
}

export function setMockToken() {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJidXllckBkZW1vLmNvbSIsInJvbGUiOiJidXllciIsImlhdCI6MTYwMDAwMDAwMH0.mock_signature';
  localStorage.setItem('buyerToken', mockToken);
  console.log('✅ Mock token set:', mockToken.substring(0, 30) + '...');
  return mockToken;
}

// Make available in window for console access
if (typeof window !== 'undefined') {
  (window as any).checkTokens = checkTokens;
  (window as any).clearAllTokens = clearAllTokens;
  (window as any).setMockToken = setMockToken;
  (window as any).decodeJWT = decodeJWT;
}

console.log(`
🔧 Debug utilities loaded!

Available commands:
  checkTokens()      - Check all tokens in localStorage
  decodeJWT(token)   - Decode and inspect a JWT token
  clearAllTokens()   - Clear all tokens
  setMockToken()     - Set a mock token for testing
`);

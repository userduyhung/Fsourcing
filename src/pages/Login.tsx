import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Mock authentication với role-based routing
    setTimeout(() => {
      if (email === 'admin@fsourcing.com' && password === 'admin123') {
        // Admin login
        localStorage.setItem('adminToken', 'mock-admin-token');
        localStorage.setItem('userName', 'Admin');
        localStorage.setItem('userRole', 'admin');
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/admin/dashboard');
      } else if (email === 'buyer@demo.com' && password === 'demo123') {
        // Buyer login
        localStorage.setItem('buyerToken', 'mock-buyer-token');
        localStorage.setItem('userName', 'John Buyer');
        localStorage.setItem('userRole', 'buyer');
        localStorage.setItem('buyerProfile', JSON.stringify({
          id: 1,
          fullName: 'John Buyer',
          company: 'ABC Manufacturing Co',
          email: 'buyer@demo.com',
          phone: '+1-555-0123',
          country: 'Vietnam',
          joinDate: '2024-01-15T00:00:00Z'
        }));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/buyer/dashboard');
      } else if (email === 'seller@demo.com' && password === 'demo123') {
        // Seller login (for future implementation)
        localStorage.setItem('sellerToken', 'mock-seller-token');
        localStorage.setItem('userName', 'Demo Manufacturing Ltd');
        localStorage.setItem('userRole', 'seller');
        localStorage.setItem('sellerProfile', JSON.stringify({
          id: 1,
          companyName: 'Demo Manufacturing Ltd',
          email: 'seller@demo.com',
          phone: '+1-555-0456',
          country: 'Vietnam',
          joinDate: '2024-01-15T00:00:00Z'
        }));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/products'); // Temporary redirect
      } else {
        setError('Invalid email or password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/buyer/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/join" className="font-medium text-blue-600 hover:text-blue-500">
                Create one here
              </Link>
            </p>
            
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Accounts:</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2 rounded border">
                  <p className="font-semibold text-blue-800">Admin:</p>
                  <p className="text-blue-700">admin@fsourcing.com / admin123</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="font-semibold text-blue-800">Buyer:</p>
                  <p className="text-blue-700">buyer@demo.com / demo123</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="font-semibold text-blue-800">Seller:</p>
                  <p className="text-blue-700">seller@demo.com / demo123</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

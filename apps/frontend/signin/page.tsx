"use client";
import { ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-screen">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-white">DrawSpace</span>
          </div>
          <a href="/" className="text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-gray-800/50 rounded-lg">
            Back to Home
          </a>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your DrawSpace account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-gray-700/50 border border-gray-600 rounded cursor-pointer accent-red-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-red-500/30 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-center text-gray-400">
                Don't have an account?{' '}
                <a href="/signup" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                  Sign Up
                </a>
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white font-semibold transition-all">
                  Google
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white font-semibold transition-all">
                  GitHub
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            By signing in, you agree to our <a href="#" className="text-red-400 hover:text-red-300 transition-colors">Terms</a> and <a href="#" className="text-red-400 hover:text-red-300 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  );
}

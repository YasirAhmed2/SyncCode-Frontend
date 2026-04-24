import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth.components';
import { useAuth } from '../context/auth.context';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../lib/authService';
import toast from 'react-hot-toast';

const avatarColors = [
  '#4F46E5', '#2563EB', '#0891B2', '#059669', '#D97706', '#7C3AED', '#DB2777',
];
function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (!res?.user) throw new Error(res?.message || 'Login failed');

      const { user, token, accessToken } = res;
      const authToken = token || accessToken;
      const mappedUser = {
        id: user.id || user.userId || user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor || getRandomColor(),
      };

      login(mappedUser, authToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue coding"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/60 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99,102,241,0.55)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-white/60">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99,102,241,0.55)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{
            background: isLoading ? 'rgba(79,70,229,0.6)' : '#4F46E5',
            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
          }}
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/35">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
}
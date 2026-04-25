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
          <label htmlFor="email" className="text-sm font-medium text-foreground block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 bg-background/50 border border-border/50 focus:border-primary focus:ring-[3px] focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 bg-background/50 border border-border/50 focus:border-primary focus:ring-[3px] focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-primary-foreground text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-[0_4px_16px_rgba(99,102,241,0.3)] bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
}
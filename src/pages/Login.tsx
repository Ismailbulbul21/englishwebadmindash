import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { checkAdminStatus } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const LOGIN_TIMEOUT_MS = 20_000;

    const timeoutId = setTimeout(() => {
      toast.error('Sign-in is taking too long. Please check your connection and try again.');
      setIsLoading(false);
    }, LOGIN_TIMEOUT_MS);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        clearTimeout(timeoutId);
        toast.error(error.message);
        return;
      }

      if (!authData.user) {
        clearTimeout(timeoutId);
        toast.error('Login failed. Please try again.');
        return;
      }

      setUser(authData.user);
      let isAdmin = await checkAdminStatus(authData.user.id);
      if (!isAdmin) {
        await new Promise((r) => setTimeout(r, 400));
        isAdmin = await checkAdminStatus(authData.user.id);
      }

      clearTimeout(timeoutId);

      if (!isAdmin) {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      setIsAdmin(true);
      toast.success('Login successful!');
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-50 mb-2">
          Admin Login
        </h2>
        <p className="text-center text-slate-400 mb-8">
          Sign in to access the admin dashboard
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

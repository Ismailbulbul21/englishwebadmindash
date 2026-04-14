import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Key, User, LogOut } from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const Settings = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success('Password changed successfully');
      reset();
      setIsChangingPassword(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Info */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Account Information</span>
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-slate-200">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">User ID</p>
            <p className="text-slate-200 font-mono text-sm">{user?.id}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-50 flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Change Password</span>
          </h2>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <input
                type="password"
                {...register('currentPassword')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                {...register('newPassword')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  reset();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center space-x-2">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </h2>
        <p className="text-slate-400 mb-4">Sign out of your admin account</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

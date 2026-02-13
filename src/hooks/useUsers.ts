import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// appforenglish profiles: id, email, level, level_changed_at, created_at, updated_at
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const useUsers = (filters?: {
  levelFilter?: string;
  subscriptionStatus?: 'active' | 'expired' | 'none' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      let query = supabase.from('profiles').select('id, email, level, created_at, updated_at');

      if (filters?.levelFilter) {
        query = query.eq('level', filters.levelFilter);
      }

      if (filters?.search?.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.ilike('email', term);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const users = data ?? [];

      const usersWithSubscriptions = await Promise.all(
        users.map(async (user) => {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .maybeSingle();

          return {
            ...user,
            subscription: subscription ?? null,
          };
        })
      );

      let filtered = usersWithSubscriptions;
      if (filters?.subscriptionStatus && filters.subscriptionStatus !== 'all') {
        if (filters.subscriptionStatus === 'none') {
          filtered = usersWithSubscriptions.filter((u) => !u.subscription);
        } else {
          filtered = usersWithSubscriptions.filter((u) => {
            if (!u.subscription) return false;
            if (filters.subscriptionStatus === 'active') {
              return u.subscription.status === 'active' && new Date(u.subscription.end_date) > new Date();
            }
            return u.subscription.status === filters.subscriptionStatus;
          });
        }
      }

      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 50;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      return {
        users: filtered.slice(start, end + 1),
        total: filtered.length,
        page,
        limit,
      };
    },
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*, chapters(id, title, course_id)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      return {
        profile,
        subscriptions: subscriptions ?? [],
        progress: progress ?? [],
        sessions: [],
      };
    },
    enabled: !!userId,
  });
};

export const useUpdateUserLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, level }: { userId: string; level: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('User level updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to update user level');
    },
  });
};

export { LEVELS };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { EnglishLevel, Subscription } from '../types/database';

export const LEVELS: EnglishLevel[] = ['beginner', 'intermediate', 'advanced'];

function activeSubscriptionForUser(userId: string, subs: Subscription[]): Subscription | null {
  const now = Date.now();
  const mine = subs.filter((s) => s.user_id === userId && s.status === 'active' && new Date(s.end_date).getTime() > now);
  if (mine.length === 0) return null;
  return mine.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0] ?? null;
}

function hasExpiredOrInactiveSubscription(userId: string, subs: Subscription[]): boolean {
  const now = Date.now();
  const mine = subs.filter((s) => s.user_id === userId);
  if (mine.length === 0) return false;
  const hasActive = mine.some((s) => s.status === 'active' && new Date(s.end_date).getTime() > now);
  if (hasActive) return false;
  return mine.some(
    (s) =>
      s.status === 'expired' ||
      s.status === 'canceled' ||
      (s.status === 'active' && new Date(s.end_date).getTime() <= now),
  );
}

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
      let query = supabase
        .from('profiles')
        .select('id, email, username, english_level, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (filters?.levelFilter) {
        query = query.eq('english_level', filters.levelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let users = data ?? [];
      if (filters?.search?.trim()) {
        const t = filters.search.trim().toLowerCase();
        users = users.filter(
          (u) =>
            (u.email ?? '').toLowerCase().includes(t) ||
            (u.username ?? '').toLowerCase().includes(t),
        );
      }
      const userIds = users.map((u) => u.id);

      let allSubs: Subscription[] = [];
      if (userIds.length > 0) {
        const { data: subRows, error: subErr } = await supabase.from('subscriptions').select('*').in('user_id', userIds);
        if (subErr) throw subErr;
        allSubs = (subRows ?? []) as Subscription[];
      }

      const usersWithSubscriptions = users.map((user) => ({
        ...user,
        english_level: user.english_level as EnglishLevel | null,
        subscription: activeSubscriptionForUser(user.id, allSubs),
      }));

      let filtered = usersWithSubscriptions;
      if (filters?.subscriptionStatus && filters.subscriptionStatus !== 'all') {
        if (filters.subscriptionStatus === 'none') {
          filtered = usersWithSubscriptions.filter((u) => !u.subscription);
        } else if (filters.subscriptionStatus === 'active') {
          filtered = usersWithSubscriptions.filter((u) => !!u.subscription);
        } else if (filters.subscriptionStatus === 'expired') {
          filtered = usersWithSubscriptions.filter((u) => hasExpiredOrInactiveSubscription(u.id, allSubs));
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
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profileError) throw profileError;

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('*, lessons(id, title, level)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      return {
        profile,
        subscriptions: subscriptions ?? [],
        lessonProgress: progress ?? [],
      };
    },
    enabled: !!userId,
  });
};

export const useUpdateUserEnglishLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, english_level }: { userId: string; english_level: EnglishLevel | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ english_level, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('English level updated');
    },
    onError: (error: Error) => toast.error(error.message ?? 'Update failed'),
  });
};

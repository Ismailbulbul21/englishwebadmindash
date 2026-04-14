import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { SubscriptionStatus } from '../types/database';

export const useSubscriptions = (filters?: {
  status?: SubscriptionStatus | 'all';
  planType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      let query = supabase.from('subscriptions').select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.planType) {
        query = query.eq('plan_type', filters.planType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      let list = data ?? [];
      const userIds = [...new Set(list.map((s: { user_id: string }) => s.user_id))];
      let profileMap: Record<string, { id: string; email: string | null; username: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profs, error: pe } = await supabase.from('profiles').select('id, email, username').in('id', userIds);
        if (pe) throw pe;
        profileMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));
      }

      list = list.map((s: { user_id: string }) => ({
        ...s,
        profiles: profileMap[s.user_id] ?? null,
      }));

      if (filters?.search?.trim()) {
        const term = filters.search.trim().toLowerCase();
        list = list.filter(
          (s: { profiles?: { email?: string | null; username?: string | null } | null; payment_reference?: string | null }) => {
            const email = (s.profiles?.email ?? '').toLowerCase();
            const username = (s.profiles?.username ?? '').toLowerCase();
            const ref = (s.payment_reference ?? '').toLowerCase();
            return email.includes(term) || username.includes(term) || ref.includes(term);
          },
        );
      }

      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 50;
      const start = (page - 1) * limit;

      return {
        subscriptions: list.slice(start, start + limit),
        total: list.length,
        page,
        limit,
      };
    },
  });
};

export const useExtendSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, newEndDate }: { subscriptionId: string; newEndDate: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ end_date: newEndDate, status: 'active', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Subscription extended');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Subscription canceled');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// appforenglish: subscriptions with profiles(id, email); payment_reference, amount, currency
export const useSubscriptions = (filters?: {
  status?: 'active' | 'expired' | 'cancelled' | 'all';
  planType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      let query = supabase.from('subscriptions').select('*, profiles(id, email)');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.planType) {
        query = query.eq('plan_type', filters.planType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      let list = data ?? [];
      if (filters?.search?.trim()) {
        const term = filters.search.trim().toLowerCase();
        list = list.filter((s: { profiles?: { email?: string } | null; payment_reference?: string }) => {
          const email = (s.profiles?.email ?? '').toLowerCase();
          const ref = (s.payment_reference ?? '').toLowerCase();
          return email.includes(term) || ref.includes(term);
        });
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
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription cancelled');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

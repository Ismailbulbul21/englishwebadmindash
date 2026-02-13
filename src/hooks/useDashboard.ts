import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      // Total revenue (sum of active subscriptions)
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active');
      
      const totalRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

      // Active speaking sessions
      const { count: activeSessions } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('end_time', new Date().toISOString());

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue,
        activeSessions: activeSessions || 0,
      };
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useRevenueChart = (days: number = 30) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('subscriptions')
        .select('amount, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const grouped = (data || []).reduce((acc: Record<string, number>, sub) => {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (sub.amount || 0);
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, amount]) => ({
        date,
        amount,
      }));
    },
  });
};

export const useUserGrowth = (days: number = 30) => {
  return useQuery({
    queryKey: ['dashboard', 'userGrowth', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('profiles')
        .select('created_at, level')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group by date and level
      const grouped = (data || []).reduce((acc: Record<string, { total: number; beginner: number; intermediate: number; advanced: number }>, user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { total: 0, beginner: 0, intermediate: 0, advanced: 0 };
        }
        acc[date].total++;
        acc[date][user.level as 'beginner' | 'intermediate' | 'advanced']++;
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, counts]) => ({
        date,
        ...counts,
      }));
    },
  });
};

export const useSubscriptionDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'subscriptionDistribution'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('status', 'active');

      const distribution: Record<string, number> = {};
      (data || []).forEach((sub) => {
        const key = sub.plan_type || 'other';
        distribution[key] = (distribution[key] || 0) + 1;
      });
      return distribution;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      // Get recent signups
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent subscriptions
      const { data: recentSubscriptions } = await supabase
        .from('subscriptions')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent exam completions
      const { data: recentProgress } = await supabase
        .from('user_progress')
        .select('*, profiles(email), chapters(title)')
        .eq('exam_passed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);

      return {
        users: recentUsers || [],
        subscriptions: recentSubscriptions || [],
        examCompletions: recentProgress || [],
      };
    },
    staleTime: 10000, // 10 seconds
  });
};

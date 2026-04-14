import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const nowIso = () => new Date().toISOString();

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('user_id, amount')
        .eq('status', 'active')
        .gte('end_date', nowIso());

      const subscribedUserIds = new Set((activeSubs ?? []).map((s) => s.user_id));
      const totalRevenue = (activeSubs ?? []).reduce((sum, s) => sum + Number(s.amount ?? 0), 0);

      const { count: totalLessons } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
      const { count: publishedLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: activeSessions } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: waitingCount } = await supabase.from('waiting_users').select('*', { count: 'exact', head: true });

      const { data: quizProgressRows, error: quizErr } = await supabase
        .from('lesson_progress')
        .select('user_id, quiz_total, quiz_score, is_completed')
        .gt('quiz_total', 0);

      if (quizErr) throw quizErr;

      const rows = quizProgressRows ?? [];
      const usersWhoTookQuiz = new Set(rows.map((r) => r.user_id)).size;
      const quizLessonAttempts = rows.length;
      const usersCompletedQuizLesson = new Set(
        rows.filter((r) => r.is_completed && r.quiz_total > 0).map((r) => r.user_id),
      ).size;

      const { count: totalQuizQuestions } = await supabase
        .from('lesson_quiz_questions')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers ?? 0,
        subscribedUsers: subscribedUserIds.size,
        activeSubscriptions: activeSubs?.length ?? 0,
        totalRevenue,
        totalLessons: totalLessons ?? 0,
        publishedLessons: publishedLessons ?? 0,
        activeSessions: activeSessions ?? 0,
        waitingForMatch: waitingCount ?? 0,
        usersWhoTookQuiz,
        quizLessonAttempts,
        usersCompletedQuizLesson,
        totalQuizQuestions: totalQuizQuestions ?? 0,
      };
    },
    staleTime: 30_000,
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

      const grouped = (data || []).reduce((acc: Record<string, number>, sub) => {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(sub.amount ?? 0);
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
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
        .select('created_at, english_level')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const grouped = (data || []).reduce(
        (
          acc: Record<string, { total: number; beginner: number; intermediate: number; advanced: number; unset: number }>,
          user,
        ) => {
          if (!user.created_at) return acc;
          const date = new Date(user.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { total: 0, beginner: 0, intermediate: 0, advanced: 0, unset: 0 };
          }
          acc[date].total++;
          const lvl = user.english_level as 'beginner' | 'intermediate' | 'advanced' | null | undefined;
          if (lvl === 'beginner' || lvl === 'intermediate' || lvl === 'advanced') {
            acc[date][lvl]++;
          } else {
            acc[date].unset++;
          }
          return acc;
        },
        {},
      );

      return Object.entries(grouped).map(([date, counts]) => ({ date, ...counts }));
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
        .eq('status', 'active')
        .gte('end_date', nowIso());

      const distribution: Record<string, number> = {};
      (data || []).forEach((sub) => {
        const key = sub.plan_type || 'other';
        distribution[key] = (distribution[key] || 0) + 1;
      });
      return distribution;
    },
  });
};

export const usePaymentChannelDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'paymentChannels'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('payment_channel')
        .eq('status', 'active')
        .gte('end_date', nowIso());

      const dist: Record<string, number> = { EVC: 0, ZAAD: 0, SAHAL: 0, unset: 0 };
      (data || []).forEach((row) => {
        const ch = row.payment_channel;
        if (ch === 'EVC' || ch === 'ZAAD' || ch === 'SAHAL') dist[ch]++;
        else dist.unset++;
      });
      return dist;
    },
  });
};

export const useEnglishLevelDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'englishLevels'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('english_level');
      const dist: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0, unset: 0 };
      (data || []).forEach((row) => {
        const l = row.english_level;
        if (l === 'beginner' || l === 'intermediate' || l === 'advanced') dist[l]++;
        else dist.unset++;
      });
      return dist;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('email, username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentLessonProgress } = await supabase
        .from('lesson_progress')
        .select('*, profiles(email), lessons(title)')
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);

      return {
        users: recentUsers || [],
        subscriptions: recentSubscriptions || [],
        lessonCompletions: recentLessonProgress || [],
      };
    },
    staleTime: 10_000,
  });
};

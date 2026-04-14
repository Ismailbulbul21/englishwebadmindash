import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SessionStatus } from '../types/database';

export const useSpeakingSessions = (filters?: { status?: SessionStatus | 'all' }) => {
  return useQuery({
    queryKey: ['speakingSessions', filters],
    queryFn: async () => {
      let query = supabase
        .from('speaking_sessions')
        .select(
          '*, user_a_profile:profiles!speaking_sessions_user_a_fkey(email, username), user_b_profile:profiles!speaking_sessions_user_b_fkey(email, username)',
        );

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10_000,
  });
};

export const useSpeakingSessionStats = () => {
  return useQuery({
    queryKey: ['speakingSessionStats'],
    queryFn: async () => {
      const { count: totalSessions } = await supabase.from('speaking_sessions').select('*', { count: 'exact', head: true });

      const { count: activeSessions } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: endedSessions } = await supabase
        .from('speaking_sessions')
        .select('start_time, end_time')
        .eq('status', 'ended');

      const avgDuration =
        endedSessions && endedSessions.length > 0
          ? endedSessions.reduce((sum, s) => {
              const end = new Date(s.end_time).getTime();
              const start = new Date(s.start_time).getTime();
              return sum + (end - start);
            }, 0) / endedSessions.length
          : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: sessionsToday } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', today.toISOString());

      const { count: waiting } = await supabase.from('waiting_users').select('*', { count: 'exact', head: true });

      return {
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        averageDuration: avgDuration / 1000 / 60,
        sessionsToday: sessionsToday || 0,
        waitingForMatch: waiting || 0,
      };
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SessionStatus } from '../types/database';

export const useSpeakingSessions = (filters?: { status?: SessionStatus | 'all' }) => {
  return useQuery({
    queryKey: ['speakingSessions', filters],
    queryFn: async () => {
      let query = supabase
        .from('speaking_sessions')
        .select('*, user_a_profile:profiles!speaking_sessions_user_a_fkey(email), user_b_profile:profiles!speaking_sessions_user_b_fkey(email)');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refetch every 10 seconds for active sessions
  });
};

export const useSpeakingSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['speakingSession', sessionId],
    queryFn: async () => {
      const { data: session, error: sessionError } = await supabase
        .from('speaking_sessions')
        .select('*, user_a_profile:profiles!speaking_sessions_user_a_fkey(*), user_b_profile:profiles!speaking_sessions_user_b_fkey(*)')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { data: ratings } = await supabase
        .from('session_ratings')
        .select('*')
        .eq('session_id', sessionId);

      return {
        session,
        ratings: ratings || [],
      };
    },
    enabled: !!sessionId,
  });
};

export const useSpeakingSessionStats = () => {
  return useQuery({
    queryKey: ['speakingSessionStats'],
    queryFn: async () => {
      const { count: totalSessions } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: activeSessions } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('end_time', new Date().toISOString());

      const { data: endedSessions } = await supabase
        .from('speaking_sessions')
        .select('start_time, end_time')
        .eq('status', 'ended')
        .not('end_time', 'is', null);

      const avgDuration =
        endedSessions && endedSessions.length > 0
          ? endedSessions.reduce((sum, s) => {
              const duration =
                new Date(s.end_time!).getTime() - new Date(s.start_time).getTime();
              return sum + duration;
            }, 0) / endedSessions.length
          : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: sessionsToday } = await supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', today.toISOString());

      return {
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        averageDuration: avgDuration / 1000 / 60, // Convert to minutes
        sessionsToday: sessionsToday || 0,
      };
    },
  });
};

import { useState } from 'react';
import type { SpeakingSession } from '../types/database';

type SessionRow = SpeakingSession & {
  user_a_profile?: { email?: string | null; username?: string | null } | null;
  user_b_profile?: { email?: string | null; username?: string | null } | null;
};
import { useSpeakingSessions, useSpeakingSessionStats } from '../hooks/useSpeakingSessions';
import { format } from 'date-fns';
import { MessageSquare, Users, Clock, Activity } from 'lucide-react';
import type { SessionStatus } from '../types/database';

export const SpeakingSessions = () => {
  const [status, setStatus] = useState<SessionStatus | 'all'>('all');
  const { data: sessions, isLoading } = useSpeakingSessions({ status: status === 'all' ? undefined : status });
  const { data: stats } = useSpeakingSessionStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
        <MessageSquare className="h-7 w-7 text-indigo-400" />
        Speaking sessions
      </h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total sessions</p>
            <p className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Activity className="h-4 w-4 text-emerald-400" />
              {stats.totalSessions}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Active</p>
            <p className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              {stats.activeSessions}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Waiting queue</p>
            <p className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-sky-400" />
              {stats.waitingForMatch}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Avg duration (ended)</p>
            <p className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-amber-400" />
              {stats.averageDuration.toFixed(1)} min
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'ended', 'terminated'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">User A</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">User B</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">End</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {(sessions ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No sessions
                  </td>
                </tr>
              ) : (
                (sessions ?? []).map((row: SessionRow) => (
                  <tr key={row.id} className="hover:bg-slate-700/40">
                    <td className="px-4 py-3 text-xs font-mono text-slate-300 max-w-[120px] truncate">{row.room_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {row.user_a_profile?.email ?? row.user_a_profile?.username ?? row.user_a?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {row.user_b_profile?.email ?? row.user_b_profile?.username ?? row.user_b?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{format(new Date(row.start_time), 'PP p')}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {row.end_time ? format(new Date(row.end_time), 'PP p') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          row.status === 'active'
                            ? 'bg-emerald-600 text-white'
                            : row.status === 'ended'
                              ? 'bg-slate-600 text-white'
                              : 'bg-red-700 text-white'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUsers, useUpdateUserEnglishLevel, LEVELS } from '../hooks/useUsers';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { EnglishLevel } from '../types/database';

export const Users = () => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expired' | 'none'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useUsers({
    levelFilter: levelFilter.trim() || undefined,
    subscriptionStatus: subscriptionFilter,
    search: search.trim() || undefined,
    page,
    limit: 50,
  });

  const updateLevel = useUpdateUserEnglishLevel();

  const handleLevelChange = async (userId: string, newLevel: string) => {
    if (!LEVELS.includes(newLevel as EnglishLevel)) {
      toast.error('Level must be beginner, intermediate, or advanced');
      return;
    }
    if (confirm(`Set English level to "${newLevel}"?`)) {
      updateLevel.mutate({ userId, english_level: newLevel as EnglishLevel });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-red-500/50">
        <p className="text-red-400 font-medium">Failed to load users</p>
        <p className="text-slate-400 text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as typeof subscriptionFilter)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All subscriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired / inactive</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email / user</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">English level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.users.map((user: { id: string; email?: string | null; username?: string | null; english_level?: string | null; created_at?: string | null; subscription?: { end_date: string } | null }) => {
                  const subscription = user.subscription;
                  const isActive = !!subscription && new Date(subscription.end_date) > new Date();
                  const daysUntilExpiry =
                    subscription && isActive
                      ? Math.ceil(
                          (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )
                      : null;
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/users/${user.id}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                          {user.email ?? user.username ?? user.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-200 capitalize">{user.english_level ?? '—'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const v = window.prompt('English level: beginner / intermediate / advanced', user.english_level ?? '');
                            if (v != null && v.trim() && v.trim() !== (user.english_level ?? '')) handleLevelChange(user.id, v.trim().toLowerCase());
                          }}
                          className="ml-2 text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isActive ? (
                          <span className="text-emerald-400">
                            Active {daysUntilExpiry != null ? `(expires in ${daysUntilExpiry}d)` : ''}
                          </span>
                        ) : subscription ? (
                          <span className="text-amber-400">Inactive</span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/users/${user.id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm">
                          <Eye className="h-4 w-4" /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > data.limit && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * data.limit + 1} to {Math.min(page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * data.limit >= data.total}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useParams, Link } from 'react-router-dom';
import { useUser } from '../hooks/useUsers';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react';

export const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading } = useUser(userId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-slate-400">User not found</div>;
  }

  const { profile, subscriptions, lessonProgress } = data;

  return (
    <div className="space-y-6">
      <Link to="/users" className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Users</span>
      </Link>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">User information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-slate-200">{profile.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Username</p>
            <p className="text-slate-200">{profile.username ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">English level</p>
            <p className="text-slate-200 capitalize">{profile.english_level ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Region</p>
            <p className="text-slate-200">{profile.region ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Discoverable</p>
            <p className="text-slate-200">{profile.is_discoverable ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Lessons onboarding</p>
            <p className="text-slate-200">{profile.lessons_onboarding_done ? 'Done' : 'Not done'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Created</p>
            <p className="text-slate-200">{profile.created_at ? format(new Date(profile.created_at), 'PPpp') : '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Updated</p>
            <p className="text-slate-200">{profile.updated_at ? format(new Date(profile.updated_at), 'PPpp') : '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Subscription history
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Plan</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Channel</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Start</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">End</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Reference</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {subscriptions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-slate-400 text-sm">
                    No subscriptions
                  </td>
                </tr>
              ) : (
                subscriptions?.map(
                  (sub: {
                    id: string;
                    plan_type: string;
                    payment_channel: string | null;
                    start_date: string;
                    end_date: string;
                    status: string;
                    payment_reference: string | null;
                    amount: number | null;
                    currency: string | null;
                  }) => (
                    <tr key={sub.id} className={sub.status === 'active' ? 'bg-emerald-900/20' : ''}>
                      <td className="px-4 py-2 text-sm text-slate-200 capitalize">{sub.plan_type ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{sub.payment_channel ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">
                        {sub.start_date ? format(new Date(sub.start_date), 'PP') : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-200">
                        {sub.end_date ? format(new Date(sub.end_date), 'PP') : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            sub.status === 'active'
                              ? 'bg-emerald-500 text-white'
                              : sub.status === 'expired'
                                ? 'bg-red-500 text-white'
                                : sub.status === 'canceled'
                                  ? 'bg-slate-500 text-white'
                                  : 'bg-slate-600 text-white'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-200 font-mono">{sub.payment_reference ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">
                        {sub.amount != null ? `${sub.currency ?? ''} ${sub.amount}` : '—'}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lesson progress
        </h2>
        <div className="space-y-4">
          {lessonProgress?.length === 0 ? (
            <p className="text-slate-400 text-sm">No lesson progress yet</p>
          ) : (
            lessonProgress?.map(
              (p: {
                id: string;
                lessons?: { title?: string; level?: string } | null;
                last_item_position: number;
                is_completed: boolean;
                quiz_score: number;
                quiz_total: number;
                completed_at: string | null;
                updated_at: string;
              }) => (
                <div key={p.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="font-medium text-slate-200">
                      {p.lessons?.title ?? 'Lesson'}{' '}
                      <span className="text-slate-400 text-sm capitalize">({p.lessons?.level ?? '—'})</span>
                    </h3>
                    {p.completed_at && (
                      <span className="text-xs text-slate-400">Completed {format(new Date(p.completed_at), 'PP')}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span>Last item position: {p.last_item_position}</span>
                    {p.quiz_total > 0 && (
                      <span>
                        Quiz: {p.quiz_score}/{p.quiz_total}
                      </span>
                    )}
                    <span>{p.is_completed ? 'Completed' : 'In progress'}</span>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
};

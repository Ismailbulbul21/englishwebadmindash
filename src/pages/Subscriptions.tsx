import { useState } from 'react';
import { useSubscriptions, useExtendSubscription, useCancelSubscription } from '../hooks/useSubscriptions';
import { format } from 'date-fns';
import { Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const extendSchema = z
  .object({
    days: z.number().min(1).optional(),
    months: z.number().min(1).optional(),
  })
  .refine((d) => d.days || d.months, { message: 'Add days or months' });

type ExtendFormData = z.infer<typeof extendSchema>;

export const Subscriptions = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSubscriptions({
    status: statusFilter,
    planType: planFilter !== 'all' ? planFilter : undefined,
    search: search.trim() || undefined,
    page,
    limit: 50,
  });

  const extendSubscription = useExtendSubscription();
  const cancelSubscription = useCancelSubscription();

  const { register, handleSubmit, reset } = useForm<ExtendFormData>({
    resolver: zodResolver(extendSchema),
  });

  const onSubmitExtend = (formData: ExtendFormData) => {
    if (!extendingId || !data) return;
    const sub = data.subscriptions.find((s: any) => s.id === extendingId);
    if (!sub) return;
    const end = new Date(sub.end_date);
    if (formData.days) end.setDate(end.getDate() + formData.days);
    if (formData.months) end.setMonth(end.getMonth() + formData.months);
    extendSubscription.mutate({ subscriptionId: extendingId, newEndDate: end.toISOString() });
    setExtendingId(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
          >
            <option value="all">All plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button type="button" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.subscriptions.map((sub: any) => {
                const isExpiringSoon =
                  sub.status === 'active' &&
                  new Date(sub.end_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                const displayEmail = sub.profiles?.email ?? sub.user_id?.slice(0, 8);
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-700/50 ${sub.status === 'active' ? 'bg-emerald-900/10' : ''} ${isExpiringSoon ? 'border-l-4 border-amber-500' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/users/${sub.user_id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                        {displayEmail}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 capitalize">{sub.plan_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {format(new Date(sub.start_date), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {format(new Date(sub.end_date), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          sub.status === 'active'
                            ? 'bg-emerald-500 text-white'
                            : sub.status === 'expired'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-mono">
                      {sub.payment_reference ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {sub.amount != null ? `${sub.currency ?? ''} ${sub.amount}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.status === 'active' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setExtendingId(sub.id)}
                            className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                          >
                            Extend
                          </button>
                          <button
                            type="button"
                            onClick={() => confirm('Cancel this subscription?') && cancelSubscription.mutate(sub.id)}
                            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data && data.total > data.limit && (
          <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page * data.limit >= data.total}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!extendingId} onClose={() => setExtendingId(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-slate-800 rounded-lg p-6 border border-slate-700 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold text-slate-50 mb-4">Extend subscription</Dialog.Title>
            <form onSubmit={handleSubmit(onSubmitExtend)} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Add days</label>
                <input type="number" {...register('days', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Add months</label>
                <input type="number" {...register('months', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200" placeholder="0" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Extend
                </button>
                <button type="button" onClick={() => { setExtendingId(null); reset(); }} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

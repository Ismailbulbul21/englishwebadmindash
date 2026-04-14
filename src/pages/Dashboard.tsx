import {
  useDashboardStats,
  useRevenueChart,
  useUserGrowth,
  useSubscriptionDistribution,
  usePaymentChannelDistribution,
  useEnglishLevelDistribution,
  useRecentActivity,
} from '../hooks/useDashboard';
import { Users, CreditCard, DollarSign, MessageSquare, BookOpen, Clock, GraduationCap, ClipboardCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#6366F1', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart(30);
  const { data: userGrowthData } = useUserGrowth(30);
  const { data: subscriptionDist } = useSubscriptionDistribution();
  const { data: paymentDist } = usePaymentChannelDistribution();
  const { data: levelDist } = useEnglishLevelDistribution();
  const { data: recentActivity } = useRecentActivity();

  const pieData = subscriptionDist
    ? Object.entries(subscriptionDist).map(([name, value]) => ({ name, value }))
    : [];

  const paymentPie = paymentDist
    ? Object.entries(paymentDist).map(([name, value]) => ({ name, value }))
    : [];

  const levelPie = levelDist
    ? Object.entries(levelDist).map(([name, value]) => ({ name, value }))
    : [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total users</p>
              <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.totalUsers ?? 0}</p>
            </div>
            <div className="bg-indigo-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Subscribed users (active)</p>
              <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.subscribedUsers ?? 0}</p>
            </div>
            <div className="bg-emerald-600 p-3 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active subscription rows</p>
              <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.activeSubscriptions ?? 0}</p>
            </div>
            <div className="bg-teal-600 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Revenue (active subs)</p>
              <p className="text-2xl font-bold text-slate-50 mt-1">${(stats?.totalRevenue ?? 0).toFixed(2)}</p>
            </div>
            <div className="bg-amber-600 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Lessons (total / published)</p>
          <p className="text-xl font-bold text-slate-50 mt-1 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            {stats?.totalLessons ?? 0} / {stats?.publishedLessons ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Active speaking sessions</p>
          <p className="text-xl font-bold text-slate-50 mt-1 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            {stats?.activeSessions ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Waiting for match</p>
          <p className="text-xl font-bold text-slate-50 mt-1 flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
            {stats?.waitingForMatch ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 rounded-lg border border-indigo-500/30 p-5">
        <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-indigo-400" />
          Lesson quizzes
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Based on <code className="text-slate-400">lesson_progress</code> where learners have started or finished a quiz (
          <code className="text-slate-400">quiz_total &gt; 0</code>).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Users who took a quiz</p>
            <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.usersWhoTookQuiz ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Distinct users with ≥1 lesson quiz attempt</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Quiz attempts (lessons)</p>
            <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.quizLessonAttempts ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Rows with quiz activity per user per lesson</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Users who finished a quiz lesson</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.usersCompletedQuizLesson ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Distinct users with ≥1 completed lesson that had a quiz</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Quiz questions in curriculum</p>
            <p className="text-2xl font-bold text-slate-50 mt-1">{stats?.totalQuizQuestions ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Total rows in lesson_quiz_questions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Revenue (last 30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">User signups (last 30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Plans (active)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={72}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-p-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Payment channel (active)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={72}
                dataKey="value"
              >
                {paymentPie.map((_, index) => (
                  <Cell key={`cell-pay-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">User English level</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={levelPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={72}
                dataKey="value"
              >
                {levelPie.map((_, index) => (
                  <Cell key={`cell-lvl-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Recent signups</h3>
          <div className="space-y-2">
            {recentActivity?.users?.map((user: { email?: string | null; username?: string | null; created_at?: string | null }) => (
              <div key={(user.email ?? user.username ?? '') + (user.created_at ?? '')} className="flex justify-between p-3 bg-slate-700 rounded-lg text-sm">
                <span className="text-slate-200">{user.email ?? user.username ?? '—'}</span>
                <span className="text-slate-400 text-xs">
                  {user.created_at ? format(new Date(user.created_at), 'MMM dd, HH:mm') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Recent lesson completions</h3>
          <div className="space-y-2">
            {recentActivity?.lessonCompletions?.map(
              (row: { id: string; profiles?: { email?: string | null }; lessons?: { title?: string }; completed_at?: string | null }) => (
                <div key={row.id} className="flex justify-between p-3 bg-slate-700 rounded-lg text-sm">
                  <span className="text-slate-200 truncate mr-2">
                    {row.lessons?.title ?? 'Lesson'} — {row.profiles?.email ?? '—'}
                  </span>
                  <span className="text-slate-400 text-xs shrink-0">
                    {row.completed_at ? format(new Date(row.completed_at), 'MMM dd') : ''}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">Recent subscriptions</h3>
        <div className="space-y-2">
          {recentActivity?.subscriptions?.map(
            (sub: { id: string; user_id: string; plan_type: string; amount: number | null; currency: string | null; created_at: string | null; payment_channel?: string | null }) => (
              <div key={sub.id} className="flex flex-wrap justify-between gap-2 p-3 bg-slate-700 rounded-lg text-sm">
                <span className="text-slate-200 font-mono text-xs">{sub.user_id.slice(0, 8)}…</span>
                <span className="text-slate-300">{sub.plan_type}</span>
                <span className="text-slate-400">{sub.payment_channel ?? '—'}</span>
                <span className="text-emerald-400">
                  {sub.amount != null ? `${sub.currency ?? ''} ${sub.amount}` : '—'}
                </span>
                <span className="text-slate-500 text-xs">{sub.created_at ? format(new Date(sub.created_at), 'MMM dd') : ''}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

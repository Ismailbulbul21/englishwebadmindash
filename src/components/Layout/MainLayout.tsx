import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'User Management',
    '/lessons': 'Lessons',
    '/subscriptions': 'Subscription Management',
    '/speaking-sessions': 'Speaking Sessions',
    '/settings': 'Settings',
  };

  if (pathname.startsWith('/users/')) return 'User Details';
  if (pathname.startsWith('/lessons/')) return 'Lesson Editor';

  return titles[pathname] || 'Admin Dashboard';
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} />
        <main className="mt-16 pt-4 min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

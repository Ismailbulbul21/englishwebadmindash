import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { initializeAuth, setupAuthListener } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { Courses } from './pages/Courses';
import { CourseChapters } from './pages/CourseChapters';
import { ExamEditor } from './pages/ExamEditor';
import { Exams } from './pages/Exams';
import { Subscriptions } from './pages/Subscriptions';
import { SpeakingSessions } from './pages/SpeakingSessions';
import { Settings } from './pages/Settings';

function App() {
  useEffect(() => {
    initializeAuth();
    const { data: { subscription } } = setupAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate to="/dashboard" replace />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Courses />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/chapters"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CourseChapters />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chapters/:chapterId/exam"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExamEditor />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Exams />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subscriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/speaking-sessions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SpeakingSessions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F8FAFC',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F8FAFC',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layout components
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const UsersPage = lazy(() => import('../pages/users/UsersPage'));
const DepartmentsPage = lazy(() => import('../pages/departments/DepartmentsPage'));
const TeamsPage = lazy(() => import('../pages/teams/TeamsPage'));
const ChatsPage = lazy(() => import('../pages/chats/ChatsPage'));
const TasksPage = lazy(() => import('../pages/tasks/TasksPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Suspense wrapper for lazy loaded components
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout>
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <UsersPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/departments',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <DepartmentsPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teams',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <TeamsPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/chats',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <ChatsPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tasks',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

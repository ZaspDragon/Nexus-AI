import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AppDataProvider } from './contexts/AppDataContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const CommandCenterPage = lazy(() =>
  import('./pages/CommandCenterPage').then((module) => ({ default: module.CommandCenterPage })),
);
const ReceivingPage = lazy(() =>
  import('./pages/ReceivingPage').then((module) => ({ default: module.ReceivingPage })),
);
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })),
);
const LaborPage = lazy(() =>
  import('./pages/LaborPage').then((module) => ({ default: module.LaborPage })),
);
const DowntimePage = lazy(() =>
  import('./pages/DowntimePage').then((module) => ({ default: module.DowntimePage })),
);
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
);
const AdminSettingsPage = lazy(() =>
  import('./pages/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const WorkspaceLayout = () => {
  const { loading } = useAppData();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const ProtectedLayout = () => {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppDataProvider>
      <WorkspaceLayout />
    </AppDataProvider>
  );
};

const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/command-center" element={<CommandCenterPage />} />
        <Route path="/receiving" element={<ReceivingPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/labor" element={<LaborPage />} />
        <Route path="/downtime" element={<DowntimePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
        <Route path="/workspace" element={<Navigate to="/command-center" replace />} />
        <Route path="/router-demo" element={<Navigate to="/reports" replace />} />
        <Route path="/memory" element={<Navigate to="/inventory" replace />} />
        <Route path="/tools" element={<Navigate to="/labor" replace />} />
        <Route path="/usage" element={<Navigate to="/reports" replace />} />
        <Route path="/admin" element={<Navigate to="/settings" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

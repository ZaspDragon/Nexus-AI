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
const AgentWorkspacePage = lazy(() =>
  import('./pages/AgentWorkspacePage').then((module) => ({ default: module.AgentWorkspacePage })),
);
const ModelRouterPage = lazy(() =>
  import('./pages/ModelRouterPage').then((module) => ({ default: module.ModelRouterPage })),
);
const MemoryCenterPage = lazy(() =>
  import('./pages/MemoryCenterPage').then((module) => ({ default: module.MemoryCenterPage })),
);
const ToolRegistryPage = lazy(() =>
  import('./pages/ToolRegistryPage').then((module) => ({ default: module.ToolRegistryPage })),
);
const UsageBillingPage = lazy(() =>
  import('./pages/UsageBillingPage').then((module) => ({ default: module.UsageBillingPage })),
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
        <Route path="/workspace" element={<AgentWorkspacePage />} />
        <Route path="/router-demo" element={<ModelRouterPage />} />
        <Route path="/memory" element={<MemoryCenterPage />} />
        <Route path="/tools" element={<ToolRegistryPage />} />
        <Route path="/usage" element={<UsageBillingPage />} />
        <Route path="/admin" element={<AdminSettingsPage />} />
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

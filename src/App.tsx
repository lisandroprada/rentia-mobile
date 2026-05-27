import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoute } from './types';
import { useAuth } from './contexts/AuthContext';
import { useWhatsAppSocket } from './hooks/useWhatsAppSocket';
import { useAppBadge } from './hooks/useAppBadge';

import DesktopBanner from './components/ui/DesktopBanner';
import UpdatePrompt from './components/ui/UpdatePrompt';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CrmTab from './pages/crm/CrmTab';
import ChatTab from './pages/chat/ChatTab';
import ProfilePage from './pages/profile/ProfilePage';

const ROUTE_KEY = 'rm_current_route';

function getInitialRoute(): AppRoute {
  const saved = localStorage.getItem(ROUTE_KEY) as AppRoute | null;
  if (saved && Object.values(AppRoute).includes(saved)) return saved;
  return AppRoute.Dashboard;
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  useWhatsAppSocket(isAuthenticated);
  const unreadChat = useAppBadge();

  useEffect(() => {
    if (isAuthenticated) localStorage.setItem(ROUTE_KEY, currentRoute);
  }, [currentRoute, isAuthenticated]);

  const handleNavigate = (route: AppRoute) => setCurrentRoute(route);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => handleNavigate(AppRoute.Dashboard)} />;
  }

  const tabProps = { currentRoute, onNavigate: handleNavigate, unreadChat };

  if (currentRoute === AppRoute.Profile) {
    return <ProfilePage {...tabProps} />;
  }

  if (currentRoute.startsWith('chat')) {
    return <ChatTab {...tabProps} />;
  }

  if (currentRoute === AppRoute.Dashboard) {
    return <DashboardPage {...tabProps} />;
  }

  // CrmNew navigated from Dashboard opens CrmTab with new screen pre-selected
  return <CrmTab {...tabProps} startOnNew={currentRoute === AppRoute.CrmNew} />;
}

export function AppWithProviders() {
  return (
    <>
      <DesktopBanner />
      <UpdatePrompt />
      <App />
      <Toaster
        position="top-center"
        toastOptions={{ style: { fontSize: '14px', maxWidth: '320px' } }}
      />
    </>
  );
}

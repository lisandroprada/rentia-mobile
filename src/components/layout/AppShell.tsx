import TopBar from './TopBar';
import BottomTabBar from './BottomTabBar';
import { AppRoute } from '../../types';

interface AppShellProps {
  title: string;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onBack?: () => void;
  topBarAction?: React.ReactNode;
  unreadChat?: number;
  overflowHidden?: boolean;
  children: React.ReactNode;
}

export default function AppShell({
  title,
  currentRoute,
  onNavigate,
  onBack,
  topBarAction,
  unreadChat,
  overflowHidden,
  children,
}: AppShellProps) {
  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      <TopBar title={title} onBack={onBack} action={topBarAction} />
      <main className={`flex-1 ${overflowHidden ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {children}
      </main>
      <BottomTabBar currentRoute={currentRoute} onNavigate={onNavigate} unreadChat={unreadChat} />
    </div>
  );
}

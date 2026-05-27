import { Home, LayoutList, MessageCircle, User } from 'lucide-react';
import { AppRoute } from '../../types';

type Tab = 'dashboard' | 'crm' | 'chat' | 'profile';

function routeToTab(route: AppRoute): Tab {
  if (route.startsWith('chat')) return 'chat';
  if (route === AppRoute.Profile) return 'profile';
  if (route === AppRoute.Dashboard) return 'dashboard';
  return 'crm';
}

interface BottomTabBarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  unreadChat?: number;
}

const tabs = [
  { id: 'dashboard' as Tab, label: 'Inicio', icon: Home, route: AppRoute.Dashboard },
  { id: 'crm' as Tab, label: 'CRM', icon: LayoutList, route: AppRoute.CrmList },
  { id: 'chat' as Tab, label: 'Chat', icon: MessageCircle, route: AppRoute.ChatList },
  { id: 'profile' as Tab, label: 'Perfil', icon: User, route: AppRoute.Profile },
];

export default function BottomTabBar({ currentRoute, onNavigate, unreadChat = 0 }: BottomTabBarProps) {
  const activeTab = routeToTab(currentRoute);

  return (
    <nav className="flex items-center border-t border-gray-100 bg-white safe-bottom">
      {tabs.map(({ id, label, icon: Icon, route }) => {
        const isActive = activeTab === id;
        const showBadge = id === 'chat' && unreadChat > 0;
        return (
          <button
            key={id}
            onClick={() => onNavigate(route)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative active:bg-gray-50 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadChat > 99 ? '99+' : unreadChat}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

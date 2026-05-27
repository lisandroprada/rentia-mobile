import { LogOut, User, Building2, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AppRoute } from '../../types';
import AppShell from '../../components/layout/AppShell';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

interface Props {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  unreadChat?: number;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  AGENT: 'Agente',
};

export default function ProfilePage({ currentRoute, onNavigate, unreadChat }: Props) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell title="Perfil" currentRoute={currentRoute} onNavigate={onNavigate} unreadChat={unreadChat}>
      <div className="flex flex-col gap-4 pb-8">
        {/* User card */}
        <div className="bg-white px-4 py-6 flex flex-col items-center gap-3 border-b border-gray-100">
          <Avatar name={fullName} src={user.avatarUrl} size="lg" />
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Badge
            label={ROLE_LABELS[user.role] ?? user.role}
            variant={user.role === 'SUPER_ADMIN' ? 'purple' : user.role === 'ADMIN' ? 'blue' : 'gray'}
          />
        </div>

        {/* Info rows */}
        <div className="bg-white border-y border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
            <User size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Nombre</p>
              <p className="text-sm font-medium text-gray-800">{fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
            <Building2 size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Empresa ID</p>
              <p className="text-sm font-medium text-gray-800 font-mono text-xs">{user.companyId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Shield size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Rol</p>
              <p className="text-sm font-medium text-gray-800">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="px-4">
          <p className="text-xs text-gray-400 text-center">Rentia Mobile v0.1.0</p>
        </div>

        {/* Logout */}
        <div className="px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm active:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </AppShell>
  );
}

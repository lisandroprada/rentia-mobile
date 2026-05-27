import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight, LayoutList, MessageCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { crmApi } from '../../api/crmApi';
import { waInboxApi } from '../../api/whatsappInboxApi';
import { AppRoute, CrmCase, CrmCaseStatus, CRM_STATUS_LABELS, CRM_ACTIVE_STATUSES } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from '../../components/layout/AppShell';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { formatRelativeTime } from '../../utils/dateUtils';

interface Props {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const PIPELINE_STAGES: CrmCaseStatus[] = ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'PROPUESTA', 'NEGOCIACION'];

function StatCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage({ currentRoute, onNavigate }: Props) {
  const { user } = useAuth();

  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ['crm-cases'],
    queryFn: async () => {
      const res = await crmApi.getCases();
      return res.data as CrmCase[];
    },
  });

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['wa-conversations'],
    queryFn: waInboxApi.getConversations,
    refetchInterval: 30_000,
  });

  const isLoading = loadingCases || loadingConvs;

  // Derived stats
  const activeCases = cases?.filter((c) => CRM_ACTIVE_STATUSES.includes(c.status)) ?? [];
  const recentCases = [...(cases ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const totalUnread = conversations?.reduce((acc, c) => acc + c.unread, 0) ?? 0;
  const recentConvs = [...(conversations ?? [])]
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
    .slice(0, 3);

  // Pipeline stage distribution (active statuses only)
  const stageCounts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = cases?.filter((c) => c.status === s).length ?? 0;
    return acc;
  }, {});
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  const firstName = user?.firstName ?? 'Usuario';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <AppShell title="Inicio" currentRoute={currentRoute} onNavigate={onNavigate}>
      <div className="flex flex-col gap-5 pb-8">

        {/* Greeting */}
        <div className="px-4 pt-4">
          <p className="text-sm text-gray-400">{greeting},</p>
          <h2 className="text-xl font-bold text-gray-900">{firstName}</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="px-4 grid grid-cols-2 gap-3">
              <StatCard
                label="Casos activos"
                value={activeCases.length}
                sub={`de ${cases?.length ?? 0} totales`}
                icon={<LayoutList size={18} className="text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                label="Sin leer"
                value={totalUnread}
                sub={`${conversations?.length ?? 0} conversaciones`}
                icon={<MessageCircle size={18} className="text-green-600" />}
                color="bg-green-50"
              />
              <StatCard
                label="En propuesta"
                value={(stageCounts['PROPUESTA'] ?? 0) + (stageCounts['NEGOCIACION'] ?? 0)}
                sub="Propuesta + Neg."
                icon={<TrendingUp size={18} className="text-purple-600" />}
                color="bg-purple-50"
              />
              <StatCard
                label="Nuevos hoy"
                value={
                  cases?.filter((c) => {
                    const d = new Date(c.createdAt);
                    const today = new Date();
                    return d.toDateString() === today.toDateString();
                  }).length ?? 0
                }
                sub="creados hoy"
                icon={<Clock size={18} className="text-orange-500" />}
                color="bg-orange-50"
              />
            </div>

            {/* Quick actions */}
            <div className="px-4 flex gap-3">
              <button
                onClick={() => onNavigate(AppRoute.CrmNew)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold active:bg-blue-700"
              >
                <Plus size={16} />
                Nuevo caso
              </button>
              {totalUnread > 0 && (
                <button
                  onClick={() => onNavigate(AppRoute.ChatList)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold active:bg-green-700"
                >
                  <MessageCircle size={16} />
                  {totalUnread} sin leer
                </button>
              )}
            </div>

            {/* Pipeline funnel */}
            <div className="px-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline</h3>
                <div className="flex flex-col gap-2">
                  {PIPELINE_STAGES.map((stage) => {
                    const count = stageCounts[stage];
                    const pct = Math.round((count / maxStageCount) * 100);
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-24 shrink-0">{CRM_STATUS_LABELS[stage]}</span>
                        <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 w-4 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent cases */}
            {recentCases.length > 0 && (
              <div className="px-4">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700">Casos recientes</h3>
                    <button
                      onClick={() => onNavigate(AppRoute.CrmList)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                    >
                      Ver todos <ArrowRight size={12} />
                    </button>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {recentCases.map((c) => {
                      const agentName = c.agent
                        ? `${c.agent.firstName} ${c.agent.lastName}`
                        : null;
                      return (
                        <li key={c.id}>
                          <button
                            onClick={() => onNavigate(AppRoute.CrmList)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                          >
                            <Avatar name={agentName || c.title} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {CRM_STATUS_LABELS[c.status]} · {agentName ?? '—'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">
                              {formatRelativeTime(c.updatedAt)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Recent conversations */}
            {recentConvs.length > 0 && (
              <div className="px-4">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700">Chat reciente</h3>
                    <button
                      onClick={() => onNavigate(AppRoute.ChatList)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                    >
                      Ver todos <ArrowRight size={12} />
                    </button>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {recentConvs.map((conv) => (
                      <li key={conv.caseId}>
                        <button
                          onClick={() => onNavigate(AppRoute.ChatList)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                        >
                          <Avatar name={conv.contactName} src={conv.profilePicUrl} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{conv.contactName}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {conv.lastMessage ?? conv.lastMediaType ?? '...'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-gray-400">{formatRelativeTime(conv.lastAt)}</span>
                            {conv.unread > 0 && (
                              <span className="min-w-[16px] h-4 px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Empty state */}
            {cases?.length === 0 && conversations?.length === 0 && (
              <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
                <AlertCircle size={40} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">Sin datos aún</p>
                <p className="text-xs text-gray-400">Creá tu primer caso para empezar</p>
                <button
                  onClick={() => onNavigate(AppRoute.CrmNew)}
                  className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                >
                  Crear caso
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

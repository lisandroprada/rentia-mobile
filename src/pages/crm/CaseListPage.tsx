import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { crmApi } from '../../api/crmApi';
import { CrmCase, CrmCaseStatus, CRM_STATUS_LABELS, CRM_ACTIVE_STATUSES } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/dateUtils';

const STATUS_VARIANT: Partial<Record<CrmCaseStatus, 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray'>> = {
  NUEVO: 'blue',
  CONTACTADO: 'blue',
  CALIFICADO: 'yellow',
  PROPUESTA: 'purple',
  NEGOCIACION: 'yellow',
  GANADO: 'green',
  PERDIDO: 'red',
  CERRADO: 'gray',
};

const ALL_STATUSES: CrmCaseStatus[] = ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO', 'CERRADO'];

interface Props {
  onOpenCase: (id: string) => void;
  onOpenContacts: () => void;
}

export default function CaseListPage({ onOpenCase, onOpenContacts }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<CrmCaseStatus | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['crm-cases'],
    queryFn: async () => {
      const res = await crmApi.getCases();
      return res.data as CrmCase[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.agent && `${c.agent.firstName} ${c.agent.lastName}`.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [data, search, filterStatus]);

  return (
    <div className="flex flex-col gap-0">
      {/* Search bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar casos..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
        </div>
        <button
          onClick={onOpenContacts}
          className="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200"
          aria-label="Contactos"
        >
          <Users size={18} />
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto bg-white border-b border-gray-100 no-scrollbar">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Todos
        </button>
        {CRM_ACTIVE_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {CRM_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin casos" description="No hay casos que coincidan con los filtros." />
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((c) => {
            const agentName = c.agent ? `${c.agent.firstName} ${c.agent.lastName}` : null;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onOpenCase(c.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white active:bg-gray-50 text-left"
                >
                  <Avatar name={agentName || c.title} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{c.title}</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(c.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge label={CRM_STATUS_LABELS[c.status]} variant={STATUS_VARIANT[c.status] ?? 'gray'} />
                      {agentName && <span className="text-xs text-gray-400 truncate">{agentName}</span>}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Search } from 'lucide-react';
import { waInboxApi, WaConversation } from '../../api/whatsappInboxApi';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/dateUtils';

type Filter = 'all' | 'unread' | 'no-bot' | 'waiting';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'No leídas' },
  { id: 'no-bot', label: 'Sin bot' },
  { id: 'waiting', label: 'Esperando' },
];

interface Props {
  onOpenThread: (caseId: string, contactName: string) => void;
}

function mediaLabel(type: WaConversation['lastMediaType']) {
  if (!type) return null;
  const labels = { image: 'Imagen', audio: 'Audio', video: 'Video', document: 'Documento' };
  return labels[type];
}

export default function ConversationListPage({ onOpenThread }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['wa-conversations'],
    queryFn: waInboxApi.getConversations,
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );

    return sorted.filter((conv) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = conv.contactName.toLowerCase().includes(q);
        const matchPhone = conv.phone.includes(q);
        if (!matchName && !matchPhone) return false;
      }

      if (filter === 'unread') return conv.unread > 0;
      if (filter === 'no-bot') return !conv.botEnabled;
      if (filter === 'waiting') return conv.lastDirection === 'INCOMING';
      return true;
    });
  }, [data, search, filter]);

  const counts = useMemo(() => {
    if (!data) return {} as Record<Filter, number>;
    return {
      all: data.length,
      unread: data.filter((c) => c.unread > 0).length,
      'no-bot': data.filter((c) => !c.botEnabled).length,
      waiting: data.filter((c) => c.lastDirection === 'INCOMING').length,
    };
  }, [data]);

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversación..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto bg-white border-b border-gray-100 no-scrollbar">
        {FILTERS.map(({ id, label }) => {
          const count = counts[id] ?? 0;
          const active = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full px-1 min-w-[16px] text-center ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Sin conversaciones"
          description={
            filter !== 'all' || search
              ? 'No hay conversaciones que coincidan.'
              : 'Las conversaciones de WhatsApp aparecerán aquí.'
          }
          icon={<MessageCircle size={40} />}
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((conv) => {
            const preview = conv.lastMessage || mediaLabel(conv.lastMediaType) || '...';
            const isIncoming = conv.lastDirection === 'INCOMING';
            return (
              <li key={conv.caseId}>
                <button
                  onClick={() => onOpenThread(conv.caseId, conv.contactName)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white active:bg-gray-50 text-left"
                >
                  <div className="relative shrink-0">
                    <Avatar name={conv.contactName} src={conv.profilePicUrl} size="md" />
                    {!conv.botEnabled && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}
                      >
                        {conv.contactName}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatRelativeTime(conv.lastAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${conv.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}
                      >
                        {isIncoming ? '' : 'Tú: '}
                        {preview}
                      </p>
                      {conv.unread > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread > 99 ? '99+' : conv.unread}
                        </span>
                      )}
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

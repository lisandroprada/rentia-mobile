import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { waInboxApi, WaConversation } from '../../api/whatsappInboxApi';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/dateUtils';

interface Props {
  onOpenThread: (caseId: string, contactName: string) => void;
}

function mediaLabel(type: WaConversation['lastMediaType']) {
  if (!type) return null;
  const labels = { image: 'Imagen', audio: 'Audio', video: 'Video', document: 'Documento' };
  return labels[type];
}

export default function ConversationListPage({ onOpenThread }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['wa-conversations'],
    queryFn: waInboxApi.getConversations,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Sin conversaciones"
        description="Las conversaciones de WhatsApp aparecerán aquí."
        icon={<MessageCircle size={40} />}
      />
    );
  }

  const sorted = [...data].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  return (
    <ul className="divide-y divide-gray-100">
      {sorted.map((conv) => {
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
  );
}

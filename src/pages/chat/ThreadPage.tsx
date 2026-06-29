import { useState, useRef, useEffect, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, Bot, BotOff, Image, FileText, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { waInboxApi, WaMessage } from '../../api/whatsappInboxApi';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/dateUtils';

interface Props {
  caseId: string;
}

function MediaPreview({ message }: { message: WaMessage }) {
  const meta = message.metadata as Record<string, unknown> | undefined;
  const mediaType = meta?.mediaType as string | undefined;

  if (!mediaType) return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;

  const icons: Record<string, React.ReactNode> = {
    image: <Image size={16} />,
    audio: <Mic size={16} />,
    document: <FileText size={16} />,
  };

  if (mediaType === 'image' && meta?.mediaUrl) {
    return (
      <img
        src={meta.mediaUrl as string}
        alt="imagen"
        className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
      />
    );
  }

  if (mediaType === 'audio' && meta?.mediaUrl) {
    return (
      <audio
        controls
        src={meta.mediaUrl as string}
        className="max-w-[220px] h-9"
        preload="metadata"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm opacity-80">
      {icons[mediaType] ?? <Paperclip size={16} />}
      <span>{message.content || mediaType}</span>
    </div>
  );
}

export default function ThreadPage({ caseId }: Props) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ['wa-thread', caseId],
    queryFn: () => waInboxApi.getThread(caseId),
    refetchInterval: 15_000,
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) =>
      waInboxApi.sendMessage(caseId, msg, thread?.waInstanceId, thread?.waJid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-thread', caseId] });
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] });
      setText('');
    },
    onError: () => toast.error('No se pudo enviar el mensaje'),
  });

  const mediaMutation = useMutation({
    mutationFn: (file: File) =>
      waInboxApi.sendMedia(caseId, file, '', thread?.waInstanceId, thread?.waJid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-thread', caseId] });
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] });
    },
    onError: () => toast.error('No se pudo enviar el archivo'),
  });

  const botMutation = useMutation({
    mutationFn: (enabled: boolean) => waInboxApi.setBotEnabled(caseId, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wa-thread', caseId] }),
    onError: () => toast.error('No se pudo cambiar el bot'),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mediaMutation.mutate(file);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100">
        <Avatar name={thread.contactName} src={thread.profilePicUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{thread.contactName}</p>
          <p className="text-xs text-gray-400">{thread.phone}</p>
        </div>
        <button
          onClick={() => botMutation.mutate(!thread.botEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            thread.botEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
          title={thread.botEnabled ? 'Bot activo' : 'Bot inactivo'}
        >
          {thread.botEnabled ? <Bot size={14} /> : <BotOff size={14} />}
          {thread.botEnabled ? 'Bot ON' : 'Bot OFF'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {thread.messages.map((msg) => {
          const isOut = msg.direction === 'OUTGOING';
          return (
            <div
              key={msg.id}
              className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  isOut
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
                }`}
              >
                <MediaPreview message={msg} />
                <p
                  className={`text-[10px] mt-1 text-right ${
                    isOut ? 'text-blue-200' : 'text-gray-400'
                  }`}
                >
                  {formatDateTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-gray-100 safe-bottom"
      >
        <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 text-gray-400 active:text-gray-600"
          aria-label="Adjuntar"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3.5 py-2.5 rounded-full bg-gray-100 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMutation.isPending || mediaMutation.isPending}
          className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center active:bg-blue-700 disabled:opacity-40 shrink-0"
          aria-label="Enviar"
        >
          {sendMutation.isPending ? <Spinner size={14} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

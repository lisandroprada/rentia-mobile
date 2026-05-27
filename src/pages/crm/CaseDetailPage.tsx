import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Mail, MessageCircle, FileText, Users, Plus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { crmApi } from '../../api/crmApi';
import { CrmCase, CrmInteractionType, CRM_STATUS_LABELS } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/dateUtils';

const INTERACTION_ICONS: Record<CrmInteractionType, React.ReactNode> = {
  LLAMADA: <Phone size={14} />,
  EMAIL: <Mail size={14} />,
  WHATSAPP: <MessageCircle size={14} />,
  NOTA: <FileText size={14} />,
  REUNION: <Users size={14} />,
  SISTEMA: <FileText size={14} />,
};

const INTERACTION_LABELS: Record<CrmInteractionType, string> = {
  LLAMADA: 'Llamada',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  NOTA: 'Nota',
  REUNION: 'Reunión',
  SISTEMA: 'Sistema',
};

const STATUS_VARIANT: Record<string, 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray'> = {
  NUEVO: 'blue', CONTACTADO: 'blue', CALIFICADO: 'yellow',
  PROPUESTA: 'purple', NEGOCIACION: 'yellow', GANADO: 'green',
  PERDIDO: 'red', CERRADO: 'gray',
};

interface Props {
  caseId: string;
  onBack: () => void;
}

export default function CaseDetailPage({ caseId }: Props) {
  const queryClient = useQueryClient();
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<CrmInteractionType>('NOTA');
  const [logContent, setLogContent] = useState('');

  const { data: crmCase, isLoading } = useQuery({
    queryKey: ['crm-case', caseId],
    queryFn: async () => {
      const res = await crmApi.getCase(caseId);
      return res.data as CrmCase;
    },
  });

  const logMutation = useMutation({
    mutationFn: (data: { type: CrmInteractionType; content: string }) =>
      crmApi.logInteraction(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['crm-cases'] });
      setLogContent('');
      setShowLogForm(false);
      toast.success('Interacción registrada');
    },
    onError: () => toast.error('No se pudo registrar'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!crmCase) return null;

  const agentName = crmCase.agent
    ? `${crmCase.agent.firstName} ${crmCase.agent.lastName}`
    : null;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <Avatar name={agentName || crmCase.title} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">{crmCase.title}</h2>
            {agentName && <p className="text-sm text-gray-500">{agentName}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge label={CRM_STATUS_LABELS[crmCase.status]} variant={STATUS_VARIANT[crmCase.status] ?? 'gray'} />
              {crmCase.source && <span className="text-xs text-gray-400">· {crmCase.source}</span>}
              {crmCase.assignedUser && (
                <span className="text-xs text-gray-400">· {crmCase.assignedUser.name}</span>
              )}
            </div>
          </div>
        </div>
        {crmCase.tags && crmCase.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {crmCase.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Log interaction */}
      <div className="px-4">
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm active:bg-blue-700"
        >
          <Plus size={16} />
          Registrar interacción
          <ChevronDown size={14} className={`transition-transform ${showLogForm ? 'rotate-180' : ''}`} />
        </button>

        {showLogForm && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              {(['NOTA', 'LLAMADA', 'EMAIL', 'WHATSAPP', 'REUNION'] as CrmInteractionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setLogType(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${logType === t ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {INTERACTION_ICONS[t]}
                  {INTERACTION_LABELS[t]}
                </button>
              ))}
            </div>
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="Descripción..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowLogForm(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">
                Cancelar
              </button>
              <button
                disabled={!logContent.trim() || logMutation.isPending}
                onClick={() => logMutation.mutate({ type: logType, content: logContent.trim() })}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {logMutation.isPending ? <Spinner size={16} /> : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactions timeline */}
      <div className="px-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial</h3>
        {!crmCase.interactions || crmCase.interactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin interacciones aún</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {crmCase.interactions.map((interaction) => (
              <li key={interaction.id} className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  {INTERACTION_ICONS[interaction.type]}
                </div>
                <div className="flex-1 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600">{INTERACTION_LABELS[interaction.type]}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(interaction.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{interaction.content}</p>
                  {interaction.user && (
                    <p className="text-xs text-gray-400 mt-1">{interaction.user.name}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

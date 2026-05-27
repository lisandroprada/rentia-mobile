import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { crmApi } from '../../api/crmApi';
import { CrmCaseStatus, CRM_ACTIVE_STATUSES, CRM_STATUS_LABELS } from '../../types';
import Spinner from '../../components/ui/Spinner';

interface Props {
  onCreated: (id: string) => void;
  onCancel: () => void;
}

const SOURCES = ['WhatsApp', 'Email', 'Referido', 'Web', 'Llamada', 'Otro'];

export default function NewCasePage({ onCreated, onCancel }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<CrmCaseStatus>('NUEVO');
  const [source, setSource] = useState('');

  const mutation = useMutation({
    mutationFn: () => crmApi.createCase({ title: title.trim(), status, source: source || undefined }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['crm-cases'] });
      toast.success('Caso creado');
      onCreated(res.data.id);
    },
    onError: () => toast.error('No se pudo crear el caso'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Título del caso *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Juan Pérez - Depto 2 ambientes"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Estado</label>
        <div className="flex flex-wrap gap-2">
          {CRM_ACTIVE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {CRM_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Fuente</label>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(source === s ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${source === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim() || mutation.isPending}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Spinner size={16} /> : 'Crear caso'}
        </button>
      </div>
    </form>
  );
}

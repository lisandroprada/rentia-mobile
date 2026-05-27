import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Phone, Mail } from 'lucide-react';
import { crmApi } from '../../api/crmApi';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phones?: { number: string }[];
}

interface Props {
  onBack: () => void;
}

export default function ContactSearchPage({ onBack: _onBack }: Props) {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['crm-agents-search', search],
    queryFn: async () => {
      if (!search.trim()) {
        const res = await crmApi.getContactsList();
        return res.data as Agent[];
      }
      const res = await crmApi.searchAgents(search);
      return res.data as Agent[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contactos..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            autoFocus
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={search ? `No se encontraron contactos para "${search}"` : 'No hay contactos.'}
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {data.map((agent) => {
            const name = `${agent.firstName} ${agent.lastName}`;
            const phone = agent.phones?.[0]?.number;
            return (
              <li key={agent.id} className="flex items-center gap-3 px-4 py-3.5 bg-white">
                <Avatar name={name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={11} />
                        {phone}
                      </span>
                    )}
                    {agent.email && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                        <Mail size={11} />
                        {agent.email}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

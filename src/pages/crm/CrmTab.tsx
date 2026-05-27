import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppRoute } from '../../types';
import AppShell from '../../components/layout/AppShell';
import CaseListPage from './CaseListPage';
import CaseDetailPage from './CaseDetailPage';
import NewCasePage from './NewCasePage';
import ContactSearchPage from './ContactSearchPage';

type CrmScreen = 'list' | 'detail' | 'new' | 'contacts';

interface Props {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  startOnNew?: boolean;
  unreadChat?: number;
}

export default function CrmTab({ currentRoute, onNavigate, startOnNew, unreadChat }: Props) {
  const [screen, setScreen] = useState<CrmScreen>(startOnNew ? 'new' : 'list');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleOpenCase = (id: string) => {
    setSelectedCaseId(id);
    setScreen('detail');
  };

  const screenTitle: Record<CrmScreen, string> = {
    list: 'CRM',
    detail: 'Caso',
    new: 'Nuevo caso',
    contacts: 'Contactos',
  };

  const canGoBack = screen !== 'list';

  return (
    <AppShell
      title={screenTitle[screen]}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      onBack={canGoBack ? () => setScreen('list') : undefined}
      unreadChat={unreadChat}
      topBarAction={
        screen === 'list' ? (
          <button
            onClick={() => setScreen('new')}
            className="p-1.5 rounded-lg text-blue-600 active:bg-blue-50"
            aria-label="Nuevo caso"
          >
            <Plus size={22} />
          </button>
        ) : undefined
      }
    >
      {screen === 'list' && (
        <CaseListPage onOpenCase={handleOpenCase} onOpenContacts={() => setScreen('contacts')} />
      )}
      {screen === 'detail' && selectedCaseId && (
        <CaseDetailPage caseId={selectedCaseId} onBack={() => setScreen('list')} />
      )}
      {screen === 'new' && (
        <NewCasePage
          onCreated={(id) => {
            setSelectedCaseId(id);
            setScreen('detail');
          }}
          onCancel={() => setScreen('list')}
        />
      )}
      {screen === 'contacts' && <ContactSearchPage onBack={() => setScreen('list')} />}
    </AppShell>
  );
}

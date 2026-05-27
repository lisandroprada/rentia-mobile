import { useState } from 'react';
import { AppRoute } from '../../types';
import AppShell from '../../components/layout/AppShell';
import ConversationListPage from './ConversationListPage';
import ThreadPage from './ThreadPage';

type ChatScreen = 'list' | 'thread';

interface Props {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  unreadChat?: number;
}

export default function ChatTab({ currentRoute, onNavigate, unreadChat }: Props) {
  const [screen, setScreen] = useState<ChatScreen>('list');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState('');

  const handleOpenThread = (caseId: string, contactName: string) => {
    setSelectedCaseId(caseId);
    setSelectedContactName(contactName);
    setScreen('thread');
  };

  return (
    <AppShell
      title={screen === 'list' ? 'Conversaciones' : selectedContactName}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      onBack={screen === 'thread' ? () => setScreen('list') : undefined}
      unreadChat={unreadChat}
    >
      {screen === 'list' && <ConversationListPage onOpenThread={handleOpenThread} />}
      {screen === 'thread' && selectedCaseId && (
        <ThreadPage caseId={selectedCaseId} />
      )}
    </AppShell>
  );
}

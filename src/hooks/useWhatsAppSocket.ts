import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../api/apiClient';

export function useWhatsAppSocket(enabled: boolean) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('rm_token');
    // Connect to own origin so the Vite proxy forwards /socket.io → backend (dev)
    // In prod, API_BASE_URL is the backend URL directly
    const socketUrl = API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('wa:new_message', ({ caseId }: { caseId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['wa-thread', caseId] });
    });

    socket.on('wa:conversation_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['wa-conversations'] });
    });

    socket.on('wa:message_ack', ({ caseId }: { caseId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['wa-thread', caseId] });
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);

  return socketRef;
}

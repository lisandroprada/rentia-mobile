import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WaConversation } from '../api/whatsappInboxApi';

export function useAppBadge(): number {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const conversations = queryClient.getQueryData<WaConversation[]>(['wa-conversations']);
      const total = conversations?.reduce((sum, c) => sum + (c.unread || 0), 0) ?? 0;
      setUnreadCount(total);
      if ('setAppBadge' in navigator) {
        (total > 0 ? navigator.setAppBadge(total) : navigator.clearAppBadge()).catch(() => {});
      }
    };

    update();

    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'wa-conversations') update();
    });

    return () => {
      unsub();
      if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
    };
  }, [queryClient]);

  return unreadCount;
}

import apiClient from './apiClient';

export interface WaConversation {
  caseId: string;
  phone: string;
  contactName: string;
  status: string;
  botEnabled: boolean;
  tags: string[];
  lastMessage: string | null;
  lastMediaType: 'image' | 'audio' | 'video' | 'document' | null;
  lastDirection: 'INCOMING' | 'OUTGOING' | null;
  lastAt: string;
  profilePicUrl: string | null;
  unread: number;
}

export interface WaMessage {
  id: string;
  direction: 'INCOMING' | 'OUTGOING';
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface WaThread {
  caseId: string;
  phone: string;
  agentId: string | null;
  waInstanceId: string | null;
  waJid: string | null;
  contactName: string;
  status: string;
  botEnabled: boolean;
  tags: string[];
  profilePicUrl: string | null;
  messages: WaMessage[];
}

export interface WaContactCandidate {
  agentId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  matchReason: 'phone' | 'name';
  phone: string | null;
}

export const waInboxApi = {
  getConversations: async (): Promise<WaConversation[]> => {
    const res = await apiClient.get('/whatsapp-inbox/conversations');
    return res.data;
  },

  getThread: async (caseId: string): Promise<WaThread> => {
    const res = await apiClient.get(`/whatsapp-inbox/conversations/${caseId}/thread`);
    return res.data;
  },

  setBotEnabled: async (caseId: string, enabled: boolean) => {
    const res = await apiClient.patch(`/whatsapp-inbox/conversations/${caseId}/bot`, { enabled });
    return res.data;
  },

  setTags: async (caseId: string, tags: string[]) => {
    const res = await apiClient.patch(`/whatsapp-inbox/conversations/${caseId}/tags`, { tags });
    return res.data;
  },

  sendMessage: async (
    caseId: string,
    text: string,
    waInstanceId?: string | null,
    waJid?: string | null,
  ) => {
    const res = await apiClient.post(`/whatsapp-inbox/conversations/${caseId}/send`, {
      text,
      ...(waInstanceId ? { waInstanceId, waJid } : {}),
    });
    return res.data;
  },

  sendMedia: async (
    caseId: string,
    file: File,
    caption: string,
    waInstanceId?: string | null,
    waJid?: string | null,
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    if (waInstanceId) form.append('waInstanceId', waInstanceId);
    if (waJid) form.append('waJid', waJid);
    const res = await apiClient.post(`/whatsapp-inbox/conversations/${caseId}/send-media`, form);
    return res.data;
  },

  getContactCandidates: async (caseId: string): Promise<{ candidates: WaContactCandidate[] }> => {
    const res = await apiClient.get(`/whatsapp-inbox/conversations/${caseId}/contact-candidates`);
    return res.data;
  },

  linkContact: async (caseId: string, agentId: string) => {
    const res = await apiClient.post(`/whatsapp-inbox/conversations/${caseId}/link-contact`, {
      agentId,
    });
    return res.data;
  },

  createContact: async (
    caseId: string,
    data: { firstName: string; lastName?: string; email?: string },
  ) => {
    const res = await apiClient.post(
      `/whatsapp-inbox/conversations/${caseId}/create-contact`,
      data,
    );
    return res.data;
  },

  deleteConversation: async (caseId: string) => {
    const res = await apiClient.delete(`/whatsapp-inbox/conversations/${caseId}`);
    return res.data;
  },
};

import apiClient from './apiClient';

export const crmApi = {
  getAnalytics: (from: string, to: string) =>
    apiClient.get(`/api/v1/crm/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  getContactsList: () => apiClient.get('/api/v1/crm/contacts-list'),
  searchAgents: (q: string) => apiClient.get(`/api/v1/crm/agents-search?q=${encodeURIComponent(q)}`),
  linkCaseAgent: (caseId: string, agentId: string) =>
    apiClient.post(`/api/v1/crm/cases/${caseId}/link-agent`, { agentId }),
  registerContact: (
    caseId: string,
    data: { firstName: string; lastName?: string; phone?: string; email?: string },
  ) => apiClient.post(`/api/v1/crm/cases/${caseId}/register-contact`, data),

  getCases: () => apiClient.get('/api/v1/crm/cases'),
  getCase: (id: string) => apiClient.get(`/api/v1/crm/cases/${id}`),
  createCase: (data: unknown) => apiClient.post('/api/v1/crm/cases', data),
  updateCase: (id: string, data: unknown) => apiClient.patch(`/api/v1/crm/cases/${id}`, data),
  logInteraction: (caseId: string, data: unknown) =>
    apiClient.post(`/api/v1/crm/cases/${caseId}/interactions`, data),

  getCampaigns: () => apiClient.get('/api/v1/crm/campaigns'),
  getCampaign: (id: string) => apiClient.get(`/api/v1/crm/campaigns/${id}`),
  createCampaign: (data: unknown) => apiClient.post('/api/v1/crm/campaigns', data),
  executeCampaign: (id: string) => apiClient.post(`/api/v1/crm/campaigns/${id}/execute`),
  deleteCampaign: (id: string) => apiClient.delete(`/api/v1/crm/campaigns/${id}`),
  getSmartResponses: () => apiClient.get('/api/v1/crm/smart-responses'),

  getGroups: () => apiClient.get('/api/v1/crm/groups'),
  createGroup: (data: unknown) => apiClient.post('/api/v1/crm/groups', data),
  updateGroup: (id: string, data: unknown) => apiClient.patch(`/api/v1/crm/groups/${id}`, data),
  deleteGroup: (id: string) => apiClient.delete(`/api/v1/crm/groups/${id}`),
  addAgentsToGroup: (id: string, agentIds: string[]) =>
    apiClient.post(`/api/v1/crm/groups/${id}/agents`, { agentIds }),

  getTags: () => apiClient.get('/api/v1/crm/tags'),
  createTag: (data: unknown) => apiClient.post('/api/v1/crm/tags', data),
  updateTag: (id: string, data: unknown) => apiClient.patch(`/api/v1/crm/tags/${id}`, data),
  deleteTag: (id: string) => apiClient.delete(`/api/v1/crm/tags/${id}`),

  getSegments: () => apiClient.get('/api/v1/crm/segments'),
  previewSegment: (conditions: unknown) =>
    apiClient.post('/api/v1/crm/segments/preview', { conditions }),
  createSegment: (data: unknown) => apiClient.post('/api/v1/crm/segments', data),
  updateSegment: (id: string, data: unknown) =>
    apiClient.patch(`/api/v1/crm/segments/${id}`, data),
  deleteSegment: (id: string) => apiClient.delete(`/api/v1/crm/segments/${id}`),
};

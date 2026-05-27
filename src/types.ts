export enum AppRoute {
  Login = 'login',
  Dashboard = 'dashboard',
  CrmList = 'crm-list',
  CrmDetail = 'crm-detail',
  CrmNew = 'crm-new',
  ContactSearch = 'contact-search',
  ChatList = 'chat-list',
  ChatThread = 'chat-thread',
  Profile = 'profile',
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Auth2FAResponse {
  require2FA: true;
  userId: string;
  tempToken: string;
}

export type CrmCaseStatus =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'CALIFICADO'
  | 'PROPUESTA'
  | 'NEGOCIACION'
  | 'GANADO'
  | 'PERDIDO'
  | 'CERRADO';

export type CrmInteractionType = 'WHATSAPP' | 'EMAIL' | 'LLAMADA' | 'REUNION' | 'NOTA' | 'SISTEMA';

export const CRM_TERMINAL_STATUSES: CrmCaseStatus[] = ['GANADO', 'PERDIDO', 'CERRADO'];
export const CRM_ACTIVE_STATUSES: CrmCaseStatus[] = ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'PROPUESTA', 'NEGOCIACION'];

export const CRM_STATUS_LABELS: Record<CrmCaseStatus, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  CALIFICADO: 'Calificado',
  PROPUESTA: 'Propuesta',
  NEGOCIACION: 'Negociación',
  GANADO: 'Ganado',
  PERDIDO: 'Perdido',
  CERRADO: 'Cerrado',
};

export interface CrmCase {
  id: string;
  title: string;
  status: CrmCaseStatus;
  source?: string | null;
  expectedClose?: string | null;
  expectedValue?: number | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  assignedUser?: { id: string; name: string; email?: string | null } | null;
  agent?: { id: string; firstName: string; lastName: string; email?: string | null } | null;
  interactions?: CrmInteraction[];
}

export interface CrmInteraction {
  id: string;
  type: CrmInteractionType;
  direction?: 'INCOMING' | 'OUTGOING';
  content: string;
  createdAt: string;
  user?: { id: string; name: string } | null;
}

import apiClient from './apiClient';
import { AuthResponse, Auth2FAResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse | Auth2FAResponse> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  verify2FA: async (userId: string, code: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/2fa/verify', { userId, code });
    return res.data;
  },
};

import axios from 'axios';

// In dev: empty string → relative URLs go through Vite proxy (no CORS)
// In prod: VITE_API_URL points to the real backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadSession = !!localStorage.getItem('rm_token');
      localStorage.removeItem('rm_token');
      localStorage.removeItem('rm_user');
      localStorage.removeItem('rm_current_route');
      if (hadSession) {
        sessionStorage.setItem('session_expired', '1');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;

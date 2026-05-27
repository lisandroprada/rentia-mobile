import { API_BASE_URL } from '../api/apiClient';

export function getImageUrl(url?: string | null, fallbackName?: string): string {
  if (!url) {
    if (fallbackName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=e0e7ff&color=4338ca&bold=true&size=128`;
    }
    return '';
  }

  if (url.startsWith('http') || url.startsWith('data:')) return url;

  if (url.includes('uploads/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${base}${path}`;
  }

  return url;
}

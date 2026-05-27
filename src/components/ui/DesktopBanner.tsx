import { useEffect } from 'react';

function isDesktop(): boolean {
  return window.innerWidth >= 768 && !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function DesktopBanner() {
  useEffect(() => {
    if (isDesktop()) {
      window.location.replace('https://www.rentia.com.ar');
    }
  }, []);

  return null;
}

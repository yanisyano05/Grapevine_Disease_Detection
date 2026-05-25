// Web : injecte le lien manifest dans le <head> et enregistre le service worker.
// Appelé une fois au montage de l'app (App.tsx).
export function registerPWA(): void {
  if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // enregistrement best-effort : ne jamais casser l'app si le SW échoue
      });
    });
  }
}

/**
 * Registers a minimal service worker shell so production can evolve toward
 * SDD “silent refresh” patterns without blocking on Firebase Messaging today.
 */
export function registerGenesisServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/genesis-sw.js').catch(() => {
      /* non-fatal */
    })
  })
}

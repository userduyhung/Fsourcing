// Utility to show a global toast via a window event
export type AppToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export function showAppToast(message: string, type: AppToastType = 'info', duration = 2000) {
  try {
    const ev = new CustomEvent('app:toast', { detail: { message, type, duration } });
    window.dispatchEvent(ev as Event);
  } catch (e) {
    // fallback: console
    // eslint-disable-next-line no-console
    console.warn('Failed to dispatch app:toast event', e);
  }
}

export default showAppToast;

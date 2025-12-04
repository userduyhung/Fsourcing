// Utility to show a global toast via a window event
import { logger } from './logger';

export type AppToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export function showAppToast(message: string, type: AppToastType = 'info', duration = 2000) {
  try {
    const ev = new CustomEvent('app:toast', { detail: { message, type, duration } });
    window.dispatchEvent(ev as Event);
  } catch (e) {
    // fallback: console
    logger.warn('Toast', 'failed to dispatch app:toast event', e);
  }
}

export default showAppToast;

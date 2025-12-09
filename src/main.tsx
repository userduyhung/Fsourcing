import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/apiTest';
import './utils/debugToken';

// If the URL contains VNPAY return parameters (vnp_*) we want to ensure
// the SPA navigates to the PaymentSuccess route. In some hosting setups
// direct navigation to nested paths can return 404; a safer approach is
// to have the payment provider return to a known static page (e.g. /payment-return.html)
// which redirects here to '/', preserving the query string. We detect vnp_ params
// and programmatically update history so React Router renders the correct page.
try {
  const params = new URLSearchParams(window.location.search);
  let hasVnp = false;
  for (const key of params.keys()) {
    if (key.startsWith('vnp_')) { hasVnp = true; break; }
  }

  if (hasVnp) {
    // Replace history so SPA router sees the payment-success path with same query string
    const target = '/buyer/payment-success' + window.location.search;
    // Only replace if we're not already on the target
    if (window.location.pathname !== '/buyer/payment-success') {
      window.history.replaceState({}, document.title, target);
    }
  }
} catch (e) {
  // ignore errors
}

// Runtime diagnostics: print any runtime-injected env values so deployments are easier to debug
try {
  // eslint-disable-next-line no-console
  console.debug('Runtime env check:', {
    __API_BASE: (window as any).__API_BASE,
    __ENV: (window as any).__ENV,
    location: { href: window.location.href }
  });
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

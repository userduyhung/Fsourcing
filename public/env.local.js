// Example runtime config for local development.
// Drop this file into the `public/` folder of the frontend while developing
// to force the app to call a local backend instead of using the Vite proxy
// or the production backend. Remove or ignore this file in production.

(function () {
  window.__ENV = window.__ENV || {};

  // Set this to your backend base (include '/api' if your backend expects it).
  // By default this file now points to the deployed Railway backend so the
  // frontend will use the deployed API instead of a local host.
  window.__ENV.VITE_LOCAL_BACKEND = 'https://uni-b2b-fixed-production.up.railway.app/api';

  // Optionally you can also set the VITE_API_BASE_URL used in production codepaths
  // window.__ENV.VITE_API_BASE_URL = 'http://localhost:5000/api';

  // You can also set a direct override used by some code
  // window.__API_BASE = window.__ENV.VITE_LOCAL_BACKEND;
})();

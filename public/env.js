// Runtime config injected at deploy-time.
// Copy this file to your production server as `/env.js` (served at site root)
// to override the API base URL at runtime without rebuilding the bundle.
// Backend URL provided by you:
// https://uni-b2b-fixed-production.up.railway.app/

// NOTE: The frontend previously used a relative '/api' base, which caused
// requests like `https://fsourcing.vercel.app/api/...` and 404s on production.
// To ensure the frontend calls your Railway backend, we set the runtime
// variables below. `VITE_API_BASE_URL` includes the '/api' prefix because
// the app's axios client uses '/api' as the default base in many places.

(function () {
	window.__ENV = window.__ENV || {};
	// Prefer VITE_API_BASE_URL (used first by runtime resolver)
	window.__ENV.VITE_API_BASE_URL = 'https://uni-b2b-fixed-production.up.railway.app/api';
	// Also provide the non-/api base for modules that expect it
	window.__ENV.VITE_API_BASE = 'https://uni-b2b-fixed-production.up.railway.app';

	// Cloudinary runtime configuration (added so client-side uploads work without rebuild)
	// Values copied from your local `.env` file. Replace if you need a different account/preset.
	window.__ENV.VITE_CLOUDINARY_CLOUD_NAME = window.__ENV.VITE_CLOUDINARY_CLOUD_NAME || 'dcworyvtj';
	window.__ENV.VITE_CLOUDINARY_UPLOAD_PRESET = window.__ENV.VITE_CLOUDINARY_UPLOAD_PRESET || 'fsourcing-create';
	// Direct override used by axios client code
	window.__API_BASE = window.__API_BASE || window.__ENV.VITE_API_BASE_URL;
})();

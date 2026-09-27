/**
 * API configuration helper.
 * When running on GitHub Pages, routes to the live backend server.
 * When running in local development or AI Studio preview, uses relative path.
 */
export function getApiBaseUrl(): string {
  // Check if explicit environment variable is set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If running on GitHub Pages (static hosting), route to the live AI Studio backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return 'https://ais-pre-heksirbv62fljp6wp4dn6t-145505513988.asia-southeast1.run.app';
  }

  return '';
}

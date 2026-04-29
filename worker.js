/**
 * Welleni — Cloudflare Worker
 *
 * Serves static files from the ./public folder via the ASSETS binding.
 * All unknown routes fall back to index.html (SPA support).
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // ── 1. Try to serve exact static file (e.g. script.min.js, config.min.js)
      if (url.pathname !== '/' && url.pathname.includes('.')) {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return withSecurityHeaders(assetResponse);
        }
      }

      // ── 2. All other routes → serve index.html (SPA fallback)
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      return withSecurityHeaders(indexResponse);

    } catch (err) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Adds security headers to every response.
 */
function withSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);

  // Prevent clickjacking
  newHeaders.set('X-Frame-Options', 'DENY');

  // Stop MIME sniffing
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  // Force HTTPS
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Referrer policy
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (disable unused browser features)
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Cache static assets for 1 day, HTML for 5 mins
  const path = response.url || '';
  if (path.endsWith('.js') || path.endsWith('.css')) {
    newHeaders.set('Cache-Control', 'public, max-age=86400');
  } else {
    newHeaders.set('Cache-Control', 'public, max-age=300');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

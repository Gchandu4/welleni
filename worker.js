export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Bot pattern blocking
    const BOT_SCAN_PATTERNS = ["/wp-","/phpmyadmin","/.env","/admin/","/xmlrpc","/.git"];
    if (BOT_SCAN_PATTERNS.some(p => path.startsWith(p))) {
      return new Response('Not Found', { status: 404 });
    }

    // Path cleanup — redirect double slashes
    if (path.includes('//')) {
      url.pathname = path.replace(/\/\/+/g, '/');
      return Response.redirect(url.toString(), 301);
    }


    let response;

    // SPA routing with static asset fallback
    try {
      response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        const indexUrl = new URL('/', url.origin);
        response = await env.ASSETS.fetch(indexUrl.toString());
      }
    } catch {
      response = new Response('Server Error', { status: 500 });
    }

    response = new Response(response.body, response);

    // Security headers
    const sh = response.headers;
    sh.set('X-Frame-Options', 'DENY');
    sh.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    sh.set('X-Content-Type-Options', 'nosniff');
    sh.set('Referrer-Policy', 'no-referrer');
    sh.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Cache control
    const ext = path.split('.').pop();
    if (['js','css'].includes(ext)) {
      sh.set('Cache-Control', 'public, max-age=86400');
    } else {
      sh.set('Cache-Control', 'public, max-age=300');
    }

    return response;
  }
};

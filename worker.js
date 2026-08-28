// ─────────────────────────────────────────────
//  Welleni Worker — static asset routing + API
// ─────────────────────────────────────────────
//
// NEW in this version (see audit report):
//   POST /api/send-otp      — generates + sends OTP server-side (Fast2SMS key never touches the client)
//   POST /api/verify-otp    — checks OTP against KV, so it can't be spoofed from devtools
//   POST /api/create-order  — creates a real Razorpay order server-side
//   POST /api/verify-payment— verifies the Razorpay signature server-side before you trust a payment
//
// Requires (set these once, see report for exact commands):
//   wrangler secret put FAST2SMS_API_KEY
//   wrangler secret put RAZORPAY_KEY_ID
//   wrangler secret put RAZORPAY_KEY_SECRET
//   a KV namespace bound as OTP_STORE in wrangler.toml

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function hmacSha256Hex(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleApi(request, env, path) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  try {
    return await routeApi(body, env, path);
  } catch (e) {
    // Never let an unexpected error (e.g. a missing KV/secret binding) crash to a
    // non-JSON response — the client always expects JSON back from /api/*.
    console.error('API error on', path, ':', e.message);
    return json({ error: 'Server error: ' + e.message }, 500);
  }
}

async function routeApi(body, env, path) {
  // ── Send OTP ──
  if (path === '/api/send-otp') {
    const { phone, role } = body;
    if (!phone || !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      return json({ error: 'Valid phone number required' }, 400);
    }
    if (!env.OTP_STORE) {
      return json({ error: 'OTP storage is not configured on the server yet (OTP_STORE KV binding missing)' }, 500);
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP for 5 minutes, keyed by role+phone so patient/hospital flows don't collide
    await env.OTP_STORE.put(`otp:${role}:${cleanPhone}`, otp, { expirationTtl: 300 });

    if (!env.FAST2SMS_API_KEY) {
      // No key configured yet — dev fallback so local/testing isn't blocked.
      // Real deploys should always have the secret set (see report).
      return json({ ok: true, devMode: true, devOtp: otp });
    }

    try {
      await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${env.FAST2SMS_API_KEY}&message=Your+Welleni+OTP+is+${otp}.+Valid+for+5+minutes.&language=english&route=q&numbers=${cleanPhone}`);
      return json({ ok: true });
    } catch (e) {
      return json({ error: 'SMS send failed' }, 502);
    }
  }

  // ── Verify OTP ──
  if (path === '/api/verify-otp') {
    const { phone, role, otp } = body;
    if (!phone || !role || !otp) return json({ verified: false }, 400);
    if (!env.OTP_STORE) {
      return json({ error: 'OTP storage is not configured on the server yet (OTP_STORE KV binding missing)' }, 500);
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const stored = await env.OTP_STORE.get(`otp:${role}:${cleanPhone}`);
    if (stored && stored === String(otp)) {
      await env.OTP_STORE.delete(`otp:${role}:${cleanPhone}`); // one-time use
      return json({ verified: true });
    }
    return json({ verified: false });
  }

  // ── Create Razorpay order ──
  if (path === '/api/create-order') {
    const { amount } = body; // amount in rupees
    if (!amount || amount <= 0) return json({ error: 'Invalid amount' }, 400);
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return json({ error: 'Razorpay is not configured on the server yet' }, 500);
    }
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR' })
    });
    if (!res.ok) return json({ error: 'Order creation failed' }, 502);
    const order = await res.json();
    return json({ order_id: order.id, amount: order.amount, key: env.RAZORPAY_KEY_ID });
  }

  // ── Verify Razorpay payment signature ──
  if (path === '/api/verify-payment') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ valid: false }, 400);
    }
    if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'Razorpay is not configured on the server yet' }, 500);
    const expected = await hmacSha256Hex(`${razorpay_order_id}|${razorpay_payment_id}`, env.RAZORPAY_KEY_SECRET);
    return json({ valid: expected === razorpay_signature });
  }

  // ── Send WhatsApp message (Meta Cloud API) ──
  // Used for booking confirmations to both the patient and the hospital.
  // IMPORTANT: Meta requires business-initiated messages (i.e. not a reply within
  // an existing 24h user session) to use a pre-approved message template, not
  // free-form text. Create and get "appointment_confirmation" approved in
  // Meta Business Manager before relying on this in production — until then,
  // Meta will reject these sends outside the 24h window.
  if (path === '/api/send-whatsapp') {
    const { to, message } = body;
    if (!to || !message) return json({ error: 'to and message are required' }, 400);
    if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) {
      return json({ error: 'WhatsApp is not configured on the server yet' }, 500);
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message }
        })
      });
      const result = await res.json();
      if (!res.ok) return json({ error: result.error?.message || 'WhatsApp send failed' }, 502);
      return json({ ok: true });
    } catch (e) {
      return json({ error: 'WhatsApp send failed' }, 502);
    }
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    // API routes — handled before static asset / bot logic
    if (path.startsWith('/api/')) {
      return handleApi(request, env, path);
    }

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

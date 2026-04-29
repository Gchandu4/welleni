/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              Welleni — App Configuration                         ║
 * ║                                                                  ║
 * ║  ⚠️  SECURITY NOTICE:                                           ║
 * ║  Never commit real API keys to version control.                  ║
 * ║  For production, load these from a backend/environment variable. ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * HOW TO SECURE THESE KEYS:
 *  1. Supabase anon key: Restrict using Row Level Security (RLS) in
 *     your Supabase project — do NOT use service_role key here.
 *  2. Google Maps key: Restrict to your domain(s) in Google Cloud Console
 *     → APIs & Services → Credentials → HTTP referrers.
 *  3. Razorpay key: Use only the PUBLIC key here. Keep the secret server-side.
 *  4. WhatsApp/Phone numbers: Move to your backend to avoid scraping.
 */

const CONFIG = {
  /* ── Supabase ─────────────────────────────────────────────────────
   * Supabase anon key is designed to be public, but MUST be paired
   * with proper Row Level Security (RLS) policies in your database.
   * ---------------------------------------------------------------- */
  SUPABASE_URL: 'https://tawzbsjsetjarzcouhsq.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd3pic2pzZXRqYXJ6Y291aHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjE1OTksImV4cCI6MjA5MjY5NzU5OX0.-Zy46oI24uD9W9caapJTrIGXWvf5XlomEHDxO70zTu4',

  /* ── Google Maps ──────────────────────────────────────────────────
   * Restrict this key in Google Cloud Console to your domain only.
   * ---------------------------------------------------------------- */
  GOOGLE_MAPS_API_KEY: 'AIzaSyCtZB2BU4UPcX9OfYnR_bs50o2YyfneYE8',

  /* ── WhatsApp / Contact ──────────────────────────────────────────
   * Consider proxying this through your backend to avoid scraping.
   * ---------------------------------------------------------------- */
  WA_NUMBER: '917032527095',

  /* ── App Settings ─────────────────────────────────────────────── */
  APP_NAME: 'Welleni',
  SESSION_TTL_HOURS: 8,
};

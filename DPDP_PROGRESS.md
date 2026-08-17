# DPDP Act Compliance — Progress Log

**Repo:** welleni (web) &nbsp;|&nbsp; **Branch:** `compliance/dpdp` (not pushed) &nbsp;|&nbsp; **Date:** 14 Aug 2026
**Scope of this pass:** the SPA at `index (5).html` (the actual production entry point —
`render.yaml` and `worker.js` both route everything to `/index.html`), plus its source
fragment `landing.html`. `script.js` / `script.min.js` / the standalone `Patient
dashboard.html`, `Hospital dashboard.html`, `Register.html`, `login.html`, `modals.html`
appear to be earlier/alternate builds not loaded by the production entry point — **flagged
below, not touched**, since editing dead code risks confusion without benefit. Worth
confirming with you and deleting if truly unused.

This is an **engineering-level audit**, not a legal opinion. Everything below marked
"FOR LEGAL REVIEW" is a best-effort draft that must be checked by a lawyer before you rely
on it publicly. That said — DPDP's core obligations (consent, notice, breach reporting,
rights handling) phase in over 18 months from the Rules' Nov 2025 notification, with full
enforcement expected around **May 2027**. You're building this well ahead of the deadline,
which is exactly the right time: retrofitting consent/audit trails onto a live user base
later is much more expensive than shipping it now, pre-scale.

---

## 1. What personal data Welleni collects (audit findings)

| Collection point | Data | Category |
|---|---|---|
| Patient registration | Name, mobile, email, DOB, blood group, password | Personal |
| Patient profile | Allergies, emergency contact | Health / personal |
| Health records | Uploaded reports/prescriptions (Supabase Storage) | Health |
| Emergency SOS | Live geolocation + Medical ID, shared with nearest hospital | Location / health |
| Hospital registration | Name, reg. no., city, pincode, contact person, email, phone, password | Business / personal |
| Appointment + payment | Appointment details; card/UPI handled by Razorpay directly | Personal / financial |
| Landing page "Request a Demo" | Hospital name, mobile | Personal (lead) |
| WhatsApp click-to-chat | Message content if user-initiated | Personal |
| Hospital locator map | Approximate location, browser data — sent to Google only if this feature is used | Technical |

**Third parties data is shared with:** Supabase (DB/auth/storage), Razorpay (payments),
Google Maps Platform (locator), Fast2SMS (OTP SMS), WhatsApp/Meta (chat), hosting/CDN
(Render and/or Cloudflare — see open item on which is actually live). **No ad or analytics
trackers were found** (no Google Analytics, no Meta Pixel, no Hotjar/Mixpanel/etc.) — so
the consent-banner scope here is narrower than a typical marketing site: it only gates
Google Maps.

---

## 2. What was built

1. **Privacy Notice** — new page (`page-privacy` in `index (5).html`), covers: what data,
   why, retention (draft position pending your sign-off), third parties, your DPDP rights,
   grievance contact, children's data, security. Every placeholder that needs a real
   decision (entity name, retention periods, Grievance Officer's actual name) is marked
   `[LEGAL REVIEW: ...]` inline.
2. **Terms of Service** — new page (`page-terms`), skeleton with a full **Data Protection
   clause** (lawful processing, minimisation, security safeguards, breach notification,
   rights, retention, third parties, grievance redressal). Everything else in the ToS
   (liability, jurisdiction, medical disclaimer) is a placeholder — **not drafted**, needs a
   lawyer, flagged clearly.
3. **Data Rights Request form** — new page (`page-data-rights`): name, contact, role,
   request type (access/correct/erase/withdraw/nominate/grievance), details. Submits to a
   new `dsr_requests` Supabase table; if that write fails (e.g. before you run the
   migration), it falls back to opening a pre-filled email to `privacy@welleni.com` so no
   request is silently lost.
4. **Consent checkboxes**, unticked by default, per purpose, at every data-entry point:
   - Patient registration: required "I agree to Privacy Notice + Terms" + optional
     "send me reminders/offers via WhatsApp/SMS/email"
   - Hospital registration: same pattern, worded for an organisational signer
   - Landing-page "Request a Demo" lead form: required "I agree Welleni can contact me"
   - Each registration now **blocks submission** if the required box isn't ticked
   - Consent decisions are stored two ways: (a) a `consent` JSON snapshot on the
     patient/hospital row itself, (b) an **append-only audit log** in a new
     `consent_records` table (survives account deletion, so you can prove what was
     consented to and when, even after a user is erased)
5. **Consent banner** gating the only non-essential tracker found (Google Maps). Options:
   Accept all / Essential only / Manage preferences. Decision stored in `localStorage`,
   versioned so a future policy change can re-prompt users. Razorpay's checkout script was
   also converted from eager-load-on-every-page to lazy-load-at-payment-time — not a
   tracker in the cookie-banner sense, but a good practice on both privacy and performance
   grounds, so it's not loaded silently in the background before the user asks to pay.
6. **Grievance contact** published in the footer (both `index (5).html`'s embedded landing
   page and `landing.html`) and on the Privacy Notice page — `privacy@welleni.com`.
   `[LEGAL REVIEW: this is a placeholder inbox — set it up and name a real Grievance
   Officer before launch, per the DPDP Rules' grievance redressal requirement.]`
7. **`BREACH_RUNBOOK.md`** — step-by-step incident response process, aligned to Rule 7 of
   the DPDP Rules 2025 (notify the Data Protection Board of India "without delay", detailed
   follow-up report within 72 hours), plus ready-to-use templates for the Board notice, the
   72-hour detailed report, and the affected-user notice. Also flags the separate,
   shorter CERT-In 6-hour incident-reporting clock as something to check with counsel.
8. **`supabase_migration_dpdp.sql`** — adds the `consent` column to `patients`/`hospitals`,
   creates `consent_records`, `dsr_requests`, and formalises `demo_requests`, with starter
   RLS policies (anon can INSERT, cannot SELECT/UPDATE/DELETE — those need an authenticated
   admin role you'll add later). **Not yet run against the live Supabase project** — I
   don't have credentials for it and wouldn't want to run schema changes against your
   production DB unsupervised anyway. Run it in staging first.

---

## 3. Security gaps flagged (not silently fixed — these touch live auth/payment code and need your sign-off before changing)

Ranked roughly by urgency:

1. **🔴 Live Fast2SMS API key hardcoded in client-side JS**, committed to the repo
   (`index (5).html` line ~1643 area, and duplicated in `script.js`). Anyone can view-source
   it and send SMS on your account. **Rotate this key immediately** and proxy OTP sending
   through a backend/serverless function instead — this is independent of DPDP and worth
   doing today regardless of this audit.
2. **🔴 OTP verification is entirely client-side.** `otpVerified.patient = true` can be set
   from the browser devtools console, bypassing "verification" completely. Combined with #1,
   this also enables SMS-pumping fraud using your live key. This is effectively the
   "unverified captcha" gap you asked me to flag — there's no captcha anywhere (register,
   login, or the demo-request form), and the one identity check that exists (OTP) doesn't
   actually verify anything server-side.
3. **🔴 Verify Row Level Security on `patients` / `hospitals` in the Supabase dashboard.**
   The app queries these tables directly from the browser using the anon key (for login and
   registration). If RLS is permissive or off, any anon key holder can read every patient's
   health data, not just their own — this is the single highest-impact item on this list
   for DPDP Section 8(5) "reasonable security safeguards." I can't verify this from the
   code; please check the Supabase dashboard directly.
4. **🟠 Password verification has a plaintext fallback ("fail-open").** In `verifyPw()`:
   `if (!stored.includes(':')) return stored === pw;` — if a stored password value doesn't
   contain the salt separator, it compares in plaintext instead of failing closed. In normal
   operation every stored password goes through `hashPw()` so this path shouldn't trigger,
   but it's a landmine: a manual DB edit, a migration, or a future code path that writes a
   raw password would silently downgrade to plaintext comparison instead of erroring.
5. **🟠 Client-side password hashing is single-round SHA-256** (with a random salt), not
   bcrypt/argon2/PBKDF2. Reasonable as a stopgap since there's no backend, but weak against
   offline brute-force if the `patients`/`hospitals` table ever leaks. Moving auth
   server-side (even a small serverless function) would let you use a proper slow hash.
6. **🟡 Inconsistent clickjacking protection across deploy configs.** `_headers` (Render)
   sets `X-Frame-Options: ALLOWALL`; `worker.js` (Cloudflare Worker) sets `DENY`. Given this
   is a health platform, `DENY` (or at least `SAMEORIGIN`) should be the target everywhere —
   worth figuring out which deploy path is actually live and fixing the other.
7. **🟡 HTTPS itself looks fine** — Supabase, Fast2SMS, and Razorpay are all called over
   `https://`, and `worker.js` sets HSTS. The only `http://` strings in the codebase are SVG
   XML namespace URIs, which aren't network requests. No gap found here beyond #6.
8. **⚪ Pre-existing bug, unrelated to DPDP:** in the hospital-registration branch of
   `handleRegister()`, the `password` variable is referenced but never declared in that
   scope (the line that reads it is commented out). This likely throws a `ReferenceError` on
   every hospital registration attempt today. Left untouched since it's outside this audit's
   scope, but you'll want to fix it — happy to if you'd like.

---

## 4. Open items / decisions needed from you (not something I can resolve alone)

- [ ] **Run `supabase_migration_dpdp.sql`** against staging, then production.
- [ ] **Check RLS policies** on `patients` and `hospitals` in the Supabase dashboard (item 3 above) — this is the top priority.
- [ ] **Rotate the Fast2SMS key** and move OTP sending server-side (item 1).
- [ ] Set up a real `privacy@welleni.com` inbox and name an actual **Grievance Officer** (name, designation, address) — currently a placeholder.
- [ ] Decide and publish real **retention periods** (draft positions are in the Privacy Notice, marked for review) — ideally checked against any clinical record-keeping rules that apply to health data you store.
- [ ] Get the **Privacy Notice, Terms of Service, and this runbook reviewed by a lawyer** familiar with the DPDP Act before removing the "FOR LEGAL REVIEW" banners.
- [ ] Decide on a **minor/guardian consent flow** — currently absent; flagged in the Privacy Notice.
- [ ] Confirm which hosting path is actually live (Render vs Cloudflare Worker) and align the security headers (item 6).
- [ ] Decide whether to delete the apparently-unused `script.js`, `script.min.js`, and the standalone dashboard/register/login HTML fragments, or confirm they're used somewhere I haven't found (e.g. a different deploy target) — I did not modify them.
- [ ] Fix the hospital-registration `password` ReferenceError (item 8) — not done here as it's outside DPDP scope, but blocking hospital signups.
- [ ] Set a response-time SLA for data-rights requests and publish it on the Data Rights page (currently a placeholder note).

---

## 5. Why this is worth having, beyond "compliance"

- **Sales leverage with hospitals:** every hospital you approach (per your CareVale/Welleni
  outreach) will increasingly ask about data protection as a procurement gate, especially
  once DPDP enforcement ramps up toward May 2027. Having a real Privacy Notice, consent
  trail, and breach process is something you can point to in a pitch, not just paperwork.
- **Investor/partner due diligence:** a documented breach runbook and consent audit trail
  are exactly what shows up on an early-stage health-tech due-diligence checklist.
- **It's cheap now, expensive later:** you have a small, pre-scale user base. Retrofitting
  consent records and RLS onto a live table with thousands of rows is a much bigger job
  than doing it now.

/**
 * Welleni — Partial Page Loader
 * Fetches each HTML partial and injects it into #app-root
 * Load order matters: modals first, then pages, then payment modal
 */

const PARTIALS = [
  { file: 'partials/modals.html',            label: 'Modals & WhatsApp'      },
  { file: 'partials/landing.html',           label: 'Landing Page'           },
  { file: 'partials/register.html',          label: 'Register Page'          },
  { file: 'partials/login.html',             label: 'Login Page'             },
  { file: 'partials/patient-dashboard.html', label: 'Patient Dashboard'      },
  { file: 'partials/hospital-dashboard.html',label: 'Hospital Dashboard'     },
  { file: 'partials/payment-modal.html',     label: 'Payment Modal'          },
];

async function loadPartials() {
  const root = document.getElementById('app-root');
  if (!root) { console.error('[Loader] #app-root not found'); return; }

  for (const partial of PARTIALS) {
    try {
      const res = await fetch(partial.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      root.insertAdjacentHTML('beforeend', html);
      console.log(`[Loader] ✅ Loaded: ${partial.label}`);
    } catch (err) {
      console.error(`[Loader] ❌ Failed to load ${partial.label}:`, err.message);
    }
  }

  // All partials injected — now bootstrap the app script
  const appScript = document.createElement('script');
  appScript.src = 'script.min.js';
  document.body.appendChild(appScript);
  console.log('[Loader] 🚀 App script injected');
}

document.addEventListener('DOMContentLoaded', loadPartials);

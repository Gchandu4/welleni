// Configuration file for environment variables
// This file loads environment variables for the application

const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'your-project-url-here',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'
  },
  
  // Razorpay Configuration
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'your-razorpay-key-here'
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Welleni',
    url: import.meta.env.VITE_APP_URL || window.location.origin
  }
};

// For static sites without build process, use window object
if (typeof window !== 'undefined') {
  window.APP_CONFIG = config;
}

export default config;

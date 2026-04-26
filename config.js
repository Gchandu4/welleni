// Configuration file for environment variables
// This file loads environment variables for the application

const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tawzbsjsetjarzcouhsq.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd3pic2pzZXRqYXJ6Y291aHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjE1OTksImV4cCI6MjA5MjY5NzU5OX0.-Zy46oI24uD9W9caapJTrIGXWvf5XlomEHDxO70zTu4'
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

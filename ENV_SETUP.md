# 🔐 Environment Variables Setup Guide

## Overview

Your Welleni app uses environment variables to store sensitive credentials like API keys. This guide shows you how to set them up for both local development and Render deployment.

---

## 📁 Files Created

| File | Purpose | Git Tracked? |
|------|---------|--------------|
| `.env` | Local environment variables | ❌ No (ignored) |
| `.env.example` | Template for .env | ✅ Yes |
| `env.js` | JavaScript config (local) | ❌ No (ignored) |
| `env.example.js` | Template for env.js | ✅ Yes |
| `config.js` | Config loader | ✅ Yes |

---

## 🚀 Quick Setup

### For Local Development

1. **Copy the example file**
   ```bash
   copy env.example.js env.js
   ```

2. **Edit `env.js` with your credentials**
   ```javascript
   window.ENV = {
     SUPABASE_URL: 'https://xxxxx.supabase.co',
     SUPABASE_ANON_KEY: 'eyJhbGc...',
     RAZORPAY_KEY_ID: 'rzp_test_xxxxx',
     APP_NAME: 'Welleni',
     APP_URL: 'http://localhost:3000'
   };
   ```

3. **Add to your HTML** (before closing `</head>` tag)
   ```html
   <script src="env.js"></script>
   ```

4. **Use in your code**
   ```javascript
   const supabaseUrl = window.ENV.SUPABASE_URL;
   const supabaseKey = window.ENV.SUPABASE_ANON_KEY;
   ```

---

## 🌐 Render Deployment Setup

### Method 1: Environment Variables (Recommended)

1. **Go to Render Dashboard**
   - https://dashboard.render.com/
   - Select your "welleni" static site

2. **Navigate to Environment**
   - Click "Environment" in the left sidebar

3. **Add Environment Variables**
   
   Click "Add Environment Variable" and add each:

   | Key | Value | Example |
   |-----|-------|---------|
   | `SUPABASE_URL` | Your Supabase URL | `https://xxxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   | `RAZORPAY_KEY_ID` | Your Razorpay key | `rzp_test_xxxxx` or `rzp_live_xxxxx` |
   | `APP_NAME` | App name | `Welleni` |
   | `APP_URL` | Your Render URL | `https://welleni.onrender.com` |

4. **Save and Redeploy**
   - Click "Save Changes"
   - Render will automatically redeploy

### Method 2: Create env.js for Production

1. **Create `env.js` with production values**
   ```javascript
   window.ENV = {
     SUPABASE_URL: 'https://your-prod-project.supabase.co',
     SUPABASE_ANON_KEY: 'your-production-anon-key',
     RAZORPAY_KEY_ID: 'rzp_live_xxxxx',
     APP_NAME: 'Welleni',
     APP_URL: 'https://welleni.onrender.com'
   };
   ```

2. **Commit and push**
   ```bash
   git add env.js
   git commit -m "Add production environment config"
   git push
   ```

⚠️ **Warning**: This exposes your keys in the repository. Only use public/anon keys!

---

## 🔑 Getting Your API Keys

### Supabase

1. Go to https://app.supabase.com/
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### Razorpay

1. Go to https://dashboard.razorpay.com/
2. Click "Settings" → "API Keys"
3. Generate keys (Test or Live mode)
4. Copy **Key ID** → `RAZORPAY_KEY_ID`

⚠️ **Never expose your Razorpay Key Secret!**

---

## 📝 Update Your HTML

Add this line in your `index.html` before the closing `</head>` tag:

```html
<!-- Environment Configuration -->
<script src="env.js"></script>
```

Then update your JavaScript to use the config:

```javascript
// OLD WAY (hardcoded)
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';

// NEW WAY (from env.js)
const SUPABASE_URL = window.ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY;
const RAZORPAY_KEY_ID = window.ENV.RAZORPAY_KEY_ID;
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use `.env` and `env.js` for local development
- Add `.env` and `env.js` to `.gitignore`
- Use Render's Environment Variables for production
- Only use **public/anon** keys in client-side code
- Use **test** keys during development
- Use **live** keys only in production

### ❌ DON'T:
- Commit `.env` or `env.js` to Git
- Expose secret keys in client-side code
- Use live keys during development
- Share your `.env` file publicly
- Hardcode credentials in `index.html`

---

## 🧪 Testing Your Setup

### Local Test

1. Open `index.html` in browser
2. Open Developer Console (F12)
3. Type: `console.log(window.ENV)`
4. You should see your configuration object

### Production Test

1. Visit your Render URL
2. Open Developer Console (F12)
3. Type: `console.log(window.ENV)`
4. Verify values are correct

---

## 🔄 Different Environments

### Development (.env)
```bash
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=dev-key-here
RAZORPAY_KEY_ID=rzp_test_xxxxx
APP_URL=http://localhost:3000
```

### Production (Render Environment Variables)
```bash
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod-key-here
RAZORPAY_KEY_ID=rzp_live_xxxxx
APP_URL=https://welleni.onrender.com
```

---

## 🆘 Troubleshooting

### "window.ENV is undefined"

**Problem**: `env.js` not loaded

**Solution**: 
- Check `env.js` exists
- Verify `<script src="env.js"></script>` is in HTML
- Check browser console for errors

### "API calls failing"

**Problem**: Wrong credentials

**Solution**:
- Verify keys in `env.js` or Render Environment Variables
- Check Supabase project is active
- Verify Razorpay keys are correct mode (test/live)

### "Keys exposed in Git"

**Problem**: Committed `env.js` or `.env`

**Solution**:
```bash
# Remove from Git but keep locally
git rm --cached env.js
git rm --cached .env
git commit -m "Remove sensitive files"
git push

# Verify .gitignore includes them
echo "env.js" >> .gitignore
echo ".env" >> .gitignore
```

---

## 📋 Checklist

### Local Development
- [ ] Copy `env.example.js` to `env.js`
- [ ] Add your API keys to `env.js`
- [ ] Add `<script src="env.js"></script>` to HTML
- [ ] Test in browser console
- [ ] Verify `.gitignore` includes `env.js`

### Render Deployment
- [ ] Add environment variables in Render dashboard
- [ ] Or commit `env.js` with production values
- [ ] Deploy to Render
- [ ] Test on production URL
- [ ] Verify API calls work

---

## 📚 Additional Resources

- [Supabase API Docs](https://supabase.com/docs/guides/api)
- [Razorpay Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

**Need help?** Check `RENDER_DEPLOYMENT.md` for more deployment info.

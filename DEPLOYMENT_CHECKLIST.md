# ✅ Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup

- [ ] Run `setup-env.bat` to create `env.js`
- [ ] Add your Supabase credentials to `env.js`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
- [ ] Add your Razorpay key to `env.js`
  - [ ] `RAZORPAY_KEY_ID`
- [ ] Test locally to ensure everything works
- [ ] Verify `env.js` is in `.gitignore` (should NOT be committed)

### 2. Code Review

- [ ] Test all features locally
- [ ] Check patient dashboard works
- [ ] Check hospital dashboard works
- [ ] Test appointment booking
- [ ] Test emergency SOS button
- [ ] Verify payment integration (test mode)
- [ ] Check responsive design on mobile

### 3. Git Repository

- [ ] Initialize Git (if not done): `git init`
- [ ] Add all files: `git add -A`
- [ ] Commit: `git commit -m "Ready for deployment"`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin YOUR_REPO_URL`
- [ ] Push: `git push -u origin main`

---

## Render Deployment

### 4. Create Render Account

- [ ] Sign up at https://render.com (free)
- [ ] Verify your email
- [ ] Connect GitHub account

### 5. Deploy Static Site

- [ ] Go to https://dashboard.render.com/
- [ ] Click "New +" → "Static Site"
- [ ] Select your GitHub repository
- [ ] Configure settings:
  - [ ] **Name**: `welleni`
  - [ ] **Branch**: `main`
  - [ ] **Build Command**: (leave empty)
  - [ ] **Publish Directory**: `.`
- [ ] Click "Create Static Site"

### 6. Add Environment Variables

- [ ] Go to your site → "Environment"
- [ ] Add each variable:
  - [ ] `SUPABASE_URL` = `https://xxxxx.supabase.co`
  - [ ] `SUPABASE_ANON_KEY` = `eyJhbGc...`
  - [ ] `RAZORPAY_KEY_ID` = `rzp_test_xxxxx` or `rzp_live_xxxxx`
  - [ ] `APP_NAME` = `Welleni`
  - [ ] `APP_URL` = `https://welleni.onrender.com`
- [ ] Click "Save Changes"
- [ ] Wait for automatic redeploy

---

## Post-Deployment

### 7. Test Production Site

- [ ] Visit your Render URL: `https://welleni.onrender.com`
- [ ] Test patient login/signup
- [ ] Test hospital login/signup
- [ ] Check all dashboard features
- [ ] Test appointment booking
- [ ] Test emergency SOS
- [ ] Verify payment integration works
- [ ] Test on mobile devices
- [ ] Check browser console for errors

### 8. Configure Custom Domain (Optional)

- [ ] Go to Render → Settings → Custom Domain
- [ ] Add your domain (e.g., `www.welleni.com`)
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate (automatic)
- [ ] Test custom domain

### 9. Security & Performance

- [ ] Verify HTTPS is working
- [ ] Check security headers are applied
- [ ] Test page load speed
- [ ] Verify CDN is working
- [ ] Check mobile responsiveness

---

## Maintenance

### 10. Monitoring

- [ ] Bookmark Render dashboard
- [ ] Check deployment logs regularly
- [ ] Monitor bandwidth usage
- [ ] Set up uptime monitoring (optional)

### 11. Updates

When you make changes:

- [ ] Edit files locally
- [ ] Test changes locally
- [ ] Commit: `git add -A && git commit -m "Description"`
- [ ] Push: `git push`
- [ ] Render auto-deploys (wait 1-2 minutes)
- [ ] Test production site

---

## Troubleshooting

### Site shows 404
- [ ] Check Publish Directory is `.`
- [ ] Verify `index.html` is in root
- [ ] Check deployment logs

### API calls failing
- [ ] Verify environment variables in Render
- [ ] Check Supabase project is active
- [ ] Verify Razorpay keys are correct

### Build fails
- [ ] Leave Build Command empty
- [ ] Check deployment logs for errors

### Styles not loading
- [ ] Check browser console
- [ ] Verify CDN links work
- [ ] Clear browser cache

---

## Quick Reference

### Local Development
```bash
# Setup environment
setup-env.bat

# Start local server
npm start
# or
npx serve .
```

### Git Commands
```bash
# Commit changes
git add -A
git commit -m "Your message"
git push

# Check status
git status

# View logs
git log --oneline
```

### Render URLs
- Dashboard: https://dashboard.render.com/
- Your site: https://welleni.onrender.com
- Docs: https://render.com/docs

---

## Support Resources

- [ ] `ENV_SETUP.md` - Environment variables guide
- [ ] `RENDER_DEPLOYMENT.md` - Detailed deployment guide
- [ ] `QUICK_START.md` - Quick start guide
- [ ] `README.md` - Project documentation

---

## Final Checklist

Before going live:

- [ ] All features tested and working
- [ ] Environment variables configured
- [ ] Custom domain set up (if applicable)
- [ ] HTTPS working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Payment integration tested
- [ ] Emergency features tested
- [ ] User authentication working
- [ ] Database connections working

---

**🎉 Congratulations! Your Welleni healthcare platform is live!**

**Production URL**: https://welleni.onrender.com

---

*Last updated: Ready for deployment*

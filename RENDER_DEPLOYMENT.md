# Render Deployment Guide for Welleni

## Prerequisites
- A Render account (sign up at https://render.com)
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)

## Option 1: Deploy via Render Dashboard (Recommended)

### Step 1: Push to Git Repository

If you haven't already, initialize and push your code:

```bash
git init
git add .
git commit -m "Initial commit - Welleni healthcare app"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create New Static Site on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Click "New +" button
   - Select "Static Site"

2. **Connect Repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Click "Connect"

3. **Configure Build Settings**
   - **Name**: `welleni` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Build Command**: Leave empty or use `echo "Static site"`
   - **Publish Directory**: `.` (root directory)
   - Click "Create Static Site"

### Step 3: Wait for Deployment
- Render will automatically deploy your site
- You'll get a URL like: `https://welleni.onrender.com`

## Option 2: Deploy with render.yaml (Blueprint)

Your project now includes a `render.yaml` file for automated deployment.

### Steps:

1. **Push render.yaml to your repository**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Create Blueprint on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

## Option 3: Manual Static Site Setup

1. **Go to Render Dashboard**
   - https://dashboard.render.com/

2. **New Static Site**
   - Click "New +" → "Static Site"
   - Choose "Deploy an existing image from a registry" or "Public Git repository"

3. **Manual Configuration**
   ```
   Name: welleni
   Build Command: (leave empty)
   Publish Directory: .
   ```

4. **Add Custom Headers** (Optional)
   - Go to Settings → Headers
   - Add:
     ```
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     ```

5. **Add Redirects** (Optional)
   - Go to Settings → Redirects/Rewrites
   - Add rewrite rule: `/* → /index.html`

## Environment Variables (If Needed)

If your app uses Supabase or Razorpay API keys:

1. Go to your service → "Environment"
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `RAZORPAY_KEY_ID`

**Note**: Since this is a static site with client-side JavaScript, API keys will be visible in the browser. Make sure to use public/anon keys only.

## Custom Domain Setup

1. Go to your static site dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `www.welleni.com`)
4. Update your DNS records as instructed:
   - Add CNAME record pointing to your Render URL

## Auto-Deploy on Git Push

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update site"
git push
```

## Project Structure

Your deployment includes:
- ✅ `index.html` - Main application
- ✅ `render.yaml` - Render configuration
- ✅ `package.json` - Node.js metadata
- ✅ `_headers` - Custom headers (for Cloudflare)
- ✅ `_redirects` - Redirects (for Cloudflare)

## Troubleshooting

### Site shows 404
- Ensure `index.html` is in the root directory
- Check "Publish Directory" is set to `.`
- Add rewrite rule: `/* → /index.html`

### Build fails
- Static sites don't need a build command
- Leave "Build Command" empty or use `echo "Static site"`

### Styles/Scripts not loading
- Check browser console for errors
- Verify all external CDN links are working:
  - Google Fonts
  - Supabase JS
  - Razorpay Checkout

### API Keys not working
- Remember: This is a client-side app
- API keys in HTML/JS are visible to users
- Use only public/anonymous keys
- Consider using Render Web Services for backend API

## Free Tier Limits

Render Free Tier includes:
- ✅ Static sites (unlimited)
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Auto-deploy from Git

## Next Steps After Deployment

1. **Test your site**: Visit the Render URL
2. **Set up custom domain**: Add your own domain
3. **Monitor**: Check Render dashboard for deployment logs
4. **Update**: Push changes to Git for auto-deployment

## Support

- Render Docs: https://render.com/docs/static-sites
- Render Community: https://community.render.com/
- Status Page: https://status.render.com/

---

**Your site will be live at**: `https://welleni.onrender.com` (or your custom domain)

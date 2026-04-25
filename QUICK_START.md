# 🚀 Quick Start - Deploy Welleni to Render

## ⚡ Fastest Way (5 minutes)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `welleni`
3. Keep it **Public**
4. Click **"Create repository"**

### Step 2: Push Your Code
Open Command Prompt in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/welleni.git
git push -u origin main
```

**OR** just double-click: `deploy-render.bat`

### Step 3: Deploy on Render
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Static Site"**
3. Click **"Connect GitHub"** (authorize if needed)
4. Select **"welleni"** repository
5. Configure:
   - **Name**: `welleni`
   - **Branch**: `main`
   - **Build Command**: *(leave empty)*
   - **Publish Directory**: `.`
6. Click **"Create Static Site"**

### Step 4: Done! 🎉
Your site will be live at: `https://welleni.onrender.com`

---

## 📋 Alternative: Without Git

If you don't want to use Git:

### Option A: Use Render CLI
```bash
npm install -g render
render login
render deploy
```

### Option B: Manual Upload
1. Zip your project files
2. Use Render's manual deployment option
3. Upload the zip file

---

## 🔧 Configuration Files Included

- ✅ `render.yaml` - Render configuration
- ✅ `index.html` - Your app
- ✅ `package.json` - Node.js metadata
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - Documentation

---

## 🆘 Troubleshooting

### "Git is not recognized"
- Install Git: https://git-scm.com/download/win
- Restart Command Prompt

### "Permission denied (publickey)"
- Use HTTPS instead of SSH
- URL format: `https://github.com/username/repo.git`

### "Site shows 404"
- Check Publish Directory is set to `.`
- Ensure `index.html` is in root folder

### "Build failed"
- Leave Build Command empty for static sites
- Or use: `echo "Static site"`

---

## 📞 Need Help?

- 📖 Full Guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- 🌐 Render Docs: https://render.com/docs/static-sites
- 💬 Render Community: https://community.render.com/

---

## 🎯 What You Get

✅ Free hosting  
✅ Automatic SSL (HTTPS)  
✅ Global CDN  
✅ Auto-deploy on Git push  
✅ Custom domain support  
✅ 100 GB bandwidth/month  

---

**Ready to deploy? Double-click `deploy-render.bat` to get started!**

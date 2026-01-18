# Deploying EduChain Frontend to Netlify

This guide walks you through deploying the EduChain React frontend to Netlify.

## Prerequisites

- GitHub repository with your code (✅ Already done!)
- Netlify account (free tier available)
- Backend deployed on Render (✅ Already done!)

---

## Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

---

## Step 2: Prepare Frontend for Production

### 2.1 Verify Build Configuration

The `netlify.toml` file is already created in the `frontend/` directory with:
- Build command: `npm run build`
- Publish directory: `build`
- SPA redirects (for React Router)
- Node version: 18

### 2.2 Test Build Locally (Optional)

Test that the build works:

```bash
cd frontend
npm run build
```

This should create a `build/` folder. If it works, you're ready to deploy!

---

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Log in to [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**

2. **Connect to GitHub**
   - Click **"Connect to GitHub"** if not already connected
   - Authorize Netlify to access your repositories
   - Select **"Ancel-duke/EduChain"**

3. **Configure Build Settings**
   - **Base directory**: `frontend` ⚠️ **Important!**
   - **Build command**: `npm run build` (auto-detected)
   - **Publish directory**: `build` (auto-detected)
   - **Branch to deploy**: `master` (or `main`)

4. **Set Environment Variables**
   Click **"Show advanced"** → **"New variable"** and add:

   ```env
   REACT_APP_API_URL=https://educhain-nbk6.onrender.com/api
   REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   REACT_APP_WALLETCONNECT_PROJECT_ID=
   ```

   **Important Notes:**
   - Replace `https://educhain-nbk6.onrender.com` with your actual Render backend URL
   - Replace contract address with your deployed contract address
   - `WALLETCONNECT_PROJECT_ID` is optional (can leave empty)

5. **Deploy**
   - Click **"Deploy site"**
   - Netlify will start building and deploying
   - Wait for build to complete (~2-5 minutes)

6. **Get Your URL**
   - Once deployed, you'll get a URL like: `https://educhain-xyz123.netlify.app`
   - You can customize the site name in **Site settings** → **Change site name**

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd frontend
   netlify init
   ```
   - Follow prompts to link to existing site or create new one
   - Select `frontend` as base directory

4. **Set Environment Variables**
   ```bash
   netlify env:set REACT_APP_API_URL "https://educhain-nbk6.onrender.com/api"
   netlify env:set REACT_APP_CONTRACT_ADDRESS "0x5FbDB2315678afecb367f032d93F642f64180aa3"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

## Step 4: Update Backend CORS Settings

After deploying frontend, update your Render backend to allow the Netlify URL:

1. **Go to Render Dashboard**
   - Navigate to your backend service
   - Go to **Environment** tab

2. **Update FRONTEND_URL**
   - Add your Netlify URL to `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app-name.netlify.app
   ```
   - Or if you have multiple URLs:
   ```
   FRONTEND_URL=https://your-app-name.netlify.app,http://localhost:3000
   ```

3. **Redeploy Backend** (if needed)
   - Render will automatically redeploy when you save environment variables

---

## Step 5: Update Frontend API URL (if needed)

If your backend URL changes, update it in Netlify:

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Go to **Site settings** → **Environment variables**

2. **Update REACT_APP_API_URL**
   - Edit `REACT_APP_API_URL` with your Render backend URL
   - Click **"Save"**

3. **Trigger Redeploy**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

---

## Step 6: Test Your Deployment

1. **Visit Your Netlify URL**
   - Open `https://your-app-name.netlify.app`
   - Check that the app loads correctly

2. **Test Features**
   - Connect wallet (MetaMask)
   - Navigate between pages
   - Test API calls (should connect to Render backend)

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check for any errors
   - Verify API calls are going to Render backend

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL (Render) | `https://educhain-nbk6.onrender.com/api` |
| `REACT_APP_CONTRACT_ADDRESS` | Deployed contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | (leave empty if not using) |

---

## Custom Domain (Optional)

1. **Go to Site Settings**
   - Navigate to **Domain settings**

2. **Add Custom Domain**
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `educhain.com`)
   - Follow DNS configuration instructions

3. **SSL Certificate**
   - Netlify automatically provisions SSL certificates
   - HTTPS is enabled by default

---

## Continuous Deployment

Netlify automatically deploys on every push to `master` branch:

1. **Push to GitHub**
   ```bash
   git push origin master
   ```

2. **Netlify Auto-Deploys**
   - Netlify detects the push
   - Builds and deploys automatically
   - You'll see the new deploy in Netlify dashboard

3. **Deploy Previews**
   - Netlify creates preview deployments for pull requests
   - Test changes before merging

---

## Troubleshooting

### Build Fails

**Error**: `npm run build` fails
- **Solution**: 
  - Check Netlify build logs for specific errors
  - Ensure all dependencies are in `package.json`
  - Verify Node version (should be 18+)

**Error**: `Cannot find module`
- **Solution**: 
  - Check that all dependencies are listed in `package.json`
  - Don't use global packages

### API Calls Fail

**Error**: `Failed to fetch` or CORS errors
- **Solution**:
  - Verify `REACT_APP_API_URL` is set correctly in Netlify
  - Check that backend CORS allows your Netlify URL
  - Verify backend is running on Render

**Error**: `Network request failed`
- **Solution**:
  - Check backend URL is correct
  - Verify backend is deployed and running
  - Check Render logs for errors

### Environment Variables Not Working

**Issue**: Variables not being used
- **Solution**:
  - Ensure variable names start with `REACT_APP_`
  - Redeploy after adding/changing variables
  - Check build logs to verify variables are loaded

### Routing Issues (404 on refresh)

**Issue**: Getting 404 when refreshing pages
- **Solution**: 
  - The `netlify.toml` already includes redirects
  - If still having issues, check redirects are correct:
    ```toml
    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```

### Wallet Connection Issues

**Issue**: MetaMask not connecting
- **Solution**:
  - Ensure you're using HTTPS (Netlify provides this automatically)
  - Check browser console for errors
  - Verify network is correct (Hardhat Local for development)

---

## Quick Checklist

Before deploying:

- [ ] Backend is deployed on Render
- [ ] Backend URL is accessible
- [ ] `netlify.toml` exists in `frontend/` directory
- [ ] Build works locally (`npm run build`)
- [ ] Environment variables prepared

After deploying:

- [ ] Site is accessible on Netlify URL
- [ ] Environment variables are set correctly
- [ ] Backend CORS allows Netlify URL
- [ ] Wallet connection works
- [ ] API calls succeed
- [ ] Routing works (no 404s on refresh)

---

## Example Netlify Configuration

**Site Name**: `educhain-frontend`
**Base Directory**: `frontend`
**Build Command**: `npm run build`
**Publish Directory**: `build`
**Node Version**: `18`

**Environment Variables**:
```
REACT_APP_API_URL=https://educhain-nbk6.onrender.com/api
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_WALLETCONNECT_PROJECT_ID=
```

---

## Next Steps

1. **Deploy Frontend** (this guide)
2. **Update Backend CORS** to allow Netlify URL
3. **Test End-to-End** functionality
4. **Set up Custom Domain** (optional)
5. **Enable Analytics** (optional, in Netlify dashboard)

---

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://community.netlify.com
- Netlify Status: https://www.netlifystatus.com

---

Your frontend should now be live on Netlify! 🚀

**Your URLs:**
- Frontend: `https://your-app-name.netlify.app`
- Backend: `https://educhain-nbk6.onrender.com`

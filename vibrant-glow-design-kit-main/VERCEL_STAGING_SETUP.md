# Vercel Staging Environment Setup

## Problem
Staging deployments are connecting to production Strapi instead of staging Strapi.

## Solution

### Step 1: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add/Edit the variable:
   - **Name:** `NEXT_PUBLIC_STRAPI_URL`
   - **Value:** `https://smarthoster-blogs-1.onrender.com`
   - **Environments:** 
     - ✅ **Preview** (for staging branch)
     - ✅ **Development** (optional)
     - ❌ **Production** (leave unchecked - production uses different URL)
   - Click **Save**

3. For Production (main branch):
   - **Name:** `NEXT_PUBLIC_STRAPI_URL`
   - **Value:** `https://smarthoster-blogs.onrender.com`
   - **Environments:** 
     - ✅ **Production** only
   - Click **Save**

### Step 2: Redeploy Staging Branch

After setting environment variables, you MUST redeploy (because `NEXT_PUBLIC_*` vars are embedded at build time):

**Option A: Manual Redeploy (NO COMMIT NEEDED) ⭐ RECOMMENDED**
1. Go to **Deployments** tab in Vercel
2. Find the deployment from `staging` branch
3. Click **"..."** → **Redeploy**
4. ✅ This redeploys with new env vars WITHOUT needing to commit code

**Option B: Push a new commit (triggers auto-deploy)**
```bash
git add .
git commit -m "Update staging environment"
git push origin staging
```

**Important:** 
- Setting env vars for **Preview** does NOT affect **Production**
- Each environment uses its own variables
- Production will continue using `https://smarthoster-blogs.onrender.com` if you set it only for Preview

### Step 3: Verify You're Looking at Staging

- ✅ **Staging deployment:** URL like `*-git-staging-*.vercel.app`
- ✅ **Source:** `staging` branch
- ✅ **Environment:** `Preview`

- ❌ **Production deployment:** URL like `www.smarthoster.io`
- ❌ **Source:** `main` branch  
- ❌ **Environment:** `Production`

## How to Check Which Strapi URL is Being Used

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `console.log(process.env.NEXT_PUBLIC_STRAPI_URL)`
4. Or check Network tab for API calls to Strapi

## Troubleshooting

**Still showing production?**
- ✅ Check you're viewing the **staging** deployment, not production
- ✅ Verify environment variable is set for **Preview** environment
- ✅ Redeploy after setting environment variable
- ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

**Environment variable not working?**
- `NEXT_PUBLIC_*` variables are embedded at **build time**
- You MUST redeploy after changing them
- Check Vercel build logs to verify the variable is being used


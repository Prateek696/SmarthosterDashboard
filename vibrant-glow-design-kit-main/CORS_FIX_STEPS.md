# Quick CORS Fix Steps

## ✅ What I Just Fixed

1. **Created Next.js API Proxy** (`app/api/strapi/[...path]/route.ts`)
   - This routes all Strapi requests through Next.js server
   - Avoids CORS issues completely
   - Works for both client-side and server-side requests

2. **Updated Strapi API Service** (`src/services/strapi.api.ts`)
   - Automatically uses proxy on client-side
   - Uses direct URL on server-side (faster)

## 🔧 What You Need to Do

### Step 1: Update Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_STRAPI_URL`
3. Click **Edit**
4. **IMPORTANT:** Select **ALL environments**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

### Step 2: Redeploy

After updating the environment variable:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- OR wait for the next automatic deployment

### Step 3: Verify

After redeployment:
1. Open your blog page: `https://your-vercel-url.vercel.app/pt/blog`
2. Open browser console (F12)
3. Check for:
   - ✅ `🌐 Strapi URL: /api/strapi` (should NOT be undefined)
   - ✅ No CORS errors
   - ✅ Blog posts loading

## 🎯 How It Works

**Before (CORS Error):**
```
Browser → Strapi (Render) ❌ CORS blocked
```

**After (Fixed):**
```
Browser → Next.js API Proxy → Strapi (Render) ✅ Works!
```

The proxy runs on your Next.js server, so there's no CORS issue.

## 📝 Notes

- The proxy automatically handles all Strapi API endpoints
- No changes needed to Strapi configuration
- Works for all environments (dev, preview, production)
- Server-side requests still use direct Strapi URL (faster)

## 🐛 If Still Not Working

1. **Check environment variable:**
   - Make sure it's set for ALL environments
   - Value should be: `https://smarthoster-blogs.onrender.com`

2. **Check deployment:**
   - Make sure you redeployed after adding/updating the env var
   - Environment variables require a new deployment to take effect

3. **Check console:**
   - Should see: `🌐 Strapi URL: /api/strapi` (not undefined)
   - Should NOT see CORS errors

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)


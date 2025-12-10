# CORS Error Fix Guide

## Problem
The frontend is getting CORS errors when trying to fetch blog posts from Strapi:
```
Access to fetch at 'https://smarthoster-blogs.onrender.com/api/blogs...' 
from origin 'https://smarthoster-test-deploy-fi-git-fc9282-miguels-projects-d2c52229.vercel.app' 
has been blocked by CORS policy
```

Also, `NEXT_PUBLIC_STRAPI_URL` is showing as `undefined` in the console.

## Solutions

### 1. Fix Environment Variable in Vercel

The `NEXT_PUBLIC_STRAPI_URL` environment variable is not set in Vercel.

**Steps:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_STRAPI_URL`
   - **Value:** `https://smarthoster-blogs.onrender.com`
   - **Environment:** Production, Preview, and Development (select all)
4. **Redeploy** your application after adding the variable

**Important:** After adding the environment variable, you MUST redeploy for it to take effect.

### 2. Fix CORS in Strapi (Render)

Strapi needs to allow requests from your Vercel deployment URL. Since Strapi is hosted on Render, you need to configure CORS there.

#### Option A: Configure CORS via Strapi Config File (Recommended)

If you have access to the Strapi codebase on Render:

1. **Find or create** `config/middlewares.js` in your Strapi project:

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://smarthoster-test-deploy-fi-git-fc9282-miguels-projects-d2c52229.vercel.app',
        'https://smarthoster-test-deploy.vercel.app',
        'https://*.vercel.app',
        'https://www.smarthoster.io',
        'https://smarthoster.io',
      ],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

2. **Commit and push** the changes to trigger a rebuild on Render

#### Option B: Configure CORS via Environment Variables (Render Dashboard)

If you can't access the Strapi codebase, configure CORS via Render environment variables:

1. Go to your Strapi service on Render dashboard
2. Navigate to **Environment** tab
3. Add these environment variables:

```bash
CORS_ORIGIN=https://smarthoster-test-deploy-fi-git-fc9282-miguels-projects-d2c52229.vercel.app,https://smarthoster-test-deploy.vercel.app,https://*.vercel.app,https://www.smarthoster.io,https://smarthoster.io
```

**Note:** This method may not work for all Strapi versions. Option A is more reliable.

#### Option C: Use Strapi Plugin (If Available)

Some Strapi versions allow CORS configuration via the admin panel:

1. Go to Strapi Admin → **Settings** → **Users & Permissions Plugin** → **Advanced Settings**
2. Look for CORS settings
3. Add your Vercel URLs to allowed origins

### 3. Alternative: Use Next.js API Routes as Proxy

If you can't modify Strapi CORS settings, you can create a Next.js API route to proxy requests:

**Create `app/api/strapi/[...path]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  const url = `${STRAPI_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from Strapi' },
      { status: 500 }
    );
  }
}
```

Then update `src/services/strapi.api.ts` to use `/api/strapi` instead of direct Strapi URL.

### 4. Verify the Fix

After implementing the fixes:

1. **Check environment variable:**
   - Open browser console on your Vercel deployment
   - Look for: `🌐 Strapi URL: https://smarthoster-blogs.onrender.com` (should NOT be undefined)

2. **Test CORS:**
   - Open browser console
   - Check for CORS errors
   - Blog posts should load successfully

3. **Test blog page:**
   - Navigate to `/pt/blog`, `/en/blog`, `/fr/blog`
   - Posts should display without errors

## Quick Checklist

- [ ] Added `NEXT_PUBLIC_STRAPI_URL` to Vercel environment variables
- [ ] Redeployed Vercel application
- [ ] Configured CORS in Strapi (via config file or environment variables)
- [ ] Restarted Strapi service on Render (if needed)
- [ ] Verified environment variable is not undefined in console
- [ ] Verified no CORS errors in browser console
- [ ] Verified blog posts load correctly

## Common Issues

### Issue: Environment variable still undefined after adding
**Solution:** Make sure you redeployed after adding the variable. Environment variables require a new deployment.

### Issue: CORS still blocking after configuration
**Solution:** 
- Check that you restarted the Strapi service on Render
- Verify the CORS config syntax is correct
- Check browser console for the exact error message
- Try using wildcard `*` temporarily to test (not recommended for production)

### Issue: Strapi on Render doesn't have config file access
**Solution:** Use the API proxy method (Option 3) or contact Render support to add environment variables.

## Production URLs to Add to CORS

Make sure to add all your production and staging URLs:

- `https://www.smarthoster.io`
- `https://smarthoster.io`
- `https://smarthoster-test-deploy.vercel.app`
- `https://*.vercel.app` (for preview deployments)

## Notes

- Strapi v5 uses different CORS configuration than v4
- Render may require service restart after config changes
- Vercel preview deployments use different URLs each time - consider using wildcard `*.vercel.app`
- For production, be specific with allowed origins for security


# Owner Portal Connection Guide

## ✅ Option 1: Proxy Redirect - IMPLEMENTED

The Owner Portal has been reconnected using Next.js middleware redirect.

### How It Works

1. When users visit `/portal` or `/portal/*` in the Next.js app
2. Next.js middleware intercepts the request
3. Redirects to the Owner Portal app (separate React app)
4. Owner Portal handles all routing internally

### Configuration

Set the environment variable in `.env.local`:

```env
# Owner Portal URL
# Development: http://localhost:3000 (Owner Portal runs on port 3000)
# Production: Your deployed Owner Portal URL (e.g., https://portal.smarthoster.io)
NEXT_PUBLIC_OWNER_PORTAL_URL=http://localhost:3000
```

### Development Setup

**✅ Port Configuration (Already Configured)**

- **Next.js App** (vibrant-glow-design-kit-main): Runs on port **3001**
- **Owner Portal**: Runs on port **3000**

1. **Start Owner Portal** (in a separate terminal):
   ```bash
   cd owner-portal/frontend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Start Next.js App**:
   ```bash
   cd vibrant-glow-design-kit-main
   npm run dev:next
   # Runs on http://localhost:3001 (configured in package.json)
   ```

3. **Create .env.local** (if not exists) in `vibrant-glow-design-kit-main/`:
   ```env
   NEXT_PUBLIC_OWNER_PORTAL_URL=http://localhost:3000
   ```

4. **Access Portal**:
   - Visit: `http://localhost:3001/portal`
   - Will redirect to: `http://localhost:3000/dashboard/owner` (Owner Portal)

### Route Mapping

- `/portal` → Redirects to Owner Portal `/dashboard/owner`
- `/portal/bookings` → Redirects to Owner Portal `/bookings`
- `/portal/invoices` → Redirects to Owner Portal `/invoices`
- Any `/portal/*` path → Redirects to Owner Portal `/*`

### Production Setup

1. Deploy Owner Portal separately (e.g., Vercel, Netlify)
2. Update `.env.local` with production URL:
   ```env
   NEXT_PUBLIC_OWNER_PORTAL_URL=https://portal.smarthoster.io
   ```
3. Rebuild and deploy Next.js app

### Benefits

✅ **Zero risk** - No code changes to Owner Portal  
✅ **Easy to reverse** - Just remove middleware.ts  
✅ **Production-ready** - Works in any environment  
✅ **No breaking changes** - Owner Portal stays independent  

### Files Modified

- `middleware.ts` - Added redirect logic
- `app/portal/page.tsx` - Removed (handled by middleware)

### Troubleshooting

**Issue**: Redirect not working  
**Solution**: 
1. Check Owner Portal is running on the correct port
2. Verify `NEXT_PUBLIC_OWNER_PORTAL_URL` in `.env.local`
3. Restart Next.js dev server after env changes

**Issue**: CORS errors  
**Solution**: Owner Portal should handle CORS in its backend if needed

**Issue**: Wrong redirect path  
**Solution**: Check Owner Portal routes in `owner-portal/frontend/src/App.tsx`


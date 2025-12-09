# Next.js Migration Verification Checklist

## ✅ Step 1: Local Development Server Test

1. **Start Next.js dev server:**
   ```bash
   npm run dev:next
   ```
   - Server should start on `http://localhost:3001`
   - Should see: "✓ Ready in X seconds"

2. **Test these pages in browser:**
   - [ ] Homepage: `http://localhost:3001`
   - [ ] About: `http://localhost:3001/about`
   - [ ] Pricing: `http://localhost:3001/pricing`
   - [ ] Blog: `http://localhost:3001/blog`
   - [ ] Contact: `http://localhost:3001/contact`

3. **Check for errors:**
   - [ ] No console errors
   - [ ] Pages load correctly
   - [ ] Images display
   - [ ] Navigation works

## ✅ Step 2: Build Test

1. **Run production build:**
   ```bash
   npm run build:next
   ```
   - Should complete successfully
   - Should see: "✓ Compiled successfully"
   - Should generate `.next` folder

2. **Check build output:**
   - [ ] No TypeScript errors
   - [ ] No build errors
   - [ ] All pages listed in build output

## ✅ Step 3: Production Server Test

1. **Start production server:**
   ```bash
   npm run start:next
   ```
   - Server should start on `http://localhost:3001`

2. **Test pages:**
   - [ ] Homepage loads
   - [ ] All routes work
   - [ ] No runtime errors

## ✅ Step 4: Deploy to Staging

1. **Commit changes:**
   ```bash
   git add -A
   git commit -m "Complete Next.js migration - replace Vite with Next.js"
   git push origin staging
   ```

2. **Check Vercel:**
   - [ ] Deployment starts automatically
   - [ ] Build succeeds (should use `npm run build:next`)
   - [ ] Deployment completes

3. **Test staging URL:**
   - [ ] Homepage loads
   - [ ] No blank page
   - [ ] No errors in console
   - [ ] All pages accessible

## ✅ Step 5: Environment Variables

Make sure these are set in Vercel (Preview environment):
- [ ] `NEXT_PUBLIC_STRAPI_URL` = `https://smarthoster-blogs-1.onrender.com`
- [ ] `STRAPI_API_TOKEN` (if needed)

## ✅ Step 6: Final Checks

- [ ] Staging site loads correctly
- [ ] No React DevTools errors
- [ ] All routes work
- [ ] Images load
- [ ] Forms work (if any)
- [ ] Authentication works (if applicable)

## 🎯 Success Criteria

✅ **Migration is successful if:**
1. Build completes without errors
2. Staging site loads (no blank page)
3. All pages are accessible
4. No console errors
5. Site connects to staging Strapi

## 🚨 If Issues Found

- Check browser console for errors
- Check Vercel build logs
- Verify environment variables
- Test locally first before deploying


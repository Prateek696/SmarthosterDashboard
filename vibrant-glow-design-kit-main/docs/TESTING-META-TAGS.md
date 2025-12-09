# Testing Meta Tags: Strapi ↔ Frontend Sync

This guide explains how to verify that meta tags are correctly displayed on the frontend and that changes made in Strapi are reflected on the frontend.

## Quick Test (Automated)

Run the automated test script:

```bash
npm run test:meta-tags
```

This script will:
1. Fetch blog posts from Strapi
2. Fetch the same posts from the frontend
3. Compare meta tags between Strapi and frontend
4. Report any mismatches

## Manual Testing Methods

### Method 1: Browser DevTools (Recommended)

1. **Open a blog post in your browser:**
   ```
   http://localhost:3001/en/blog/how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025
   ```

2. **Open DevTools (F12 or Right-click → Inspect)**

3. **Check the `<head>` section:**
   - Go to the **Elements** tab
   - Expand the `<head>` tag
   - Look for these meta tags:
     - `<title>` - Should match Strapi SEO metaTitle
     - `<meta name="description">` - Should match Strapi SEO metaDescription
     - `<meta property="og:title">` - Should match Strapi Open Graph ogTitle
     - `<meta property="og:description">` - Should match Strapi Open Graph ogDescription
     - `<meta property="og:image">` - Should match Strapi Open Graph ogImage
     - `<link rel="canonical">` - Should match Strapi SEO canonicalURL

4. **Verify values match Strapi:**
   - Go to Strapi Admin: http://localhost:1337/admin
   - Navigate to Content Manager → Blog
   - Find the blog post
   - Check the SEO component values
   - Compare with what you see in the browser

### Method 2: View Page Source

1. **Open a blog post in your browser**

2. **Right-click → "View Page Source" (or Ctrl+U)**

3. **Search for meta tags:**
   - Press `Ctrl+F` and search for:
     - `og:title`
     - `og:description`
     - `meta name="description"`
     - `canonical`

4. **Compare with Strapi values**

### Method 3: Network Tab (Check API Response)

1. **Open DevTools → Network tab**

2. **Reload the page (F5)**

3. **Look for API calls to Strapi:**
   - Filter by "blogs" or "strapi"
   - Click on the request
   - Check the Response tab
   - Verify the `seo` component data is present

4. **Check if frontend is using this data:**
   - Compare the Strapi response with the meta tags in the HTML

### Method 4: SEO Testing Tools

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your blog post URL
3. Click "Debug"
4. Check if the Open Graph tags are correctly displayed

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your blog post URL
3. Check if the Twitter Card meta tags are correct

#### Google Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Enter your blog post URL
3. Check if structured data is correctly formatted

## Testing Strapi Changes Reflection

### Step 1: Make a Change in Strapi

1. **Go to Strapi Admin:** http://localhost:1337/admin
2. **Navigate to:** Content Manager → Blog
3. **Select a blog post** (e.g., for locale "en")
4. **Edit the SEO component:**
   - Change the `metaTitle`
   - Change the `metaDescription`
   - Change the `ogTitle` in Open Graph
   - Change the `ogDescription` in Open Graph
5. **Save and Publish** the changes

### Step 2: Verify on Frontend

1. **Clear browser cache** (Important!):
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Clear data

2. **Hard refresh the page:**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Or `Cmd+Shift+R` (Mac)

3. **Check meta tags again** using Method 1 or 2 above

4. **Verify the changes are reflected:**
   - The meta tags should now show the updated values from Strapi

### Step 3: Test Different Locales

Test for all three locales:

1. **English (en):**
   ```
   http://localhost:3001/en/blog/[slug]
   ```

2. **Portuguese (pt):**
   ```
   http://localhost:3001/pt/blog/[slug]
   ```

3. **French (fr):**
   ```
   http://localhost:3001/fr/blog/[slug]
   ```

Make sure each locale shows the correct meta tags for that language.

## Common Issues & Solutions

### Issue 1: Meta tags not updating after Strapi changes

**Solution:**
- Clear browser cache
- Hard refresh the page (`Ctrl+Shift+R`)
- Check if the post is **published** in Strapi (not just saved as draft)
- Verify the locale matches (en, pt, fr)

### Issue 2: Meta tags showing default/fallback values

**Possible causes:**
- SEO component not populated in Strapi
- SEO component is empty array
- API call failing (check browser console for errors)

**Solution:**
- Go to Strapi and verify SEO component has data
- Check browser console for API errors
- Verify Strapi server is running

### Issue 3: Wrong locale meta tags showing

**Solution:**
- Verify the URL locale matches Strapi locale
- Check if the blog post exists for that locale in Strapi
- Verify `mapToStrapiLocale` function is working correctly

## Testing Checklist

- [ ] Blog post meta tags are visible in page source
- [ ] Title tag matches Strapi SEO metaTitle
- [ ] Description meta tag matches Strapi SEO metaDescription
- [ ] Open Graph title matches Strapi Open Graph ogTitle
- [ ] Open Graph description matches Strapi Open Graph ogDescription
- [ ] Open Graph image is present (if set in Strapi)
- [ ] Canonical URL is correct
- [ ] Changes in Strapi are reflected on frontend after cache clear
- [ ] All three locales (en, pt, fr) show correct meta tags
- [ ] Twitter Card meta tags are present
- [ ] Structured data (JSON-LD) is present (if applicable)

## Automated Testing

For continuous testing, you can run:

```bash
# Test meta tags
npm run test:meta-tags

# Or manually
node scripts/test-meta-tags.js
```

The script will test multiple blog posts across different locales and report any mismatches.

## Notes

- **Cache:** Next.js may cache pages. Use `export const dynamic = 'force-dynamic'` to disable caching (already set in blog pages)
- **Strapi API:** Make sure Strapi API is accessible and CORS is configured correctly
- **Publishing:** Content must be **published** in Strapi, not just saved as draft
- **Locale:** Make sure the locale in the URL matches the locale in Strapi



# Manual Meta Tags Testing Guide

Since the automated test requires both Strapi and Next.js servers to be running, here's a step-by-step manual testing guide:

## Prerequisites

1. **Start Strapi server:**
   ```bash
   cd Blogs
   npm run develop
   ```
   Strapi should be running on: http://localhost:1337

2. **Start Next.js server:**
   ```bash
   npm run dev:next
   ```
   Frontend should be running on: http://localhost:3001

## Step-by-Step Testing

### Step 1: Check Strapi Data

1. Open Strapi Admin: http://localhost:1337/admin
2. Navigate to **Content Manager → Blog**
3. Find a blog post (e.g., "How to Maximize Your Airbnb Income in Portugal")
4. Click on the post
5. Check the **SEO** component section:
   - `metaTitle` should be filled
   - `metaDescription` should be filled (50-160 characters)
   - `openGraph` component should have:
     - `ogTitle`
     - `ogDescription`
     - `ogUrl`
     - `ogType` (should be "article")
6. **Make sure the post is PUBLISHED** (not draft)

### Step 2: Check Frontend Meta Tags

1. Open the blog post in your browser:
   ```
   http://localhost:3001/en/blog/how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025
   ```

2. **Open DevTools (F12)**

3. **Go to Console tab** and paste this code:

```javascript
// Quick Meta Tags Check
const getMeta = (name, prop = false) => {
  const attr = prop ? 'property' : 'name';
  const el = document.querySelector(`meta[${attr}="${name}"]`);
  return el ? el.getAttribute('content') : 'NOT FOUND';
};

console.log('📋 META TAGS CHECK:');
console.log('Title:', document.querySelector('title')?.textContent);
console.log('Description:', getMeta('description'));
console.log('OG Title:', getMeta('og:title', true));
console.log('OG Description:', getMeta('og:description', true));
console.log('OG Image:', getMeta('og:image', true));
console.log('OG URL:', getMeta('og:url', true));
console.log('Canonical:', document.querySelector('link[rel="canonical"]')?.href);
```

4. **Compare the values** with what you saw in Strapi

### Step 3: Test Changes Reflection

1. **Go back to Strapi Admin**
2. **Edit the SEO component:**
   - Change `metaTitle` to something like: "TEST: Updated Title"
   - Change `metaDescription` to something like: "TEST: Updated description for testing meta tags"
3. **Save and Publish**
4. **Go back to browser**
5. **Clear cache and hard refresh:**
   - Press `Ctrl+Shift+Delete` → Clear "Cached images and files"
   - Press `Ctrl+Shift+R` (hard refresh)
6. **Run the console script again** (from Step 2)
7. **Verify** the changes are reflected

### Step 4: Test All Locales

Repeat Steps 1-3 for:
- **English:** `/en/blog/[slug]`
- **Portuguese:** `/pt/blog/[slug]`
- **French:** `/fr/blog/[slug]`

Make sure each locale shows the correct meta tags for that language.

## Quick Visual Check

You can also use the browser's **View Page Source**:

1. Right-click on the page → **View Page Source** (or `Ctrl+U`)
2. Search for `og:title` (press `Ctrl+F`)
3. You should see:
   ```html
   <meta property="og:title" content="[Your Strapi OG Title]" />
   <meta property="og:description" content="[Your Strapi OG Description]" />
   <meta name="description" content="[Your Strapi Meta Description]" />
   <title>[Your Strapi Meta Title]</title>
   ```

## Expected Results

✅ **Success indicators:**
- Meta tags are present in the HTML
- Values match what's in Strapi
- Changes in Strapi are reflected after cache clear
- All locales show correct language-specific meta tags

❌ **If meta tags are missing or wrong:**
- Check if post is published in Strapi
- Check browser console for errors
- Verify Strapi server is running
- Check if SEO component is populated in Strapi
- Clear browser cache and hard refresh



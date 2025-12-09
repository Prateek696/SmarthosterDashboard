# Blog Import Guide - Multi-Locale Support

## Overview
This guide explains how to import blog posts from TypeScript data files to Strapi with multi-locale support (en, pt, fr).

## Prerequisites
1. Strapi server running on `http://localhost:1337`
2. Blog content type created in Strapi with i18n enabled
3. Node.js 18+ installed

## Step 1: Export Blog Data to JSON

Since blog data is in TypeScript files, first export it to JSON:

```bash
npm run export:blog-data
# OR
npx tsx scripts/export-blog-data-to-json.js
```

This creates `src/data/blogPosts.json` with all blog posts for en, pt, fr.

## Step 2: Import Blogs to Strapi

Run the import script:

```bash
npm run import:blogs
# OR
node scripts/import-blogs-to-strapi.js
```

The script will:
- Load blog data from JSON (or TypeScript files if using tsx)
- Import each blog post for each locale (en, pt, fr)
- Create new posts or update existing ones (based on slug + locale)
- Show progress and summary

## Step 3: Publish in Strapi Admin

After import:
1. Go to Strapi Admin: `http://localhost:1337/admin`
2. Navigate to **Content Manager > Blog**
3. Filter by locale (en, pt, fr)
4. **PUBLISH** all imported blog posts for each locale

## Step 4: Verify on Frontend

Test the blog pages:
- English: `/en/blog` or `/blog`
- Portuguese: `/pt/blog`
- French: `/fr/blog`

Individual posts:
- `/en/blog/slug`
- `/pt/blog/slug`
- `/fr/blog/slug`

## How It Works

### Collection Type (Not Single Type)
- Blogs are **Collection Type** in Strapi (multiple entries)
- Each blog post can have multiple locale versions
- Same slug can exist for different locales

### Locale Handling
- Frontend automatically fetches blogs with locale parameter
- `Blog.tsx` component uses `currentLanguage` from context
- Strapi API calls include `locale` parameter
- Changes in Strapi reflect immediately on frontend (after publish)

### Data Structure
Blog posts are imported with:
- Title, slug, content, excerpt
- Author, category, tags
- Published date, read time
- Featured flag
- SEO metadata (metaTitle, metaDescription, openGraph)
- Cover image (needs to be uploaded manually in Strapi)

## Troubleshooting

### "Could not load blog data"
- Run `npm run export:blog-data` first to create JSON file
- Or use `npx tsx scripts/import-blogs-to-strapi.js` to run with TypeScript support

### "404 Not Found" when importing
- Make sure Blog content type exists in Strapi
- Check that i18n is enabled for Blog content type
- Verify Strapi server is running

### Posts not showing on frontend
- Make sure posts are **PUBLISHED** in Strapi (not just saved as draft)
- Check that locale matches (en, pt, fr)
- Verify `NEXT_PUBLIC_STRAPI_URL` is correct in `.env`

## Notes

- **Cover Images**: Need to be uploaded manually in Strapi Admin after import
- **SEO Images**: Can be added manually in Strapi Admin
- **Updates**: When you update a blog post in Strapi, it reflects on frontend immediately (after publish)
- **New Posts**: Create new blog posts directly in Strapi Admin for each locale




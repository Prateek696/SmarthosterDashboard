# Strapi Import Scripts

Scripts to import content from translation JSON files into Strapi CMS.

## Prerequisites

1. **Node.js 18+** (for built-in `fetch` support)
2. **Strapi server running** on `http://localhost:1337`
3. **Strapi permissions configured** - Make sure the content types have public access enabled or you have an API token

## Setup

### Option 1: Without API Token (Public Access)
If your Strapi content types have public "find" and "update" permissions, you don't need an API token.

1. Go to Strapi Admin → Settings → Users & Permissions → Roles → Public
2. Enable "find" and "update" permissions for "Home-page" (and other content types)

### Option 2: With API Token (Recommended for Production)
1. Go to Strapi Admin → Settings → API Tokens
2. Create a new token with "Full access" or custom permissions
3. Add to your `.env` file:
   ```
   STRAPI_API_TOKEN=your_token_here
   ```

## Usage

### Import Home Page

```bash
npm run import:homepage
```

OR

```bash
node scripts/import-homepage-to-strapi.js
```

## What Gets Imported

The script reads data from:
- `src/data/translations/en.json`
- `src/data/translations/integrations/en.json`

And imports the following sections:
- ✅ Hero Section (title, description, metrics, trust badges)
- ✅ About Section (title, description, values, partners)
- ✅ Features Section (title, description, all features)
- ✅ Integrations Section (title, description, stats, benefits)
- ✅ Testimonials Section (all testimonials)
- ✅ Success Stories Section (all success stories)
- ✅ How It Works Section (all steps)
- ✅ FAQ Section (all FAQs)
- ✅ CTA Section (title, description, benefits)
- ✅ Contact Section (all form labels and text)

## After Import

1. **Review in Strapi Admin:**
   - Go to Content Manager → Single Types → Home Page
   - Review all imported content

2. **Upload Images Manually:**
   The script doesn't import images. You'll need to upload:
   - Hero image
   - Partner logos
   - Testimonial images
   - Success story images
   - Any other media

3. **Publish:**
   - Make sure to click "Publish" in Strapi to make the content live

4. **Verify on Website:**
   - Visit your Next.js homepage
   - Check that Strapi content is displaying correctly

## Troubleshooting

### Error: "fetch is not available"
- Make sure you're using Node.js 18 or higher
- Run: `node --version`

### Error: "401 Unauthorized" or "403 Forbidden"
- Check Strapi permissions (see Setup section)
- Or set `STRAPI_API_TOKEN` in your `.env` file

### Error: "Cannot connect to Strapi"
- Make sure Strapi server is running: `http://localhost:1337`
- Check `NEXT_PUBLIC_STRAPI_URL` in your `.env` file

### Content Not Showing on Website
- Make sure content is **published** in Strapi (not just saved as draft)
- Check browser console for errors
- Verify Next.js is fetching from Strapi correctly

## Next Steps

After successfully importing the Home Page, you can:
1. Import other pages (About, Pricing, etc.) - scripts coming soon
2. Add translations (PT, FR) manually in Strapi
3. Upload and link images
4. Customize content as needed


# Strapi i18n Setup Guide - Complete Implementation

## Overview
This guide will help you set up multi-locale support in Strapi and implement locale-based URLs in the frontend.

## Phase 1: Strapi i18n Setup (Backend)

### Step 1: Enable i18n in Strapi Admin

1. **Start Strapi server:**
   ```bash
   cd Blogs
   npm run develop
   ```

2. **Open Strapi Admin:**
   - Go to: http://localhost:1337/admin
   - Login with your admin credentials

3. **Enable Internationalization:**
   - Go to: **Settings** → **Internationalization**
   - Click **"Add new locale"**
   - Add locales:
     - `pt` (Portuguese) - Set as default if you want
     - `fr` (French)
   - Default locale: `en` (or `pt` if you prefer Portuguese as default)
   - Click **Save**

4. **Enable Localization on Content Types:**
   For EACH content type (Home Page, About Page, Pricing Page, Service Pages):
   - Go to: **Content-Type Builder**
   - Click on the content type (e.g., "Home Page")
   - Click **"Edit"**
   - Go to **"Advanced Settings"** tab
   - Enable **"Localization"** checkbox
   - Click **"Finish"**
   - Click **"Save"**

   **Content Types to enable i18n on:**
   - ✅ Home Page
   - ✅ About Page
   - ✅ Pricing Page
   - ✅ Enhanced Direct Bookings Page
   - ✅ Full Service Management Page
   - ✅ Advanced Automation Page
   - ✅ Local Expertise Page
   - ✅ Income Strategy Page
   - ✅ Legal Compliance Page
   - ✅ Automated Billing Page
   - ✅ Green Pledge Page

### Step 2: Import Data for All Locales

1. **Update import scripts** (Already done ✅)
   - Scripts now support multi-locale import
   - They read from `pt.json` and `fr.json` files

2. **Run import scripts:**
   ```bash
   cd vibrant-glow-design-kit-main
   
   # Import homepage for all locales
   npm run import:homepage
   
   # Import about page for all locales
   npm run import:aboutpage
   
   # Import pricing page for all locales
   npm run import:pricingpage
   
   # Import all service pages
   npm run import:enhanced-direct-bookings
   npm run import:full-service-management
   npm run import:advanced-automation
   npm run import:local-expertise
   npm run import:income-strategy
   npm run import:legal-compliance
   npm run import:automated-billing
   npm run import:green-pledge
   ```

3. **Verify in Strapi Admin:**
   - Go to Content Manager
   - Select a content type (e.g., Home Page)
   - You should see a locale dropdown (en, pt, fr)
   - Check that data exists for all locales
   - **Publish** each locale entry

### Step 3: Set Permissions

1. **Enable Public API Access:**
   - Go to: **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
   - For each content type, enable:
     - ✅ `find` (GET)
     - ✅ `findOne` (GET single)
   - Click **Save**

## Phase 2: Frontend Locale URLs (Frontend)

### Step 1: Middleware Setup

The middleware will:
- Detect locale from URL (`/en/`, `/pt/`, `/fr/`)
- Redirect root `/` to `/pt/` (default Portuguese)
- Handle locale detection from browser/headers

### Step 2: Folder Restructuring

Move all main pages to `[locale]` folder:
```
app/
  [locale]/
    page.tsx                    → /pt/, /en/, /fr/
    about/
      page.tsx                  → /pt/about, /en/about, /fr/about
    pricing/
      page.tsx                  → /pt/pricing, /en/pricing, /fr/pricing
    full-service-management/
      page.tsx                  → /pt/full-service-management, etc.
    ... (all other pages)
```

### Step 3: Update Pages

Each `page.tsx` will:
- Read `locale` from `params.locale`
- Pass locale to Strapi API: `strapiApi.getHomePage(locale)`
- Default to `'pt'` if no locale in URL

### Step 4: Update LanguageContext

- Change default language from `'en'` to `'pt'`
- Sync with URL locale

### Step 5: Update Links

All internal links will include locale:
- `/about` → `/pt/about` (or current locale)
- Header navigation
- Footer links
- CTA buttons

## Phase 3: Testing

1. **Test URLs:**
   - `http://localhost:3000/` → Should redirect to `/pt/`
   - `http://localhost:3000/pt/` → Portuguese homepage
   - `http://localhost:3000/en/` → English homepage
   - `http://localhost:3000/fr/` → French homepage

2. **Test Pages:**
   - Homepage: `/pt/`, `/en/`, `/fr/`
   - About: `/pt/about`, `/en/about`, `/fr/about`
   - Pricing: `/pt/pricing`, `/en/pricing`, `/fr/pricing`
   - Service pages: All locales

3. **Verify Strapi Data:**
   - Check browser console for Strapi API calls
   - Verify correct locale is being passed
   - Check that data changes with locale

## Troubleshooting

### Issue: Strapi returns 404 for locale
**Solution:** Make sure:
- i18n is enabled on the content type
- Data is imported for that locale
- Entry is published in Strapi Admin

### Issue: Default locale not working
**Solution:** 
- Check middleware redirect logic
- Verify LanguageContext default is set to `'pt'`

### Issue: Links not including locale
**Solution:**
- Check Header/Footer components
- Update all `<a href>` and `Link` components
- Use helper function to add locale prefix

## Next Steps After Setup

1. **SEO Optimization:**
   - Add `hreflang` tags for language alternatives
   - Update sitemap with locale URLs
   - Add language-specific meta tags

2. **Content Management:**
   - Train team on Strapi i18n
   - Set up workflow for multi-locale content updates
   - Consider content translation workflow

3. **Analytics:**
   - Track page views by locale
   - Monitor language preferences
   - Analyze conversion by locale

## Notes

- **Default Locale:** Portuguese (`pt`) is the default
- **Fallback:** If Strapi data not available, translation files are used
- **Blog Pages:** Already have `[locale]` structure, no changes needed
- **Admin Pages:** Keep outside `[locale]` folder (no locale needed)




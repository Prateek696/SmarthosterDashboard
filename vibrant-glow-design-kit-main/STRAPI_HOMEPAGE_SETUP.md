# 🎯 Strapi Homepage Setup Guide

## 📍 Overview

The homepage is configured to fetch from Strapi as a **Single Type** (one homepage per language). This guide shows you how to create it in Strapi Admin.

---

## 🔗 API Endpoint

Your Next.js app fetches from:
```
GET {STRAPI_URL}/api/home-page?populate=*&locale=en
```

Example:
- Production: `https://smarthoster-blogs.onrender.com/api/home-page?populate=*&locale=en`
- Local: `http://localhost:1337/api/home-page?populate=*&locale=en`

---

## 📝 Step 1: Create Single Type in Strapi

### 1.1 Go to Strapi Admin
1. Open your Strapi admin panel
2. Go to **Content-Type Builder** (left sidebar)
3. Click **"Create new single type"** (not collection type!)

### 1.2 Name the Single Type
- **Display name**: `Home Page`
- **API ID (singular)**: `home-page` (MUST be exactly this - lowercase with hyphen)
- Click **Continue**

---

## 📋 Step 2: Add Fields Structure

You need to create this structure. Here's the complete field map:

### **Main Sections (Component Relations)**

Create these as **Component** fields (repeatable or single based on section):

#### 1. **heroSection** (Component - Single)
- Type: Component → Create new component
- Component name: `Hero Section`

**Hero Section Component Fields:**
- `trustBadge` (Text)
- `titleLine1` (Text)
- `titleLine2` (Text)
- `titleLine3` (Text)
- `titleLine4` (Text)
- `description` (Long text)
- `primaryCtaText` (Text)
- `primaryCtaLink` (Text/URL)
- `secondaryCtaText` (Text)
- `secondaryCtaLink` (Text/URL)
- `heroImage` (Media - Single image)
- `trustBadges` (Component - Repeatable) → Component: "Trust Badge"
- `metrics` (Component - Repeatable) → Component: "Metric"

**Trust Badge Component:**
- `title` (Text)
- `subtitle` (Text)
- `icon` (Text) - Icon name like "Shield", "CheckCircle"

**Metric Component:**
- `value` (Text) - e.g., "+35%"
- `label` (Text) - e.g., "Income Increase"
- `position` (Text) - e.g., "top-left"
- `color` (Text) - e.g., "#5FFF56"

#### 2. **aboutSection** (Component - Single)
- Type: Component
- Component name: `About Section`

**About Section Component Fields:**
- `title` (Text)
- `description` (Long text)
- `values` (Component - Repeatable) → Component: "Value Card"
- `partnerLogos` (Component - Repeatable) → Component: "Partner Logo"
- `trustBadgeText` (Text)
- `learnMoreButtonText` (Text)
- `learnMoreButtonLink` (Text/URL)

**Value Card Component:**
- `icon` (Text)
- `title` (Text)
- `description` (Long text)
- `link` (Text/URL)

**Partner Logo Component:**
- `name` (Text)
- `logo` (Media - Single image)
- `altText` (Text)
- `size` (Text) - e.g., "h-14 w-auto"

#### 3. **featuresSection** (Component - Single)
- Type: Component
- Component name: `Features Section`

**Fields:**
- `title` (Text)
- `subtitle` (Text)
- `description` (Long text)
- `featureItems` (Component - Repeatable) → Component: "Feature Item"

**Feature Item Component:**
- `icon` (Text)
- `title` (Text)
- `description` (Long text)
- `color` (Text)
- `route` (Text/URL)

#### 4. **integrationsSection** (Component - Single)
- Similar structure with stats and benefits

#### 5. **testimonialsSection** (Component - Single)
- With repeatable testimonials

#### 6. **successStoriesSection** (Component - Single)
- With repeatable stories

#### 7. **howItWorksSection** (Component - Single)
- With repeatable steps

#### 8. **faqSection** (Component - Single)
- With repeatable FAQ items

#### 9. **ctaSection** (Component - Single)
- With benefits array

#### 10. **contactSection** (Component - Single)
- Contact form fields

#### 11. **seoMetadata** (Component - Single)
- SEO fields

---

## 🚀 Step 3: Quick Start (Simplified Structure)

### **MINIMUM REQUIRED FIELDS TO TEST:**

For now, you can create a simplified structure just to test:

1. **heroSection** (Component - Single)
   - `title` (Text)
   - `description` (Text)
   - `heroImage` (Media)

2. Save the Single Type

---

## 🧪 Step 4: Test the API

### 4.1 Create Homepage Entry

1. Go to **Content Manager** → **Home Page** (singular)
2. Click **"Create new entry"**
3. Fill in at least one field (e.g., heroSection.title)
4. Click **Save**
5. Click **Publish**

### 4.2 Test API Directly

Open browser and test:

```
http://localhost:1337/api/home-page?populate=*
```

Or for your production Strapi:
```
https://smarthoster-blogs.onrender.com/api/home-page?populate=*
```

**Expected Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "heroSection": {
        "title": "Your title",
        "description": "Your description"
      },
      "createdAt": "...",
      "updatedAt": "...",
      "publishedAt": "..."
    }
  },
  "meta": {}
}
```

### 4.3 Test from Next.js

1. Start your Next.js dev server
2. Open homepage: `http://localhost:3001`
3. Check browser console for any errors
4. Check network tab - should see request to `/api/home-page`

---

## ✅ Step 5: Verify It's Working

### Check These:

1. **Strapi API Works:**
   - ✅ Direct API call returns data
   - ✅ Response has `data.attributes` structure

2. **Next.js Fetches:**
   - ✅ No console errors
   - ✅ Homepage loads (even if using fallbacks)
   - ✅ Network request to Strapi succeeds

3. **Hero Component Uses Strapi:**
   - ✅ If you add data in Strapi, it should appear on homepage
   - ✅ If Strapi is empty, fallback translations work

---

## 🔧 Troubleshooting

### Error: 404 Not Found
- **Problem**: Single Type not created or named incorrectly
- **Solution**: Check API ID is exactly `home-page` (lowercase, hyphen)

### Error: Empty Response
- **Problem**: Content not published
- **Solution**: Make sure to click **Publish** after saving

### Error: Network Error
- **Problem**: Strapi URL incorrect or Strapi offline
- **Solution**: Check `.env` file for `NEXT_PUBLIC_STRAPI_URL`

### Components Not Showing
- **Problem**: Fields not populated correctly
- **Solution**: Use `populate=*` in query or specify nested population

---

## 📊 Current Status

### ✅ What's Ready:
- Next.js code to fetch from Strapi
- Helper functions to extract data
- Hero component integrated
- Fallback system working

### 🔄 What You Need to Do:
- Create Single Type in Strapi Admin
- Add fields structure
- Create homepage entry
- Publish content
- Test API endpoint

---

## 🎯 Next Steps After Setup

1. **Start Simple**: Create just heroSection to test
2. **Add More Sections**: Gradually add other sections
3. **Add Content**: Fill in real content
4. **Test Multi-language**: Create entries for `pt` and `fr` locales

---

## 📚 Reference

### API Query Parameters Used:
- `populate=*` - Populate all relations
- `locale=en` - Language filter (if i18n enabled)

### File Locations:
- API Service: `src/services/strapi.api.ts`
- Helper Functions: `src/utils/strapi-helpers.ts`
- Homepage: `app/page.tsx` (server) + `app/page-client.tsx` (client)
- Hero Component: `src/components/Hero.tsx`

---

## 💡 Quick Test Command

Test the API from command line:

```bash
# Windows PowerShell
curl "http://localhost:1337/api/home-page?populate=*"

# Or open in browser:
# http://localhost:1337/api/home-page?populate=*
```

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ API endpoint returns data
2. ✅ Next.js homepage loads without errors
3. ✅ Hero section shows Strapi content (if added)
4. ✅ Fallback translations work if Strapi is empty

Good luck! 🚀






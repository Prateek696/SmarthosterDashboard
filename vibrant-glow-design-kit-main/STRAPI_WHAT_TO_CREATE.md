# 📝 What You Need to Create in Strapi

## 🎯 Goal
Make **EVERYTHING** on homepage editable (not just title and description)

---

## ✅ What You Already Have

- ✅ Home Page Single Type created
- ✅ `heroSection` component with:
  - ✅ `title` field
  - ✅ `description` field

---

## ⏳ What You Need to ADD

### **In Strapi Content-Type Builder:**

1. **Edit existing "Home Page" Single Type**
2. **Add 9 more Component fields** (detailed below)
3. **Complete Hero Section** by adding missing fields

---

## 📋 COMPLETE LIST - All 10 Sections

---

### 1️⃣ HERO SECTION ✅ (Partially Done)

**Status:** Component exists, but missing fields

**Add These Fields to `heroSection` Component:**
- `trustBadge` (Text)
- `heroImage` (Media - Single)
- `primaryCtaText` (Text)
- `primaryCtaLink` (Text/URL)
- `secondaryCtaText` (Text)
- `secondaryCtaLink` (Text/URL)

**Add Repeatable Components:**
- **Trust Badges** (Repeatable)
  - `title` (Text)
  - `subtitle` (Text)
  - `icon` (Text)
  
- **Metrics** (Repeatable)
  - `value` (Text) - e.g., "+35%"
  - `label` (Text) - e.g., "Income Increase"
  - `position` (Enumeration) - "top-left", "top-right", etc.
  - `color` (Text) - Hex color

---

### 2️⃣ ABOUT US SECTION (NEW - Create Component)

**Component Name:** `About Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)
- `partnersTitle` (Text)
- `trustBadgeText` (Text)
- `learnMoreButtonText` (Text)
- `learnMoreButtonLink` (Text/URL)

**Repeatable Components:**
- **Value Cards** (Repeatable) - 4 cards
  - `icon` (Text)
  - `title` (Text)
  - `description` (Long text)
  - `link` (Text/URL)

- **Partner Logos** (Repeatable) - 12+ logos
  - `name` (Text)
  - `logo` (Media - Single)
  - `altText` (Text)
  - `logoUrl` (Text/URL) - Fallback
  - `size` (Text)

---

### 3️⃣ FEATURES SECTION (NEW)

**Component Name:** `Features Section`

**Basic Fields:**
- `title` (Text)
- `subtitle` (Text)
- `description` (Long text)
- `learnMoreText` (Text)

**Repeatable Component:**
- **Feature Items** (Repeatable) - 9 features
  - `icon` (Text)
  - `title` (Text)
  - `description` (Long text)
  - `color` (Text)
  - `route` (Text/URL)

---

### 4️⃣ INTEGRATIONS SECTION (NEW)

**Component Name:** `Integrations Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)
- `ctaTitle` (Text)
- `ctaDescription` (Long text)
- `ctaButtonText` (Text)
- `ctaButtonLink` (Text/URL)
- `gdprBadgeText` (Text)

**Repeatable Components:**
- **Stats** (Repeatable) - 3 stats
  - `icon` (Text)
  - `number` (Text)
  - `label` (Text)
  - `description` (Text)

- **Benefits** (Repeatable) - 3 benefits
  - `icon` (Text)
  - `title` (Text)
  - `description` (Long text)

---

### 5️⃣ TESTIMONIALS SECTION (NEW)

**Component Name:** `Testimonials Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)

**Repeatable Component:**
- **Testimonials** (Repeatable) - 6+ testimonials
  - `name` (Text)
  - `role` (Text)
  - `location` (Text)
  - `image` (Media - Single)
  - `rating` (Number) - 1-5
  - `quote` (Long text)

---

### 6️⃣ SUCCESS STORIES SECTION (NEW)

**Component Name:** `Success Stories Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)
- `successBadgeText` (Text)
- `caseStudyText` (Text)
- `readFullStoryText` (Text)
- `propertyGalleryTitle` (Text)

**Repeatable Component:**
- **Stories** (Repeatable) - Multiple stories
  - `name` (Text)
  - `property` (Text)
  - `location` (Text)
  - `ownerImage` (Media - Single)
  - `propertyImage` (Media - Single)
  - `story` (Long text)
  - `fullStory` (Long text)
  
  **Nested Repeatables:**
  - **Results** (Repeatable) - 4 results per story
    - `label` (Text)
    - `value` (Text)
    - `icon` (Text)
  
  - **Supporting Images** (Repeatable - Media) - Multiple images

---

### 7️⃣ HOW IT WORKS SECTION (NEW)

**Component Name:** `How It Works Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)

**Repeatable Component:**
- **Steps** (Repeatable) - 5 steps
  - `icon` (Text)
  - `title` (Text)
  - `description` (Long text)
  - `color` (Text)

---

### 8️⃣ FAQ SECTION (NEW)

**Component Name:** `FAQ Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)

**Repeatable Component:**
- **FAQ Items** (Repeatable) - 10+ FAQs
  - `icon` (Text)
  - `question` (Text)
  - `answer` (Long text)

---

### 9️⃣ CTA SECTION (NEW)

**Component Name:** `CTA Section`

**Basic Fields:**
- `title` (Text)
- `description` (Long text)
- `primaryButtonText` (Text)
- `primaryButtonLink` (Text/URL)
- `secondaryButtonText` (Text)
- `secondaryButtonLink` (Text/URL)
- `sslText` (Text)
- `supportText` (Text)

**Repeatable Component:**
- **Benefits** (Repeatable) - 4 benefits
  - `text` (Text)

---

### 🔟 CONTACT FORM SECTION (NEW)

**Component Name:** `Contact Section`

**Basic Fields:**
- `sectionTitle` (Text)
- `emailLabel` (Text)
- `emailAddress` (Text)
- `phoneLabel` (Text)
- `phoneNumber` (Text)
- `sslBadgeText` (Text)
- `gdprBadgeText` (Text)

**Form Labels:**
- `fullNameLabel` (Text)
- `fullNamePlaceholder` (Text)
- `emailLabel` (Text)
- `emailPlaceholder` (Text)
- `phoneLabel` (Text)
- `phonePlaceholder` (Text)
- `messageLabel` (Text)
- `messagePlaceholder` (Text)
- `consentText` (Long text)
- `submitButtonText` (Text)
- `sendingText` (Text)
- `successTitle` (Text)
- `successDescription` (Long text)
- `successButtonText` (Text)

---

## 📊 SUMMARY TABLE

| Section | Component Name | Type | Repeatable Components |
|---------|---------------|------|----------------------|
| Hero | `heroSection` | Single | TrustBadge, Metric |
| About | `aboutSection` | Single | ValueCard, PartnerLogo |
| Features | `featuresSection` | Single | FeatureItem |
| Integrations | `integrationsSection` | Single | Stat, Benefit |
| Testimonials | `testimonialsSection` | Single | Testimonial |
| Success Stories | `successStoriesSection` | Single | Story (with nested Results, Images) |
| How It Works | `howItWorksSection` | Single | Step |
| FAQ | `faqSection` | Single | FAQItem |
| CTA | `ctaSection` | Single | Benefit |
| Contact | `contactSection` | Single | None |

---

## 🎯 STRAPI ACTION PLAN

### Step 1: Complete Hero Section
- Add missing fields to existing `heroSection` component
- Add TrustBadge repeatable component
- Add Metric repeatable component

### Step 2-10: Create Remaining 9 Components
- For each section, create a new Component field
- Add all fields listed above
- Save and move to next

---

## 📚 Reference Documents

1. **`STRAPI_HOMEPAGE_COMPLETE_GUIDE.md`** - Detailed field breakdown
2. **`HOMEPAGE_CMS_CHECKLIST.md`** - Complete element checklist
3. **`STRAPI_SIMPLE_CHECKLIST.md`** - Quick reference

---

**This is EVERYTHING that needs to be created!** 📝

**Want me to create step-by-step instructions for each component in Strapi?**






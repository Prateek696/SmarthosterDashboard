# 📋 Complete Homepage Field List for Strapi

## 🎯 Goal: Make EVERY SINGLE THING on Homepage Editable

---

## 📍 HOME PAGE SINGLE TYPE STRUCTURE

**Type:** Single Type  
**API ID:** `home-page` (already created ✅)

---

## 1️⃣ HERO SECTION (Component - Single)

### Fields Needed:
- `trustBadge` (Text) - "Trusted by property owners across Portugal"
- `title` (Text) - OR use separate lines:
  - `titleLine1` (Text) - "Empowering"
  - `titleLine2` (Text) - "Hosts"
  - `titleLine3` (Text) - "Simplifying"
  - `titleLine4` (Text) - "Stays"
- `description` (Long text)
- `heroImage` (Media - Single image)
- `primaryCtaText` (Text) - "Get Started Today"
- `primaryCtaLink` (Text/URL) - Calendly URL
- `secondaryCtaText` (Text) - "Learn More"
- `secondaryCtaLink` (Text/URL)

### Repeatable Components:

#### **Trust Badges** (Repeatable Component)
- `title` (Text) - e.g., "SSL Certified"
- `subtitle` (Text) - e.g., "Bank-level Security"
- `icon` (Text) - Icon name like "Shield"

#### **Metrics** (Repeatable Component)
- `value` (Text) - e.g., "+35%"
- `label` (Text) - e.g., "Income Increase"
- `position` (Enumeration) - "top-left", "top-right", "bottom-left", "bottom-right", "middle-right"
- `color` (Text) - Hex color like "#5FFF56"

---

## 2️⃣ ABOUT US SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)
- `trustBadgeText` (Text)
- `learnMoreButtonText` (Text)
- `learnMoreButtonLink` (Text/URL)

### Repeatable Components:

#### **Value Cards** (Repeatable Component)
- `icon` (Text) - Icon name
- `title` (Text)
- `description` (Long text)
- `link` (Text/URL)

#### **Partner Logos** (Repeatable Component)
- `name` (Text) - e.g., "Airbnb"
- `logo` (Media - Single image)
- `altText` (Text)
- `size` (Text) - CSS class like "h-14 w-auto"
- `logoUrl` (Text/URL) - Alternative URL if not using Media

---

## 3️⃣ FEATURES SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `subtitle` (Text)
- `description` (Long text)
- `learnMoreText` (Text) - Button text

### Repeatable Components:

#### **Feature Items** (Repeatable Component)
- `icon` (Text) - Icon name
- `title` (Text)
- `description` (Long text)
- `color` (Text) - Hex color
- `route` (Text/URL) - Link path

---

## 4️⃣ INTEGRATIONS SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)

### Repeatable Components:

#### **Stats** (Repeatable Component)
- `icon` (Text)
- `number` (Text) - e.g., "70+"
- `label` (Text)
- `description` (Text)

#### **Benefits** (Repeatable Component)
- `icon` (Text)
- `title` (Text)
- `description` (Long text)

#### **CTA Subsection**
- `title` (Text)
- `description` (Long text)
- `buttonText` (Text)
- `buttonLink` (Text/URL)
- `gdprBadgeText` (Text)

---

## 5️⃣ TESTIMONIALS SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)

### Repeatable Components:

#### **Testimonials** (Repeatable Component)
- `name` (Text)
- `role` (Text)
- `location` (Text)
- `image` (Media - Single image)
- `rating` (Number) - 1-5
- `quote` (Long text)

---

## 6️⃣ SUCCESS STORIES SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)
- `successBadgeText` (Text)
- `caseStudyText` (Text)
- `readFullStoryText` (Text)
- `propertyGalleryTitle` (Text)

### Repeatable Components:

#### **Stories** (Repeatable Component)
- `name` (Text)
- `property` (Text)
- `location` (Text)
- `ownerImage` (Media - Single image)
- `propertyImage` (Media - Single image)
- `story` (Long text) - Short version
- `fullStory` (Long text) - Full version

#### **Results** (Nested in Stories - Repeatable Component)
- `label` (Text)
- `value` (Text)
- `icon` (Text)

#### **Supporting Images** (Nested in Stories - Repeatable - Media)
- Just Media field - array of images

---

## 7️⃣ HOW IT WORKS SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)

### Repeatable Components:

#### **Steps** (Repeatable Component)
- `icon` (Text)
- `title` (Text)
- `description` (Long text)
- `color` (Text) - Hex color

---

## 8️⃣ FAQ SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)

### Repeatable Components:

#### **FAQ Items** (Repeatable Component)
- `icon` (Text)
- `question` (Text)
- `answer` (Long text)

---

## 9️⃣ CTA SECTION (Component - Single)

### Fields Needed:
- `title` (Text)
- `description` (Long text)
- `primaryButtonText` (Text)
- `primaryButtonLink` (Text/URL)
- `secondaryButtonText` (Text)
- `secondaryButtonLink` (Text/URL)
- `sslText` (Text)
- `supportText` (Text)

### Repeatable Components:

#### **Benefits** (Repeatable Component)
- `text` (Text)

---

## 🔟 CONTACT FORM SECTION (Component - Single)

### Fields Needed:
- `sectionTitle` (Text)
- `emailLabel` (Text)
- `emailAddress` (Text)
- `phoneLabel` (Text)
- `phoneNumber` (Text)
- `sslBadgeText` (Text)
- `gdprBadgeText` (Text)

### Form Labels:
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

## 📊 SUMMARY

### Total Sections: 10
1. Hero Section ✅ (partially done)
2. About Us Section
3. Features Section
4. Integrations Section
5. Testimonials Section
6. Success Stories Section
7. How It Works Section
8. FAQ Section
9. CTA Section
10. Contact Form Section

---

## 🎯 STRAPI SETUP INSTRUCTIONS

### What You Need to Do in Strapi:

1. **Go to Content-Type Builder**
2. **Edit existing "Home Page" Single Type**
3. **Add these Components one by one:**

   - `heroSection` (already exists - add missing fields)
   - `aboutSection` (NEW)
   - `featuresSection` (NEW)
   - `integrationsSection` (NEW)
   - `testimonialsSection` (NEW)
   - `successStoriesSection` (NEW)
   - `howItWorksSection` (NEW)
   - `faqSection` (NEW)
   - `ctaSection` (NEW)
   - `contactSection` (NEW)

4. **For each Component, add all the fields listed above**

---

## ⏭️ NEXT STEP

Tell me when you're ready and I'll:
1. Create a detailed step-by-step guide for creating each component in Strapi
2. Show you the exact structure to create
3. Then update all components to use Strapi data

Ready? 🚀






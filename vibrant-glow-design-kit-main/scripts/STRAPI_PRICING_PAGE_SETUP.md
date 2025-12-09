# Strapi Pricing Page Setup Guide

## Issue
The pricing-page content type exists in Strapi but doesn't have the correct schema. You need to set up the content type structure first.

## Steps to Set Up Pricing Page in Strapi

### 1. Go to Strapi Admin
- Navigate to: `http://localhost:1337/admin` (or your Strapi URL)
- Go to **Content-Type Builder**

### 2. Find or Create "Pricing Page" Single Type
- Look for "Pricing Page" in Single Types
- If it doesn't exist, create it:
  - Click "Create new single type"
  - Name it: `pricing-page`
  - Click "Continue"

### 3. Add the Following Component Fields

You need to add these component fields to the pricing-page:

#### a. Hero Section (Component)
- Field name: `hero`
- Type: **Component** (single)
- Component: Create a new component called `shared.hero-section` with:
  - `title` (Text)
  - `subtitle` (Text)

#### b. Plans Section (Component)
- Field name: `plans`
- Type: **Component** (single)
- Component: Create a new component called `shared.plans-section` with:
  - `basic` (Component - single) → Create `shared.basic-plan` with:
    - `name` (Text)
    - `fee` (Text)
    - `description` (Text)
    - `features` (Component - repeatable) → Create `shared.feature-item` with:
      - `text` (Text)
    - `buttonText` (Text)
  - `premium` (Component - single) → Create `shared.premium-plan` with:
    - `name` (Text)
    - `fee` (Text)
    - `description` (Text)
    - `features` (Component - repeatable) → Use `shared.feature-item`
    - `buttonText` (Text)
    - `popular` (Text, optional)
  - `superPremium` (Component - single) → Create `shared.super-premium-plan` with:
    - `name` (Text)
    - `fee` (Text)
    - `description` (Text)
    - `features` (Component - repeatable) → Use `shared.feature-item`
    - `buttonText` (Text)

#### c. Sections (Component)
- Field name: `sections`
- Type: **Component** (single)
- Component: Create `shared.sections` with:
  - `setup` (Component - single) → Create `shared.setup-section` with:
    - `title` (Text)
    - `subtitle` (Text)
    - `features` (Component - repeatable) → Use `shared.feature-item`
    - `button` (Text)
  - `upgrade` (Component - single) → Create `shared.upgrade-section` with:
    - `title` (Text)
    - `subtitle` (Text)
    - `note` (Text, optional)
    - `features` (Component - repeatable) → Use `shared.feature-item`
    - `button` (Text)
  - `compliance` (Component - single) → Create `shared.compliance-section` with:
    - `title` (Text)
    - `subtitle` (Text)
    - `note` (Text, optional)
    - `setupFee` (Text, optional)
    - `features` (Component - repeatable) → Use `shared.feature-item`
    - `button` (Text)

#### d. Trust Section (Component)
- Field name: `trust`
- Type: **Component** (single)
- Component: Create `shared.trust-section` with:
  - `title` (Text)
  - `points` (Component - repeatable) → Use `shared.trust-point` with:
    - `text` (Text)

#### e. Footer (Component)
- Field name: `footer`
- Type: **Component** (single)
- Component: Create `shared.footer-cta` with:
  - `title` (Text)
  - `button` (Text)

### 4. Save and Publish
- Click **Save** in Content-Type Builder
- Go to **Content Manager** → **Single Types** → **Pricing Page**
- Click **Publish** (even if empty)

### 5. Set Permissions
- Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
- Find "Pricing Page" and enable:
  - `find` (GET)
  - `update` (PUT)
- Click **Save**

### 6. Run the Import Script
After setting up the schema, run:
```bash
npm run import:pricingpage
```

## Alternative: Use JSON Fields (Simpler)

If components are too complex, you can use JSON fields instead:

1. In Content-Type Builder, add these fields to `pricing-page`:
   - `hero` (JSON)
   - `plans` (JSON)
   - `sections` (JSON)
   - `trust` (JSON)
   - `footer` (JSON)

2. Then the import script will work as-is.

## Troubleshooting

- **"Invalid key hero"**: The schema doesn't have a `hero` field. Follow steps above.
- **"404 Not Found"**: The content type doesn't exist. Create it first.
- **"401/403 Unauthorized"**: Set permissions in Settings → Roles → Public.






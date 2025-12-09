# Homepage Strapi Integration - Completion Plan

## 🎯 Goal: Complete Homepage CMS Integration

Make the entire homepage fully editable from Strapi CMS.

---

## ✅ Already Completed

1. ✅ Strapi API service extended (`getHomePage()` method)
2. ✅ Helper utilities created (`strapi-helpers.ts`)
3. ✅ Hero component updated with Strapi support

---

## 🚧 Remaining Work

### Phase 2: Update All Components (9 remaining)

1. **AboutUs Component**
   - Section title, description
   - 4 Value cards (icon, title, description, link)
   - 12 Partner logos (name, logo, alt, size)
   - Trust badge text
   - Learn More button

2. **Features Component**
   - Section title, subtitle, description
   - 9 Feature items (icon, title, description, color, route)
   - "Learn More" button text

3. **Integrations Component**
   - Section title, description
   - 3 Stats (icon, number, label, description)
   - 3 Benefits (icon, title, description)
   - CTA section (title, description, button text, link, GDPR badge)

4. **Testimonials Component**
   - Section title, description
   - 6+ Testimonials (name, role, location, image, rating, quote)

5. **SuccessStories Component**
   - Section title, description
   - Multiple stories with:
     - Name, property, location
     - Owner image, property image
     - Results metrics (4 per story)
     - Quote, full story
     - Supporting images gallery
   - Button text, badge text

6. **HowItWorks Component**
   - Section title, description
   - 5 Steps (icon, title, description, color)

7. **FAQ Component**
   - Section title, description
   - 10+ FAQ items (icon, question, answer)

8. **CTA Component**
   - Title, description
   - 4 Benefits
   - Primary/secondary button texts and links
   - Trust text

9. **ContactForm Component**
   - Section title
   - Email, phone
   - All form labels, placeholders, validation messages
   - Success modal text
   - Trust badges

---

### Phase 3: Connect Homepage

1. **Convert `app/page.tsx` to Server Component**
   - Remove `'use client'` directive
   - Fetch from Strapi API
   - Handle language detection
   - Pass data to all components

2. **Handle SEO Metadata**
   - Fetch from Strapi
   - Fallback to defaults

---

## 📋 Implementation Order

1. Update all 9 components with Strapi props
2. Convert homepage to server component
3. Test with fallback (Strapi offline)
4. Test with Strapi data (when available)

---

## 🔧 Files to Modify

### Components (9 files):
- `src/components/AboutUs.tsx`
- `src/components/Features.tsx`
- `src/components/Integrations.tsx`
- `src/components/Testimonials.tsx`
- `src/components/SuccessStories.tsx`
- `src/components/HowItWorks.tsx`
- `src/components/FAQ.tsx`
- `src/components/CTA.tsx`
- `src/components/ContactForm.tsx`

### Homepage:
- `app/page.tsx` (convert to server component)

---

## ✅ Safety Guarantees

- All components will work with or without Strapi
- Fallback to translations always available
- Zero breaking changes
- Gradual rollout possible






/**
 * Import Enhanced Direct Bookings service page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:enhanced-direct-bookings
 *   OR
 *   node scripts/import-enhanced-direct-bookings-to-strapi.js
 * 
 * Make sure:
 *   1. Strapi server is running
 *   2. You have set STRAPI_API_TOKEN in .env (or it will prompt for manual auth)
 *   3. Node.js 18+ is installed (for fetch support)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fetch is available in Node 18+
if (typeof globalThis.fetch === 'undefined') {
  console.error('❌ Error: fetch is not available. Please use Node.js 18+');
  process.exit(1);
}

// Configuration - reads from environment variables
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || ''; // Optional - set this in .env for authentication

// Read translation files
const translationsPath = path.join(__dirname, '../src/data/translations');

// Helper to read translation data for a specific locale
function getDirectBookingsTranslationData(locale) {
  const directBookingsData = JSON.parse(fs.readFileSync(path.join(translationsPath, `directBookings/${locale}.json`), 'utf8'));
  return directBookingsData;
}

// Helper function to make API calls
async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (API_TOKEN) {
    options.headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    throw error;
  }
}

// Transform translation data to Strapi format
function transformEnhancedDirectBookingsData(locale = 'en') {
  const directBookingsData = getDirectBookingsTranslationData(locale);
  const t = directBookingsData.directBookings;

  return {
    data: {
      // Single Type - direct fields (no pageContent wrapper, no title/slug)
      hero: {
        headline: t.hero?.title || '',
        subheadline: `${t.hero?.description || ''} ${t.hero?.subtitle || ''}`.trim(),
        ctaText: t.cta?.button || 'Book Free Consultation',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      // What We Do section (Why Direct Bookings Matter)
      whatWeDo: {
        title: t.whyMatter?.title || '',
        description: `${t.whyMatter?.description || ''} ${t.whyMatter?.solution || ''}`.trim(),
        features: [
          {
            iconName: 'TrendingDown',
            title: t.whyMatter?.commission?.title || '',
            description: t.whyMatter?.commission?.description || ''
          },
          {
            iconName: 'TrendingUp',
            title: t.whyMatter?.profit?.title || '',
            description: t.whyMatter?.profit?.description || ''
          }
        ]
      },
      
      // Includes section (What's Included)
      includes: {
        title: t.included?.title || 'What\'s Included in Enhanced Direct Bookings',
        description: '',
        features: [
          { iconName: 'Search', title: 'SEO + AEO-optimized booking page', description: t.included?.seoOptimized || '' },
          { iconName: 'MapPin', title: 'Google My Business listing & sync', description: t.included?.googleBusiness || '' },
          { iconName: 'CreditCard', title: 'Integrated payments', description: t.included?.integratedPayments || '' },
          { iconName: 'Calendar', title: 'Live calendar and availability', description: t.included?.liveCalendar || '' },
          { iconName: 'Users', title: 'Full guest data ownership', description: t.included?.guestData || '' },
          { iconName: 'Mail', title: 'Automated follow-up emails', description: t.included?.automatedFollowUp || '' },
          { iconName: 'Repeat', title: 'Repeat guest discounts', description: t.included?.repeatGuest || '' },
          { iconName: 'Link', title: 'OTA sync', description: t.included?.otaSync || '' },
          { iconName: 'Star', title: 'Brand-first design', description: t.included?.brandFirst || '' },
          { iconName: 'Settings', title: 'Total control', description: t.included?.totalControl || '' }
        ]
      },
      
      // Benefits section (Why It Works)
      benefits: {
        title: t.whyItWorks?.title || 'Why It Works',
        description: t.finalStatement?.main || '',
        features: []
      },
      
      // Benefits list (repeatable)
      benefitsList: [
        { iconName: 'DollarSign', title: 'Higher earnings per night', description: t.whyItWorks?.higherEarnings || 'Higher earnings per night' },
        { iconName: 'XCircle', title: 'No more 15% commission', description: t.whyItWorks?.noCommission || 'No more 15% commission bleed' },
        { iconName: 'Calendar', title: 'Total calendar control', description: t.whyItWorks?.calendarControl || 'Total calendar control' },
        { iconName: 'Search', title: 'Google and AI visibility', description: t.whyItWorks?.googleAI || 'Google and AI visibility' },
        { iconName: 'Repeat', title: 'Repeat bookings', description: t.whyItWorks?.repeatBookings || 'Repeat bookings from your own guest list' },
        { iconName: 'TrendingUp', title: 'Long-term brand value', description: t.whyItWorks?.longTerm || 'Long-term brand and asset value creation' }
      ],
      
      // How It Works section
      howItWorks: {
        title: t.howItWorks?.title || '',
        description: t.howItWorks?.subtitle || '',
        features: [
          {
            iconName: 'Link',
            title: t.howItWorks?.brandedUrl?.title || '',
            description: t.howItWorks?.brandedUrl?.description || ''
          },
          {
            iconName: 'Smartphone',
            title: t.howItWorks?.mobileFirst?.title || '',
            description: t.howItWorks?.mobileFirst?.description || ''
          },
          {
            iconName: 'Settings',
            title: t.howItWorks?.builtIn?.title || '',
            description: t.howItWorks?.builtIn?.description || ''
          },
          {
            iconName: 'CheckCircle',
            title: t.howItWorks?.directBooking?.title || '',
            description: t.howItWorks?.directBooking?.description || ''
          }
        ]
      },
      
      // Steps (From First Booking to Lifelong Guest)
      steps: [
        {
          iconName: 'Database',
          number: '1',
          title: t.lifetimeValue?.captures?.title || '',
          description: t.lifetimeValue?.captures?.description || ''
        },
        {
          iconName: 'Mail',
          number: '2',
          title: t.lifetimeValue?.followUp?.title || '',
          description: t.lifetimeValue?.followUp?.description || ''
        },
        {
          iconName: 'Newspaper',
          number: '3',
          title: t.lifetimeValue?.newsletters?.title || '',
          description: t.lifetimeValue?.newsletters?.description || ''
        }
      ],
      
      // FAQs
      faqs: [
        {
          icon: 'DollarSign',
          question: 'How does direct booking save me money?',
          answer: 'Direct bookings eliminate the 15%+ commission fees charged by platforms like Airbnb and Booking.com, meaning you keep 100% of the revenue.'
        },
        {
          icon: 'Search',
          question: 'Will guests find my property without Airbnb?',
          answer: 'Yes! We optimize your property for Google search, Google My Business, and AI search engines like ChatGPT and Perplexity, so guests can discover and book directly.'
        },
        {
          icon: 'Settings',
          question: 'Do I need technical knowledge to manage direct bookings?',
          answer: 'No. SmartHoster handles everything—from the booking page to payment processing to calendar sync. You just receive bookings and revenue.'
        },
        {
          icon: 'Link',
          question: 'How does this work with my existing Airbnb/Booking.com listings?',
          answer: 'Your direct booking calendar automatically syncs with Airbnb and Booking.com, so you never have double bookings. You can use both channels simultaneously.'
        }
      ],
      
      // Final CTA
      cta: {
        title: t.cta?.title || '',
        description: `${t.cta?.description || ''} ${t.cta?.subtitle || ''}`.trim(),
        ctaText: t.cta?.button || '',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

// Import for a specific locale
async function importEnhancedDirectBookingsForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Enhanced Direct Bookings page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    // Check if Strapi is accessible
    console.log('📡 Checking Strapi connection...');
    let existingData = null;
    try {
      existingData = await strapiRequest(`/enhanced-direct-bookings-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Enhanced Direct Bookings page not found in Strapi for locale: ${locale}.`);
        console.log('   Creating initial entry...');
        existingData = { data: null };
      } else {
        throw error;
      }
    }

    // Transform data
    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformEnhancedDirectBookingsData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    console.log('   - whatWeDo.title:', data.data.whatWeDo.title || 'EMPTY');
    console.log('   - cta.title:', data.data.cta.title || 'EMPTY');
    
    // Single Type - use PUT to create/update with locale parameter
    console.log(`\n💾 Importing Enhanced Direct Bookings page data to Strapi for locale: ${locale}...`);
    let result;
    try {
      result = await strapiRequest(`/enhanced-direct-bookings-page?locale=${locale}`, 'PUT', data);
      console.log('📥 Strapi Response:');
      console.log('   - Status: Success');
      console.log('   - Locale:', locale);
      if (result.data) {
        const resData = result.data;
        console.log('   - Response locale:', resData.locale || 'NOT FOUND');
        console.log('   - Response hero.headline:', resData.hero?.headline || 'NOT FOUND');
        console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
      }
      console.log(`✅ Enhanced Direct Bookings page imported successfully for locale: ${locale}!\n`);
    } catch (error) {
      if (error.message.includes('400')) {
        console.log('\n❌ Schema Error: The enhanced-direct-bookings-page content type exists but has a different schema.');
        console.log('\n📝 Quick Fix - Create/Update Schema in Strapi Admin:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Single Types → Enhanced Direct Bookings Page');
        console.log('   3. If it doesn\'t exist, create it as "enhanced-direct-bookings-page"');
        console.log('   4. The schema should match the structure in Blogs/src/api/enhanced-direct-bookings-page/');
        console.log('   5. Save and Publish');
        console.log('   6. Run this script again: npm run import:enhanced-direct-bookings\n');
        throw error;
      } else if (error.message.includes('404')) {
        console.log('\n❌ Content Type Not Found');
        console.log('\n📝 Create the enhanced-direct-bookings-page Single Type first:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Create new Single Type');
        console.log('   3. Name it: enhanced-direct-bookings-page');
        console.log('   4. Add fields matching the schema structure');
        console.log('   5. Save and Publish');
        console.log('   6. Run: npm run import:enhanced-direct-bookings\n');
        throw error;
      } else {
        throw error;
      }
    }

    console.log('📊 Import Summary:');
    console.log(`   Hero: ${data.data.hero.headline ? '✅' : '❌'}`);
    console.log(`   What We Do: ${data.data.whatWeDo.features.length} features`);
    console.log(`   Includes: ${data.data.includes.features.length} services`);
    console.log(`   Benefits: ${data.data.benefitsList.length} items`);
    console.log(`   How It Works: ${data.data.howItWorks.features.length} features`);
    console.log(`   Steps: ${data.data.steps.length} steps`);
    console.log(`   FAQs: ${data.data.faqs.length} questions`);
    console.log(`   CTA: ${data.data.cta.title ? '✅' : '❌'}\n`);

    console.log(`\n📝 Next steps:`);
    console.log(`   1. Go to Strapi Admin: ${STRAPI_URL}/admin`);
    console.log(`   2. Navigate to Content Manager > Enhanced Direct Bookings Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page`);
    console.log(`   4. Add icon names to features, benefits, and steps if needed\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    
    if (error.message.includes('400')) {
      console.error('\n💡 This might be a schema mismatch. Please check:');
      console.error('   1. Does the enhanced-direct-bookings-page content type exist in Strapi?');
      console.error('   2. Are all required components (service-hero, service-section, etc.) created?');
      console.error('   3. Check the error details above for specific field issues\n');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Authentication issue. Please:');
      console.error('   1. Set STRAPI_API_TOKEN in your .env file');
      console.error('   2. Or log in to Strapi Admin and get a token from Settings > API Tokens\n');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.error('\n💡 Connection issue. Please:');
      console.error('   1. Make sure Strapi server is running');
      console.error(`   2. Check if ${STRAPI_URL} is accessible\n`);
    }
    
    throw error;
  }
}

// Main import function - imports for all locales
async function importEnhancedDirectBookings() {
  console.log('🚀 Starting Enhanced Direct Bookings page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importEnhancedDirectBookingsForLocale(locale);
      console.log(`✅ Locale ${locale.toUpperCase()} completed successfully!\n`);
      
      // Wait 2 seconds before next locale to avoid rate limiting
      if (locale !== locales[locales.length - 1]) {
        console.log('⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to import locale ${locale.toUpperCase()}:`, error.message);
      results[locale] = { error: error.message };
    }
  }

  // Summary
  console.log('============================================================');
  console.log('📊 IMPORT SUMMARY');
  console.log('============================================================');
  for (const locale of locales) {
    const status = results[locale]?.error ? '❌ Failed' : '✅ Success';
    console.log(`   ${locale.toUpperCase()}: ${status}`);
  }
  console.log('============================================================\n');

  return results;
}

// Export for use in other scripts
export { importEnhancedDirectBookings, importEnhancedDirectBookingsForLocale, transformEnhancedDirectBookingsData };

// Run import if called directly
importEnhancedDirectBookings()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


/**
 * Import Full Service Management page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:full-service-management
 *   OR
 *   node scripts/import-full-service-management-to-strapi.js
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
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Read translation files
const translationsPath = path.join(__dirname, '../src/data/translations');

// Helper to read translation data for a specific locale
function getFullServiceTranslationData(locale) {
  const fullServiceData = JSON.parse(fs.readFileSync(path.join(translationsPath, `fullService/${locale}.json`), 'utf8'));
  return fullServiceData;
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
function transformFullServiceManagementData(locale = 'en') {
  const fullServiceData = getFullServiceTranslationData(locale);
  const t = fullServiceData.fullService;

  return {
    data: {
      hero: {
        headline: t.hero?.headline || '',
        subheadline: t.hero?.subheadline || '',
        ctaText: t.hero?.cta || 'Schedule a Free Consultation',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.whatWeDo?.title || '',
        description: t.whatWeDo?.description || '',
        features: [
          { iconName: 'FileCheck', title: t.whatWeDo?.highlights?.alCompliance?.title || '', description: t.whatWeDo?.highlights?.alCompliance?.description || '' },
          { iconName: 'Search', title: t.whatWeDo?.highlights?.seoAeo?.title || '', description: t.whatWeDo?.highlights?.seoAeo?.description || '' },
          { iconName: 'FileText', title: t.whatWeDo?.highlights?.keywordRich?.title || '', description: t.whatWeDo?.highlights?.keywordRich?.description || '' },
          { iconName: 'MapPin', title: t.whatWeDo?.highlights?.googleBusiness?.title || '', description: t.whatWeDo?.highlights?.googleBusiness?.description || '' },
          { iconName: 'Camera', title: t.whatWeDo?.highlights?.photography?.title || '', description: t.whatWeDo?.highlights?.photography?.description || '' },
          { iconName: 'Gift', title: t.whatWeDo?.highlights?.welcomeKits?.title || '', description: t.whatWeDo?.highlights?.welcomeKits?.description || '' },
          { iconName: 'Link', title: t.whatWeDo?.highlights?.directBooking?.title || '', description: t.whatWeDo?.highlights?.directBooking?.description || '' }
        ]
      },
      
      includes: {
        title: t.includes?.title || '',
        description: '',
        features: [
          { iconName: 'Sparkles', title: t.includes?.services?.aiOptimized?.title || '', description: t.includes?.services?.aiOptimized?.description || '' },
          { iconName: 'Users', title: t.includes?.services?.bookingGuest?.title || '', description: t.includes?.services?.bookingGuest?.description || '' },
          { iconName: 'FileCheck', title: t.includes?.services?.taxCompliance?.title || '', description: t.includes?.services?.taxCompliance?.description || '' },
          { iconName: 'Home', title: t.includes?.services?.cleaningMaintenance?.title || '', description: t.includes?.services?.cleaningMaintenance?.description || '' },
          { iconName: 'Link', title: t.includes?.services?.directBookingSite?.title || '', description: t.includes?.services?.directBookingSite?.description || '' },
          { iconName: 'Search', title: t.includes?.services?.googleSeo?.title || '', description: t.includes?.services?.googleSeo?.description || '' }
        ]
      },
      
      benefits: {
        title: t.whyChoose?.title || '',
        description: t.whyChoose?.description || '',
        features: []
      },
      
      benefitsList: [
        { iconName: 'TrendingUp', title: t.whyChoose?.benefits?.maximizeIncome?.title || '', description: t.whyChoose?.benefits?.maximizeIncome?.description || '' },
        { iconName: 'Sparkles', title: t.whyChoose?.benefits?.aeoAdvantage?.title || '', description: t.whyChoose?.benefits?.aeoAdvantage?.description || '' },
        { iconName: 'Shield', title: t.whyChoose?.benefits?.fullCompliance?.title || '', description: t.whyChoose?.benefits?.fullCompliance?.description || '' },
        { iconName: 'LayoutDashboard', title: t.whyChoose?.benefits?.ownerDashboard?.title || '', description: t.whyChoose?.benefits?.ownerDashboard?.description || '' },
        { iconName: 'CheckCircle', title: t.whyChoose?.benefits?.guestReady?.title || '', description: t.whyChoose?.benefits?.guestReady?.description || '' }
      ],
      
      howItWorks: {
        title: t.process?.title || '',
        description: '',
        features: [
          { iconName: 'MessageSquare', title: t.process?.steps?.consultation?.title || '', description: t.process?.steps?.consultation?.description || '' },
          { iconName: 'Settings', title: t.process?.steps?.liveManagement?.title || '', description: t.process?.steps?.liveManagement?.description || '' },
          { iconName: 'TrendingUp', title: t.process?.steps?.growthReporting?.title || '', description: t.process?.steps?.growthReporting?.description || '' }
        ]
      },
      
      steps: [],
      
      faqs: [
        { icon: 'HelpCircle', question: t.faqs?.questions?.whatIncludes?.question || '', answer: t.faqs?.questions?.whatIncludes?.answer || '' },
        { icon: 'Search', question: t.faqs?.questions?.howOptimized?.question || '', answer: t.faqs?.questions?.howOptimized?.answer || '' },
        { icon: 'Users', question: t.faqs?.questions?.ownCleaner?.question || '', answer: t.faqs?.questions?.ownCleaner?.answer || '' },
        { icon: 'Globe', question: t.faqs?.questions?.platforms?.question || '', answer: t.faqs?.questions?.platforms?.answer || '' },
        { icon: 'Wrench', question: t.faqs?.questions?.maintenance?.question || '', answer: t.faqs?.questions?.maintenance?.answer || '' }
      ],
      
      cta: {
        title: t.finalCta?.title || '',
        description: '',
        ctaText: t.finalCta?.button || 'Schedule a Free Consultation',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

// Import for a specific locale
async function importFullServiceManagementForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Full Service Management page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    // Check if Strapi is accessible
    console.log('📡 Checking Strapi connection...');
    let existingData = null;
    try {
      existingData = await strapiRequest(`/full-service-management-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Full Service Management page not found in Strapi for locale: ${locale}.`);
        console.log('   Creating initial entry...');
        existingData = { data: null };
      } else {
        throw error;
      }
    }

    // Transform data
    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformFullServiceManagementData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Full Service Management page data to Strapi for locale: ${locale}...`);
    let result;
    try {
      result = await strapiRequest(`/full-service-management-page?locale=${locale}`, 'PUT', data);
      console.log('📥 Strapi Response:');
      console.log('   - Status: Success');
      console.log('   - Locale:', locale);
      if (result.data) {
        const resData = result.data;
        console.log('   - Response locale:', resData.locale || 'NOT FOUND');
        console.log('   - Response hero.headline:', resData.hero?.headline || 'NOT FOUND');
        console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
      }
      console.log(`✅ Full Service Management page imported successfully for locale: ${locale}!\n`);
    } catch (error) {
      if (error.message.includes('400')) {
        console.log('\n❌ Schema Error: The full-service-management-page content type exists but has a different schema.');
        console.log('\n📝 Quick Fix - Create/Update Schema in Strapi Admin:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Single Types → Full Service Management Page');
        console.log('   3. If it doesn\'t exist, create it as "full-service-management-page"');
        console.log('   4. The schema should match the structure in Blogs/src/api/full-service-management-page/');
        console.log('   5. Save and Publish');
        console.log('   6. Run this script again: npm run import:full-service-management\n');
        throw error;
      } else if (error.message.includes('404')) {
        console.log('\n❌ Content Type Not Found');
        console.log('\n📝 Create the full-service-management-page Single Type first:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Create new Single Type');
        console.log('   3. Name it: full-service-management-page');
        console.log('   4. Add fields matching the schema structure');
        console.log('   5. Save and Publish');
        console.log('   6. Run: npm run import:full-service-management\n');
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
      console.log(`   FAQs: ${data.data.faqs.length} questions`);
      console.log(`   CTA: ${data.data.cta.title ? '✅' : '❌'}\n`);

      console.log(`\n📝 Next steps:`);
      console.log(`   1. Go to Strapi Admin: ${STRAPI_URL}/admin`);
      console.log(`   2. Navigate to Content Manager > Full Service Management Page (locale: ${locale})`);
      console.log(`   3. Review and PUBLISH the page\n`);

      return result;
    } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    
    if (error.message.includes('400')) {
      console.error('\n💡 This might be a schema mismatch. Please check:');
      console.error('   1. Does the full-service-management-page content type exist in Strapi?');
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
async function importFullServiceManagement() {
  console.log('🚀 Starting Full Service Management page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importFullServiceManagementForLocale(locale);
      console.log(`✅ Locale ${locale.toUpperCase()} completed successfully!\n`);
      
      if (locale !== locales[locales.length - 1]) {
        console.log('⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to import locale ${locale.toUpperCase()}:`, error.message);
      results[locale] = { error: error.message };
    }
  }

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
export { importFullServiceManagement, importFullServiceManagementForLocale, transformFullServiceManagementData };

// Run import if called directly
importFullServiceManagement()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });

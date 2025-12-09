/**
 * Import About Page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:aboutpage
 *   OR
 *   node scripts/import-aboutpage-to-strapi.js
 * 
 * Make sure:
 *   1. Strapi server is running on http://localhost:1337
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

// Read translation files - About page has its own translation file
const translationsPath = path.join(__dirname, '../src/data/translations');

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

// Transform translation data to Strapi format for a specific locale
function transformAboutPageData(locale = 'en') {
  // Read the appropriate translation file
  const aboutData = JSON.parse(fs.readFileSync(path.join(translationsPath, `about/${locale}.json`), 'utf8'));
  const t = aboutData.about || {};

  // Helper to get nested value safely
  const get = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((o, key) => o?.[key], obj) || defaultValue;
  };

  return {
    data: {
      hero: {
        title: t.hero?.title || 'About SmartHoster.io',
        description: t.hero?.description || ''
      },

      missionVision: {
        mission: {
          iconName: 'Shield',
          title: t.missionVision?.mission?.title || '',
          content: t.missionVision?.mission?.content || ''
        },
        vision: {
          iconName: 'Lightbulb',
          title: t.missionVision?.vision?.title || '',
          content: t.missionVision?.vision?.content || ''
        }
      },

      originStory: {
        title: t.origin?.title || '',
        content: t.origin?.content || ''
      },

      coreValues: {
        title: t.values?.title || '',
        values: [
          {
            iconName: 'Users',
            title: t.values?.ownerFirst?.title || '',
            description: t.values?.ownerFirst?.description || ''
          },
          {
            iconName: 'Eye',
            title: t.values?.transparency?.title || '',
            description: t.values?.transparency?.description || ''
          },
          {
            iconName: 'HeartHandshake',
            title: t.values?.humanSupport?.title || '',
            description: t.values?.humanSupport?.description || ''
          },
          {
            iconName: 'Cog',
            title: t.values?.automation?.title || '',
            description: t.values?.automation?.description || ''
          },
          {
            iconName: 'Recycle',
            title: t.values?.sustainability?.title || '',
            description: t.values?.sustainability?.description || ''
          }
        ]
      },

      team: {
        title: t.team?.title || '',
        description: t.team?.description || '',
        members: [
          {
            name: 'Miguel Ribeiro',
            role: t.team?.members?.miguel?.role || '',
            description: t.team?.members?.miguel?.description || ''
            // image will be uploaded manually in Strapi
          },
          {
            name: 'Patricia Garlini',
            role: t.team?.members?.patricia?.role || '',
            description: t.team?.members?.patricia?.description || ''
          },
          {
            name: 'Shubanshu',
            role: t.team?.members?.shubanshu?.role || '',
            description: t.team?.members?.shubanshu?.description || ''
          },
          {
            name: 'José Raimundo',
            role: t.team?.members?.raimundo?.role || '',
            description: t.team?.members?.raimundo?.description || ''
          },
          {
            name: 'Carlos Ferreira',
            role: t.team?.members?.carlos?.role || '',
            description: t.team?.members?.carlos?.description || ''
          },
          {
            name: 'Adolfo Ferreira',
            role: t.team?.members?.adolfo?.role || '',
            description: t.team?.members?.adolfo?.description || ''
          },
          {
            name: 'Sofia Mendes',
            role: t.team?.members?.sofia?.role || '',
            description: t.team?.members?.sofia?.description || ''
          },
          {
            name: 'Zara Alam',
            role: t.team?.members?.zara?.role || '',
            description: t.team?.members?.zara?.description || ''
          }
        ]
      },

      sustainability: {
        title: t.green?.title || '',
        content: t.green?.content || '',
        features: [
          { text: t.green?.features?.led || '' },
          { text: t.green?.features?.appliances || '' },
          { text: t.green?.features?.water || '' },
          { text: t.green?.features?.linens || '' },
          { text: t.green?.features?.upgrades || '' }
        ],
        ctaText: t.green?.cta || '',
        ctaLink: '/green-pledge'
        // image and imageAlt will be uploaded/managed manually in Strapi
      },

      cta: {
        title: 'Want to Learn More?',
        description: 'Discover how SmartHoster can transform your property management experience with our comprehensive services and expert local knowledge.',
        primaryButtonText: 'Learn More About Our Services',
        primaryButtonLink: '/learn-more',
        secondaryButtonText: 'Book a Free Consultation',
        calendlyUrl: 'https://calendly.com/admin-smarthoster'
      }
    }
  };
}

// Main import function for a specific locale
async function importAboutPageForLocale(locale = 'en') {
  console.log(`🚀 Starting About Page import to Strapi for locale: ${locale}...\n`);

  try {
    // Check if Strapi is accessible
    console.log('📡 Checking Strapi connection...');
    await strapiRequest('/about-page');
    console.log('✅ Strapi is accessible\n');

    // GET existing data first (to preserve structure) - with locale
    console.log(`📥 Fetching existing About Page data for locale: ${locale}...`);
    let existingData = null;
    try {
      existingData = await strapiRequest(`/about-page?populate=*&locale=${locale}`);
      console.log('✅ Existing data fetched\n');
    } catch (error) {
      // 404 means entry doesn't exist for this locale - that's okay, we'll create it
      if (error.message.includes('404')) {
        console.log(`ℹ️  No existing entry for locale ${locale} - will create new entry\n`);
        existingData = null;
      } else {
        throw error;
      }
    }

    // Transform new data for this locale
    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const newData = transformAboutPageData(locale);
    console.log('✅ Data transformed\n');

    // Merge: Use new data (don't include documentId in PUT request)
    const mergedData = { ...newData };

    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.title:', mergedData.data.hero?.title);
    console.log('   - hero.description:', mergedData.data.hero?.description?.substring(0, 50) || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.title should match locale!');
    if (locale === 'pt' && mergedData.data.hero?.title === 'About SmartHoster') {
      console.log('   - ❌ ERROR: Portuguese locale has English title!');
    }
    if (locale === 'en' && mergedData.data.hero?.title === 'Sobre a SmartHoster') {
      console.log('   - ❌ ERROR: English locale has Portuguese title!');
    }
    console.log('   - mission.title:', mergedData.data.missionVision?.mission?.title || 'EMPTY');
    console.log('   - mission.content:', mergedData.data.missionVision?.mission?.content?.substring(0, 50) || 'EMPTY');
    console.log('   - vision.title:', mergedData.data.missionVision?.vision?.title || 'EMPTY');
    console.log('   - vision.content:', mergedData.data.missionVision?.vision?.content?.substring(0, 50) || 'EMPTY');
    console.log('   - origin.title:', mergedData.data.originStory?.title || 'EMPTY');
    console.log('   - origin.content:', mergedData.data.originStory?.content?.substring(0, 50) || 'EMPTY');
    console.log('   - coreValues.title:', mergedData.data.coreValues?.title || 'EMPTY');
    console.log('   - coreValues.values length:', mergedData.data.coreValues?.values?.length || 0);
    console.log('   - team.members length:', mergedData.data.team?.members?.length || 0);
    console.log('   - sustainability.features length:', mergedData.data.sustainability?.features?.length || 0);
    
    // Update about page using PUT with locale parameter
    console.log(`💾 Importing About Page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/about-page?locale=${locale}`, 'PUT', mergedData);
    
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      const resData = result.data;
      console.log('   - Response locale:', resData.locale || 'NOT FOUND');
      console.log('   - Response hero.title:', resData.hero?.title || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
      if (locale === 'pt' && resData.locale !== 'pt') {
        console.log('   - ❌ ERROR: Portuguese locale returned wrong locale:', resData.locale);
      }
      if (locale === 'pt' && resData.hero?.title === 'About SmartHoster') {
        console.log('   - ❌ ERROR: Portuguese locale has English title in response!');
      }
      console.log('   - coreValues.values in response:', resData.coreValues?.values?.length || 0,
        '(should be', mergedData.data.coreValues?.values?.length || 0, ')');
      console.log('   - team.members in response:', resData.team?.members?.length || 0,
        '(should be', mergedData.data.team?.members?.length || 0, ')');
      
      // Check if arrays were saved
      if (resData.coreValues?.values?.length === 0 && mergedData.data.coreValues?.values?.length > 0) {
        console.log('\n⚠️  WARNING: Core Values array was not saved! This might be a Strapi v5 API format issue.');
        console.log('   Try manually adding values in Strapi Admin UI, then check if they appear.');
      }
    }
    
    console.log(`\n✅ About Page imported successfully for locale: ${locale}!`);
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Strapi admin: http://localhost:1337/admin');
    console.log(`   2. Navigate to Content Manager → Single Types → About Page (locale: ${locale})`);
    console.log('   3. Check if arrays (coreValues.values, team.members, sustainability.features) are populated');
    console.log('   4. If arrays are empty, add at least one item manually in Strapi UI');
    console.log('   5. Click Publish (top right)');
    console.log('   6. Upload images manually (team photos, sustainability image)\n');

    return result;
  } catch (error) {
    console.error(`❌ Error importing About Page for locale ${locale}:`, error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Tip: You need to authenticate with Strapi.');
      console.log('   Option 1: Generate an API token in Strapi Admin → Settings → API Tokens');
      console.log('   Option 2: Set STRAPI_API_TOKEN in your .env file');
      console.log('   Option 3: Make sure "about-page" has public "find" and "update" permissions\n');
    }
    
    throw error;
  }
}

// Main import function - imports for all locales
async function importAboutPage() {
  console.log('🚀 Starting About Page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = [];

  for (const locale of locales) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
      console.log('='.repeat(60) + '\n');
      
      const result = await importAboutPageForLocale(locale);
      results.push({ locale, success: true, result });
      
      // Wait 2 seconds between locales to avoid rate limiting
      if (locale !== locales[locales.length - 1]) {
        console.log('\n⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to import for locale ${locale}:`, error.message);
      results.push({ locale, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  for (const { locale, success } of results) {
    console.log(`   ${locale.toUpperCase()}: ${success ? '✅ Success' : '❌ Failed'}`);
  }
  console.log('='.repeat(60) + '\n');
}

// Run import
importAboutPage()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });

export { importAboutPage, importAboutPageForLocale, transformAboutPageData };

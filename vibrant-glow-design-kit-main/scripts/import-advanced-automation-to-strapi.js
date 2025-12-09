/**
 * Import Advanced Automation page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:advanced-automation
 *   OR
 *   node scripts/import-advanced-automation-to-strapi.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (typeof globalThis.fetch === 'undefined') {
  console.error('❌ Error: fetch is not available. Please use Node.js 18+');
  process.exit(1);
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const translationsPath = path.join(__dirname, '../src/data/translations');

// Helper to read translation data for a specific locale
function getAutomationTranslationData(locale) {
  const automationData = JSON.parse(fs.readFileSync(path.join(translationsPath, `automation/${locale}.json`), 'utf8'));
  return automationData;
}

async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
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

function transformAdvancedAutomationData(locale = 'en') {
  const automationData = getAutomationTranslationData(locale);
  const t = automationData;

  return {
    data: {
      hero: {
        headline: t.hero?.headline || '',
        subheadline: t.hero?.subheadline || '',
        ctaText: t.hero?.cta || 'Request a Free Automation Evaluation',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.multiLayeredAccess?.title || '',
        description: `${t.multiLayeredAccess?.description || ''} ${t.multiLayeredAccess?.conclusion || ''}`.trim(),
        features: [
          { iconName: 'Lock', title: 'Digital Smart Locks', description: t.multiLayeredAccess?.features?.[0] || '' },
          { iconName: 'Key', title: 'Manual Lockboxes', description: t.multiLayeredAccess?.features?.[1] || '' },
          { iconName: 'Users', title: 'On-Call Staff', description: t.multiLayeredAccess?.features?.[2] || '' }
        ]
      },
      
      includes: {
        title: t.smartLocks?.title || '',
        description: t.smartLocks?.description || '',
        features: [
          { iconName: 'Lock', title: 'No physical keys', description: t.smartLocks?.features?.[0] || '' },
          { iconName: 'CheckCircle', title: 'No coordination hassle', description: t.smartLocks?.features?.[1] || '' },
          { iconName: 'Clock', title: 'No guest left waiting', description: t.smartLocks?.features?.[2] || '' }
        ]
      },
      
      benefits: {
        title: t.whyItWorks?.title || '',
        description: `${t.whyItWorks?.description || ''} ${t.whyItWorks?.subtitle || ''}`.trim(),
        features: []
      },
      
      benefitsList: [
        { iconName: 'Shield', title: 'No lockouts', description: t.whyItWorks?.features?.[0] || '' },
        { iconName: 'CheckCircle', title: 'No missed check-ins', description: t.whyItWorks?.features?.[1] || '' },
        { iconName: 'Clock', title: 'No service delays', description: t.whyItWorks?.features?.[2] || '' },
        { iconName: 'HelpCircle', title: 'No guesswork', description: t.whyItWorks?.features?.[3] || '' }
      ],
      
      howItWorks: {
        title: t.smartTag?.title || '',
        description: t.smartTag?.description || '',
        features: [
          { iconName: 'Bell', title: 'Auto-notify cleaning staff', description: t.smartTag?.features?.[0] || '' },
          { iconName: 'Calendar', title: 'Maintenance reminders', description: t.smartTag?.features?.[1] || '' },
          { iconName: 'CheckCircle', title: 'Verify check-in/out timing', description: t.smartTag?.features?.[2] || '' },
          { iconName: 'Database', title: 'Sync with calendars', description: t.smartTag?.features?.[3] || '' }
        ]
      },
      
      steps: [
        { iconName: 'Building', title: t.buildingAccess?.title || '', description: `${t.buildingAccess?.description || ''} ${t.buildingAccess?.conclusion || ''}`.trim(), number: '1' },
        { iconName: 'Key', title: t.lockboxes?.title || '', description: `${t.lockboxes?.description || ''} ${t.lockboxes?.conclusion || ''}`.trim(), number: '2' },
        { iconName: 'Users', title: t.humanOversight?.title || '', description: `${t.humanOversight?.description || ''} ${t.humanOversight?.conclusion || ''}`.trim(), number: '3' }
      ],
      
      faqs: [
        { icon: 'Building', question: t.faqs?.questions?.apartments?.question || '', answer: t.faqs?.questions?.apartments?.answer || '' },
        { icon: 'AlertTriangle', question: t.faqs?.questions?.malfunction?.question || '', answer: t.faqs?.questions?.malfunction?.answer || '' },
        { icon: 'Settings', question: t.faqs?.questions?.installation?.question || '', answer: t.faqs?.questions?.installation?.answer || '' },
        { icon: 'LayoutDashboard', question: t.faqs?.questions?.portfolio?.question || '', answer: t.faqs?.questions?.portfolio?.answer || '' }
      ],
      
      cta: {
        title: t.finalCta?.headline || '',
        description: t.finalCta?.description || '',
        ctaText: t.finalCta?.cta || 'Schedule My Evaluation',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importAdvancedAutomationForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Advanced Automation page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    console.log('📡 Checking Strapi connection...');
    try {
      await strapiRequest(`/advanced-automation-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Advanced Automation page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformAdvancedAutomationData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Advanced Automation page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/advanced-automation-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      const resData = result.data;
      console.log('   - Response locale:', resData.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Advanced Automation page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Advanced Automation Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importAdvancedAutomation() {
  console.log('🚀 Starting Advanced Automation page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importAdvancedAutomationForLocale(locale);
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

export { importAdvancedAutomation, importAdvancedAutomationForLocale, transformAdvancedAutomationData };

importAdvancedAutomation()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


/**
 * Import Green Pledge page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:green-pledge
 *   OR
 *   node scripts/import-green-pledge-to-strapi.js
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

function getGreenPledgeTranslationData(locale) {
  const greenPledgeData = JSON.parse(fs.readFileSync(path.join(translationsPath, `greenPledge/${locale}.json`), 'utf8'));
  return greenPledgeData;
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

function transformGreenPledgeData(locale = 'en') {
  const greenPledgeData = getGreenPledgeTranslationData(locale);
  const t = greenPledgeData.greenPledge;

  return {
    data: {
      hero: {
        headline: t.hero?.headline || '',
        subheadline: t.hero?.subheadline || '',
        ctaText: 'Learn More About Our Green Initiatives',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.pledge?.title || '',
        description: t.pledge?.description || '',
        features: []
      },
      
      includes: {
        title: t.initiatives?.title || '',
        description: '',
        features: [
          { iconName: 'Car', title: t.initiatives?.items?.electricVehicles?.title || '', description: t.initiatives?.items?.electricVehicles?.description || '' },
          { iconName: 'Bed', title: t.initiatives?.items?.tailoredBedding?.title || '', description: t.initiatives?.items?.tailoredBedding?.description || '' },
          { iconName: 'Lightbulb', title: t.initiatives?.items?.ledLighting?.title || '', description: t.initiatives?.items?.ledLighting?.description || '' },
          { iconName: 'Droplet', title: t.initiatives?.items?.waterSaving?.title || '', description: t.initiatives?.items?.waterSaving?.description || '' },
          { iconName: 'Leaf', title: t.initiatives?.items?.ecoFriendlyCleaning?.title || '', description: t.initiatives?.items?.ecoFriendlyCleaning?.description || '' },
          { iconName: 'Package', title: t.initiatives?.items?.reusableDispensers?.title || '', description: t.initiatives?.items?.reusableDispensers?.description || '' },
          { iconName: 'Recycle', title: t.initiatives?.items?.recyclingProgram?.title || '', description: t.initiatives?.items?.recyclingProgram?.description || '' },
          { iconName: 'Zap', title: t.initiatives?.items?.energyEfficient?.title || '', description: t.initiatives?.items?.energyEfficient?.description || '' },
          { iconName: 'Thermometer', title: t.initiatives?.items?.smartThermostats?.title || '', description: t.initiatives?.items?.smartThermostats?.description || '' },
          { iconName: 'Sun', title: t.initiatives?.items?.solarPower?.title || '', description: t.initiatives?.items?.solarPower?.description || '' }
        ]
      },
      
      benefits: {
        title: t.whyGreen?.title || '',
        description: t.whyGreen?.description || '',
        features: []
      },
      
      benefitsList: [
        { iconName: 'Heart', title: 'Healthier Environment', description: t.whyGreen?.benefits?.health || '' },
        { iconName: 'Leaf', title: 'Resource Conservation', description: t.whyGreen?.benefits?.conservation || '' }
      ],
      
      howItWorks: {
        title: t.guestHelp?.title || '',
        description: t.guestHelp?.description || '',
        features: [
          { iconName: 'Recycle', title: t.guestHelp?.actions?.recycle?.title || '', description: t.guestHelp?.actions?.recycle?.description || '' },
          { iconName: 'Droplet', title: t.guestHelp?.actions?.conserveWater?.title || '', description: t.guestHelp?.actions?.conserveWater?.description || '' },
          { iconName: 'Power', title: t.guestHelp?.actions?.turnOffElectricity?.title || '', description: t.guestHelp?.actions?.turnOffElectricity?.description || '' },
          { iconName: 'Leaf', title: t.guestHelp?.actions?.useEcoAmenities?.title || '', description: t.guestHelp?.actions?.useEcoAmenities?.description || '' },
          { iconName: 'Bed', title: t.guestHelp?.actions?.supportTailoredBedding?.title || '', description: t.guestHelp?.actions?.supportTailoredBedding?.description || '' },
          { iconName: 'Lightbulb', title: t.guestHelp?.actions?.mindfulEnergy?.title || '', description: t.guestHelp?.actions?.mindfulEnergy?.description || '' }
        ]
      },
      
      steps: [],
      
      faqs: [
        { icon: 'Lightbulb', question: t.faqs?.questions?.ledLighting?.question || '', answer: t.faqs?.questions?.ledLighting?.answer || '' },
        { icon: 'Bed', question: t.faqs?.questions?.tailoredBedding?.question || '', answer: t.faqs?.questions?.tailoredBedding?.answer || '' },
        { icon: 'Thermometer', question: t.faqs?.questions?.energyConservation?.question || '', answer: t.faqs?.questions?.energyConservation?.answer || '' },
        { icon: 'Sun', question: t.faqs?.questions?.solarPanels?.question || '', answer: t.faqs?.questions?.solarPanels?.answer || '' },
        { icon: 'Users', question: t.faqs?.questions?.guestContribution?.question || '', answer: t.faqs?.questions?.guestContribution?.answer || '' }
      ],
      
      cta: {
        title: t.joinUs?.title || '',
        description: `${t.joinUs?.description || ''} ${t.joinUs?.cta || ''}`.trim(),
        ctaText: t.joinUs?.cta || 'Book Your Sustainable Stay Today',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importGreenPledgeForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Green Pledge page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    try {
      await strapiRequest(`/green-pledge-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Green Pledge page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformGreenPledgeData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Green Pledge page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/green-pledge-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      console.log('   - Response locale:', result.data.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Green Pledge page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Green Pledge Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importGreenPledge() {
  console.log('🚀 Starting Green Pledge page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importGreenPledgeForLocale(locale);
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

export { importGreenPledge, importGreenPledgeForLocale, transformGreenPledgeData };

importGreenPledge()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


/**
 * Import Local Expertise page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:local-expertise
 *   OR
 *   node scripts/import-local-expertise-to-strapi.js
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

function getLocalExpertiseTranslationData(locale) {
  const localExpertiseData = JSON.parse(fs.readFileSync(path.join(translationsPath, `localExpertise/${locale}.json`), 'utf8'));
  return localExpertiseData;
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

function transformLocalExpertiseData(locale = 'en') {
  const localExpertiseData = getLocalExpertiseTranslationData(locale);
  const t = localExpertiseData;

  return {
    data: {
      hero: {
        headline: t.hero?.headline || '',
        subheadline: t.hero?.subheadline || '',
        ctaText: t.hero?.cta || 'Book a Free Property Assessment',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.whyLocal?.title || '',
        description: t.whyLocal?.description || '',
        features: []
      },
      
      includes: {
        title: t.consultation?.title || '',
        description: t.consultation?.description || '',
        features: [
          { iconName: 'Bed', title: 'Bed comfort and quality', description: t.consultation?.assessments?.bedComfort || '' },
          { iconName: 'Pillow', title: 'Pillow firmness and variety', description: t.consultation?.assessments?.pillows || '' },
          { iconName: 'Droplet', title: 'Shower pressure and plumbing', description: t.consultation?.assessments?.shower || '' },
          { iconName: 'Thermometer', title: 'AC/heating coverage', description: t.consultation?.assessments?.climate || '' },
          { iconName: 'Volume2', title: 'Noise levels and soundproofing', description: t.consultation?.assessments?.noise || '' },
          { iconName: 'Lightbulb', title: 'Lighting optimization', description: t.consultation?.assessments?.lighting || '' },
          { iconName: 'Baby', title: 'Baby amenities', description: t.consultation?.assessments?.baby || '' },
          { iconName: 'ChefHat', title: 'Kitchen inventory', description: t.consultation?.assessments?.kitchen || '' },
          { iconName: 'Wifi', title: 'Tech setup', description: t.consultation?.assessments?.tech || '' },
          { iconName: 'MapPin', title: 'Local touches', description: t.consultation?.assessments?.local || '' }
        ]
      },
      
      benefits: {
        title: t.marketOptimization?.title || '',
        description: `${t.marketOptimization?.description || ''} ${t.marketOptimization?.goal || ''}`.trim(),
        features: []
      },
      
      benefitsList: [
        { iconName: 'TrendingUp', title: 'Pricing strategies', description: t.marketOptimization?.services?.pricing || '' },
        { iconName: 'Target', title: 'Target guest types', description: t.marketOptimization?.services?.targeting || '' },
        { iconName: 'Star', title: 'Amenity selection', description: t.marketOptimization?.services?.amenities || '' },
        { iconName: 'Languages', title: 'Language and tone', description: t.marketOptimization?.services?.language || '' }
      ],
      
      howItWorks: {
        title: t.localEyes?.title || '',
        description: `${t.localEyes?.description || ''} ${t.localEyes?.conclusion || ''}`.trim(),
        features: [
          { iconName: 'Calendar', title: 'Monitor local events', description: t.localEyes?.services?.events || '' },
          { iconName: 'FileCheck', title: 'Track legal requirements', description: t.localEyes?.services?.legal || '' },
          { iconName: 'BarChart', title: 'Benchmark performance', description: t.localEyes?.services?.benchmark || '' },
          { iconName: 'Zap', title: 'Real-time decisions', description: t.localEyes?.services?.decisions || '' }
        ]
      },
      
      steps: [
        { iconName: 'Baby', title: t.babyGear?.title || '', description: `${t.babyGear?.description || ''} ${t.babyGear?.details || ''}`.trim(), number: '1' }
      ],
      
      faqs: [
        { icon: 'HelpCircle', question: t.faqs?.questions?.localVsOnline?.question || '', answer: t.faqs?.questions?.localVsOnline?.answer || '' },
        { icon: 'CheckCircle', question: t.faqs?.questions?.followRecommendations?.question || '', answer: t.faqs?.questions?.followRecommendations?.answer || '' },
        { icon: 'Clock', question: t.faqs?.questions?.visitSpeed?.question || '', answer: t.faqs?.questions?.visitSpeed?.answer || '' },
        { icon: 'DollarSign', question: t.faqs?.questions?.consultationCost?.question || '', answer: t.faqs?.questions?.consultationCost?.answer || '' }
      ],
      
      cta: {
        title: t.freeAssessment?.title || '',
        description: `${t.freeAssessment?.description || ''} ${t.freeAssessment?.note || ''}`.trim(),
        ctaText: t.freeAssessment?.cta || 'Schedule My Free Property Review',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importLocalExpertiseForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Local Expertise page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    try {
      await strapiRequest(`/local-expertise-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Local Expertise page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformLocalExpertiseData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Local Expertise page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/local-expertise-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      console.log('   - Response locale:', result.data.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Local Expertise page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Local Expertise Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importLocalExpertise() {
  console.log('🚀 Starting Local Expertise page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importLocalExpertiseForLocale(locale);
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

export { importLocalExpertise, importLocalExpertiseForLocale, transformLocalExpertiseData };

importLocalExpertise()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


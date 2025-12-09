/**
 * Import Legal Compliance page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:legal-compliance
 *   OR
 *   node scripts/import-legal-compliance-to-strapi.js
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

function getComplianceTranslationData(locale) {
  const complianceData = JSON.parse(fs.readFileSync(path.join(translationsPath, `compliance/${locale}.json`), 'utf8'));
  return complianceData;
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

function transformLegalComplianceData(locale = 'en') {
  const complianceData = getComplianceTranslationData(locale);
  const t = complianceData;

  return {
    data: {
      hero: {
        headline: t.hero?.title || '',
        subheadline: t.hero?.subtitle || '',
        ctaText: t.hero?.cta || 'Learn More About Our Compliance Services',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.sefAima?.title || '',
        description: `${t.sefAima?.subtitle || ''} ${t.sefAima?.description || ''}`.trim(),
        features: []
      },
      
      includes: {
        title: t.whyImportant?.legalCompliance?.title || '',
        description: '',
        features: [
          { iconName: 'Shield', title: 'Mandatory Requirement', description: t.whyImportant?.legalCompliance?.mandatory || '' },
          { iconName: 'Lock', title: 'National Security', description: t.whyImportant?.legalCompliance?.security || '' },
          { iconName: 'Eye', title: 'Transparency', description: t.whyImportant?.legalCompliance?.transparency || '' },
          { iconName: 'Award', title: 'Credibility', description: t.whyImportant?.professionalism?.credibility || '' },
          { iconName: 'Heart', title: 'Trust Building', description: t.whyImportant?.professionalism?.trust || '' }
        ]
      },
      
      benefits: {
        title: t.challenges?.title || '',
        description: '',
        features: []
      },
      
      benefitsList: [
        { iconName: 'AlertTriangle', title: t.challenges?.complexity?.title || '', description: `${t.challenges?.complexity?.understanding || ''} ${t.challenges?.complexity?.hesitation || ''}`.trim() },
        { iconName: 'CheckCircle', title: t.challenges?.solution?.title || '', description: `${t.challenges?.solution?.streamlined || ''} ${t.challenges?.solution?.communication || ''} ${t.challenges?.solution?.security || ''}`.trim() }
      ],
      
      howItWorks: {
        title: t.management?.title || '',
        description: '',
        features: [
          { iconName: 'CheckCircle', title: 'Inclusive Service', description: t.management?.inclusive || '' },
          { iconName: 'Users', title: 'Expert Team', description: t.management?.expert || '' },
          { iconName: 'Settings', title: 'Advanced Systems', description: t.management?.systems || '' },
          { iconName: 'Shield', title: 'Data Security', description: t.management?.security || '' }
        ]
      },
      
      steps: [
        { iconName: 'FileCheck', title: t.touristTax?.title || '', description: `${t.touristTax?.description || ''} ${t.touristTax?.support?.calculation || ''} ${t.touristTax?.support?.collection || ''} ${t.touristTax?.support?.remittance || ''}`.trim(), number: '1' },
        { iconName: 'Shield', title: t.refusal?.title || '', description: `${t.refusal?.description || ''} ${t.refusal?.support?.compliance || ''} ${t.refusal?.support?.education || ''} ${t.refusal?.support?.protection || ''}`.trim(), number: '2' },
        { iconName: 'AlertTriangle', title: t.penalties?.title || '', description: `${t.penalties?.financial?.individuals || ''} ${t.penalties?.financial?.corporations || ''} ${t.penalties?.legal?.criminal || ''}`.trim(), number: '3' }
      ],
      
      faqs: [
        { icon: 'HelpCircle', question: 'What is SEF/AIMA reporting?', answer: t.sefAima?.description || '' },
        { icon: 'DollarSign', question: 'What are the penalties for non-compliance?', answer: `${t.penalties?.financial?.individuals || ''} ${t.penalties?.legal?.criminal || ''}`.trim() },
        { icon: 'Shield', question: 'How does SmartHoster handle compliance?', answer: `${t.management?.inclusive || ''} ${t.management?.expert || ''}`.trim() }
      ],
      
      cta: {
        title: t.cta?.title || '',
        description: t.cta?.description || '',
        ctaText: t.cta?.button || 'Schedule a Free Compliance Consultation',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importLegalComplianceForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Legal Compliance page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    try {
      await strapiRequest(`/legal-compliance-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Legal Compliance page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformLegalComplianceData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Legal Compliance page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/legal-compliance-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      console.log('   - Response locale:', result.data.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Legal Compliance page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Legal Compliance Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importLegalCompliance() {
  console.log('🚀 Starting Legal Compliance page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importLegalComplianceForLocale(locale);
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

export { importLegalCompliance, importLegalComplianceForLocale, transformLegalComplianceData };

importLegalCompliance()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


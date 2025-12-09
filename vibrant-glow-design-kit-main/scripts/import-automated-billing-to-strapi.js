/**
 * Import Automated Billing page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:automated-billing
 *   OR
 *   node scripts/import-automated-billing-to-strapi.js
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

function getBillingTranslationData(locale) {
  const billingData = JSON.parse(fs.readFileSync(path.join(translationsPath, `billing/${locale}.json`), 'utf8'));
  return billingData;
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

function transformAutomatedBillingData(locale = 'en') {
  const billingData = getBillingTranslationData(locale);
  const t = billingData;

  return {
    data: {
      hero: {
        headline: t.hero?.title || '',
        subheadline: t.hero?.subtitle || '',
        ctaText: t.hero?.cta || 'Schedule Your Introduction',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.certifiedBilling?.title || '',
        description: `${t.certifiedBilling?.description || ''} ${t.certifiedBilling?.tagline || ''}`.trim(),
        features: [
          { iconName: 'FileCheck', title: 'Certified by Portuguese Tax Authority', description: t.certifiedBilling?.features?.[0] || '' },
          { iconName: 'FileText', title: 'Automatic invoice generation', description: t.certifiedBilling?.features?.[1] || '' },
          { iconName: 'Users', title: 'Split billing per co-owner', description: t.certifiedBilling?.features?.[2] || '' },
          { iconName: 'Database', title: 'Multi-account support', description: t.certifiedBilling?.features?.[3] || '' },
          { iconName: 'Download', title: 'SAF-T submission prep', description: t.certifiedBilling?.features?.[4] || '' },
          { iconName: 'CheckCircle', title: 'Error-free processing', description: t.certifiedBilling?.features?.[5] || '' },
          { iconName: 'XCircle', title: 'No invoicing software needed', description: t.certifiedBilling?.features?.[6] || '' }
        ]
      },
      
      includes: {
        title: t.aimaReporting?.title || '',
        description: `${t.aimaReporting?.description || ''} ${t.aimaReporting?.tagline || ''}`.trim(),
        features: [
          { iconName: 'Infinity', title: 'Unlimited guest bulletin submissions', description: t.aimaReporting?.features?.[0] || '' },
          { iconName: 'Settings', title: 'Manual or fully automated mode', description: t.aimaReporting?.features?.[1] || '' },
          { iconName: 'Calendar', title: 'Custom schedule for transmission', description: t.aimaReporting?.features?.[2] || '' },
          { iconName: 'Eye', title: 'Full transparency', description: t.aimaReporting?.features?.[3] || '' },
          { iconName: 'Shield', title: 'Reduces legal risk', description: t.aimaReporting?.features?.[4] || '' }
        ]
      },
      
      benefits: {
        title: t.modelo30?.title || '',
        description: `${t.modelo30?.description || ''} ${t.modelo30?.tagline || ''}`.trim(),
        features: []
      },
      
      benefitsList: [
        { iconName: 'Calculator', title: 'Auto-calculation of commissions', description: t.modelo30?.features?.[0] || '' },
        { iconName: 'FileText', title: 'Fully compatible XML export', description: t.modelo30?.features?.[1] || '' },
        { iconName: 'CheckSquare', title: 'Full completion of Quadro 8', description: t.modelo30?.features?.[2] || '' },
        { iconName: 'DollarSign', title: 'Income classified as Type 8', description: t.modelo30?.features?.[3] || '' },
        { iconName: 'Database', title: 'Full reporting history', description: t.modelo30?.features?.[4] || '' }
      ],
      
      howItWorks: {
        title: t.dailyOps?.title || '',
        description: `${t.dailyOps?.description || ''} ${t.dailyOps?.tagline || ''}`.trim(),
        features: [
          { iconName: 'LayoutDashboard', title: 'Clean dashboard', description: t.dailyOps?.features?.[0] || '' },
          { iconName: 'Activity', title: 'Real-time indicators', description: t.dailyOps?.features?.[1] || '' },
          { iconName: 'Link', title: 'Synced to invoicing', description: t.dailyOps?.features?.[2] || '' },
          { iconName: 'CreditCard', title: 'Linked to transactions', description: t.dailyOps?.features?.[3] || '' }
        ]
      },
      
      steps: [
        { iconName: 'FileCheck', title: t.touristTax?.title || '', description: `${t.touristTax?.description || ''} ${t.touristTax?.tagline || ''}`.trim(), number: '1' },
        { iconName: 'Database', title: t.ineReporting?.title || '', description: `${t.ineReporting?.description || ''} ${t.ineReporting?.tagline || ''}`.trim(), number: '2' },
        { iconName: 'Banknote', title: t.copeReporting?.title || '', description: `${t.copeReporting?.description || ''} ${t.copeReporting?.tagline || ''}`.trim(), number: '3' },
        { iconName: 'CreditCard', title: t.airbnbInvoicing?.title || '', description: `${t.airbnbInvoicing?.description || ''} ${t.airbnbInvoicing?.tagline || ''}`.trim(), number: '4' }
      ],
      
      faqs: [
        { icon: 'HelpCircle', question: 'What is certified billing?', answer: t.certifiedBilling?.description || '' },
        { icon: 'FileCheck', question: 'How does AIMA reporting work?', answer: t.aimaReporting?.description || '' },
        { icon: 'Calculator', question: 'What is Modelo 30?', answer: t.modelo30?.description || '' },
        { icon: 'DollarSign', question: 'What property types are supported?', answer: t.propertyTypes?.description || '' }
      ],
      
      cta: {
        title: t.cta?.title || '',
        description: t.cta?.description || '',
        ctaText: t.cta?.button || 'Book Your Consultation',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importAutomatedBillingForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Automated Billing page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    try {
      await strapiRequest(`/automated-billing-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Automated Billing page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformAutomatedBillingData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Automated Billing page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/automated-billing-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      console.log('   - Response locale:', result.data.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Automated Billing page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Automated Billing Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importAutomatedBilling() {
  console.log('🚀 Starting Automated Billing page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importAutomatedBillingForLocale(locale);
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

export { importAutomatedBilling, importAutomatedBillingForLocale, transformAutomatedBillingData };

importAutomatedBilling()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


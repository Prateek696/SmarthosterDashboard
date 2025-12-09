/**
 * Import Income Strategy page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:income-strategy
 *   OR
 *   node scripts/import-income-strategy-to-strapi.js
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

function getIncomeTranslationData(locale) {
  const incomeData = JSON.parse(fs.readFileSync(path.join(translationsPath, `income/${locale}.json`), 'utf8'));
  return incomeData;
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

function transformIncomeStrategyData(locale = 'en') {
  const incomeData = getIncomeTranslationData(locale);
  const t = incomeData;

  return {
    data: {
      hero: {
        headline: t.hero?.headline || '',
        subheadline: t.hero?.subheadline || '',
        ctaText: t.hero?.cta || 'Request Your Free Income Strategy Review',
        ctaLink: '/contact',
        heroIcons: null
      },
      
      whatWeDo: {
        title: t.dynamicPricing?.title || '',
        description: `${t.dynamicPricing?.description || ''} ${t.dynamicPricing?.strategy || ''}`.trim(),
        features: [
          { iconName: 'Calendar', title: 'Seasonality and tourism flows', description: t.dynamicPricing?.features?.[0] || '' },
          { iconName: 'Calendar', title: 'Local events and holidays', description: t.dynamicPricing?.features?.[1] || '' },
          { iconName: 'TrendingUp', title: 'Booking windows and trends', description: t.dynamicPricing?.features?.[2] || '' },
          { iconName: 'MapPin', title: 'Competitor analysis', description: t.dynamicPricing?.features?.[3] || '' }
        ]
      },
      
      includes: {
        title: t.directBookings?.title || '',
        description: `${t.directBookings?.description || ''} ${t.directBookings?.conclusion || ''}`.trim(),
        features: [
          { iconName: 'Link', title: 'Custom booking page', description: t.directBookings?.features?.[0] || '' },
          { iconName: 'CreditCard', title: 'Secure payment integration', description: t.directBookings?.features?.[1] || '' },
          { iconName: 'MapPin', title: 'Google My Business listing', description: t.directBookings?.features?.[2] || '' },
          { iconName: 'Sparkles', title: 'AI Answer Engine Optimization', description: t.directBookings?.features?.[3] || '' },
          { iconName: 'Repeat', title: 'Repeat guest automation', description: t.directBookings?.features?.[4] || '' },
          { iconName: 'Mail', title: 'Email marketing', description: t.directBookings?.features?.[5] || '' }
        ]
      },
      
      benefits: {
        title: t.reviews?.title || '',
        description: `${t.reviews?.description || ''} ${t.reviews?.conclusion || ''}`.trim(),
        features: []
      },
      
      benefitsList: [
        { iconName: 'CheckCircle', title: 'Seamless check-in experience', description: t.reviews?.features?.[0] || '' },
        { iconName: 'Gift', title: 'Welcome kits and local treats', description: t.reviews?.features?.[1] || '' },
        { iconName: 'FileText', title: 'Clear expectations', description: t.reviews?.features?.[2] || '' },
        { iconName: 'Headphones', title: 'Instant guest support', description: t.reviews?.features?.[3] || '' },
        { iconName: 'Home', title: 'Spotless units', description: t.reviews?.features?.[4] || '' }
      ],
      
      howItWorks: {
        title: t.visibility?.title || '',
        description: `${t.visibility?.description || ''} ${t.visibility?.conclusion || ''}`.trim(),
        features: [
          { iconName: 'Sparkles', title: 'AEO Optimization', description: t.visibility?.features?.[0] || '' },
          { iconName: 'FileText', title: 'SEO copywriting', description: t.visibility?.features?.[1] || '' },
          { iconName: 'MapPin', title: 'Google My Business setup', description: t.visibility?.features?.[2] || '' },
          { iconName: 'Database', title: 'Structured data markup', description: t.visibility?.features?.[3] || '' },
          { iconName: 'Star', title: 'Automated review requests', description: t.visibility?.features?.[4] || '' }
        ]
      },
      
      steps: [
        { iconName: 'Mail', title: t.repeatGuests?.title || '', description: `${t.repeatGuests?.description || ''} ${t.repeatGuests?.conclusion || ''}`.trim(), number: '1' },
        { iconName: 'TrendingUp', title: t.localStrategy?.title || '', description: `${t.localStrategy?.description || ''} ${t.localStrategy?.conclusion || ''}`.trim(), number: '2' },
        { iconName: 'CheckCircle', title: t.fullService?.title || '', description: `${t.fullService?.description || ''} ${t.fullService?.conclusion || ''}`.trim(), number: '3' }
      ],
      
      faqs: [
        { icon: 'Globe', question: t.faqs?.questions?.platforms?.question || '', answer: t.faqs?.questions?.platforms?.answer || '' },
        { icon: 'Link', question: t.faqs?.questions?.directBookings?.question || '', answer: t.faqs?.questions?.directBookings?.answer || '' },
        { icon: 'Sparkles', question: t.faqs?.questions?.aeo?.question || '', answer: t.faqs?.questions?.aeo?.answer || '' },
        { icon: 'Star', question: t.faqs?.questions?.reviews?.question || '', answer: t.faqs?.questions?.reviews?.answer || '' }
      ],
      
      cta: {
        title: t.finalCta?.headline || '',
        description: t.finalCta?.description || '',
        ctaText: t.finalCta?.cta || 'Start My Free Income Strategy Review',
        ctaLink: '/contact',
        backgroundColor: ''
      }
    }
  };
}

async function importIncomeStrategyForLocale(locale = 'en') {
  try {
    console.log(`🚀 Starting Income Strategy page import for locale: ${locale}...\n`);
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    try {
      await strapiRequest(`/income-strategy-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing data for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Income Strategy page not found in Strapi for locale: ${locale}.\n`);
      }
    }

    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const data = transformIncomeStrategyData(locale);
    console.log('✅ Data transformed\n');
    
    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - hero.headline:', data.data.hero.headline || 'EMPTY');
    console.log('   - ⚠️ VERIFY: hero.headline should match locale!');
    
    console.log(`\n💾 Importing Income Strategy page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/income-strategy-page?locale=${locale}`, 'PUT', data);
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      console.log('   - Response locale:', result.data.locale || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
    }
    console.log(`✅ Income Strategy page imported successfully for locale: ${locale}!\n`);

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
    console.log(`   2. Navigate to Content Manager > Income Strategy Page (locale: ${locale})`);
    console.log(`   3. Review and PUBLISH the page\n`);

    return result;
  } catch (error) {
    console.error(`\n❌ Import failed for locale ${locale}:`, error.message);
    throw error;
  }
}

async function importIncomeStrategy() {
  console.log('🚀 Starting Income Strategy page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importIncomeStrategyForLocale(locale);
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

export { importIncomeStrategy, importIncomeStrategyForLocale, transformIncomeStrategyData };

importIncomeStrategy()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


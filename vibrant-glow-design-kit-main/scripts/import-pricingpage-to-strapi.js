/**
 * Import Pricing Page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:pricingpage
 *   OR
 *   node scripts/import-pricingpage-to-strapi.js
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

// Read translation files - Pricing page has its own translation file
const translationsPath = path.join(__dirname, '../src/data/translations');

// Helper to read pricing page translation data for a specific locale
function getPricingTranslationData(locale) {
  const pricingData = JSON.parse(fs.readFileSync(path.join(translationsPath, `pricing/${locale}.json`), 'utf8'));
  return pricingData;
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
function transformPricingPageData(locale = 'en') {
  const pricingData = getPricingTranslationData(locale);
  const t = pricingData;

  // Helper to get nested value safely
  const get = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((o, key) => o?.[key], obj) || defaultValue;
  };

  return {
    data: {
      // Hero section - simple fields (matching Strapi schema)
      heroTitle: t.title || 'Our Services, Clearly Defined',
      heroSubtitle: t.subtitle || 'We believe in transparency, accountability, and doing the work.',

      // Plans - using component structure (matching Strapi schema)
      basicPlan: {
        name: t.plans?.basic?.name || 'BASIC',
        fee: t.plans?.basic?.fee || '10% Management Fee',
        description: t.plans?.basic?.description || '',
        features: (t.features?.basic || []).map(text => ({ text })),
        buttonText: t.plans?.basic?.buttonText || "Let's Start Simple",
        color: '', // Optional
        popularBadge: '' // Optional
      },
      premiumPlan: {
        name: t.plans?.premium?.name || 'PREMIUM',
        fee: t.plans?.premium?.fee || '25% Management Fee',
        description: t.plans?.premium?.description || '',
        features: (t.features?.premium || []).map(text => ({ text })),
        buttonText: t.plans?.premium?.buttonText || 'I Want Full Management',
        color: '', // Optional
        popularBadge: t.plans?.premium?.popular || 'MOST POPULAR'
      },
      superPremiumPlan: {
        name: t.plans?.superPremium?.name || 'SUPER PREMIUM ADD-ON',
        fee: t.plans?.superPremium?.fee || '+5% Add-On (30% Total)',
        description: t.plans?.superPremium?.description || '',
        features: (t.features?.superPremium || []).map(text => ({ text })),
        buttonText: t.plans?.superPremium?.buttonText || 'I Want the VIP Experience',
        color: '', // Optional
        popularBadge: '' // Optional
      },

      // Packages - using component structure (matching Strapi schema)
      setupPackage: {
        title: t.sections?.setup?.title || 'From Empty Apartment to Guest-Ready Rental',
        subtitle: t.sections?.setup?.subtitle || '',
        features: (t.sections?.setup?.features || []).map(text => ({ text })),
        buttonText: t.sections?.setup?.button || 'Schedule Setup Call',
        setupFee: '', // Optional
        note: '' // Optional
      },
      upgradePackage: {
        title: t.sections?.upgrade?.title || 'From Existing Apartment to 5-Star-Ready Rental',
        subtitle: t.sections?.upgrade?.subtitle || '',
        note: t.sections?.upgrade?.note || '',
        features: (t.sections?.upgrade?.features || []).map(text => ({ text })),
        buttonText: t.sections?.upgrade?.button || 'Schedule Upgrade Call',
        setupFee: '' // Optional
      },
      compliancePackage: {
        title: t.sections?.compliance?.title || 'From Fully Furnished Apartment to Fully Licensed Short-Term Rental',
        subtitle: t.sections?.compliance?.subtitle || '',
        note: t.sections?.compliance?.note || '',
        setupFee: t.sections?.compliance?.setupFee || 'Setup fee: €300 + VAT',
        features: (t.sections?.compliance?.features || []).map(text => ({ text })),
        buttonText: t.sections?.compliance?.button || 'Book Compliance Setup'
      },

      // Trust section (matching Strapi schema)
      trustTitle: t.trust?.title || 'Why owners choose SmartHoster',
      trustPoints: (t.trust?.points || []).map(text => ({ text })),

      // Footer section - simple fields (matching Strapi schema)
      footerTitle: t.footer?.title || "Not sure where to start? Contact us and we'll walk you through it.",
      footerButtonText: t.footer?.button || 'Talk to a Real Person'
    }
  };
}

// Import pricing page for a specific locale
async function importPricingPageForLocale(locale = 'en') {
  console.log(`🚀 Starting Pricing Page import to Strapi for locale: ${locale}...\n`);

  try {
    // Check if Strapi is accessible
    console.log('📡 Checking Strapi connection...');
    let existingData = null;
    try {
      existingData = await strapiRequest(`/pricing-page?populate=*&locale=${locale}`);
      console.log(`✅ Strapi is accessible - found existing Pricing Page for locale: ${locale}\n`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  Pricing Page content type not found in Strapi for locale: ${locale}.`);
        console.log('   Creating initial entry...');
        existingData = { data: null };
      } else {
        throw error;
      }
    }

    // Transform new data
    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const newData = transformPricingPageData(locale);
    console.log('✅ Data transformed\n');

    // Merge: Use new data (don't include documentId in PUT request)
    const mergedData = { ...newData };

    console.log('📤 Sample data being sent:');
    console.log('   - Locale:', locale);
    console.log('   - heroTitle:', mergedData.data.heroTitle || 'EMPTY');
    console.log('   - heroSubtitle:', mergedData.data.heroSubtitle?.substring(0, 50) || 'EMPTY');
    console.log('   - ⚠️ VERIFY: heroTitle should match locale!');
    console.log('   - basicPlan.name:', mergedData.data.basicPlan?.name || 'EMPTY');
    console.log('   - basicPlan.features length:', mergedData.data.basicPlan?.features?.length || 0);
    console.log('   - premiumPlan.name:', mergedData.data.premiumPlan?.name || 'EMPTY');
    console.log('   - premiumPlan.features length:', mergedData.data.premiumPlan?.features?.length || 0);
    console.log('   - superPremiumPlan.name:', mergedData.data.superPremiumPlan?.name || 'EMPTY');
    console.log('   - superPremiumPlan.features length:', mergedData.data.superPremiumPlan?.features?.length || 0);
    console.log('   - setupPackage.title:', mergedData.data.setupPackage?.title || 'EMPTY');
    console.log('   - setupPackage.features length:', mergedData.data.setupPackage?.features?.length || 0);
    console.log('   - upgradePackage.title:', mergedData.data.upgradePackage?.title || 'EMPTY');
    console.log('   - upgradePackage.features length:', mergedData.data.upgradePackage?.features?.length || 0);
    console.log('   - compliancePackage.title:', mergedData.data.compliancePackage?.title || 'EMPTY');
    console.log('   - compliancePackage.features length:', mergedData.data.compliancePackage?.features?.length || 0);
    console.log('   - trustTitle:', mergedData.data.trustTitle || 'EMPTY');
    console.log('   - trustPoints length:', mergedData.data.trustPoints?.length || 0);
    console.log('   - footerTitle:', mergedData.data.footerTitle || 'EMPTY');
    
    // Update pricing page using PUT with locale parameter
    // Try with the data structure - if it fails, provide helpful error message
    console.log(`\n💾 Importing Pricing Page data to Strapi for locale: ${locale}...`);
    
    let result;
    try {
      result = await strapiRequest(`/pricing-page?locale=${locale}`, 'PUT', mergedData);
    } catch (error) {
      if (error.message.includes('Invalid key') || error.message.includes('400')) {
        console.log('\n❌ Schema Error: The pricing-page content type exists but has a different schema.');
        console.log('\n📝 Quick Fix - Create/Update Schema in Strapi Admin:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Single Types → Pricing Page');
        console.log('   3. If it doesn\'t exist, create it as "pricing-page"');
        console.log('   4. The schema should have these fields:');
        console.log('      ✓ heroTitle (string)');
        console.log('      ✓ heroSubtitle (text)');
        console.log('      ✓ basicPlan, premiumPlan, superPremiumPlan (component: shared.pricing-plan)');
        console.log('      ✓ setupPackage, upgradePackage, compliancePackage (component: shared.pricing-package)');
        console.log('      ✓ trustTitle (string)');
        console.log('      ✓ trustPoints (component: shared.trust-point, repeatable)');
        console.log('      ✓ footerTitle, footerButtonText (string)');
        console.log('   5. Save and Publish');
        console.log('   6. Run this script again: npm run import:pricingpage\n');
        throw error;
      } else if (error.message.includes('404')) {
        console.log('\n❌ Content Type Not Found');
        console.log('\n📝 Create the pricing-page content type first:');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Create new Single Type');
        console.log('   3. Name it: pricing-page');
        console.log('   4. Add fields matching the schema structure (see pricing-page schema.json)');
        console.log('   5. Save and Publish');
        console.log('   6. Run: npm run import:pricingpage\n');
        throw error;
      } else {
        throw error;
      }
    }
    
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      const resData = result.data;
      console.log('   - Response locale:', resData.locale || 'NOT FOUND');
      console.log('   - Response heroTitle:', resData.heroTitle || 'NOT FOUND');
      console.log('   - ⚠️ VERIFY: Response locale should match requested locale!');
      console.log('   - basicPlan.features in response:', resData.basicPlan?.features?.length || 0,
        '(should be', mergedData.data.basicPlan?.features?.length || 0, ')');
      console.log('   - premiumPlan.features in response:', resData.premiumPlan?.features?.length || 0,
        '(should be', mergedData.data.premiumPlan?.features?.length || 0, ')');
      console.log('   - superPremiumPlan.features in response:', resData.superPremiumPlan?.features?.length || 0,
        '(should be', mergedData.data.superPremiumPlan?.features?.length || 0, ')');
      console.log('   - setupPackage.features in response:', resData.setupPackage?.features?.length || 0,
        '(should be', mergedData.data.setupPackage?.features?.length || 0, ')');
      console.log('   - upgradePackage.features in response:', resData.upgradePackage?.features?.length || 0,
        '(should be', mergedData.data.upgradePackage?.features?.length || 0, ')');
      console.log('   - compliancePackage.features in response:', resData.compliancePackage?.features?.length || 0,
        '(should be', mergedData.data.compliancePackage?.features?.length || 0, ')');
      console.log('   - trustPoints in response:', resData.trustPoints?.length || 0,
        '(should be', mergedData.data.trustPoints?.length || 0, ')');
      
      // Check if arrays were saved
      const allArraysSaved = 
        (resData.basicPlan?.features?.length > 0 || mergedData.data.basicPlan?.features?.length === 0) &&
        (resData.premiumPlan?.features?.length > 0 || mergedData.data.premiumPlan?.features?.length === 0) &&
        (resData.superPremiumPlan?.features?.length > 0 || mergedData.data.superPremiumPlan?.features?.length === 0) &&
        (resData.setupPackage?.features?.length > 0 || mergedData.data.setupPackage?.features?.length === 0) &&
        (resData.upgradePackage?.features?.length > 0 || mergedData.data.upgradePackage?.features?.length === 0) &&
        (resData.compliancePackage?.features?.length > 0 || mergedData.data.compliancePackage?.features?.length === 0) &&
        (resData.trustPoints?.length > 0 || mergedData.data.trustPoints?.length === 0);
      
      if (!allArraysSaved) {
        console.log('\n⚠️  WARNING: Some arrays were not saved! This might be a Strapi v5 API format issue.');
        console.log('   Try manually adding at least one item in each array in Strapi Admin UI, then check if they appear.');
      }
    }
    
    console.log(`\n✅ Pricing Page imported successfully for locale: ${locale}!`);
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Strapi admin: http://localhost:1337/admin');
    console.log(`   2. Navigate to Content Manager → Single Types → Pricing Page (locale: ${locale})`);
    console.log('   3. Check if arrays (plans features, sections features, trust points) are populated');
    console.log('   4. If arrays are empty, add at least one item manually in Strapi UI');
    console.log('   5. Click Publish (top right)');
    console.log('   6. Upload images manually (if any)');
    console.log('   7. Refresh your website to see the changes\n');

    return result;
  } catch (error) {
    console.error('❌ Error importing Pricing Page:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Tip: You need to authenticate with Strapi.');
      console.log('   Option 1: Generate an API token in Strapi Admin → Settings → API Tokens');
      console.log('   Option 2: Set STRAPI_API_TOKEN in your .env file');
      console.log('   Option 3: Make sure "pricing-page" has public "find" and "update" permissions\n');
    }
    
    throw error;
  }
}

// Main import function - imports for all locales
async function importPricingPage() {
  console.log('🚀 Starting Pricing Page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    console.log('============================================================');
    console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
    console.log('============================================================\n');

    try {
      results[locale] = await importPricingPageForLocale(locale);
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
export { importPricingPage, importPricingPageForLocale, transformPricingPageData };

// Run import if called directly
importPricingPage()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });

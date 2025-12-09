/**
 * Setup Pricing Page Content Type Schema in Strapi
 * 
 * This script attempts to create the pricing-page content type structure
 * Note: Strapi v5 may require manual setup in Admin UI for complex schemas
 * 
 * Usage:
 *   node scripts/setup-pricing-page-schema.js
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

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

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

// Try to create pricing page with JSON fields (simpler approach)
async function setupPricingPageSchema() {
  console.log('🚀 Setting up Pricing Page schema in Strapi...\n');

  try {
    // First, try to get existing pricing page
    console.log('📡 Checking if pricing-page exists...');
    let existingData = null;
    try {
      existingData = await strapiRequest('/pricing-page?populate=*');
      console.log('✅ Pricing page exists\n');
    } catch (error) {
      if (error.message.includes('404')) {
        console.log('⚠️  Pricing page content type not found.\n');
        console.log('📝 Manual Setup Required:');
        console.log('   1. Go to Strapi Admin: http://localhost:1337/admin');
        console.log('   2. Navigate to Content-Type Builder');
        console.log('   3. Create a new Single Type called "pricing-page"');
        console.log('   4. Add these JSON fields:');
        console.log('      - hero (JSON)');
        console.log('      - plans (JSON)');
        console.log('      - sections (JSON)');
        console.log('      - trust (JSON)');
        console.log('      - footer (JSON)');
        console.log('   5. Save and publish\n');
        console.log('   Then run: npm run import:pricingpage\n');
        return;
      } else {
        throw error;
      }
    }

    // If it exists, try to update with initial data structure
    console.log('📦 Attempting to create initial entry with proper structure...');
    
    const initialData = {
      data: {
        hero: {
          title: 'Our Services, Clearly Defined',
          subtitle: 'We believe in transparency, accountability, and doing the work.'
        },
        plans: {
          basic: {
            name: 'BASIC',
            fee: '10% Management Fee',
            description: '',
            features: [],
            buttonText: "Let's Start Simple"
          },
          premium: {
            name: 'PREMIUM',
            fee: '25% Management Fee',
            description: '',
            features: [],
            buttonText: 'I Want Full Management',
            popular: 'MOST POPULAR'
          },
          superPremium: {
            name: 'SUPER PREMIUM ADD-ON',
            fee: '+5% Add-On (30% Total)',
            description: '',
            features: [],
            buttonText: 'I Want the VIP Experience'
          }
        },
        sections: {
          setup: {
            title: 'From Empty Apartment to Guest-Ready Rental',
            subtitle: '',
            features: [],
            button: 'Schedule Setup Call'
          },
          upgrade: {
            title: 'From Existing Apartment to 5-Star-Ready Rental',
            subtitle: '',
            note: '',
            features: [],
            button: 'Schedule Upgrade Call'
          },
          compliance: {
            title: 'From Fully Furnished Apartment to Fully Licensed Short-Term Rental',
            subtitle: '',
            note: '',
            setupFee: 'Setup fee: €300 + VAT',
            features: [],
            button: 'Book Compliance Setup'
          }
        },
        trust: {
          title: 'Why owners choose SmartHoster',
          points: []
        },
        footer: {
          title: "Not sure where to start? Contact us and we'll walk you through it.",
          button: 'Talk to a Real Person'
        }
      }
    };

    try {
      const result = await strapiRequest('/pricing-page', 'PUT', initialData);
      console.log('✅ Initial structure created successfully!\n');
      console.log('📝 Next step: Run the import script to populate with full data:');
      console.log('   npm run import:pricingpage\n');
      return result;
    } catch (error) {
      if (error.message.includes('Invalid key')) {
        console.log('❌ Schema mismatch detected.\n');
        console.log('📝 The pricing-page content type exists but has a different schema.');
        console.log('   You need to manually update the schema in Strapi Admin:\n');
        console.log('   1. Go to: http://localhost:1337/admin');
        console.log('   2. Content-Type Builder → Single Types → Pricing Page');
        console.log('   3. Make sure these fields exist (as JSON type):');
        console.log('      - hero');
        console.log('      - plans');
        console.log('      - sections');
        console.log('      - trust');
        console.log('      - footer');
        console.log('   4. Save and publish');
        console.log('   5. Then run: npm run import:pricingpage\n');
        console.log('💡 Alternative: Delete the pricing-page content type and recreate it');
        console.log('   with JSON fields, or use the component structure from the guide.\n');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error setting up schema:', error.message);
    console.log('\n📝 Manual Setup Required:');
    console.log('   See scripts/STRAPI_PRICING_PAGE_SETUP.md for detailed instructions\n');
    throw error;
  }
}

// Run setup
setupPricingPageSchema()
  .then(() => {
    console.log('✨ Setup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });






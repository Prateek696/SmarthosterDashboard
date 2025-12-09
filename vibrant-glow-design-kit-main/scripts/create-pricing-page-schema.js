/**
 * Attempt to create Pricing Page schema programmatically
 * Note: Strapi v5 typically requires manual creation, but this script tries alternative methods
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}${endpoint}`;
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
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status}): ${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    throw error;
  }
}

async function createPricingPageSchema() {
  console.log('🚀 Attempting to create Pricing Page schema...\n');

  // Method 1: Try to create via Content-Type Builder API (if available)
  console.log('📡 Method 1: Trying Content-Type Builder API...');
  try {
    const contentTypeData = {
      contentType: {
        kind: 'singleType',
        collectionName: 'pricing_pages',
        info: {
          singularName: 'pricing-page',
          pluralName: 'pricing-pages',
          displayName: 'Pricing Page',
          description: 'Pricing page content'
        },
        options: {},
        attributes: {
          hero: {
            type: 'json'
          },
          plans: {
            type: 'json'
          },
          sections: {
            type: 'json'
          },
          trust: {
            type: 'json'
          },
          footer: {
            type: 'json'
          }
        }
      }
    };

    const result = await strapiRequest('/content-type-builder/content-types', 'POST', contentTypeData);
    console.log('✅ Content type created via API!\n');
    return result;
  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
    console.log('   (This is expected - Strapi typically requires manual setup)\n');
  }

  // Method 2: Try admin API
  console.log('📡 Method 2: Trying Admin API...');
  try {
    const result = await strapiRequest('/admin/content-type-builder/content-types', 'POST', {
      contentType: {
        kind: 'singleType',
        collectionName: 'pricing_pages',
        info: {
          singularName: 'pricing-page',
          pluralName: 'pricing-pages',
          displayName: 'Pricing Page'
        },
        attributes: {
          hero: { type: 'json' },
          plans: { type: 'json' },
          sections: { type: 'json' },
          trust: { type: 'json' },
          footer: { type: 'json' }
        }
      }
    });
    console.log('✅ Content type created via Admin API!\n');
    return result;
  } catch (error) {
    console.log('❌ Method 2 failed:', error.message);
    console.log('   (This is expected - Admin API may require different authentication)\n');
  }

  // Method 3: Provide manual instructions
  console.log('📝 Manual Setup Required:\n');
  console.log('   Strapi doesn\'t allow creating content types via REST API.');
  console.log('   You need to create it manually in the Admin UI:\n');
  console.log('   1. Open: http://localhost:1337/admin');
  console.log('   2. Go to: Content-Type Builder');
  console.log('   3. Click: "Create new single type"');
  console.log('   4. Name: pricing-page');
  console.log('   5. Add these fields (all as JSON type):');
  console.log('      • hero (JSON)');
  console.log('      • plans (JSON)');
  console.log('      • sections (JSON)');
  console.log('      • trust (JSON)');
  console.log('      • footer (JSON)');
  console.log('   6. Click: Save');
  console.log('   7. Go to: Content Manager → Single Types → Pricing Page');
  console.log('   8. Click: Publish (even if empty)');
  console.log('   9. Set permissions: Settings → Roles → Public → Enable find & update');
  console.log('  10. Run: npm run import:pricingpage\n');
  
  // Create a JSON schema file for reference
  const schemaFile = path.join(__dirname, 'pricing-page-schema.json');
  const schema = {
    kind: 'singleType',
    collectionName: 'pricing_pages',
    info: {
      singularName: 'pricing-page',
      pluralName: 'pricing-pages',
      displayName: 'Pricing Page'
    },
    attributes: {
      hero: { type: 'json' },
      plans: { type: 'json' },
      sections: { type: 'json' },
      trust: { type: 'json' },
      footer: { type: 'json' }
    }
  };
  
  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));
  console.log(`✅ Schema reference saved to: ${schemaFile}`);
  console.log('   You can use this as a reference when creating in Strapi Admin.\n');
}

createPricingPageSchema()
  .then(() => {
    console.log('✨ Setup attempt completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });






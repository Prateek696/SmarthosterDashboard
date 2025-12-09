/**
 * Check what schema the pricing-page actually has in Strapi
 * This will help us understand the mismatch
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

async function checkPricingPageSchema() {
  console.log('🔍 Checking Pricing Page schema in Strapi...\n');

  try {
    // Try to GET the pricing page to see what structure it has
    const url = `${STRAPI_URL}/api/pricing-page?populate=*`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (API_TOKEN) {
      options.headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(url, options);
    
    if (response.status === 404) {
      console.log('❌ Pricing Page content type does not exist in Strapi.');
      console.log('   You need to create it first in Strapi Admin.\n');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error fetching pricing page:', response.status);
      console.log('   Response:', errorText.substring(0, 500));
      return;
    }

    const data = await response.json();
    
    console.log('✅ Pricing Page exists in Strapi!\n');
    console.log('📋 Current Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data) {
      console.log('\n📊 Field Names Found:');
      const fields = Object.keys(data.data);
      fields.forEach(field => {
        console.log(`   - ${field} (type: ${typeof data.data[field]})`);
      });
      
      console.log('\n💡 Expected Fields (from schema):');
      console.log('   - hero (JSON)');
      console.log('   - plans (JSON)');
      console.log('   - sections (JSON)');
      console.log('   - trust (JSON)');
      console.log('   - footer (JSON)');
      
      const expectedFields = ['hero', 'plans', 'sections', 'trust', 'footer'];
      const missingFields = expectedFields.filter(f => !fields.includes(f));
      
      if (missingFields.length > 0) {
        console.log('\n⚠️  Missing Fields:');
        missingFields.forEach(field => {
          console.log(`   - ${field}`);
        });
        console.log('\n📝 Action Required:');
        console.log('   Add these fields in Strapi Admin → Content-Type Builder → Pricing Page');
      } else {
        console.log('\n✅ All expected fields are present!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPricingPageSchema()
  .then(() => {
    console.log('\n✨ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });





/**
 * Test what getBlogBySlug actually returns
 */

import { strapiApi } from '../src/services/strapi.api.ts';

const slug = 'how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025';
const locale = 'en';

async function test() {
  try {
    console.log('🔍 Testing getBlogBySlug...');
    console.log('Slug:', slug);
    console.log('Locale:', locale);
    console.log('');
    
    const post = await strapiApi.getBlogBySlug(slug, locale);
    
    if (!post) {
      console.log('❌ Post is null');
      return;
    }
    
    console.log('✅ Post found!');
    console.log('');
    console.log('📋 Post keys:', Object.keys(post));
    console.log('');
    
    const postData = post.attributes || post;
    console.log('📋 Post data keys:', Object.keys(postData));
    console.log('');
    console.log('📋 Has SEO:', !!postData.seo);
    console.log('📋 SEO type:', typeof postData.seo);
    console.log('📋 SEO is array:', Array.isArray(postData.seo));
    
    if (postData.seo && Array.isArray(postData.seo) && postData.seo.length > 0) {
      console.log('📋 SEO length:', postData.seo.length);
      console.log('');
      console.log('📋 First SEO entry:');
      console.log(JSON.stringify(postData.seo[0], null, 2));
    } else {
      console.log('');
      console.log('⚠️  SEO data structure:');
      console.log(JSON.stringify(postData.seo, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();



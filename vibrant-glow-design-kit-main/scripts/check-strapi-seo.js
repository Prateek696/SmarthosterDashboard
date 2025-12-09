/**
 * Quick script to check SEO data structure from Strapi
 * Run: node scripts/check-strapi-seo.js
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const slug = 'how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025';
const locale = 'en';

async function checkSEO() {
  try {
    // Try different populate strategies
    const populateStrategies = [
      'populate=*',
      'populate[seo]=*',
      'populate[seo][populate]=*',
      'populate[seo][populate][openGraph]=*',
      'populate=deep',
    ];
    
    for (const populate of populateStrategies) {
      const url = `${STRAPI_URL}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&locale=${locale}&${populate}&publicationState=live`;
      
      console.log(`\n🔍 Trying populate: ${populate}`);
      console.log('URL:', url.substring(0, 100) + '...');
      
      const response = await fetch(url);
    
      if (!response.ok) {
        console.error('  ❌ Error:', response.status, response.statusText);
        continue;
      }
      
      const data = await response.json();
      const post = data.data?.[0];
      
      if (!post) {
        console.log('  ❌ Post not found');
        continue;
      }
      
      const attributes = post.attributes || post;
      const hasSEO = !!attributes.seo;
      
      console.log(`  ${hasSEO ? '✅' : '❌'} SEO found: ${hasSEO}`);
      
      if (hasSEO) {
        console.log('  📋 SEO data:', JSON.stringify(attributes.seo, null, 2).substring(0, 300));
        break; // Found it, stop trying other strategies
      }
    }
    
    // Final check with the best strategy
    console.log('\n' + '='.repeat(60));
    console.log('📋 Final Check with populate[seo][populate]=*');
    console.log('='.repeat(60));
    
    const finalUrl = `${STRAPI_URL}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&locale=${locale}&populate[seo][populate]=*&publicationState=live`;
    const finalResponse = await fetch(finalUrl);
    const finalData = await finalResponse.json();
    const finalPost = finalData.data?.[0];
    
    if (finalPost) {
      const attrs = finalPost.attributes || finalPost;
      console.log('\n📋 Full post structure:');
      console.log(JSON.stringify(attrs, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSEO();


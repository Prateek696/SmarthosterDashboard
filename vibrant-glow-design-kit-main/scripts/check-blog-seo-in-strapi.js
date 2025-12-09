/**
 * Check if blog posts in Strapi have SEO data
 * 
 * Usage: node scripts/check-blog-seo-in-strapi.js
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function checkBlogSEO() {
  console.log('🔍 Checking blog posts in Strapi for SEO data...\n');
  
  const locales = ['en', 'pt', 'fr'];
  
  for (const locale of locales) {
    console.log(`\n📍 Checking locale: ${locale.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    try {
      const url = `${STRAPI_URL}/api/blogs?locale=${locale}&populate[seo][populate]=*&publicationState=live&pagination[pageSize]=50`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ Error fetching blogs for ${locale}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      const posts = data.data || [];
      
      console.log(`📊 Found ${posts.length} published blog posts`);
      
      let withSEO = 0;
      let withoutSEO = 0;
      
      for (const post of posts) {
        const postData = post.attributes || post;
        const hasSEO = postData.seo && (
          Array.isArray(postData.seo) ? postData.seo.length > 0 : !!postData.seo
        );
        
        if (hasSEO) {
          withSEO++;
          const seoEntry = Array.isArray(postData.seo) ? postData.seo[0] : postData.seo;
          console.log(`   ✅ "${postData.title}" - Has SEO (metaTitle: ${seoEntry.metaTitle?.substring(0, 40)}...)`);
        } else {
          withoutSEO++;
          console.log(`   ❌ "${postData.title}" - NO SEO data`);
        }
      }
      
      console.log(`\n📈 Summary for ${locale.toUpperCase()}:`);
      console.log(`   ✅ With SEO: ${withSEO}`);
      console.log(`   ❌ Without SEO: ${withoutSEO}`);
      console.log(`   📝 Total: ${posts.length}`);
      
    } catch (error) {
      console.error(`❌ Error checking ${locale}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Check completed!');
  console.log('\n💡 If posts are missing SEO data, run:');
  console.log('   npm run export:blog-data');
  console.log('   npm run import:blogs');
  console.log('   npm run publish:blogs');
}

checkBlogSEO().catch(console.error);



/**
 * Test Script: Verify Meta Tags on Frontend
 * 
 * This script helps verify that:
 * 1. Meta tags are correctly fetched from Strapi
 * 2. Meta tags are displayed on the frontend
 * 3. Changes in Strapi are reflected on the frontend
 * 
 * Usage:
 *   node scripts/test-meta-tags.js
 * 
 * Prerequisites:
 *   - Next.js dev server running on http://localhost:3001
 *   - Strapi server running on http://localhost:1337
 */

// Use built-in fetch (Node.js 18+)
// If fetch is not available, install node-fetch: npm install node-fetch

const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Extract meta tags from HTML
function extractMetaTags(html) {
  const metaTags = {};
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metaTags.title = titleMatch[1];
  }
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    metaTags.description = descMatch[1];
  }
  
  // Extract Open Graph tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    metaTags.ogTitle = ogTitleMatch[1];
  }
  
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch) {
    metaTags.ogDescription = ogDescMatch[1];
  }
  
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    metaTags.ogImage = ogImageMatch[1];
  }
  
  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  if (ogUrlMatch) {
    metaTags.ogUrl = ogUrlMatch[1];
  }
  
  // Extract canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    metaTags.canonical = canonicalMatch[1];
  }
  
  return metaTags;
}

// Fetch blog post from Strapi
async function fetchStrapiBlogPost(slug, locale) {
  try {
    const url = `${STRAPI_URL}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&locale=${locale}&populate=*&populate[seo][populate]=*&publicationState=live`;
    
    log(`   URL: ${url}`, 'reset');
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      log(`   ❌ Strapi API Error (${response.status}):`, 'red');
      log(`   ${errorText.substring(0, 200)}`, 'reset');
      throw new Error(`Strapi API returned ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    const post = data.data?.[0];
    
    if (!post) {
      log(`   ⚠️  No post found with slug "${slug}" for locale "${locale}"`, 'yellow');
      return null;
    }
    
    // Extract SEO data
    const seoData = post.attributes?.seo?.[0] || null;
    const openGraphData = seoData?.openGraph || null;
    
    return {
      title: post.attributes?.title || '',
      excerpt: post.attributes?.excerpt || '',
      seo: seoData,
      openGraph: openGraphData,
    };
  } catch (error) {
    log(`   ❌ Error fetching from Strapi: ${error.message}`, 'red');
    return null;
  }
}

// Test a single blog post
async function testBlogPost(slug, locale) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: /${locale}/blog/${slug}`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Fetch from Strapi
  log('\n📡 Fetching from Strapi...', 'blue');
  const strapiData = await fetchStrapiBlogPost(slug, locale);
  
  if (!strapiData) {
    log('❌ Blog post not found in Strapi', 'red');
    return false;
  }
  
  log('✅ Strapi Data:', 'green');
  log(`   Title: ${strapiData.title}`, 'reset');
  log(`   SEO Title: ${strapiData.seo?.metaTitle || 'N/A'}`, 'reset');
  log(`   SEO Description: ${strapiData.seo?.metaDescription || 'N/A'}`, 'reset');
  log(`   OG Title: ${strapiData.openGraph?.ogTitle || 'N/A'}`, 'reset');
  log(`   OG Description: ${strapiData.openGraph?.ogDescription || 'N/A'}`, 'reset');
  
  // Fetch from Frontend
  log('\n🌐 Fetching from Frontend...', 'blue');
  const frontendUrl = `${FRONTEND_URL}/${locale}/blog/${slug}`;
  
  try {
    const response = await fetch(frontendUrl);
    if (!response.ok) {
      log(`❌ Frontend returned ${response.status}`, 'red');
      return false;
    }
    
    const html = await response.text();
    const frontendMetaTags = extractMetaTags(html);
    
    log('✅ Frontend Meta Tags:', 'green');
    log(`   Title: ${frontendMetaTags.title || 'N/A'}`, 'reset');
    log(`   Description: ${frontendMetaTags.description || 'N/A'}`, 'reset');
    log(`   OG Title: ${frontendMetaTags.ogTitle || 'N/A'}`, 'reset');
    log(`   OG Description: ${frontendMetaTags.ogDescription || 'N/A'}`, 'reset');
    log(`   OG Image: ${frontendMetaTags.ogImage || 'N/A'}`, 'reset');
    log(`   Canonical: ${frontendMetaTags.canonical || 'N/A'}`, 'reset');
    
    // Compare
    log('\n🔍 Comparison:', 'yellow');
    let allMatch = true;
    
    // Check title
    const expectedTitle = strapiData.seo?.metaTitle || strapiData.title;
    if (frontendMetaTags.title !== expectedTitle) {
      log(`   ❌ Title mismatch:`, 'red');
      log(`      Expected: ${expectedTitle}`, 'reset');
      log(`      Got: ${frontendMetaTags.title}`, 'reset');
      allMatch = false;
    } else {
      log(`   ✅ Title matches`, 'green');
    }
    
    // Check description
    const expectedDesc = strapiData.seo?.metaDescription || strapiData.excerpt;
    if (frontendMetaTags.description !== expectedDesc) {
      log(`   ❌ Description mismatch:`, 'red');
      log(`      Expected: ${expectedDesc}`, 'reset');
      log(`      Got: ${frontendMetaTags.description}`, 'reset');
      allMatch = false;
    } else {
      log(`   ✅ Description matches`, 'green');
    }
    
    // Check OG Title
    const expectedOGTitle = strapiData.openGraph?.ogTitle || strapiData.seo?.metaTitle || strapiData.title;
    if (frontendMetaTags.ogTitle !== expectedOGTitle) {
      log(`   ❌ OG Title mismatch:`, 'red');
      log(`      Expected: ${expectedOGTitle}`, 'reset');
      log(`      Got: ${frontendMetaTags.ogTitle}`, 'reset');
      allMatch = false;
    } else {
      log(`   ✅ OG Title matches`, 'green');
    }
    
    // Check OG Description
    const expectedOGDesc = strapiData.openGraph?.ogDescription || strapiData.seo?.metaDescription || strapiData.excerpt;
    if (frontendMetaTags.ogDescription !== expectedOGDesc) {
      log(`   ❌ OG Description mismatch:`, 'red');
      log(`      Expected: ${expectedOGDesc}`, 'reset');
      log(`      Got: ${frontendMetaTags.ogDescription}`, 'reset');
      allMatch = false;
    } else {
      log(`   ✅ OG Description matches`, 'green');
    }
    
    return allMatch;
  } catch (error) {
    log(`❌ Error fetching from frontend: ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runTests() {
  log('\n🧪 META TAGS TESTING SUITE', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Frontend URL: ${FRONTEND_URL}`, 'blue');
  log(`Strapi URL: ${STRAPI_URL}`, 'blue');
  
  // Test blog posts for different locales
  const testCases = [
    {
      slug: 'how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025',
      locale: 'en',
    },
    {
      slug: 'maximize-airbnb-income-portugal',
      locale: 'pt',
    },
    {
      slug: 'maximize-airbnb-income-portugal',
      locale: 'fr',
    },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testBlogPost(testCase.slug, testCase.locale);
    results.push({ ...testCase, passed: result });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    log(`${status} - /${result.locale}/blog/${result.slug}`, result.passed ? 'green' : 'red');
  }
  
  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Meta tags are correctly synced between Strapi and Frontend.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});


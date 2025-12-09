/**
 * Verify meta tags are on the frontend
 * Run: node scripts/verify-frontend-meta.js
 */

const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const slug = 'how-to-maximize-your-airbnb-income-in-portugal-expert-tips-for-2024-2025';
const locale = 'en';

async function verifyMetaTags() {
  try {
    const url = `${FRONTEND_URL}/${locale}/blog/${slug}`;
    console.log('🔍 Fetching from:', url);
    console.log('');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Error:', response.status, response.statusText);
      return;
    }
    
    const html = await response.text();
    
    // Extract meta tags
    const extractMeta = (name, property = false) => {
      const attr = property ? 'property' : 'name';
      const regex = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;
    
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    
    const metaTags = {
      title: title,
      description: extractMeta('description'),
      ogTitle: extractMeta('og:title', true),
      ogDescription: extractMeta('og:description', true),
      ogImage: extractMeta('og:image', true),
      ogUrl: extractMeta('og:url', true),
      ogType: extractMeta('og:type', true),
      twitterCard: extractMeta('twitter:card'),
      twitterTitle: extractMeta('twitter:title'),
      canonical: canonical,
    };
    
    console.log('📋 Meta Tags Found:');
    console.log('='.repeat(60));
    
    const checks = [
      { name: 'Title', value: metaTags.title, required: true },
      { name: 'Description', value: metaTags.description, required: true },
      { name: 'OG Title', value: metaTags.ogTitle, required: true },
      { name: 'OG Description', value: metaTags.ogDescription, required: true },
      { name: 'OG Image', value: metaTags.ogImage, required: false },
      { name: 'OG URL', value: metaTags.ogUrl, required: true },
      { name: 'OG Type', value: metaTags.ogType, required: true },
      { name: 'Canonical URL', value: metaTags.canonical, required: true },
    ];
    
    let allRequired = true;
    for (const check of checks) {
      const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`${status} ${check.name}: ${check.value || 'NOT FOUND'}`);
      if (check.required && !check.value) {
        allRequired = false;
      }
    }
    
    console.log('');
    console.log('='.repeat(60));
    if (allRequired) {
      console.log('✅ All required meta tags are present!');
      console.log('');
      console.log('📋 Sample values:');
      console.log('  Title:', metaTags.title?.substring(0, 60));
      console.log('  Description:', metaTags.description?.substring(0, 80));
      console.log('  OG Title:', metaTags.ogTitle?.substring(0, 60));
    } else {
      console.log('❌ Some required meta tags are missing!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyMetaTags();



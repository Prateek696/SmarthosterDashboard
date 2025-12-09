/**
 * Simple Meta Tags Test - Browser Console Version
 * 
 * Copy and paste this code into your browser console while viewing a blog post
 * to quickly verify meta tags are correctly displayed.
 * 
 * Usage:
 *   1. Open a blog post: http://localhost:3001/en/blog/[slug]
 *   2. Open DevTools (F12)
 *   3. Go to Console tab
 *   4. Paste this entire script
 *   5. Press Enter
 */

(function testMetaTags() {
  console.log('%c🧪 META TAGS TEST', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
  console.log('='.repeat(60));
  
  // Extract meta tags from current page
  const getMetaTag = (name, property = false) => {
    const attr = property ? 'property' : 'name';
    const element = document.querySelector(`meta[${attr}="${name}"]`);
    return element ? element.getAttribute('content') : null;
  };
  
  const getTitle = () => document.querySelector('title')?.textContent || null;
  const getCanonical = () => document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
  
  const metaTags = {
    title: getTitle(),
    description: getMetaTag('description'),
    ogTitle: getMetaTag('og:title', true),
    ogDescription: getMetaTag('og:description', true),
    ogImage: getMetaTag('og:image', true),
    ogUrl: getMetaTag('og:url', true),
    ogType: getMetaTag('og:type', true),
    twitterCard: getMetaTag('twitter:card'),
    twitterTitle: getMetaTag('twitter:title'),
    twitterDescription: getMetaTag('twitter:description'),
    canonical: getCanonical(),
  };
  
  // Display results
  console.log('\n📋 Found Meta Tags:');
  console.table(metaTags);
  
  // Validation
  console.log('\n✅ Validation:');
  const checks = [
    { name: 'Title tag exists', value: !!metaTags.title, required: true },
    { name: 'Meta description exists', value: !!metaTags.description, required: true },
    { name: 'OG Title exists', value: !!metaTags.ogTitle, required: true },
    { name: 'OG Description exists', value: !!metaTags.ogDescription, required: true },
    { name: 'OG Image exists', value: !!metaTags.ogImage, required: false },
    { name: 'OG URL exists', value: !!metaTags.ogUrl, required: true },
    { name: 'Canonical URL exists', value: !!metaTags.canonical, required: true },
    { name: 'Twitter Card exists', value: !!metaTags.twitterCard, required: false },
  ];
  
  const results = checks.map(check => {
    const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`${status} ${check.name}`);
    return { ...check, status };
  });
  
  const allRequired = results.filter(r => r.required).every(r => r.value);
  const allOptional = results.filter(r => !r.required).every(r => r.value);
  
  console.log('\n📊 Summary:');
  console.log(`Required tags: ${allRequired ? '✅ All present' : '❌ Missing some'}`);
  console.log(`Optional tags: ${allOptional ? '✅ All present' : '⚠️ Some missing'}`);
  
  // Check if values look correct
  console.log('\n🔍 Value Checks:');
  if (metaTags.title && metaTags.title.length > 60) {
    console.warn('⚠️ Title is longer than 60 characters (recommended for SEO)');
  }
  if (metaTags.description && metaTags.description.length > 160) {
    console.warn('⚠️ Description is longer than 160 characters (recommended for SEO)');
  }
  if (metaTags.ogTitle && metaTags.ogTitle.length > 70) {
    console.warn('⚠️ OG Title is longer than 70 characters (recommended)');
  }
  
  // Compare with Strapi (if you have the API available)
  console.log('\n💡 To compare with Strapi:');
  console.log('   1. Go to Strapi Admin: http://localhost:1337/admin');
  console.log('   2. Navigate to Content Manager → Blog');
  console.log('   3. Find the blog post and check SEO component');
  console.log('   4. Compare values with the table above');
  
  return metaTags;
})();



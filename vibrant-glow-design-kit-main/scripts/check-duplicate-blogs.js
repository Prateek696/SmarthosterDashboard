/**
 * Check for duplicate blog posts in Strapi
 * 
 * Usage:
 *   node scripts/check-duplicate-blogs.js
 * 
 * This script will:
 * 1. Fetch all blog posts from Strapi for each locale
 * 2. Identify duplicates by slug
 * 3. Report which posts are duplicated
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function fetchAllBlogs(locale) {
  try {
    const queryParams = [
      'pagination[pageSize]=100',
      'populate[seo][populate]=*',
      'publicationState=live',
      `locale=${locale}`,
    ];
    
    const url = `${STRAPI_URL}/api/blogs?${queryParams.join('&')}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`❌ Error fetching blogs for locale ${locale}:`, error.message);
    return [];
  }
}

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate blog posts in Strapi...\n');
  console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
  
  const locales = ['en', 'pt', 'fr'];
  const allDuplicates = [];
  
  for (const locale of locales) {
    console.log(`\n📋 Checking locale: ${locale.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    const posts = await fetchAllBlogs(locale);
    console.log(`   Found ${posts.length} posts`);
    
    // Group posts by slug
    const slugMap = new Map();
    posts.forEach(post => {
      const slug = post.slug || post.attributes?.slug;
      if (!slug) return;
      
      if (!slugMap.has(slug)) {
        slugMap.set(slug, []);
      }
      slugMap.get(slug).push({
        id: post.id,
        documentId: post.documentId,
        title: post.title || post.attributes?.title,
        slug: slug,
        publishedAt: post.publishedAt || post.attributes?.publishedAt,
      });
    });
    
    // Find duplicates
    const duplicates = [];
    slugMap.forEach((posts, slug) => {
      if (posts.length > 1) {
        duplicates.push({ slug, posts });
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`\n   ⚠️  Found ${duplicates.length} duplicate slug(s):\n`);
      duplicates.forEach(({ slug, posts }) => {
        console.log(`   📌 Slug: "${slug}" (${posts.length} duplicates)`);
        posts.forEach((post, index) => {
          console.log(`      ${index + 1}. ID: ${post.id}, Document ID: ${post.documentId || 'N/A'}`);
          console.log(`         Title: ${post.title}`);
          console.log(`         Published: ${post.publishedAt || 'N/A'}`);
        });
        console.log('');
      });
      allDuplicates.push({ locale, duplicates });
    } else {
      console.log(`   ✅ No duplicates found for locale ${locale}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  if (allDuplicates.length === 0) {
    console.log('✅ No duplicates found across all locales!');
  } else {
    console.log(`⚠️  Found duplicates in ${allDuplicates.length} locale(s):\n`);
    allDuplicates.forEach(({ locale, duplicates }) => {
      console.log(`   ${locale.toUpperCase()}: ${duplicates.length} duplicate slug(s)`);
    });
    console.log('\n💡 Recommendation:');
    console.log('   1. Go to Strapi Admin: http://localhost:1337/admin');
    console.log('   2. Navigate to Content Manager > Blog');
    console.log('   3. Review duplicate posts and delete the ones you don\'t need');
    console.log('   4. Keep only the most recent or most complete version of each post');
  }
  
  console.log('\n✨ Check complete!\n');
}

// Run the check
checkDuplicates().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


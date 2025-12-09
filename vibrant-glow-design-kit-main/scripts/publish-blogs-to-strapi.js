/**
 * Bulk Publish Blog posts in Strapi for EN and FR locales
 * 
 * Usage:
 *   npm run publish:blogs
 *   OR
 *   node scripts/publish-blogs-to-strapi.js
 * 
 * Make sure:
 *   1. Strapi server is running
 *   2. You have set STRAPI_API_TOKEN in .env (or it will use public API)
 *   3. Blog posts are already imported (but in Draft state)
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

// Fetch all blog posts for a locale (including drafts)
async function fetchAllBlogPosts(locale) {
  try {
    // Fetch with publicationState=preview to get both draft and published
    const response = await strapiRequest(
      `/blogs?locale=${locale}&publicationState=preview&pagination[pageSize]=100&populate=*`
    );
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching blog posts for locale ${locale}:`, error.message);
    return [];
  }
}

// Publish a single blog post
async function publishBlogPost(postId, documentId, locale) {
  try {
    // In Strapi v5, use documentId for locale-specific operations
    const idToUse = documentId || postId;
    
    // Try locale-specific publish endpoint first
    try {
      const result = await strapiRequest(
        `/blogs/${idToUse}/actions/publish?locale=${locale}`,
        'POST'
      );
      return { success: true, result };
    } catch (localeError) {
      // If locale-specific fails, try without locale
      console.log(`   ⚠️  Locale-specific publish failed, trying without locale...`);
      const result = await strapiRequest(
        `/blogs/${idToUse}/actions/publish`,
        'POST'
      );
      return { success: true, result };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Publish all blog posts for a locale
async function publishBlogsForLocale(locale) {
  console.log(`\n============================================================`);
  console.log(`📍 Publishing blog posts for locale: ${locale.toUpperCase()}`);
  console.log(`============================================================\n`);

  // Fetch all posts (including drafts)
  console.log(`📥 Fetching all blog posts for ${locale.toUpperCase()}...`);
  const posts = await fetchAllBlogPosts(locale);
  
  if (posts.length === 0) {
    console.log(`⚠️  No blog posts found for locale ${locale.toUpperCase()}`);
    return { success: 0, failed: 0, total: 0 };
  }

  console.log(`📦 Found ${posts.length} blog post(s) to process\n`);

  let successCount = 0;
  let failedCount = 0;
  let alreadyPublishedCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const attributes = post.attributes || post;
    const title = attributes.title || 'Untitled';
    const postId = post.id;
    const documentId = post.documentId;
    
    // Check if already published
    const isPublished = post.publishedAt !== null;
    
    if (isPublished) {
      console.log(`✅ [${i + 1}/${posts.length}] "${title}" - Already published`);
      alreadyPublishedCount++;
      continue;
    }

    console.log(`📝 [${i + 1}/${posts.length}] Publishing: "${title}"`);
    console.log(`   ID: ${postId}, Document ID: ${documentId || 'N/A'}`);

    const result = await publishBlogPost(postId, documentId, locale);

    if (result.success) {
      console.log(`   ✅ Published successfully!\n`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to publish: ${result.error}\n`);
      failedCount++;
    }

    // Small delay to avoid rate limiting
    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`\n📊 Summary for ${locale.toUpperCase()}:`);
  console.log(`   ✅ Published: ${successCount}`);
  console.log(`   ✅ Already published: ${alreadyPublishedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   📝 Total: ${posts.length}`);

  return {
    success: successCount,
    alreadyPublished: alreadyPublishedCount,
    failed: failedCount,
    total: posts.length
  };
}

// Main function
async function publishAllBlogs() {
  console.log('🚀 Starting bulk publish for blog posts...\n');
  console.log('📋 This will publish posts for: EN, FR\n');
  console.log('⚠️  Note: Portuguese (PT) posts are already published\n');

  const locales = ['en', 'fr'];
  const results = {};

  for (const locale of locales) {
    try {
      results[locale] = await publishBlogsForLocale(locale);
      
      if (locale !== locales[locales.length - 1]) {
        console.log('\n⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to process locale ${locale.toUpperCase()}:`, error.message);
      results[locale] = { error: error.message };
    }
  }

  console.log('\n============================================================');
  console.log('📊 PUBLISH SUMMARY');
  console.log('============================================================');
  for (const locale of locales) {
    const result = results[locale];
    if (result?.error) {
      console.log(`   ${locale.toUpperCase()}: ❌ Failed - ${result.error}`);
    } else {
      console.log(`   ${locale.toUpperCase()}: ✅ ${result.success} published, ${result.alreadyPublished} already published, ${result.failed} failed`);
    }
  }
  console.log('============================================================\n');

  console.log('✨ Publish process completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Check Strapi Admin to verify all posts are published');
  console.log('   2. Test on frontend: /en/blog, /fr/blog');
  console.log('   3. All locales should now show blog posts!');
}

// Run if called directly
publishAllBlogs()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Publish failed:', error);
    process.exit(1);
  });




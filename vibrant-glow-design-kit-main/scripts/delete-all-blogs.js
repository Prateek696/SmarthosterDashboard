/**
 * Delete all blog posts from Strapi
 * 
 * Usage:
 *   node scripts/delete-all-blogs.js
 * 
 * WARNING: This will delete ALL blog posts from Strapi!
 * Make sure you have backups if needed.
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
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

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(`Strapi API Error (${response.status}): ${errorMessage}`);
  }

  // DELETE requests often return empty responses
  const text = await response.text();
  if (!text || text.trim() === '') {
    return null; // Empty response is OK for DELETE
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return null; // If not JSON, return null (OK for DELETE)
  }
}

// Fetch all blog posts for a locale
async function fetchAllBlogs(locale) {
  try {
    const queryParams = [
      'pagination[pageSize]=100',
      // Check both published and draft posts
      `locale=${locale}`,
    ];
    
    const url = `${STRAPI_URL}/api/blogs?${queryParams.join('&')}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
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

// Delete a single blog post
async function deleteBlogPost(postId, documentId, locale) {
  try {
    // Try using documentId first (Strapi v5), then fallback to id
    const idToUse = documentId || postId;
    
    // Try with locale first
    try {
      await strapiRequest(`/blogs/${idToUse}?locale=${locale}`, 'DELETE');
      return true;
    } catch (error) {
      // If locale-specific delete fails, try without locale
      if (error.message.includes('locale')) {
        await strapiRequest(`/blogs/${idToUse}`, 'DELETE');
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.error(`   ❌ Failed to delete post ${postId}:`, error.message);
    return false;
  }
}

// Main function to delete all blogs
async function deleteAllBlogs() {
  console.log('🗑️  Deleting all blog posts from Strapi...\n');
  console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
  
  if (!API_TOKEN) {
    console.warn('⚠️  Warning: No STRAPI_API_TOKEN found in environment variables.');
    console.warn('   The script will attempt to delete without authentication.');
    console.warn('   If deletion fails, set STRAPI_API_TOKEN in your .env file.\n');
  }
  
  const locales = ['en', 'pt', 'fr'];
  let totalDeleted = 0;
  let totalFailed = 0;
  
  for (const locale of locales) {
    console.log(`\n📋 Processing locale: ${locale.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    const posts = await fetchAllBlogs(locale);
    console.log(`   Found ${posts.length} posts to delete`);
    
    if (posts.length === 0) {
      console.log(`   ✅ No posts to delete for locale ${locale}`);
      continue;
    }
    
    let deleted = 0;
    let failed = 0;
    
    for (const post of posts) {
      const postId = post.id;
      const documentId = post.documentId;
      const title = post.title || post.attributes?.title || 'Unknown';
      const slug = post.slug || post.attributes?.slug || 'unknown';
      
      console.log(`   🗑️  Deleting: "${title}" (${slug})...`);
      
      const success = await deleteBlogPost(postId, documentId, locale);
      if (success) {
        deleted++;
        totalDeleted++;
        console.log(`      ✅ Deleted successfully`);
      } else {
        failed++;
        totalFailed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n   📊 Summary for ${locale.toUpperCase()}:`);
    console.log(`      ✅ Deleted: ${deleted}`);
    console.log(`      ❌ Failed: ${failed}`);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(50));
  console.log(`   ✅ Total deleted: ${totalDeleted}`);
  console.log(`   ❌ Total failed: ${totalFailed}`);
  console.log('\n✨ Deletion complete!\n');
  
  return { deleted: totalDeleted, failed: totalFailed };
}

// Run the deletion
deleteAllBlogs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


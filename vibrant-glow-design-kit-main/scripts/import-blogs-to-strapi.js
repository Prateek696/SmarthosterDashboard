/**
 * Import Blog posts from TypeScript data files to Strapi
 * 
 * Usage:
 *   npm run import:blogs
 *   OR
 *   node scripts/import-blogs-to-strapi.js
 * 
 * Make sure:
 *   1. Strapi server is running
 *   2. You have set STRAPI_API_TOKEN in .env (or it will prompt for manual auth)
 *   3. Node.js 18+ is installed (for fetch support)
 * 
 * Note: Blogs are Collection Type, so each post is created/updated individually
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

// Helper to dynamically import blog data
// Note: This requires the TypeScript files to be compiled or we use a different approach
// For now, we'll create a manual mapping or use JSON files
async function getBlogPostsForLocale(locale) {
  const dataPath = path.join(__dirname, '../src/data');
  
  try {
    // Try to dynamically import the blog data files
    // Since we're using ES modules, we can try importing the compiled JS files
    // But for now, let's use a workaround - we'll read the files and extract data
    
    if (locale === 'en') {
      // Import English blog posts
      // We'll need to compile TS first or use a different method
      // For now, return empty and provide instructions
      console.log('   ℹ️  English blog posts: Need to compile TS files or use JSON');
      return [];
    }
    
    if (locale === 'pt') {
      // Import Portuguese blog posts
      console.log('   ℹ️  Portuguese blog posts: Need to compile TS files or use JSON');
      return [];
    }
    
    if (locale === 'fr') {
      // Import French blog posts
      console.log('   ℹ️  French blog posts: Need to compile TS files or use JSON');
      return [];
    }
    
    return [];
  } catch (error) {
    console.error(`Error reading blog data for locale ${locale}:`, error.message);
    return [];
  }
}

// Helper to truncate strings to max length
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Transform blog post to Strapi format
function transformBlogPost(post, locale) {
  // Truncate SEO fields to match Strapi schema limits
  const seoTitle = post.seoTitle || post.title || '';
  const seoDescription = post.metaDescription || post.excerpt || '';
  
  // Ensure metaDescription meets minimum length (50 chars) for Strapi requirement
  const finalMetaDescription = seoDescription.length >= 50 
    ? truncate(seoDescription, 160)
    : (post.excerpt && post.excerpt.length >= 50 
        ? truncate(post.excerpt, 160)
        : truncate((seoDescription || post.excerpt || post.title || 'Blog post about ' + post.title), 160).padEnd(50, '...'));
  
  // Get image URL from blog data (featuredImage or ogImage)
  // Try to use the image URL - if Strapi fields are Media fields, they'll reject it and we'll handle the error
  const imageUrl = post.featuredImage || post.ogImage || null;
  
  // Validate URL format
  const isValidImageUrl = imageUrl && 
    typeof imageUrl === 'string' && 
    (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
  
  // Build SEO component data
  const seoData = {
    metaTitle: truncate(seoTitle, 60), // Max 60 chars (required)
    metaDescription: finalMetaDescription, // Max 160 chars, min 50 (required)
    // Try to set image URL - if Strapi rejects it (Media field), error handling will catch it
    // If it works (text/URL field), the image will be imported automatically
    metaImage: isValidImageUrl ? imageUrl : null,
    // openGraph is a component, so we need to pass it as an object
    openGraph: {
      ogTitle: truncate(seoTitle, 70), // Max 70 chars (required)
      ogDescription: truncate(seoDescription || post.excerpt || '', 200), // Max 200 chars (required)
      // Try to set image URL - if Strapi rejects it (Media field), error handling will catch it
      // If it works (text/URL field), the image will be imported automatically
      ogImage: isValidImageUrl ? imageUrl : null,
      ogUrl: `https://www.smarthoster.io/${locale === 'en' ? '' : locale + '/'}blog/${post.slug}`,
      ogType: 'article'
    },
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
    metaRobots: 'INDEX,FOLLOW',
    canonicalURL: post.canonicalUrl || `https://www.smarthoster.io/${locale === 'en' ? '' : locale + '/'}blog/${post.slug}`
  };
  
  return {
    data: {
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || post.metaDescription || '',
      content: post.content || '',
      author: post.author?.name || post.author || 'SmartHoster Team',
      category: post.category || 'General',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      readTime: typeof post.readTime === 'number' ? post.readTime : parseInt(post.readTime) || 5,
      publishedDate: post.publishedAt || post.date || new Date().toISOString(),
      featured: post.featured || false,
      // Note: coverImage is a Media field in Strapi, so we can't set URL directly
      // The image URL is stored in SEO.metaImage and SEO.openGraph.ogImage instead
      // Users can upload a new image in Strapi Media Library and link it to coverImage field
      coverImage: null,
      // SEO is a repeatable component in Strapi schema, but we'll use single entry
      // Always include SEO data if we have seoTitle or metaDescription
      seo: (post.seoTitle || post.metaDescription || post.excerpt) ? [seoData] : []
    }
  };
}

// Import blog post for a specific locale
async function importBlogPostForLocale(post, locale) {
  try {
    console.log(`\n📝 Processing blog post: "${post.title}" (locale: ${locale})`);
    console.log(`   Slug: ${post.slug}`);
    
    // Check if post already exists with this slug and locale
    let existingPost = null;
    try {
      const existingResponse = await strapiRequest(
        `/blogs?filters[slug][$eq]=${encodeURIComponent(post.slug)}&locale=${locale}&populate=*`
      );
      if (existingResponse.data && existingResponse.data.length > 0) {
        existingPost = existingResponse.data[0];
        console.log(`   ✅ Found existing post (ID: ${existingPost.id}, Document ID: ${existingPost.documentId || 'N/A'})`);
      }
    } catch (error) {
      // Post doesn't exist yet, that's fine
      console.log(`   ℹ️  Post doesn't exist yet, will create new`);
    }
    
    // Transform post data
    const transformedData = transformBlogPost(post, locale);
    
    // Helper function to remove image URLs if they cause errors
    const removeImageUrls = (data) => {
      const cleaned = JSON.parse(JSON.stringify(data));
      if (cleaned.data.seo && cleaned.data.seo[0]) {
        cleaned.data.seo[0].metaImage = null;
        if (cleaned.data.seo[0].openGraph) {
          cleaned.data.seo[0].openGraph.ogImage = null;
        }
      }
      return cleaned;
    };
    
    let result;
    if (existingPost) {
      // Update existing post - use documentId for locale-specific updates in Strapi v5
      console.log(`   🔄 Updating existing post...`);
      const updateId = existingPost.documentId || existingPost.id;
      try {
        result = await strapiRequest(
          `/blogs/${updateId}?locale=${locale}`,
          'PUT',
          transformedData
        );
        console.log(`   ✅ Post updated successfully!`);
      } catch (updateError) {
        // Check if error is related to image fields
        const errorMessage = updateError.message || '';
        if (errorMessage.includes('metaImage') || errorMessage.includes('ogImage') || errorMessage.includes('image')) {
          console.log(`   ⚠️  Image field error detected, retrying without image URLs...`);
          const dataWithoutImages = removeImageUrls(transformedData);
          try {
            result = await strapiRequest(
              `/blogs/${updateId}?locale=${locale}`,
              'PUT',
              dataWithoutImages
            );
            console.log(`   ✅ Post updated successfully! (Images need to be added manually in Strapi)`);
            if (post.featuredImage || post.ogImage) {
              console.log(`   📸 Image URL to add manually: ${(post.featuredImage || post.ogImage).substring(0, 80)}...`);
            }
          } catch (retryError) {
            // If locale-specific update fails, try without locale (fallback)
            console.log(`   ⚠️  Locale-specific update failed, trying without locale...`);
            result = await strapiRequest(
              `/blogs/${updateId}`,
              'PUT',
              dataWithoutImages
            );
            console.log(`   ✅ Post updated successfully (without locale)!`);
          }
        } else {
          // If locale-specific update fails, try without locale (fallback)
          console.log(`   ⚠️  Locale-specific update failed, trying without locale...`);
          result = await strapiRequest(
            `/blogs/${updateId}`,
            'PUT',
            transformedData
          );
          console.log(`   ✅ Post updated successfully (without locale)!`);
        }
      }
    } else {
      // Create new post
      console.log(`   ➕ Creating new post...`);
      try {
        result = await strapiRequest(
          `/blogs?locale=${locale}`,
          'POST',
          transformedData
        );
        console.log(`   ✅ Post created successfully!`);
      } catch (createError) {
        // Check if error is related to image fields
        const errorMessage = createError.message || '';
        if (errorMessage.includes('metaImage') || errorMessage.includes('ogImage') || errorMessage.includes('image')) {
          console.log(`   ⚠️  Image field error detected, retrying without image URLs...`);
          const dataWithoutImages = removeImageUrls(transformedData);
          result = await strapiRequest(
            `/blogs?locale=${locale}`,
            'POST',
            dataWithoutImages
          );
          console.log(`   ✅ Post created successfully! (Images need to be added manually in Strapi)`);
          if (post.featuredImage || post.ogImage) {
            console.log(`   📸 Image URL to add manually: ${(post.featuredImage || post.ogImage).substring(0, 80)}...`);
          }
        } else {
          throw createError; // Re-throw if it's a different error
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error(`   ❌ Error importing post "${post.title}":`, error.message);
    throw error;
  }
}

// Import all blog posts for a locale
async function importBlogsForLocale(locale, blogPosts = []) {
  console.log(`\n============================================================`);
  console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
  console.log(`============================================================`);
  
  if (!blogPosts || blogPosts.length === 0) {
    console.log(`\n⚠️  No blog posts provided for locale ${locale}`);
    console.log(`   Please provide blog posts array as parameter`);
    console.log(`   Example: importBlogsForLocale('en', [post1, post2, ...])`);
    return { success: false, message: 'No blog posts provided' };
  }
  
  console.log(`\n📦 Found ${blogPosts.length} blog posts to import`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    try {
      await importBlogPostForLocale(post, locale);
      successCount++;
      
      // Wait a bit to avoid rate limiting (except for last post)
      if (i < blogPosts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`   ❌ Failed to import post "${post.title}":`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Import Summary for locale ${locale.toUpperCase()}:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${blogPosts.length}`);
  
  return { success: true, imported: successCount, errors: errorCount, total: blogPosts.length };
}

// Main import function - accepts blog posts arrays for each locale
async function importBlogs(blogPostsData = { en: [], pt: [], fr: [] }) {
  console.log('🚀 Starting Blog posts import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = {};

  for (const locale of locales) {
    const posts = blogPostsData[locale] || [];
    try {
      results[locale] = await importBlogsForLocale(locale, posts);
      console.log(`✅ Locale ${locale.toUpperCase()} processing completed!\n`);
      
      if (locale !== locales[locales.length - 1]) {
        console.log('⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to process locale ${locale.toUpperCase()}:`, error.message);
      results[locale] = { error: error.message };
    }
  }

  console.log('============================================================');
  console.log('📊 IMPORT SUMMARY');
  console.log('============================================================');
  for (const locale of locales) {
    const result = results[locale];
    if (result?.error) {
      console.log(`   ${locale.toUpperCase()}: ❌ Failed - ${result.error}`);
    } else if (result?.imported !== undefined) {
      console.log(`   ${locale.toUpperCase()}: ✅ ${result.imported}/${result.total} imported`);
    } else {
      console.log(`   ${locale.toUpperCase()}: ⚠️  No data provided`);
    }
  }
  console.log('============================================================\n');

  return results;
}

// Export for use in other scripts
export { importBlogs, importBlogPostForLocale, transformBlogPost };

// Helper to load blog data from JSON file (exported from TypeScript)
async function loadBlogData() {
  try {
    // First, try to load from JSON file (if exported)
    const jsonPath = path.join(__dirname, '../src/data/blogPosts.json');
    
    if (fs.existsSync(jsonPath)) {
      console.log('📂 Loading blog data from JSON file...');
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log('✅ Successfully loaded blog data from JSON!');
      console.log(`   English posts: ${jsonData.en?.length || 0}`);
      console.log(`   Portuguese posts: ${jsonData.pt?.length || 0}`);
      console.log(`   French posts: ${jsonData.fr?.length || 0}\n`);
      
      return {
        en: jsonData.en || [],
        pt: jsonData.pt || [],
        fr: jsonData.fr || []
      };
    }
    
    // Try to import from TypeScript files directly (requires tsx)
    try {
      console.log('📂 Trying to load blog data from TypeScript files...');
      const blogDataModule = await import('../src/data/blogPostsUpdated.js');
      const { allBlogPosts } = blogDataModule;
      
      if (allBlogPosts) {
        console.log('✅ Successfully loaded blog data from TypeScript files!');
        console.log(`   English posts: ${allBlogPosts.en?.length || 0}`);
        console.log(`   Portuguese posts: ${allBlogPosts.pt?.length || 0}`);
        console.log(`   French posts: ${allBlogPosts.fr?.length || 0}\n`);
        
        return {
          en: allBlogPosts.en || [],
          pt: allBlogPosts.pt || [],
          fr: allBlogPosts.fr || []
        };
      }
    } catch (importError) {
      // If direct import fails, provide instructions
      console.log('⚠️  Could not import TypeScript files directly.');
    }
    
    // Fallback: Return empty and provide instructions
    console.log('⚠️  Could not load blog data automatically.');
    console.log('\n   To fix this, use one of these methods:');
    console.log('   1. Export blog data to JSON first:');
    console.log('      npx tsx scripts/export-blog-data-to-json.js');
    console.log('      Then run: npm run import:blogs');
    console.log('   2. Or run import script with tsx:');
    console.log('      npx tsx scripts/import-blogs-to-strapi.js\n');
    
    return { en: [], pt: [], fr: [] };
  } catch (error) {
    console.error('❌ Error loading blog data:', error.message);
    return { en: [], pt: [], fr: [] };
  }
}

// Run import if called directly
loadBlogData()
  .then((blogData) => {
    return importBlogs(blogData);
  })
  .then(() => {
    console.log('✨ Import process completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Strapi Admin: http://localhost:1337/admin');
    console.log('   2. Navigate to Content Manager > Blog');
    console.log('   3. Review and PUBLISH all imported blog posts for each locale');
    console.log('   4. Test on frontend: /en/blog, /pt/blog, /fr/blog');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });


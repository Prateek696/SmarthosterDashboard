/**
 * Export blog data from TypeScript files to JSON
 * This allows the import script to work without TypeScript compilation
 * 
 * Usage:
 *   npx tsx scripts/export-blog-data-to-json.js
 *   OR (if tsx is installed): npm run export:blog-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportBlogData() {
  try {
    console.log('🔄 Exporting blog data from TypeScript to JSON...\n');
    
    // Try to import the blog data
    // This requires tsx or compiled JS files
    const { allBlogPosts } = await import('../src/data/blogPostsUpdated.js');
    
    if (!allBlogPosts) {
      console.error('❌ Could not load blog data. Make sure to run with: npx tsx scripts/export-blog-data-to-json.js');
      process.exit(1);
    }
    
    const outputPath = path.join(__dirname, '../src/data/blogPosts.json');
    
    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(allBlogPosts, null, 2), 'utf8');
    
    console.log('✅ Blog data exported successfully!');
    console.log(`   Output: ${outputPath}`);
    console.log(`   English posts: ${allBlogPosts.en?.length || 0}`);
    console.log(`   Portuguese posts: ${allBlogPosts.pt?.length || 0}`);
    console.log(`   French posts: ${allBlogPosts.fr?.length || 0}\n`);
    console.log('📝 Now you can run: npm run import:blogs');
    
  } catch (error) {
    console.error('❌ Error exporting blog data:', error.message);
    console.log('\n💡 Try running with tsx:');
    console.log('   npx tsx scripts/export-blog-data-to-json.js');
    process.exit(1);
  }
}

exportBlogData();




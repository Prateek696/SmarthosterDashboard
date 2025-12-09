/**
 * Import About Page data for Portuguese locale ONLY
 * This fixes the issue where Portuguese locale shows English content
 */

import { importAboutPageForLocale } from './import-aboutpage-to-strapi.js';

// Import only Portuguese locale
importAboutPageForLocale('pt')
  .then(() => {
    console.log('✨ Portuguese import completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Strapi Admin → About Page → Locale: Portuguese (pt)');
    console.log('   2. Verify the content is in Portuguese');
    console.log('   3. Click Publish');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });




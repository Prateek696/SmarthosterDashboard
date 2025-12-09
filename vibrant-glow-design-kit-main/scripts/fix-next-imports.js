/**
 * Script to replace Next.js imports with React Router compatibility layer
 * Run: node scripts/fix-next-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// Files to update (from grep results)
const filesToUpdate = [
  'components/blog/BlogGrid.tsx',
  'components/blog/BlogPost.tsx',
  'components/portal/CalendarView.tsx',
  'components/portal/PortalLayout.tsx',
  'components/AboutUs.tsx',
  'components/CTA.tsx',
  'components/Features.tsx',
  'components/Hero.tsx',
  'components/Integrations.tsx',
  'pages-old/api/Posts.tsx',
  'pages-old/About.tsx',
  'pages-old/AdminContentDashboard.tsx',
  'pages-old/AdminContentEditor.tsx',
  'pages-old/AdminContentGenerator.tsx',
  'pages-old/Auth.tsx',
  'pages-old/AuthorPage.tsx',
  'pages-old/AuthReset.tsx',
  'pages-old/Blog.tsx',
  'pages-old/EnhancedDirectBookings.tsx',
  'pages-old/FullServiceManagement.tsx',
  'pages-old/GreenPledge.tsx',
  'pages-old/Learn.tsx',
  'pages-old/NotFound.tsx',
  'pages-old/TagPage.tsx',
];

// Replacement patterns
const replacements = [
  {
    pattern: /import\s+Link\s+from\s+['"]next\/link['"]/g,
    replacement: "import { Link } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+{\s*usePathname\s*}\s+from\s+['"]next\/navigation['"]/g,
    replacement: "import { usePathname } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+{\s*useRouter\s*}\s+from\s+['"]next\/navigation['"]/g,
    replacement: "import { useRouter } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+{\s*useSearchParams\s*}\s+from\s+['"]next\/navigation['"]/g,
    replacement: "import { useSearchParams } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+{\s*usePathname,\s*useRouter\s*}\s+from\s+['"]next\/navigation['"]/g,
    replacement: "import { usePathname, useRouter } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+{\s*usePathname,\s*useSearchParams,\s*useRouter\s*}\s+from\s+['"]next\/navigation['"]/g,
    replacement: "import { usePathname, useSearchParams, useRouter } from '@/utils/next-compat'"
  },
  {
    pattern: /import\s+Image\s+from\s+['"]next\/image['"]/g,
    replacement: "// import Image from 'next/image' // Using regular img in Vite"
  },
];

let updatedCount = 0;

filesToUpdate.forEach(relativePath => {
  const filePath = path.join(srcDir, relativePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${relativePath}`);
    updatedCount++;
  } else {
    console.log(`⏭️  No changes: ${relativePath}`);
  }
});

console.log(`\n✨ Updated ${updatedCount} files`);


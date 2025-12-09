/**
 * Script to replace compatibility layer imports with real Next.js imports
 * Run: node scripts/migrate-to-nextjs-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// Files that need updating (from grep results)
const filesToUpdate = [
  'components/AdminRoute.tsx',
  'components/ProtectedRoute.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/LanguageBand.tsx',
  'components/Integrations.tsx',
  'components/Hero.tsx',
  'components/Features.tsx',
  'components/CTA.tsx',
  'components/AboutUs.tsx',
  'components/portal/PortalLayout.tsx',
  'components/portal/CalendarView.tsx',
  'components/blog/BlogPost.tsx',
  'components/blog/BlogGrid.tsx',
  'pages-old/TagPage.tsx',
  'pages-old/NotFound.tsx',
  'pages-old/Learn.tsx',
  'pages-old/GreenPledge.tsx',
  'pages-old/FullServiceManagement.tsx',
  'pages-old/EnhancedDirectBookings.tsx',
  'pages-old/Blog.tsx',
  'pages-old/AuthReset.tsx',
  'pages-old/AuthorPage.tsx',
  'pages-old/Auth.tsx',
  'pages-old/AdminContentGenerator.tsx',
  'pages-old/AdminContentEditor.tsx',
  'pages-old/AdminContentDashboard.tsx',
  'pages-old/About.tsx',
  'pages-old/api/Posts.tsx',
];

// Replacement patterns
const replacements = [
  {
    pattern: /import\s+{\s*Link\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import Link from 'next/link'"
  },
  {
    pattern: /import\s+{\s*usePathname\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import { usePathname } from 'next/navigation'"
  },
  {
    pattern: /import\s+{\s*useRouter\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import { useRouter } from 'next/navigation'"
  },
  {
    pattern: /import\s+{\s*useSearchParams\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import { useSearchParams } from 'next/navigation'"
  },
  {
    pattern: /import\s+{\s*usePathname,\s*useRouter\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import { usePathname, useRouter } from 'next/navigation'"
  },
  {
    pattern: /import\s+{\s*usePathname,\s*useSearchParams,\s*useRouter\s*}\s+from\s+['"]@\/utils\/next-compat['"]/g,
    replacement: "import { usePathname, useSearchParams, useRouter } from 'next/navigation'"
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

console.log(`\n✨ Updated ${updatedCount} files with Next.js imports`);


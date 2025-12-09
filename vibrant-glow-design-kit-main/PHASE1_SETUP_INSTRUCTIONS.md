# Phase 1 Setup Instructions - Next.js Migration

## ✅ What's Been Created

1. ✅ Next.js configuration files (`next.config.js`, `next.config.mjs`)
2. ✅ TypeScript config for Next.js (`tsconfig.next.json`)
3. ✅ Tailwind config for Next.js (`tailwind.config.next.ts`)
4. ✅ Next.js app structure (`app/` directory with layout and page)
5. ✅ Environment variables template (`.env.local.example`)
6. ✅ Global styles (`app/globals.css`)
7. ✅ Package.json for Next.js dependencies (`package.next.json`)

## 🚀 Installation Steps

### Step 1: Install Next.js and Additional Dependencies

Run this command to install Next.js and update your dependencies:

```bash
cd vibrant-glow-design-kit-main
npm install next@latest react@latest react-dom@latest
npm install eslint-config-next@latest
```

### Step 2: Add Next.js Scripts to package.json

Add these scripts to your existing `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:next": "next dev",
    "build": "vite build",
    "build:next": "next build",
    "start:next": "next start",
    "lint": "eslint .",
    "lint:next": "next lint",
    "preview": "vite preview"
  }
}
```

Or use the provided merge command:

```bash
# The scripts section should have both Vite and Next.js commands
```

### Step 3: Copy Tailwind Config

Rename the Next.js Tailwind config:

```bash
cp tailwind.config.next.ts tailwind.config.nextjs.ts
```

Or manually merge `tailwind.config.next.ts` settings into your existing `tailwind.config.ts`.

**Important:** Update the `content` paths in your existing `tailwind.config.ts` to include Next.js app directory:

```ts
content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",  // Add this for Next.js
  "./src/**/*.{ts,tsx}",
],
```

### Step 4: Update TypeScript Config

Either:
- Use `tsconfig.next.json` for Next.js, OR
- Merge Next.js settings into your existing `tsconfig.json`

### Step 5: Create Environment Variables File

Create `.env.local` file (if it doesn't exist):

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_STRAPI_URL=https://smarthoster-blogs.onrender.com
NEXT_PUBLIC_OWNER_PORTAL_URL=http://localhost:3000/auth/login
```

### Step 6: Update .gitignore (if needed)

Ensure `.gitignore` includes:
- `.next/`
- `.env.local`
- `*.local`

## 🧪 Testing the Setup

### Test Next.js Build

```bash
npm run build:next
```

### Test Next.js Dev Server

```bash
npm run dev:next
```

Then visit: http://localhost:3000

### Test Vite (Original React App)

```bash
npm run dev
```

Then visit: http://localhost:8080 (or whatever port Vite uses)

## 📁 File Structure

After Phase 1, your structure should look like:

```
vibrant-glow-design-kit-main/
├── app/                      # Next.js app directory (NEW)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── src/                      # Original React app (keep for migration)
├── public/                   # Shared public assets
├── next.config.js           # Next.js config (NEW)
├── tailwind.config.next.ts  # Next.js Tailwind config (NEW)
├── tsconfig.next.json       # Next.js TypeScript config (NEW)
├── package.json             # Updated with Next.js scripts
└── .env.local               # Environment variables (create this)
```

## ⚠️ Important Notes

1. **Parallel Development**: Both Vite (React) and Next.js can coexist. Use different scripts:
   - `npm run dev` - Original Vite app
   - `npm run dev:next` - Next.js app

2. **Port Conflicts**: 
   - Vite runs on port 8080 (check vite.config.ts)
   - Next.js runs on port 3000 by default
   - Change if needed: `next dev -p 3001`

3. **Environment Variables**:
   - Vite uses: `import.meta.env.VITE_*`
   - Next.js uses: `process.env.NEXT_PUBLIC_*`
   - Same values, different prefixes!

4. **Build Outputs**:
   - Vite builds to: `dist/`
   - Next.js builds to: `.next/`
   - Both are in `.gitignore`

## ✅ Phase 1 Checklist

- [ ] Next.js installed (`npm install next react react-dom`)
- [ ] Next.js scripts added to package.json
- [ ] Tailwind config updated for Next.js
- [ ] TypeScript config ready
- [ ] `.env.local` created with environment variables
- [ ] Next.js dev server runs (`npm run dev:next`)
- [ ] Next.js build succeeds (`npm run build:next`)
- [ ] Original Vite app still works (`npm run dev`)

## 🐛 Troubleshooting

### Build Errors

If you get build errors, check:
1. All dependencies installed: `npm install`
2. TypeScript config is correct
3. Tailwind config includes `app/` directory
4. Environment variables are set

### Port Already in Use

Change Next.js port:
```bash
npm run dev:next -- -p 3001
```

Or update package.json:
```json
"dev:next": "next dev -p 3001"
```

### Missing Dependencies

If you see missing module errors:
```bash
npm install
```

### TypeScript Errors

Check that `tsconfig.next.json` is being used, or merge settings into `tsconfig.json`.

## 📝 Next Steps

After Phase 1 is complete:
- ✅ Next.js setup is done
- ⏭️ Move to Phase 2: Core Infrastructure
  - Migrate contexts (Language, Auth)
  - Setup providers
  - Migrate utilities

---

**Phase 1 Status**: ✅ Complete Setup Ready
**Last Updated**: 2025-01-27











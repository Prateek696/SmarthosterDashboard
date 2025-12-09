# Next.js Migration Quick Reference Guide
## Common Conversions at a Glance

---

## 🔄 **Routing Conversions**

### **File Structure**
```
React Router                    Next.js App Router
─────────────────────────────────────────────────────
pages/Index.tsx          →      app/page.tsx
pages/About.tsx          →      app/about/page.tsx
pages/Blog.tsx           →      app/blog/page.tsx
pages/Blog.tsx (slug)    →      app/blog/[slug]/page.tsx
pages/Portal/index.tsx   →      app/portal/page.tsx
pages/Portal/[...].tsx   →      app/portal/[...]/page.tsx
pages/Auth.tsx           →      app/auth/page.tsx
```

### **Route Components**
```tsx
// React Router
import { Routes, Route } from 'react-router-dom';
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<Blog />} />

// Next.js (automatic from file structure)
// No route configuration needed - file structure is routes!
```

### **Navigation**
```tsx
// React Router
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/blog');

// Next.js
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/blog');
router.replace('/blog');
router.back();
```

### **Links**
```tsx
// React Router
import { Link } from 'react-router-dom';
<Link to="/blog">Blog</Link>
<Link to={`/blog/${slug}`}>Post</Link>

// Next.js
import Link from 'next/link';
<Link href="/blog">Blog</Link>
<Link href={`/blog/${slug}`}>Post</Link>
```

### **Pathname & Location**
```tsx
// React Router
import { useLocation } from 'react-router-dom';
const { pathname, search, hash } = useLocation();

// Next.js
import { usePathname, useSearchParams } from 'next/navigation';
const pathname = usePathname();
const searchParams = useSearchParams();
```

### **Route Parameters**
```tsx
// React Router
import { useParams } from 'react-router-dom';
const { slug } = useParams();

// Next.js (App Router)
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
export default function Page({ params, searchParams }: PageProps) {
  const { slug } = params;
}
```

---

## 🌍 **Environment Variables**

### **Access Pattern**
```tsx
// Vite
const apiUrl = import.meta.env.VITE_STRAPI_URL;
const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE;

// Next.js (Client Components)
const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
// Note: Only NEXT_PUBLIC_* vars are available client-side

// Next.js (Server Components)
const apiUrl = process.env.STRAPI_URL; // Any env var accessible
const nodeEnv = process.env.NODE_ENV;
```

### **Environment File**
```bash
# .env.local (Next.js)
NEXT_PUBLIC_STRAPI_URL=https://api.example.com
NEXT_PUBLIC_OWNER_PORTAL_URL=https://portal.example.com
STRAPI_URL=https://api.example.com  # Server-only
```

### **Helper Function (Recommended)**
```tsx
// lib/env.ts
export function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof window !== 'undefined') {
    // Client-side: only NEXT_PUBLIC_* vars
    return process.env[`NEXT_PUBLIC_${key}`] || defaultValue || '';
  }
  // Server-side: any env var
  return process.env[key] || defaultValue || '';
}

// Usage
const strapiUrl = getEnvVar('STRAPI_URL', 'https://default-url.com');
```

---

## 🎨 **Component Types**

### **Client Component**
```tsx
'use client';  // Add this directive at top

import { useState, useEffect } from 'react';

export default function MyComponent() {
  const [state, setState] = useState();
  // Hooks, state, browser APIs - all OK here
}
```

### **Server Component** (Default)
```tsx
// No 'use client' directive
// Can fetch data directly
async function getData() {
  const res = await fetch('...');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

---

## 📡 **Data Fetching**

### **React Query (Client-Side)**
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export default function ClientComponent() {
  const { data } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs
  });
}
```

### **Next.js Built-in (Server-Side)**
```tsx
// Server Component - automatic caching
async function Page() {
  const data = await fetch('https://api.example.com/blogs', {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  }).then(res => res.json());
  
  return <BlogList blogs={data} />;
}
```

### **Hybrid Approach**
```tsx
// Server Component fetches initial data
async function BlogPage() {
  const initialData = await fetchBlogs();
  
  return <BlogClient initialData={initialData} />;
}

// Client Component handles updates
'use client';
function BlogClient({ initialData }) {
  const { data } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
    initialData // Pre-populate with server data
  });
}
```

---

## 🔐 **Authentication**

### **Supabase Client Setup**
```tsx
// lib/supabase/client.ts
'use client';

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### **Auth Context (Client Component)**
```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export const AuthProvider = ({ children }) => {
  // Same as React version, but mark as 'use client'
};
```

---

## 🛡️ **Protected Routes**

### **Middleware Approach** (Recommended)
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (request.nextUrl.pathname.startsWith('/portal') && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  if (request.nextUrl.pathname.startsWith('/admin') && !isAdmin(token)) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*']
};
```

### **Layout-Level Protection**
```tsx
// app/portal/layout.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PortalLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  if (loading) return <Loading />;
  if (!user) return null;
  
  return <>{children}</>;
}
```

---

## 🌐 **Internationalization**

### **Middleware for Locale Detection**
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'pt', 'fr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}

function getLocale(request: NextRequest): string {
  // Check cookie, header, or default
  return request.cookies.get('locale')?.value || defaultLocale;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

### **Route Structure**
```
app/
├── [locale]/
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   └── learn/
│       └── [slug]/
│           └── page.tsx
└── (root routes without locale)
```

---

## 📊 **SEO & Metadata**

### **Static Metadata**
```tsx
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - SmartHoster',
  description: 'Full-service Airbnb management',
  openGraph: {
    title: 'SmartHoster',
    description: '...',
    images: ['/og-image.jpg']
  }
};
```

### **Dynamic Metadata**
```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage]
    }
  };
}
```

### **Structured Data**
```tsx
export default function BlogPost({ post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    // ...
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* content */}</article>
    </>
  );
}
```

---

## 📈 **Analytics**

### **Google Analytics Setup**
```tsx
// app/layout.tsx (root layout)
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0LH860VBV3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0LH860VBV3');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
```

### **Page View Tracking**
```tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    ReactGA.send({ 
      hitType: "pageview", 
      page: pathname + searchParams.toString() 
    });
  }, [pathname, searchParams]);
  
  return null;
}
```

---

## 🖼️ **Images**

### **Next.js Image Component**
```tsx
// Before (React)
<img src="/images/hero.jpg" alt="Hero" />

// After (Next.js)
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-fold images
/>
```

### **External Images**
```tsx
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com', 'smarthoster-blogs.onrender.com'],
  },
};

// Usage
<Image
  src="https://res.cloudinary.com/..."
  alt="..."
  width={800}
  height={600}
/>
```

---

## 🔄 **State Management**

### **React Context (Same as Before)**
```tsx
'use client';  // Must be client component

import { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export function MyProvider({ children }) {
  const [state, setState] = useState();
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}
```

### **Zustand/Redux (Same as Before)**
- Works exactly the same
- Just mark store usage in client components

---

## 🌐 **Translation Service (Critical)**

### **Client Component Wrapper**
```tsx
// components/blog/BlogContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { translateBlogContent } from '@/utils/translateBlog';

export function BlogContent({ htmlContent }) {
  const [translatedContent, setTranslatedContent] = useState(htmlContent);
  
  useEffect(() => {
    // Translation happens client-side only
    const translate = async () => {
      // Your translation logic here
    };
    translate();
  }, []);
  
  return (
    <div 
      className="blog-content-translate"
      dangerouslySetInnerHTML={{ __html: translatedContent }}
    />
  );
}
```

### **LocalStorage Access**
```tsx
'use client';

import { useEffect, useState } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  
  useEffect(() => {
    // Only access localStorage in useEffect (client-side)
    const stored = localStorage.getItem(key);
    if (stored) {
      setValue(JSON.parse(stored));
    }
  }, [key]);
  
  // ... rest of hook
}
```

---

## 🔧 **Common Gotchas**

### **1. Hydration Mismatches**
```tsx
// Problem: Server renders one thing, client renders another
// Solution: Use useState + useEffect for client-only content

'use client';
function Component() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null; // Or loading state
  
  // Now safe to use window, localStorage, etc.
}
```

### **2. window/document Access**
```tsx
// ❌ Wrong (in Server Component or during SSR)
const width = window.innerWidth;

// ✅ Correct
'use client';
function Component() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
}
```

### **3. Link Component Nesting**
```tsx
// ❌ Wrong
<Link href="/blog">
  <button>Click</button>
</Link>

// ✅ Correct
<Link href="/blog">
  <a>Click</a>  // or use legacyBehavior prop
</Link>

// Or better - style Link directly
<Link href="/blog" className="button-style">
  Click
</Link>
```

---

## ✅ **Quick Checklist**

Before starting migration:
- [ ] Read full migration plan
- [ ] Backup current codebase
- [ ] List all routes
- [ ] List all environment variables
- [ ] Document all features
- [ ] Test current app thoroughly

During migration:
- [ ] Test after each change
- [ ] Keep React app running
- [ ] Compare outputs side-by-side
- [ ] Document issues

After migration:
- [ ] All routes work
- [ ] All features work
- [ ] SEO metadata correct
- [ ] Analytics tracking
- [ ] Performance good
- [ ] No console errors

---

**Ready to start? Begin with Phase 1!**











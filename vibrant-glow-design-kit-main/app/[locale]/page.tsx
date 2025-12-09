/**
 * Server Component - Homepage Entry Point (Locale-based)
 * Fetches Strapi data and passes to client component
 */
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import HomePageClient from "../page-client";
import type { Metadata } from "next";
import { generatePageSEO } from "@/data/seoConfig";
import { getStrapiImageUrl } from "@/utils/strapi-helpers";

// Generate static params for all locales (required for Next.js dynamic routes)
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
  ];
}

// Generate metadata from Strapi SEO component
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> | { locale: string } }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);

  // Fetch SEO data from Strapi
  let seoData = null;
  try {
    const strapiData = await strapiApi.getHomePage(strapiLocale, { cache: 'no-store' });
    const attributes = strapiData?.attributes || strapiData;
    seoData = attributes?.seo;
  } catch (error) {
    console.warn('⚠️ Failed to fetch SEO data from Strapi, using defaults');
  }

  // Use Strapi SEO data if available, otherwise fallback to defaults
  const defaultSEO = generatePageSEO('/', language);
  const metaTitle = seoData?.metaTitle || defaultSEO.title;
  const metaDescription = seoData?.metaDescription || defaultSEO.description;
  const metaImage = seoData?.metaImage ? getStrapiImageUrl(seoData.metaImage) : 'https://www.smarthoster.io/og-image.jpg';
  const ogData = seoData?.openGraph;
  const ogTitle = ogData?.ogTitle || metaTitle;
  const ogDescription = ogData?.ogDescription || metaDescription;
  const ogImage = ogData?.ogImage ? getStrapiImageUrl(ogData.ogImage) : metaImage;
  const canonicalUrl = seoData?.canonicalURL || (locale === 'pt' ? '/' : `/${locale}`);

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage }],
      url: `https://www.smarthoster.io${canonicalUrl}`,
      type: 'website',
      locale: locale === 'pt' ? 'pt_PT' : locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://www.smarthoster.io${canonicalUrl}`,
      languages: {
        'en': 'https://www.smarthoster.io/en',
        'pt': 'https://www.smarthoster.io',
        'fr': 'https://www.smarthoster.io/fr',
      },
    },
  };
}

interface HomePageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

export default async function HomePage({ params }: HomePageProps) {
  console.log('🔍 [HOME PAGE] Starting...');
  console.log('🔍 [HOME PAGE] Raw params type:', params instanceof Promise ? 'Promise' : typeof params);
  
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  // MUST await params before using it (Next.js 15+ requirement)
  const resolvedParams = params instanceof Promise ? await params : params;
  console.log('🔍 [HOME PAGE] Resolved params:', JSON.stringify(resolvedParams, null, 2));
  
  // Get locale from URL params, default to 'pt' if not provided
  const locale = resolvedParams?.locale || 'pt';
  console.log('🔍 [HOME PAGE] Extracted locale:', locale);
  
  // Validate locale (must be en, pt, or fr)
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);
  
  // Fetch homepage data from Strapi with locale
  let strapiData = null;
  try {
    strapiData = await strapiApi.getHomePage(strapiLocale, {
      cache: 'no-store' // Fresh data for development
    });
    
    // All sections successfully connected to Strapi! ✅
    // Check for attributes wrapper (Strapi v5 structure)
    if (strapiData?.attributes) {
      strapiData = strapiData.attributes;
    }
    
    console.log(`📊 Server: Home Page Strapi Data Received (locale: ${locale}):`);
    console.log('- locale:', locale, '→ Strapi locale:', strapiLocale);
    console.log('- hasData:', !!strapiData);
  } catch (error) {
    // Silently fail - components will use fallback translations
    // Network errors are expected if Strapi is unavailable
    console.warn(`⚠️ Server: Failed to fetch Strapi data for locale ${locale}:`, error);
  }
  
  return <HomePageClient strapiData={strapiData} />;
}


/**
 * Server Component - About Page Entry Point (Locale-based)
 * Fetches Strapi data and passes to client component
 */
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import AboutPageClient from "../../about/page-client";
import { headers } from 'next/headers';

// Generate static params for all locales (required for Next.js dynamic routes)
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
  ];
}

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  console.log('🔍 [ABOUT PAGE] ========================================');
  console.log('🔍 [ABOUT PAGE] Starting...');
  
  // Try to get actual URL from headers
  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || 'unknown';
    console.log('🔍 [ABOUT PAGE] Headers pathname/referer:', pathname);
  } catch (e) {
    console.log('🔍 [ABOUT PAGE] Could not read headers:', e);
  }
  
  console.log('🔍 [ABOUT PAGE] Raw params type:', params instanceof Promise ? 'Promise' : typeof params);
  
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  // MUST await params before using it (Next.js 15+ requirement)
  const resolvedParams = params instanceof Promise ? await params : params;
  console.log('🔍 [ABOUT PAGE] Resolved params:', JSON.stringify(resolvedParams, null, 2));
  console.log('🔍 [ABOUT PAGE] Resolved params.locale:', resolvedParams?.locale);
  console.log('🔍 [ABOUT PAGE] Resolved params type:', typeof resolvedParams);
  console.log('🔍 [ABOUT PAGE] Resolved params keys:', Object.keys(resolvedParams || {}));
  
  // CRITICAL: Check if params.locale matches what we expect from URL
  // If URL is /en/about but params.locale is 'pt', there's a routing bug
  const localeFromParams = resolvedParams?.locale;
  console.log('🔍 [ABOUT PAGE] ⚠️ LOCALE MISMATCH CHECK:');
  console.log('  - Params.locale:', localeFromParams);
  console.log('  - Expected from URL /en/about: "en"');
  console.log('  - If mismatch, Next.js routing is broken!');
  
  // Get locale from URL params, default to 'pt' if not provided
  const locale = resolvedParams?.locale || 'pt';
  console.log('🔍 [ABOUT PAGE] Extracted locale:', locale);
  console.log('🔍 [ABOUT PAGE] ========================================');
  
  // Validate locale (must be en, pt, or fr)
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);
  
  console.log('🔍 [ABOUT PAGE] Final values:');
  console.log('  - URL locale:', locale);
  console.log('  - Valid locale:', validLocale);
  console.log('  - Language:', language);
  console.log('  - Strapi locale:', strapiLocale);
  console.log('  - API will be called with locale:', strapiLocale);
  
  // Fetch about page data from Strapi with locale
  let strapiData = null;
  try {
    console.log('🔍 [ABOUT PAGE] Calling strapiApi.getAboutPage with:', { locale: strapiLocale, cache: 'no-store' });
    strapiData = await strapiApi.getAboutPage(strapiLocale, {
      cache: 'no-store' // Fresh data for development
    });
    
    console.log('🔍 [ABOUT PAGE] Raw Strapi response:', JSON.stringify(strapiData, null, 2));
    
    // Check for attributes wrapper (Strapi v5 structure)
    if (strapiData?.attributes) {
      strapiData = strapiData.attributes;
      console.log('🔍 [ABOUT PAGE] Unwrapped attributes');
    }
    
    // Detailed debug logging
    console.log(`📊 [ABOUT PAGE] Strapi Data Received (locale: ${locale}):`);
    console.log('  - URL locale:', locale);
    console.log('  - Strapi locale used:', strapiLocale);
    console.log('  - Has data:', !!strapiData);
    console.log('  - Data keys:', Object.keys(strapiData || {}));
    console.log('  - hero exists:', !!strapiData?.hero);
    if (strapiData?.hero) {
      console.log('    - hero.title:', strapiData.hero.title || 'MISSING');
      console.log('    - hero.description:', strapiData.hero.description ? 'EXISTS' : 'MISSING');
    }
    console.log('  - missionVision exists:', !!strapiData?.missionVision);
    console.log('  - originStory exists:', !!strapiData?.originStory);
    console.log('  - coreValues exists:', !!strapiData?.coreValues);
    if (strapiData?.coreValues) {
      console.log('    - coreValues.values count:', strapiData.coreValues.values?.length || 0);
    }
    console.log('  - team exists:', !!strapiData?.team);
    if (strapiData?.team) {
      console.log('    - team.members count:', strapiData.team.members?.length || 0);
    }
    console.log('  - sustainability exists:', !!strapiData?.sustainability);
    console.log('  - cta exists:', !!strapiData?.cta);
    
    // Show sample of actual content
    if (strapiData?.hero?.title) {
      console.log('  - Sample hero title:', strapiData.hero.title.substring(0, 50));
    }
  } catch (error: any) {
    console.error(`❌ [ABOUT PAGE] Error fetching Strapi data for locale ${locale}:`);
    console.error('  - Error message:', error?.message);
    console.error('  - Error stack:', error?.stack?.substring(0, 200));
    console.error('  - Full error:', JSON.stringify(error, null, 2));
  }
  
  console.log('🔍 [ABOUT PAGE] Passing to client component. strapiData exists:', !!strapiData);
  return <AboutPageClient strapiData={strapiData} />;
}


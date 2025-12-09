/**
 * Server Component - Pricing Page Entry Point (Locale-based)
 * Fetches Strapi data and passes to client component
 */
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import PricingPageClient from "../../pricing/page-client";

// Generate static params for all locales (required for Next.js dynamic routes)
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
  ];
}

interface PricingPageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

export default async function PricingPage({ params }: PricingPageProps) {
  console.log('🔍 [PRICING PAGE] Starting...');
  console.log('🔍 [PRICING PAGE] Raw params type:', params instanceof Promise ? 'Promise' : typeof params);
  
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  // MUST await params before using it (Next.js 15+ requirement)
  const resolvedParams = params instanceof Promise ? await params : params;
  console.log('🔍 [PRICING PAGE] Resolved params:', JSON.stringify(resolvedParams, null, 2));
  
  // Get locale from URL params, default to 'pt' if not provided
  const locale = resolvedParams?.locale || 'pt';
  console.log('🔍 [PRICING PAGE] Extracted locale:', locale);
  
  // Validate locale (must be en, pt, or fr)
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);
  
  console.log('🔍 [PRICING PAGE] Final values:');
  console.log('  - URL locale:', locale);
  console.log('  - Valid locale:', validLocale);
  console.log('  - Language:', language);
  console.log('  - Strapi locale:', strapiLocale);
  console.log('  - API will be called with locale:', strapiLocale);
  
  // Fetch pricing page data from Strapi with locale
  let strapiData = null;
  try {
    console.log('🔍 [PRICING PAGE] Calling strapiApi.getPricingPage with:', { locale: strapiLocale, cache: 'no-store' });
    strapiData = await strapiApi.getPricingPage(strapiLocale, {
      cache: 'no-store' // Fresh data for development
    });
    
    console.log('🔍 [PRICING PAGE] Raw Strapi response:', JSON.stringify(strapiData, null, 2));
    
    // Check for attributes wrapper (Strapi v5 structure)
    if (strapiData?.attributes) {
      strapiData = strapiData.attributes;
      console.log('🔍 [PRICING PAGE] Unwrapped attributes');
    }
    
    console.log(`📊 [PRICING PAGE] Strapi Data Received (locale: ${locale}):`);
    console.log('  - URL locale:', locale);
    console.log('  - Strapi locale used:', strapiLocale);
    console.log('  - Has data:', !!strapiData);
    console.log('  - Data keys:', Object.keys(strapiData || {}));
    console.log('  - heroTitle:', strapiData?.heroTitle || 'MISSING');
    console.log('  - heroSubtitle:', strapiData?.heroSubtitle ? 'EXISTS' : 'MISSING');
    console.log('  - basicPlan exists:', !!strapiData?.basicPlan);
    console.log('  - premiumPlan exists:', !!strapiData?.premiumPlan);
    console.log('  - trustPoints count:', strapiData?.trustPoints?.length || 0);
    
    // Show sample of actual content
    if (strapiData?.heroTitle) {
      console.log('  - Sample heroTitle:', strapiData.heroTitle.substring(0, 50));
    }
  } catch (error: any) {
    console.error(`❌ [PRICING PAGE] Error fetching Strapi data for locale ${locale}:`);
    console.error('  - Error message:', error?.message);
    console.error('  - Error stack:', error?.stack?.substring(0, 200));
    console.error('  - Full error:', JSON.stringify(error, null, 2));
  }
  
  console.log('🔍 [PRICING PAGE] Passing to client component. strapiData exists:', !!strapiData);
  return <PricingPageClient strapiData={strapiData} />;
}


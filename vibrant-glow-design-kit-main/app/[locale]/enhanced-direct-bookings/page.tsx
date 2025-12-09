/**
 * Server Component - Enhanced Direct Bookings Page Entry Point (Locale-based)
 */
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import EnhancedDirectBookingsPageClient from "../../enhanced-direct-bookings/page-client";

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'fr' },
  ];
}

interface PageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

export default async function EnhancedDirectBookingsPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);

  let strapiData = null;
  try {
    strapiData = await strapiApi.getEnhancedDirectBookingsPage(strapiLocale, {
      cache: 'no-store'
    });
    
    if (strapiData?.attributes) {
      strapiData = strapiData.attributes;
    }
    
    console.log(`📊 Server: Enhanced Direct Bookings Strapi Data (locale: ${locale}):`);
    console.log('- locale:', locale, '→ Strapi locale:', strapiLocale);
    console.log('- hero:', !!strapiData?.hero, strapiData?.hero?.headline || 'no headline');
    console.log('- whatWeDo:', !!strapiData?.whatWeDo, strapiData?.whatWeDo?.title || 'no title');
    console.log('- includes:', !!strapiData?.includes, strapiData?.includes?.features?.length || 0, 'features');
    console.log('- benefits:', !!strapiData?.benefits, strapiData?.benefits?.title || 'no title');
    console.log('- howItWorks:', !!strapiData?.howItWorks, strapiData?.howItWorks?.features?.length || 0, 'features');
    console.log('- steps:', strapiData?.steps?.length || 0, 'steps');
    console.log('- faqs:', strapiData?.faqs?.length || 0, 'faqs');
    console.log('- cta:', !!strapiData?.cta, strapiData?.cta?.title || 'no title');
  } catch (error) {
    console.warn(`⚠️ Server: Failed to fetch Strapi data for locale ${locale}:`, error);
  }

  return <EnhancedDirectBookingsPageClient strapiData={strapiData} />;
}


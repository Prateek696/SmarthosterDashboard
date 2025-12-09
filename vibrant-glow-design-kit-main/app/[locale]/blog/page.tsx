/**
 * Server Component - Blog List Page (Locale-based)
 * Fetches Strapi data server-side and passes to client component
 */
import Blog from "@/pages-old/Blog";
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

// Generate metadata for blog list page
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  
  const titles = {
    en: 'Blog - SmartHoster.io | Property Management & Airbnb Tips',
    pt: 'Blog - SmartHoster.io | Dicas de Gestão de Propriedades e Airbnb',
    fr: 'Blog - SmartHoster.io | Conseils de Gestion Immobilière et Airbnb'
  };
  
  const descriptions = {
    en: 'Read our latest blog posts about property management, Airbnb hosting, and short-term rental optimization in Portugal.',
    pt: 'Leia os nossos últimos artigos sobre gestão de propriedades, hospedagem Airbnb e otimização de alojamento local em Portugal.',
    fr: 'Lisez nos derniers articles sur la gestion immobilière, l\'hébergement Airbnb et l\'optimisation des locations de courte durée au Portugal.'
  };
  
  return {
    title: titles[language],
    description: descriptions[language],
    openGraph: {
      title: titles[language],
      description: descriptions[language],
      url: `https://www.smarthoster.io/${locale === 'en' ? '' : locale + '/'}blog`,
      type: 'website',
      locale: locale === 'pt' ? 'pt_PT' : locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    alternates: {
      canonical: `https://www.smarthoster.io/${locale === 'en' ? '' : locale + '/'}blog`,
    },
  };
}

export default async function LocaleBlogPage({ params }: BlogPageProps) {
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  
  // Validate locale
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);
  
  // Fetch Strapi posts server-side (fixes CORS issue)
  // Use no-store to ensure fresh data on every request (no caching)
  let strapiPosts = [];
  try {
    const response = await strapiApi.getBlogs({ locale: strapiLocale });
    strapiPosts = response.data || [];
    console.log(`📊 Server: Fetched ${strapiPosts.length} Strapi posts for locale ${locale}`);
  } catch (error) {
    console.warn(`⚠️ Failed to fetch Strapi blog posts for locale ${locale}:`, error);
    strapiPosts = [];
  }
  
  return <Blog slug={undefined} locale={validLocale} initialStrapiPosts={strapiPosts} />;
}


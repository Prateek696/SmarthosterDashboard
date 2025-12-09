/**
 * Server Component - Blog Post Detail Page (Locale-based)
 * Fetches Strapi data server-side and passes to client component
 */
import Blog from "@/pages-old/Blog";
import { strapiApi } from "@/services/strapi.api";
import { mapToStrapiLocale } from "@/utils/strapi-helpers";
import { getStrapiImageUrl } from "@/utils/strapi-helpers";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface BlogSlugPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }> | {
    locale: string;
    slug: string;
  };
}

// Generate metadata from Strapi SEO component
export async function generateMetadata({ params }: BlogSlugPageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  const slug = resolvedParams?.slug || '';
  
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);

  // Fetch blog post from Strapi for metadata
  let seoData = null;
  let openGraphData = null;
  let postTitle = 'Blog Post';
  let postExcerpt = '';
  let postImage = 'https://www.smarthoster.io/og-image.jpg';
  let postData = null; // Declare postData outside try block to fix scope issue
  
  try {
    const post = await strapiApi.getBlogBySlug(slug, strapiLocale);
    if (post) {
      // Strapi v5 uses flat structure (no attributes wrapper) when using populate=*
      // But check both structures to be safe
      postData = post.attributes || post;
      postTitle = postData.title || 'Blog Post';
      postExcerpt = postData.excerpt || '';
      postImage = getStrapiImageUrl(postData.coverImage) || postImage;
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [generateMetadata] Post data keys:', Object.keys(postData));
        console.log('🔍 [generateMetadata] Has SEO:', !!postData.seo);
        console.log('🔍 [generateMetadata] SEO type:', typeof postData.seo);
        if (postData.seo) {
          console.log('🔍 [generateMetadata] SEO is array:', Array.isArray(postData.seo));
          console.log('🔍 [generateMetadata] SEO length:', Array.isArray(postData.seo) ? postData.seo.length : 'N/A');
        }
      }
      
      // Get SEO data from Strapi (seo is a repeatable component, so it's an array)
      // Use the first SEO entry if available
      if (postData.seo) {
        if (Array.isArray(postData.seo) && postData.seo.length > 0) {
          seoData = postData.seo[0];
          // openGraph is a nested component within SEO
          openGraphData = seoData.openGraph;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [generateMetadata] Using SEO data:', {
              metaTitle: seoData.metaTitle,
              metaDescription: seoData.metaDescription?.substring(0, 50),
              hasOpenGraph: !!openGraphData,
              openGraphType: typeof openGraphData,
              openGraphKeys: openGraphData ? Object.keys(openGraphData) : []
            });
            
            // Log full openGraph structure if available
            if (openGraphData) {
              console.log('📊 [generateMetadata] OpenGraph data:', {
                ogTitle: openGraphData.ogTitle,
                ogDescription: openGraphData.ogDescription?.substring(0, 50),
                ogImage: openGraphData.ogImage,
                ogUrl: openGraphData.ogUrl,
                ogType: openGraphData.ogType
              });
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [generateMetadata] SEO is not an array or is empty');
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [generateMetadata] No SEO component in post data');
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [generateMetadata] Post is null');
      }
    }
  } catch (error) {
    console.error('❌ [generateMetadata] Error:', error);
    if (error instanceof Error) {
      console.error('❌ [generateMetadata] Error stack:', error.stack);
    }
  }

  // Use Strapi SEO data if available, otherwise use post data
  const metaTitle = seoData?.metaTitle || postTitle;
  const metaDescription = seoData?.metaDescription || postExcerpt || 'Read our latest blog post';
  // Priority: SEO metaImage > OpenGraph ogImage > coverImage > default
  // Use postData?.coverImage if available, otherwise fallback to postImage (already set from postData.coverImage or default)
  const ogImage = seoData?.metaImage 
    ? getStrapiImageUrl(seoData.metaImage) 
    : (openGraphData?.ogImage 
        ? getStrapiImageUrl(openGraphData.ogImage) 
        : (postData?.coverImage ? getStrapiImageUrl(postData.coverImage) : postImage));
  const canonicalUrl = seoData?.canonicalURL || `/${locale}/blog/${slug}`;
  const ogTitle = openGraphData?.ogTitle || seoData?.metaTitle || metaTitle;
  const ogDescription = openGraphData?.ogDescription || seoData?.metaDescription || metaDescription;
  const ogUrl = openGraphData?.ogUrl || `https://www.smarthoster.io${canonicalUrl}`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage }],
      url: ogUrl,
      type: openGraphData?.ogType || 'article',
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
    },
  };
}

export default async function LocaleBlogSlugPage({ params }: BlogSlugPageProps) {
  // Handle params as Promise (Next.js 15+) or object (Next.js 14)
  const resolvedParams = params instanceof Promise ? await params : params;
  const locale = resolvedParams?.locale || 'pt';
  const slug = resolvedParams?.slug || '';
  
  // Validate locale
  const validLocale = (locale === 'en' || locale === 'pt' || locale === 'fr') ? locale : 'pt';
  const language = validLocale as 'en' | 'pt' | 'fr';
  const strapiLocale = mapToStrapiLocale(language);
  
  // Fetch Strapi post by slug server-side (fixes CORS issue)
  let strapiPostBySlug = null;
  try {
    const response = await strapiApi.getBlogBySlug(slug, strapiLocale);
    // getBlogBySlug returns the post object directly (or null), not wrapped in data
    strapiPostBySlug = response || null;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch Strapi blog post by slug ${slug} for locale ${locale}:`, error);
    strapiPostBySlug = null;
  }
  
  return <Blog slug={slug} locale={validLocale} initialStrapiPostBySlug={strapiPostBySlug} />;
}


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogPost from '@/components/blog/BlogPost';
import { useLanguage } from '@/contexts/LanguageContext';
import { allBlogPosts, blogCategories } from '@/data/blogPostsUpdated';
import { blogCategoriesPt } from '@/data/blogPostsPt';
import { blogCategoriesFr } from '@/data/blogPostsFr';
import { runBlogLanguageAudit } from '@/utils/auditBlogLanguages';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { strapiApi } from '@/services/strapi.api';
import { supabase } from '@/integrations/supabase/client';
import { analytics, useScrollDepthTracking } from '@/utils/analytics';
import { usePathname } from '@/utils/next-compat';
import { getStrapiImageUrl } from '@/utils/strapi-helpers';

// Helper function to transform Strapi post data to blog post format
const transformStrapiPost = (item: any) => {
  // Handle both Strapi v4 and v5 data structures
  const attributes = item.attributes || item;
  const itemId = item.id || attributes.id;
  
  // Fix date parsing - use publishedDate first, then publishedAt, then createdAt
  let publishedDate = null;
  if (attributes.publishedDate) {
    publishedDate = new Date(attributes.publishedDate).toISOString();
  } else if (attributes.publishedAt) {
    publishedDate = new Date(attributes.publishedAt).toISOString();
  } else if (attributes.createdAt) {
    publishedDate = new Date(attributes.createdAt).toISOString();
  } else {
    publishedDate = new Date().toISOString();
  }
  
  // Handle author field - can be string or object
  let authorData;
  if (typeof attributes.author === 'string') {
    authorData = {
      name: attributes.author,
      bio: 'SmartHoster Team Member',
      avatar: '/placeholder.svg'
    };
  } else if (attributes.author?.name) {
    authorData = attributes.author;
  } else {
    authorData = {
      name: 'SmartHoster Team',
      bio: 'SmartHoster Team Member',
      avatar: '/placeholder.svg'
    };
  }
  
  // Handle image URL using helper function
  const getImageUrl = () => {
    const imageUrl = getStrapiImageUrl(attributes.coverImage);
    return imageUrl || 'https://res.cloudinary.com/dd5notzuv/image/upload/c_fill,w_400,h_250/v1761401047/Real-logo_aaqxgq.jpg';
  };
  
  return {
    id: `strapi-${itemId}`,
    title: attributes.title || 'Untitled',
    slug: attributes.slug || `blog-${itemId}`,
    excerpt: attributes.excerpt || 'No excerpt available',
    content: attributes.content || 'No content available',
    author: authorData,
    publishedAt: publishedDate,
    updatedAt: attributes.updatedAt || publishedDate,
    date: publishedDate,
    // Extract SEO component data if available (seo is a repeatable component, so it's an array)
    // Use the first SEO entry if available
    metaTitle: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.metaTitle : attributes.seo?.metaTitle) || attributes.title,
    metaDescription: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.metaDescription : attributes.seo?.metaDescription) || attributes.excerpt || '',
    seoTitle: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.metaTitle : attributes.seo?.metaTitle) || attributes.title,
    ogImage: getStrapiImageUrl((Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.metaImage : attributes.seo?.metaImage)) || getImageUrl(),
    canonicalUrl: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.canonicalURL : attributes.seo?.canonicalURL) || `/blog/${attributes.slug}`,
    keywords: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.keywords : attributes.seo?.keywords) || attributes.tags,
    metaRobots: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.metaRobots : attributes.seo?.metaRobots) || 'INDEX,FOLLOW',
    structuredData: (Array.isArray(attributes.seo) && attributes.seo.length > 0 ? attributes.seo[0]?.structuredData : attributes.seo?.structuredData) || null,
    category: attributes.category || 'General',
    tags: attributes.tags ? 
      (typeof attributes.tags === 'string' 
        ? attributes.tags.split(',').map((tag: string) => tag.trim())
        : Array.isArray(attributes.tags) 
          ? attributes.tags
          : [])
      : [],
    readTime: parseInt(attributes.readTime) || 5,
    featuredImage: getImageUrl(),
    image: getImageUrl(),
    featured: attributes.featured || false,
    isDraft: false,
    isStrapi: true
  };
};

interface BlogProps {
  slug?: string;
  locale?: string;
  initialStrapiPosts?: any[];
  initialStrapiPostBySlug?: any;
}

const Blog = ({ 
  slug: slugProp, 
  locale: localeProp,
  initialStrapiPosts = [],
  initialStrapiPostBySlug = null
}: BlogProps = { slug: undefined, locale: undefined }) => {
  const slug = slugProp;
  // Get pathname for analytics - use Next.js hook (must be called unconditionally)
  const nextPathname = usePathname();
  const pathname = typeof nextPathname === 'string' ? nextPathname : '/blog';
  const { currentLanguage } = useLanguage();
  // Use locale from prop (URL) if provided, otherwise fall back to context
  const locale = localeProp || currentLanguage;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedPosts, setGeneratedPosts] = useState([]);
  // Initialize with server-fetched data, but allow client-side updates
  const [strapiPosts, setStrapiPosts] = useState(() => {
    // Transform initial server-fetched posts to match client format
    if (!initialStrapiPosts || initialStrapiPosts.length === 0) return [];
    return initialStrapiPosts.map((item: any) => transformStrapiPost(item));
  });
  const [strapiPostBySlug, setStrapiPostBySlug] = useState<any>(() => {
    // Transform initial server-fetched post to match client format
    if (!initialStrapiPostBySlug) return null;
    return transformStrapiPost(initialStrapiPostBySlug);
  });

  // Track page analytics
  useScrollDepthTracking(pathname);

  // Memoize fetch functions to prevent stale closures
  const fetchGeneratedContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('status', 'published')
        .eq('language', locale)
        .order('published_at', { ascending: false });

      if (error) {
        // Only log non-network errors (network errors are expected if Supabase is unavailable)
        if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          console.warn('Supabase query error:', error.message);
        }
        setGeneratedPosts([]);
        return;
      }

      // Transform generated content to match blog post format
      const transformedPosts = (data || []).map(item => ({
        id: `generated-${item.id}`,
        title: item.title,
        slug: item.slug,
        excerpt: item.meta_description || item.ai_snippet || item.content.substring(0, 160) + '...',
        content: item.content,
        author: 'SmartHoster Team',
        date: item.published_at || item.created_at,
        category: item.category || 'General',
        tags: item.keywords || [],
        readTime: Math.ceil(item.content.length / 1000) + ' min read',
        image: item.featured_image_url || '/placeholder.svg',
        metaTitle: item.meta_title,
        metaDescription: item.meta_description,
        schemaMarkup: item.schema_markup,
        isDraft: false,
        isGenerated: true
      }));

      setGeneratedPosts(transformedPosts);
    } catch (error: any) {
      // Silently handle network errors - Supabase may be unavailable
      // Only log unexpected errors
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError')) {
        console.warn('Unexpected error fetching generated content:', error.message);
      }
      // Set empty array to ensure app continues working
      setGeneratedPosts([]);
    }
  }, [locale]);

  const fetchStrapiPosts = useCallback(async () => {
    // Don't fetch if we already have initial data (prevents duplicate fetches)
    if (initialStrapiPosts && initialStrapiPosts.length > 0) {
      console.log('⏭️ Skipping client-side fetch - using server-side data');
      return;
    }
    
    try {
      console.log('🔍 Fetching Strapi posts (client-side)...');
      console.log('🌐 Environment:', process.env.NODE_ENV);
      console.log('🌐 Strapi URL:', process.env.NEXT_PUBLIC_STRAPI_URL);
      console.log('🌐 Current language (context):', currentLanguage);
      console.log('🌐 Locale (from URL/prop):', locale);
      
      // Map locale to Strapi locale (use locale from URL/prop, fallback to context)
      const strapiLocale = locale === 'pt' ? 'pt' : locale === 'fr' ? 'fr' : 'en';
      console.log('🌐 Strapi locale (final):', strapiLocale);
      
      // Fetch Strapi posts with locale filter (Collection Type with i18n)
      const response = await strapiApi.getBlogs({ locale: strapiLocale });
      console.log('📊 Strapi API response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response locale filter:', strapiLocale);
      
      if (response.data && response.data.length > 0) {
        // Transform Strapi posts to match blog post format using helper
        // No need to filter by language - Strapi already returns locale-specific posts
        const transformedPosts = response.data.map((item: any) => transformStrapiPost(item));
        console.log('✅ Transformed Strapi posts:', transformedPosts);
        setStrapiPosts(transformedPosts);
      } else {
        console.log('⚠️ No Strapi posts found');
        setStrapiPosts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching Strapi posts:', error);
      setStrapiPosts([]);
    }
  }, [locale, initialStrapiPosts]);

  // Fetch individual blog post by slug from Strapi (if slug is provided)
  const fetchStrapiPostBySlug = useCallback(async (postSlug: string) => {
    if (!postSlug) return;
    
    try {
      const strapiLocale = locale === 'pt' ? 'pt' : locale === 'fr' ? 'fr' : 'en';
      console.log('🔍 Fetching Strapi post by slug:', postSlug, 'locale:', strapiLocale);
      
      const post = await strapiApi.getBlogBySlug(postSlug, strapiLocale);
      console.log('📊 Strapi post by slug response:', post);
      
      if (post) {
        // Transform using helper function
        const transformedPost = transformStrapiPost(post);
        setStrapiPostBySlug(transformedPost);
      } else {
        setStrapiPostBySlug(null);
      }
    } catch (error) {
      console.error('❌ Error fetching Strapi post by slug:', error);
      setStrapiPostBySlug(null);
    }
  }, [locale]);

  // Fetch generated content and Strapi posts from database
  useEffect(() => {
    fetchGeneratedContent();
    
    // Only fetch Strapi posts client-side if we don't have initial data (avoids CORS and duplicate fetches)
    // Initial data is fetched server-side and passed as props
    // fetchStrapiPosts now checks internally if initialStrapiPosts exists
    fetchStrapiPosts();
    
    // If slug is provided, only fetch client-side if we don't have initial post data
    if (slug) {
      if (!initialStrapiPostBySlug) {
        fetchStrapiPostBySlug(slug);
      }
    } else {
      setStrapiPostBySlug(null);
    }
    
    // Track page view
    analytics.trackPageView(pathname, `Blog - ${locale.toUpperCase()}`);
  }, [locale, pathname, slug, fetchGeneratedContent, fetchStrapiPosts, fetchStrapiPostBySlug, initialStrapiPosts, initialStrapiPostBySlug]);

  // ONLY show Strapi posts - ignore static and generated posts
  // Use a Map to deduplicate posts by slug (ensures only one post per slug)
  // Also track by ID to handle edge cases where same slug might have different IDs
  const postsMap = new Map<string, any>();
  const postsById = new Map<number, any>();
  
  // Helper to normalize slug
  const normalizeSlug = (slug: string) => slug?.toLowerCase().trim() || '';
  
  // 1. Add Strapi posts (only source we want to show)
  // Prioritize posts with more recent publishedAt dates if duplicates exist
  strapiPosts.forEach(post => {
    if (!post?.slug) return;
    
    const normalizedSlug = normalizeSlug(post.slug);
    const existingPost = postsMap.get(normalizedSlug);
    
    // If duplicate slug, keep the one with more recent publishedAt
    if (existingPost) {
      const existingDate = existingPost.publishedAt || existingPost.publishedDate || '';
      const newDate = post.publishedAt || post.publishedDate || '';
      if (newDate > existingDate) {
        // Remove old post from ID map if it exists
        if (existingPost.id && postsById.has(existingPost.id)) {
          postsById.delete(existingPost.id);
        }
        postsMap.set(normalizedSlug, post);
        if (post.id) postsById.set(post.id, post);
      }
      // Otherwise keep existing post
    } else {
      postsMap.set(normalizedSlug, post);
      if (post.id) postsById.set(post.id, post);
    }
  });
  
  // 2. Add strapiPostBySlug if it exists and not already in map
  if (strapiPostBySlug?.slug) {
    const normalizedSlug = normalizeSlug(strapiPostBySlug.slug);
    const existingPost = postsMap.get(normalizedSlug);
    
    // Only add if not already in map (by slug) and not in ID map
    if (!existingPost && (!strapiPostBySlug.id || !postsById.has(strapiPostBySlug.id))) {
      postsMap.set(normalizedSlug, strapiPostBySlug);
      if (strapiPostBySlug.id) postsById.set(strapiPostBySlug.id, strapiPostBySlug);
    }
  }
  
  // Convert map to array - ONLY Strapi posts, no static or generated posts
  const currentPosts = Array.from(postsMap.values());
  
  // Debug: Log Strapi posts only
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Blog Posts (Strapi Only):');
    console.log('  - Strapi posts:', strapiPosts.length);
    console.log('  - Final unique posts:', currentPosts.length);
    console.log('  - Post slugs:', currentPosts.map(p => p.slug));
  }
  
  const currentCategories = locale === 'pt' ? blogCategoriesPt 
    : locale === 'fr' ? blogCategoriesFr 
    : blogCategories;
  
  // Run audit in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !slug) {
      runBlogLanguageAudit();
    }
  }, [slug]);

  // If slug is provided, show individual blog post
  if (slug) {
    const post = currentPosts.find(p => p.slug === slug);
    if (!post) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {locale === 'pt' ? 'Artigo Não Encontrado' 
                : locale === 'fr' ? 'Article Non Trouvé' 
                : 'Post Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {locale === 'pt' ? 'O artigo que procura não existe.' 
                : locale === 'fr' ? 'L\'article que vous cherchez n\'existe pas.' 
                : 'The blog post you\'re looking for doesn\'t exist.'}
            </p>
            <Button asChild>
              <a href={locale === 'en' ? '/en/blog' : `/${locale}/blog`}>
                {locale === 'pt' ? 'Voltar ao Blog' 
                  : locale === 'fr' ? 'Retour au Blog' 
                  : 'Back to Blog'}
              </a>
            </Button>
          </div>
        </Layout>
      );
    }

    // Get related posts from same category
    const relatedPosts = currentPosts
      .filter(p => p.category === post.category && p.id !== post.id)
      .slice(0, 2);

    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <BlogPost post={post} relatedPosts={relatedPosts} />
        </div>
      </Layout>
    );
  }

  // Filter posts based on search and category
  const filteredPosts = currentPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory && !post.isDraft;
  });

  const getTitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Blog SmartHoster';
      case 'fr': return 'Blog SmartHoster';
      default: return 'SmartHoster Blog';
    }
  };

  const getSubtitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Insights especializados, dicas e estratégias para gestão de propriedades bem-sucedida e otimização da hospitalidade.';
      case 'fr': return 'Conseils d\'experts, astuces et stratégies pour une gestion immobilière réussie et l\'optimisation de l\'hospitalité.';
      default: return 'Expert insights, tips, and strategies for successful property management and hospitality optimization.';
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentLanguage) {
      case 'pt': return 'Pesquisar artigos...';
      case 'fr': return 'Rechercher des articles...';
      default: return 'Search articles...';
    }
  };

  const getAllCategoriesLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Todas as Categorias';
      case 'fr': return 'Toutes les Catégories';
      default: return 'All Categories';
    }
  };

  const getAllArticlesLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Todos os Artigos';
      case 'fr': return 'Tous les Articles';
      default: return 'All Articles';
    }
  };

  const getResultsText = () => {
    const count = filteredPosts.length;
    const article = count !== 1 ? 's' : '';
    switch (currentLanguage) {
      case 'pt': return `${count} artigo${article} encontrado${article}`;
      case 'fr': return `${count} article${article} trouvé${article}`;
      default: return `${count} article${article} found`;
    }
  };

  const getNoResultsText = () => {
    switch (currentLanguage) {
      case 'pt': return {
        title: 'Nenhum artigo encontrado',
        subtitle: 'Tente ajustar seus critérios de pesquisa ou filtro.',
        button: 'Limpar Filtros'
      };
      case 'fr': return {
        title: 'Aucun article trouvé',
        subtitle: 'Essayez d\'ajuster vos critères de recherche ou de filtrage.',
        button: 'Effacer les Filtres'
      };
      default: return {
        title: 'No articles found',
        subtitle: 'Try adjusting your search or filter criteria.',
        button: 'Clear Filters'
      };
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getSubtitle()}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 2) {
                  analytics.trackSearch(e.target.value, filteredPosts.length, currentLanguage);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                analytics.trackFilter('category', e.target.value, currentLanguage);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-transparent"
            >
              <option value="all">{getAllCategoriesLabel()}</option>
              {currentCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#5FFF56] text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getAllArticlesLabel()}
          </button>
          {currentCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-[#5FFF56] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {getResultsText()}
          </p>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length > 0 ? (
          <BlogGrid posts={filteredPosts} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{getNoResultsText().title}</h3>
            <p className="text-gray-600 mb-6">{getNoResultsText().subtitle}</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              {getNoResultsText().button}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;

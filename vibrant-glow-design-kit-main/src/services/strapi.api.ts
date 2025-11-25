// Ensure URL doesn't have trailing slash
const getStrapiUrl = () => {
  const url = import.meta.env.VITE_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const STRAPI_URL = getStrapiUrl();

export const strapiApi = {
  // Get all blog posts
  async getBlogs(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
    locale?: string; // Strapi locale code (en, pt, fr)
  }) {
    try {
      // Strapi v5 populate syntax - use '*' for all first-level relations
      // For nested components, specify them explicitly
      // Build query string manually to handle nested brackets correctly
      const queryParams = [
        `pagination[page]=${params?.page || 1}`,
        `pagination[pageSize]=${params?.pageSize || 50}`,
        `sort=${params?.sort || 'publishedAt:desc'}`,
        'populate=*',
        'populate[seo][populate]=*',
        'populate[coverImage][populate]=*',
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (params?.locale) {
        queryParams.push(`locale=${params.locale}`);
      }
      
      // Strapi v5 returns only published content by default
      // No need to filter - drafts are automatically excluded
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Strapi API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  },

  // Get single blog post by slug
  async getBlogBySlug(slug: string, locale?: string) {
    try {
      // Build query string manually to handle nested brackets correctly
      const queryParams = [
        `filters[slug][$eq]=${encodeURIComponent(slug)}`,
        'populate=*',
        'populate[seo][populate]=*',
        'populate[coverImage][populate]=*',
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      // Strapi v5 returns only published content by default
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  },

  // Get blog by ID
  async getBlogById(id: string) {
    try {
      // Build query string manually to handle nested brackets correctly
      const queryParams = [
        'populate=*',
        'populate[seo][populate]=*',
        'populate[coverImage][populate]=*',
      ];
      
      const response = await fetch(`${STRAPI_URL}/api/blogs/${id}?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
  },

  // Search blogs by query
  async searchBlogs(query: string) {
    try {
      // Build query string manually to handle nested brackets correctly
      const encodedQuery = encodeURIComponent(query);
      const queryParams = [
        `filters[$or][0][title][$containsi]=${encodedQuery}`,
        `filters[$or][1][excerpt][$containsi]=${encodedQuery}`,
        `filters[$or][2][content][$containsi]=${encodedQuery}`,
        'populate=*',
        'populate[seo][populate]=*',
        'populate[coverImage][populate]=*',
        'sort=publishedAt:desc',
      ];
      
      // Strapi v5 returns only published content by default
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  }
};

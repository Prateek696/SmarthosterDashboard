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
  }) {
    try {
      // Strapi v5 populate syntax - use 'deep' to populate all nested relations
      const searchParams = new URLSearchParams({
        'pagination[page]': String(params?.page || 1),
        'pagination[pageSize]': String(params?.pageSize || 50),
        'sort': params?.sort || 'publishedAt:desc',
        'populate': 'deep', // Populate all fields including nested relations
      });
      
      // Strapi v5 returns only published content by default
      // No need to filter - drafts are automatically excluded
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
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
  async getBlogBySlug(slug: string) {
    try {
      const searchParams = new URLSearchParams({
        'filters[slug][$eq]': slug,
        'populate': 'deep', // Populate all fields including nested relations
      });
      
      // Strapi v5 returns only published content by default
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
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
      const populateParams = new URLSearchParams({
        'populate': 'deep', // Populate all fields including nested relations
      });
      
      const response = await fetch(`${STRAPI_URL}/api/blogs/${id}?${populateParams}`, {
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
      const searchParams = new URLSearchParams({
        'filters[$or][0][title][$containsi]': query,
        'filters[$or][1][excerpt][$containsi]': query,
        'filters[$or][2][content][$containsi]': query,
        'populate': 'deep', // Populate all fields including nested relations
        'sort': 'publishedAt:desc'
      });
      
      // Strapi v5 returns only published content by default
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
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

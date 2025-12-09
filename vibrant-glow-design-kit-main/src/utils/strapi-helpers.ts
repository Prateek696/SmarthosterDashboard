/**
 * Helper utilities for working with Strapi CMS data
 */

// Ensure URL doesn't have trailing slash
const getStrapiUrl = () => {
  const url = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const STRAPI_URL = getStrapiUrl();

/**
 * Get full URL for Strapi media/image
 * Handles both relative and absolute URLs
 */
export const getStrapiImageUrl = (image: any): string | null => {
  if (!image) return null;
  
  // If image is already a full URL string
  if (typeof image === 'string') {
    // If it's already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // If it's a relative path, prepend Strapi URL
    if (image.startsWith('/')) {
      return `${STRAPI_URL}${image}`;
    }
    return `${STRAPI_URL}/${image}`;
  }
  
  // If image is a Strapi media object (v5 structure)
  if (image.data) {
    const imageData = Array.isArray(image.data) ? image.data[0] : image.data;
    if (imageData?.attributes?.url) {
      const url = imageData.attributes.url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${STRAPI_URL}${url.startsWith('/') ? url : `/${url}`}`;
    }
  }
  
  // If image is an attributes object directly
  if (image.attributes?.url) {
    const url = image.attributes.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${STRAPI_URL}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  // Fallback: try url property directly
  if (image.url) {
    const url = image.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${STRAPI_URL}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  return null;
};

/**
 * Get alternative text for image
 */
export const getStrapiImageAlt = (image: any): string => {
  if (!image) return '';
  
  if (typeof image === 'string') return '';
  
  if (image.data) {
    const imageData = Array.isArray(image.data) ? image.data[0] : image.data;
    return imageData?.attributes?.alternativeText || imageData?.attributes?.alt || '';
  }
  
  if (image.attributes) {
    return image.attributes.alternativeText || image.attributes.alt || '';
  }
  
  return image.alt || image.alternativeText || '';
};

/**
 * Map Strapi locale to your app's language code
 */
export const mapStrapiLocale = (locale: string): 'en' | 'pt' | 'fr' => {
  const localeMap: Record<string, 'en' | 'pt' | 'fr'> = {
    'en': 'en',
    'pt': 'pt',
    'fr': 'fr',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
  };
  
  return localeMap[locale] || 'en';
};

/**
 * Map your app's language code to Strapi locale
 */
export const mapToStrapiLocale = (language: 'en' | 'pt' | 'fr'): string => {
  const languageMap = {
    'en': 'en',
    'pt': 'pt',
    'fr': 'fr',
  };
  
  return languageMap[language] || 'en';
};

/**
 * Safely get nested property from Strapi data
 */
export const getStrapiProperty = (obj: any, path: string, fallback: any = null): any => {
  if (!obj) return fallback;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return fallback;
    }
    current = current[key];
  }
  
  return current !== null && current !== undefined ? current : fallback;
};

/**
 * Format Strapi component array (handles both array and single object)
 */
export const formatStrapiArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [data];
};

/**
 * Get text value from Strapi field (handles various structures)
 */
export const getStrapiText = (field: any, fallback: string = ''): string => {
  if (!field) return fallback;
  if (typeof field === 'string') return field;
  if (field.text) return field.text;
  if (field.content) return field.content;
  if (field.value) return field.value;
  return fallback;
};

/**
 * Extract nested component data from Strapi response
 */
export const extractComponent = (data: any, componentName: string): any => {
  if (!data) return null;
  
  // Try direct property access
  if (data[componentName]) {
    return data[componentName];
  }
  
  // Try nested in attributes
  if (data.attributes?.[componentName]) {
    return data.attributes[componentName];
  }
  
  // Try nested in data.attributes
  if (data.data?.attributes?.[componentName]) {
    return data.data.attributes[componentName];
  }
  
  return null;
};


// Ensure URL doesn't have trailing slash
const getStrapiUrl = () => {
  const url = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const STRAPI_URL = getStrapiUrl();

// Fetch with timeout to prevent hanging when Strapi is down
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // If aborted, throw a timeout error
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  }
};

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
      // NOTE: Using populate=* together with populate[seo][populate]=* causes 500 errors in Strapi
      // Use explicit populates only to avoid conflicts
      const queryParams = [
        `pagination[page]=${params?.page || 1}`,
        `pagination[pageSize]=${params?.pageSize || 50}`,
        `sort=${params?.sort || 'publishedAt:desc'}`,
        'populate[seo][populate]=*', // Explicitly populate SEO component and its nested components (openGraph)
        'publicationState=live', // Only fetch published posts
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (params?.locale) {
        queryParams.push(`locale=${params.locale}`);
      }
      
      // Add cache-busting parameter to ensure fresh data
      queryParams.push(`_t=${Date.now()}`);
      
      const response = await fetchWithTimeout(`${STRAPI_URL}/api/blogs?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data from Strapi
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Only log non-network errors (network errors are expected if Strapi is unavailable)
        if (response.status !== 0 && response.status < 500) {
          console.warn('Strapi API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 100)
          });
        }
        return { data: [], meta: {} };
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Silently handle network errors - Strapi may be unavailable
      // Only log unexpected errors
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError') &&
          !error.message.includes('Network request failed')) {
        console.warn('Unexpected error fetching Strapi blogs:', error.message);
      }
      return { data: [], meta: {} };
    }
  },

  // Get single blog post by slug
  async getBlogBySlug(slug: string, locale?: string) {
    try {
      // Build query string manually to handle nested brackets correctly
      // NOTE: Using populate=* together with populate[seo][populate]=* causes 500 errors in Strapi
      // Also, populate[coverImage] causes issues when combined with populate[seo]
      // Use only SEO populate for now - coverImage can be fetched separately if needed
      const queryParams = [
        `filters[slug][$eq]=${encodeURIComponent(slug)}`,
        'populate[seo][populate]=*', // Explicitly populate SEO component and its nested components (openGraph)
        'publicationState=live', // Only fetch published posts
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      // Add cache-busting parameter to ensure fresh data
      queryParams.push(`_t=${Date.now()}`);
      
      const url = `${STRAPI_URL}/api/blogs?${queryParams.join('&')}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [getBlogBySlug] Fetching from URL: ${url}`);
      }
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data from Strapi
      });
      
      if (!response.ok) {
        // Log error details for debugging
        if (response.status !== 404) {
          const errorText = await response.text();
          console.warn(`⚠️ Strapi API Error (${response.status}) fetching blog by slug "${slug}" (locale: ${locale}):`, errorText.substring(0, 200));
        }
        return null;
      }
      
      const data = await response.json();
      const post = data.data?.[0] || null;
      
      if (!post) {
        console.warn(`⚠️ Blog post with slug "${slug}" (locale: ${locale}) not found in Strapi`);
        return null;
      }
      
      // Debug: Log full response structure (only in development)
      if (process.env.NODE_ENV === 'development') {
        const postData = post.attributes || post;
        console.log(`🔍 [getBlogBySlug] Raw post keys for "${slug}":`, Object.keys(postData));
        console.log(`🔍 [getBlogBySlug] Full post structure (first level):`, {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          hasSeo: 'seo' in postData,
          seoType: typeof postData.seo,
          seoValue: postData.seo,
          allKeys: Object.keys(postData)
        });
        
        if (postData.seo) {
          const seoEntry = Array.isArray(postData.seo) && postData.seo.length > 0 ? postData.seo[0] : postData.seo;
          console.log(`✅ [getBlogBySlug] SEO data found for "${slug}":`, {
            hasSEO: !!postData.seo,
            isArray: Array.isArray(postData.seo),
            length: Array.isArray(postData.seo) ? postData.seo.length : 'N/A',
            firstEntry: seoEntry ? {
              metaTitle: seoEntry.metaTitle,
              hasOpenGraph: !!seoEntry.openGraph,
              openGraphKeys: seoEntry.openGraph ? Object.keys(seoEntry.openGraph) : []
            } : null
          });
        } else {
          console.warn(`⚠️ [getBlogBySlug] No SEO data found for "${slug}"`);
          console.warn(`⚠️ [getBlogBySlug] Available keys:`, Object.keys(postData));
        }
      }
      
      return post;
    } catch (error: any) {
      // Log unexpected errors (not network errors)
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError') &&
          !error.message.includes('Network request failed')) {
        console.warn(`⚠️ Unexpected error fetching blog by slug "${slug}" (locale: ${locale}):`, error.message);
      }
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
      
      const response = await fetchWithTimeout(`${STRAPI_URL}/api/blogs/${id}?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data from Strapi
      });
      
      if (!response.ok) {
        // Silently handle errors
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Silently handle network errors
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError')) {
        console.warn('Unexpected error fetching blog by ID:', error.message);
      }
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
      
      const response = await fetchWithTimeout(`${STRAPI_URL}/api/blogs?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data from Strapi
      });
      
      if (!response.ok) {
        // Silently handle errors
        return { data: [], meta: {} };
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Silently handle network errors
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError')) {
        console.warn('Unexpected error searching Strapi blogs:', error.message);
      }
      return { data: [], meta: {} };
    }
  },

  // Get Homepage content (Single Type)
  async getHomePage(locale?: string, options?: {
    cache?: RequestCache;
  }) {
    try {
      // Use explicit nested populate for repeatable components within components
      // Strapi v5 requires this format to populate nested repeatable components
      // Use explicit nested populate for repeatable components within components
      // Strapi v5 requires this format to populate nested repeatable components
      const queryParams = [
        'populate=*', // Populate all first-level fields
        'populate[heroSection][populate]=*', // Populate all hero fields
        'populate[heroSection][populate][metrics][populate]=*', // Hero metrics - explicit nested populate
        'populate[heroSection][populate][trustBadges][populate]=*', // Hero trust badges - explicit nested populate
        'populate[featuresSection][populate][features][populate]=*', // Match testimonials pattern
        'populate[aboutSection][populate][values]=*',
        'populate[aboutSection][populate][partners][populate]=*',
        'populate[integrationsSection][populate][integrationStats]=*',
        'populate[integrationsSection][populate][benefits]=*',
        'populate[testimonialsSection][populate][testimonials][populate]=*',
        'populate[successStoriesSection][populate][stories][populate]=*',
        'populate[howItWorksSection][populate][steps]=*',
        'populate[faqSection][populate][faqs]=*',
        'populate[ctaSection][populate][benefits]=*',
        'populate[contactSection][populate]=*', // Contact section
        'populate[seo][populate]=*', // SEO component
        'populate[seo][populate][openGraph][populate]=*', // Open Graph nested component
        'populate[seo][populate][metaImage]=*', // SEO meta image
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const response = await fetchWithTimeout(`${STRAPI_URL}/api/home-page?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store', // Default to no-store for instant updates
      });
      
      if (!response.ok) {
        // If we get 400, try with simpler populate
        if (response.status === 400) {
          console.log('⚠️ Deep populate failed, trying simple populate...');
          // Retry with simple populate
          const simpleParams = ['populate=*'];
          if (locale) simpleParams.push(`locale=${locale}`);
          const retryResponse = await fetchWithTimeout(`${STRAPI_URL}/api/home-page?${simpleParams.join('&')}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: options?.cache || 'no-store',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData.data || null;
          }
        }
        
        // Silently handle other errors
        if (response.status !== 0 && response.status < 500 && response.status !== 404) {
          const errorText = await response.text();
          console.warn('Strapi Homepage API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 100)
          });
        }
        return null;
      }
      
      const data = await response.json();
      // Strapi v5 Single Types return { data: {...} } structure
      const result = data.data || null;
      
      return result;
    } catch (error: any) {
      // Silently handle network errors - Strapi may be unavailable
      // Only log unexpected errors
      if (error?.message && 
          !error.message.includes('Failed to fetch') && 
          !error.message.includes('ERR_NAME_NOT_RESOLVED') &&
          !error.message.includes('NetworkError') &&
          !error.message.includes('Network request failed')) {
        console.warn('Unexpected error fetching Strapi homepage:', error.message);
      }
      return null;
    }
  },

  // Get About Page content (Single Type)
  async getAboutPage(locale?: string, options?: {
    cache?: RequestCache;
  }) {
    console.log('🔍 [STRAPI API] getAboutPage called');
    console.log('  - Input locale:', locale);
    console.log('  - Locale type:', typeof locale);
    console.log('  - Options:', JSON.stringify(options, null, 2));
    
    try {
      // Use populate=* first (we know this works from testing)
      // populate=deep causes 400 errors in this Strapi setup
      let queryParams = ['populate=*'];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
        console.log('  - ✅ Locale added to query params:', locale);
      } else {
        console.log('  - ⚠️ No locale provided - will fetch default locale');
      }
      
      const apiUrl = `${STRAPI_URL}/api/about-page?${queryParams.join('&')}`;
      console.log('📡 [STRAPI API] Fetching About Page from:', apiUrl);
      console.log('  - Full URL:', apiUrl);
      console.log('  - Query params:', queryParams);
      
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store', // Default to no-store for instant updates
      });
      
      console.log('📥 About Page API Response Status:', response.status, response.statusText);
      
      // If populate=* fails, try selective nested populate using homepage pattern
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying homepage-style nested populate...');
        // Use same pattern as homepage - triple nesting for arrays, double for nested single components
        queryParams = [
          'populate=*', // Base populate
          'populate[hero][populate]=*',
          'populate[originStory][populate]=*',
          'populate[missionVision][populate]=*', // Populate missionVision component
          'populate[missionVision][populate][mission][populate]=*', // Nested mission component
          'populate[missionVision][populate][vision][populate]=*', // Nested vision component
          'populate[coreValues][populate]=*',
          'populate[coreValues][populate][values][populate]=*', // Triple nesting for repeatable arrays (like homepage)
          'populate[team][populate]=*',
          'populate[team][populate][members][populate]=*', // Triple nesting for repeatable arrays
          'populate[sustainability][populate]=*',
          'populate[sustainability][populate][features][populate]=*', // Triple nesting for repeatable arrays
          'populate[cta][populate]=*',
          'populate[seo][populate]=*', // SEO component
          'populate[seo][populate][openGraph][populate]=*', // Open Graph nested component
          'populate[seo][populate][metaImage]=*', // SEO meta image
        ];
        if (locale) queryParams.push(`locale=${locale}`);
        
        const selectiveUrl = `${STRAPI_URL}/api/about-page?${queryParams.join('&')}`;
        console.log('📡 Retry with homepage-style populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Homepage-style populate Response Status:', response.status, response.statusText);
      }
      
      // If that also fails, try with just populate for arrays (not nested single components)
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, trying arrays-only populate...');
        queryParams = [
          'populate=*',
          'populate[coreValues][populate][values]=*',
          'populate[team][populate][members]=*',
          'populate[sustainability][populate][features]=*',
        ];
        if (locale) queryParams.push(`locale=${locale}`);
        const arraysUrl = `${STRAPI_URL}/api/about-page?${queryParams.join('&')}`;
        console.log('📡 Trying arrays-only populate:', arraysUrl);
        
        response = await fetchWithTimeout(arraysUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Arrays-only populate Response Status:', response.status, response.statusText);
      }
      
      // Final fallback to simple populate=*
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Arrays-only populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/about-page?${queryParams.join('&')}`;
        
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      
      if (!response.ok) {
        // Try to get error details
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error('❌ Strapi About Page API Error:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          url: apiUrl,
          error: errorText || 'No error message',
          errorPreview: errorText.substring(0, 500)
        });
        
        // If 404, it means the About Page doesn't exist yet
        if (response.status === 404) {
          console.warn('⚠️ About Page not found in Strapi. Make sure:');
          console.warn('   1. About Page Single Type exists in Strapi');
          console.warn('   2. At least one entry has been created and published');
          console.warn('   3. Public "find" permission is enabled in Settings → Roles → Public');
        }
        
        // If 500, check Strapi server logs - try with no populate
        if (response.status === 500) {
          console.log('⚠️ 500 error, trying with no populate...');
          queryParams = [];
          if (locale) queryParams.push(`locale=${locale}`);
          const noPopulateUrl = `${STRAPI_URL}/api/about-page?${queryParams.join('&')}`;
          
          const retryResponse = await fetchWithTimeout(noPopulateUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: options?.cache || 'no-store',
          });
          
          if (retryResponse.ok) {
            console.log('✅ Retry with no populate succeeded!');
            const retryData = await retryResponse.json();
            return retryData.data || null;
          } else {
            console.error('❌ Retry also failed with status:', retryResponse.status);
          }
        }
        
        return null;
      }
      
      const data = await response.json();
      console.log('📥 [STRAPI API] About Page Response JSON:', JSON.stringify(data, null, 2));
      console.log('  - Response has data property:', !!data.data);
      console.log('  - Response data type:', typeof data.data);
      
      // Strapi v5 Single Types return { data: {...} } structure
      let result = data.data || null;
      console.log('  - Extracted result:', !!result);
      console.log('  - Result type:', typeof result);
      
      if (result) {
        console.log('  - Result has attributes:', !!result.attributes);
        console.log('  - Result keys:', Object.keys(result));
        if (result.locale) {
          console.log('  - Result locale:', result.locale);
        }
        if (result.attributes) {
          console.log('  - Attributes keys:', Object.keys(result.attributes));
          if (result.attributes.locale) {
            console.log('  - Attributes locale:', result.attributes.locale);
          }
        }
      }
      
      // If arrays are empty, try to fetch them separately using component IDs
      if (result) {
        // Try to fetch team members if team exists but members array is missing
        if (result.team && result.team.id && (!result.team.members || result.team.members.length === 0)) {
          try {
            console.log('🔍 Attempting to fetch team component separately with ID:', result.team.id);
            const teamResponse = await fetchWithTimeout(`${STRAPI_URL}/api/components/shared.team-section/${result.team.id}?populate[members][populate]=*`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: options?.cache || 'no-store',
            });
            
            if (teamResponse.ok) {
              const teamData = await teamResponse.json();
              if (teamData.data && teamData.data.members) {
                console.log('✅ Successfully fetched team members separately:', teamData.data.members.length);
                result.team.members = teamData.data.members;
              }
            } else {
              console.log('⚠️ Could not fetch team component separately:', teamResponse.status);
            }
          } catch (e) {
            console.log('⚠️ Error fetching team component separately:', e);
          }
        }
        
        // Try to fetch core values if values array is missing
        if (result.coreValues && result.coreValues.id && (!result.coreValues.values || result.coreValues.values.length === 0)) {
          try {
            console.log('🔍 Attempting to fetch coreValues component separately with ID:', result.coreValues.id);
            const coreValuesResponse = await fetchWithTimeout(`${STRAPI_URL}/api/components/shared.core-values-section/${result.coreValues.id}?populate[values][populate]=*`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: options?.cache || 'no-store',
            });
            
            if (coreValuesResponse.ok) {
              const coreValuesData = await coreValuesResponse.json();
              if (coreValuesData.data && coreValuesData.data.values) {
                console.log('✅ Successfully fetched core values separately:', coreValuesData.data.values.length);
                result.coreValues.values = coreValuesData.data.values;
              }
            }
          } catch (e) {
            console.log('⚠️ Error fetching coreValues component separately:', e);
          }
        }
        
        // Try to fetch sustainability features if features array is missing
        if (result.sustainability && result.sustainability.id && (!result.sustainability.features || result.sustainability.features.length === 0)) {
          try {
            console.log('🔍 Attempting to fetch sustainability component separately with ID:', result.sustainability.id);
            const sustainabilityResponse = await fetchWithTimeout(`${STRAPI_URL}/api/components/shared.sustainability-section/${result.sustainability.id}?populate[features][populate]=*`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: options?.cache || 'no-store',
            });
            
            if (sustainabilityResponse.ok) {
              const sustainabilityData = await sustainabilityResponse.json();
              if (sustainabilityData.data && sustainabilityData.data.features) {
                console.log('✅ Successfully fetched sustainability features separately:', sustainabilityData.data.features.length);
                result.sustainability.features = sustainabilityData.data.features;
              }
            }
          } catch (e) {
            console.log('⚠️ Error fetching sustainability component separately:', e);
          }
        }
      }
      
      // Debug logging - safely handle all potential errors
      try {
        let missionVisionStructure = '';
        let teamStructure = '';
        try {
          missionVisionStructure = result?.missionVision ? JSON.stringify(result.missionVision, null, 2).substring(0, 500) : 'null';
        } catch (e) {
          missionVisionStructure = '[Unable to stringify]';
        }
        try {
          teamStructure = result?.team ? JSON.stringify(result.team, null, 2).substring(0, 1000) : 'null';
        } catch (e) {
          teamStructure = '[Unable to stringify]';
        }
        
        console.log('🔍 API Response - About Page:');
        console.log('- Has data?', !!result);
        console.log('- Has hero?', !!result?.hero, result?.hero?.title || 'no title');
        console.log('- hero type:', typeof result?.hero);
        console.log('- hero value:', result?.hero);
        console.log('- hero keys:', result?.hero ? Object.keys(result.hero) : []);
        console.log('- Has missionVision?', !!result?.missionVision);
        console.log('- missionVision keys:', result?.missionVision ? Object.keys(result.missionVision) : []);
        console.log('- missionVision structure:', missionVisionStructure);
        console.log('- Has originStory?', !!result?.originStory);
        console.log('- Has coreValues?', !!result?.coreValues, result?.coreValues?.values?.length || 0, 'values');
        console.log('- Has team?', !!result?.team, result?.team?.members?.length || 0, 'members');
        console.log('- team structure:', teamStructure);
        console.log('- team has members field?', result?.team ? 'members' in result.team : false);
        console.log('- team members value:', result?.team?.members);
        console.log('- Has sustainability?', !!result?.sustainability);
        console.log('- Has cta?', !!result?.cta);
        console.log('- All keys:', Object.keys(result || {}));
      } catch (e) {
        // Silently ignore debug logging errors
      }
      
      return result;
    } catch (error: any) {
      // Silently handle all errors - never throw, always return null
      // This ensures the page works even if Strapi is completely down
      try {
        // Try to extract meaningful information from the error for logging
        let errorMessage = 'Unknown error';
        let errorStack: string | undefined = undefined;
        let errorName: string | undefined = undefined;
        
        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
          errorStack = error.stack?.substring(0, 500);
          errorName = error.name;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          // Try to stringify the error to see all properties
          try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
          } catch (e) {
            errorMessage = String(error);
          }
          errorName = error.constructor?.name || 'Object';
        } else {
          errorMessage = String(error);
        }
        
        // Log error details safely (wrapped in try-catch to prevent logging errors from crashing)
        try {
          console.error('❌ Network error fetching Strapi about page:', {
            name: errorName,
            message: errorMessage,
            stack: errorStack,
            type: typeof error,
            constructor: error?.constructor?.name,
            url: STRAPI_URL,
            // Include the error itself if it's serializable
            rawError: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack?.substring(0, 200)
            } : error
          });
        } catch (logError) {
          // Even logging failed - just continue silently
        }
      } catch (nestedError) {
        // If error extraction itself fails, just continue silently
      }
      
      // Always return null on any error - never throw
      return null;
    }
  },

  // Get Pricing Page content (Single Type)
  async getPricingPage(locale?: string, options?: {
    cache?: RequestCache;
  }) {
    try {
      // Populate pattern matching actual Strapi schema structure
      // For Strapi v5, use nested populate syntax
      const queryParams = [
        'populate=*', // Populate all first-level fields
        'populate[basicPlan][populate][features]=*', // Basic plan features (repeatable component)
        'populate[premiumPlan][populate][features]=*', // Premium plan features (repeatable component)
        'populate[superPremiumPlan][populate][features]=*', // Super Premium plan features (repeatable component)
        'populate[setupPackage][populate][features]=*', // Setup package features (repeatable component)
        'populate[upgradePackage][populate][features]=*', // Upgrade package features (repeatable component)
        'populate[compliancePackage][populate][features]=*', // Compliance package features (repeatable component)
        'populate[trustPoints]=*', // Trust points (repeatable component)
        'populate[seo][populate]=*', // SEO component
        'populate[seo][populate][openGraph][populate]=*', // Open Graph nested component
        'populate[seo][populate][metaImage]=*', // SEO meta image
      ];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const apiUrl = `${STRAPI_URL}/api/pricing-page?${queryParams.join('&')}`;
      console.log('📡 [STRAPI API] Fetching Pricing Page from:', apiUrl);
      console.log('  - Full URL:', apiUrl);
      console.log('  - Query params:', queryParams);
      
      const response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store', // Default to no-store for instant updates
      });
      
      console.log('📥 [STRAPI API] Pricing Page API Response Status:', response.status, response.statusText);
      console.log('  - Response OK:', response.ok);
      console.log('  - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // If we get 400, try with simpler populate
        if (response.status === 400) {
          console.log('⚠️ Deep populate failed for pricing page, trying simple populate...');
          // Retry with simple populate
          const simpleParams = ['populate=*'];
          if (locale) simpleParams.push(`locale=${locale}`);
          const retryResponse = await fetchWithTimeout(`${STRAPI_URL}/api/pricing-page?${simpleParams.join('&')}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: options?.cache || 'no-store',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData.data || null;
          }
        }
        
        // Silently handle other errors
        if (response.status !== 0 && response.status < 500 && response.status !== 404) {
          const errorText = await response.text();
          console.warn('Strapi Pricing Page API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 100)
          });
        }
        return null;
      }
      
      const data = await response.json();
      console.log('📥 [STRAPI API] Pricing Page Response JSON:', JSON.stringify(data, null, 2));
      console.log('  - Response has data property:', !!data.data);
      console.log('  - Response data type:', typeof data.data);
      
      // Strapi v5 Single Types return { data: {...} } structure
      const result = data.data || null;
      console.log('  - Extracted result:', !!result);
      console.log('  - Result type:', typeof result);
      
      if (result) {
        console.log('  - Result has attributes:', !!result.attributes);
        console.log('  - Result keys:', Object.keys(result));
        if (result.locale) {
          console.log('  - Result locale:', result.locale);
        }
        if (result.attributes) {
          console.log('  - Attributes keys:', Object.keys(result.attributes));
          if (result.attributes.locale) {
            console.log('  - Attributes locale:', result.attributes.locale);
          }
          if (result.attributes.heroTitle) {
            console.log('  - Sample heroTitle:', result.attributes.heroTitle.substring(0, 50));
          }
        }
      }
      
      return result;
    } catch (error: any) {
      // Silently handle all errors - never throw, always return null
      // This ensures the page works even if Strapi is completely down
      try {
        // Try to extract meaningful information from the error for logging
        let errorMessage = 'Unknown error';
        let errorStack: string | undefined = undefined;
        let errorName: string | undefined = undefined;
        
        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
          errorStack = error.stack?.substring(0, 500);
          errorName = error.name;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          // Try to stringify the error to see all properties
          try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
          } catch (e) {
            errorMessage = String(error);
          }
          errorName = error.constructor?.name || 'Object';
        } else {
          errorMessage = String(error);
        }
        
        // Log error details safely (wrapped in try-catch to prevent logging errors from crashing)
        try {
          console.error('❌ Network error fetching Strapi pricing page:', {
            name: errorName,
            message: errorMessage,
            stack: errorStack,
            type: typeof error,
            constructor: error?.constructor?.name,
            url: STRAPI_URL,
            // Include the error itself if it's serializable
            rawError: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack?.substring(0, 200)
            } : error
          });
        } catch (logError) {
          // Even logging failed - just continue silently
        }
      } catch (nestedError) {
        // If error extraction itself fails, just continue silently
      }
      
      // Always return null on any error - never throw
      return null;
    }
  },

  // ============================================
  // SERVICE PAGES - NOW USING SINGLE TYPES (like homepage, about, pricing)
  // ============================================
  
  // OLD: Get Service Page by slug (Collection Type) - COMMENTED OUT
  // Now using individual Single Types for each service page
  /*
  async getServicePage(slug: string, locale?: string, options?: { cache?: RequestCache; }) {
    try {
      const queryParams = [
        `filters[slug][$eq]=${slug}`,
        // Note: Strapi v5 returns only published entries by default for public API
        // If you need draft entries, use publicationState=preview
        'populate=*',
        'populate[pageContent][populate]=*',
        'populate[pageContent][populate][hero][populate]=*',
        'populate[pageContent][populate][whatWeDo][populate]=*',
        'populate[pageContent][populate][whatWeDo][populate][features][populate]=*',
        'populate[pageContent][populate][includes][populate]=*',
        'populate[pageContent][populate][includes][populate][features][populate]=*',
        'populate[pageContent][populate][benefits][populate]=*',
        'populate[pageContent][populate][benefitsList][populate]=*',
        'populate[pageContent][populate][howItWorks][populate]=*',
        'populate[pageContent][populate][howItWorks][populate][features][populate]=*',
        'populate[pageContent][populate][steps][populate]=*',
        'populate[pageContent][populate][faqs][populate]=*',
        'populate[pageContent][populate][cta][populate]=*',
      ];
      
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const response = await fetchWithTimeout(`${STRAPI_URL}/api/service-pages?${queryParams.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store',
      });
      
      if (!response.ok) {
        // If we get 400, try with simpler populate (like homepage does)
        if (response.status === 400) {
          console.log('⚠️ Deep populate failed for service page, trying simple populate...');
          // Retry with simple populate
          const simpleParams = [
            `filters[slug][$eq]=${slug}`,
            'populate=*'
          ];
          if (locale) simpleParams.push(`locale=${locale}`);
          const retryResponse = await fetchWithTimeout(`${STRAPI_URL}/api/service-pages?${simpleParams.join('&')}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: options?.cache || 'no-store',
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData.data?.[0] || null;
          }
        }
        
        // Silently handle other errors (like homepage does)
        if (response.status !== 0 && response.status < 500 && response.status !== 404) {
          const errorText = await response.text();
          console.warn('Strapi Service Page API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 100),
            slug
          });
        }
        return null;
      }
      
      const data = await response.json();
      // Strapi v5 Collection Types return { data: [...] } structure
      const result = data.data?.[0] || null;
      
      return result;
    } catch (error: any) {
      // Silently handle all errors - never throw, always return null (like homepage)
      // This ensures the page works even if Strapi is completely down
      try {
        let errorMessage = 'Unknown error';
        let errorStack: string | undefined = undefined;
        let errorName: string | undefined = undefined;

        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
          errorStack = error.stack?.substring(0, 500);
          errorName = error.name;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
          } catch (e) {
            errorMessage = String(error);
          }
          errorName = error.constructor?.name || 'Object';
        } else {
          errorMessage = String(error);
        }

        console.error('❌ Network error fetching Strapi service page:', {
          name: errorName,
          message: errorMessage,
          stack: errorStack,
          type: typeof error,
          constructor: error?.constructor?.name,
          url: STRAPI_URL,
          slug,
          rawError: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 200)
          } : error
        });
      } catch (logError) {
        // Even logging failed - just continue silently
      }
      
      // Always return null on any error - never throw
      return null;
    }
  }
  */
  
  // NEW: Get Enhanced Direct Bookings Page (Single Type)
  // Get Enhanced Direct Bookings Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getEnhancedDirectBookingsPage(locale?: string, options?: {
    cache?: RequestCache;
  }) {
    try {
      // Try populate=deep first (Strapi v5 way) - same as FullServiceManagement
      let queryParams = ['populate=deep'];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const apiUrl = `${STRAPI_URL}/api/enhanced-direct-bookings-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Enhanced Direct Bookings Page from (deep populate):', apiUrl);
      
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store',
      });
      
      console.log('📥 Enhanced Direct Bookings Page API Response Status:', response.status, response.statusText);
      
      // If populate=deep fails, try selective nested populate
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = [
          'populate=*',
          'populate[hero][populate]=*',
          'populate[whatWeDo][populate]=*',
          'populate[whatWeDo][populate][features][populate]=*',
          'populate[includes][populate]=*',
          'populate[includes][populate][features][populate]=*',
          'populate[benefits][populate]=*',
          'populate[benefitsList][populate]=*',
          'populate[howItWorks][populate]=*',
          'populate[howItWorks][populate][features][populate]=*',
          'populate[steps][populate]=*',
          'populate[faqs][populate]=*',
          'populate[cta][populate]=*',
        ];
        if (locale) queryParams.push(`locale=${locale}`);
        
        const selectiveUrl = `${STRAPI_URL}/api/enhanced-direct-bookings-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      
      // Final fallback to simple populate=*
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/enhanced-direct-bookings-page?${queryParams.join('&')}`;
        
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      
      if (!response.ok) {
        // Try to get error details
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        console.warn('Strapi Enhanced Direct Bookings Page API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 200)
        });
        return null;
      }
      
      const data = await response.json();
      // Strapi v5 Single Types return { data: {...} } structure
      const result = data.data || null;
      
      if (result) {
        console.log('✅ Enhanced Direct Bookings Page data received:', {
          hasHero: !!result?.hero,
          hasWhatWeDo: !!result?.whatWeDo,
          hasIncludes: !!result?.includes,
          keys: Object.keys(result || {})
        });
      }
      
      return result;
    } catch (error: any) {
      // Enhanced error logging (same as FullServiceManagement)
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = String(error);
        }
        console.error('❌ Network error fetching Strapi Enhanced Direct Bookings page:', {
          message: errorMessage,
          url: STRAPI_URL,
        });
      } catch (logError) {
        // Even logging failed - just continue silently
      }
      return null;
    }
  },

  // Get Full Service Management Page (Single Type) - same pattern as getAboutPage
  async getFullServiceManagementPage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      // Try populate=deep first (Strapi v5 way) - same as About page
      let queryParams = ['populate=deep'];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const apiUrl = `${STRAPI_URL}/api/full-service-management-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Full Service Management Page from (deep populate):', apiUrl);
      
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store',
      });
      
      console.log('📥 Full Service Management Page API Response Status:', response.status, response.statusText);
      
      // If populate=deep fails, try selective nested populate
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = [
          'populate=*',
          'populate[hero][populate]=*',
          'populate[whatWeDo][populate]=*',
          'populate[whatWeDo][populate][features][populate]=*',
          'populate[includes][populate]=*',
          'populate[includes][populate][features][populate]=*',
          'populate[benefits][populate]=*',
          'populate[benefitsList][populate]=*',
          'populate[howItWorks][populate]=*',
          'populate[howItWorks][populate][features][populate]=*',
          'populate[steps][populate]=*',
          'populate[faqs][populate]=*',
          'populate[cta][populate]=*',
        ];
        if (locale) queryParams.push(`locale=${locale}`);
        
        const selectiveUrl = `${STRAPI_URL}/api/full-service-management-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      
      // Final fallback to simple populate=*
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/full-service-management-page?${queryParams.join('&')}`;
        
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      
      if (!response.ok) {
        // Try to get error details
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        console.warn('Strapi Full Service Management Page API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 200)
        });
        return null;
      }
      
      const data = await response.json();
      // Strapi v5 Single Types return { data: {...} } structure
      const result = data.data || null;
      
      if (result) {
        console.log('✅ Full Service Management Page data received:', {
          hasHero: !!result?.hero,
          hasWhatWeDo: !!result?.whatWeDo,
          hasIncludes: !!result?.includes,
          keys: Object.keys(result || {})
        });
      }
      
      return result;
    } catch (error: any) {
      // Enhanced error logging (same as About page)
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = String(error);
        }
        console.error('❌ Network error fetching Strapi Full Service Management page:', {
          message: errorMessage,
          url: STRAPI_URL,
        });
      } catch (logError) {
        // Even logging failed - just continue silently
      }
      return null;
    }
  },

  // Get Advanced Automation Page (Single Type) - same pattern as getFullServiceManagementPage
  async getAdvancedAutomationPage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      // Try populate=deep first (Strapi v5 way) - same as FullServiceManagement
      let queryParams = ['populate=deep'];
      
      // Add locale filter if provided (for Strapi i18n)
      if (locale) {
        queryParams.push(`locale=${locale}`);
      }
      
      const apiUrl = `${STRAPI_URL}/api/advanced-automation-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Advanced Automation Page from (deep populate):', apiUrl);
      
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: options?.cache || 'no-store',
      });
      
      console.log('📥 Advanced Automation Page API Response Status:', response.status, response.statusText);
      
      // If populate=deep fails, try selective nested populate
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = [
          'populate=*',
          'populate[hero][populate]=*',
          'populate[whatWeDo][populate]=*',
          'populate[whatWeDo][populate][features][populate]=*',
          'populate[includes][populate]=*',
          'populate[includes][populate][features][populate]=*',
          'populate[benefits][populate]=*',
          'populate[benefitsList][populate]=*',
          'populate[howItWorks][populate]=*',
          'populate[howItWorks][populate][features][populate]=*',
          'populate[steps][populate]=*',
          'populate[faqs][populate]=*',
          'populate[cta][populate]=*',
        ];
        if (locale) queryParams.push(`locale=${locale}`);
        
        const selectiveUrl = `${STRAPI_URL}/api/advanced-automation-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      
      // Final fallback to simple populate=*
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/advanced-automation-page?${queryParams.join('&')}`;
        
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      
      if (!response.ok) {
        // Try to get error details
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        console.warn('Strapi Advanced Automation Page API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 200)
        });
        return null;
      }
      
      const data = await response.json();
      // Strapi v5 Single Types return { data: {...} } structure
      const result = data.data || null;
      
      if (result) {
        console.log('✅ Advanced Automation Page data received:', {
          hasHero: !!result?.hero,
          hasWhatWeDo: !!result?.whatWeDo,
          hasIncludes: !!result?.includes,
          keys: Object.keys(result || {})
        });
      }
      
      return result;
    } catch (error: any) {
      // Enhanced error logging (same as FullServiceManagement)
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message || 'Error without message';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = String(error);
        }
        console.error('❌ Network error fetching Strapi Advanced Automation page:', {
          message: errorMessage,
          url: STRAPI_URL,
        });
      } catch (logError) {
        // Even logging failed - just continue silently
      }
      return null;
    }
  },

  // Get Local Expertise Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getLocalExpertisePage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      let queryParams = ['populate=deep'];
      if (locale) queryParams.push(`locale=${locale}`);
      const apiUrl = `${STRAPI_URL}/api/local-expertise-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Local Expertise Page from (deep populate):', apiUrl);
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: options?.cache || 'no-store',
      });
      console.log('📥 Local Expertise Page API Response Status:', response.status, response.statusText);
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = ['populate=*', 'populate[hero][populate]=*', 'populate[whatWeDo][populate]=*', 'populate[whatWeDo][populate][features][populate]=*', 'populate[includes][populate]=*', 'populate[includes][populate][features][populate]=*', 'populate[benefits][populate]=*', 'populate[benefitsList][populate]=*', 'populate[howItWorks][populate]=*', 'populate[howItWorks][populate][features][populate]=*', 'populate[steps][populate]=*', 'populate[faqs][populate]=*', 'populate[cta][populate]=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const selectiveUrl = `${STRAPI_URL}/api/local-expertise-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/local-expertise-page?${queryParams.join('&')}`;
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch (e) { errorText = 'Could not read error response'; }
        console.warn('Strapi Local Expertise Page API Error:', { status: response.status, statusText: response.statusText, error: errorText.substring(0, 200) });
        return null;
      }
      const data = await response.json();
      const result = data.data || null;
      if (result) {
        console.log('✅ Local Expertise Page data received:', { hasHero: !!result?.hero, hasWhatWeDo: !!result?.whatWeDo, hasIncludes: !!result?.includes, keys: Object.keys(result || {}) });
      }
      return result;
    } catch (error: any) {
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) errorMessage = error.message || 'Error without message';
        else if (typeof error === 'string') errorMessage = error;
        else errorMessage = String(error);
        console.error('❌ Network error fetching Strapi Local Expertise page:', { message: errorMessage, url: STRAPI_URL });
      } catch (logError) {}
      return null;
    }
  },

  // Get Income Strategy Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getIncomeStrategyPage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      let queryParams = ['populate=deep'];
      if (locale) queryParams.push(`locale=${locale}`);
      const apiUrl = `${STRAPI_URL}/api/income-strategy-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Income Strategy Page from (deep populate):', apiUrl);
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: options?.cache || 'no-store',
      });
      console.log('📥 Income Strategy Page API Response Status:', response.status, response.statusText);
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = ['populate=*', 'populate[hero][populate]=*', 'populate[whatWeDo][populate]=*', 'populate[whatWeDo][populate][features][populate]=*', 'populate[includes][populate]=*', 'populate[includes][populate][features][populate]=*', 'populate[benefits][populate]=*', 'populate[benefitsList][populate]=*', 'populate[howItWorks][populate]=*', 'populate[howItWorks][populate][features][populate]=*', 'populate[steps][populate]=*', 'populate[faqs][populate]=*', 'populate[cta][populate]=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const selectiveUrl = `${STRAPI_URL}/api/income-strategy-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/income-strategy-page?${queryParams.join('&')}`;
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch (e) { errorText = 'Could not read error response'; }
        console.warn('Strapi Income Strategy Page API Error:', { status: response.status, statusText: response.statusText, error: errorText.substring(0, 200) });
        return null;
      }
      const data = await response.json();
      const result = data.data || null;
      if (result) {
        console.log('✅ Income Strategy Page data received:', { hasHero: !!result?.hero, hasWhatWeDo: !!result?.whatWeDo, hasIncludes: !!result?.includes, keys: Object.keys(result || {}) });
      }
      return result;
    } catch (error: any) {
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) errorMessage = error.message || 'Error without message';
        else if (typeof error === 'string') errorMessage = error;
        else errorMessage = String(error);
        console.error('❌ Network error fetching Strapi Income Strategy page:', { message: errorMessage, url: STRAPI_URL });
      } catch (logError) {}
      return null;
    }
  },

  // Get Legal Compliance Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getLegalCompliancePage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      let queryParams = ['populate=deep'];
      if (locale) queryParams.push(`locale=${locale}`);
      const apiUrl = `${STRAPI_URL}/api/legal-compliance-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Legal Compliance Page from (deep populate):', apiUrl);
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: options?.cache || 'no-store',
      });
      console.log('📥 Legal Compliance Page API Response Status:', response.status, response.statusText);
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = ['populate=*', 'populate[hero][populate]=*', 'populate[whatWeDo][populate]=*', 'populate[whatWeDo][populate][features][populate]=*', 'populate[includes][populate]=*', 'populate[includes][populate][features][populate]=*', 'populate[benefits][populate]=*', 'populate[benefitsList][populate]=*', 'populate[howItWorks][populate]=*', 'populate[howItWorks][populate][features][populate]=*', 'populate[steps][populate]=*', 'populate[faqs][populate]=*', 'populate[cta][populate]=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const selectiveUrl = `${STRAPI_URL}/api/legal-compliance-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/legal-compliance-page?${queryParams.join('&')}`;
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch (e) { errorText = 'Could not read error response'; }
        console.warn('Strapi Legal Compliance Page API Error:', { status: response.status, statusText: response.statusText, error: errorText.substring(0, 200) });
        return null;
      }
      const data = await response.json();
      const result = data.data || null;
      if (result) {
        console.log('✅ Legal Compliance Page data received:', { hasHero: !!result?.hero, hasWhatWeDo: !!result?.whatWeDo, hasIncludes: !!result?.includes, keys: Object.keys(result || {}) });
      }
      return result;
    } catch (error: any) {
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) errorMessage = error.message || 'Error without message';
        else if (typeof error === 'string') errorMessage = error;
        else errorMessage = String(error);
        console.error('❌ Network error fetching Strapi Legal Compliance page:', { message: errorMessage, url: STRAPI_URL });
      } catch (logError) {}
      return null;
    }
  },

  // Get Automated Billing Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getAutomatedBillingPage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      let queryParams = ['populate=deep'];
      if (locale) queryParams.push(`locale=${locale}`);
      const apiUrl = `${STRAPI_URL}/api/automated-billing-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Automated Billing Page from (deep populate):', apiUrl);
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: options?.cache || 'no-store',
      });
      console.log('📥 Automated Billing Page API Response Status:', response.status, response.statusText);
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = ['populate=*', 'populate[hero][populate]=*', 'populate[whatWeDo][populate]=*', 'populate[whatWeDo][populate][features][populate]=*', 'populate[includes][populate]=*', 'populate[includes][populate][features][populate]=*', 'populate[benefits][populate]=*', 'populate[benefitsList][populate]=*', 'populate[howItWorks][populate]=*', 'populate[howItWorks][populate][features][populate]=*', 'populate[steps][populate]=*', 'populate[faqs][populate]=*', 'populate[cta][populate]=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const selectiveUrl = `${STRAPI_URL}/api/automated-billing-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/automated-billing-page?${queryParams.join('&')}`;
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch (e) { errorText = 'Could not read error response'; }
        console.warn('Strapi Automated Billing Page API Error:', { status: response.status, statusText: response.statusText, error: errorText.substring(0, 200) });
        return null;
      }
      const data = await response.json();
      const result = data.data || null;
      if (result) {
        console.log('✅ Automated Billing Page data received:', { hasHero: !!result?.hero, hasWhatWeDo: !!result?.whatWeDo, hasIncludes: !!result?.includes, keys: Object.keys(result || {}) });
      }
      return result;
    } catch (error: any) {
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) errorMessage = error.message || 'Error without message';
        else if (typeof error === 'string') errorMessage = error;
        else errorMessage = String(error);
        console.error('❌ Network error fetching Strapi Automated Billing page:', { message: errorMessage, url: STRAPI_URL });
      } catch (logError) {}
      return null;
    }
  },

  // Get Green Pledge Page (Single Type) - same pattern as getAdvancedAutomationPage
  async getGreenPledgePage(locale?: string, options?: { cache?: RequestCache; }) {
    try {
      let queryParams = ['populate=deep'];
      if (locale) queryParams.push(`locale=${locale}`);
      const apiUrl = `${STRAPI_URL}/api/green-pledge-page?${queryParams.join('&')}`;
      console.log('📡 Fetching Green Pledge Page from (deep populate):', apiUrl);
      let response = await fetchWithTimeout(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: options?.cache || 'no-store',
      });
      console.log('📥 Green Pledge Page API Response Status:', response.status, response.statusText);
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Deep populate failed, trying selective nested populate...');
        queryParams = ['populate=*', 'populate[hero][populate]=*', 'populate[whatWeDo][populate]=*', 'populate[whatWeDo][populate][features][populate]=*', 'populate[includes][populate]=*', 'populate[includes][populate][features][populate]=*', 'populate[benefits][populate]=*', 'populate[benefitsList][populate]=*', 'populate[howItWorks][populate]=*', 'populate[howItWorks][populate][features][populate]=*', 'populate[steps][populate]=*', 'populate[faqs][populate]=*', 'populate[cta][populate]=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const selectiveUrl = `${STRAPI_URL}/api/green-pledge-page?${queryParams.join('&')}`;
        console.log('📡 Retry with selective populate:', selectiveUrl);
        response = await fetchWithTimeout(selectiveUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Selective populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok && (response.status === 400 || response.status === 500)) {
        console.log('⚠️ Selective populate also failed, using simple populate=*...');
        queryParams = ['populate=*'];
        if (locale) queryParams.push(`locale=${locale}`);
        const simpleUrl = `${STRAPI_URL}/api/green-pledge-page?${queryParams.join('&')}`;
        response = await fetchWithTimeout(simpleUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: options?.cache || 'no-store',
        });
        console.log('📥 Simple populate Response Status:', response.status, response.statusText);
      }
      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch (e) { errorText = 'Could not read error response'; }
        console.warn('Strapi Green Pledge Page API Error:', { status: response.status, statusText: response.statusText, error: errorText.substring(0, 200) });
        return null;
      }
      const data = await response.json();
      const result = data.data || null;
      if (result) {
        console.log('✅ Green Pledge Page data received:', { hasHero: !!result?.hero, hasWhatWeDo: !!result?.whatWeDo, hasIncludes: !!result?.includes, keys: Object.keys(result || {}) });
      }
      return result;
    } catch (error: any) {
      try {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) errorMessage = error.message || 'Error without message';
        else if (typeof error === 'string') errorMessage = error;
        else errorMessage = String(error);
        console.error('❌ Network error fetching Strapi Green Pledge page:', { message: errorMessage, url: STRAPI_URL });
      } catch (logError) {}
      return null;
    }
  },
};

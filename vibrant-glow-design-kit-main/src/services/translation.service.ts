/**
 * Translation service for blog content
 * Uses MyMemory Translation API (free tier: 10,000 words/day)
 * Optimized for speed with batching and caching
 */

const TRANSLATION_CACHE_KEY = 'blog_translations_cache';
const CACHE_EXPIRY_DAYS = 7;
const MAX_BATCH_SIZE = 500; // Maximum characters per API call

interface TranslationCache {
  [key: string]: {
    text: string;
    timestamp: number;
  };
}

// Get or create cache
const getCache = (): TranslationCache => {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to read translation cache:', e);
  }
  return {};
};

// Save cache
const saveCache = (cache: TranslationCache): void => {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save translation cache:', e);
  }
};

// Check if cache entry is valid
const isCacheValid = (timestamp: number): boolean => {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < expiryTime;
};

// Generate cache key
const getCacheKey = (text: string, targetLang: string): string => {
  return `${targetLang}:${text.substring(0, 200)}`;
};

/**
 * Translate text using MyMemory Translation API
 * Free tier: 10,000 words/day, no API key required
 */
const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Limit text length to avoid API issues (MyMemory has limits)
  const maxLength = 500;
  if (text.length > maxLength) {
    // Split and translate in chunks
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength));
    }
    const translatedChunks = await Promise.all(
      chunks.map(chunk => translateText(chunk, targetLang))
    );
    return translatedChunks.join('');
  }

  // Check cache first
  const cache = getCache();
  const cacheKey = getCacheKey(text, targetLang);
  if (cache[cacheKey] && isCacheValid(cache[cacheKey].timestamp)) {
    return cache[cacheKey].text;
  }

  try {
    // MyMemory Translation API (free, no API key required)
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Translation API HTTP error: ${response.status} ${response.statusText}`);
      return text; // Return original on HTTP error
    }

    const data = await response.json();
    
    // Log response for debugging (always log warnings in production)
    if (data.responseStatus !== 200) {
      console.warn('Translation API response:', {
        status: data.responseStatus,
        data: data.responseData,
        matches: data.matches,
        textLength: text.length
      });
    }
    
    // Handle different response formats
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Validate translation (shouldn't be empty or same as original)
      if (translated && translated.trim().length > 0 && translated !== text) {
        // Save to cache
        cache[cacheKey] = {
          text: translated,
          timestamp: Date.now()
        };
        saveCache(cache);
        
        return translated;
      } else {
        console.warn('Translation API returned empty or invalid translation');
        return text;
      }
    } else if (data.responseStatus === 429) {
      // Rate limited - return original text
      console.warn('Translation API rate limited - using original text');
      return text;
    } else {
      // Log the actual response for debugging
      console.warn('Translation API returned unexpected response:', {
        status: data.responseStatus,
        statusText: data.responseStatusText,
        data: data.responseData,
        matches: data.matches,
        fullResponse: JSON.stringify(data).substring(0, 500)
      });
      
      // Try multiple fallback strategies
      // 1. Try matches array
      if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
        const bestMatch = data.matches[0];
        if (bestMatch.translation && bestMatch.translation.trim().length > 0) {
          console.log('Using fallback match translation');
          return bestMatch.translation;
        }
      }
      
      // 2. Try responseData directly (different format)
      if (data.responseData) {
        if (typeof data.responseData === 'string') {
          return data.responseData;
        }
        if (data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
      }
      
      // 3. Return original text (graceful degradation)
      console.warn('No valid translation found, returning original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
};

/**
 * Translate multiple texts in a single batch (faster)
 */
const translateBatch = async (texts: string[], targetLang: string): Promise<string[]> => {
  if (targetLang === 'en' || texts.length === 0) {
    return texts;
  }

  const cache = getCache();
  const results: string[] = [];
  const uncachedTexts: { index: number; text: string }[] = [];
  const uncachedIndices: number[] = [];

  // Check cache for all texts first
  texts.forEach((text, index) => {
    if (!text || text.trim().length === 0) {
      results[index] = text;
      return;
    }

    const cacheKey = getCacheKey(text, targetLang);
    if (cache[cacheKey] && isCacheValid(cache[cacheKey].timestamp)) {
      results[index] = cache[cacheKey].text;
    } else {
      uncachedTexts.push({ index, text });
      uncachedIndices.push(index);
    }
  });

  // If all cached, return immediately
  if (uncachedTexts.length === 0) {
    return results;
  }

  // Translate uncached texts individually (more reliable than batching)
  // Process in smaller batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < uncachedTexts.length; i += batchSize) {
    const batch = uncachedTexts.slice(i, i + batchSize);
    
    // Translate each text individually (more reliable)
    const batchPromises = batch.map(({ text, index }) => 
      translateText(text, targetLang).then(translated => {
        results[index] = translated;
      }).catch(error => {
        console.warn(`Translation failed for text at index ${index}:`, error);
        results[index] = batch.find(b => b.index === index)?.text || '';
      })
    );

    await Promise.all(batchPromises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < uncachedTexts.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return results;
};

/**
 * Translate HTML content (preserves HTML tags) - OPTIMIZED VERSION
 */
export const translateHTMLContent = async (
  htmlContent: string,
  targetLang: string
): Promise<string> => {
  if (targetLang === 'en' || !htmlContent) {
    return htmlContent;
  }

  // Create a temporary container to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract all text nodes with their parent elements
  const textNodes: Array<{ node: Text; text: string }> = [];
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent || '';
    if (text.trim().length > 0) {
      textNodes.push({ node: node as Text, text });
    }
  }

  if (textNodes.length === 0) {
    return htmlContent;
  }

  // Extract all texts for batch translation
  const textsToTranslate = textNodes.map(item => item.text);
  
  // Translate all at once (much faster!)
  const translatedTexts = await translateBatch(textsToTranslate, targetLang);
  
  // Update text nodes with translations
  textNodes.forEach((item, index) => {
    item.node.textContent = translatedTexts[index] || item.text;
  });

  return tempDiv.innerHTML;
};

/**
 * Translate plain text
 */
export const translateTextContent = async (
  text: string,
  targetLang: string
): Promise<string> => {
  if (targetLang === 'en' || !text) {
    return text;
  }
  return translateText(text, targetLang);
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = (): void => {
  try {
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
    console.log('✅ Translation cache cleared');
  } catch (e) {
    console.warn('Failed to clear translation cache:', e);
  }
};

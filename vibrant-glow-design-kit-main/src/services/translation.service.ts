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

  // Check cache first
  const cache = getCache();
  const cacheKey = getCacheKey(text, targetLang);
  if (cache[cacheKey] && isCacheValid(cache[cacheKey].timestamp)) {
    return cache[cacheKey].text;
  }

  try {
    // MyMemory Translation API (free, no API key required)
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Save to cache
      cache[cacheKey] = {
        text: translated,
        timestamp: Date.now()
      };
      saveCache(cache);
      
      return translated;
    } else {
      throw new Error('Translation API returned invalid response');
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

  // Batch translate uncached texts
  // Combine small texts into batches to reduce API calls
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentBatchSize = 0;

  for (const { text } of uncachedTexts) {
    const textSize = text.length;
    
    if (currentBatchSize + textSize > MAX_BATCH_SIZE && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [text];
      currentBatchSize = textSize;
    } else {
      currentBatch.push(text);
      currentBatchSize += textSize;
    }
  }
  
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  // Translate batches in parallel (up to 3 at a time to avoid rate limiting)
  const parallelLimit = 3;
  for (let i = 0; i < batches.length; i += parallelLimit) {
    const batchGroup = batches.slice(i, i + parallelLimit);
    const batchPromises = batchGroup.map(batch => {
      const combinedText = batch.join('\n\n---SEPARATOR---\n\n');
      return translateText(combinedText, targetLang);
    });

    const batchResults = await Promise.all(batchPromises);
    
    // Split results back
    batchResults.forEach((combinedResult, batchIndex) => {
      const batch = batchGroup[batchIndex];
      const splitResults = combinedResult.split('\n\n---SEPARATOR---\n\n');
      
      batch.forEach((originalText, textIndex) => {
        const uncachedIndex = batches.slice(0, i + batchIndex).reduce((sum, b) => sum + b.length, 0) + textIndex;
        const { index } = uncachedTexts[uncachedIndex];
        results[index] = splitResults[textIndex] || originalText;
      });
    });
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

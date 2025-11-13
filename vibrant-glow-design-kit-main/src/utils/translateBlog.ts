/**
 * Utility functions for translating blog content
 * Uses translation service for instant translation without page reloads
 * Optimized for speed with progress indication
 */

import { translateHTMLContent, translateTextContent } from '../services/translation.service';

// Map our language codes to translation service language codes
const languageMap: Record<string, string> = {
  'en': 'en',
  'pt': 'pt',
  'fr': 'fr'
};

let currentTranslationLang: string = 'en';
let isTranslating: boolean = false;

/**
 * Show loading indicator
 */
const showLoading = (container: HTMLElement): void => {
  container.style.opacity = '0.6';
  container.style.transition = 'opacity 0.3s';
};

/**
 * Hide loading indicator
 */
const hideLoading = (container: HTMLElement): void => {
  container.style.opacity = '1';
  container.style.transition = 'opacity 0.3s';
};

/**
 * Translate all blog content on the page
 * @param targetLanguage - Language code (en, pt, fr)
 */
export const translateBlogContent = async (targetLanguage: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  const targetLang = languageMap[targetLanguage] || 'en';
  
  // If English, show original content
  if (targetLang === 'en') {
    resetBlogTranslation();
    return;
  }

  // Don't retranslate if already in this language
  if (currentTranslationLang === targetLang && !isTranslating) {
    return;
  }

  // Prevent multiple simultaneous translations
  if (isTranslating) {
    console.log('⏳ Translation already in progress...');
    return;
  }

  currentTranslationLang = targetLang;
  isTranslating = true;
  console.log('🌐 Translating blog content to:', targetLang);

  try {
    // Find all blog content containers
    const blogContainers = document.querySelectorAll('.blog-content-translate');
    
    if (blogContainers.length === 0) {
      console.log('⚠️ No blog content found to translate');
      isTranslating = false;
      return;
    }

    // Show loading state
    blogContainers.forEach(container => {
      showLoading(container as HTMLElement);
    });

    // Strategy: Translate first container as a test
    // If it works, continue. If rate limited, stop immediately.
    let firstContainerDone = false;
    
    for (const container of Array.from(blogContainers)) {
      // Check rate limit flag before each container
      if (localStorage.getItem('translation_rate_limited') === 'true') {
        console.warn('⚠️ Rate limit detected. Stopping translation.');
        break;
      }
      
      await translateContainer(container as HTMLElement, targetLang);
      
      // After first container, check if we got rate limited
      if (!firstContainerDone) {
        firstContainerDone = true;
        // Wait a moment and check if rate limit was set
        await new Promise(resolve => setTimeout(resolve, 300));
        if (localStorage.getItem('translation_rate_limited') === 'true') {
          console.warn('⚠️ Rate limit detected after first container. Stopping all translation.');
          break; // Stop processing remaining containers
        }
      }
      
      // Small delay between containers to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Hide loading state
    blogContainers.forEach(container => {
      hideLoading(container as HTMLElement);
    });

    console.log('✅ Blog content translated to:', targetLang);
  } catch (error) {
    console.error('❌ Translation error:', error);
    // Hide loading on error
    document.querySelectorAll('.blog-content-translate').forEach(container => {
      hideLoading(container as HTMLElement);
    });
    // Don't throw - just log and continue
    // Translation failures are handled gracefully by returning original text
  } finally {
    isTranslating = false;
  }
};

/**
 * Translate a single container element
 */
const translateContainer = async (container: HTMLElement, targetLang: string): Promise<void> => {
  try {
    // Store original content if not already stored
    if (!container.dataset.originalContent) {
      container.dataset.originalContent = container.innerHTML;
    }

    const originalHTML = container.dataset.originalContent;
    
    // Translate the HTML content (now optimized with batching)
    // translateHTMLContent never throws - it returns original text on error
    const translatedHTML = await translateHTMLContent(originalHTML, targetLang);
    
    // Update the container
    container.innerHTML = translatedHTML;
    
    // Mark as translated
    container.dataset.translatedLang = targetLang;
  } catch (error) {
    // Extra safety - if anything throws, just keep original content
    console.warn('Container translation error (using original):', error);
    // Don't throw - just leave content as is
  }
};

/**
 * Reset translation - show original content
 */
export const resetBlogTranslation = (): void => {
  console.log('🔄 Resetting to original content');
  currentTranslationLang = 'en';
  
  // Find all translated containers and restore original content
  const blogContainers = document.querySelectorAll('.blog-content-translate[data-original-content]');
  
  blogContainers.forEach(container => {
    const originalContent = (container as HTMLElement).dataset.originalContent;
    if (originalContent) {
      container.innerHTML = originalContent;
      (container as HTMLElement).dataset.translatedLang = '';
      hideLoading(container as HTMLElement);
    }
  });
  
  console.log('✅ Content reset to original');
};

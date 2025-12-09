import React from 'react';

// DOMPurify only works in the browser, so we need to handle SSR differently
export const sanitizeHTML = (content: string): string => {
  // On the server, return content as-is (Strapi content is trusted)
  // On the client, use DOMPurify for sanitization
  if (typeof window === 'undefined') {
    return content;
  }
  
  // Dynamically import DOMPurify only in the browser
  try {
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote', 'code', 'pre'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });
  } catch (error) {
    // If DOMPurify fails to load, return content as-is
    console.warn('DOMPurify not available, returning unsanitized content');
    return content;
  }
};

interface SafeHTMLProps {
  content: string;
  className?: string;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ content, className }) => {
  const sanitizedContent = sanitizeHTML(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};
'use client';

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname, useRouter } from 'next/navigation';
import { removeLocalePrefix, addLocalePrefix, getLocaleFromPathname } from "@/utils/locale-helpers";

const LanguageBand = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get locale from URL (source of truth)
  const urlLocale = pathname ? getLocaleFromPathname(pathname) : currentLanguage;
  
  // Use URL locale if available, otherwise use context language
  const activeLanguage = urlLocale || currentLanguage;
  
  // Order languages: put current/active language first, then others
  const languages = [
    { code: "pt" as const, name: "Português", flag: "🇵🇹" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" }
  ].sort((a, b) => {
    // Put active language first
    if (a.code === activeLanguage) return -1;
    if (b.code === activeLanguage) return 1;
    return 0;
  });

  const handleLanguageClick = (langCode: typeof languages[0]['code']) => {
    console.log('🌐 Language clicked:', langCode);
    console.log('🌐 Current pathname:', pathname);
    
    // Update language in context
    setLanguage(langCode);
    
    // Get current path without locale
    const currentPath = pathname || '/';
    const pathWithoutLocale = removeLocalePrefix(currentPath);
    
    // Build new URL with new locale
    const newPath = addLocalePrefix(pathWithoutLocale, langCode);
    
    console.log('🌐 Redirecting to:', newPath);
    
    // Use Next.js router for client-side navigation
    router.push(newPath);
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-3 sm:py-3 fixed top-0 left-0 right-0 z-50 notranslate">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="hidden sm:flex items-center text-gray-600">
            <Globe className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">{t.languageBand.tagline}<span className="text-xs align-super text-gray-600">™</span></span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageClick(lang.code)}
                className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors duration-200 text-xs sm:text-sm ${
                  activeLanguage === lang.code
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <span className="text-sm sm:text-base">{lang.flag}</span>
                <span className="font-medium hidden sm:inline">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageBand;

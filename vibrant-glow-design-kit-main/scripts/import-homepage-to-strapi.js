/**
 * Import Home Page data from translation JSON files to Strapi
 * 
 * Usage:
 *   npm run import:homepage
 *   OR
 *   node scripts/import-homepage-to-strapi.js
 * 
 * Make sure:
 *   1. Strapi server is running on http://localhost:1337
 *   2. You have set STRAPI_API_TOKEN in .env (or it will prompt for manual auth)
 *   3. Node.js 18+ is installed (for fetch support)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fetch is available in Node 18+
if (typeof globalThis.fetch === 'undefined') {
  console.error('❌ Error: fetch is not available. Please use Node.js 18+');
  process.exit(1);
}

// Configuration - reads from environment variables
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || ''; // Optional - set this in .env for authentication

// Read translation files
const translationsPath = path.join(__dirname, '../src/data/translations');

// Helper to read translation data for a specific locale
function getTranslationData(locale) {
  const enData = JSON.parse(fs.readFileSync(path.join(translationsPath, `${locale}.json`), 'utf8'));
  const integrationsData = JSON.parse(fs.readFileSync(path.join(translationsPath, `integrations/${locale}.json`), 'utf8'));
  return { enData: enData, integrationsEn: integrationsData };
}

// Helper function to make API calls
async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (API_TOKEN) {
    options.headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    throw error;
  }
}

// Transform translation data to Strapi format
function transformHomePageData(locale = 'en') {
  const { enData, integrationsEn } = getTranslationData(locale);
  const t = enData;
  const integrations = integrationsEn.integrations || {};

  // Helper to get nested value safely
  const get = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((o, key) => o?.[key], obj) || defaultValue;
  };

  return {
    data: {
      heroSection: {
        title: `${t.hero?.title?.empowering || ''} ${t.hero?.title?.hosts || ''} ${t.hero?.title?.simplifying || ''} ${t.hero?.title?.stays || ''}`.trim(),
        titleLine1: t.hero?.title?.empowering || '',
        titleLine2: t.hero?.title?.hosts || '',
        titleLine3: t.hero?.title?.simplifying || '',
        titleLine4: t.hero?.title?.stays || '',
        description: t.hero?.description || '',
        trustBadge: t.hero?.trustBadge || '',
        primaryCtaText: t.header?.cta?.getStartedToday || 'Get Started Today',
        primaryCtaLink: 'https://calendly.com/admin-smarthoster',
        secondaryCtaText: t.hero?.cta?.learnMore || 'Learn More',
        secondaryCtaLink: '/learn-more',
        metrics: [
          {
            value: t.hero?.metrics?.incomeIncrease || '+35%',
            label: t.hero?.metrics?.incomeLabel || 'Income Increase',
            position: 'top-left',
            color: '#5FFF56'
          },
          {
            value: t.hero?.metrics?.compliance || '100%',
            label: t.hero?.metrics?.complianceLabel || 'Legal Compliance',
            position: 'bottom-right',
            color: '#00CFFF'
          },
          {
            value: t.hero?.metrics?.support || '24/7',
            label: t.hero?.metrics?.supportLabel || 'Support',
            position: 'middle-right',
            color: '#00CFFF'
          }
        ],
        trustBadges: [
          {
            title: t.hero?.trustBadges?.sslCertified || 'SSL Certified',
            subtitle: t.hero?.trustBadges?.bankLevel || 'Bank-Level Security'
          },
          {
            title: t.hero?.trustBadges?.googleVerified || 'Google Verified',
            subtitle: t.hero?.trustBadges?.trustedBusiness || 'Trusted Business'
          }
        ]
      },

      aboutSection: {
        title: t.aboutUs?.title || '',
        description: t.aboutUs?.description || '',
        values: [
          {
            iconName: 'Building2',
            title: t.aboutUs?.values?.technology?.title || '',
            description: t.aboutUs?.values?.technology?.description || '',
            link: '/advanced-automation'
          },
          {
            iconName: 'Users',
            title: t.aboutUs?.values?.expertise?.title || '',
            description: t.aboutUs?.values?.expertise?.description || '',
            link: '/full-service-management'
          },
          {
            iconName: 'Leaf',
            title: t.aboutUs?.values?.sustainability?.title || '',
            description: t.aboutUs?.values?.sustainability?.description || '',
            link: '/green-pledge'
          },
          {
            iconName: 'Globe',
            title: t.aboutUs?.values?.standards?.title || '',
            description: t.aboutUs?.values?.standards?.description || '',
            link: '/legal-compliance'
          }
        ],
        partnersTitle: t.aboutUs?.partners?.title || '',
        partners: [], // You'll add partner logos manually in Strapi
        trustBadgeText: t.hero?.trustBadge || '',
        learnMoreButtonText: 'Learn More About Our Services',
        learnMoreButtonLink: '/learn-more'
      },

      featuresSection: {
        title: `${t.features?.title || ''} ${t.features?.subtitle || ''}`.trim(),
        subtitle: t.features?.subtitle || '',
        description: t.features?.description || '',
        features: Object.keys(t.features?.list || {}).map(key => ({
          iconName: getIconName(key),
          title: t.features.list[key].title || '',
          description: t.features.list[key].description || '',
          color: getColorForFeature(key),
          route: getRouteForFeature(key)
        })),
        learnMore: t.features?.learnMore || 'Learn More'
      },

      integrationsSection: {
        title: integrations.title || t.integrations?.title || '',
        description: integrations.description || t.integrations?.description || '',
        integrationStats: [
          {
            iconName: 'Globe',
            number: '70+',
            label: integrations.stats?.platforms?.label || '',
            description: integrations.stats?.platforms?.description || ''
          },
          {
            iconName: 'Shield',
            number: '100%',
            label: integrations.stats?.compliance?.label || '',
            description: integrations.stats?.compliance?.description || ''
          },
          {
            iconName: 'TrendingUp',
            number: '99.9%',
            label: integrations.stats?.uptime?.label || '',
            description: integrations.stats?.uptime?.description || ''
          }
        ],
        benefits: [
          {
            iconName: 'Database',
            title: integrations.benefits?.operations?.title || '',
            description: integrations.benefits?.operations?.description || ''
          },
          {
            iconName: 'FileCheck',
            title: integrations.benefits?.legal?.title || '',
            description: integrations.benefits?.legal?.description || ''
          },
          {
            iconName: 'Lock',
            title: integrations.benefits?.visibility?.title || '',
            description: integrations.benefits?.visibility?.description || ''
          }
        ],
        ctaTitle: integrations.cta?.title || '',
        ctaDescription: integrations.cta?.description || '',
        ctaButtonText: integrations.cta?.button || '',
        ctaButtonLink: '/integrations',
        gdprText: integrations.cta?.gdpr || ''
      },

      testimonialsSection: {
        title: t.testimonials?.title || '',
        description: t.testimonials?.description || '',
        testimonials: [
          {
            name: 'Luis M.',
            role: t.testimonials?.roles?.villaOwner || '',
            location: 'Algarve',
            rating: 5,
            quote: t.testimonials?.quotes?.luis || ''
          },
          {
            name: 'Maria S.',
            role: t.testimonials?.roles?.apartmentHost || '',
            location: 'Porto',
            rating: 5,
            quote: t.testimonials?.quotes?.maria || ''
          },
          {
            name: 'Carlos R.',
            role: t.testimonials?.roles?.propertyInvestor || '',
            location: 'Lisboa',
            rating: 5,
            quote: t.testimonials?.quotes?.carlos || ''
          },
          {
            name: 'Ana F.',
            role: t.testimonials?.roles?.vacationRentalHost || '',
            location: 'Óbidos',
            rating: 5,
            quote: t.testimonials?.quotes?.ana || ''
          },
          {
            name: 'Pedro L.',
            role: t.testimonials?.roles?.boutiqueHotelOwner || '',
            location: 'Coimbra',
            rating: 5,
            quote: t.testimonials?.quotes?.pedro || ''
          },
          {
            name: 'Sofia T.',
            role: t.testimonials?.roles?.countrysideVillaHost || '',
            location: 'Aveiro',
            rating: 5,
            quote: t.testimonials?.quotes?.sofia || ''
          }
        ]
      },

      successStoriesSection: {
        title: t.successStories?.title || '',
        description: t.successStories?.description || '',
        readFullStoryButtonText: t.successStories?.readFullStory || '',
        propertyGalleryTitle: t.successStories?.propertyGallery || '',
        successBadge: t.successStories?.successBadge || '',
        caseStudy: t.successStories?.caseStudy || '',
        stories: (t.successStories?.stories || []).map((story, index) => ({
          name: story.name || '',
          property: story.property || '',
          location: story.location || '',
          story: story.story || '',
          fullStory: story.fullStory || '',
          results: (story.results || []).map((result, resultIndex) => ({
            iconName: ['TrendingUp', 'Calendar', 'Users', 'Award'][resultIndex] || 'CheckCircle',
            label: result.label || '',
            value: result.value || ''
          })),
          supportingImages: [] // You'll add images manually
        }))
      },

      howItWorksSection: {
        title: t.howItWorks?.title || '',
        description: t.howItWorks?.description || '',
        steps: [
          {
            iconName: 'MessageSquare',
            title: t.howItWorks?.steps?.reachOut?.title || '',
            description: t.howItWorks?.steps?.reachOut?.description || '',
            color: '#5FFF56'
          },
          {
            iconName: 'Search',
            title: t.howItWorks?.steps?.evaluation?.title || '',
            description: t.howItWorks?.steps?.evaluation?.description || '',
            color: '#00CFFF'
          },
          {
            iconName: 'UserPlus',
            title: t.howItWorks?.steps?.onboarding?.title || '',
            description: t.howItWorks?.steps?.onboarding?.description || '',
            color: '#5FFF56'
          },
          {
            iconName: 'Rocket',
            title: t.howItWorks?.steps?.goLive?.title || '',
            description: t.howItWorks?.steps?.goLive?.description || '',
            color: '#00CFFF'
          },
          {
            iconName: 'Heart',
            title: t.howItWorks?.steps?.enjoy?.title || '',
            description: t.howItWorks?.steps?.enjoy?.description || '',
            color: '#5FFF56'
          }
        ]
      },

      faqSection: {
        title: t.faq?.title || '',
        description: t.faq?.description || '',
        faqs: [
          {
            icon: 'Clock',
            question: t.faq?.questions?.setup?.question || '',
            answer: t.faq?.questions?.setup?.answer || ''
          },
          {
            icon: 'DollarSign',
            question: t.faq?.questions?.fees?.question || '',
            answer: t.faq?.questions?.fees?.answer || ''
          },
          {
            icon: 'FileCheck',
            question: t.faq?.questions?.compliance?.question || '',
            answer: t.faq?.questions?.compliance?.answer || ''
          },
          {
            icon: 'Phone',
            question: t.faq?.questions?.emergency?.question || '',
            answer: t.faq?.questions?.emergency?.answer || ''
          },
          {
            icon: 'Home',
            question: t.faq?.questions?.personal?.question || '',
            answer: t.faq?.questions?.personal?.answer || ''
          },
          {
            icon: 'Sparkles',
            question: t.faq?.questions?.cleaningFees?.question || '',
            answer: t.faq?.questions?.cleaningFees?.answer || ''
          },
          {
            icon: 'Calendar',
            question: t.faq?.questions?.cancellation?.question || '',
            answer: t.faq?.questions?.cancellation?.answer || ''
          },
          {
            icon: 'CreditCard',
            question: t.faq?.questions?.payment?.question || '',
            answer: t.faq?.questions?.payment?.answer || ''
          },
          {
            icon: 'FileText',
            question: t.faq?.questions?.contract?.question || '',
            answer: t.faq?.questions?.contract?.answer || ''
          },
          {
            icon: 'Users',
            question: t.faq?.questions?.cleaningTeam?.question || '',
            answer: t.faq?.questions?.cleaningTeam?.answer || ''
          }
        ]
      },

      ctaSection: {
        title: t.howItWorks?.cta?.title || '',
        description: t.howItWorks?.cta?.description || '',
        benefits: [
          {
            benefitText: t.howItWorks?.cta?.benefits?.platform || ''
          },
          {
            benefitText: t.howItWorks?.cta?.benefits?.specialist || ''
          },
          {
            benefitText: t.howItWorks?.cta?.benefits?.expertise || ''
          },
          {
            benefitText: t.howItWorks?.cta?.benefits?.compliance || ''
          }
        ],
        ctaButtonText: t.header?.cta?.getStartedToday || '',
        learnMoreButtonText: t.hero?.cta?.learnMore || '',
        learnMoreLink: '/learn-more',
        securityText: t.howItWorks?.cta?.ssl || '',
        supportText: t.howItWorks?.cta?.support || ''
      },

      contactSection: {
        getInTouchTitle: t.contact?.getInTouch || '',
        emailLabel: t.contact?.email?.label || '',
        emailValue: 'contact@smarthoster.io',
        phoneLabel: t.contact?.phone?.label || '',
        phoneValue: '+351 933 683 981',
        sslText: t.contact?.trust?.ssl || '',
        gdprText: t.contact?.trust?.gdpr || '',
        fullNameLabel: t.contact?.form?.fullName?.label || '',
        fullNamePlaceholder: t.contact?.form?.fullName?.placeholder || '',
        emailLabelForm: t.contact?.form?.email?.label || '',
        emailPlaceholder: t.contact?.form?.email?.placeholder || '',
        phoneLabelForm: t.contact?.form?.phone?.label || '',
        optionalText: t.contact?.form?.optional || '',
        phonePlaceholder: t.contact?.form?.phone?.placeholder || '',
        messageLabel: t.contact?.form?.message?.label || '',
        messagePlaceholder: t.contact?.form?.message?.placeholder || '',
        consentText: `${t.contact?.form?.consent?.text || ''} SmartHoster.io. ${t.contact?.form?.consent?.unsubscribe || ''} ${t.contact?.form?.consent?.privacy || ''}.`,
        privacyPolicyText: t.contact?.form?.consent?.privacy || '',
        unsubscribeText: t.contact?.form?.consent?.unsubscribe || '',
        submitButtonText: t.contact?.form?.submit || '',
        sendingText: t.contact?.form?.sending || '',
        validationTitle: t.contact?.form?.validation?.title || '',
        validationDescription: t.contact?.form?.validation?.description || '',
        errorTitle: t.contact?.form?.error?.title || '',
        errorDescription: t.contact?.form?.error?.description || '',
        successTitle: t.contact?.form?.success?.title || '',
        successDescription: t.contact?.form?.success?.description || '',
        successButtonText: t.contact?.form?.success?.button || '',
        emailSubject: t.contact?.form?.emailSubject || ''
      }
    }
  };
}

// Helper functions for feature mapping
function getIconName(key) {
  const iconMap = {
    maxIncome: 'DollarSign',
    fullService: 'Home',
    legalCompliance: 'FileCheck',
    automation: 'Zap',
    billing: 'CreditCard',
    directBookings: 'MousePointer',
    clientPortal: 'User',
    localExpertise: 'MapPin',
    greenPledge: 'Leaf'
  };
  return iconMap[key] || 'CheckCircle';
}

function getColorForFeature(key) {
  const colors = ['#5FFF56', '#00CFFF'];
  const index = ['maxIncome', 'fullService', 'legalCompliance', 'automation', 'billing', 'directBookings', 'clientPortal', 'localExpertise', 'greenPledge'].indexOf(key);
  return colors[index % 2];
}

function getRouteForFeature(key) {
  const routeMap = {
    maxIncome: '/income-strategy',
    fullService: '/full-service-management',
    legalCompliance: '/legal-compliance',
    automation: '/advanced-automation',
    billing: '/automated-billing',
    directBookings: '/enhanced-direct-bookings',
    clientPortal: '/portal',
    localExpertise: '/local-expertise',
    greenPledge: '/green-pledge'
  };
  return routeMap[key] || '/learn-more';
}

// Main import function for a specific locale
async function importHomePageForLocale(locale = 'en') {
  console.log(`🚀 Starting Home Page import to Strapi for locale: ${locale}...\n`);

  try {
    // Check if Strapi is accessible
    console.log('📡 Checking Strapi connection...');
    await strapiRequest('/home-page');
    console.log('✅ Strapi is accessible\n');

    // GET existing data first (to preserve structure) - with locale
    console.log(`📥 Fetching existing Home Page data for locale: ${locale}...`);
    let existingData = null;
    try {
      existingData = await strapiRequest(`/home-page?populate=*&locale=${locale}`);
      console.log('✅ Existing data fetched\n');
    } catch (error) {
      // 404 means entry doesn't exist for this locale - that's okay, we'll create it
      if (error.message.includes('404')) {
        console.log(`ℹ️  No existing entry for locale ${locale} - will create new entry\n`);
        existingData = null;
      } else {
        throw error;
      }
    }

    // Transform new data for this locale
    console.log(`📦 Transforming data from JSON files for locale: ${locale}...`);
    const newData = transformHomePageData(locale);
    console.log('✅ Data transformed\n');

    // Merge: Use new data but preserve IDs from existing if present
    // This helps Strapi v5 understand we're updating, not replacing
    const mergedData = { ...newData };
    
    // Note: Don't include documentId in the request body - Strapi doesn't allow it
    // The documentId is managed by Strapi internally

    console.log('📤 Sample data being sent:');
    console.log('   - featuresSection.features length:', mergedData.data.featuresSection?.features?.length || 0);
    console.log('   - aboutSection.values length:', mergedData.data.aboutSection?.values?.length || 0);
    console.log('   - testimonialsSection.testimonials length:', mergedData.data.testimonialsSection?.testimonials?.length || 0);
    
    // Update home page using PUT with locale parameter
    console.log(`💾 Importing Home Page data to Strapi for locale: ${locale}...`);
    const result = await strapiRequest(`/home-page?locale=${locale}`, 'PUT', mergedData);
    
    console.log('📥 Strapi Response:');
    console.log('   - Status: Success');
    console.log('   - Locale:', locale);
    if (result.data) {
      const resData = result.data;
      console.log('   - featuresSection.features in response:', resData.featuresSection?.features?.length || 0, 
        '(should be', mergedData.data.featuresSection?.features?.length || 0, ')');
      console.log('   - aboutSection.values in response:', resData.aboutSection?.values?.length || 0,
        '(should be', mergedData.data.aboutSection?.values?.length || 0, ')');
      
      // Check if arrays were saved
      if (resData.featuresSection?.features?.length === 0 && mergedData.data.featuresSection?.features?.length > 0) {
        console.log('\n⚠️  WARNING: Features array was not saved! This might be a Strapi v5 API format issue.');
        console.log('   Try manually adding features in Strapi Admin UI, then check if they appear.');
      }
    }
    
    console.log(`\n✅ Home Page imported successfully for locale: ${locale}!`);
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Strapi admin: http://localhost:1337/admin');
    console.log(`   2. Navigate to Content Manager → Single Types → Home Page (locale: ${locale})`);
    console.log('   3. Check if arrays (features, values, testimonials, etc.) are populated');
    console.log('   4. If arrays are empty, add at least one item manually in Strapi UI');
    console.log('   5. Click Publish (top right)');
    console.log('   6. Upload images manually (hero image, partner logos, etc.)\n');

    return result;
  } catch (error) {
    console.error(`❌ Error importing Home Page for locale ${locale}:`, error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Tip: You need to authenticate with Strapi.');
      console.log('   Option 1: Generate an API token in Strapi Admin → Settings → API Tokens');
      console.log('   Option 2: Set STRAPI_API_TOKEN in your .env file');
      console.log('   Option 3: Make sure "home-page" has public "find" and "update" permissions\n');
    }
    
    throw error;
  }
}

// Main import function - imports for all locales
async function importHomePage() {
  console.log('🚀 Starting Home Page import to Strapi for ALL locales...\n');
  console.log('📋 This will import data for: en, pt, fr\n');

  const locales = ['en', 'pt', 'fr'];
  const results = [];

  for (const locale of locales) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📍 Processing locale: ${locale.toUpperCase()}`);
      console.log('='.repeat(60));
      
      const result = await importHomePageForLocale(locale);
      results.push({ locale, success: true, result });
      
      // Small delay between imports to avoid rate limiting
      if (locale !== locales[locales.length - 1]) {
        console.log('\n⏳ Waiting 2 seconds before next locale...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Failed to import for locale ${locale}:`, error.message);
      results.push({ locale, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  results.forEach(({ locale, success }) => {
    console.log(`   ${locale.toUpperCase()}: ${success ? '✅ Success' : '❌ Failed'}`);
  });
  console.log('='.repeat(60) + '\n');

  return results;
}

// Run import
importHomePage()
  .then(() => {
    console.log('✨ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });

export { importHomePage, importHomePageForLocale, transformHomePageData };

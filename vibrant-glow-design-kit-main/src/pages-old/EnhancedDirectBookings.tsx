
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { getStrapiText } from "@/utils/strapi-helpers";
import { 
  DollarSign, 
  Brain, 
  RotateCcw, 
  Globe, 
  Bot, 
  Settings, 
  TrendingUp, 
  Phone,
  ArrowRight,
  CheckCircle,
  Search,
  Calendar,
  CreditCard,
  Mail,
  Repeat,
  MapPin
} from "lucide-react";

interface EnhancedDirectBookingsProps {
  strapiData?: any;
}

const EnhancedDirectBookings = ({ strapiData }: EnhancedDirectBookingsProps = {}) => {
  const { t } = useLanguage();

  // Extract sections from Strapi data (same pattern as FullServiceManagement)
  const hero = strapiData?.hero;
  const whatWeDo = strapiData?.whatWeDo;
  const includes = strapiData?.includes;
  const benefits = strapiData?.benefits;
  const benefitsList = strapiData?.benefitsList || [];
  const howItWorks = strapiData?.howItWorks;
  const steps = strapiData?.steps || [];
  const faqs = strapiData?.faqs || [];
  const cta = strapiData?.cta;

  // Get values with fallback: Strapi → Translations → Default (same pattern as FullServiceManagement)
  const getValue = (strapiPath: string, translationPath: string, defaultValue: string): string => {
    // Helper to get nested value - safely handles null/undefined
    const getNested = (obj: any, path: string) => {
      if (!obj || !path) return undefined;
      try {
        return path.split('.').reduce((o, k) => o?.[k], obj);
      } catch (e) {
        return undefined;
      }
    };
    
    // Try Strapi data first (only if strapiData exists)
    if (strapiData && strapiPath.includes('.')) {
      try {
        const value = getNested(strapiData, strapiPath);
        if (value) {
          const strapiText = getStrapiText(value);
          if (strapiText) return strapiText;
        }
      } catch (e) {
        // Silently fall through to translations
      }
    }
    
    // Fallback to translations
    try {
      const translationValue = getNested(t, translationPath);
      if (translationValue) return translationValue;
    } catch (e) {
      // Silently fall through to default
    }
    
    // Final fallback to default value
    return defaultValue;
  };

  // Helper to get icon component from iconName string
  const getIconFromName = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'DollarSign': DollarSign, 'TrendingUp': TrendingUp, 'Globe': Globe, 'Search': Search,
      'Calendar': Calendar, 'CreditCard': CreditCard, 'Mail': Mail, 'Repeat': Repeat,
      'Brain': Brain, 'Bot': Bot, 'Settings': Settings, 'Phone': Phone, 'MapPin': MapPin,
      'CheckCircle': CheckCircle, 'ArrowRight': ArrowRight, 'RotateCcw': RotateCcw
    };
    return iconMap[iconName] || CheckCircle; // Default icon
  };

  // Use Strapi data for whatWeDo features if available, otherwise use translations (same pattern as FullServiceManagement)
  const fallbackWhyMatter = [
    {
      icon: DollarSign,
      title: t.directBookings.whyMatter.commission.title,
      description: t.directBookings.whyMatter.commission.description,
      highlight: "15%+"
    },
    {
      icon: TrendingUp,
      title: t.directBookings.whyMatter.profit.title,
      description: t.directBookings.whyMatter.profit.description,
      highlight: "100%"
    }
  ];

  const whyDirectBookingsMatter = (whatWeDo?.features && whatWeDo.features.length > 0) ? whatWeDo.features.map((feature: any, index: number) => {
    const IconComponent = getIconFromName(feature?.iconName || 'DollarSign');
    return {
      icon: IconComponent,
      title: getStrapiText(feature?.title) || '',
      description: getStrapiText(feature?.description) || '',
      highlight: index === 0 ? "15%+" : "100%"
    };
  }) : fallbackWhyMatter;

  // Use Strapi data for howItWorks features if available (same pattern as FullServiceManagement)
  const fallbackHowItWorks = [
    {
      icon: Globe,
      title: t.directBookings.howItWorks.brandedUrl.title,
      description: t.directBookings.howItWorks.brandedUrl.description
    },
    {
      icon: Search,
      title: t.directBookings.howItWorks.mobileFirst.title,
      description: t.directBookings.howItWorks.mobileFirst.description
    },
    {
      icon: Calendar,
      title: t.directBookings.howItWorks.builtIn.title,
      description: t.directBookings.howItWorks.builtIn.description
    },
    {
      icon: CreditCard,
      title: t.directBookings.howItWorks.directBooking.title,
      description: t.directBookings.howItWorks.directBooking.description
    }
  ];

  const howItWorksData = (howItWorks?.features && howItWorks.features.length > 0) ? howItWorks.features.map((feature: any) => {
    const IconComponent = getIconFromName(feature?.iconName || 'Globe');
    return {
      icon: IconComponent,
      title: getStrapiText(feature?.title) || '',
      description: getStrapiText(feature?.description) || ''
    };
  }) : fallbackHowItWorks;

  const lifetimeValue = [
    {
      icon: Mail,
      title: t.directBookings.lifetimeValue.captures.title,
      description: t.directBookings.lifetimeValue.captures.description
    },
    {
      icon: Repeat,
      title: t.directBookings.lifetimeValue.followUp.title,
      description: t.directBookings.lifetimeValue.followUp.description
    },
    {
      icon: TrendingUp,
      title: t.directBookings.lifetimeValue.newsletters.title,
      description: t.directBookings.lifetimeValue.newsletters.description
    }
  ];

  const googleFeatures = [
    t.directBookings.google.features.findInSearch,
    t.directBookings.google.features.bookWithoutAirbnb,
    t.directBookings.google.features.discoverProperty
  ];

  const aiStrategies = [
    t.directBookings.aiOptimization.strategies.structured,
    t.directBookings.aiOptimization.strategies.fastAnswers,
    t.directBookings.aiOptimization.strategies.semantic,
    t.directBookings.aiOptimization.strategies.aiDirectories,
    t.directBookings.aiOptimization.strategies.llmReadable
  ];

  const includedFeatures = [
    t.directBookings.included.seoOptimized,
    t.directBookings.included.googleBusiness,
    t.directBookings.included.integratedPayments,
    t.directBookings.included.liveCalendar,
    t.directBookings.included.guestData,
    t.directBookings.included.automatedFollowUp,
    t.directBookings.included.repeatGuest,
    t.directBookings.included.otaSync,
    t.directBookings.included.brandFirst,
    t.directBookings.included.totalControl
  ];

  const whyItWorks = [
    t.directBookings.whyItWorks.higherEarnings,
    t.directBookings.whyItWorks.noCommission,
    t.directBookings.whyItWorks.calendarControl,
    t.directBookings.whyItWorks.googleAI,
    t.directBookings.whyItWorks.repeatBookings,
    t.directBookings.whyItWorks.longTerm
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {getStrapiText(hero?.headline) || getValue('hero.headline', 'directBookings.hero.title', t.directBookings.hero.title)}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {getStrapiText(hero?.subheadline) || getValue('hero.subheadline', 'directBookings.hero.description', t.directBookings.hero.description)}
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {t.directBookings.hero.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Direct Bookings Matter */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 rounded-2xl p-8 mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getStrapiText(whatWeDo?.title) || getValue('whatWeDo.title', 'directBookings.whyMatter.title', t.directBookings.whyMatter.title)}
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {getStrapiText(whatWeDo?.description) || getValue('whatWeDo.description', 'directBookings.whyMatter.description', t.directBookings.whyMatter.description)}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t.directBookings.whyMatter.solution}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {getStrapiText(howItWorks?.title) || getValue('howItWorks.title', 'directBookings.howItWorks.title', t.directBookings.howItWorks.title)}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {howItWorksData.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-xl flex items-center justify-center mr-4">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8">
                <p className="text-gray-700 text-center italic text-lg leading-relaxed">
                  {getStrapiText(howItWorks?.description) || getValue('howItWorks.description', 'directBookings.howItWorks.subtitle', t.directBookings.howItWorks.subtitle)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lifetime Value */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.lifetimeValue.title}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {(steps && steps.length > 0 ? steps.map((step: any) => ({
                  icon: Mail,
                  title: getStrapiText(step?.title) || '',
                  description: getStrapiText(step?.description) || ''
                })) : lifetimeValue).map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.lifetimeValue.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Visibility */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.google.title}
              </h2>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.directBookings.google.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {googleFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[#5FFF56] mr-3 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.google.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Optimization */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.aiOptimization.title}
              </h2>
              
              <div className="bg-blue-50 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.directBookings.aiOptimization.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Our AEO approach includes:</h4>
                  <div className="space-y-3">
                    {aiStrategies.map((strategy, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.aiOptimization.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.included.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <CheckCircle className="h-5 w-5 text-[#5FFF56] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.whyItWorks.title}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {whyItWorks.map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {t.directBookings.finalStatement.main}
                </p>
                <p className="text-gray-600 font-medium">
                  {t.directBookings.finalStatement.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                {getStrapiText(cta?.title) || getValue('cta.title', 'directBookings.cta.title', t.directBookings.cta.title)}
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {getStrapiText(cta?.description) || getValue('cta.description', 'directBookings.cta.description', t.directBookings.cta.description)}
              </p>
              <p className="text-lg text-white/80 mb-10">
                {t.directBookings.cta.subtitle}
              </p>
              
              <Button 
                asChild
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-10 py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link href={cta?.ctaLink || getValue('cta.ctaLink', 'directBookings.cta.link', '/learn-more')}>
                  <Phone className="mr-2 h-5 w-5" />
                  {getStrapiText(cta?.ctaText) || getValue('cta.ctaText', 'directBookings.cta.button', t.directBookings.cta.button)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EnhancedDirectBookings;

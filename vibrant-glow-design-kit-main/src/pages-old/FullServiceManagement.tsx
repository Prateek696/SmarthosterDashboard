import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from 'next/link';
import { getStrapiText } from "@/utils/strapi-helpers";
import { 
  Search, 
  Camera, 
  Calendar, 
  FileText, 
  Sparkles, 
  Cog, 
  MapPin,
  DollarSign,
  Users,
  Shield,
  BarChart3,
  CheckCircle,
  Star
} from "lucide-react";

interface FullServiceManagementProps {
  strapiData?: any;
}

const FullServiceManagement = ({ strapiData }: FullServiceManagementProps = {}) => {
  const { t } = useLanguage();

  // Extract sections from Strapi data (same pattern as About page)
  const hero = strapiData?.hero;
  const whatWeDo = strapiData?.whatWeDo;
  const includes = strapiData?.includes;
  const benefits = strapiData?.benefits;
  const benefitsList = strapiData?.benefitsList || [];
  const howItWorks = strapiData?.howItWorks;
  const steps = strapiData?.steps || [];
  const faqs = strapiData?.faqs || [];
  const cta = strapiData?.cta;

  // Get values with fallback: Strapi → Translations → Default (same pattern as About page)
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
      'Search': Search,
      'Camera': Camera,
      'Calendar': Calendar,
      'FileText': FileText,
      'Sparkles': Sparkles,
      'Cog': Cog,
      'MapPin': MapPin,
      'DollarSign': DollarSign,
      'Users': Users,
      'Shield': Shield,
      'BarChart3': BarChart3,
      'CheckCircle': CheckCircle,
      'Star': Star,
    };
    return iconMap[iconName] || Search; // Default to Search
  };

  // Fallback data arrays (used when Strapi data is not available)
  const fallbackHighlights = [
    { icon: Search, key: "alCompliance" },
    { icon: Search, key: "seoAeo" },
    { icon: FileText, key: "keywordRich" },
    { icon: MapPin, key: "googleBusiness" },
    { icon: Camera, key: "photography" },
    { icon: Users, key: "welcomeKits" },
    { icon: Calendar, key: "directBooking" }
  ];

  const fallbackServices = [
    { icon: Search, key: "aiOptimized" },
    { icon: Users, key: "bookingGuest" },
    { icon: FileText, key: "taxCompliance" },
    { icon: Sparkles, key: "cleaningMaintenance" },
    { icon: Calendar, key: "directBookingSite" },
    { icon: MapPin, key: "googleSeo" }
  ];

  const fallbackBenefits = [
    { icon: DollarSign, key: "maximizeIncome" },
    { icon: Search, key: "aeoAdvantage" },
    { icon: Shield, key: "fullCompliance" },
    { icon: BarChart3, key: "ownerDashboard" },
    { icon: CheckCircle, key: "guestReady" }
  ];

  const fallbackSteps = [
    { icon: Users, number: "1", key: "consultation" },
    { icon: Cog, number: "2", key: "liveManagement" },
    { icon: BarChart3, number: "3", key: "growthReporting" }
  ];

  const fallbackFaqs = [
    { key: "whatIncludes" },
    { key: "howOptimized" },
    { key: "ownCleaner" },
    { key: "platforms" },
    { key: "maintenance" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {getStrapiText(hero?.headline) || getValue('hero.headline', 'fullService.hero.headline', 'Comprehensive Property Management You Can Rely On')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {getStrapiText(hero?.subheadline) || getValue('hero.subheadline', 'fullService.hero.subheadline', 'From guest communication to cleaning, bookings, and tax compliance—we do it all.')}
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
            >
              <Link href={hero?.ctaLink || '/contact'}>
                {getStrapiText(hero?.ctaText) || getValue('hero.ctaText', 'fullService.hero.cta', 'Schedule a Free Consultation')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {getStrapiText(whatWeDo?.title) || getValue('whatWeDo.title', 'fullService.whatWeDo.title', 'Everything Your Rental Needs, All in One Place')}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {getStrapiText(whatWeDo?.description) || getValue('whatWeDo.description', 'fullService.whatWeDo.description', 'SmartHoster provides an all-inclusive management solution tailored for short-term rental owners.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(whatWeDo?.features && whatWeDo.features.length > 0) ? whatWeDo.features.map((feature: any, index: number) => {
                const IconComponent = getIconFromName(feature?.iconName || 'Search');
                return (
                  <Card key={index} className="border-2 border-gray-100 hover:border-[#5FFF56] transition-colors">
                    <CardHeader className="text-center">
                      <IconComponent className="h-12 w-12 text-[#5FFF56] mx-auto mb-4" />
                      <CardTitle className="text-lg">
                        {getStrapiText(feature?.title) || ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">
                        {getStrapiText(feature?.description) || ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              }) : fallbackHighlights.map((highlight, index) => (
                <Card key={index} className="border-2 border-gray-100 hover:border-[#5FFF56] transition-colors">
                  <CardHeader className="text-center">
                    <highlight.icon className="h-12 w-12 text-[#5FFF56] mx-auto mb-4" />
                    <CardTitle className="text-lg">
                      {t.fullService.whatWeDo.highlights[highlight.key].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      {t.fullService.whatWeDo.highlights[highlight.key].description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-Service Includes Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {getStrapiText(includes?.title) || getValue('includes.title', 'fullService.includes.title', 'SmartHoster Full-Service Includes')}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(includes?.features && includes.features.length > 0) ? includes.features.map((feature: any, index: number) => {
                const IconComponent = getIconFromName(feature?.iconName || 'Search');
                return (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#5FFF56]">
                    <div className="flex items-start space-x-4">
                      <IconComponent className="h-8 w-8 text-[#5FFF56] mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {getStrapiText(feature?.title) || ''}
                        </h3>
                        <p className="text-gray-600">
                          {getStrapiText(feature?.description) || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }) : fallbackServices.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#5FFF56]">
                  <div className="flex items-start space-x-4">
                    <service.icon className="h-8 w-8 text-[#5FFF56] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t.fullService.includes.services[service.key].title}
                      </h3>
                      <p className="text-gray-600">
                        {t.fullService.includes.services[service.key].description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {getStrapiText(benefits?.title) || getValue('benefits.title', 'fullService.whyChoose.title', 'Why Choose Our Full-Service Property Management?')}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                {getStrapiText(benefits?.description) || getValue('benefits.description', 'fullService.whyChoose.description', 'We go beyond basic hosting tools.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(benefitsList && benefitsList.length > 0) ? benefitsList.map((benefit: any, index: number) => {
                const IconComponent = getIconFromName(benefit?.iconName || 'CheckCircle');
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <IconComponent className="h-16 w-16 text-[#5FFF56] mx-auto mb-4" />
                      <CardTitle className="text-xl">
                        {getStrapiText(benefit?.title) || ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        {getStrapiText(benefit?.description) || ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              }) : fallbackBenefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <benefit.icon className="h-16 w-16 text-[#5FFF56] mx-auto mb-4" />
                    <CardTitle className="text-xl">
                      {t.fullService.whyChoose.benefits[benefit.key].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t.fullService.whyChoose.benefits[benefit.key].description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {getStrapiText(howItWorks?.title) || getValue('howItWorks.title', 'fullService.process.title', 'Our Process in 3 Simple Steps')}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {(steps && steps.length > 0) ? steps.map((step: any, index: number) => {
                const IconComponent = getIconFromName(step?.iconName || 'CheckCircle');
                return (
                  <div key={index} className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-black">{step?.number || (index + 1)}</span>
                      </div>
                      <IconComponent className="h-12 w-12 text-gray-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {getStrapiText(step?.title) || ''}
                    </h3>
                    <p className="text-gray-600">
                      {getStrapiText(step?.description) || ''}
                    </p>
                  </div>
                );
              }) : fallbackSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-black">{step.number}</span>
                    </div>
                    <step.icon className="h-12 w-12 text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t.fullService.process.steps[step.key].title}
                  </h3>
                  <p className="text-gray-600">
                    {t.fullService.process.steps[step.key].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.faqs.title}
              </h2>
            </div>

            <div className="space-y-6">
              {(faqs && faqs.length > 0) ? faqs.map((faq: any, index: number) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left">
                      {getStrapiText(faq?.question) || ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {getStrapiText(faq?.answer) || ''}
                    </p>
                  </CardContent>
                </Card>
              )) : fallbackFaqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left">
                      {t.fullService.faqs.questions[faq.key].question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t.fullService.faqs.questions[faq.key].answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {getStrapiText(cta?.title) || getValue('cta.title', 'fullService.finalCta.title', 'Ready to Simplify Your Property Management?')}
            </h2>
            {(getStrapiText(cta?.description) || getValue('cta.description', '', '')) && (
              <p className="text-lg text-gray-300 mb-6">
                {getStrapiText(cta?.description) || getValue('cta.description', '', '')}
              </p>
            )}
            <Button 
              asChild
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
            >
              <Link href={cta?.ctaLink || '/contact'}>
                {getStrapiText(cta?.ctaText) || getValue('cta.ctaText', 'fullService.finalCta.button', 'Schedule a Free Consultation')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FullServiceManagement;

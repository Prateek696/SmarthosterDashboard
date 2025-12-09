import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStrapiText } from "@/utils/strapi-helpers";
import { 
  MapPin, 
  CheckCircle, 
  Users,
  Home,
  ClipboardCheck,
  Eye,
  Baby,
  Award,
  MessageSquare
} from "lucide-react";
import CalendlyButton from "@/components/CalendlyButton";
import algarveHouses from "@/assets/algarve-villa-pool.jpg";
import portugalMapPins from "@/assets/portugal-map-clean.png";
import babyAmenitiesPortugal from "@/assets/baby-amenities-portugal.jpg";

interface LocalExpertiseProps {
  strapiData?: any;
}

const LocalExpertise = ({ strapiData }: LocalExpertiseProps = {}) => {
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
      'MapPin': MapPin, 'CheckCircle': CheckCircle, 'Users': Users, 'Home': Home,
      'ClipboardCheck': ClipboardCheck, 'Eye': Eye, 'Baby': Baby, 'Award': Award,
      'MessageSquare': MessageSquare
    };
    return iconMap[iconName] || CheckCircle; // Default icon
  };

  const assessmentItems = [
    { key: "bedComfort", icon: Home },
    { key: "pillows", icon: Home },
    { key: "shower", icon: Home },
    { key: "climate", icon: Home },
    { key: "noise", icon: Home },
    { key: "lighting", icon: Home },
    { key: "baby", icon: Baby },
    { key: "kitchen", icon: Home },
    { key: "tech", icon: Home },
    { key: "local", icon: MapPin },
    { key: "arrival", icon: CheckCircle }
  ];

  const optimizationServices = [
    { key: "pricing", icon: Award },
    { key: "targeting", icon: Users },
    { key: "amenities", icon: Home },
    { key: "language", icon: MessageSquare }
  ];

  const localServices = [
    { key: "events", icon: MapPin },
    { key: "legal", icon: CheckCircle },
    { key: "benchmark", icon: Award },
    { key: "decisions", icon: Eye }
  ];

  // Fallback FAQs (used when Strapi data is not available)
  const fallbackFaqs = [
    { key: "localVsOnline" },
    { key: "followRecommendations" },
    { key: "visitSpeed" },
    { key: "consultationCost" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {getStrapiText(hero?.headline) || getValue('hero.headline', 'localExpertise.hero.headline', t.localExpertise.hero.headline)}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {getStrapiText(hero?.subheadline) || getValue('hero.subheadline', 'localExpertise.hero.subheadline', t.localExpertise.hero.subheadline)}
            </p>
            <div className="mb-8">
              <img 
                src={typeof algarveHouses === 'string' ? algarveHouses : algarveHouses.src} 
                alt="Beautiful Algarve coastline with vacation rental properties" 
                className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            <CalendlyButton
              calendlyUrl="https://calendly.com/admin-smarthoster"
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
              utmSource="local-expertise"
              utmMedium="website"
              utmCampaign="book-consultation"
              utmContent="hero-cta"
            >
              {getStrapiText(hero?.ctaText) || getValue('hero.ctaText', 'localExpertise.hero.cta', t.localExpertise.hero.cta)}
            </CalendlyButton>
          </div>
        </div>
      </section>

      {/* Why Local Expertise Matters */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  {getStrapiText(whatWeDo?.title) || getValue('whatWeDo.title', 'localExpertise.whyLocal.title', t.localExpertise.whyLocal.title)}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getStrapiText(whatWeDo?.description) || getValue('whatWeDo.description', 'localExpertise.whyLocal.description', t.localExpertise.whyLocal.description)}
                </p>
              </div>
              <div className="text-center">
                <MapPin className="h-32 w-32 text-[#5FFF56] mx-auto mb-4" />
                <img 
                  src={typeof portugalMapPins === 'string' ? portugalMapPins : portugalMapPins.src} 
                  alt="Portugal map with vacation rental location pins" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.localExpertise.consultation.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {t.localExpertise.consultation.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(whatWeDo?.features && whatWeDo.features.length > 0) ? whatWeDo.features.map((feature: any, index: number) => {
                const IconComponent = getIconFromName(feature?.iconName || 'Home');
                return (
                  <Card key={index} className="border-l-4 border-[#5FFF56] hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-start space-y-0 space-x-4">
                      <IconComponent className="h-6 w-6 text-[#5FFF56] mt-1 flex-shrink-0" />
                      <div>
                        <CardTitle className="text-base">
                          {getStrapiText(feature?.title) || getStrapiText(feature?.description) || ''}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                );
              }) : assessmentItems.map((item, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56] hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start space-y-0 space-x-4">
                    <item.icon className="h-6 w-6 text-[#5FFF56] mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-base">
                        {t.localExpertise.consultation.assessments[item.key]}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market Optimization */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.localExpertise.marketOptimization.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.localExpertise.marketOptimization.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {optimizationServices.map((service, index) => (
                <Card key={index} className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start space-y-0 space-x-4">
                    <service.icon className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">
                        {t.localExpertise.marketOptimization.services[service.key]}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">
                {t.localExpertise.marketOptimization.goal}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Eyes and Ears */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.localExpertise.localEyes.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.localExpertise.localEyes.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {localServices.map((service, index) => (
                <Card key={index} className="bg-white border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start space-y-0 space-x-4">
                    <service.icon className="h-8 w-8 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">
                        {t.localExpertise.localEyes.services[service.key]}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">
                {t.localExpertise.localEyes.conclusion}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Baby Gear Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  {t.localExpertise.babyGear.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {t.localExpertise.babyGear.description}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t.localExpertise.babyGear.details}
                </p>
              </div>
              <div className="text-center">
                <Baby className="h-32 w-32 text-[#5FFF56] mx-auto mb-4" />
                <img 
                  src={typeof babyAmenitiesPortugal === 'string' ? babyAmenitiesPortugal : babyAmenitiesPortugal.src} 
                  alt="Family-friendly vacation rental with baby amenities and portable crib" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Assessment */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {getStrapiText(cta?.title) || getValue('cta.title', 'localExpertise.freeAssessment.title', t.localExpertise.freeAssessment.title)}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {getStrapiText(cta?.description) || getValue('cta.description', 'localExpertise.freeAssessment.description', t.localExpertise.freeAssessment.description)}
            </p>
            <p className="text-lg font-medium text-gray-800 mb-8">
              {getStrapiText(cta?.description) || getValue('cta.description', 'localExpertise.freeAssessment.note', t.localExpertise.freeAssessment.note)}
            </p>
            <CalendlyButton
              calendlyUrl="https://calendly.com/admin-smarthoster"
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
              utmSource="local-expertise"
              utmMedium="website"
              utmCampaign="book-consultation"
              utmContent="assessment-cta"
            >
              {getStrapiText(cta?.ctaText) || getValue('cta.ctaText', 'localExpertise.freeAssessment.cta', t.localExpertise.freeAssessment.cta)}
            </CalendlyButton>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.localExpertise.faqs.title}
              </h2>
            </div>

            <div className="space-y-6">
              {(faqs && faqs.length > 0) ? faqs.map((faq: any, index: number) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5FFF56] mr-3 mt-1 flex-shrink-0" />
                      {getStrapiText(faq?.question) || ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 ml-8">
                      {getStrapiText(faq?.answer) || ''}
                    </p>
                  </CardContent>
                </Card>
              )) : fallbackFaqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5FFF56] mr-3 mt-1 flex-shrink-0" />
                      {t.localExpertise.faqs.questions[faq.key].question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 ml-8">
                      {t.localExpertise.faqs.questions[faq.key].answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LocalExpertise;

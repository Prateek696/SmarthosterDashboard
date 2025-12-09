
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Shield, Award, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from '@/utils/next-compat';
import { getStrapiImageUrl, getStrapiImageAlt, getStrapiText, extractComponent } from "@/utils/strapi-helpers";
// import Image from 'next/image' // Using regular img in Vite;

interface HeroProps {
  strapiData?: any; // Optional Strapi homepage data
}

const Hero = ({ strapiData }: HeroProps = {}) => {
  const { t } = useLanguage();
  
  // Extract Hero section from Strapi data - try multiple ways
  let heroSection = null;
  if (strapiData) {
    // Try direct access first (most common)
    if (strapiData.heroSection) {
      heroSection = strapiData.heroSection;
    }
    
    // Try extractComponent helper
    if (!heroSection) {
      heroSection = extractComponent(strapiData, 'heroSection');
    }
    
    // Also try attributes path
    if (!heroSection && strapiData.attributes?.heroSection) {
      heroSection = strapiData.attributes.heroSection;
    }
  }
  
  // Debug logs removed - Strapi integration working! ✅
  
  // Helper function to get value with fallback: Strapi → Translations → Default
  const getValue = (strapiPath: string, translationPath: string, defaultValue: string): string => {
    if (heroSection) {
      const value = getStrapiText(heroSection[strapiPath]);
      if (value) return value;
    }
    // Fallback to translations
    const translationValue = translationPath.split('.').reduce((obj: any, key: string) => obj?.[key], t);
    return translationValue || defaultValue;
  };
  
  // Get hero content with fallback
  const trustBadge = getValue('trustBadge', 'hero.trustBadge', 'Trusted by Property Owners throughout Portugal');
  
  // Get title and description from Strapi - try multiple paths
  const strapiTitle = heroSection?.title || strapiData?.heroSection?.title;
  const strapiDescription = heroSection?.description || strapiData?.heroSection?.description;
  
  // Always prefer multi-line title (titleLine1-4) for colorful display
  // Only use simple title if multi-line fields are not available
  let titleLine1, titleLine2, titleLine3, titleLine4;
  
  // Check if Strapi has multi-line title fields
  const hasMultiLineTitle = heroSection?.titleLine1 || heroSection?.titleLine2 || heroSection?.titleLine3 || heroSection?.titleLine4;
  
  if (hasMultiLineTitle) {
    // Use Strapi multi-line titles
    titleLine1 = getValue('titleLine1', 'hero.title.empowering', 'Empowering');
    titleLine2 = getValue('titleLine2', 'hero.title.hosts', 'Hosts');
    titleLine3 = getValue('titleLine3', 'hero.title.simplifying', 'Simplifying');
    titleLine4 = getValue('titleLine4', 'hero.title.stays', 'Stays');
  } else if (strapiTitle) {
    // If Strapi has only a simple title, split it for multi-line display
    // Try to split on commas for better formatting
    const parts = strapiTitle.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      titleLine1 = parts[0] || 'Empowering';
      titleLine2 = parts[1] || 'Hosts';
      titleLine3 = parts[2] || 'Simplifying';
      titleLine4 = parts[3] || 'Stays';
    } else {
      // Fallback: split on spaces if no commas
      const words = strapiTitle.split(' ');
      if (words.length >= 4) {
        titleLine1 = words.slice(0, 1).join(' ');
        titleLine2 = words.slice(1, 2).join(' ');
        titleLine3 = words.slice(2, 3).join(' ');
        titleLine4 = words.slice(3).join(' ');
      } else {
        // Last resort: use translation fallback
        titleLine1 = getValue('titleLine1', 'hero.title.empowering', 'Empowering');
        titleLine2 = getValue('titleLine2', 'hero.title.hosts', 'Hosts');
        titleLine3 = getValue('titleLine3', 'hero.title.simplifying', 'Simplifying');
        titleLine4 = getValue('titleLine4', 'hero.title.stays', 'Stays');
      }
    }
  } else {
    // Use translation fallback
    titleLine1 = getValue('titleLine1', 'hero.title.empowering', 'Empowering');
    titleLine2 = getValue('titleLine2', 'hero.title.hosts', 'Hosts');
    titleLine3 = getValue('titleLine3', 'hero.title.simplifying', 'Simplifying');
    titleLine4 = getValue('titleLine4', 'hero.title.stays', 'Stays');
  }
  
  // Use Strapi description if available, otherwise fallback
  const description = strapiDescription || getValue('description', 'hero.description', 'Professional property management platform that maximizes rental income while minimizing workload');
  const primaryCtaText = getValue('primaryCtaText', 'header.cta.getStartedToday', 'Get Started Today');
  const primaryCtaLink = heroSection?.primaryCtaLink || 'https://calendly.com/admin-smarthoster';
  const secondaryCtaText = getValue('secondaryCtaText', 'hero.cta.learnMore', 'Learn More');
  const secondaryCtaLink = heroSection?.secondaryCtaLink || '/learn-more';
  
  // Get hero image
  const heroImage = heroSection?.heroImage;
  const heroImageUrl = heroImage ? getStrapiImageUrl(heroImage) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const heroImageAlt = heroImage ? getStrapiImageAlt(heroImage) : 'Modern luxury apartment';
  
  // Get metrics from Strapi or fallback
  const metrics = heroSection?.metrics || [];
  const metric1 = metrics[0] || { value: '+35%', label: 'Income Increase', position: 'top-left', color: '#5FFF56' };
  const metric2 = metrics[1] || { value: '100%', label: 'Legal Compliance', position: 'bottom-right', color: '#00CFFF' };
  const metric3 = metrics[2] || { value: '24/7', label: 'Support', position: 'middle-right', color: '#00CFFF' };
  
  // Get trust badges from Strapi or fallback
  const trustBadges = heroSection?.trustBadges || [];
  const trustBadge1 = trustBadges[0] || { title: 'SSL Certified', subtitle: 'Bank-level Security' };
  const trustBadge2 = trustBadges[1] || { title: 'Google Verified', subtitle: 'Trusted Business' };
  
  // Translation logs removed - using Strapi data now
  
  return (
    <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden pt-2 sm:pt-4">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-[#5FFF56]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#5FFF56]/30 shadow-lg">
              <Award className="w-4 h-4 text-[#5FFF56] mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">{trustBadge}</span>
            </div>
            
            <div className="space-y-4">
              {/* Display title - always use multi-line colorful format */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                {titleLine1 && (
                  <span className="block">{titleLine1}</span>
                )}
                {titleLine2 && (
                  <span className="block text-transparent bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] bg-clip-text">
                    {titleLine2}
                  </span>
                )}
                {titleLine3 && (
                  <span className="block text-gray-900">
                    {titleLine3}
                  </span>
                )}
                {titleLine4 && (
                  <span className="block text-[#00CFFF]">
                    {titleLine4.replace('™', '')}<span className="text-xs align-super text-[#00CFFF]">™</span>
                  </span>
                )}
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                {description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <CalendlyButton
                calendlyUrl={primaryCtaLink}
                className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-bold px-8 py-4 h-auto text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                utmSource="hero"
                utmMedium="website"
                utmCampaign="get-started"
                utmContent="primary-cta"
              >
                {primaryCtaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </CalendlyButton>
              
              <Button asChild variant="outline" className="border-2 border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white px-8 py-4 h-auto text-base rounded-xl transition-all duration-300 group font-semibold">
                <Link href={secondaryCtaLink}>
                  <Play className="mr-2 h-5 w-5" />
                  {secondaryCtaText}
                </Link>
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold text-gray-900">{trustBadge1.title}</div>
                  <div className="text-xs text-gray-600">{trustBadge1.subtitle}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold text-gray-900">{trustBadge2.title}</div>
                  <div className="text-xs text-gray-600">{trustBadge2.subtitle}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in order-first lg:order-last">
            <div className="relative z-10">
              {heroImageUrl && (
                <Image
                  src={heroImageUrl}
                  alt={heroImageAlt}
                  width={800}
                  height={500}
                  className="w-full h-[280px] sm:h-[350px] lg:h-[450px] xl:h-[500px] object-cover rounded-2xl shadow-2xl border border-white/20"
                  priority
                />
              )}
              
              {/* Floating metrics */}
              {metric1 && (
                <div className={`absolute ${metric1.position === 'top-left' ? 'top-4 left-4' : metric1.position === 'top-right' ? 'top-4 right-4' : metric1.position === 'bottom-left' ? 'bottom-4 left-4' : metric1.position === 'bottom-right' ? 'bottom-4 right-4' : 'top-1/2 right-0 transform translate-x-2'} bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20`}>
                  <div className={`text-lg sm:text-xl font-bold mb-1`} style={{ color: metric1.color || '#5FFF56' }}>
                    {metric1.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{metric1.label}</div>
                </div>
              )}
              
              {metric2 && (
                <div className={`absolute ${metric2.position === 'top-left' ? 'top-4 left-4' : metric2.position === 'top-right' ? 'top-4 right-4' : metric2.position === 'bottom-left' ? 'bottom-4 left-4' : metric2.position === 'bottom-right' ? 'bottom-4 right-4' : 'top-1/2 right-0 transform translate-x-2'} bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20`}>
                  <div className={`text-lg sm:text-xl font-bold mb-1`} style={{ color: metric2.color || '#00CFFF' }}>
                    {metric2.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{metric2.label}</div>
                </div>
              )}
              
              {metric3 && (
                <div className={`absolute ${metric3.position === 'top-left' ? 'top-4 left-4' : metric3.position === 'top-right' ? 'top-4 right-4' : metric3.position === 'bottom-left' ? 'bottom-4 left-4' : metric3.position === 'bottom-right' ? 'bottom-4 right-4' : 'top-1/2 right-0 transform translate-x-2'} bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20`}>
                  <div className={`text-sm font-bold mb-1`} style={{ color: metric3.color || '#00CFFF' }}>
                    {metric3.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{metric3.label}</div>
                </div>
              )}
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#5FFF56]/10 via-transparent to-[#00CFFF]/10 rounded-2xl transform rotate-2 scale-105 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

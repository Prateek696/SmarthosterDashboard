
import { Shield, Database, Lock, TrendingUp, CheckCircle, Globe, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { extractComponent, getStrapiText, formatStrapiArray } from "@/utils/strapi-helpers";

interface IntegrationsProps {
  strapiData?: any; // Optional Strapi homepage data
}

const Integrations = ({ strapiData }: IntegrationsProps = {}) => {
  const { t } = useLanguage();
  
  // Extract Integrations section from Strapi data
  let integrationsSection = null;
  if (strapiData) {
    if (strapiData.integrationsSection) {
      integrationsSection = strapiData.integrationsSection;
    }
    if (!integrationsSection) {
      integrationsSection = extractComponent(strapiData, 'integrationsSection');
    }
    if (!integrationsSection && strapiData.attributes?.integrationsSection) {
      integrationsSection = strapiData.attributes.integrationsSection;
    }
  }
  
  // Helper function to get value with fallback
  const getValue = (strapiPath: string, translationPath: string, defaultValue: string): string => {
    if (integrationsSection) {
      const value = getStrapiText(integrationsSection[strapiPath]);
      if (value) return value;
    }
    const translationValue = translationPath.split('.').reduce((obj: any, key: string) => obj?.[key], t);
    return translationValue || defaultValue;
  };
  
  // Get title and description
  const title = getValue('title', 'integrations.title', 'Powerful Integrations');
  const description = getValue('description', 'integrations.description', 'Connect with leading platforms');
  const ctaTitle = getValue('ctaTitle', 'integrations.cta.title', 'Ready to Experience Seamless Integration?');
  const ctaDescription = getValue('ctaDescription', 'integrations.cta.description', 'Discover how our integrations can transform');
  const ctaButtonText = getValue('ctaButtonText', 'integrations.cta.button', 'View All Integrations');
  const ctaButtonLink = integrationsSection?.ctaButtonLink || '/integrations';
  const gdprText = getValue('gdprText', 'integrations.cta.gdpr', 'GDPR Compliant');
  
  // Get stats from Strapi or fallback
  const strapiStats = formatStrapiArray(integrationsSection?.integrationStats || []);
  const iconMap: Record<string, any> = {
    'Globe': Globe,
    'Shield': Shield,
    'TrendingUp': TrendingUp
  };
  
  const integrationStats = strapiStats.length > 0 ? strapiStats.map((stat: any) => ({
    icon: iconMap[stat.iconName] || Globe,
    number: getStrapiText(stat.number) || '',
    label: getStrapiText(stat.label) || '',
    description: getStrapiText(stat.description) || ''
  })) : [
    {
      icon: Globe,
      number: "70+",
      label: t?.integrations?.stats?.platforms?.label || "Connected Platforms",
      description: t?.integrations?.stats?.platforms?.description || "Leading property management platforms"
    },
    {
      icon: Shield,
      number: "100%",
      label: t?.integrations?.stats?.compliance?.label || "Compliance Coverage", 
      description: t?.integrations?.stats?.compliance?.description || "Full regulatory compliance"
    },
    {
      icon: TrendingUp,
      number: "99.9%",
      label: t?.integrations?.stats?.uptime?.label || "System Uptime",
      description: t?.integrations?.stats?.uptime?.description || "Reliable performance"
    }
  ];

  // Get benefits from Strapi or fallback
  const strapiBenefits = formatStrapiArray(integrationsSection?.benefits || []);
  const benefitIconMap: Record<string, any> = {
    'Database': Database,
    'FileCheck': FileCheck,
    'Lock': Lock
  };
  
  const benefits = strapiBenefits.length > 0 ? strapiBenefits.map((ben: any) => ({
    icon: benefitIconMap[ben.iconName] || Database,
    title: getStrapiText(ben.title) || '',
    description: getStrapiText(ben.description) || ''
  })) : [
    {
      icon: Database,
      title: t?.integrations?.benefits?.operations?.title || "Streamlined Operations",
      description: t?.integrations?.benefits?.operations?.description || "Automated property management workflows"
    },
    {
      icon: FileCheck,
      title: t?.integrations?.benefits?.legal?.title || "Legal Compliance",
      description: t?.integrations?.benefits?.legal?.description || "Automated legal requirements handling"
    },
    {
      icon: Lock,
      title: t?.integrations?.benefits?.visibility?.title || "Enhanced Visibility",
      description: t?.integrations?.benefits?.visibility?.description || "Complete oversight of your properties"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-[#5FFF56]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {description}
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {integrationStats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-gray-200/50">
                <stat.icon className="h-8 w-8 text-[#00CFFF]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-base font-semibold text-gray-800 mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                <benefit.icon className="h-8 w-8 text-[#5FFF56]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl p-6 lg:p-12 border border-gray-200/50 max-w-4xl mx-auto">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              {ctaTitle}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 max-w-2xl mx-auto">
              {ctaDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                asChild
                className="bg-[#00CFFF] hover:bg-[#00BFEF] text-white font-bold px-6 lg:px-8 py-3 h-12 text-sm lg:text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Link href={ctaButtonLink}>
                  {ctaButtonText}
                </Link>
              </Button>
              
              {/* GDPR Badge */}
              <div className="inline-flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-semibold text-gray-800">{gdprText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;

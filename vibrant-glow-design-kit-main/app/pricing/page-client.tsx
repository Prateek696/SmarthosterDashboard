'use client';

import Layout from "@/components/Layout";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendlyButton from "@/components/CalendlyButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStrapiText, formatStrapiArray } from "@/utils/strapi-helpers";

interface PricingPageClientProps {
  strapiData?: any; // Strapi pricing page data
}

export default function PricingPageClient({ strapiData }: PricingPageClientProps = {}) {
  const { t } = useLanguage();

  // Helper function to get value with fallback - safely handles null strapiData
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

  // Extract sections from Strapi data (matching new schema structure)
  // New schema: heroTitle, heroSubtitle, basicPlan, premiumPlan, superPremiumPlan, setupPackage, upgradePackage, compliancePackage, trustTitle, trustPoints, footerTitle, footerButtonText
  
  // Hero section - direct fields
  const heroTitle = getStrapiText(strapiData?.heroTitle) || getValue('heroTitle', 'pricing.title', 'Our Services, Clearly Defined');
  const heroSubtitle = getStrapiText(strapiData?.heroSubtitle) || getValue('heroSubtitle', 'pricing.subtitle', 'We believe in transparency, accountability, and doing the work.');

  // Plans - component structure
  const basicPlan = strapiData?.basicPlan || {};
  const premiumPlan = strapiData?.premiumPlan || {};
  const superPremiumPlan = strapiData?.superPremiumPlan || {};

  const basicPlanData = {
    name: getStrapiText(basicPlan.name) || getValue('plans.basic.name', 'pricing.plans.basic.name', 'BASIC'),
    fee: getStrapiText(basicPlan.fee) || getValue('plans.basic.fee', 'pricing.plans.basic.fee', '10% Management Fee'),
    description: getStrapiText(basicPlan.description) || getValue('plans.basic.description', 'pricing.plans.basic.description', ''),
    features: formatStrapiArray(basicPlan.features).length > 0 
      ? formatStrapiArray(basicPlan.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.features.basic || []),
    buttonText: getStrapiText(basicPlan.buttonText) || getValue('plans.basic.buttonText', 'pricing.plans.basic.buttonText', "Let's Start Simple"),
    popular: false
  };

  const premiumPlanData = {
    name: getStrapiText(premiumPlan.name) || getValue('plans.premium.name', 'pricing.plans.premium.name', 'PREMIUM'),
    fee: getStrapiText(premiumPlan.fee) || getValue('plans.premium.fee', 'pricing.plans.premium.fee', '25% Management Fee'),
    description: getStrapiText(premiumPlan.description) || getValue('plans.premium.description', 'pricing.plans.premium.description', ''),
    features: formatStrapiArray(premiumPlan.features).length > 0 
      ? formatStrapiArray(premiumPlan.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.features.premium || []),
    buttonText: getStrapiText(premiumPlan.buttonText) || getValue('plans.premium.buttonText', 'pricing.plans.premium.buttonText', 'I Want Full Management'),
    popular: getStrapiText(premiumPlan.popularBadge) || getValue('plans.premium.popular', 'pricing.plans.premium.popular', 'MOST POPULAR'),
    popularFlag: true
  };

  const superPremiumPlanData = {
    name: getStrapiText(superPremiumPlan.name) || getValue('plans.superPremium.name', 'pricing.plans.superPremium.name', 'SUPER PREMIUM ADD-ON'),
    fee: getStrapiText(superPremiumPlan.fee) || getValue('plans.superPremium.fee', 'pricing.plans.superPremium.fee', '+5% Add-On (30% Total)'),
    description: getStrapiText(superPremiumPlan.description) || getValue('plans.superPremium.description', 'pricing.plans.superPremium.description', ''),
    features: formatStrapiArray(superPremiumPlan.features).length > 0 
      ? formatStrapiArray(superPremiumPlan.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.features.superPremium || []),
    buttonText: getStrapiText(superPremiumPlan.buttonText) || getValue('plans.superPremium.buttonText', 'pricing.plans.superPremium.buttonText', 'I Want the VIP Experience'),
    popular: false
  };

  // Sections - component structure (packages)
  const setupSection = strapiData?.setupPackage || {};
  const upgradeSection = strapiData?.upgradePackage || {};
  const complianceSection = strapiData?.compliancePackage || {};

  const setupSectionData = {
    title: getStrapiText(setupSection.title) || getValue('sections.setup.title', 'pricing.sections.setup.title', 'From Empty Apartment to Guest-Ready Rental'),
    subtitle: getStrapiText(setupSection.subtitle) || getValue('sections.setup.subtitle', 'pricing.sections.setup.subtitle', ''),
    features: formatStrapiArray(setupSection.features).length > 0
      ? formatStrapiArray(setupSection.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.sections.setup.features || []),
    button: getStrapiText(setupSection.buttonText) || getValue('sections.setup.button', 'pricing.sections.setup.button', 'Schedule Setup Call')
  };

  const upgradeSectionData = {
    title: getStrapiText(upgradeSection.title) || getValue('sections.upgrade.title', 'pricing.sections.upgrade.title', 'From Existing Apartment to 5-Star-Ready Rental'),
    subtitle: getStrapiText(upgradeSection.subtitle) || getValue('sections.upgrade.subtitle', 'pricing.sections.upgrade.subtitle', ''),
    note: getStrapiText(upgradeSection.note) || getValue('sections.upgrade.note', 'pricing.sections.upgrade.note', ''),
    features: formatStrapiArray(upgradeSection.features).length > 0
      ? formatStrapiArray(upgradeSection.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.sections.upgrade.features || []),
    button: getStrapiText(upgradeSection.buttonText) || getValue('sections.upgrade.button', 'pricing.sections.upgrade.button', 'Schedule Upgrade Call')
  };

  const complianceSectionData = {
    title: getStrapiText(complianceSection.title) || getValue('sections.compliance.title', 'pricing.sections.compliance.title', 'From Fully Furnished Apartment to Fully Licensed Short-Term Rental'),
    subtitle: getStrapiText(complianceSection.subtitle) || getValue('sections.compliance.subtitle', 'pricing.sections.compliance.subtitle', ''),
    note: getStrapiText(complianceSection.note) || getValue('sections.compliance.note', 'pricing.sections.compliance.note', ''),
    setupFee: getStrapiText(complianceSection.setupFee) || getValue('sections.compliance.setupFee', 'pricing.sections.compliance.setupFee', 'Setup fee: €300 + VAT'),
    features: formatStrapiArray(complianceSection.features).length > 0
      ? formatStrapiArray(complianceSection.features).map((f: any) => getStrapiText(f.text || f) || '')
      : (t.pricing.sections.compliance.features || []),
    button: getStrapiText(complianceSection.buttonText) || getValue('sections.compliance.button', 'pricing.sections.compliance.button', 'Book Compliance Setup')
  };

  // Trust section - direct fields
  const trustTitle = getStrapiText(strapiData?.trustTitle) || getValue('trustTitle', 'pricing.trust.title', 'Why owners choose SmartHoster');
  const trustPoints = formatStrapiArray(strapiData?.trustPoints).length > 0
    ? formatStrapiArray(strapiData?.trustPoints).map((p: any) => getStrapiText(p.text || p) || '')
    : (t.pricing.trust.points || []);

  // Footer CTA - direct fields
  const footerTitle = getStrapiText(strapiData?.footerTitle) || getValue('footerTitle', 'pricing.footer.title', "Not sure where to start? Contact us and we'll walk you through it.");
  const footerButton = getStrapiText(strapiData?.footerButtonText) || getValue('footerButtonText', 'pricing.footer.button', 'Talk to a Real Person');

  const scrollToContact = () => {
    const contactSection = document.querySelector('[data-section="contact-form"]');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* Three-Tier Pricing Grid */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {/* Basic Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{basicPlanData.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#00CFFF] mb-2">{basicPlanData.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {basicPlanData.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {basicPlanData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="basic-plan"
                  utmContent="lets-start-simple"
                >
                  👉 {basicPlanData.buttonText}
                </CalendlyButton>
              </div>

              {/* Premium Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#5FFF56] relative flex flex-col h-full md:col-span-2 lg:col-span-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#5FFF56] text-black px-6 py-2 rounded-full text-sm font-bold">
                  {premiumPlanData.popular}
                </div>
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{premiumPlanData.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#5FFF56] mb-2">{premiumPlanData.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {premiumPlanData.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {premiumPlanData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#5FFF56] hover:bg-[#4EE045] text-black font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="premium-plan"
                  utmContent="full-management"
                >
                  👉 {premiumPlanData.buttonText}
                </CalendlyButton>
              </div>

              {/* Super Premium Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full md:col-span-2 lg:col-span-1">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{superPremiumPlanData.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#007FC4] mb-2">{superPremiumPlanData.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {superPremiumPlanData.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {superPremiumPlanData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#007FC4] hover:bg-[#0095D5] text-white font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="super-premium-plan"
                  utmContent="vip-experience"
                >
                  👉 {superPremiumPlanData.buttonText}
                </CalendlyButton>
              </div>
            </div>
          </div>
        </section>

        {/* Full Setup Package */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {setupSectionData.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {setupSectionData.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {setupSectionData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-4 md:py-6 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 text-base md:text-lg h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="setup-package"
                    utmContent="full-setup"
                  >
                    👉 {setupSectionData.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade Package */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {upgradeSectionData.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {upgradeSectionData.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {upgradeSectionData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-3 md:py-4 bg-[#5FFF56] hover:bg-[#4EE045] text-black font-semibold rounded-lg transition-colors duration-300 h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="upgrade-package"
                    utmContent="apartment-upgrade"
                  >
                    👉 {upgradeSectionData.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
            
            {upgradeSectionData.note && (
              <div className="bg-[#5FFF56]/10 rounded-xl p-6 border border-[#5FFF56]/20">
                <p className="text-gray-700 font-medium">
                  {upgradeSectionData.note}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Compliance Package */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {complianceSectionData.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {complianceSectionData.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {complianceSectionData.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[#007FC4] mb-2">{complianceSectionData.setupFee}</div>
                    {complianceSectionData.note && (
                      <p className="text-sm text-gray-600">*{complianceSectionData.note}</p>
                    )}
                  </div>
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-3 md:py-4 bg-[#007FC4] hover:bg-[#0095D5] text-white font-semibold rounded-lg transition-colors duration-300 h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="compliance-package"
                    utmContent="book-compliance-setup"
                  >
                    👉 {complianceSectionData.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
            
            {complianceSectionData.note && (
              <div className="bg-[#007FC4]/10 rounded-xl p-6 border border-[#007FC4]/20">
                <p className="text-gray-700 font-medium">
                  {complianceSectionData.note}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              {trustTitle}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {trustPoints.map((point: string, index: number) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#5FFF56] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-black" />
                  </div>
                  <p className="text-gray-700 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-200">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {footerTitle}
              </h2>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="py-3 md:py-4 px-6 md:px-8 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 text-base md:text-lg h-auto min-h-12"
                utmSource="pricing"
                utmMedium="website"
                utmCampaign="footer-cta"
                utmContent="talk-to-real-person"
              >
                👉 {footerButton}
              </CalendlyButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}





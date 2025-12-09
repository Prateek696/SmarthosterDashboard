'use client';

import { Shield, Lightbulb, Leaf, Users, Eye, HeartHandshake, Bot, Cog, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Testimonials from "@/components/Testimonials";
import Layout from "@/components/Layout";
import CalendlyButton from "@/components/CalendlyButton";
import Link from "next/link";
import { getStrapiText, getStrapiImageUrl } from "@/utils/strapi-helpers";

// Import team photos
import miguelPhoto from "@/assets/team/miguel-ribeiro.jpg";
import patriciaPhoto from "@/assets/team/patricia-garlini.jpg";
import shubanshuPhoto from "@/assets/team/shubanshu.jpg";
import joseRaimundoPhoto from "@/assets/team/jose-raimundo.jpg";
import carlosPhoto from "@/assets/team/carlos-ferreira.jpg";
import adolfoPhoto from "@/assets/team/adolfo-ferreira-young.jpg";
import sofiaPhoto from "@/assets/team/sofia-mendes.jpg";
import zaraPhoto from "@/assets/team/zara-alam.jpg";

interface AboutPageClientProps {
  strapiData?: any; // Strapi about page data
}

export default function AboutPageClient({ strapiData }: AboutPageClientProps = {}) {
  const { t } = useLanguage();

  // Debug logging
  console.log('🔍 Client: About Page Strapi Data:', {
    hasStrapiData: !!strapiData,
    hero: strapiData?.hero,
    heroTitle: strapiData?.hero?.title,
    missionVision: strapiData?.missionVision,
    originStory: strapiData?.originStory,
    coreValues: strapiData?.coreValues,
    team: strapiData?.team,
    sustainability: strapiData?.sustainability,
    cta: strapiData?.cta,
  });

  // Extract sections from Strapi data
  const hero = strapiData?.hero;
  const missionVision = strapiData?.missionVision;
  const originStory = strapiData?.originStory;
  const coreValues = strapiData?.coreValues;
  const team = strapiData?.team;
  const sustainability = strapiData?.sustainability;
  const cta = strapiData?.cta;

  // Get values with fallback: Strapi → Translations → Default
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

  // Hero section
  const heroTitle = getStrapiText(hero?.title) || getValue('hero.title', 'about.hero.title', 'About SmartHoster.io');
  const heroDescription = getStrapiText(hero?.description) || getValue('hero.description', 'about.hero.description', 'We combine cutting-edge technology with local Portuguese expertise');
  
  console.log('🔍 Hero Section:', {
    hasHero: !!hero,
    strapiTitle: hero?.title,
    finalTitle: heroTitle,
    strapiDescription: hero?.description,
    finalDescription: heroDescription ? (heroDescription.substring(0, 50) + '...') : 'N/A'
  });

  // Mission & Vision - Debug the structure first
  let missionVisionFull = '';
  try {
    missionVisionFull = JSON.stringify(missionVision, null, 2).substring(0, 1000);
  } catch (e) {
    missionVisionFull = '[Unable to stringify - may contain circular references]';
  }
  
  try {
  console.log('🔍 Mission & Vision RAW Structure:', {
    missionVision: missionVision,
    missionVisionKeys: missionVision ? Object.keys(missionVision) : [],
      missionVisionFull: missionVisionFull,
    hasMission: !!missionVision?.mission,
    hasVision: !!missionVision?.vision,
    mission: missionVision?.mission,
    vision: missionVision?.vision,
    missionType: typeof missionVision?.mission,
    visionType: typeof missionVision?.vision
  });
  } catch (e) {
    // Silently ignore console.log errors
  }
  
  // Mission & Vision - Try different access patterns
  // Strapi might return mission/vision as objects with data or directly
  const mission = missionVision?.mission || (typeof missionVision?.mission === 'object' ? missionVision.mission : null);
  const vision = missionVision?.vision || (typeof missionVision?.vision === 'object' ? missionVision.vision : null);
  
  const missionTitle = getStrapiText(mission?.title) || getValue('missionVision.mission.title', 'about.missionVision.mission.title', 'Our Mission');
  const missionContent = getStrapiText(mission?.content) || getValue('missionVision.mission.content', 'about.missionVision.mission.content', '');
  const visionTitle = getStrapiText(vision?.title) || getValue('missionVision.vision.title', 'about.missionVision.vision.title', 'Our Vision');
  const visionContent = getStrapiText(vision?.content) || getValue('missionVision.vision.content', 'about.missionVision.vision.content', '');
  
  try {
  console.log('🔍 Mission & Vision Section:', {
    hasMissionVision: !!missionVision,
    hasMission: !!mission,
    missionTitle: missionTitle,
    missionContentLength: missionContent?.length || 0,
    hasVision: !!vision,
    visionTitle: visionTitle,
    visionContentLength: visionContent?.length || 0
  });
  } catch (e) {
    // Silently ignore console.log errors
  }

  // Origin Story
  const originTitle = getStrapiText(originStory?.title) || getValue('originStory.title', 'about.origin.title', 'Our Origin Story');
  const originContent = getStrapiText(originStory?.content) || getValue('originStory.content', 'about.origin.content', '');
  
  try {
  console.log('🔍 Origin Story Section:', {
    hasOriginStory: !!originStory,
    strapiTitle: originStory?.title,
    finalTitle: originTitle,
    strapiContent: originStory?.content,
    finalContentLength: originContent?.length || 0
  });
  } catch (e) {
    // Silently ignore console.log errors
  }

  // Core Values
  const coreValuesTitle = getStrapiText(coreValues?.title) || getValue('coreValues.title', 'about.values.title', 'Our Core Values');
  const strapiCoreValues = coreValues?.values || [];
  
  try {
  console.log('🔍 Core Values Section:', {
    hasCoreValues: !!coreValues,
    strapiTitle: coreValues?.title,
    finalTitle: coreValuesTitle,
    strapiValuesCount: strapiCoreValues.length,
    strapiValues: strapiCoreValues.map((v: any) => ({ 
      iconName: v.iconName, 
      title: v.title,
      hasTitle: !!v.title,
      hasDescription: !!v.description
    })),
    usingFallback: strapiCoreValues.length === 0
  });
  } catch (e) {
    // Silently ignore console.log errors
  }
  
  const iconMap: Record<string, any> = {
    'Users': Users,
    'Eye': Eye,
    'HeartHandshake': HeartHandshake,
    'Cog': Cog,
    'Recycle': Recycle,
  };
  
  const finalCoreValues = strapiCoreValues.length > 0 ? strapiCoreValues.map((val: any) => ({
    icon: iconMap[val.iconName] || Users,
    title: getStrapiText(val.title) || '',
    description: getStrapiText(val.description) || ''
  })) : [
    {
      icon: Users,
      title: t.about.values.ownerFirst.title,
      description: t.about.values.ownerFirst.description
    },
    {
      icon: Eye,
      title: t.about.values.transparency.title,
      description: t.about.values.transparency.description
    },
    {
      icon: HeartHandshake,
      title: t.about.values.humanSupport.title,
      description: t.about.values.humanSupport.description
    },
    {
      icon: Cog,
      title: t.about.values.automation.title,
      description: t.about.values.automation.description
    },
    {
      icon: Recycle,
      title: t.about.values.sustainability.title,
      description: t.about.values.sustainability.description
    }
  ];

  // Team
  const teamTitle = getStrapiText(team?.title) || getValue('team.title', 'about.team.title', 'Meet the Team');
  const teamDescription = getStrapiText(team?.description) || getValue('team.description', 'about.team.description', '');
  const strapiTeamMembers = team?.members || [];
  
  try {
  console.log('🔍 Team Section:', {
    hasTeam: !!team,
    strapiTitle: team?.title,
    finalTitle: teamTitle,
    strapiDescription: team?.description,
    finalDescriptionLength: teamDescription?.length || 0,
    strapiMembersCount: strapiTeamMembers.length,
    strapiMembers: strapiTeamMembers.map((m: any) => ({ 
      name: m.name,
      role: m.role,
      hasName: !!m.name,
      hasRole: !!m.role,
      hasImage: !!m.image
    })),
    usingFallback: strapiTeamMembers.length === 0
  });
  } catch (e) {
    // Silently ignore console.log errors
  }
  
  const finalTeamMembers = strapiTeamMembers.length > 0 ? strapiTeamMembers.map((member: any) => ({
    name: getStrapiText(member.name) || '',
    role: getStrapiText(member.role) || '',
    description: getStrapiText(member.description) || '',
    image: getStrapiImageUrl(member.image) || miguelPhoto
  })) : [
    {
      name: "Miguel Ribeiro",
      role: t.about.team.members.miguel.role,
      description: t.about.team.members.miguel.description,
      image: miguelPhoto
    },
    {
      name: "Patricia Garlini",
      role: t.about.team.members.patricia.role,
      description: t.about.team.members.patricia.description,
      image: patriciaPhoto
    },
    {
      name: "Shubanshu",
      role: t.about.team.members.shubanshu.role,
      description: t.about.team.members.shubanshu.description,
      image: shubanshuPhoto
    },
    {
      name: "José Raimundo",
      role: t.about.team.members.raimundo.role,
      description: t.about.team.members.raimundo.description,
      image: joseRaimundoPhoto
    },
    {
      name: "Carlos Ferreira",
      role: t.about.team.members.carlos.role,
      description: t.about.team.members.carlos.description,
      image: carlosPhoto
    },
    {
      name: "Adolfo Ferreira",
      role: t.about.team.members.adolfo.role,
      description: t.about.team.members.adolfo.description,
      image: adolfoPhoto
    },
    {
      name: "Sofia Mendes",
      role: t.about.team.members.sofia.role,
      description: t.about.team.members.sofia.description,
      image: sofiaPhoto
    },
    {
      name: "Zara Alam",
      role: t.about.team.members.zara.role,
      description: t.about.team.members.zara.description,
      image: zaraPhoto
    }
  ];

  // Sustainability
  const sustainabilityTitle = getStrapiText(sustainability?.title) || getValue('sustainability.title', 'about.green.title', 'Sustainability Commitment');
  const sustainabilityContent = getStrapiText(sustainability?.content) || getValue('sustainability.content', 'about.green.content', '');
  const sustainabilityImage = getStrapiImageUrl(sustainability?.image) || "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=600&h=400&fit=crop";
  const sustainabilityImageAlt = 'Sustainable vacation home with solar panels'; // Hardcoded since imageAlt field doesn't exist in Strapi schema
  const strapiSustainabilityFeatures = sustainability?.features || [];
  
  try {
  console.log('🔍 Sustainability Section:', {
    hasSustainability: !!sustainability,
    strapiTitle: sustainability?.title,
    finalTitle: sustainabilityTitle,
    strapiContentLength: sustainabilityContent?.length || 0,
    strapiImage: sustainability?.image,
    finalImage: sustainabilityImage,
    strapiFeaturesCount: strapiSustainabilityFeatures.length,
    strapiFeatures: strapiSustainabilityFeatures.map((f: any) => ({ 
      text: f.text,
      hasText: !!f.text
    })),
    usingFallback: strapiSustainabilityFeatures.length === 0
  });
  } catch (e) {
    // Silently ignore console.log errors
  }
  
  const finalSustainabilityFeatures = strapiSustainabilityFeatures.length > 0 
    ? strapiSustainabilityFeatures.map((feat: any) => ({ text: getStrapiText(feat.text) || '' }))
    : [
        { text: t.about.green.features.led },
        { text: t.about.green.features.appliances },
        { text: t.about.green.features.water },
        { text: t.about.green.features.linens },
        { text: t.about.green.features.upgrades }
      ];

  const sustainabilityCtaText = getStrapiText(sustainability?.ctaText) || getValue('sustainability.ctaText', 'about.green.cta', 'Learn More About Our Green Initiatives');
  const sustainabilityCtaLink = getStrapiText(sustainability?.ctaLink) || '/green-pledge';

  // CTA
  const ctaTitle = getStrapiText(cta?.title) || 'Want to Learn More?';
  const ctaDescription = getStrapiText(cta?.description) || 'Discover how SmartHoster can transform your property management experience with our comprehensive services and expert local knowledge.';
  const ctaLearnMoreText = getStrapiText(cta?.primaryButtonText) || 'Learn More About Our Services';
  const ctaLearnMoreLink = getStrapiText(cta?.primaryButtonLink) || '/learn-more';
  const ctaConsultationText = getStrapiText(cta?.secondaryButtonText) || 'Book a Free Consultation';
  const ctaConsultationUrl = getStrapiText(cta?.calendlyUrl) || 'https://calendly.com/admin-smarthoster';
  
  try {
  console.log('🔍 CTA Section:', {
    hasCta: !!cta,
    strapiTitle: cta?.title,
    finalTitle: ctaTitle,
    strapiDescription: cta?.description,
    finalDescriptionLength: ctaDescription?.length || 0,
    primaryButtonText: ctaLearnMoreText,
    secondaryButtonText: ctaConsultationText,
    calendlyUrl: ctaConsultationUrl
  });
  
  console.log('✅ All About Page Sections Processed');
  } catch (e) {
    // Silently ignore console.log errors
  }

  return (
    <Layout>
      {/* Hero Section - About SmartHoster */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#5FFF56]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00CFFF]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5FFF56]/20 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-[#5FFF56]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {missionTitle}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {missionContent}
              </p>
            </div>
            
            {/* Vision */}
            <div className="text-center lg:text-left animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00CFFF]/20 rounded-2xl mb-6">
                <Lightbulb className="h-8 w-8 text-[#00CFFF]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {visionTitle}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {visionContent}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50/30 to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
              {originTitle}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              {originContent}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {coreValuesTitle}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {finalCoreValues.map((value, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5FFF56]/20 to-[#00CFFF]/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-8 w-8 text-[#00CFFF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {teamTitle}
            </h2>
            {teamDescription && (
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {teamDescription}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {finalTeamMembers.map((member, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={typeof member.image === 'string' ? member.image : member.image.src}
                    alt={member.name}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full mx-auto object-cover shadow-lg border-4 border-white"
                  />
                  <div className="absolute inset-0 w-32 h-32 lg:w-40 lg:h-40 rounded-full mx-auto bg-gradient-to-tr from-[#5FFF56]/20 to-[#00CFFF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-[#00CFFF] font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Commitment Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                {sustainabilityTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {sustainabilityContent}
              </p>
              
              <div className="space-y-4 mb-8">
                {finalSustainabilityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl">
                <Link href={sustainabilityCtaLink}>{sustainabilityCtaText}</Link>
              </Button>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <img 
                src={sustainabilityImage}
                alt={sustainabilityImageAlt}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {ctaTitle}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
              {ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] hover:from-[#4EE045] hover:to-[#00B8E6] text-black font-semibold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-14 flex items-center justify-center"
              >
                <Link href={ctaLearnMoreLink}>
                  {ctaLearnMoreText}
                </Link>
              </Button>
              <CalendlyButton
                calendlyUrl={ctaConsultationUrl}
                className="bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] hover:from-[#4EE045] hover:to-[#00B8E6] text-black font-semibold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-14 flex items-center justify-center"
                utmSource="about-page"
                utmMedium="website"
                utmCampaign="consultation"
                utmContent="bottom-cta"
              >
                {ctaConsultationText}
              </CalendlyButton>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

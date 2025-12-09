'use client';

import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JobsPage() {
  const { currentLanguage } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {currentLanguage === 'pt' ? 'Junta-te à Nossa Equipa' : currentLanguage === 'fr' ? 'Rejoignez Notre Équipe' : 'Join Our Team'}
            </h1>
            <p className="text-lg text-gray-600">
              Jobs content will be migrated from Jobs.tsx...
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}


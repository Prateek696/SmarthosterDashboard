'use client';

import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StartPage() {
  const { currentLanguage } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Get Started
            </h1>
            <p className="text-lg text-gray-600">
              Start page content will be migrated from Start.tsx...
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}


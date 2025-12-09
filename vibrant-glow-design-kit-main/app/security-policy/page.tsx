'use client';

import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";

export default function SecurityPolicyPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                🔒 SmartHoster.io Security Policy
              </h1>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 mb-8">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Effective Date:</strong> 1 June 2025
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Company:</strong> SmartHoster.io, operated by BBAR Unipessoal LDA
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Security content will be migrated from SecurityPolicy.tsx...
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}


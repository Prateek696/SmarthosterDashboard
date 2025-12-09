'use client';

import AdminRoute from "@/components/AdminRoute";
import { LearnContentGenerator } from "@/components/LearnContentGenerator";

export default function AdminGenerateLearnPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Generate Learn Content</h1>
            <p className="text-muted-foreground">
              Generate multilingual /learn content for the Algarve rental market
            </p>
          </div>
          <LearnContentGenerator />
        </div>
      </div>
    </AdminRoute>
  );
}

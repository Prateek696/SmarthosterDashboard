'use client';

import AdminRoute from "@/components/AdminRoute";
import AdminContentGenerator from "@/pages-old/AdminContentGenerator";

export const dynamic = 'force-dynamic';

export default function AdminContentGeneratorPage() {
  return (
    <AdminRoute>
      <AdminContentGenerator />
    </AdminRoute>
  );
}

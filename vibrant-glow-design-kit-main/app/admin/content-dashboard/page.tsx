'use client';

import AdminRoute from "@/components/AdminRoute";
import AdminContentDashboard from "@/pages-old/AdminContentDashboard";

export const dynamic = 'force-dynamic';

export default function AdminContentDashboardPage() {
  return (
    <AdminRoute>
      <AdminContentDashboard />
    </AdminRoute>
  );
}

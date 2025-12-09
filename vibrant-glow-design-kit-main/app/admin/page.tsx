'use client';

import AdminRoute from "@/components/AdminRoute";
import AdminContentDashboard from "@/pages-old/AdminContentDashboard";

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContentDashboard />
    </AdminRoute>
  );
}


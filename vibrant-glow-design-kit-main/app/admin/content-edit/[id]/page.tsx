'use client';

import AdminRoute from "@/components/AdminRoute";
import AdminContentEditor from "@/pages-old/AdminContentEditor";

export const dynamic = 'force-dynamic';

export default function AdminContentEditPage({ params }: { params: { id: string } }) {
  return (
    <AdminRoute>
      <AdminContentEditor id={params.id} />
    </AdminRoute>
  );
}

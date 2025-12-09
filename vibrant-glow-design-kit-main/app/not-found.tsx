'use client';

import Layout from "@/components/Layout";
import NotFound from "@/pages-old/NotFound";

export const dynamic = 'force-dynamic';

export default function NotFoundPage() {
  return (
    <Layout>
      <NotFound />
    </Layout>
  );
}

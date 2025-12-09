'use client';

import Blog from "@/pages-old/Blog";

export const dynamic = 'force-dynamic';

export default function BlogSlugPage({ params }: { params: { slug: string } }) {
  return <Blog slug={params.slug} />;
}


'use client';

import Learn from "@/pages-old/Learn";

export const dynamic = 'force-dynamic';

export default function LearnSlugPage({ params }: { params: { slug: string } }) {
  return <Learn slug={params.slug} />;
}

'use client';

import Learn from "@/pages-old/Learn";

export const dynamic = 'force-dynamic';

export default function LocaleLearnSlugPage({ params }: { params: { locale: string; slug: string } }) {
  return <Learn slug={params.slug} />;
}

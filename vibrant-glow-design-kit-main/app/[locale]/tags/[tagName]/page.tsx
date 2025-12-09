'use client';

import TagPage from "@/pages-old/TagPage";

export const dynamic = 'force-dynamic';

export default function LocaleTagPage({ params }: { params: { locale: string; tagName: string } }) {
  return <TagPage tagName={params.tagName} />;
}

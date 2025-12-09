'use client';

import TagPage from "@/pages-old/TagPage";

export const dynamic = 'force-dynamic';

export default function TagNamePage({ params }: { params: { tagName: string } }) {
  return <TagPage tagName={params.tagName} />;
}

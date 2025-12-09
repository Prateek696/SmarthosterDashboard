'use client';

import AuthorPage from "@/pages-old/AuthorPage";

export const dynamic = 'force-dynamic';

export default function AuthorSlugPage({ params }: { params: { authorSlug: string } }) {
  return <AuthorPage authorSlug={params.authorSlug} />;
}

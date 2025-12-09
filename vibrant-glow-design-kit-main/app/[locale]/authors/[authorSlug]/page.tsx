'use client';

import AuthorPage from "@/pages-old/AuthorPage";

export const dynamic = 'force-dynamic';

export default function LocaleAuthorPage({ params }: { params: { locale: string; authorSlug: string } }) {
  return <AuthorPage authorSlug={params.authorSlug} />;
}

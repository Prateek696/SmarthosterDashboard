'use client';

import Learn from "@/pages-old/Learn";

export const dynamic = 'force-dynamic';

export default function LocaleLearnPage({ params }: { params: { locale: string } }) {
  return <Learn slug={undefined} />;
}

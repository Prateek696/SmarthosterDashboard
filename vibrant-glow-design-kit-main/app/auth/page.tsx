'use client';

import { Suspense } from 'react';
import Auth from "@/pages-old/Auth";

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Auth />
    </Suspense>
  );
}

'use client';

import LocalExpertise from "@/pages-old/LocalExpertise";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface LocalExpertisePageClientProps {
  strapiData?: any;
}

export default function LocalExpertisePageClient({ strapiData }: LocalExpertisePageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <LocalExpertise strapiData={strapiData} />;
}




'use client';

import LegalCompliance from "@/pages-old/LegalCompliance";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface LegalCompliancePageClientProps {
  strapiData?: any;
}

export default function LegalCompliancePageClient({ strapiData }: LegalCompliancePageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <LegalCompliance strapiData={strapiData} />;
}




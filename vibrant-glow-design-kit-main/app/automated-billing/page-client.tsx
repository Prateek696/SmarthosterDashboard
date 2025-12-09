'use client';

import AutomatedBilling from "@/pages-old/AutomatedBilling";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface AutomatedBillingPageClientProps {
  strapiData?: any;
}

export default function AutomatedBillingPageClient({ strapiData }: AutomatedBillingPageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <AutomatedBilling strapiData={strapiData} />;
}




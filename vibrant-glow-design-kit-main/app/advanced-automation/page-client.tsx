'use client';

import AdvancedAutomation from "@/pages-old/AdvancedAutomation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface AdvancedAutomationPageClientProps {
  strapiData?: any;
}

export default function AdvancedAutomationPageClient({ strapiData }: AdvancedAutomationPageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <AdvancedAutomation strapiData={strapiData} />;
}




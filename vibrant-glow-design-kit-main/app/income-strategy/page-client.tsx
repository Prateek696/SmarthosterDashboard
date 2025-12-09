'use client';

import IncomeStrategy from "@/pages-old/IncomeStrategy";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface IncomeStrategyPageClientProps {
  strapiData?: any;
}

export default function IncomeStrategyPageClient({ strapiData }: IncomeStrategyPageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <IncomeStrategy strapiData={strapiData} />;
}




'use client';

import FullServiceManagement from "@/pages-old/FullServiceManagement";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface FullServiceManagementPageClientProps {
  strapiData?: any;
}

export default function FullServiceManagementPageClient({ strapiData }: FullServiceManagementPageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <FullServiceManagement strapiData={strapiData} />;
}




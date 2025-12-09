'use client';

import GreenPledge from "@/pages-old/GreenPledge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface GreenPledgePageClientProps {
  strapiData?: any;
}

export default function GreenPledgePageClient({ strapiData }: GreenPledgePageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <GreenPledge strapiData={strapiData} />;
}




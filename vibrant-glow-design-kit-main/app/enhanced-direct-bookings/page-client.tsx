'use client';

import EnhancedDirectBookings from "@/pages-old/EnhancedDirectBookings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface EnhancedDirectBookingsPageClientProps {
  strapiData?: any; // Strapi service page data
}

export default function EnhancedDirectBookingsPageClient({ strapiData }: EnhancedDirectBookingsPageClientProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pass strapiData to the component if available
  // The EnhancedDirectBookings component will use translations as fallback
  // TODO: Update EnhancedDirectBookings component to accept and use strapiData prop
  
  return <EnhancedDirectBookings strapiData={strapiData} />;
}




/**
 * Legacy Pricing Page - Redirects to locale-based pricing page
 * This file is kept for backward compatibility but redirects to /pt/pricing
 */
import { redirect } from 'next/navigation';

export default async function PricingPage() {
  // Redirect to default locale (Portuguese)
  redirect('/pt/pricing');
}

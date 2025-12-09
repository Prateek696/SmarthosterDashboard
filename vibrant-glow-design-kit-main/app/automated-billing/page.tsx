/**
 * Legacy Automated Billing Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function AutomatedBillingPage() {
  redirect('/pt/automated-billing');
}

/**
 * Legacy Advanced Automation Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function AdvancedAutomationPage() {
  redirect('/pt/advanced-automation');
}

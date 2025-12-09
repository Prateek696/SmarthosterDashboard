/**
 * Legacy Income Strategy Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function IncomeStrategyPage() {
  redirect('/pt/income-strategy');
}

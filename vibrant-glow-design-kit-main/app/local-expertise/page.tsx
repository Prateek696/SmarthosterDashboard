/**
 * Legacy Local Expertise Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function LocalExpertisePage() {
  redirect('/pt/local-expertise');
}

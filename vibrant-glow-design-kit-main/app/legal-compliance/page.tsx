/**
 * Legacy Legal Compliance Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function LegalCompliancePage() {
  redirect('/pt/legal-compliance');
}

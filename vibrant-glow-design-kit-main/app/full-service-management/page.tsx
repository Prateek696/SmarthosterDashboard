/**
 * Legacy Full Service Management Page - Redirects to locale-based page
 * This file is kept for backward compatibility but redirects to /pt/full-service-management
 */
import { redirect } from 'next/navigation';

export default async function FullServiceManagementPage() {
  redirect('/pt/full-service-management');
}

/**
 * Legacy About Page - Redirects to locale-based about page
 * This file is kept for backward compatibility but redirects to /pt/about
 */
import { redirect } from 'next/navigation';

export default async function AboutPage() {
  // Redirect to default locale (Portuguese)
  redirect('/pt/about');
}

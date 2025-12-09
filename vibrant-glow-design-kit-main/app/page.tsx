/**
 * Legacy Homepage - Redirects to locale-based homepage
 * This file is kept for backward compatibility but redirects to /pt/
 */
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect to default locale (Portuguese)
  redirect('/pt');
}

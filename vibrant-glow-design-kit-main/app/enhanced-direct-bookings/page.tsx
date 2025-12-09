/**
 * Legacy Enhanced Direct Bookings Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function EnhancedDirectBookingsPage() {
  redirect('/pt/enhanced-direct-bookings');
}

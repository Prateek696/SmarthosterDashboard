/**
 * Legacy Green Pledge Page - Redirects to locale-based page
 */
import { redirect } from 'next/navigation';

export default async function GreenPledgePage() {
  redirect('/pt/green-pledge');
}

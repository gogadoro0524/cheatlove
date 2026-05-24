import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { ScanScreen } from '@/components/ScanScreen';
import { isAdmin } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CheatLens — Scan demo',
  description: 'Preview the live scanning / loading screen.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function ScanDemoPage() {
  if (!(await isAdmin())) notFound();
  return <ScanScreen />;
}

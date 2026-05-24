import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { ReportDemo } from '@/components/ReportDemo';
import { isAdmin } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Cheat-lens — Sample report',
  description: 'Preview a sample profile report.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function ReportDemoPage() {
  if (!(await isAdmin())) notFound();
  return <ReportDemo />;
}

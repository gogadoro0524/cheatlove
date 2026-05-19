import type { Metadata, Viewport } from 'next';
import { StartFlow } from '@/components/StartFlow';

export const metadata: Metadata = {
  title: 'CheatLove — Start your free search',
  description:
    "Answer a few questions. CheatLove will scan in real time and surface what it finds — pay only if you want the full report.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

type Search = { [k: string]: string | string[] | undefined };

export default function StartPage({ searchParams }: { searchParams: Search }) {
  const genderParam = String(searchParams?.gender ?? 'man').toLowerCase();
  const gender: 'man' | 'woman' = genderParam === 'woman' ? 'woman' : 'man';
  const paid = String(searchParams?.paid ?? '') === '1';

  return (
    <div className="page-start">
      <StartFlow initialGender={gender} paid={paid} />
    </div>
  );
}

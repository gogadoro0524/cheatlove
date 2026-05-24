import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { PricingClient } from '@/components/PricingClient';

export const metadata: Metadata = {
  title: 'CheatLens — Pricing',
  description: "One-time, transparent pricing. Unlock the full report only when you're ready.",
};

export default function PricingPage() {
  return (
    <>
      <Nav pricingActive />
      <main>
        <PricingClient />
      </main>
      <Footer />
    </>
  );
}

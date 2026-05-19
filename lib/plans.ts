// Canonical plan catalog — single source of truth shared by the pricing UI
// (client) and the Stripe Checkout API route (server). Never trust client-sent
// amounts; only the plan id is honored when creating a Checkout Session.

export type PlanId = 'quick-scan' | 'full-report' | 'premium-monitor';

export interface Plan {
  id: PlanId;
  name: string;          // shown to user
  tagline: string;       // small subtitle under name on the card
  description: string;   // sent to Stripe as line item description
  amount: number;        // in cents (USD)
  displayPrice: string;  // pretty USD format for UI
  strikePrice: string;   // pretty USD format for the crossed-out anchor price
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  'quick-scan': {
    id: 'quick-scan',
    name: 'Quick Scan',
    tagline: 'One platform · Standard report',
    description: 'One platform · Standard report',
    amount: 1499,
    displayPrice: '$14.99',
    strikePrice: '$24.99',
    features: [
      'Search one dating platform',
      'Last-seen + active status',
      'Profile bio & age',
      'Delivered in ~2 min',
      'Email delivery',
    ],
  },
  'full-report': {
    id: 'full-report',
    name: 'Full Report',
    tagline: 'All platforms · Deep cross-match',
    description: 'All platforms · Deep cross-match',
    amount: 2999,
    displayPrice: '$29.99',
    strikePrice: '$49.99',
    features: [
      'All major dating platforms',
      'Cross-platform photo match',
      'Subscription tier detection',
      '14-day activity timeline',
      'Photo & bio change history',
      'PDF + email delivery',
    ],
  },
  'premium-monitor': {
    id: 'premium-monitor',
    name: 'Premium + Monitor',
    tagline: 'Everything in Full + 30-day watch',
    description: 'Everything in Full + 30-day watch',
    amount: 5999,
    displayPrice: '$59.99',
    strikePrice: '$89.99',
    features: [
      'Everything in Full Report',
      '30-day continuous monitoring',
      'Real-time activity alerts',
      'Priority human support',
      'Multiple re-scans included',
    ],
  },
};

export const PLAN_LIST: Plan[] = [
  PLANS['quick-scan'],
  PLANS['full-report'],
  PLANS['premium-monitor'],
];

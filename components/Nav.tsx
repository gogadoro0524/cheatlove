import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { NavAuth } from './NavAuth';
import { NavMenu } from './NavMenu';
import { getCurrentUser, isAdminUser } from '@/lib/auth';

export async function Nav({ pricingActive = false }: { pricingActive?: boolean }) {
  const user = await getCurrentUser();
  const admin = isAdminUser(user);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <BrandMark />
          <span>CheatLens</span>
        </Link>
        <NavMenu>
          <li><Link href="/#how">How it works</Link></li>
          <li><Link href="/#what">What you get</Link></li>
          <li><Link href="/#reviews">Reviews</Link></li>
          <li><Link href="/#faq">FAQ</Link></li>
          {admin && <li><Link href="/scan-demo">Scan demo</Link></li>}
          {admin && <li><Link href="/report-demo">Sample report</Link></li>}
          <li>
            <Link
              href="/pricing"
              style={pricingActive ? { color: 'var(--red)', fontWeight: 600 } : undefined}
            >
              Pricing
            </Link>
          </li>
          <li><NavAuth email={user?.email ?? null} /></li>
          <li>
            <select className="lang" aria-label="Language" defaultValue="en">
              <option value="en">🇬🇧  English</option>
              <option value="fr">🇫🇷  Français</option>
              <option value="de">🇩🇪  Deutsch</option>
              <option value="es">🇪🇸  Español</option>
            </select>
          </li>
        </NavMenu>
      </div>
    </header>
  );
}

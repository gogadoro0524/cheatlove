import Link from 'next/link';

export function Nav({ pricingActive = false }: { pricingActive?: boolean }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          <span>CheatLove</span>
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/#what">What you get</Link></li>
            <li><Link href="/#reviews">Reviews</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
            <li>
              <Link
                href="/pricing"
                style={pricingActive ? { color: 'var(--red)', fontWeight: 600 } : undefined}
              >
                Pricing
              </Link>
            </li>
            <li><a href="#login">Login</a></li>
            <li>
              <select className="lang" aria-label="Language" defaultValue="en">
                <option value="en">🇬🇧  English</option>
                <option value="fr">🇫🇷  Français</option>
                <option value="de">🇩🇪  Deutsch</option>
                <option value="es">🇪🇸  Español</option>
              </select>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

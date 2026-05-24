import Link from 'next/link';
import { BrandMark } from './BrandMark';

export function Footer() {
  return (
    <footer className="foot">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ color: '#fff' }}>
              <BrandMark />
              <span>CheatLens</span>
            </div>
            <p style={{ fontSize: 14, marginTop: 14, maxWidth: 300 }}>
              AI-powered profile discovery across major dating platforms. Private. Instant. Accurate.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><Link href="/#how">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/start">Start search</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Refund Policy</a></li>
              <li><a href="#">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 CheatLens · Operated by a delaware LLC · Wyoming, USA</span>
          <span>support@cheatlens.example · +1 (888) 555-0142</span>
        </div>
      </div>
    </footer>
  );
}

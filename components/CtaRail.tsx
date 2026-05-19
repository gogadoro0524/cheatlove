'use client';

import Link from 'next/link';
import { useState } from 'react';

type Gender = 'man' | 'woman';

const PORTRAITS: Record<Gender, string> = {
  man: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80&auto=format&fit=crop&crop=faces',
  woman: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80&auto=format&fit=crop&crop=faces',
};

export function CtaRail() {
  const [gender, setGender] = useState<Gender>('man');

  return (
    <aside className="layout-rail">
      <div className="cta-rail">
        <h3>Who are you searching for?</h3>
        <div className="cta-pick">
          {(['man', 'woman'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              className={gender === g ? 'selected' : undefined}
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
            >
              <div className="portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PORTRAITS[g]} alt="" loading="lazy" />
              </div>
              <span className="label">{g.toUpperCase()}</span>
            </button>
          ))}
        </div>

        <Link href={`/start?gender=${gender}`} className="btn btn-dark btn-lg btn-block">
          Start search →
          <small>Get your report in 3 min</small>
        </Link>

        <div className="cta-rail-meta">
          <strong>142 people</strong> found answers today 👈
        </div>

        <div className="cta-rail-trust">
          <span><span className="ico">🔒</span><span>Private</span></span>
          <span><span className="ico">⚡</span><span>Instant</span></span>
          <span><span className="ico">✓</span><span>99% accurate</span></span>
        </div>
      </div>
    </aside>
  );
}

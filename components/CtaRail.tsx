'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Gender = 'man' | 'woman';

const PORTRAITS: Record<Gender, string> = {
  man: '/assets/avatars/man.webp',
  woman: '/assets/avatars/woman.webp',
};

const LABELS: Record<Gender, string> = { man: 'Male', woman: 'Female' };

const BTN_PHRASES = ['Start search →', 'Get your report in 3 min'];

function useTypewriter(phrases: string[]) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(phrases[0]);
      return;
    }
    const current = phrases[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && text === '') {
      setDeleting(false);
      setIdx((i) => (i + 1) % phrases.length);
    } else {
      const next = deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1);
      timer = setTimeout(() => setText(next), deleting ? 45 : 80);
    }
    return () => clearTimeout(timer);
  }, [text, deleting, idx, phrases]);

  return text;
}

export function CtaRail() {
  const [gender, setGender] = useState<Gender>('man');
  const typed = useTypewriter(BTN_PHRASES);

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
                {/* Above the fold on mobile (rail is order:-1) — load eagerly so it
                    doesn't delay LCP. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PORTRAITS[g]}
                  alt=""
                  width={150}
                  height={150}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <span className="label">{LABELS[g]}</span>
            </button>
          ))}
        </div>

        <Link
          href={`/start?gender=${gender}`}
          className="btn btn-dark btn-lg btn-block btn-search"
          aria-label="Start search — get your report in 3 minutes"
        >
          <span className="btn-type" aria-hidden="true">
            {typed}
            <span className="btn-caret" />
          </span>
          <span className="btn-scanner" aria-hidden="true">🔍</span>
        </Link>

        <div className="cta-rail-meta">
          <strong>142 people</strong> found answers today{' '}
          <span className="meta-lens" aria-hidden="true">🔍</span>
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

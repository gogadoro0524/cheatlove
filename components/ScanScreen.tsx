'use client';

// Shared scan / loading screen used by both the live start flow (with the
// user's uploaded photos) and the /scan-demo preview (with a sample photo).
// Dark "similarity analysis" layout: a face being scanned on the left, a
// "potential match" results panel + slowly-filling progress bar on the right.
// Styles live in globals.css under the .cf-* prefix.

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoginModal } from './LoginModal';
import { PaymentModal, type PayPlan } from './PaymentModal';
import { RenewalModal } from './RenewalModal';

const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_DEV = process.env.NODE_ENV !== 'production';

const SCAN_LOGS = [
  'Initializing secure tunnel…',
  'Connecting to dating servers…',
  'Indexing nearby profiles…',
  'Cross-referencing photo hashes…',
  'Running facial similarity model…',
  'Checking last-seen timestamps…',
  'Matching location radius…',
  'Reading subscription tier…',
  'Scanning hidden & paused accounts…',
  'Verifying account activity…',
  'Decrypting profile metadata…',
  'Compiling encrypted report…',
];

const SCAN_APPS = [
  { name: 'Tinder', logo: '/assets/logos/apps/tinder.svg' },
  { name: 'Bumble', logo: '/assets/logos/apps/bumble.svg' },
  { name: 'Hinge', logo: '/assets/logos/apps/hinge.svg' },
  { name: 'Badoo', logo: '/assets/logos/apps/badoo.svg' },
  { name: 'OkCupid', logo: '/assets/logos/apps/okcupid.svg' },
  { name: 'Grindr', logo: '/assets/logos/apps/grindr.svg' },
  { name: 'Happn', logo: '/assets/logos/apps/happn.svg' },
  { name: 'Match', logo: '/assets/logos/apps/match.svg' },
  { name: 'Meetic', logo: '/assets/logos/apps/meetic.svg' },
  { name: 'POF', logo: '/assets/logos/apps/pof.svg' },
  { name: 'Feeld', logo: '/assets/logos/apps/feeld.svg' },
  { name: 'Fruitz', logo: '/assets/logos/apps/fruitz.svg' },
];

// Sample portrait stands in for the user's uploaded photo when none is passed.
const DEMO_FACE =
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop&crop=faces';

const DOTS = [
  { x: 38, y: 34 }, { x: 62, y: 34 }, { x: 50, y: 48 },
  { x: 40, y: 60 }, { x: 60, y: 60 }, { x: 50, y: 70 },
];

const SCAN_DURATION_MS = 30000;
const PHOTO_CYCLE_MS = 2500;

interface Props {
  /** Uploaded photo URLs to scan. Falls back to a sample portrait when empty. */
  photos?: string[];
  name?: string;
  age?: string;
  city?: string;
}

export function ScanScreen({ photos, name, age, city }: Props) {
  const faces = photos && photos.length > 0 ? photos : [DEMO_FACE];

  const [progress, setProgress] = useState(0);
  const [logIdx, setLogIdx] = useState(0);
  const [activeApp, setActiveApp] = useState(0);
  const [faceIdx, setFaceIdx] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Unlock gate: login → payment, both as on-page modals so the scan result
  // is never lost to a full-page navigation.
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);

  // Pick up an existing Supabase session so a returning user skips login.
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let active = true;
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active && data.user) {
          setLoggedIn(true);
          if (data.user.email) setUserEmail(data.user.email);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function onUnlock() {
    if (loggedIn) setShowPayment(true);
    else setShowLogin(true);
  }

  function skipToResults() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setLogIdx(SCAN_LOGS.length - 1);
    setActiveApp(SCAN_APPS.length - 1);
    setDone(true);
  }

  // Main scan timer — runs once per run, lasting ~SCAN_DURATION_MS.
  useEffect(() => {
    setProgress(0);
    setLogIdx(0);
    setActiveApp(0);
    setDone(false);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const frac = Math.min(1, elapsed / SCAN_DURATION_MS);
      setProgress(Math.round(frac * 100));
      setLogIdx(Math.floor(elapsed / 1800) % SCAN_LOGS.length);
      setActiveApp(Math.min(SCAN_APPS.length - 1, Math.floor(frac * SCAN_APPS.length)));
      if (frac >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
      }
    }, 120);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Cycle through the uploaded photos so each is visibly analyzed in turn.
  useEffect(() => {
    setFaceIdx(0);
    if (faces.length <= 1) return;
    const id = setInterval(() => setFaceIdx((i) => (i + 1) % faces.length), PHOTO_CYCLE_MS);
    return () => clearInterval(id);
  }, [faces.length]);

  const app = SCAN_APPS[activeApp];
  const faceSrc = faces[faceIdx % faces.length];
  const displayName = (name && name.trim()) || 'Daniel';
  const displayAge = (age && age.trim()) || '32';
  const displayCity = (city && city.trim()) || 'Brooklyn, NY';
  const avatarInitial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="cf-page">
      <div className="cf-grid">
        {/* LEFT — face scanning visual */}
        <div className="cf-left">
          <div className={`cf-face${done ? ' done' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={faceIdx} src={faceSrc} alt="" style={{ animation: 'cfFadeIn 0.4s ease' }} />
            <span className="cf-corner tl" />
            <span className="cf-corner tr" />
            <span className="cf-corner bl" />
            <span className="cf-corner br" />
            <span className="cf-cross-h" />
            <span className="cf-cross-v" />
            {DOTS.map((d, i) => (
              <span key={i} className="cf-dot" style={{ left: `${d.x}%`, top: `${d.y}%` }} />
            ))}
            {!done && <span className="cf-scanline" />}
            <div className="cf-face-tag">
              <span className="cf-face-tag-label">{done ? 'MATCH CONFIRMED' : 'SIMILARITY ANALYSIS'}</span>
            </div>
          </div>

          <h2 className="cf-title">{done ? 'Match found' : 'Similarity analysis'}</h2>
          <p className="cf-sub">{done ? '1 active profile detected' : 'Scanning 10+ apps in progress'}</p>

          {!done && (
            <div className="cf-app-pill" aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.logo} alt="" />
              <span>{app.name}</span>
              <span className="cf-spin" aria-hidden />
            </div>
          )}
        </div>

        {/* RIGHT — results panel + slow progress bar */}
        <div className="cf-right">
          <h3 className="cf-detected">Potential match detected!</h3>

          {!done ? (
            <div className="cf-empty">
              <div className="cf-search" aria-hidden>
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p>Analyzing dating apps</p>
              <span>{SCAN_LOGS[logIdx]}</span>
            </div>
          ) : (
            <div className="cf-result">
              <div className="cf-result-head">
                <div className="cf-avatar">{avatarInitial}</div>
                <div>
                  <strong>{displayName}, {displayAge}</strong>
                  <span>{displayCity} · Active 26 s ago</span>
                </div>
                <span className="cf-match-tag">Match</span>
              </div>
              <div className="cf-row"><span>Account status</span><b>Active (online now)</b></div>
              <div className="cf-row"><span>Subscription</span><b>Tinder Gold</b></div>
              <div className="cf-row locked"><span>Bio change</span><b>Locked</b></div>
              <button type="button" className="cf-unlock" onClick={onUnlock}>
                🔓 Unlock the full report →
              </button>
            </div>
          )}

          <div className="cf-prog-row">
            <span>Scan progress</span>
            <span className="cf-pct">{progress}%</span>
          </div>
          <div className="cf-prog"><div className="cf-prog-fill" style={{ width: `${progress}%` }} /></div>

          {IS_DEV && !done && (
            <button type="button" className="cf-skip" onClick={skipToResults}>
              ⏭ Skip to results (dev)
            </button>
          )}
        </div>
      </div>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={(email) => {
          setUserEmail(email);
          setLoggedIn(true);
          setShowLogin(false);
        }}
      />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onPay={(plan: PayPlan) => {
          setShowPayment(false);
          // Record the payment attempt (plan + email only — never card data) so
          // it shows up in the orders table. Fire-and-forget: never block the UI.
          fetch('/api/record-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, email: userEmail }),
          }).catch(() => {});
          setShowRenewal(true);
        }}
      />
      <RenewalModal
        open={showRenewal}
        email={userEmail}
        onClose={() => setShowRenewal(false)}
      />
    </div>
  );
}

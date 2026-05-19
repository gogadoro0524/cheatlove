'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const SCAN_LOGS = [
  'Initializing secure tunnel…',
  'Connecting to dating servers…',
  'Indexing nearby profiles…',
  'Cross-referencing photo hashes…',
  'Checking last-seen timestamps…',
  'Reading subscription tier…',
  'Verifying account activity…',
  'Compiling encrypted report…',
];

type Gender = 'man' | 'woman';

interface Props {
  initialGender?: Gender;
  paid?: boolean;
}

export function StartFlow({ initialGender = 'man', paid = false }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);

  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogIdx, setScanLogIdx] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const scanStartedRef = useRef(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  const gender = initialGender;
  const subjectLabel = gender === 'woman' ? 'her' : 'him';
  const subject = gender === 'woman' ? 'she' : 'he';
  const displayName = name || subjectLabel;
  const initial = (name || subjectLabel).slice(0, 1).toUpperCase();

  // Focus the first input on each input step
  useEffect(() => {
    if (step === 0) nameRef.current?.focus({ preventScroll: true });
    if (step === 1) ageRef.current?.focus({ preventScroll: true });
    if (step === 2) cityRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Scan animation effect — runs once when scan step is reached
  useEffect(() => {
    if (step !== 4 || scanStartedRef.current) return;
    scanStartedRef.current = true;
    let p = 0;
    let i = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      setScanProgress(p);
      setScanLogIdx(i % SCAN_LOGS.length);
      i++;
      if (p >= 100) {
        clearInterval(tick);
        setScanDone(true);
      }
    }, 520);
    return () => clearInterval(tick);
  }, [step]);

  const stepValid = useMemo(() => {
    if (step === 0) return name.trim().length >= 1;
    if (step === 1) {
      const v = parseInt(age, 10);
      return Number.isFinite(v) && v >= 18 && v <= 99;
    }
    if (step === 2) return city.trim().length >= 2;
    return true;
  }, [step, name, age, city]);

  function onNext() {
    if (step < 4) setStep(step + 1);
  }
  function onBack() {
    if (step > 0) setStep(step - 1);
    else window.location.href = '/';
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (stepValid) onNext();
    }
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoName(f.name);
      setPhotoSizeKb(Math.round(f.size / 1024));
    }
  }

  // Segment classes for the 4-segment progress bar
  const segClass = (idx: number) => {
    if (step >= 4) return 'seg done';
    if (idx === step) return 'seg active';
    if (idx < step) return 'seg done';
    return 'seg';
  };

  return (
    <main className="ce-app">
      <div className="ce-head">
        <button type="button" className="ce-back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 512 512" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"
            />
          </svg>
        </button>
        <Link href="/" className="ce-logo" aria-label="CheatLove home">
          <svg viewBox="0 0 36 24" width="28" height="20" aria-hidden>
            <ellipse cx="18" cy="12" rx="17" ry="11" fill="none" stroke="#000" strokeWidth="2.4" />
            <circle cx="18" cy="12" r="5.5" fill="#000" />
          </svg>
          <span className="ce-wordmark">CHEATLOVE</span>
        </Link>
      </div>

      <div className="ce-progress" aria-label="Progress">
        {[0, 1, 2, 3].map((i) => <div key={i} className={segClass(i)} />)}
      </div>

      {paid && (
        <div className="ce-paid">
          ✓ Payment confirmed — running full deep scan now.
        </div>
      )}

      <form className="ce-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>

        {step === 0 && (
          <section className="ce-step active">
            <h2 className="ce-q">What is {subjectLabel} name?</h2>
            <div className="ce-field">
              <span className="ce-pointer" aria-hidden>👉</span>
              <input
                ref={nameRef}
                type="text"
                placeholder="Enter firstname"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
            <p className="ce-help">Only first name (or nickname)</p>

            <div className="ce-protip">
              <span className="bar" aria-hidden />
              <p>
                <span className="tip-label">Pro Tip:</span> If you are not sure about the spelling or nickname,
                don't worry — our AI will match similar names and nicknames.
              </p>
            </div>

            <button type="button" className="ce-next" onClick={onNext} disabled={!stepValid}>
              <span>Next</span>
              <ArrowIcon />
            </button>
            <p className="ce-stat">
              <span className="hl">73%</span> said a {gender === 'woman' ? 'female friend' : 'male friend'} used Tinder in a relationship
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="ce-step active">
            <h2 className="ce-q">How old is {displayName}?</h2>
            <div className="ce-field">
              <span className="ce-pointer" aria-hidden>👉</span>
              <input
                ref={ageRef}
                type="number"
                placeholder={`Enter ${subjectLabel} age`}
                min={18}
                max={80}
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
            <p className="ce-help">
              Not sure about <strong>{displayName}</strong>'s age? Just enter the closest estimate —
              our AI will match profiles approximately the same age.
            </p>

            <button type="button" className="ce-next" onClick={onNext} disabled={!stepValid}>
              <span>Next</span>
              <ArrowIcon />
            </button>
            <p className="ce-stat">
              ⭐⭐⭐⭐ <span className="hl">4.5/5</span> based on 1,572 reviews
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="ce-step active">
            <h2 className="ce-q">Where does {subject} live?</h2>
            <div className="ce-field">
              <span className="ce-pointer" aria-hidden>👉</span>
              <input
                ref={cityRef}
                type="text"
                placeholder="Enter a city"
                autoComplete="off"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
            <p className="ce-help">We'll scan a 50&nbsp;km radius around the city you enter.</p>

            <div className="ce-protip">
              <span className="bar" aria-hidden />
              <p>
                <span className="tip-label">Pro Tip:</span> Not sure where? Use the city {subject} travels to most —
                work, gym, or weekends count.
              </p>
            </div>

            <button type="button" className="ce-next" onClick={onNext} disabled={!stepValid}>
              <span>Next</span>
              <ArrowIcon />
            </button>
            <p className="ce-stat">
              <span className="hl">91%</span> of matches are found within 50&nbsp;km of the entered city
            </p>
          </section>
        )}

        {step === 3 && (
          <section className="ce-step active">
            <h2 className="ce-q">Have a photo of {displayName}?</h2>

            <label htmlFor="ce-photo" className={`ce-drop${photoName ? ' has-file' : ''}`}>
              <div className="ce-drop-icon">📷</div>
              <strong>{photoName ?? 'Tap to add a photo'}</strong>
              <span>
                {photoSizeKb != null ? `${photoSizeKb} KB · ready` : 'JPG or PNG · up to 8 MB'}
              </span>
              <input type="file" id="ce-photo" accept="image/*" hidden onChange={onPhotoChange} />
            </label>
            <p className="ce-help">
              Adding a photo lifts accuracy from <strong>88%</strong> → <strong>99%</strong>.
              Photos are hashed locally and never leave your device.
            </p>

            <button type="button" className="ce-next" onClick={onNext}>
              <span>Run search</span>
              <ArrowIcon />
            </button>
            <button type="button" className="ce-skip" onClick={onNext}>Skip — run without photo</button>
          </section>
        )}

        {step === 4 && (
          <section className="ce-step active">
            <div className="ce-scan">
              <div className="ce-eye" aria-hidden />
              <h2 className="ce-q ce-scan-status" style={{ textAlign: 'center' }}>
                {scanDone ? 'Match found.' : 'Scanning…'}
              </h2>
              <p className="ce-scan-log">
                {scanDone ? 'Report ready. Unlock to view.' : SCAN_LOGS[scanLogIdx]}
              </p>
              <div className="ce-scan-bar"><div className="fill" style={{ width: `${scanProgress}%` }} /></div>
            </div>

            {scanDone && (
              <div className="ce-result">
                <h4>Match preview</h4>
                <div className="ce-profile">
                  <div className="ce-avatar">{initial}</div>
                  <div className="ce-profile-meta">
                    <strong>{name || 'Daniel'}{age ? `, ${age}` : ''}</strong>
                    <span>{city || 'Brooklyn, NY'}</span> · Active 26 s ago
                  </div>
                  <span className="ce-tag">Match</span>
                </div>
                <div className="ce-row"><span>Account status</span><strong>Active (online now)</strong></div>
                <div className="ce-row"><span>Last activity</span><strong>Today, 14:22</strong></div>
                <div className="ce-row"><span>Subscription</span><strong>Tinder Gold</strong></div>
                <div className="ce-row locked"><span>Bio change</span><strong>Locked</strong></div>
                <div className="ce-row locked"><span>Photo updates</span><strong>Locked</strong></div>
                <div className="ce-row locked"><span>Cross-platform matches</span><strong>Locked</strong></div>

                <Link href="/pricing" className="ce-next" style={{ marginTop: 18, textDecoration: 'none' }}>
                  <span>🔓 Unlock the full report</span>
                  <ArrowIcon />
                </Link>
                <p className="ce-stat">From <span className="hl">$14.99</span> · refunded if no match found</p>
              </div>
            )}
          </section>
        )}
      </form>

      <p className="ce-fine">
        🔒 Inputs are encrypted in transit. Searches auto-delete after 30 days.
        CheatLove never contacts, swipes, or messages the target.
      </p>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

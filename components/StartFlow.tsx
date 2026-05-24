'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandMark } from './BrandMark';
import { ScanScreen } from './ScanScreen';

const MAX_PHOTOS = 4;
// Estimated scan accuracy by number of photos added (index = photo count).
const ACCURACY_BY_COUNT = [0, 88, 93, 96, 99] as const;

interface PhotoItem {
  name: string;
  sizeKb: number;
  url: string;
}

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
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Keep a live ref to revoke object URLs on unmount (avoids memory leaks).
  const photosRef = useRef<PhotoItem[]>([]);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const [gender, setGender] = useState<Gender>(initialGender);

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityActiveIdx, setCityActiveIdx] = useState(-1);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityAbortRef = useRef<AbortController | null>(null);

  const subjectLabel = gender === 'woman' ? 'her' : 'him';
  const possessive = gender === 'woman' ? 'her' : 'his';
  const subject = gender === 'woman' ? 'she' : 'he';
  const displayName = name || subjectLabel;
  const initial = (name || subjectLabel).slice(0, 1).toUpperCase();

  // Focus the first input on each input step
  useEffect(() => {
    if (step === 1) nameRef.current?.focus({ preventScroll: true });
    if (step === 2) ageRef.current?.focus({ preventScroll: true });
    if (step === 3) cityRef.current?.focus({ preventScroll: true });
  }, [step]);

  const stepValid = useMemo(() => {
    if (step === 1) return name.trim().length >= 1;
    if (step === 2) {
      const v = parseInt(age, 10);
      return Number.isFinite(v) && v >= 18 && v <= 99;
    }
    if (step === 3) return city.trim().length >= 2;
    if (step === 4) return photos.length >= 1;
    return true;
  }, [step, name, age, city, photos]);

  function onNext() {
    if (step < 5) setStep(step + 1);
  }

  // Fired by the "Run search" button: records the typed search criteria
  // (never the photos) before advancing to the scan screen. Best-effort —
  // a failed record must not block the scan.
  function runSearch() {
    void fetch('/api/record-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender,
        name: name.trim(),
        age: age.trim(),
        city: city.trim(),
        photoCount: photos.length,
        paid,
      }),
    }).catch(() => {});
    onNext();
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

  // ─── City autocomplete via Photon (free OSM geocoder, no API key) ───
  async function fetchCitySuggestions(q: string) {
    const query = q.trim();
    if (query.length < 2) {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }
    cityAbortRef.current?.abort();
    const ctrl = new AbortController();
    cityAbortRef.current = ctrl;
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`,
        { signal: ctrl.signal },
      );
      if (!res.ok) return;
      const data = await res.json();
      const PLACE_TYPES = new Set(['city', 'town', 'village', 'locality', 'district', 'county', 'state', 'region']);
      const seen = new Set<string>();
      const labels: string[] = [];
      for (const f of data.features ?? []) {
        const p = f.properties ?? {};
        if (p.osm_key !== 'place' && !PLACE_TYPES.has(p.type)) continue;
        const parts = [p.name, p.state, p.country].filter(Boolean) as string[];
        const label = parts.filter((v, i) => i === 0 || v !== parts[i - 1]).join(', ');
        if (label && !seen.has(label)) {
          seen.add(label);
          labels.push(label);
        }
      }
      setCitySuggestions(labels);
      setCityActiveIdx(-1);
      setCityOpen(labels.length > 0);
    } catch {
      /* aborted or offline — keep current suggestions */
    }
  }

  function onCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setCity(v);
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(() => fetchCitySuggestions(v), 250);
  }

  function selectCity(label: string) {
    setCity(label);
    setCitySuggestions([]);
    setCityOpen(false);
    setCityActiveIdx(-1);
  }

  function onCityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (cityOpen && citySuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCityActiveIdx((i) => (i + 1) % citySuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCityActiveIdx((i) => (i - 1 + citySuggestions.length) % citySuggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectCity(citySuggestions[cityActiveIdx >= 0 ? cityActiveIdx : 0]);
        return;
      }
      if (e.key === 'Escape') {
        setCityOpen(false);
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (stepValid) onNext();
    }
  }

  useEffect(() => () => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityAbortRef.current?.abort();
  }, []);

  function onPhotosSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const added = files.slice(0, room).map((f) => ({
        name: f.name,
        sizeKb: Math.round(f.size / 1024),
        url: URL.createObjectURL(f),
      }));
      return [...prev, ...added];
    });
    e.target.value = ''; // allow re-picking the same file
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  // Segment classes for the 5-segment progress bar (gender, name, age, city, photo)
  const segClass = (idx: number) => {
    if (step >= 5) return 'seg done';
    if (idx === step) return 'seg active';
    if (idx < step) return 'seg done';
    return 'seg';
  };

  // The scan step takes over full-screen with the shared "similarity analysis"
  // screen, fed the user's uploaded photos.
  if (step === 5) {
    return (
      <ScanScreen
        photos={photos.map((p) => p.url)}
        name={name}
        age={age}
        city={city}
      />
    );
  }

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
        <Link href="/" className="ce-logo" aria-label="CheatLens home">
          <BrandMark className="ce-mark" size={26} />
          <span className="ce-wordmark">CHEATLENS</span>
        </Link>
      </div>

      <div className="ce-progress" aria-label="Progress">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={segClass(i)} />)}
      </div>

      {paid && (
        <div className="ce-paid">
          ✓ Payment confirmed — running full deep scan now.
        </div>
      )}

      <form className="ce-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>

        {step === 0 && (
          <section className="ce-step active">
            <h2 className="ce-q">Who are you searching for?</h2>
            <p className="ce-help">Pick the gender of the person you want to scan for.</p>

            <div className="ce-gender" role="group" aria-label="Gender">
              <button
                type="button"
                className={`ce-gender-card${gender === 'man' ? ' selected' : ''}`}
                aria-pressed={gender === 'man'}
                onClick={() => setGender('man')}
              >
                <strong>Male</strong>
              </button>
              <button
                type="button"
                className={`ce-gender-card${gender === 'woman' ? ' selected' : ''}`}
                aria-pressed={gender === 'woman'}
                onClick={() => setGender('woman')}
              >
                <strong>Female</strong>
              </button>
            </div>

            <button type="button" className="ce-next" onClick={onNext}>
              <span>Next</span>
              <ArrowIcon />
            </button>
            <p className="ce-stat">
              <span className="hl">140k+</span> searches completed across 38 countries
            </p>
          </section>
        )}

        {step === 1 && (
          <section className="ce-step active">
            <h2 className="ce-q">What is {possessive} name?</h2>
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

        {step === 2 && (
          <section className="ce-step active">
            <h2 className="ce-q">How old is {displayName}?</h2>
            <div className="ce-field">
              <span className="ce-pointer" aria-hidden>👉</span>
              <input
                ref={ageRef}
                type="number"
                placeholder={`Enter ${possessive} age`}
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

        {step === 3 && (
          <section className="ce-step active">
            <h2 className="ce-q">Where does {subject} live?</h2>
            <div className="ce-field">
              <span className="ce-pointer" aria-hidden>👉</span>
              <input
                ref={cityRef}
                type="text"
                placeholder="Enter a city"
                autoComplete="off"
                role="combobox"
                aria-expanded={cityOpen}
                aria-autocomplete="list"
                value={city}
                onChange={onCityChange}
                onKeyDown={onCityKeyDown}
                onFocus={() => citySuggestions.length > 0 && setCityOpen(true)}
                onBlur={() => window.setTimeout(() => setCityOpen(false), 120)}
              />
              {cityOpen && citySuggestions.length > 0 && (
                <ul className="ce-suggest" role="listbox">
                  {citySuggestions.map((s, i) => (
                    <li key={s} role="option" aria-selected={i === cityActiveIdx}>
                      <button
                        type="button"
                        className={`ce-suggest-item${i === cityActiveIdx ? ' active' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCity(s)}
                      >
                        <PinIcon />
                        <span>{s}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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

        {step === 4 && (
          <section className="ce-step active">
            <h2 className="ce-q">Add photos of {displayName}</h2>
            <p className="ce-help">
              Add <strong>1–4 photos</strong>. The more photos you add, the higher the scan
              accuracy — our AI cross-matches every angle. Photos are never stored on our
              servers and are used only for this search.
            </p>

            <div className="ce-photos">
              {photos.map((p, i) => (
                <div className="ce-photo-slot filled" key={p.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Photo ${i + 1} of ${displayName}`} />
                  <button
                    type="button"
                    className="ce-photo-x"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  className="ce-photo-slot add"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <span className="ce-photo-plus" aria-hidden>+</span>
                  <span className="ce-photo-add-label">Add photo</span>
                </button>
              )}
            </div>

            {/* Visually hidden (not display:none) so programmatic .click() reliably
                opens the picker in in-app webviews (Instagram/Facebook) & older iOS. */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="ce-visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onPhotosSelected}
            />

            <div className="ce-accuracy">
              <div className="ce-accuracy-head">
                <span>Estimated scan accuracy</span>
                <strong>{photos.length === 0 ? '—' : `${ACCURACY_BY_COUNT[photos.length]}%`}</strong>
              </div>
              <div className="ce-accuracy-bar">
                <div className="fill" style={{ width: `${ACCURACY_BY_COUNT[photos.length]}%` }} />
              </div>
              <p className="ce-accuracy-note">
                {photos.length === 0
                  ? 'Add at least 1 photo to run the search.'
                  : photos.length < MAX_PHOTOS
                    ? `Add ${MAX_PHOTOS - photos.length} more photo${MAX_PHOTOS - photos.length > 1 ? 's' : ''} to reach 99% accuracy.`
                    : 'Maximum accuracy — all 4 photos added.'}
              </p>
            </div>

            <button type="button" className="ce-next" onClick={runSearch} disabled={!stepValid}>
              <span>Run search</span>
              <ArrowIcon />
            </button>
          </section>
        )}

      </form>

      <p className="ce-fine">
        🔒 Inputs are encrypted in transit. Searches auto-delete after 30 days.
        CheatLens never contacts, swipes, or messages the target.
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

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path
        d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
        fill="currentColor"
      />
    </svg>
  );
}

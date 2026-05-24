'use client';

// Standalone "busted" profile-report page — the dramatic reveal used as ad
// creative. Shows a target found across dating apps with last-active times,
// profile details, an activity report, and a paywall. Styles: .rp-* in globals.css.

import Link from 'next/link';

const FOUND = [
  { name: 'Tinder', logo: '/assets/logos/apps/tinder.svg', active: 'Last active 18 hours ago', found: true },
  { name: 'Bumble', logo: '/assets/logos/apps/bumble.svg', active: 'Last active 14 hours ago', found: true },
  { name: 'Hinge', logo: '/assets/logos/apps/hinge.svg', active: 'Last active 2 days ago', found: true },
  { name: 'Badoo', logo: '/assets/logos/apps/badoo.svg', active: 'No active profile', found: false },
];

const PICS = [
  '/assets/report/target.webp',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80&auto=format&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80&auto=format&fit=crop&crop=faces',
];

// Relative bar heights (%) for a fake weekly activity chart.
const ACTIVITY = [30, 52, 41, 68, 88, 100, 74];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ReportDemo() {
  return (
    <div className="rp-page">
      <div className="rp-card">
        {/* WANTED — CAUGHT banner */}
        <div className="rp-wanted">
          <span className="rp-wanted-siren" aria-hidden>🚨</span>
          <div className="rp-wanted-text">
            <strong>SUSPECT LOCATED</strong>
            <span>Wanted profile traced &amp; identified</span>
          </div>
          <span className="rp-wanted-badge">WANTED</span>
        </div>

        {/* HERO */}
        <div className="rp-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rp-hero-photo" src="/assets/report/target.webp" alt="" />
          <div className="rp-hero-overlay" />
          <span className="rp-stamp" aria-hidden>CAUGHT</span>
          <span className="rp-confirmed">● MATCH CONFIRMED</span>
          <div className="rp-hero-meta">
            <h1>Matthew, 24</h1>
            <p>📍 2.4 km away · <span className="rp-online">Active now</span></p>
          </div>
        </div>

        <div className="rp-summary">
          Found on <strong>3 dating apps</strong> in the last 30 days.
        </div>

        {/* PROFILE REPORT */}
        <h2 className="rp-h">Profile report</h2>
        <div className="rp-platforms">
          {FOUND.map((p) => (
            <div key={p.name} className={`rp-platform${p.found ? '' : ' miss'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logo} alt="" />
              <div className="rp-platform-text">
                <strong>
                  {p.found ? 'Found on ' : 'Not found on '}{p.name}
                  {p.found && <span className="rp-found-dot" aria-hidden />}
                </strong>
                <span>{p.active}</span>
              </div>
              <span className={`rp-pill${p.found ? ' yes' : ' no'}`}>{p.found ? 'FOUND' : '—'}</span>
            </div>
          ))}
        </div>

        {/* ALERT */}
        <div className="rp-alert">
          <span className="rp-alert-ico" aria-hidden>⚠</span>
          <div>
            <strong>New activity detected 4 hours ago</strong>
            <span>A new profile photo was added on Tinder.</span>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <h2 className="rp-h">Profile details</h2>
        <div className="rp-details">
          <div className="rp-row"><span>Name</span><b>Matthew</b></div>
          <div className="rp-row"><span>Age</span><b>24</b></div>
          <div className="rp-row"><span>Distance</span><b>2.4 km</b></div>
          <div className="rp-row locked"><span>Bio</span><b>“Here for something real…”</b></div>
          <div className="rp-row locked"><span>Job title</span><b>Marketing manager</b></div>
          <div className="rp-row locked"><span>Height</span><b>183 cm</b></div>
        </div>

        {/* ACTIVITY REPORT */}
        <h2 className="rp-h">Activity report</h2>
        <div className="rp-activity">
          <div className="rp-bars">
            {ACTIVITY.map((h, i) => (
              <div key={i} className="rp-bar-col">
                <div className="rp-bar" style={{ height: `${h}%` }} />
                <span>{DAYS[i]}</span>
              </div>
            ))}
          </div>
          <p className="rp-activity-note">Most active: <strong>weekends, 11pm – 1am</strong></p>
        </div>

        {/* PROFILE PICTURES */}
        <h2 className="rp-h">Profile pictures</h2>
        <div className="rp-pics">
          {PICS.map((src, i) => (
            <div key={src} className={`rp-pic${i === 0 ? '' : ' locked'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              {i !== 0 && <span className="rp-lock" aria-hidden>🔒</span>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/pricing" className="rp-unlock">🔓 Unlock the full report →</Link>
        <p className="rp-fine">From $14.99 · 100% refund if no match is found</p>
      </div>
    </div>
  );
}

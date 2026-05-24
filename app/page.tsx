import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Laurel } from '@/components/Laurel';
import { CtaRail } from '@/components/CtaRail';
import { FaqAccordion } from '@/components/FaqAccordion';
import { PlatformMarquee } from '@/components/PlatformMarquee';

const FAQ_ITEMS = [
  {
    q: 'How does the dating profile search work?',
    a: "We index public-facing data from major dating apps and cross-reference photos and bios using vector similarity. No private credentials are needed — only what the apps already show to other users in your area.",
  },
  {
    q: 'Is the target ever notified?',
    a: 'Never. Searches are read-only from our side — no likes, swipes, or messages are sent to anyone. They will never know.',
  },
  {
    q: 'How accurate are the results?',
    a: '99% accuracy for accounts using real photos and a known city. For aliased or photo-less profiles, accuracy drops to roughly 70%. We refund in full when no match is found.',
  },
  {
    q: 'How long does a scan take?',
    a: 'Most searches return in 2–3 minutes. Cross-platform deep searches can take up to 8 minutes.',
  },
  {
    q: 'Is this legal?',
    a: 'CheatLens only surfaces information already publicly visible to anyone who uses the dating app. We comply with GDPR, CCPA, and US data protection laws.',
  },
  {
    q: 'What if no profile is found?',
    a: 'Full refund within 24 hours — no questions asked, no forms to fill.',
  },
  {
    q: 'Do I need their phone number or email?',
    a: 'No. First name, approximate age, and a city are usually enough. Uploading a photo boosts accuracy from ~88% to ~99%.',
  },
  {
    q: 'How fresh is the data?',
    a: 'Profiles are re-indexed every 12–24 hours. Last-seen timestamps are typically accurate within a 30-minute window.',
  },
  {
    q: 'How much does it cost?',
    a: (
      <>
        Plans start at $14.99 for a one-time search. See <Link href="/pricing">Pricing</Link> for the full breakdown.
      </>
    ),
  },
  {
    q: 'What happens to my data afterwards?',
    a: 'Reports auto-purge 30 days after delivery. We never sell or share your data with third parties.',
  },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      <div className="container layout">

        <main className="layout-main">

          {/* HERO */}
          <section className="hero">
            <div className="award" aria-label="Top-rated infidelity detector, five stars">
              <Laurel className="laurel laurel-l" />
              <div className="award-inner">
                <span className="award-label">Top-rated<br />infidelity detector</span>
                <div className="award-stars">★★★★★</div>
              </div>
              <Laurel className="laurel laurel-r" />
            </div>

            <h1>
              Find any dating<br />profile instantly.
            </h1>
            <p className="hero-sub">
              Discover whether your partner has an active profile on Tinder, Hinge, or Bumble &mdash;
              in minutes, with AI. Private, silent, and 99% accurate.
            </p>

            <div className="press-row">
              <span>Featured in</span>
              <span className="press-logo">Daily Mail</span>
              <span className="press-logo">The Sun</span>
              <span className="press-logo">VICE</span>
            </div>
          </section>

          {/* PLATFORMS — auto-scrolling supported dating apps */}
          <PlatformMarquee />

          {/* HOW IT WORKS */}
          <section id="how">
            <div className="section-head">
              <div className="section-eyebrow">How it works</div>
              <h2 className="section-title">Three steps. No app, no account.</h2>
              <p className="section-sub">CheatLens does the heavy lifting — you just answer a few questions.</p>
            </div>

            <div className="steps">
              {[
                { n: 1, t: 'Enter search details', d: "Start by entering the person's name, age, and the city where they likely use the app.", time: '~ 1 min' },
                { n: 2, t: 'Let our AI do the search', d: 'Our model cross-references millions of profiles, photo hashes, and activity timestamps in parallel.', time: '~ 2 min' },
                { n: 3, t: 'Get instant results', d: 'See their bio, photos, last-active time, location, and subscription tier — delivered to your inbox.', time: 'Instant' },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-body">
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                  <span className="step-time">{s.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* WHAT YOU GET */}
          <section id="what">
            <div className="section-head">
              <div className="section-eyebrow">What you'll get</div>
              <h2 className="section-title">Your comprehensive <span className="red">report.</span></h2>
              <p className="section-sub">Everything visible on their account — and everything they thought was private.</p>
            </div>

            <div className="what-you-get">
              <div className="what-cell">
                <h3><span className="ico">👤</span> Profile details</h3>
                <p>Bio, photos, age, height, occupation — exactly as it appears to other users on the app.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="visual visual-img"><img src="/assets/svg/phone-mockup.svg" alt="Sample profile detail" /></div>
              </div>

              <div className="what-cell">
                <h3><span className="ico">📍</span> Last dating activity</h3>
                <p>Find out if their account is still active — last time and approximate location of use.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="visual visual-img"><img src="/assets/svg/map-mockup.svg" alt="Last-seen location map" /></div>
              </div>

              <div className="what-cell">
                <h3><span className="ico">🔔</span> Account updates</h3>
                <p>Stay informed about any changes — new photos, bio edits, age tweaks.</p>
                <div className="visual notif-list" style={{ background: 'var(--bg-alt)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                  {[
                    { msg: 'RADAR: New bio change detected', ago: 'now' },
                    { msg: 'RADAR: New picture detected', ago: '3d ago' },
                    { msg: 'RADAR: New picture detected', ago: '5d ago' },
                  ].map((n, i) => (
                    <div className="notif" key={i}>
                      <div className="notif-icon" />
                      <div><strong>CheatLens</strong><div className="msg">{n.msg}</div></div>
                      <span className="ago">{n.ago}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="what-cell">
                <h3><span className="ico">💳</span> Subscription tier</h3>
                <p>Detect whether they pay for Tinder Gold, Plus, Platinum, Hinge Premium, or Bumble Premium.</p>
                <div
                  className="visual"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}
                >
                  <div className="tier-pills">
                    <span className="tier-pill tier-platinum">Tinder <strong>Platinum</strong></span>
                    <span className="tier-pill tier-gold">Tinder <strong>Gold</strong></span>
                    <span className="tier-pill tier-plus">Tinder <strong>+</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WHY */}
          <section>
            <div className="section-head">
              <div className="section-eyebrow">Why CheatLens</div>
              <h2 className="section-title">The fastest path from <span className="red">suspicion</span> to certainty.</h2>
            </div>

            <div className="what-you-get">
              {[
                { ico: '🔒', t: 'Private & secure', d: 'We never notify the target. End-to-end encrypted. Reports auto-purge after 30 days.' },
                { ico: '⚡', t: 'Quick & easy', d: "No login. No app install. Enter their info and we'll reveal their active profile." },
                { ico: '📊', t: 'Complete data', d: 'Full report — bio, photos, last activity, subscription, last-used location.' },
                { ico: '🎯', t: 'Smarter searches', d: 'Multi-signal matching: photo fingerprints, behavioral patterns, cross-platform mapping.' },
              ].map((c) => (
                <div className="what-cell" key={c.t} style={{ minHeight: 200 }}>
                  <h3><span className="ico">{c.ico}</span> {c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* STATS */}
          <section>
            <div className="section-head">
              <div className="section-eyebrow">CheatLens in action</div>
              <h2 className="section-title">Trusted by 140,000+ people who needed certainty.</h2>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="big">+51%</div>
                <div className="lbl-top">Matched profiles</div>
                <div className="lbl-bot">Users who found who they were looking for.</div>
              </div>
              <div className="stat">
                <div className="big" style={{ color: '#5C7CFA' }}>140k+</div>
                <div className="lbl-top">Searches completed</div>
                <div className="lbl-bot">Across users in 38 countries.</div>
              </div>
              <div className="stat">
                <div className="big" style={{ color: '#9747FF' }}>95%</div>
                <div className="lbl-top">Support satisfaction</div>
                <div className="lbl-bot">Human support, 24/7.</div>
              </div>
            </div>
          </section>

          {/* REVIEWS */}
          <section id="reviews">
            <div className="section-head">
              <div className="review-rating">
                <span className="stars">★★★★★</span>
                <span><strong style={{ color: 'var(--ink)' }}>4.5/5</strong> based on 1,572 reviews</span>
              </div>
              <h2 className="section-title">People just like you found <br />the <span className="red">answer</span> they were looking for.</h2>
            </div>

            <div className="reviews">
              {[
                {
                  stars: '★★★★★', when: '4 days ago',
                  text: '"This website is just brilliant. Honestly, thanks for the hours of therapy saved."',
                  name: 'Mary Belle', age: 38,
                  av: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop&crop=faces',
                },
                {
                  stars: '★★★★★', when: '7 days ago',
                  text: '"My ex was on there and he was cheating with a pic I took of him. 💀💀💀"',
                  name: 'Izzy', age: 27,
                  av: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80&auto=format&fit=crop&crop=faces',
                },
                {
                  stars: '★★★★★', when: '11 days ago',
                  text: '"Surprised at the level of detail. Caught the new photos he uploaded last weekend."',
                  name: 'Alex P.', age: 31,
                  av: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&auto=format&fit=crop&crop=faces',
                },
                {
                  stars: '★★★★☆', when: '2 weeks ago',
                  text: '"Result came faster than expected. Saved me from a really bad situation."',
                  name: 'Jenna H.', age: 29,
                  av: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80&auto=format&fit=crop&crop=faces',
                },
              ].map((r) => (
                <div className="review" key={r.name}>
                  <div className="top"><span className="stars">{r.stars}</span><span>{r.when}</span></div>
                  <p>{r.text}</p>
                  <div className="who">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <div className="av"><img src={r.av} alt="" loading="lazy" /></div>
                    <span><strong>{r.name}</strong> · {r.age} years old</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq">
            <div className="section-head">
              <div className="section-eyebrow">FAQ</div>
              <h2 className="section-title">Frequently asked <br />questions.</h2>
            </div>
            <FaqAccordion items={FAQ_ITEMS} defaultOpen={0} />
          </section>

          {/* CTA BAND */}
          <section style={{ paddingBottom: 32 }}>
            <div className="cta-band">
              <h2>One scan away from knowing the truth.</h2>
              <p>Start your free search now. Pay only when you have results.</p>
              <Link href="/start" className="btn btn-primary btn-xl">Start free search →</Link>
            </div>
          </section>
        </main>

        <CtaRail />
      </div>

      <Footer />
    </>
  );
}

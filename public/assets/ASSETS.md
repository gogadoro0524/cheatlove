# CheatLove Visual Assets

Curated visual assets for the CheatLove landing pages. Color palette anchored on warm Anthropic-Claude red `#C73E1D` (not the original CheatEye hot-pink). All SVG mockups were generated locally — zero external dependencies, fully recolorable, license-clean.

For human photography we use **direct Unsplash CDN URLs** (free, commercial use allowed under the Unsplash License — no attribution required but appreciated). No download needed; HTML can `<img src="…">` them directly. Append `?w=400&q=80&auto=format&fit=crop&crop=faces` to get a 400px face-cropped variant.

---

## SVG Mockups (`/assets/svg/`)

### phone-mockup.svg
- **Purpose:** Hero right-column phone mockup. Tinder/Hinge-style profile card with silhouette portrait, "ACTIVE PROFILE FOUND" yellow sticker, name/age, distance, and swipe action buttons in CheatLove red.
- **Dimensions:** 320 × 640 (viewBox; scales freely)
- **Source:** Hand-authored SVG, original
- **License:** Project-owned

### map-mockup.svg
- **Purpose:** "Last seen near…" section — desaturated city grid with red pin + radar pulse rings and a small distance pill label.
- **Dimensions:** 480 × 360
- **Source:** Hand-authored SVG, original
- **License:** Project-owned

### notification-stack.svg
- **Purpose:** Stacked iOS push notifications showing CheatLove alerts at different timestamps (5d ago, 3d ago, now). The newest card is fully opaque with a pulsing red dot; back cards fade.
- **Dimensions:** 380 × 340
- **Source:** Hand-authored SVG, original (includes SMIL pulse animation)
- **License:** Project-owned

### active-profile-sticker.svg
- **Purpose:** Standalone "ACTIVE PROFILE FOUND!" sticker — yellow, tilted -4°, red status dot. Can be overlaid on any profile photo or result card.
- **Dimensions:** 240 × 56
- **Source:** Hand-authored SVG, original
- **License:** Project-owned

### confidence-bar.svg
- **Purpose:** "Match confidence: 94%" gradient progress bar for the report / how-it-works section. Subtle subtitle lists matching signals (photo, bio, location).
- **Dimensions:** 360 × 80
- **Source:** Hand-authored SVG, original
- **License:** Project-owned

---

## Press / Logos (`/assets/logos/`)

All press logos are simple SVG wordmarks in `#1a1208` for the "As seen in" trust bar. They render at any size, accept `opacity` for a muted grey effect, and avoid any registered logo files we don't own. Use as wordmarks only.

| File | Outlet | Dimensions |
|---|---|---|
| forbes.svg | Forbes | 180 × 40 |
| daily-mail.svg | Daily Mail | 220 × 40 |
| the-sun.svg | The Sun | 160 × 40 |
| vice.svg | VICE | 140 × 40 |
| techcrunch.svg | TechCrunch | 220 × 40 |

- **License:** Wordmarks rendered as plain text typography. Use only as editorial reference of media coverage; do not imply endorsement.

### dating-apps-row.svg
- **Purpose:** "Works with" row showing Tinder / Hinge / Bumble / Match / OkCupid as muted wordmarks at 78% opacity.
- **Dimensions:** 720 × 60
- **License:** Wordmarks only (typography). Treat as editorial reference.

---

## Human Photos (Unsplash — direct CDN, no download)

All from the [Unsplash License](https://unsplash.com/license) (free for commercial use). Use these URLs directly in `<img src>`. Append query string `?w=400&q=80&auto=format&fit=crop&crop=faces` for a 400px face-cropped square. For higher-res hero use, raise `w=800`.

### Reviewer avatars (testimonials section)

| Slot | Description | URL (append `?w=200&q=80&auto=format&fit=crop&crop=faces`) |
|---|---|---|
| avatar-1 | Smiling woman, 30s, warm tones | `https://images.unsplash.com/photo-1494790108377-be9c29b29330` |
| avatar-2 | Man, 30s, beard, neutral expression | `https://images.unsplash.com/photo-1500648767791-00dcc994a43e` |
| avatar-3 | Woman, 20s, natural light portrait | `https://images.unsplash.com/photo-1438761681033-6461ffad8d80` |
| avatar-4 | Man, 40s, professional headshot | `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e` |
| avatar-5 | Woman, 30s, candid smile | `https://images.unsplash.com/photo-1487412720507-e7ab37603c6f` |

### "Found profile" hero / result demo photos

Use as the actual face inside the phone mockup or as a swap for the silhouette. Add a slight desaturate filter (`filter: grayscale(0.15) contrast(1.05)`) to keep tone consistent with the warm-red palette.

| Slot | Description | URL |
|---|---|---|
| result-1 | Man at café, casual, late 20s | `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop` |
| result-2 | Woman outdoors, smiling, 30s | `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format&fit=crop` |
| result-3 | Man, gym/active, late 30s | `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&auto=format&fit=crop` |
| result-4 | Woman with sunglasses, urban | `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop` |

### Usage tips
- For round avatars: wrap in a `border-radius: 50%` container and crop with `object-fit: cover; aspect-ratio: 1`.
- Lazy-load below the fold: `<img loading="lazy" decoding="async" …>`.
- If offline behavior matters, run `curl -o avatars/avatar-1.jpg "<URL>?w=200&q=80&fit=crop&crop=faces"` to bake them in. The current setup assumes online access (smaller repo, fresher Unsplash optimization).

---

## Color Reference (for any future asset)

| Token | Hex | Use |
|---|---|---|
| brand-red | `#C73E1D` | Primary accent, pins, CTAs |
| brand-red-bright | `#E1502E` | Gradient highlight |
| brand-red-dark | `#A82F11` | Pressed states, gradient end |
| ink | `#1a1208` | Text, wordmarks |
| sticker-yellow | `#F5C518` | "Active profile found" badge |
| paper | `#f8f2ec` | Phone screen background |
| muted | `#7a5a4d` | Secondary text |

---

## Quick Wiring Cheat-Sheet (for HTML author)

```html
<!-- Hero phone -->
<img src="assets/svg/phone-mockup.svg" alt="CheatLove scan result" width="320" height="640">

<!-- Notification stack (below hero) -->
<img src="assets/svg/notification-stack.svg" alt="Real-time alerts" width="380" height="340">

<!-- Map section -->
<img src="assets/svg/map-mockup.svg" alt="Last seen location" width="480" height="360">

<!-- Press bar -->
<img src="assets/logos/forbes.svg" alt="Forbes" height="22" style="opacity:.55">
<img src="assets/logos/daily-mail.svg" alt="Daily Mail" height="22" style="opacity:.55">
<!-- …etc -->

<!-- Testimonial avatar (no download) -->
<img class="avatar"
     src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop&crop=faces"
     alt="Sarah, verified user" width="48" height="48" loading="lazy">
```

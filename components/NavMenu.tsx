'use client';

import { useState, type ReactNode } from 'react';

// Wraps the nav links and adds a mobile hamburger toggle. On desktop the
// links show inline (the toggle is hidden by CSS); on mobile they collapse
// into a dropdown that this toggles open/closed.
export function NavMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav-nav">
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <ul
        className={`nav-links${open ? ' open' : ''}`}
        onClick={(e) => {
          // Close the mobile dropdown after tapping a link.
          if ((e.target as HTMLElement).closest('a')) setOpen(false);
        }}
      >
        {children}
      </ul>
    </nav>
  );
}

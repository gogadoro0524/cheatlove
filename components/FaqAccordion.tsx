'use client';

import { useState } from 'react';

interface FaqEntry {
  q: string;
  a: React.ReactNode;
}

export function FaqAccordion({ items, defaultOpen = 0 }: { items: FaqEntry[]; defaultOpen?: number }) {
  const [openIdx, setOpenIdx] = useState<number | null>(defaultOpen);

  return (
    <div className="faq">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className={`faq-item${open ? ' open' : ''}`}>
            <div
              className="faq-q"
              role="button"
              tabIndex={0}
              onClick={() => setOpenIdx(open ? null : i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenIdx(open ? null : i);
                }
              }}
            >
              {item.q}
              <span className="plus">+</span>
            </div>
            <div className="faq-a">{item.a}</div>
          </div>
        );
      })}
    </div>
  );
}

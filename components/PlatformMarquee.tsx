const PLATFORMS = [
  { name: 'Tinder', slug: 'tinder' },
  { name: 'Bumble', slug: 'bumble' },
  { name: 'Hinge', slug: 'hinge' },
  { name: 'Happn', slug: 'happn' },
  { name: 'Badoo', slug: 'badoo' },
  { name: 'OkCupid', slug: 'okcupid' },
  { name: 'Grindr', slug: 'grindr' },
  { name: 'Plenty of Fish', slug: 'pof' },
  { name: 'Match', slug: 'match' },
  { name: 'Fruitz', slug: 'fruitz' },
  { name: 'Meetic', slug: 'meetic' },
  { name: 'Feeld', slug: 'feeld' },
] as const;

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="pf-group" aria-hidden={hidden || undefined}>
      {PLATFORMS.map((p) => (
        <li className="pf-item" key={p.slug}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/logos/apps/${p.slug}.svg`} alt={p.name} width={38} height={38} loading="lazy" />
          <span>{p.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlatformMarquee() {
  return (
    <section className="platforms" aria-label="Dating platforms CheatLove scans">
      <p className="pf-label">Scans across every major dating app</p>
      <div className="pf-marquee">
        <div className="pf-track">
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}

type BrandMarkProps = {
  className?: string;
  size?: number;
};

// Magnifying glass with a heart in the lens — "scan love / look into a relationship".
// Drawn in currentColor so it inherits the surrounding text color (white on the red
// banner, dark on the start flow).
export function BrandMark({ className = 'brand-mark', size }: BrandMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="2.4" />
      <line
        x1="19.4"
        y1="19.4"
        x2="27"
        y2="27"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        fill="currentColor"
        d="M13 17.1C11.1 14.9 8.6 13.1 8.6 10.8 8.6 9.4 9.7 8.3 11 8.3c1 0 1.7.6 2 1.2.3-.6 1-1.2 2-1.2 1.3 0 2.4 1.1 2.4 2.5 0 2.3-2.5 4.1-4.4 6.3Z"
      />
    </svg>
  );
}

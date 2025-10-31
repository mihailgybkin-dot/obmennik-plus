// components/Logo.tsx
import Link from "next/link";

type Props = {
  size?: number;          // пиксели
  asLink?: boolean;       // сделать кликабельным, ведёт на /
  title?: string;         // для a11y
};

export default function Logo({ size = 64, asLink = false, title = "Обменник +" }: Props) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label={title}
      role="img"
      className="drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
    >
      {/* Большая O */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Жёлтый плюс внизу-справа (как индекс) */}
      <g transform="translate(64,66)">
        <rect x="-10" y="-10" width="20" height="20" rx="5" fill="rgba(0,0,0,0.25)" />
        <rect x="-7" y="-2" width="14" height="4" rx="2" fill="#F5C84B" />
        <rect x="-2" y="-7" width="4"  height="14" rx="2" fill="#F5C84B" />
      </g>
    </svg>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label={title} className="inline-block align-middle">
        {svg}
      </Link>
    );
  }
  return svg;
}

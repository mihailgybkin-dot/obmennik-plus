// components/Logo.tsx
import Link from "next/link";

type Props = {
  size?: number;          // px
  asLink?: boolean;       // клик ведёт на /
  title?: string;
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
      {/* Узкая жирная O (эллипс) */}
      <ellipse
        cx="46"    /* слегка смещаем влево, чтобы плюс «сел» красивее */
        cy="50"
        rx="26"    /* уже */
        ry="34"    /* выше */
        fill="none"
        stroke="white"
        strokeWidth="12"  /* жирнее */
        strokeLinecap="round"
      />
      {/* Больший жёлтый плюс снизу-справа */}
      <g transform="translate(68,70)">
        <rect x="-14" y="-14" width="28" height="28" rx="7" fill="rgba(0,0,0,0.25)" />
        <rect x="-10" y="-3" width="20" height="6" rx="3" fill="#F5C84B" />
        <rect x="-3"  y="-10" width="6"  height="20" rx="3" fill="#F5C84B" />
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

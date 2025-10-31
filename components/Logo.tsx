"use client";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center ${className}`} aria-label="Обменник +">
      {/* Буква О */}
      <div
        className="relative grid place-items-center rounded-full border border-white/40"
        style={{ width: 28, height: 28 }}
      >
        <div className="w-4 h-4 rounded-full border border-white/60" />
      </div>
      {/* Жёлтый +, выступает за «О» */}
      <div
        className="absolute -right-2 -bottom-2 text-yellow-400 font-black leading-none select-none"
        style={{ fontSize: 18 }}
      >
        +
      </div>
    </div>
  );
}

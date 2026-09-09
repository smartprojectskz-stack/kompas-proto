export default function FireflyMascot({
  size = 200,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="fm-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD98A" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#F0A94E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F0A94E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A4270" />
          <stop offset="100%" stopColor="#342D50" />
        </linearGradient>
        <radialGradient id="fm-tail" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF1CE" />
          <stop offset="55%" stopColor="#F0A94E" />
          <stop offset="100%" stopColor="#F0A94E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="url(#fm-halo)" />

      {/* sparkles */}
      <g fill="#FCD98A">
        <circle cx="34" cy="60" r="3" opacity="0.9" />
        <circle cx="166" cy="86" r="2.4" opacity="0.8" />
        <circle cx="150" cy="150" r="3.4" opacity="0.85" />
        <circle cx="46" cy="150" r="2" opacity="0.7" />
      </g>

      {/* wings */}
      <ellipse cx="70" cy="88" rx="20" ry="30" fill="#CFE0EE" opacity="0.55" transform="rotate(-18 70 88)" />
      <ellipse cx="132" cy="90" rx="20" ry="30" fill="#CFE0EE" opacity="0.55" transform="rotate(18 132 90)" />

      {/* antennae */}
      <path d="M86 66c-6-10-6-20 2-28" stroke="#93A8C7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M114 66c6-10 6-20-2-28" stroke="#93A8C7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="88" cy="37" r="3.5" fill="#93A8C7" />
      <circle cx="112" cy="37" r="3.5" fill="#93A8C7" />

      {/* glow tail */}
      <ellipse cx="100" cy="148" rx="22" ry="18" fill="url(#fm-tail)" />

      {/* body */}
      <ellipse cx="100" cy="108" rx="46" ry="50" fill="url(#fm-body)" />

      {/* cheeks */}
      <ellipse cx="72" cy="112" rx="8" ry="6" fill="#F0A94E" opacity="0.5" />
      <ellipse cx="128" cy="112" rx="8" ry="6" fill="#F0A94E" opacity="0.5" />

      {/* eyes */}
      <circle cx="82" cy="100" r="12" fill="#FFFDF8" />
      <circle cx="118" cy="100" r="12" fill="#FFFDF8" />
      <circle cx="85" cy="102" r="5.5" fill="#2E3550" />
      <circle cx="121" cy="102" r="5.5" fill="#2E3550" />
      <circle cx="87" cy="99" r="1.8" fill="#FFFDF8" />
      <circle cx="123" cy="99" r="1.8" fill="#FFFDF8" />

      {/* smile */}
      <path d="M88 122c5 6 19 6 24 0" stroke="#2E3550" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

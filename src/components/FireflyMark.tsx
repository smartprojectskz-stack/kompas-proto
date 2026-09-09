export default function FireflyMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="firefly-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD98A" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#F0A94E" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F0A94E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#firefly-glow)" />
      <ellipse cx="19" cy="21" rx="5.5" ry="4.2" fill="#3A3352" />
      <circle cx="24.5" cy="20.3" r="2.1" fill="#FCD98A" />
      <path
        d="M14 18c-2-2.4-2-5 0-6.6M25 15c1.8-2.6 1.6-5.2-.4-6.6"
        stroke="#93A8C7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

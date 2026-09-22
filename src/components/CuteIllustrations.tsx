import React from 'react';

export const VaultyMascot: React.FC<{ size?: number; className?: string; mood?: 'happy' | 'winking' | 'sparkle' }> = ({
  size = 64,
  className = '',
  mood = 'happy',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Soft shadow */}
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000000" fillOpacity="0.08" />

      {/* Main Vault Body (Adapts dynamically to active theme color) */}
      <rect x="14" y="18" width="72" height="70" rx="18" fill="var(--accent-primary, #4F46E5)" />
      {/* Light highlight reflection on top edge */}
      <path
        d="M26 22H74C80.6274 22 86 27.3726 86 34V40C86 33.3726 80.6274 28 74 28H26C19.3726 28 14 33.3726 14 40V34C14 27.3726 19.3726 22 26 22Z"
        fill="#FFFFFF"
        fillOpacity="0.25"
      />

      {/* Vault Door Center Circle */}
      <circle cx="50" cy="53" r="26" fill="#FFFFFF" />
      <circle cx="50" cy="53" r="22" fill="var(--accent-light, #EEF2FF)" />

      {/* Safe Handle / Dial Spokes */}
      <circle cx="50" cy="53" r="7" fill="var(--accent-primary, #4F46E5)" />
      <rect x="47.5" y="34" width="5" height="7" rx="2.5" fill="var(--accent-primary, #4F46E5)" />
      <rect x="47.5" y="65" width="5" height="7" rx="2.5" fill="var(--accent-primary, #4F46E5)" />
      <rect x="31" y="50.5" width="7" height="5" rx="2.5" fill="var(--accent-primary, #4F46E5)" />
      <rect x="62" y="50.5" width="7" height="5" rx="2.5" fill="var(--accent-primary, #4F46E5)" />

      {/* Cute Face elements depending on mood */}
      {mood === 'winking' ? (
        <>
          <circle cx="43" cy="48" r="2.5" fill="#18181B" />
          <path d="M54 48 C56 46, 58 46, 60 48" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Friendly eyes */}
          <circle cx="42" cy="48" r="2.8" fill="#18181B" />
          <circle cx="41.2" cy="47.2" r="0.9" fill="#FFFFFF" />
          <circle cx="58" cy="48" r="2.8" fill="#18181B" />
          <circle cx="57.2" cy="47.2" r="0.9" fill="#FFFFFF" />
        </>
      )}

      {/* Rosy blush cheeks */}
      <circle cx="37" cy="53" r="3" fill="#F43F5E" fillOpacity="0.3" />
      <circle cx="63" cy="53" r="3" fill="#F43F5E" fillOpacity="0.3" />

      {/* Sweet smile */}
      <path
        d="M47 58 C48.5 60.5, 51.5 60.5, 53 58"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Playful cute Antenna on top */}
      <line x1="50" y1="18" x2="50" y2="9" stroke="#FF5C00" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="7" r="5" fill="#FACC15" />
    </svg>
  );
};

export const EmptyBoxIllustration: React.FC<{ size?: number; text?: string }> = ({
  size = 120,
  text = 'Nothing here yet!',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3"
      >
        <ellipse cx="80" cy="126" rx="55" ry="8" fill="#E4E4E7" />
        {/* Open Box */}
        <path
          d="M30 65 L80 92 L130 65 L130 110 L80 135 L30 110 Z"
          fill="#FED7AA"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M80 92 L80 135"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Box flaps */}
        <polygon
          points="30,65 15,48 65,35 80,52"
          fill="#FFEDD5"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon
          points="130,65 145,48 95,35 80,52"
          fill="#FFEDD5"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Peeking little cute stars / dust */}
        <circle cx="80" cy="40" r="4" fill="#FF5C00" />
        <circle cx="65" cy="25" r="2.5" fill="#FACC15" />
        <circle cx="95" cy="22" r="2" fill="#FACC15" />
        {/* Face on the box */}
        <circle cx="55" cy="98" r="2.5" fill="#9A3412" />
        <circle cx="70" cy="106" r="2.5" fill="#9A3412" />
        <path d="M60 106 Q64 110 68 106" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <p className="text-zinc-600 font-semibold text-base">{text}</p>
    </div>
  );
};

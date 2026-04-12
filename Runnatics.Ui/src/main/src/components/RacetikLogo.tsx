import React, { useEffect, useState } from 'react';

import logoStatic from '../../../assets/logos/racetik-logo-static.svg';
import logoWhite from '../../../assets/logos/racetik-logo-white.svg';
import logoWordmark from '../../../assets/logos/racetik-wordmark.svg';
import logoIcon from '../../../assets/logos/racetik-icon.svg';

export type RacetikLogoVariant = 'full' | 'animated' | 'icon' | 'white' | 'wordmark';

interface RacetikLogoProps {
  variant?: RacetikLogoVariant;
  width?: number;
  className?: string;
  /** Re-triggers the animation when toggled (animated variant only) */
  replay?: boolean;
}

const RacetikLogo: React.FC<RacetikLogoProps> = ({
  variant = 'full',
  width = 240,
  className,
  replay,
}) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (variant === 'animated') {
      setAnimKey(k => k + 1);
    }
  }, [replay, variant]);

  if (variant === 'animated') {
    // Inline SVG so CSS animations play
    const aspectRatio = 520 / 150;
    const height = Math.round(width / aspectRatio);
    return (
      <svg
        key={animKey}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 520 150"
        width={width}
        height={height}
        className={className}
        aria-label="Racetik"
        role="img"
      >
        <defs>
          <style>{`
            @keyframes rt-lane1 { 0% { stroke-dashoffset: 200; opacity: 0; } 40% { opacity: 0.3; } 100% { stroke-dashoffset: 0; opacity: 0.3; } }
            @keyframes rt-lane2 { 0% { stroke-dashoffset: 200; opacity: 0; } 40% { opacity: 0.55; } 100% { stroke-dashoffset: 0; opacity: 0.55; } }
            @keyframes rt-lane3 { 0% { stroke-dashoffset: 200; opacity: 0; } 40% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }
            @keyframes rt-dot-pop { 0% { r: 0; opacity: 0; } 70% { r: 10px; opacity: 1; } 100% { r: 7.5px; opacity: 1; } }
            @keyframes rt-check-draw { 0% { stroke-dashoffset: 30; } 100% { stroke-dashoffset: 0; } }
            @keyframes rt-pulse-ring { 0% { r: 7.5px; opacity: 0.5; } 100% { r: 18px; opacity: 0; } }
            @keyframes rt-text-slide { 0% { opacity: 0; transform: translateX(-15px); } 100% { opacity: 1; transform: translateX(0); } }
            @keyframes rt-underline-draw { 0% { stroke-dashoffset: 360; } 100% { stroke-dashoffset: 0; } }
            @keyframes rt-tagline-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
          `}</style>
          <linearGradient id="rt-ug" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8491d" />
            <stop offset="100%" stopColor="#ff6b35" />
          </linearGradient>
        </defs>

        <g transform="translate(12, 18)">
          <path
            d="M5,58 Q30,5 65,18 Q88,28 98,14"
            fill="none" stroke="#e8491d" strokeWidth="6" strokeLinecap="round"
            style={{ strokeDasharray: 200, animation: 'rt-lane1 0.8s ease-out 0.2s both' }}
          />
          <path
            d="M10,68 Q38,18 72,34 Q92,42 102,28"
            fill="none" stroke="#e8491d" strokeWidth="6" strokeLinecap="round"
            style={{ strokeDasharray: 200, animation: 'rt-lane2 0.8s ease-out 0.5s both' }}
          />
          <path
            d="M15,78 Q42,30 78,48 Q96,56 106,42"
            fill="none" stroke="#ff6b35" strokeWidth="6" strokeLinecap="round"
            style={{ strokeDasharray: 200, animation: 'rt-lane3 0.8s ease-out 0.8s both' }}
          />
          <circle
            cx="106" cy="42" r="7.5"
            fill="none" stroke="#ff6b35" strokeWidth="1.5"
            style={{ animation: 'rt-pulse-ring 1s ease-out 1.5s both' }}
          />
          <circle
            cx="106" cy="42" r="7.5"
            fill="#2d9e4f"
            style={{ animation: 'rt-dot-pop 0.4s ease-out 1.5s both' }}
          />
          <path
            d="M101,42 L105,47 L113,36"
            fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 30, animation: 'rt-check-draw 0.3s ease-out 1.8s both' }}
          />
        </g>

        <text
          x="130" y="82"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontSize="58" fontWeight="700" letterSpacing="4" fill="#1a1a2e"
          style={{ animation: 'rt-text-slide 0.5s ease-out 1.1s both' }}
        >
          RACE
        </text>
        <text
          x="350" y="82"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontSize="58" fontWeight="700" letterSpacing="4" fill="#e8491d"
          style={{ animation: 'rt-text-slide 0.5s ease-out 1.3s both' }}
        >
          TIK
        </text>
        <line
          x1="130" y1="96" x2="488" y2="96"
          stroke="url(#rt-ug)" strokeWidth="3" strokeLinecap="round"
          style={{ strokeDasharray: 360, animation: 'rt-underline-draw 0.6s ease-out 1.6s both' }}
        />
        <text
          x="130" y="122"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontSize="12" letterSpacing="6" fill="#888899"
          style={{ animation: 'rt-tagline-fade 0.5s ease-out 2s both' }}
        >
          TIMING · RESULTS · EVENTS
        </text>
      </svg>
    );
  }

  const srcMap: Record<Exclude<RacetikLogoVariant, 'animated'>, string> = {
    full: logoStatic,
    white: logoWhite,
    wordmark: logoWordmark,
    icon: logoIcon,
  };

  const aspectMap: Record<Exclude<RacetikLogoVariant, 'animated'>, number> = {
    full: 520 / 150,
    white: 520 / 150,
    wordmark: 360 / 70,
    icon: 1,
  };

  const src = srcMap[variant as Exclude<RacetikLogoVariant, 'animated'>];
  const ar = aspectMap[variant as Exclude<RacetikLogoVariant, 'animated'>];
  const height = Math.round(width / ar);

  return (
    <img
      src={src}
      width={width}
      height={height}
      alt="Racetik"
      className={className}
      style={{ display: 'block' }}
    />
  );
};

export default RacetikLogo;

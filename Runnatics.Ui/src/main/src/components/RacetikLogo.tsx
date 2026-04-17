import React, { useEffect, useState } from 'react';

import logoStatic from '../../../assets/logos/racetik-logo-static.svg';
import logoWhite from '../../../assets/logos/racetik-logo-white.svg';
import logoWordmark from '../../../assets/logos/racetik-wordmark.svg';
import logoIcon from '../../../assets/logos/racetik-icon.svg';

export type RacetikLogoVariant = 'full' | 'animated' | 'icon' | 'icon-animated' | 'white' | 'wordmark' | 'png' | 'png-white';

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
    const aspectRatio = 580 / 200;
    const height = Math.round(width / aspectRatio);
    return (
      <svg
        key={animKey}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 580 200"
        width={width}
        height={height}
        className={className}
        aria-label="Racetik"
        role="img"
      >
        <defs>
          <style>{`
            @keyframes rta-swoosh { 0% { stroke-dashoffset: 500; } 100% { stroke-dashoffset: 0; } }
            @keyframes rta-race-slide { 0% { opacity: 0; transform: translateX(-30px) skewX(-8deg); } 100% { opacity: 1; transform: translateX(0) skewX(-8deg); } }
            @keyframes rta-tik-slide { 0% { opacity: 0; transform: translateX(-20px) skewX(-8deg); } 100% { opacity: 1; transform: translateX(0) skewX(-8deg); } }
            @keyframes rta-watch-spin { 0% { opacity: 0; transform: scale(0.3) rotate(-90deg); } 60% { transform: scale(1.1) rotate(10deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
            @keyframes rta-hand-tick { 0% { transform: rotate(-120deg); } 30% { transform: rotate(20deg); } 50% { transform: rotate(-10deg); } 70% { transform: rotate(5deg); } 100% { transform: rotate(0deg); } }
            @keyframes rta-check-draw { 0% { stroke-dashoffset: 50; opacity: 0; } 20% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }
            @keyframes rta-check-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
            @keyframes rta-pulse { 0% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0; transform: scale(1.8); } 100% { opacity: 0; transform: scale(2); } }
          `}</style>
        </defs>

        <g style={{ animation: 'rta-race-slide 0.6s ease-out 0s both' }}>
          <text
            x="30" y="148"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="100" fontWeight="900" fill="#1b2d5a" fontStyle="italic" letterSpacing="-2"
          >
            RACE
          </text>
        </g>
        <g style={{ animation: 'rta-tik-slide 0.6s ease-out 0.2s both' }}>
          <text
            x="310" y="148"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontSize="100" fontWeight="900" fill="#5a1a35" fontStyle="italic" letterSpacing="-2"
          >
            TIK
          </text>
        </g>
        <path
          d="M30,165 Q150,155 280,162 Q400,170 540,148"
          fill="none" stroke="#5a1a35" strokeWidth="4" strokeLinecap="round"
          style={{ strokeDasharray: 500, animation: 'rta-swoosh 1s ease-out 0.3s both' }}
        />
        <path
          d="M60,172 Q180,163 300,168 Q420,175 530,158"
          fill="none" stroke="#8b3a5a" strokeWidth="2" strokeLinecap="round" opacity="0.5"
          style={{ strokeDasharray: 500, animation: 'rta-swoosh 1s ease-out 0.5s both' }}
        />

        {/* Watch body */}
        <g style={{ animation: 'rta-watch-spin 0.7s ease-out 0.6s both', transformOrigin: '460px 55px' }}>
          <circle cx="460" cy="55" r="30" fill="none" stroke="#2d8e3f" strokeWidth="3.5"/>
          <circle cx="460" cy="55" r="25" fill="none" stroke="#2d8e3f" strokeWidth="1" opacity="0.4"/>
          <rect x="455" y="20" width="10" height="8" rx="3" fill="#2d8e3f"/>
          <rect x="453" y="16" width="14" height="5" rx="2" fill="#2d8e3f"/>
          <circle cx="440" cy="30" r="3" fill="#2d8e3f"/>
          <circle cx="480" cy="30" r="3" fill="#2d8e3f"/>
          <line x1="437" y1="30" x2="434" y2="27" stroke="#2d8e3f" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="483" y1="30" x2="486" y2="27" stroke="#2d8e3f" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="460" y1="30" x2="460" y2="34" stroke="#2d8e3f" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="460" y1="76" x2="460" y2="80" stroke="#2d8e3f" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="434" y1="55" x2="430" y2="55" stroke="#2d8e3f" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="486" y1="55" x2="490" y2="55" stroke="#2d8e3f" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        {/* Watch hand */}
        <g style={{ animation: 'rta-hand-tick 0.8s ease-out 1.2s both', transformOrigin: '460px 58px' }}>
          <line x1="460" y1="58" x2="460" y2="38" stroke="#2d8e3f" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="460" cy="58" r="2.5" fill="#2d8e3f"/>
        </g>
        {/* Pulse ring */}
        <circle
          cx="460" cy="58" r="30" fill="none" stroke="#3cb55c" strokeWidth="2"
          style={{ animation: 'rta-pulse 1.2s ease-out 2s both', transformOrigin: '460px 58px' }}
        />
        {/* Checkmark */}
        <g style={{ animation: 'rta-check-pop 0.4s ease-out 1.5s both', transformOrigin: '490px 75px' }}>
          <path
            d="M478,62 L488,76 L510,48"
            fill="none" stroke="#3cb55c" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 50, animation: 'rta-check-draw 0.5s ease-out 1.6s both' }}
          />
        </g>
      </svg>
    );
  }

  // Always-running animated icon (inline SVG so CSS animations work)
  if (variant === 'icon-animated') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width={width}
        height={width}
        className={className}
        aria-label="Racetik"
        role="img"
      >
        <defs>
          <style>{`
            @keyframes rtia-spin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes rtia-pulse {
              0%   { opacity: 0.6; transform: scale(1); }
              60%  { opacity: 0; transform: scale(1.7); }
              100% { opacity: 0; transform: scale(1.7); }
            }
            @keyframes rtia-check-bounce {
              0%, 100% { transform: scale(1); }
              50%       { transform: scale(1.12); }
            }
          `}</style>
        </defs>
        <g transform="translate(12, 18)">
          {/* Outer watch body */}
          <circle cx="48" cy="52" r="38" fill="none" stroke="#2d8e3f" strokeWidth="4"/>
          <circle cx="48" cy="52" r="32" fill="none" stroke="#2d8e3f" strokeWidth="1.2" opacity="0.4"/>
          {/* Crown / lug */}
          <rect x="43" y="8" width="10" height="9" rx="3" fill="#2d8e3f"/>
          <rect x="41" y="3" width="14" height="6" rx="2" fill="#2d8e3f"/>
          {/* Side buttons */}
          <circle cx="24" cy="22" r="4" fill="#2d8e3f"/>
          <circle cx="72" cy="22" r="4" fill="#2d8e3f"/>
          <line x1="21" y1="22" x2="17" y2="18" stroke="#2d8e3f" strokeWidth="3" strokeLinecap="round"/>
          <line x1="75" y1="22" x2="79" y2="18" stroke="#2d8e3f" strokeWidth="3" strokeLinecap="round"/>
          {/* Tick marks */}
          <line x1="48" y1="20" x2="48" y2="25" stroke="#2d8e3f" strokeWidth="2" strokeLinecap="round"/>
          <line x1="48" y1="79" x2="48" y2="84" stroke="#2d8e3f" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="52" x2="11" y2="52" stroke="#2d8e3f" strokeWidth="2" strokeLinecap="round"/>
          <line x1="80" y1="52" x2="85" y2="52" stroke="#2d8e3f" strokeWidth="2" strokeLinecap="round"/>
          {/* Spinning hand */}
          <line
            x1="48" y1="55" x2="48" y2="32"
            stroke="#2d8e3f" strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '48px 55px', animation: 'rtia-spin 2s linear infinite' }}
          />
          <circle cx="48" cy="55" r="3" fill="#2d8e3f"/>
          {/* Pulse ring */}
          <circle
            cx="48" cy="55" r="20"
            fill="none" stroke="#3cb55c" strokeWidth="2"
            style={{ transformOrigin: '48px 55px', animation: 'rtia-pulse 2s ease-out infinite' }}
          />
          {/* Checkmark */}
          <path
            d="M68,58 L78,75 L100,40"
            fill="none" stroke="#3cb55c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            style={{ transformOrigin: '84px 58px', animation: 'rtia-check-bounce 2s ease-in-out infinite' }}
          />
        </g>
      </svg>
    );
  }

  if (variant === 'png' || variant === 'png-white') {
    return (
      <img
        src="/images/racetik-logo.png"
        alt="Racetik"
        className={className}
        style={{
          display: 'block',
          height: width ? `${Math.round(width / 4)}px` : '40px',
          width: 'auto',
          ...(variant === 'png-white' ? { filter: 'brightness(0) invert(1)', opacity: 0.9 } : {}),
        }}
      />
    );
  }

  const srcMap: Record<Exclude<RacetikLogoVariant, 'animated' | 'icon-animated' | 'png' | 'png-white'>, string> = {
    full: logoStatic,
    white: logoWhite,
    wordmark: logoWordmark,
    icon: logoIcon,
  };

  const aspectMap: Record<Exclude<RacetikLogoVariant, 'animated' | 'icon-animated' | 'png' | 'png-white'>, number> = {
    full: 580 / 200,
    white: 580 / 200,
    wordmark: 400 / 80,
    icon: 1,
  };

  const src = srcMap[variant as Exclude<RacetikLogoVariant, 'animated' | 'icon-animated' | 'png' | 'png-white'>];
  const ar = aspectMap[variant as Exclude<RacetikLogoVariant, 'animated' | 'icon-animated' | 'png' | 'png-white'>];
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

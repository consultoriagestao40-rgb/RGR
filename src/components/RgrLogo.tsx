'use client';

import React from 'react';

interface RgrLogoProps {
  variant?: 'icon' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const RgrLogo: React.FC<RgrLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true
}) => {
  // Dimension mappings
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const IconElement = (
    <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl overflow-hidden shadow-xs group`}>
      <svg 
        viewBox="0 0 512 512" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rgrBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1320" />
            <stop offset="50%" stopColor="#0a1d1c" />
            <stop offset="100%" stopColor="#062822" />
          </linearGradient>
          <linearGradient id="rgrEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#0ea879" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="rgrAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="rgrGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Base Container */}
        <rect width="512" height="512" rx="120" fill="url(#rgrBg)" stroke="#1e3a35" strokeWidth="8" />
        <rect x="12" y="12" width="488" height="488" rx="108" fill="none" stroke="rgba(52, 211, 153, 0.25)" strokeWidth="4" />

        {/* Cadence Ring */}
        <circle cx="256" cy="256" r="184" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="18" />
        <path d="M 256 72 A 184 184 0 1 1 104 152" fill="none" stroke="url(#rgrEmerald)" strokeWidth="24" strokeLinecap="round" />
        <circle cx="104" cy="152" r="14" fill="#34d399" />

        {/* Monogram R */}
        <rect x="160" y="160" width="46" height="192" rx="20" fill="url(#rgrEmerald)" />
        <path 
          d="M 186 160 H 280 C 330 160 360 185 360 225 C 360 265 330 290 280 290 H 186 Z" 
          fill="none" 
          stroke="url(#rgrEmerald)" 
          strokeWidth="42" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path d="M 264 274 L 344 352" stroke="url(#rgrAccent)" strokeWidth="44" strokeLinecap="round" />

        {/* Apex Gold Compass Pin */}
        <polygon points="256,44 266,66 288,76 266,86 256,108 246,86 224,76 246,66" fill="url(#rgrGold)" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return IconElement;
  }

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      {IconElement}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            RGR
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950/80 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800 uppercase tracking-wider">
            Rotina
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate tracking-tight">
            Gerenciamento da Rotina & Facilities
          </p>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import morphLogoImg from '../assets/images/morph_logo_asset_1788176807666.jpg';

interface MorphLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  showSubtitle?: boolean;
  showCodeText?: boolean;
  animated?: boolean;
  className?: string;
  idPrefix?: string;
  variant?: 'image' | 'vector' | 'full';
}

export const MorphLogo: React.FC<MorphLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  animated = true,
  className = '',
  idPrefix = 'morph-logo',
}) => {
  const sizeMap: Record<string, { width: number; height: number; scale: number; sub: string; imgHeight: string }> = {
    xs: { width: 120, height: 38, scale: 0.35, sub: 'text-[7px] tracking-[0.2em]', imgHeight: 'h-8 sm:h-9' },
    sm: { width: 160, height: 48, scale: 0.45, sub: 'text-[8px] tracking-[0.25em]', imgHeight: 'h-10 sm:h-12' },
    md: { width: 240, height: 72, scale: 0.65, sub: 'text-[9px] tracking-[0.3em]', imgHeight: 'h-14 sm:h-16' },
    lg: { width: 340, height: 102, scale: 0.95, sub: 'text-[11px] tracking-[0.35em]', imgHeight: 'h-20 sm:h-24' },
    xl: { width: 440, height: 132, scale: 1.25, sub: 'text-xs tracking-[0.4em]', imgHeight: 'h-28 sm:h-32' },
    hero: { width: 580, height: 175, scale: 1.6, sub: 'text-xs md:text-sm tracking-[0.45em]', imgHeight: 'h-32 sm:h-40 md:h-48' },
  };

  const dim = typeof size === 'number'
    ? { width: Math.round(size * 3.3), height: size, scale: size / 75, sub: 'text-[9px] tracking-[0.3em]', imgHeight: `h-[${size}px]` }
    : sizeMap[size] || sizeMap.md;

  return (
    <div
      id={`${idPrefix}-container`}
      className={`inline-flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* High-Fidelity Liquid Chrome Visual Logo Artwork */}
      <div className="relative group flex items-center justify-center">
        
        {/* Ambient Specular Refraction Aura (Molten Metallic Purple & Radiant Platinum Glow) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#9D4EDD]/30 via-[#C77DFF]/25 to-[#E0AAFF]/20 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />

        {/* Exact Uploaded High-Res Liquid Chrome Logo Graphic */}
        <div className={`relative overflow-hidden rounded-xl ${animated ? 'transition-transform duration-500 hover:scale-[1.02]' : ''}`}>
          <img
            src={morphLogoImg}
            alt="MORPH CODE"
            referrerPolicy="no-referrer"
            style={typeof size === 'number' ? { height: `${size}px`, width: 'auto' } : undefined}
            className={`w-auto object-contain max-w-full mix-blend-screen drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)] ${
              typeof size === 'string' ? dim.imgHeight : ''
            }`}
          />
        </div>
      </div>

      {/* Subtitle / Department Identifier */}
      {showSubtitle && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-[1px] w-10 bg-gradient-to-r from-transparent via-[#C77DFF]/70 to-[#F8F9FA]/80" />
          <p
            id={`${idPrefix}-subtitle`}
            className={`font-mono font-bold uppercase text-[#CBD5E1] ${dim.sub}`}
          >
            THE JOSEPHITE BUSINESS CLUB
          </p>
          <div className="h-[1px] w-10 bg-gradient-to-l from-transparent via-[#9D4EDD]/70 to-[#F8F9FA]/80" />
        </div>
      )}
    </div>
  );
};

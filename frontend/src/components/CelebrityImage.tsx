import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, EyeOff, Lock } from 'lucide-react';

interface CelebrityImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  name?: string;
  domain?: string;
  celebrityNumber?: number;
  isMystery?: boolean;
  showAdminWarning?: boolean;
}

export const CelebrityImage: React.FC<CelebrityImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative flex items-center justify-center bg-slate-950 overflow-hidden',
  name = '',
  domain = '',
  celebrityNumber,
  isMystery = false,
  showAdminWarning = false,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src, isMystery]);

  const numStr = celebrityNumber
    ? celebrityNumber < 10
      ? `0${celebrityNumber}`
      : `${celebrityNumber}`
    : '??';

  // 1. MYSTERY STATE: Strict anonymity, no face, no identifying name/details
  if (isMystery) {
    return (
      <div className={containerClassName}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60 p-4 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-2">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-300 uppercase tracking-widest">
            <EyeOff className="w-3.5 h-3.5" />
            <span>MYSTERY #{numStr}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
            Identity Locked
          </span>
        </div>
      </div>
    );
  }

  // 2. REVEALED / ADMIN STATE: Render Image or Clean SVG Fallback
  return (
    <div className={containerClassName}>
      {!hasError && src ? (
        <img
          src={src}
          alt={alt || name || 'Celebrity'}
          onError={() => setHasError(true)}
          className={className}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 text-center select-none border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[11px] font-mono font-black uppercase text-slate-200 tracking-wider line-clamp-1">
            {name || alt || `CELEBRITY #${numStr}`}
          </span>
          {domain && (
            <span className="text-[9px] font-mono text-purple-400/90 uppercase tracking-widest mt-0.5 line-clamp-1">
              {domain}
            </span>
          )}
        </div>
      )}

      {showAdminWarning && hasError && (
        <div
          title="Image URL failed to load - click Edit to replace URL"
          className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-amber-950/90 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-lg"
        >
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Invalid URL</span>
        </div>
      )}
    </div>
  );
};

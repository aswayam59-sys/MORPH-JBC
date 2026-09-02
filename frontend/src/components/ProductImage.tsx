import React, { useState, useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  name?: string;
  category?: string;
  showAdminWarning?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative flex items-center justify-center bg-slate-950',
  name = '',
  category = '',
  showAdminWarning = false,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div className={containerClassName}>
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={className}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 text-center select-none border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-2 shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono font-black uppercase text-slate-200 tracking-wider line-clamp-1">
            {name || alt || 'PRODUCT'}
          </span>
          {category && (
            <span className="text-[9px] font-mono text-purple-400/80 uppercase tracking-widest mt-0.5 line-clamp-1">
              {category}
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

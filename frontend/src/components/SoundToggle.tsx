import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { morphAudio } from '../utils/audio';

interface SoundToggleProps {
  className?: string;
  variant?: 'compact' | 'pill';
  id?: string;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({
  className = '',
  variant = 'compact',
  id = 'morph-sound-toggle',
}) => {
  const [muted, setMuted] = useState<boolean>(morphAudio.isSoundMuted());

  useEffect(() => {
    const unsub = morphAudio.subscribe((isMuted) => setMuted(isMuted));
    return unsub;
  }, []);

  const handleToggle = () => {
    morphAudio.toggleMute();
  };

  if (variant === 'pill') {
    return (
      <button
        id={id}
        type="button"
        onClick={handleToggle}
        title={muted ? 'Enable audio feedback' : 'Disable audio feedback'}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-[11px] font-bold tracking-widest transition-all duration-300 border cursor-pointer ${
          muted
            ? 'bg-purple-950/30 text-purple-400/60 border-purple-900/40 hover:text-purple-300 hover:border-purple-700/60 hover:bg-purple-950/50'
            : 'bg-gradient-to-r from-purple-900/60 via-purple-800/70 to-fuchsia-900/60 text-purple-100 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-purple-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.6)]'
        } ${className}`}
      >
        {muted ? (
          <VolumeX className="w-3.5 h-3.5 text-purple-400/60" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
          </span>
        )}
        <Volume2 className={`w-3.5 h-3.5 ${muted ? 'hidden' : 'text-purple-300'}`} />
        <span className="tracking-[0.15em]">{muted ? 'AUDIO MUTED' : 'AUDIO ACTIVE'}</span>
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={handleToggle}
      title={muted ? 'Enable audio feedback' : 'Disable audio feedback'}
      className={`p-2.5 rounded-xl font-mono text-xs transition-all duration-300 border cursor-pointer ${
        muted
          ? 'bg-purple-950/30 text-purple-400/60 border-purple-900/40 hover:text-purple-300 hover:border-purple-700/60 hover:bg-purple-950/50'
          : 'bg-gradient-to-br from-purple-900/60 to-purple-800/80 text-purple-100 border-purple-400/60 shadow-[0_0_18px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-purple-300 hover:shadow-[0_0_24px_rgba(192,132,252,0.6)]'
      } ${className}`}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-200" />}
    </button>
  );
};

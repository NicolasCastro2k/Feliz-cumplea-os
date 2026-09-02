import React, { useState } from 'react';
import { Play, Pause, Music2, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';

interface MiniPlayerProps {
  isPlaying: boolean;
  trackTitle: string;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isPlaying,
  trackTitle,
  onTogglePlay,
  volume,
  onVolumeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end transition-all duration-300">
      {/* Expanded Control Box */}
      {isExpanded ? (
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-950/90 border border-amber-500/40 backdrop-blur-md rounded-2xl sm:rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.85)] text-amber-100 animate-scale-up">
          {/* Disc Icon */}
          <div className={`p-1.5 rounded-full bg-amber-500/20 text-amber-300 shrink-0 ${isPlaying ? 'animate-spin' : ''}`}>
            <Music2 className="w-4 h-4" />
          </div>

          {/* Track Title */}
          <div className="flex flex-col min-w-0 pr-0.5">
            <span className="font-serif-classic text-xs sm:text-sm text-amber-200/95 font-medium truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px]">
              {trackTitle || 'Melodía Romántica'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400/70 font-sans-body uppercase tracking-wider">
              {isPlaying ? 'Sonando ♪' : 'En pausa'}
            </span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="w-8 h-8 rounded-full bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 flex items-center justify-center text-amber-200 transition-colors shrink-0 active:scale-95"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-300" /> : <Play className="w-3.5 h-3.5 fill-amber-300 ml-0.5" />}
          </button>

          {/* Quick Volume Slider */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVolumeChange(volume > 0 ? 0 : 0.8);
              }}
              className="text-amber-300/70 hover:text-amber-200 transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                e.stopPropagation();
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-14 h-1 accent-amber-400 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Close / Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded-full text-amber-300/70 hover:text-amber-100 hover:bg-white/10 transition-colors ml-1"
            title="Minimizar reproductor"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Collapsed Side Floating Action Button */
        <button
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 px-3 py-2 bg-slate-950/90 border border-amber-500/40 backdrop-blur-md rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.8)] text-amber-200 hover:border-amber-400 hover:bg-slate-900 transition-all duration-300 active:scale-95"
          title="Abrir reproductor de música"
        >
          <div className={`p-1.5 rounded-full bg-amber-500/20 text-amber-300 ${isPlaying ? 'animate-spin' : ''}`}>
            <Music2 className="w-4 h-4" />
          </div>
          <span className="font-serif-classic text-xs text-amber-200/90 max-w-[90px] xs:max-w-[130px] truncate">
            {isPlaying ? trackTitle || 'Música' : 'Música'}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};


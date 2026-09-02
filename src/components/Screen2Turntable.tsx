import React, { useState } from 'react';
import { AppConfig } from '../types';
import { audioManager } from '../services/synthAudio';
import { Disc, ChevronRight, Music, Zap, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Screen2Props {
  config: AppConfig;
  isPlaying: boolean;
  activeTrackId: string | null;
  onNext: () => void;
  onGoToTesla?: () => void;
}

export const Screen2Turntable: React.FC<Screen2Props> = ({
  config,
  isPlaying,
  activeTrackId,
  onNext,
  onGoToTesla,
}) => {
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null);
  const [showUnlockedModal, setShowUnlockedModal] = useState<boolean>(false);
  const [hasUnlockedOnce, setHasUnlockedOnce] = useState<boolean>(false);

  const handleSelectSong = (index: number) => {
    setSelectedSongIndex(index);
    const song = config.songs[index];
    if (song) {
      audioManager.playTrack(song.id, song.title, song.file);

      // Trigger celebratory announcement pop-up ONLY if this song is the secret song
      const isSecretSong = !!song.isSecret || song.title.toLowerCase().includes('secreta') || song.id === 'song-secret';
      if (isSecretSong) {
        if (!hasUnlockedOnce) {
          setHasUnlockedOnce(true);
          setShowUnlockedModal(true);
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#3b82f6', '#ea580c', '#c084fc', '#e11d48', '#f59e0b'],
          });
        }
      }
    }
  };

  const currentSong = selectedSongIndex !== null ? config.songs[selectedSongIndex] : null;

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-radial from-amber-950/40 via-neutral-950 to-black text-amber-100 flex flex-col items-center justify-between pt-12 pb-24 sm:pb-12 px-3 sm:p-8 select-none overflow-y-auto">
      {/* Secret Tesla Scene Unlocked Announcement Modal */}
      {showUnlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto bg-slate-950 border border-amber-400/60 rounded-3xl p-5 sm:p-8 text-center shadow-[0_0_50px_rgba(234,88,12,0.4)] space-y-4 animate-scale-up">
            <button
              onClick={() => setShowUnlockedModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-0.5 mx-auto shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-bounce" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-serif-classic uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>¡Una Sorpresa Especial Para Ti!</span>
            </div>

            <h3 className="font-serif-classic text-lg sm:text-3xl text-amber-100 leading-snug">
              ⚡ La Bobina de Tesla Mágica ⚡
            </h3>

            <p className="font-sans-body text-xs sm:text-sm text-amber-200/80 leading-relaxed px-2">
              Esta canción especial activa la vista de la <strong className="text-amber-300">Bobina de Tesla</strong> preparada con todo el cariño para ti. Un espectáculo visual donde los rayos brillan y bailan al ritmo de la música.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              {onGoToTesla && (
                <button
                  onClick={() => {
                    setShowUnlockedModal(false);
                    onGoToTesla();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-serif-classic font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-slate-950" /> Ver Bobina de Tesla ⚡
                </button>
              )}

              <button
                onClick={() => setShowUnlockedModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-amber-200 font-serif-classic text-xs sm:text-sm transition-colors"
              >
                Seguir Escuchando
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Top Message */}
      <div className="mt-1 sm:mt-6 text-center max-w-2xl z-20 space-y-1 px-2">
        <h2 className="font-serif-classic text-lg sm:text-3xl md:text-4xl text-amber-100 leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {config.screen2Message ||
            'Cada canción es un pedacito de nosotros. Elige un disco y déjalo sonar.'}
        </h2>
        <p className="font-sans-body text-[10px] sm:text-sm text-amber-300/70 tracking-wide">
          Haz clic o toca cualquier disco para reproducir su melodía ♥
        </p>
      </div>

      {/* Main Interactive Turntable & Song Dropdown Selector Area */}
      <div className="relative my-auto w-full max-w-2xl flex flex-col items-center justify-center gap-6 z-20 py-2">
        {/* Dropdown Menu Song Selector */}
        <div className="w-full max-w-md bg-slate-950/85 border border-amber-500/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-amber-300 font-sans-body font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Selecciona una canción de la lista:</span>
            </span>
            <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
          </label>

          <select
            value={selectedSongIndex !== null ? selectedSongIndex : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== '') {
                handleSelectSong(Number(val));
              }
            }}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-amber-400/50 text-amber-100 font-serif-classic text-sm sm:text-base focus:border-amber-300 focus:ring-1 focus:ring-amber-300 outline-none cursor-pointer shadow-inner transition-colors"
          >
            <option value="" disabled className="bg-neutral-900 text-amber-300/60 font-sans-body">
              Selecciona una canción
            </option>
            {config.songs.map((song, idx) => (
              <option key={song.id} value={idx} className="bg-neutral-900 text-amber-100 py-1">
                🎵 {song.title} {song.artist ? `— ${song.artist}` : ''}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-amber-300/70 font-sans-body italic flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Pista actual: <strong className="text-amber-200">{currentSong?.title || 'Ninguna'}</strong></span>
          </p>
        </div>

        {/* Right: Vintage Turntable Base */}
        <div className="relative w-52 h-52 xs:w-60 xs:h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-950/80 via-stone-900 to-amber-950/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0">
          {/* Metallic Corner Plates */}
          <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-600/40 border border-amber-400/30" />
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-600/40 border border-amber-400/30" />
          <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-600/40 border border-amber-400/30" />
          <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-600/40 border border-amber-400/30" />

          {/* Vinyl Record */}
          <div
            className={`relative w-40 h-40 xs:w-48 xs:h-48 sm:w-68 sm:h-68 rounded-full bg-neutral-950 border-2 sm:border-4 border-neutral-900 shadow-2xl flex items-center justify-center transition-transform ${
              isPlaying ? 'animate-vinyl-spin' : ''
            }`}
            style={{
              backgroundImage:
                'repeating-radial-gradient(circle, #1c1c1c 0px, #1c1c1c 2px, #0e0e0e 3px, #1c1c1c 4px)',
            }}
          >
            {/* Record Center Label */}
            <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-1.5 flex flex-col items-center justify-center text-center shadow-inner border border-amber-300/40">
              <span className="font-serif-classic text-[9px] sm:text-xs text-amber-950 font-bold uppercase tracking-wider leading-tight truncate max-w-[50px] sm:max-w-none">
                {currentSong?.title || 'Selecciona Canción'}
              </span>
              <Disc className="w-3 h-3 text-amber-950/80 mt-0.5" />
            </div>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-black border border-amber-300/60" />
          </div>

          {/* Tonearm */}
          <div
            className={`absolute top-3 right-3 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none transition-transform duration-1000 origin-[85%_15%] ${
              isPlaying ? 'rotate-[-2deg]' : 'rotate-[-28deg]'
            }`}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Tonearm Base */}
              <circle cx="85" cy="15" r="8" fill="#d97538" stroke="#f6c667" strokeWidth="1.5" />
              <circle cx="85" cy="15" r="4" fill="#1a1006" />
              {/* Arm Pole */}
              <path
                d="M 85 15 L 42 65 L 35 72"
                stroke="#d9b98a"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Cartridge Headshell */}
              <rect
                x="28"
                y="68"
                width="14"
                height="10"
                rx="2"
                fill="#f6c667"
                transform="rotate(35 35 73)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Track Title & Continuar Button */}
      <div className="mb-2 sm:mb-8 z-20 flex flex-col items-center gap-2.5">
        <p className="font-serif-classic text-amber-200/90 text-xs sm:text-base tracking-wide flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-amber-400" />
          <span>Disco:</span>
          <span className="text-amber-300 font-semibold">{currentSong?.title || 'Ninguna canción seleccionada'}</span>
        </p>

        <button
          onClick={onNext}
          className="px-5 py-2 rounded-full border border-amber-400/60 bg-amber-500/20 text-amber-200 font-serif-classic text-xs sm:text-sm uppercase tracking-widest hover:bg-amber-500/30 hover:border-amber-300 transition-all shadow-[0_0_20px_rgba(232,168,96,0.3)] flex items-center gap-1.5"
        >
          Continuar <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

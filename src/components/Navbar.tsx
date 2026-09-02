import React, { useEffect, useState, useRef } from 'react';
import { ScreenId } from '../types';
import {
  Heart,
  Music,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Lock,
  CheckCircle2,
  Sparkles,
  Flame,
  Disc,
  Waves,
  Flower2,
  Sun,
  Star,
  Zap,
  Mail,
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  herName: string;
  onOpenCustomizer: () => void;
  isPlaying: boolean;
  onToggleMusic: () => void;
  trackTitle: string;
}

const SCREENS: { id: ScreenId; label: string; number: number; icon: React.FC<{ className?: string }> }[] = [
  { id: 'screen1', label: 'Preguntas~', number: 1, icon: Flame },
  { id: 'screen2', label: 'Tocadiscos', number: 2, icon: Disc },
  { id: 'screen3', label: 'Medusas', number: 3, icon: Waves },
  { id: 'screen4', label: 'Flores', number: 4, icon: Flower2 },
  { id: 'screen5', label: 'Atardecer', number: 5, icon: Sun },
  { id: 'screenChaos', label: 'Paz', number: 6, icon: Sparkles },
  { id: 'screen6', label: 'Deseos', number: 7, icon: Star },
  { id: 'screenFriendLetter', label: 'Carta Amiga', number: 8, icon: Mail },
  { id: 'screen7', label: 'Bobina de Tesla', number: 9, icon: Zap },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  herName,
  onOpenCustomizer,
  isPlaying,
  onToggleMusic,
  trackTitle,
}) => {
  const [maxVisitedIdx, setMaxVisitedIdx] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const idx = SCREENS.findIndex((s) => s.id === currentScreen);
    if (idx > maxVisitedIdx) {
      setMaxVisitedIdx(idx);
    }
    if (activeButtonRef.current && navContainerRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentScreen, maxVisitedIdx]);

  // Hide/Show on scroll & touch swipe
  useEffect(() => {
    let startY = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 30 && currentY > lastScrollY) {
        setIsVisible(false); // scrolling down
      } else if (currentY < lastScrollY || currentY <= 15) {
        setIsVisible(true); // scrolling up or at top
      }
      setLastScrollY(currentY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      if (diff > 20 && window.scrollY > 20) {
        setIsVisible(false); // Swiping down page (scrolling down)
      } else if (diff < -15) {
        setIsVisible(true); // Swiping up page (scrolling up)
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [lastScrollY]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <>
      {/* Top Floating Reveal Pill when Navbar is Hidden */}
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-black/80 border border-amber-400/40 text-amber-200 text-[11px] font-serif-classic backdrop-blur-md shadow-lg transition-all duration-300 flex items-center gap-1 ${
          isVisible
            ? 'opacity-0 -translate-y-10 pointer-events-none'
            : 'opacity-100 translate-y-0 animate-pulse'
        }`}
        title="Mostrar navegación"
      >
        <Heart className="w-3 h-3 text-rose-400 fill-rose-500/40" />
        <span>Navegación</span>
        <ChevronDown className="w-3 h-3 text-amber-300" />
      </button>

      {/* Main Navbar Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-2 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 text-slate-200 transition-all duration-300 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Sidebar Toggle & Gift Title */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-serif-classic flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(232,168,96,0.2)] shrink-0"
            title="Abrir menú de pantallas"
          >
            <Menu className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline">Menú</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 fill-rose-500/30 animate-pulse" />
            <span className="font-serif-classic text-xs sm:text-base font-semibold tracking-wide text-amber-100 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs">
              Para {herName || 'Ti'}
            </span>
          </div>
        </div>

        {/* Center: Scrollable Horizontal Screen Pills */}
        <div
          ref={navContainerRef}
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none px-1 py-0.5 max-w-[45vw] xs:max-w-[50vw] sm:max-w-none shrink"
        >
          {SCREENS.map((s, idx) => {
            const isActive = currentScreen === s.id;
            const isRevealed = idx <= maxVisitedIdx;
            const displayLabel = isRevealed ? s.label : `Escena ${s.number}`;
            const displayTitle = isRevealed ? s.label : `Escena ${s.number} (Sorpresa)`;

            return (
              <button
                key={s.id}
                ref={isActive ? activeButtonRef : null}
                onClick={() => {
                  if (isRevealed) {
                    onSelectScreen(s.id);
                  }
                }}
                disabled={!isRevealed}
                title={displayTitle}
                className={`relative px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-serif-classic transition-all duration-300 flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(232,168,96,0.3)] font-semibold'
                    : isRevealed
                    ? 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                    : 'text-slate-600 border border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive ? 'bg-amber-300 animate-ping' : isRevealed ? 'bg-amber-400/80' : 'bg-slate-600'
                  }`}
                />
                <span className="hidden sm:inline">{displayLabel}</span>
                <span className="sm:hidden font-medium text-[11px]">{isRevealed ? s.number : `🔒`}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Toggle Music */}
          <button
            onClick={onToggleMusic}
            className={`p-1.5 sm:p-2 rounded-full border transition-all duration-300 ${
              isPlaying
                ? 'border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(232,168,96,0.3)]'
                : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
            title={isPlaying ? `Reproduciendo: ${trackTitle}` : 'Reproducir música'}
          >
            {isPlaying ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block p-1.5 sm:p-2 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Music / Songs button */}
          <button
            onClick={onOpenCustomizer}
            className="p-1.5 sm:p-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(232,168,96,0.2)]"
            title="Agregar Canciones 🎵"
          >
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Collapse/Hide Navbar Arrow button for quick hide */}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 sm:hidden text-slate-400 hover:text-slate-200"
            title="Ocultar barra"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer Menu (Menú Lateral) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-slate-950 border-r border-amber-500/30 text-slate-100 flex flex-col z-10 shadow-[10px_0_40px_rgba(0,0,0,0.9)] animate-fade-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-500/30" />
                <div>
                  <h3 className="font-serif-classic text-amber-200 text-lg font-semibold leading-tight">
                    Para {herName || 'Ti'}
                  </h3>
                  <p className="text-[10px] text-amber-300/70 font-sans-body">
                    Menú de Escenas y Recuerdos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Screen List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <p className="text-[11px] font-sans-body uppercase tracking-wider text-amber-300/80 px-2 font-semibold">
                Nuestras Pantallas ({maxVisitedIdx + 1} / {SCREENS.length} Desbloqueadas)
              </p>

              {SCREENS.map((s, idx) => {
                const isActive = currentScreen === s.id;
                const isRevealed = idx <= maxVisitedIdx;
                const ScreenIcon = s.icon;

                return (
                  <button
                    key={s.id}
                    disabled={!isRevealed}
                    onClick={() => {
                      if (isRevealed) {
                        onSelectScreen(s.id);
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-100'
                        : isRevealed
                        ? 'bg-slate-900/80 border-white/10 hover:border-amber-400/40 hover:bg-slate-800 text-slate-200'
                        : 'bg-slate-950/40 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : isRevealed
                            ? 'bg-slate-800 border-white/10 text-amber-300/80'
                            : 'bg-slate-900 border-white/5 text-slate-600'
                        }`}
                      >
                        {isRevealed ? (
                          <ScreenIcon className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-serif-classic text-sm font-medium truncate">
                          {isRevealed ? `${s.number}. ${s.label}` : `${s.number}. Escena Secreta`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans-body">
                          {isActive
                            ? '● Viendo ahora'
                            : isRevealed
                            ? '✓ Desbloqueada'
                            : '🔒 Avanza para desbloquear'}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-950/90 text-center">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenCustomizer();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-serif-classic flex items-center justify-center gap-2 transition-colors"
              >
                <Music className="w-3.5 h-3.5 text-amber-300" /> Agregar Canciones
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


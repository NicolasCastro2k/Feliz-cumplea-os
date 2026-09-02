import React, { useEffect, useRef, useState } from 'react';
import { AppConfig, StarMessage } from '../types';
import { Sparkles, Heart, RotateCcw, Star, X, Gift, Mail, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Screen6Props {
  config: AppConfig;
  onRestart: () => void;
  onNext?: () => void;
}

export const Screen6Stars: React.FC<Screen6Props> = ({ config, onRestart, onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeStar, setActiveStar] = useState<StarMessage | null>(null);
  const [showFinalModal, setShowFinalModal] = useState<boolean>(false);
  const [revealedStars, setRevealedStars] = useState<Set<string>>(new Set());

  // Initial celebratory confetti burst
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#fdf3d0', '#f6c667', '#e8608b', '#5fb8e8', '#34d399'],
    });
  }, []);

  // Stars Canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const starCount = w < 600 ? 110 : 200;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.05,
    }));

    const shootingStars: {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }[] = [];

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Deep Cosmic Night Gradient
      const bg = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w);
      bg.addColorStop(0, '#131a3a');
      bg.addColorStop(0.65, '#0a0e21');
      bg.addColorStop(1, '#040612');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Render Background Twinkling Stars
      stars.forEach((s) => {
        const tw = (Math.sin(t * s.speed + s.phase) + 1) / 2;
        const alpha = 0.2 + tw * 0.8;
        ctx.beginPath();
        ctx.fillStyle = `rgba(253, 243, 208, ${alpha})`;
        ctx.arc(s.x, s.y, s.r + tw * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Spawn Shooting Stars
      if (Math.random() < 0.025 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * w * 1.2,
          y: Math.random() * h * 0.35,
          len: 40 + Math.random() * 60,
          speed: 11 + Math.random() * 9,
          opacity: 1,
        });
      }

      // Render Shooting Stars
      shootingStars.forEach((ss, idx) => {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y + ss.len);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.len, ss.y + ss.len);
        ctx.stroke();

        ss.x -= ss.speed;
        ss.y += ss.speed;
        ss.opacity -= 0.016;

        if (ss.opacity <= 0 || ss.y > h) {
          shootingStars.splice(idx, 1);
        }
      });

      t++;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStarClick = (star: StarMessage) => {
    setActiveStar(star);
    setRevealedStars((prev) => new Set(prev).add(star.id));

    confetti({
      particleCount: star.isSpecial ? 90 : 40,
      spread: star.isSpecial ? 90 : 60,
      origin: { y: 0.5 },
      colors: [star.color || '#fdf3d0', '#f6c667', '#ffffff'],
    });

    if (star.isSpecial) {
      setShowFinalModal(true);
    }
  };

  const totalStarsCount = config.starMessages.length;
  const revealedCount = revealedStars.size;

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-[#0a0e21] text-[#fdf3d0] flex flex-col items-center justify-between pt-16 pb-6 px-4 select-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Header */}
      <div className="relative z-20 mt-2 sm:mt-6 text-center space-y-1.5 max-w-xl px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-amber-300/30 text-amber-200 text-xs font-serif-classic uppercase tracking-wider backdrop-blur-md shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Mi cielo</span>
        </div>
        <h2 className="font-serif-classic text-xl sm:text-3xl md:text-4xl text-amber-100 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          Toca las estrellas
        </h2>
        <p className="font-sans-body text-[11px] sm:text-sm text-amber-200/80">
          Cada una de ellas es un pensamiento desde mi corazón
        </p>
      </div>

      {/* Interactive Glowing Stars Spread Across Sky */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {config.starMessages.map((star) => {
          const isRevealed = revealedStars.has(star.id);
          const color = star.color || '#fbbf24';

          return (
            <div
              key={star.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: star.top, left: star.left }}
            >
              <button
                onClick={() => handleStarClick(star)}
                className="group relative p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-125 active:scale-95"
                title="Toca para revelar el mensaje secreto"
              >
                {/* Glowing Aura ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
                    star.isSpecial ? 'animate-ping opacity-60' : 'animate-pulse opacity-40'
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 ${star.isSpecial ? '30px' : '18px'} ${color}`,
                  }}
                />

                {/* Star Icon */}
                <Star
                  className={`relative transition-all duration-300 ${
                    star.isSpecial
                      ? 'w-9 h-9 text-amber-200 fill-amber-300 animate-spin-slow'
                      : 'w-6 h-6 sm:w-7 sm:h-7'
                  }`}
                  style={{
                    color: color,
                    fill: isRevealed ? color : 'rgba(255,255,255,0.3)',
                    filter: `drop-shadow(0 0 10px ${color})`,
                  }}
                />

                {/* Special Crown / Heart Badge on Special Star */}
                {star.isSpecial && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] border border-white shadow-md animate-bounce">
                    ♥
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Star Single Message Popup Modal */}
      {activeStar && !activeStar.isSpecial && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div
            className="relative max-w-md w-full bg-slate-900/95 border rounded-2xl p-6 sm:p-8 text-center shadow-2xl animate-scale-up space-y-4"
            style={{
              borderColor: activeStar.color || '#fbbf24',
              boxShadow: `0 0 40px ${activeStar.color || '#fbbf24'}33`,
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: `${activeStar.color || '#fbbf24'}22`,
                borderColor: activeStar.color || '#fbbf24',
              }}
            >
              <Star
                className="w-6 h-6"
                style={{ color: activeStar.color || '#fbbf24', fill: activeStar.color || '#fbbf24' }}
              />
            </div>

            <p className="font-serif-classic italic text-lg sm:text-2xl text-amber-100 leading-relaxed drop-shadow">
              "{activeStar.text}"
            </p>

            <button
              onClick={() => setActiveStar(null)}
              className="mt-4 px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-amber-200 text-xs sm:text-sm font-serif-classic transition-colors shadow-md"
            >
              Guardar en el Corazón ♥
            </button>
          </div>
        </div>
      )}

      {/* Final Birthday Dedication Overlay Modal */}
      {showFinalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
          <div className="relative max-w-xl w-full max-h-[85vh] overflow-y-auto bg-slate-950/95 border border-amber-400/60 rounded-3xl p-5 sm:p-10 text-center shadow-[0_0_60px_rgba(246,198,103,0.3)] space-y-4 sm:space-y-5 animate-scale-up">
            <button
              onClick={() => setShowFinalModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 p-0.5 mx-auto shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-amber-300 animate-bounce" />
              </div>
            </div>

            <h1 className="font-serif-classic text-2xl sm:text-4xl font-semibold text-amber-100 leading-snug">
              {config.finalMessage} {config.herName || 'Mi Amor'} ♥
            </h1>

            <p className="font-serif-classic italic text-amber-200/90 text-sm sm:text-lg leading-relaxed px-2">
              "{config.starMessages.find((s) => s.isSpecial)?.text || 'Gracias por iluminar mi mundo con tu sonrisa. ¡Te amo infinitamente!'}"
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNext && (
                <button
                  onClick={onNext}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-serif-classic font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4" /> Carta Especial de Amiga <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowFinalModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-amber-400/50 bg-amber-500/20 text-amber-200 font-serif-classic text-xs sm:text-sm hover:bg-amber-500/30 transition-all"
              >
                Seguir Mirando las Estrellas ✨
              </button>
              <button
                onClick={onRestart}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-100 border border-white/20 font-serif-classic text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="relative z-20 mb-20 sm:mb-4 flex flex-col sm:flex-row items-center gap-2.5 bg-slate-950/80 border border-amber-500/30 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl">
        <div className="text-xs font-serif-classic text-amber-200/80 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
          <span>
            Estrellas: <strong className="text-amber-300">{revealedCount}</strong> / {totalStarsCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFinalModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-serif-classic text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(246,198,103,0.2)] flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Cumpleaños ♥</span>
          </button>

          {onNext && (
            <button
              onClick={onNext}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500/30 to-pink-500/30 hover:from-rose-500/50 hover:to-pink-500/50 border border-pink-400/50 text-pink-200 font-serif-classic text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] flex items-center gap-1.5"
              title="Carta Especial"
            >
              <Mail className="w-3.5 h-3.5 text-rose-300" />
              <span>Carta Amiga 💌</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Volver a Empezar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


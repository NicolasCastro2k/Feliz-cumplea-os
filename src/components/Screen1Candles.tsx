import React, { useEffect, useRef, useState } from 'react';
import { AppConfig } from '../types';
import { Sparkles, X, Flame, Check, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Screen1Props {
  config: AppConfig;
  onNext: () => void;
}

// Predefined color profiles & styling for the 4 antique candle flames:
// 1. Granate (#a81c38 / #e11d48), 2. Lila (#b57edc / #a855f7), 3. Terracota (#e2725b / #ea580c), 4. Azul (#3b82f6 / #0284c7)
const CANDLE_PROFILES = [
  {
    name: 'Primera pregunta',
    color: '#a81c38',
    midColor: '#e11d48',
    lightCore: '#ffe4e6',
    glowColor: 'rgba(225, 29, 72, 0.85)',
    bgTint: 'rgba(168, 28, 56, 0.3)',
    borderColor: 'rgba(225, 29, 72, 0.6)',
  },
  {
    name: 'Segunda pregunta',
    color: '#9333ea',
    midColor: '#b57edc',
    lightCore: '#f3e8ff',
    glowColor: 'rgba(181, 126, 220, 0.85)',
    bgTint: 'rgba(147, 51, 234, 0.3)',
    borderColor: 'rgba(181, 126, 220, 0.6)',
  },
  {
    name: 'Tercera pregunta',
    color: '#c2410c',
    midColor: '#e2725b',
    lightCore: '#ffedd5',
    glowColor: 'rgba(226, 114, 91, 0.85)',
    bgTint: 'rgba(194, 65, 12, 0.3)',
    borderColor: 'rgba(226, 114, 91, 0.6)',
  },
  {
    name: 'Cuarta pregunta',
    color: '#1d4ed8',
    midColor: '#3b82f6',
    lightCore: '#e0f2fe',
    glowColor: 'rgba(59, 130, 246, 0.85)',
    bgTint: 'rgba(29, 78, 216, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
];

export const Screen1Candles: React.FC<Screen1Props> = ({ config, onNext }) => {
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [solvedState, setSolvedState] = useState<boolean[]>([false, false, false, false]);
  const [activeModalIdx, setActiveModalIdx] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  const allSolved = solvedState.every(Boolean);

  // Fog & Particle canvas rendering
  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    const flameCanvas = flameCanvasRef.current;
    if (!fogCanvas || !flameCanvas) return;

    const fctx = fogCanvas.getContext('2d');
    const flctx = flameCanvas.getContext('2d');
    if (!fctx || !flctx) return;

    let animId: number;
    let w = (fogCanvas.width = flameCanvas.width = window.innerWidth);
    let h = (fogCanvas.height = flameCanvas.height = window.innerHeight);

    const handleResize = () => {
      w = fogCanvas.width = flameCanvas.width = window.innerWidth;
      h = fogCanvas.height = flameCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fog mist blobs
    const fogBlobs = Array.from({ length: 12 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 180 + Math.random() * 250,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.15,
      a: 0.04 + Math.random() * 0.05,
    }));

    // Floating embers rising from lit candles
    const embers: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }[] = [];

    const render = (now: number) => {
      const time = now / 1000;

      // 1. Render Fog Background
      fctx.clearRect(0, 0, w, h);
      fctx.fillStyle = '#060405';
      fctx.fillRect(0, 0, w, h);

      fogBlobs.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const g = fctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(140, 120, 110, ${b.a})`);
        g.addColorStop(1, 'rgba(140, 120, 110, 0)');
        fctx.fillStyle = g;
        fctx.beginPath();
        fctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        fctx.fill();
      });

      // 2. Render Torch Flame spotlight around cursor
      flctx.clearRect(0, 0, w, h);
      if (pointer.active) {
        const wob = Math.sin(time * 8) * 4;
        const grad = flctx.createRadialGradient(
          pointer.x + wob,
          pointer.y,
          0,
          pointer.x + wob,
          pointer.y,
          110
        );
        grad.addColorStop(0, 'rgba(255, 248, 220, 0.95)');
        grad.addColorStop(0.3, 'rgba(235, 180, 120, 0.5)');
        grad.addColorStop(1, 'rgba(235, 180, 120, 0)');
        flctx.fillStyle = grad;
        flctx.beginPath();
        flctx.ellipse(pointer.x + wob, pointer.y - 10, 45, 65, 0, 0, Math.PI * 2);
        flctx.fill();
      }

      // 3. Spawn & Render Ember Sparks for lit candles
      const candleScreenCoords = [
        { x: w < 640 ? 50 : 100, y: w < 640 ? 70 : 100 },
        { x: w < 640 ? w - 50 : w - 100, y: w < 640 ? 70 : 100 },
        { x: w < 640 ? 50 : 100, y: w < 640 ? h - 120 : h - 140 },
        { x: w < 640 ? w - 50 : w - 100, y: w < 640 ? h - 120 : h - 140 },
      ];

      solvedState.forEach((isSolved, idx) => {
        if (isSolved && Math.random() < 0.35) {
          const profile = CANDLE_PROFILES[idx] || CANDLE_PROFILES[0];
          const pos = candleScreenCoords[idx];
          embers.push({
            x: pos.x + (Math.random() - 0.5) * 16,
            y: pos.y - 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.6 - Math.random() * 1.2,
            size: 1 + Math.random() * 2.5,
            color: profile.color,
            life: 0,
            maxLife: 40 + Math.random() * 50,
          });
        }
      });

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(time * 3 + e.life * 0.1) * 0.4;
        e.y += e.vy;

        const progress = e.life / e.maxLife;
        const alpha = Math.max(0, 1 - progress);

        flctx.save();
        flctx.fillStyle = e.color;
        flctx.globalAlpha = alpha;
        flctx.shadowBlur = 8;
        flctx.shadowColor = e.color;
        flctx.beginPath();
        flctx.arc(e.x, e.y, e.size * (1 - progress * 0.5), 0, Math.PI * 2);
        flctx.fill();
        flctx.restore();

        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [pointer, solvedState]);

  const updatePointer = (x: number, y: number) => {
    setPointer({ x, y, active: true });
  };

  // Trigger confetti when all candles are solved
  useEffect(() => {
    if (allSolved) {
      confetti({
        particleCount: 85,
        spread: 90,
        origin: { y: 0.6 },
        colors: CANDLE_PROFILES.map((p) => p.color),
      });
    }
  }, [allSolved]);

  const handleOpenCandle = (idx: number) => {
    setActiveModalIdx(idx);
    setInputValue('');
    setFeedback(null);
  };

  const handleMarkSolved = (idx: number) => {
    const updated = [...solvedState];
    updated[idx] = true;
    setSolvedState(updated);
    setTimeout(() => {
      setActiveModalIdx(null);
    }, 850);
  };

  const handleCheckTextAnswer = () => {
    if (activeModalIdx === null) return;
    const currentConfig = config.candles[activeModalIdx];
    if (!currentConfig) return;

    const normInput = inputValue.trim().toLowerCase();
    const normAnswer = (currentConfig.answer || '').trim().toLowerCase();

    if (normInput.length > 0 && normInput === normAnswer) {
      const customMessage = currentConfig.response || '¡Correcto mi amor! ♥';
      setFeedback({ text: customMessage, ok: true });
      handleMarkSolved(activeModalIdx);
    } else {
      setFeedback({ text: 'Intenta de nuevo...', ok: false });
    }
  };

  const candlePositions = [
    'top-12 left-1 xs:left-3 sm:top-16 sm:left-12',
    'top-12 right-1 xs:right-3 sm:top-16 sm:right-12',
    'bottom-12 left-1 xs:left-3 sm:bottom-20 sm:left-12',
    'bottom-12 right-1 xs:right-3 sm:bottom-20 sm:right-12',
  ];

  return (
    <div
      className="relative w-full h-full min-h-[100dvh] overflow-hidden bg-radial from-neutral-900 via-stone-950 to-black select-none touch-none flex flex-col justify-between"
      onPointerMove={(e) => updatePointer(e.clientX, e.clientY)}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Pointer capture isn't critical; ignore if unsupported
        }
        updatePointer(e.clientX, e.clientY);
      }}
      onPointerUp={() => setPointer({ x: -999, y: -999, active: false })}
      onPointerLeave={() => setPointer({ x: -999, y: -999, active: false })}
      onPointerCancel={() => setPointer({ x: -999, y: -999, active: false })}
    >
      <canvas ref={fogCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      <canvas ref={flameCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

      {/* Top Instruction Header */}
      <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-30 text-center px-2 pointer-events-none w-full max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-amber-300/30 bg-black/70 text-amber-200 text-[10px] xs:text-[11px] sm:text-sm font-serif-classic uppercase tracking-wider backdrop-blur-md shadow-lg max-w-[90vw] truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="truncate">
            {allSolved
              ? '¡Has encendido las 4 velas! Puedes continuar.'
              : 'mueve la luz para revelar mensajes y encender las velas'}
          </span>
        </div>
      </div>

      {/* Dynamic Messages Revealed in the Fog */}
      <div
        className="absolute inset-0 z-15 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 sm:p-10 pointer-events-none transition-all duration-1000"
        style={{
          maskImage: allSolved
            ? 'none'
            : `radial-gradient(circle 160px at ${pointer.x}px ${pointer.y}px, black 0%, black 60%, transparent 90%)`,
          WebkitMaskImage: allSolved
            ? 'none'
            : `radial-gradient(circle 160px at ${pointer.x}px ${pointer.y}px, black 0%, black 60%, transparent 90%)`,
        }}
      >
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Main grand hidden message */}
          <h1 className="font-serif-classic italic text-2xl xs:text-3xl sm:text-5xl md:text-6xl text-amber-100 drop-shadow-[0_0_30px_rgba(255,220,160,0.8)] leading-snug sm:leading-relaxed">
            "{config.hiddenMessage || 'Te amo mi niña bonita'}"
          </h1>

          {/* Messages revealed in the mist when correctly answered */}
          <div className="space-y-3">
            {/* Show specific lit candle fog messages */}
            {config.candles.map((candle, idx) => {
              const isSolved = solvedState[idx];
              const profile = CANDLE_PROFILES[idx] || CANDLE_PROFILES[0];
              const msg = candle.fogMessage;

              if (!isSolved || !msg) return null;

              return (
                <p
                  key={candle.id}
                  className="font-serif-classic italic text-sm sm:text-lg animate-fade-in transition-all duration-700"
                  style={{
                    color: profile.color,
                    textShadow: `0 0 16px ${profile.glowColor}`,
                  }}
                >
                  {msg}
                </p>
              );
            })}
          </div>

          {allSolved && (
            <p className="font-serif-classic text-amber-300/90 text-base sm:text-xl animate-bounce pt-2">
              ♥ Gracias por ser mi cielo estrellado ♥
            </p>
          )}
        </div>
      </div>

      {/* 4 Corner Magical Wax Candles with Distinct Flame Colors (1. Granate, 2. Lila, 3. Terracota, 4. Azul) */}
      {config.candles.map((candleConfig, idx) => {
        const isSolved = solvedState[idx];
        const posClass = candlePositions[idx];
        const profile = CANDLE_PROFILES[idx] || {
          name: candleConfig.colorName || `Primera vela`,
          color: candleConfig.color || '#e11d48',
          midColor: '#f43f5e',
          lightCore: '#ffe4e6',
          glowColor: 'rgba(225, 29, 72, 0.85)',
          bgTint: 'rgba(168, 28, 56, 0.3)',
          borderColor: 'rgba(225, 29, 72, 0.6)',
        };

        const flameMain = candleConfig.color || profile.color;
        const flameMid = profile.midColor || flameMain;
        const flameCore = profile.lightCore || '#ffffff';

        // Pure White Wax color palette (Snow/Ivory White Wax with inner glow when lit)
        const wax = {
          topWax: '#ffffff',
          topPool: isSolved
            ? `radial-gradient(circle, #ffffff 0%, ${flameMid} 100%)`
            : 'radial-gradient(circle, #ffffff 0%, #fefcf8 60%, #f5f2eb 100%)',
          bodyWax: isSolved
            ? 'linear-gradient(to bottom, #ffffff 0%, #fcfaf7 30%, #f7f3ec 70%, #ede8de 100%)'
            : 'linear-gradient(to bottom, #ffffff 0%, #faf8f5 40%, #f2eee6 85%, #e5e0d5 100%)',
          dripMain: '#ffffff',
          dripAccent: '#f7f4ed',
          dripShadow: '1px 2px 4px rgba(0,0,0,0.12)',
          waxGlow: profile.glowColor,
        };

        const candleRunes = ['.✦ ݁˖.✦ ݁˖.✦ ݁˖', '.☘︎ ݁˖.☘︎ ݁˖.☘︎ ݁˖', '࣪ ִֶָ☾.࣪࿐࣪ ִֶָ☾.࣪࿐࣪ ִֶָ☾.࣪࿐', '˗ˋˏ༺❤︎༻ˎˊ˗˗ˋˏ༺❤︎༻ˎˊ˗'];

        return (
          <button
            key={candleConfig.id}
            onClick={() => handleOpenCandle(idx)}
            className={`absolute z-30 group cursor-pointer transition-all duration-500 hover:scale-110 flex flex-col items-center scale-[0.72] xs:scale-[0.82] sm:scale-100 origin-center ${posClass} animate-magic-float`}
            style={{ animationDelay: `${idx * 0.9}s` }}
          >
            {/* Natural Wax Candle Visual Container */}
            <div className="relative flex flex-col items-center select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
              
              {/* MAGICAL FLAME & ORBITING SPARKLES */}
              <div className="relative w-14 h-20 flex items-end justify-center pb-1">
                {isSolved ? (
                  /* Lit Magical Colored Flame */
                  <div className="relative flex items-center justify-center">
                    {/* Vertical Ethereal Light Beam */}
                    <div
                      className="absolute -top-16 w-8 h-28 opacity-40 blur-lg pointer-events-none transition-all duration-700 animate-pulse"
                      style={{
                        background: `linear-gradient(to top, ${profile.glowColor}, rgba(0,0,0,0))`,
                      }}
                    />

                    {/* Outer Pulsing Magic Halo */}
                    <div
                      className="absolute w-28 h-28 rounded-full animate-pulse blur-xl opacity-80 pointer-events-none transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle, ${profile.glowColor} 0%, rgba(0,0,0,0) 70%)`,
                      }}
                    />

                    {/* Orbiting Magic Sparkle Orbs */}
                    <div className="absolute -top-3 w-10 h-10 animate-spin pointer-events-none" style={{ animationDuration: '6s' }}>
                      <span className="absolute top-0 left-1 text-[10px] animate-ping" style={{ color: flameMid }}>✦</span>
                      <span className="absolute bottom-0 right-1 text-[8px] animate-pulse" style={{ color: flameCore }}>✧</span>
                    </div>

                    {/* SVG Multi-layer Organic Teardrop Magic Flame */}
                    <svg
                      viewBox="0 0 40 60"
                      className="w-9 h-14 overflow-visible origin-bottom animate-flicker z-10"
                      style={{
                        filter: `drop-shadow(0 0 14px ${flameMain}) drop-shadow(0 0 28px ${flameMid})`,
                      }}
                    >
                      <defs>
                        {/* Outer Magic Flame Gradient */}
                        <radialGradient id={`flameGrad-${idx}`} cx="50%" cy="80%" r="65%">
                          <stop offset="0%" stopColor={flameCore} />
                          <stop offset="30%" stopColor={flameMid} />
                          <stop offset="75%" stopColor={flameMain} />
                          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </radialGradient>
                        {/* Inner Hot Core Gradient */}
                        <linearGradient id={`coreGrad-${idx}`} x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="50%" stopColor={flameCore} />
                          <stop offset="100%" stopColor={flameMid} />
                        </linearGradient>
                      </defs>

                      {/* Flame Outer Magic Shape */}
                      <path
                        d="M 20 2 C 28 20 36 32 34 44 C 32 54 24 58 20 58 C 16 58 8 54 6 44 C 4 32 12 20 20 2 Z"
                        fill={`url(#flameGrad-${idx})`}
                      />

                      {/* Inner Dancing Flame Core */}
                      <path
                        d="M 20 16 C 24 26 28 34 26 42 C 25 48 22 50 20 50 C 18 50 15 48 14 42 C 12 34 16 26 20 16 Z"
                        fill={`url(#coreGrad-${idx})`}
                        className="animate-pulse"
                      />

                      {/* White Hot Magic Center */}
                      <ellipse cx="20" cy="44" rx="4" ry="7" fill="#ffffff" opacity="0.95" />
                    </svg>
                  </div>
                ) : (
                  /* Unlit Cotton Wick with hover preview ember */
                  <div className="relative flex flex-col items-center justify-end h-12 group-hover:-translate-y-1 transition-transform">
                    {/* Hover Ember Magic Glow preview */}
                    <div
                      className="w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xs animate-ping mb-1"
                      style={{ backgroundColor: flameMain }}
                    />
                    {/* Braided Dark Cotton Wick */}
                    <div
                      className="w-1.5 h-4 rounded-t-sm"
                      style={{
                        background: 'linear-gradient(to bottom, #18181b 0%, #3f3f46 60%, #18181b 100%)',
                        boxShadow: `0 0 8px ${flameMain}`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* NATURAL WAX CANDLE BODY & MELTED DRIPS */}
              <div className="relative w-10 flex flex-col items-center">
                {/* Melted Wax Top Pool & Concave Rim */}
                <div
                  className="w-11 h-3.5 rounded-t-full relative z-20 transition-all duration-700 overflow-hidden"
                  style={{
                    backgroundColor: wax.topWax,
                    boxShadow: isSolved
                      ? `inset 0 2px 4px rgba(255,255,255,0.8), 0 0 16px ${wax.waxGlow}`
                      : 'inset 0 2px 3px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Recessed Melted Wax Pool Interior */}
                  <div
                    className="absolute inset-x-1.5 top-0.5 h-2 rounded-full transition-all duration-500"
                    style={{
                      background: isSolved
                        ? `radial-gradient(circle, #ffffff 0%, ${flameMid} 100%)`
                        : 'radial-gradient(circle, #ffffff 0%, #f9f8f5 70%, #eeebe3 100%)',
                    }}
                  >
                    {/* Wick Socket Base */}
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-stone-900" />
                  </div>
                </div>

                {/* Main Wax Pillar Column */}
                <div
                  className="w-10 h-24 relative shadow-inner transition-all duration-700 flex flex-col items-center justify-between overflow-hidden py-1.5"
                  style={{
                    background: wax.bodyWax,
                    boxShadow: isSolved
                      ? `inset 0 0 25px rgba(255,255,255,0.6), 0 0 30px ${wax.waxGlow}`
                      : 'inset 0 0 12px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Translucent Subsurface Glow when lit */}
                  {isSolved && (
                    <div
                      className="absolute inset-0 opacity-70 animate-pulse pointer-events-none z-0"
                      style={{
                        background: `radial-gradient(circle at 50% 25%, #ffffff 0%, ${flameMid} 45%, transparent 80%)`,
                      }}
                    />
                  )}

                  {/* Engraved Magic Runes along Wax Surface */}
                  <div
                    className="z-10 text-[10px] font-serif-classic font-bold tracking-widest my-auto text-center space-y-1 animate-rune-glow transition-all select-none"
                    style={{
                      color: isSolved ? '#ffffff' : '#3f3f46',
                      textShadow: isSolved ? `0 0 10px ${flameCore}` : '0 1px 1px rgba(255,255,255,0.9)',
                    }}
                  >
                    <div className="opacity-90">{candleRunes[idx]}</div>
                    <div className="text-[11px]">♥ {idx + 1} ♥</div>
                  </div>

                  {/* LAYERED NATURAL WAX TEARS & DRIPS */}
                  {/* Drip 1: Left Long Smooth Drop */}
                  <div
                    className="absolute top-0 left-0 w-3 h-12 rounded-b-full transition-all duration-500 z-10"
                    style={{
                      backgroundColor: wax.dripMain,
                      opacity: 0.95,
                      boxShadow: isSolved ? `0 0 10px ${flameMain}` : '1px 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />

                  {/* Drip 2: Right Curvy Drip */}
                  <div
                    className="absolute top-1 right-0 w-2.5 h-16 rounded-b-full transition-all duration-500 z-10"
                    style={{
                      backgroundColor: wax.dripAccent,
                      opacity: 0.9,
                      boxShadow: '1px 2px 4px rgba(0,0,0,0.08)',
                    }}
                  />

                  {/* Drip 3: Center Mid Drip */}
                  <div
                    className="absolute top-0 left-3 w-2 h-7 rounded-b-full z-10"
                    style={{
                      backgroundColor: wax.topWax,
                      opacity: 0.98,
                    }}
                  />

                  {/* Drip 4: Bottom Wax Bulb */}
                  <div
                    className="absolute bottom-2 left-1.5 w-2.5 h-5 rounded-b-full z-10"
                    style={{
                      backgroundColor: wax.dripMain,
                      opacity: 0.95,
                    }}
                  />
                </div>

                {/* RUSTIC NATURAL STONE SLATE TILE BASE */}
                <div className="relative w-16 flex flex-col items-center -mt-0.5 z-20">
                  {/* Melted White Wax Puddle on Tile */}
                  <div
                    className="w-13 h-2 rounded-full transition-all duration-500 -mb-1 z-10"
                    style={{
                      backgroundColor: '#ffffff',
                      opacity: 0.95,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />

                  {/* Dark Rough Slate Coaster */}
                  <div className="w-16 h-3.5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 rounded-lg border-t border-stone-700/60 shadow-2xl relative flex items-center justify-center">
                    <div className="w-10 h-0.5 bg-stone-700/50 rounded-full" />
                  </div>

                  {/* Soft Light Aura under slate tile */}
                  <div
                    className="w-14 h-2 rounded-full blur-xs transition-all duration-700 animate-pulse mt-0.5"
                    style={{
                      backgroundColor: isSolved ? profile.color : 'rgba(234, 179, 8, 0.25)',
                      boxShadow: `0 0 14px ${isSolved ? profile.glowColor : 'rgba(234, 179, 8, 0.4)'}`,
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Candle Badge */}
            <div
              className="mt-2.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-serif-classic font-semibold tracking-wider backdrop-blur-md transition-all duration-300 shadow-xl flex items-center gap-1.5"
              style={{
                backgroundColor: isSolved ? profile.bgTint : 'rgba(12, 10, 9, 0.88)',
                borderColor: profile.borderColor,
                color: isSolved ? '#ffffff' : profile.midColor,
                boxShadow: isSolved ? `0 0 18px ${profile.bgTint}` : '0 4px 10px rgba(0,0,0,0.5)',
              }}
            >
              <Flame
                className={`w-3.5 h-3.5 ${isSolved ? 'animate-bounce' : 'opacity-70'}`}
                style={{ color: flameMain }}
              />
              <span>{isSolved ? `Vela ${idx + 1} ♥` : `Vela ${idx + 1}`}</span>
            </div>
          </button>
        );
      })}

      {/* Candle Question Modal */}
      {activeModalIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-md bg-stone-950 border rounded-2xl p-6 text-center text-amber-100 shadow-2xl space-y-5"
            style={{
              borderColor: CANDLE_PROFILES[activeModalIdx]?.borderColor || 'rgba(232,168,96,0.5)',
              boxShadow: `0 0 40px ${CANDLE_PROFILES[activeModalIdx]?.bgTint || 'rgba(232,168,96,0.2)'}`,
            }}
          >
            <button
              onClick={() => setActiveModalIdx(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="mx-auto w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: CANDLE_PROFILES[activeModalIdx]?.bgTint,
                color: CANDLE_PROFILES[activeModalIdx]?.color,
              }}
            >
              <Flame className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span
                className="text-xs font-serif-classic uppercase tracking-widest font-semibold"
                style={{ color: CANDLE_PROFILES[activeModalIdx]?.color }}
              >
                Vela Mágica #{activeModalIdx + 1}
              </span>
              <p className="font-serif-classic italic text-xl sm:text-2xl text-amber-100 leading-snug pt-1">
                {config.candles[activeModalIdx]?.question}
              </p>
            </div>

            {config.candles[activeModalIdx]?.type === 'choice' ? (
              <div className="flex flex-col gap-2.5 pt-2">
                {config.candles[activeModalIdx]?.options?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFeedback({ text: opt.response, ok: opt.correct });
                      if (opt.correct) {
                        handleMarkSolved(activeModalIdx);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-amber-500/10 hover:border-amber-400/50 text-sm font-sans-body text-slate-200 transition-all text-left flex items-center justify-between"
                  >
                    <span>{opt.label}</span>
                    {feedback?.ok && opt.correct && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckTextAnswer()}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-amber-100 placeholder-slate-500 text-center text-sm focus:border-amber-400 outline-none transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleCheckTextAnswer}
                  className="w-full py-2.5 rounded-xl font-serif-classic font-semibold text-sm transition-all text-white shadow-lg"
                  style={{
                    backgroundColor: CANDLE_PROFILES[activeModalIdx]?.color || '#d97706',
                  }}
                >
                  Encender Vela #{activeModalIdx + 1}
                </button>
              </div>
            )}

            {feedback && (
              <p
                className={`text-xs font-sans-body font-medium ${
                  feedback.ok ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {feedback.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Next Screen Button */}
      {allSolved && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-full border border-amber-400/60 bg-amber-500/20 text-amber-200 font-serif-classic text-sm uppercase tracking-widest hover:bg-amber-500/30 hover:border-amber-300 transition-all shadow-[0_0_25px_rgba(232,168,96,0.4)] flex items-center gap-2"
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
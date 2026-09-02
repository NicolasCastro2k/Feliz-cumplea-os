import React, { useEffect, useRef, useState } from 'react';
import { AppConfig } from '../types';
import { ChevronRight, Sparkles, Sun } from 'lucide-react';

interface Screen5Props {
  config: AppConfig;
  onNext: () => void;
}

export const Screen5Sunset: React.FC<Screen5Props> = ({ config, onNext }) => {
  const seaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGreenFlash, setIsGreenFlash] = useState<boolean>(false);
  const isGreenFlashRef = useRef<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -999, y: -999 });

  // Keep ref in sync so canvas loop reads latest state without restarting effect
  useEffect(() => {
    isGreenFlashRef.current = isGreenFlash;
  }, [isGreenFlash]);

  // Handle cursor/touch movement to detect proximity to the sun on the horizon
  const handlePointerMove = (x: number, y: number) => {
    setMousePos({ x, y });
    const sunX = window.innerWidth / 2;
    const sunY = window.innerHeight * 0.54;
    const dist = Math.hypot(x - sunX, y - sunY);

    // Trigger green flash when cursor is within 160px of the sun on the horizon
    if (dist < 160) {
      if (!isGreenFlash) setIsGreenFlash(true);
    } else {
      if (isGreenFlash) setIsGreenFlash(false);
    }
  };

  // Sea Canvas Animation
  useEffect(() => {
    const canvas = seaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let horizonY = h * 0.54; // Ocean Horizon line
    let sandTopY = h * 0.88; // Beach Sand line

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      horizonY = h * 0.54;
      sandTopY = h * 0.88;
    };
    window.addEventListener('resize', handleResize);

    // Flying Birds in Sky
    const birdCount = w < 600 ? 3 : 5;
    let birds = Array.from({ length: birdCount }, (_, idx) => ({
      x: Math.random() * w,
      y: horizonY * 0.15 + (idx * 25) + Math.random() * 30,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 20 + Math.random() * 16,
      size: 7 + Math.random() * 6,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 4.5 + Math.random() * 2,
      bob: Math.random() * Math.PI * 2,
    }));

    // Diamond Sparkles / Glints on Water
    const glintCount = w < 600 ? 25 : 45;
    const glints = Array.from({ length: glintCount }, () => ({
      x: w / 2 + (Math.random() - 0.5) * (w * 0.4),
      yFrac: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 1.2 + Math.random() * 2.2,
      size: 0.9 + Math.random() * 2.2,
    }));

    // Ocean Waves
    const waveBands = [
      { amp: 4, len: 280, speed: 0.35, alpha: 0.28, color: '30,25,50' },
      { amp: 6, len: 180, speed: 0.55, alpha: 0.22, color: '160,90,100' },
      { amp: 3, len: 120, speed: 0.8, alpha: 0.3, color: '255,220,190' },
    ];

    let startTime = performance.now();

    const render = (now: number) => {
      const activeFlash = isGreenFlashRef.current;
      const time = (now - startTime) / 1000;
      ctx.clearRect(0, 0, w, h);

      const seaH = sandTopY - horizonY;
      if (seaH > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, horizonY, w, seaH);
        ctx.clip();

        // 1. Water Base Gradient (reflecting dramatic sunset)
        const waterGrad = ctx.createLinearGradient(0, horizonY, 0, sandTopY);
        if (activeFlash) {
          waterGrad.addColorStop(0, 'rgba(40, 180, 120, 0.6)');
          waterGrad.addColorStop(0.2, 'rgba(30, 120, 90, 0.5)');
          waterGrad.addColorStop(0.6, 'rgba(20, 60, 60, 0.7)');
          waterGrad.addColorStop(1, 'rgba(10, 30, 40, 0.85)');
        } else {
          waterGrad.addColorStop(0, 'rgba(220, 110, 70, 0.55)');
          waterGrad.addColorStop(0.2, 'rgba(170, 80, 80, 0.5)');
          waterGrad.addColorStop(0.6, 'rgba(80, 40, 70, 0.65)');
          waterGrad.addColorStop(1, 'rgba(35, 20, 45, 0.85)');
        }
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, horizonY, w, seaH);

        // 2. Sun Golden/Emerald Light Track on Ocean Surface
        const shimmer = 0.18 + Math.sin(time * 1.5) * 0.06;
        const reflectColor = activeFlash ? '111,255,176' : '255,210,130';

        const rgrad = ctx.createRadialGradient(w / 2, horizonY, 4, w / 2, horizonY, w * 0.35);
        rgrad.addColorStop(0, `rgba(${reflectColor}, ${shimmer + 0.45})`);
        rgrad.addColorStop(0.3, `rgba(${reflectColor}, ${(shimmer + 0.2) * 0.6})`);
        rgrad.addColorStop(1, `rgba(${reflectColor}, 0)`);

        ctx.fillStyle = rgrad;
        ctx.fillRect(0, horizonY, w, seaH);

        // 3. Sparkling Diamond Glints on Wave Tops
        glints.forEach((g) => {
          const tw = (Math.sin(time * g.speed + g.phase) + 1) / 2;
          const y = horizonY + g.yFrac * seaH;
          const distFromCenter = Math.abs(g.x - w / 2);
          const centerFade = Math.max(0, 1 - distFromCenter / (w * 0.35));
          const alpha = (0.2 + tw * 0.8) * centerFade;

          if (alpha > 0.05) {
            ctx.save();
            ctx.translate(g.x, y);
            ctx.shadowBlur = 12 * tw;
            ctx.shadowColor = activeFlash ? 'rgba(111,255,176,0.95)' : 'rgba(255, 220, 120, 0.95)';
            ctx.beginPath();
            ctx.fillStyle = activeFlash
              ? `rgba(200, 255, 225, ${alpha})`
              : `rgba(255, 245, 200, ${alpha})`;
            const s = g.size * (0.8 + tw * 0.9);
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.6, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.6, 0);
            ctx.fill();
            ctx.restore();
          }
        });

        // 4. Rolling Wave Bands
        waveBands.forEach((band) => {
          ctx.beginPath();
          const baseY = horizonY + seaH * 0.35;
          ctx.moveTo(0, baseY);
          for (let x = 0; x <= w; x += 12) {
            const yy = baseY + Math.sin(x / band.len + time * band.speed) * band.amp;
            ctx.lineTo(x, yy);
          }
          ctx.lineTo(w, sandTopY);
          ctx.lineTo(0, sandTopY);
          ctx.closePath();
          ctx.fillStyle = `rgba(${band.color}, ${band.alpha})`;
          ctx.fill();
        });

        // 5. Ocean Foam / Tide Line at Beach Edge
        const foamY = sandTopY - 2;
        ctx.beginPath();
        ctx.moveTo(0, foamY);
        for (let x = 0; x <= w; x += 10) {
          const fy = foamY + Math.sin(x * 0.03 + time * 2) * 2.5;
          ctx.lineTo(x, fy);
        }
        ctx.lineTo(w, sandTopY + 10);
        ctx.lineTo(0, sandTopY + 10);
        ctx.fillStyle = activeFlash ? 'rgba(180, 255, 220, 0.4)' : 'rgba(255, 235, 210, 0.35)';
        ctx.fill();

        ctx.restore();
      }

      // 6. Flying Birds
      birds.forEach((b) => {
        b.x += b.speed * b.dir * (1 / 60);
        if (b.x < -60 || b.x > w + 60) {
          b.x = b.dir === 1 ? -40 : w + 40;
          b.y = horizonY * 0.15 + Math.random() * horizonY * 0.4;
        }

        const flap = Math.sin(time * b.wingSpeed + b.wingPhase) * 0.6;
        const yy = b.y + Math.sin(time * 0.4 + b.bob) * 5;

        ctx.save();
        ctx.translate(b.x, yy);
        ctx.scale(b.dir, 1);
        ctx.strokeStyle = 'rgba(40, 20, 30, 0.65)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-b.size, Math.sin(flap) * b.size * 0.7);
        ctx.quadraticCurveTo(-b.size * 0.3, -b.size * 0.8, 0, 0);
        ctx.quadraticCurveTo(b.size * 0.3, -b.size * 0.8, b.size, Math.sin(flap) * b.size * 0.7);
        ctx.stroke();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#2e1d3e] via-[#85345a] via-35% to-[#e06132] text-amber-100 flex flex-col items-center justify-between select-none overflow-hidden"
    >
      {/* Sky Clouds */}
      <div className="absolute top-[3%] left-[5%] w-[42vw] h-[18vh] rounded-full bg-radial from-rose-300/35 to-transparent blur-2xl pointer-events-none animate-cloud-drift" />
      <div className="absolute top-[8%] right-[8%] w-[45vw] h-[22vh] rounded-full bg-radial from-amber-200/30 to-transparent blur-2xl pointer-events-none animate-cloud-drift" />
      <div className="absolute top-[22%] left-[30%] w-[38vw] h-[15vh] rounded-full bg-radial from-orange-300/40 to-transparent blur-xl pointer-events-none" />

      {/* CIRCULAR GREEN LIGHT CONES (3 Cones: Arriba, Izquierda, Derecha con difuminado) */}
      <div
        className={`absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] h-[90vw] max-h-[700px] pointer-events-none z-25 transition-all duration-700 ease-out ${
          isGreenFlash ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
        }`}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full filter drop-shadow-[0_0_25px_#6fffb0]">
          <defs>
            {/* Radial gradient for light cones */}
            <radialGradient id="greenConeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#6fffb0" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#2bd980" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Soft blur filter around the cones for a delicate glow */}
            <filter id="coneBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Outer soft ambient green aura */}
            <radialGradient id="ambientGreenGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6fffb0" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#2bd980" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Soft Diffuse Glow around the cones */}
          <circle cx="300" cy="300" r="280" fill="url(#ambientGreenGlow)" className="animate-pulse" />

          {/* EXACTLY 3 CONES: Up (0°), Right (90°), Left (270°) with soft blur */}
          <g filter="url(#coneBlur)">
            {[0, 90, 270].map((angle) => {
              const coneWidth = 70;
              const coneLen = 270;
              return (
                <g key={angle} transform={`rotate(${angle} 300 300)`}>
                  <path
                    d={`M 300 300 L ${300 - coneWidth} ${300 - coneLen} L ${300 + coneWidth} ${300 - coneLen} Z`}
                    fill="url(#greenConeGrad)"
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </g>

          {/* Soft Center Glowing Emerald Core */}
          <circle cx="300" cy="300" r="75" fill="url(#greenConeGrad)" opacity="0.95" />
        </svg>
      </div>

      {/* Setting Sun at Horizon */}
      <div
        onMouseEnter={() => setIsGreenFlash(true)}
        onMouseLeave={() => setIsGreenFlash(false)}
        onTouchStart={() => setIsGreenFlash(true)}
        onTouchEnd={() => setIsGreenFlash(false)}
        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 rounded-full cursor-pointer z-30 flex items-center justify-center group"
      >
        {/* Sun Core */}
        <div
          className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full transition-all duration-500 flex items-center justify-center ${
            isGreenFlash
              ? 'bg-radial from-white via-[#8ef2be] to-[#2bd980] shadow-[0_0_100px_35px_rgba(111,255,176,0.9)] scale-110'
              : 'bg-radial from-[#fffdf5] via-[#ffdf9e] to-[#f6a032] shadow-[0_0_90px_30px_rgba(255,180,100,0.6)] animate-sun-pulse group-hover:scale-110'
          }`}
        />
      </div>

      {/* Instruction Badge */}
      <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 text-center px-2 w-full max-w-md">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-5 sm:py-1.5 rounded-full border text-[11px] sm:text-sm font-serif-classic uppercase tracking-wider transition-all duration-300 shadow-lg ${
            isGreenFlash
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(111,255,176,0.5)]'
              : 'bg-black/50 border-white/20 text-amber-100 backdrop-blur-md'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isGreenFlash ? 'text-emerald-300 animate-spin' : 'text-amber-300'}`} />
          <span className="truncate">{isGreenFlash ? '¡Eres mi rayo verde en el mar!' : 'Pasa tu dedo por el sol'}</span>
        </div>
      </div>

      {/* Ocean Canvas */}
      <canvas ref={seaCanvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

      {/* Sandy Beach Shore & Action Button at Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#ba8850] via-[#c99a5f] to-[#d9b98a] z-20 flex flex-col items-center justify-center border-t border-amber-900/30 shadow-2xl px-3 pt-2 pb-24 sm:pb-6 gap-2">
        <p className="font-serif-classic italic text-amber-950 text-xs sm:text-xl md:text-2xl text-center max-w-2xl font-semibold tracking-wide drop-shadow-xs px-2">
          "{config.sandMessage || 'En este instante, quiero que sepas cuánto te amo.'}"
        </p>

        <button
          onClick={onNext}
          className="mt-1 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-amber-950/60 bg-amber-950/85 text-amber-100 font-serif-classic text-xs sm:text-sm uppercase tracking-widest hover:bg-amber-900 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-1.5 shrink-0"
        >
          Continuar <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

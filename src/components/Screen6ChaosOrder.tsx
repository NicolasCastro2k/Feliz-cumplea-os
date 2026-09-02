import React, { useEffect, useRef, useState } from 'react';
import { AppConfig } from '../types';
import { ChevronRight, Sparkles, Heart } from 'lucide-react';

interface Screen6ChaosOrderProps {
  config: AppConfig;
  onNext: () => void;
}

const ROMANTIC_MESSAGES = [
  'Te volviste mi paz cuando era un completo caos ❤︎',
  'Para mi te volviste calma, pasion, deseo, amor y anhelo',
  'Siempre pense que el amor debia ser intenso, contigo aprendi a amar de verdad',
  'Se me acaban las ideas D:',
  'Te adoro, te amo y deseo con toda mi alma, preciosa',
  'Ven~ Levantame las caderas~',
  'Puedo besarte y besarte y besarte?',
  'De perrito? De misionero? o dandome sentones mi amor~?',
  'Te extraño',
  'Estas sonriendo? Porque te ves hermosa haciendolo',
  'El caos se volvio ritmo cuando escuche tu voz, mi princesita',
];

interface GalaxyStar {
  r: number;            // Current radius from center
  targetR: number;      // Target radius when ordered
  theta: number;        // Current angle
  orbitSpeed: number;   // Angular speed
  size: number;
  color: string;
  shapeType: 'circle' | 'cross' | 'diamond' | 'ringNode';
  trailHistory: { x: number; y: number }[];
  twinklePhase: number;
  spiralArm: number;
}

export const Screen6ChaosOrder: React.FC<Screen6ChaosOrderProps> = ({ config, onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [msgIdx, setMsgIdx] = useState<number>(0);
  const [hasPressedOnce, setHasPressedOnce] = useState<boolean>(false);

  const isPressingRef = useRef<boolean>(false);
  isPressingRef.current = isPressing;

  // Touch & Pointer Press Handlers for Mobile & Desktop
  const handlePressStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsPressing(true);
    if (!hasPressedOnce) {
      setHasPressedOnce(true);
      setMsgIdx(0);
    } else {
      setMsgIdx((prev) => (prev + 1) % ROMANTIC_MESSAGES.length);
    }
  };

  const handlePressEnd = () => {
    setIsPressing(false);
  };

  // Canvas Galaxy Simulation
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

    const starCount = w < 600 ? 220 : 340;
    // Neon palette
    const neonColors = [
      '#00f0ff', // Neon Cyan
      '#ff007f', // Neon Pink
      '#9d00ff', // Neon Purple
      '#39ff14', // Neon Lime
      '#ffe600', // Neon Yellow
      '#ff5e00', // Neon Orange
      '#00ffff', // Neon Aqua
      '#ff0055', // Neon Electric Ruby
    ];

    const shapeTypes: ('circle' | 'cross' | 'diamond' | 'ringNode')[] = [
      'circle',
      'cross',
      'diamond',
      'ringNode',
    ];

    // Initialize Galaxy Stars
    const maxRadius = Math.max(w, h) * 0.48;
    const stars: GalaxyStar[] = Array.from({ length: starCount }, (_, idx) => {
      const arm = idx % 5;
      const initialR = 25 + Math.random() * maxRadius;
      const initialTheta = Math.random() * Math.PI * 2;
      return {
        r: initialR,
        targetR: 0,
        theta: initialTheta,
        orbitSpeed: (0.006 + Math.random() * 0.012) * (Math.random() < 0.5 ? 1 : -1),
        size: 1.5 + Math.random() * 3.2,
        color: neonColors[idx % neonColors.length],
        shapeType: shapeTypes[idx % shapeTypes.length],
        trailHistory: [],
        twinklePhase: Math.random() * Math.PI * 2,
        spiralArm: arm,
      };
    });

    let startTime = performance.now();
    let ringRotationAngle = 0;

    const render = (now: number) => {
      const time = (now - startTime) / 1000;
      const ordered = isPressingRef.current;

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const ringRadius = Math.min(w, h) * (w < 600 ? 0.36 : 0.28);

      if (ordered) {
        // Spin the assembled circle ring VERY FAST when pressing
        ringRotationAngle += 0.065;
      }

      // Update & Draw Galaxy Stars
      stars.forEach((star, idx) => {
        if (ordered) {
          // Pull into fast-spinning precise circular ring
          const ringLayer = (idx % 4) * 8;
          star.targetR = ringRadius + ringLayer;
          star.r += (star.targetR - star.r) * 0.18; // Fast pull inwards
          
          // Fast angular ring rotation
          const targetAngle = ((idx / starCount) * Math.PI * 2) + ringRotationAngle;
          star.theta += (targetAngle - star.theta) * 0.18;
        } else {
          // Immediately explode back into chaotic turbulent galaxy swirl on release
          star.theta += star.orbitSpeed;
          const naturalR = 30 + (idx / starCount) * (maxRadius * 0.95) + Math.sin(time * 1.5 + idx * 0.4) * 40;
          star.r += (naturalR - star.r) * 0.12;
        }

        const x = centerX + Math.cos(star.theta) * star.r;
        const y = centerY + Math.sin(star.theta) * star.r;

        // Store trail positions for galaxy motion lines
        star.trailHistory.push({ x, y });
        if (star.trailHistory.length > (ordered ? 10 : 7)) {
          star.trailHistory.shift();
        }

        // Draw Galaxy Stream / Orbit Trail Lines
        if (star.trailHistory.length > 2) {
          ctx.beginPath();
          ctx.moveTo(star.trailHistory[0].x, star.trailHistory[0].y);
          for (let t = 1; t < star.trailHistory.length; t++) {
            ctx.lineTo(star.trailHistory[t].x, star.trailHistory[t].y);
          }
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = ordered ? 0.45 : 0.22;
          ctx.lineWidth = ordered ? star.size * 1.2 : star.size * 0.7;
          ctx.stroke();
        }

        // Inter-star neon stream web lines
        if (idx % 6 === 0 && !ordered) {
          const neighbor = stars[(idx + 12) % starCount];
          const nx = centerX + Math.cos(neighbor.theta) * neighbor.r;
          const ny = centerY + Math.sin(neighbor.theta) * neighbor.r;
          const dist = Math.hypot(x - nx, y - ny);
          if (dist < (w < 600 ? 90 : 130)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = star.color;
            ctx.globalAlpha = (1 - dist / 130) * 0.28;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw Star with Diverse Shapes
        const twinkle = (Math.sin(time * 4.5 + star.twinklePhase) + 1) / 2;
        const alpha = 0.65 + twinkle * 0.35;

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = star.color;
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = ordered ? 20 : 10;
        ctx.shadowColor = star.color;

        const s = star.size;

        if (star.shapeType === 'cross') {
          // 4-Point Sparkle Cross Star
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-s * 2.2, 0);
          ctx.lineTo(s * 2.2, 0);
          ctx.moveTo(0, -s * 2.2);
          ctx.lineTo(0, s * 2.2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else if (star.shapeType === 'diamond') {
          // Diamond Star
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.8);
          ctx.lineTo(s * 1.2, 0);
          ctx.lineTo(0, s * 1.8);
          ctx.lineTo(-s * 1.2, 0);
          ctx.closePath();
          ctx.fill();
        } else if (star.shapeType === 'ringNode') {
          // Ringed Star Node
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, s * 1.8, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Classic Neon Circle
          ctx.beginPath();
          ctx.arc(0, 0, s, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw Fast Spinning Galaxy Ring Accents when pressing
      if (ordered) {
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00f0ff';

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 14]);
        ctx.lineDashOffset = -ringRotationAngle * 90;
        ctx.stroke();

        ctx.shadowColor = '#ff007f';
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius + 22, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = ringRotationAngle * 70;
        ctx.stroke();

        ctx.shadowColor = '#ffe600';
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius - 16, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -ringRotationAngle * 50;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const currentMessageText = ROMANTIC_MESSAGES[msgIdx];

  return (
    <div
      className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between select-none overflow-hidden touch-none"
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onPointerCancel={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      {/* Background Space Nebulas */}
      <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-radial from-purple-900/20 via-pink-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-radial from-amber-900/15 via-blue-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Canvas for Galaxy Stars & Motion Trails */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

      {/* Header Badge */}
      <div className="relative z-20 mt-12 sm:mt-16 text-center px-4 max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 text-amber-200 text-xs font-serif-classic uppercase tracking-wider backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
          <span>{isPressing ? 'Lo eres todo para mi' : 'Soy un caos sin ti'}</span>
        </div>
      </div>

      {/* Center Interactive Text / Message */}
      <div className="relative z-30 my-auto flex flex-col items-center justify-center p-6 text-center max-w-lg">
        <div
          className={`transition-all duration-300 transform ${
            isPressing ? 'scale-105' : 'scale-100'
          }`}
        >
          {isPressing ? (
            <div className="space-y-3 text-center animate-fade-in">
              <div className="inline-flex p-2.5 rounded-full bg-amber-400/20 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-500/40 animate-bounce" />
              </div>
              <p className="font-serif-classic italic text-xl sm:text-3xl text-amber-100 drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)] leading-relaxed max-w-md px-2">
                "{currentMessageText}"
              </p>
              <p className="text-[10px] sm:text-xs text-amber-300/80 font-sans-body uppercase tracking-widest pt-1">
                (Suelta para dejarme hecho un caos)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3.5 rounded-full bg-white/5 backdrop-blur-md animate-pulse">
                <Sparkles className="w-7 h-7 text-amber-300" />
              </div>
              <span className="font-serif-classic text-2xl sm:text-3xl text-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-wide font-medium">
                {hasPressedOnce ? 'Mantén presionado otra vez' : 'Mantén presionado'}
              </span>
              <span className="text-xs text-amber-200/60 font-sans-body uppercase tracking-widest">
                (Manten para ver otras frases)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action / Continuation Bar */}
      <div className="relative z-20 mb-16 sm:mb-8 flex flex-col items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-full border border-amber-400/40 bg-slate-900/80 hover:bg-slate-800 text-amber-100 font-serif-classic text-xs sm:text-sm uppercase tracking-widest transition-all backdrop-blur-md shadow-lg flex items-center gap-2 active:scale-95"
        >
          <span>Continuar a las Estrellas</span>
          <ChevronRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};


import React, { useEffect, useRef, useState } from 'react';
import { AppConfig } from '../types';
import { ChevronRight, Waves, Sparkles } from 'lucide-react';

interface Screen3Props {
  config: AppConfig;
  onNext: () => void;
}

interface Jellyfish {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  swayFreq: number;
  swayAmp: number;
  pulseFreq: number;
  tentaclePhase: number;
  hue: number;
  alpha: number;
  depth: number; // 0: background, 1: midground, 2: foreground
  type: 'moon' | 'nettle' | 'comb' | 'crystal' | 'flower' | 'crown' | 'cosmic';
  clickGlow: number; // transient glow boost on interaction
}

export const Screen3Jellyfish: React.FC<Screen3Props> = ({ config, onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visibleMessagesCount, setVisibleMessagesCount] = useState<number>(0);
  const [ripples, setRipples] = useState<{ x: number; y: number; r: number; opacity: number }[]>([]);
  const jelliesRef = useRef<Jellyfish[]>([]);

  // Sequential message timer
  useEffect(() => {
    const totalMsgs = config.screen3Messages.length;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleMessagesCount(current);
      if (current >= totalMsgs) {
        clearInterval(interval);
      }
    }, 1600);

    return () => clearInterval(interval);
  }, [config.screen3Messages]);

  // Deep Sea Jellyfish Canvas
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

    const SPECIES_TYPES: ('moon' | 'nettle' | 'comb' | 'crystal' | 'flower' | 'crown' | 'cosmic')[] = [
      'moon',
      'nettle',
      'comb',
      'crystal',
      'flower',
      'crown',
      'cosmic',
    ];

    // Initialize multi-layer Jellyfish population
    const jellyCount = w < 600 ? 18 : 32;
    const jellies: Jellyfish[] = Array.from({ length: jellyCount }, (_, i) => {
      const type = SPECIES_TYPES[i % SPECIES_TYPES.length];
      const depth = i % 3; // 0: back, 1: mid, 2: front
      
      let sizeMin = 18;
      let sizeMax = 38;
      let defaultHue = 200;

      if (type === 'moon') { defaultHue = 270; sizeMin = 26; sizeMax = 52; }
      else if (type === 'nettle') { defaultHue = 32; sizeMin = 30; sizeMax = 60; }
      else if (type === 'comb') { defaultHue = 180; sizeMin = 22; sizeMax = 44; }
      else if (type === 'crystal') { defaultHue = 160; sizeMin = 25; sizeMax = 50; }
      else if (type === 'flower') { defaultHue = 310; sizeMin = 20; sizeMax = 42; }
      else if (type === 'crown') { defaultHue = 340; sizeMin = 24; sizeMax = 48; }
      else if (type === 'cosmic') { defaultHue = 290; sizeMin = 28; sizeMax = 56; }

      const scaleByDepth = depth === 0 ? 0.6 : depth === 1 ? 0.85 : 1.15;
      const size = (sizeMin + Math.random() * (sizeMax - sizeMin)) * scaleByDepth;

      return {
        x: Math.random() * w,
        y: Math.random() * (h * 1.5),
        size,
        speed: (0.18 + Math.random() * 0.28) * (depth === 0 ? 0.65 : depth === 1 ? 0.9 : 1.2),
        phase: Math.random() * Math.PI * 2,
        swayFreq: 0.2 + Math.random() * 0.2,
        swayAmp: 10 + Math.random() * 25,
        pulseFreq: 0.4 + Math.random() * 0.3,
        tentaclePhase: Math.random() * Math.PI * 2,
        hue: defaultHue + (Math.random() - 0.5) * 20,
        alpha: depth === 0 ? 0.35 : depth === 1 ? 0.6 : 0.85,
        depth,
        type,
        clickGlow: 0,
      };
    });

    // Sort jellies by depth so background renders first
    jellies.sort((a, b) => a.depth - b.depth);
    jelliesRef.current = jellies;

    // Glowing Marine Snow / Plankton Particles
    const planktonCount = w < 600 ? 50 : 90;
    const plankton = Array.from({ length: planktonCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 0.5 + Math.random() * 2.5,
      speed: 0.2 + Math.random() * 0.6,
      sway: Math.random() * Math.PI * 2,
      hue: 160 + Math.random() * 140,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Deep Sea Gradient with subtle cyan pulse
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#010c14');
      bgGrad.addColorStop(0.4, '#031724');
      bgGrad.addColorStop(0.8, '#082638');
      bgGrad.addColorStop(1, '#0c354a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Sunlight Rays / Surface Caustics
      ctx.fillStyle = 'rgba(120, 255, 235, 0.025)';
      for (let i = 0; i < 5; i++) {
        const xOffset = Math.sin(time * 0.15 + i * 1.5) * 80;
        ctx.beginPath();
        ctx.moveTo(w * 0.18 * i + xOffset, 0);
        ctx.lineTo(w * 0.22 * i + xOffset + 140, h);
        ctx.lineTo(w * 0.22 * i + xOffset + 40, h);
        ctx.closePath();
        ctx.fill();
      }

      // Render Floating Plankton / Marine Snow
      plankton.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time * 0.5 + p.sway) * 0.4;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        const pAlpha = p.alpha * (0.6 + Math.sin(time * 2 + p.sway) * 0.4);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 80%, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Jellyfish
      jellies.forEach((j) => {
        // Propulsion Cycle: contracting pulse phase vs gliding phase
        const pulseCycle = (Math.sin(time * j.pulseFreq * Math.PI * 2 + j.phase) + 1) / 2; // 0..1
        const squeeze = Math.pow(pulseCycle, 2); // sharp contraction
        
        // Vertical propulsion thrust
        const thrust = squeeze * 0.4;
        j.y -= (j.speed + thrust);

        if (j.y < -j.size * 3) {
          j.y = h + j.size * 2;
          j.x = Math.random() * w;
        }

        // Decay click glow
        if (j.clickGlow > 0) j.clickGlow = Math.max(0, j.clickGlow - 0.02);

        // Horizontal sway
        const sway = Math.sin(time * j.swayFreq + j.phase) * j.swayAmp;
        const x = j.x + sway;
        const y = j.y;

        // Dome proportions during contraction (squeezes narrow & taller during pulse)
        const rx = j.size * (0.65 - squeeze * 0.15);
        const ry = j.size * (0.5 + squeeze * 0.2);

        ctx.save();
        ctx.translate(x, y);

        const totalAlpha = Math.min(1, j.alpha + j.clickGlow);
        ctx.globalAlpha = totalAlpha;

        // 1. Ambient Outer Bioluminescent Glow
        const glowRadius = j.size * (1.6 + squeeze * 0.4);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glow.addColorStop(0, `hsla(${j.hue}, 90%, 85%, ${0.45 + j.clickGlow * 0.5})`);
        glow.addColorStop(0.5, `hsla(${j.hue}, 80%, 65%, 0.18)`);
        glow.addColorStop(1, `hsla(${j.hue}, 80%, 50%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Specific Jellyfish Species Features
        if (j.type === 'comb') {
          // COMB JELLY: Translucent oval body with rainbow light strips (ctenes)
          const bodyGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, rx * 1.1);
          bodyGrad.addColorStop(0, 'rgba(235, 250, 255, 0.85)');
          bodyGrad.addColorStop(0.6, 'rgba(160, 230, 255, 0.4)');
          bodyGrad.addColorStop(1, 'rgba(100, 200, 255, 0)');
          ctx.fillStyle = bodyGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rainbow Ctenes (Comb Rows)
          const rowCount = 6;
          for (let r = 0; r < rowCount; r++) {
            const frac = (r / (rowCount - 1) - 0.5) * 1.6;
            const rxLine = rx * 0.8 * Math.cos(frac * 0.8);
            const lineHue = (time * 120 + r * 50) % 360;
            
            ctx.strokeStyle = `hsla(${lineHue}, 95%, 75%, 0.95)`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(frac * rx * 0.7, 0, Math.abs(rxLine * 0.15), ry * 1.1, 0, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
          }

        } else if (j.type === 'moon') {
          // MOON JELLY: Translucent dome + 4 horseshoe gonad rings inside
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.3, 2, 0, 0, rx);
          domeGrad.addColorStop(0, `hsla(${j.hue}, 85%, 94%, 0.9)`);
          domeGrad.addColorStop(0.7, `hsla(${j.hue}, 80%, 75%, 0.5)`);
          domeGrad.addColorStop(1, `hsla(${j.hue}, 70%, 65%, 0.1)`);
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, 0);
          ctx.fill();

          // 4 Inner Clover/Horseshoe Rings
          ctx.strokeStyle = `hsla(${j.hue + 20}, 90%, 85%, 0.85)`;
          ctx.lineWidth = 2;
          for (let c = 0; c < 4; c++) {
            const angle = (c * Math.PI) / 2 + Math.PI / 4;
            const cx = Math.cos(angle) * (rx * 0.35);
            const cy = -ry * 0.45 + Math.sin(angle) * (ry * 0.25);
            ctx.beginPath();
            ctx.arc(cx, cy, rx * 0.18, 0, Math.PI * 2);
            ctx.stroke();
          }

        } else if (j.type === 'nettle') {
          // PACIFIC SEA NETTLE: Cap with radial amber stripes
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.2, 0, 0, 0, rx);
          domeGrad.addColorStop(0, 'hsla(38, 95%, 90%, 0.95)');
          domeGrad.addColorStop(0.6, 'hsla(28, 90%, 65%, 0.7)');
          domeGrad.addColorStop(1, 'hsla(18, 85%, 50%, 0.2)');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, 0);
          ctx.fill();

          // Cap Radial Stripes
          ctx.strokeStyle = 'hsla(15, 95%, 45%, 0.6)';
          ctx.lineWidth = 1.8;
          for (let s = -3; s <= 3; s++) {
            const sx = (s / 3.5) * rx;
            ctx.beginPath();
            ctx.moveTo(0, -ry * 0.95);
            ctx.quadraticCurveTo(sx * 0.5, -ry * 0.5, sx, 0);
            ctx.stroke();
          }

        } else if (j.type === 'crystal') {
          // CRYSTAL EMERALD JELLY: Mint translucent bell with radiant radial rib lines
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.2, 0, 0, 0, rx);
          domeGrad.addColorStop(0, 'hsla(160, 90%, 92%, 0.95)');
          domeGrad.addColorStop(0.6, 'hsla(165, 85%, 70%, 0.6)');
          domeGrad.addColorStop(1, 'hsla(170, 80%, 50%, 0.15)');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, 0);
          ctx.fill();

          // Radiant Ribs
          ctx.strokeStyle = 'hsla(150, 100%, 85%, 0.85)';
          ctx.lineWidth = 1.5;
          for (let r = 0; r < 8; r++) {
            const off = ((r / 7) - 0.5) * rx * 1.8;
            ctx.beginPath();
            ctx.moveTo(0, -ry * 0.9);
            ctx.lineTo(off, 0);
            ctx.stroke();
          }

        } else if (j.type === 'flower') {
          // FLOWER HAT JELLY: Neon rim + striped cap
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.3, 0, 0, 0, rx);
          domeGrad.addColorStop(0, 'hsla(320, 95%, 92%, 0.95)');
          domeGrad.addColorStop(0.7, 'hsla(290, 80%, 65%, 0.65)');
          domeGrad.addColorStop(1, 'hsla(270, 90%, 55%, 0.3)');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, 0);
          ctx.fill();

          // Neon Pink Rim
          ctx.strokeStyle = 'hsla(330, 100%, 75%, 0.95)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry * 0.15, 0, 0, Math.PI);
          ctx.stroke();

        } else if (j.type === 'crown') {
          // CROWN JELLY: Dark crimson cap with crown notch
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.4, 0, 0, 0, rx);
          domeGrad.addColorStop(0, 'hsla(340, 100%, 85%, 0.95)');
          domeGrad.addColorStop(0.5, 'hsla(330, 90%, 45%, 0.8)');
          domeGrad.addColorStop(1, 'hsla(320, 80%, 25%, 0.3)');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, -ry * 0.2, rx, ry * 0.8, 0, Math.PI, 0);
          ctx.fill();

          // Crown groove
          ctx.fillStyle = 'hsla(350, 100%, 75%, 0.9)';
          ctx.fillRect(-rx * 0.8, -ry * 0.2, rx * 1.6, ry * 0.15);

        } else {
          // COSMIC NEON PINK JELLY: High luminosity glowing dome
          const domeGrad = ctx.createRadialGradient(0, -ry * 0.3, 0, 0, 0, rx);
          domeGrad.addColorStop(0, 'hsla(295, 100%, 95%, 0.95)');
          domeGrad.addColorStop(0.5, 'hsla(285, 90%, 75%, 0.7)');
          domeGrad.addColorStop(1, 'hsla(275, 80%, 60%, 0.1)');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, 0);
          ctx.fill();
        }

        // 3. Inner Flowing Frilly Oral Arms (Central tentacles)
        ctx.fillStyle = `hsla(${j.hue}, 85%, 90%, 0.45)`;
        const armCount = j.type === 'nettle' ? 4 : 3;
        for (let a = 0; a < armCount; a++) {
          const aOff = (a / (armCount - 1 || 1) - 0.5) * rx * 0.6;
          const aWig = Math.sin(time * 2 + a + j.tentaclePhase) * (rx * 0.25);
          const aLen = j.size * (1.1 + (a % 2) * 0.3);

          ctx.beginPath();
          ctx.moveTo(aOff, 0);
          ctx.bezierCurveTo(
            aOff + aWig * 1.5,
            aLen * 0.3,
            aOff - aWig * 1.5,
            aLen * 0.7,
            aOff + aWig * 0.5,
            aLen
          );
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = `hsla(${j.hue}, 80%, 88%, 0.4)`;
          ctx.stroke();
        }

        // 4. Fine Trailing Outer Edge Tentacles
        const tCount = j.type === 'flower' ? 12 : j.type === 'moon' ? 10 : 7;
        ctx.lineWidth = j.type === 'crown' ? 1.2 : 1.5;

        for (let k = 0; k < tCount; k++) {
          const tFrac = k / (tCount - 1);
          const tOff = (tFrac - 0.5) * rx * 1.8;
          
          // Wave dynamics react to propulsion squeeze
          const flex = (1 + squeeze * 0.8);
          const wig1 = Math.sin(time * 2.5 + k * 0.8 + j.tentaclePhase) * (j.size * 0.22 * flex);
          const wig2 = Math.cos(time * 2 + k * 1.1 + j.tentaclePhase) * (j.size * 0.3 * flex);
          
          let tLen = j.size * (1.3 + (k % 3) * 0.35);
          
          // Special long trailing tentacle for Crown Jelly
          if (j.type === 'crown' && k === tCount - 1) {
            tLen = j.size * 3.2;
            ctx.strokeStyle = 'hsla(350, 100%, 85%, 0.95)';
          } else if (j.type === 'flower') {
            // Curling neon tips for Flower Hat Jelly
            ctx.strokeStyle = k % 2 === 0 ? 'hsla(330, 100%, 80%, 0.85)' : 'hsla(280, 90%, 85%, 0.7)';
          } else {
            ctx.strokeStyle = `hsla(${j.hue}, 80%, 88%, 0.55)`;
          }

          ctx.beginPath();
          ctx.moveTo(tOff, 0);
          ctx.quadraticCurveTo(tOff + wig1, tLen * 0.5, tOff + wig2, tLen);
          ctx.stroke();
        }

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((prev) => [...prev.slice(-6), { x, y, r: 10, opacity: 0.95 }]);

    // Trigger bioluminescent glow response in nearby jellyfish when clicked
    jelliesRef.current.forEach((j) => {
      const dist = Math.hypot(j.x - x, j.y - y);
      if (dist < 180) {
        j.clickGlow = 0.85;
      }
    });
  };

  return (
    <div
      onClick={handleCanvasClick}
      className="relative w-full h-full min-h-[100dvh] bg-slate-950 text-cyan-100 flex flex-col items-center justify-between pt-12 pb-24 sm:pb-12 px-3 select-none overflow-hidden cursor-pointer"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Ripple Animation Effects */}
      {ripples.map((rip, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-300/80 pointer-events-none z-20 animate-ping"
          style={{
            left: rip.x - 30,
            top: rip.y - 30,
            width: 60,
            height: 60,
            boxShadow: '0 0 25px rgba(120,255,235,0.6)',
          }}
        />
      ))}

      {/* Top Interactive Tip Badge */}
      <div className="relative z-20 mt-1 sm:mt-4 text-center px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-cyan-300/30 bg-cyan-950/70 text-cyan-200 text-[10px] xs:text-[11px] sm:text-sm font-serif-classic uppercase tracking-wider backdrop-blur-md shadow-[0_0_20px_rgba(0,200,255,0.2)] max-w-[90vw] truncate">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
          <span className="truncate">Toca a las medusas!</span>
        </div>
      </div>

      <div className="relative z-20 my-auto text-center max-w-2xl px-2 space-y-3 sm:space-y-6">
        <Waves className="w-5 h-5 sm:w-8 sm:h-8 text-cyan-300/80 mx-auto animate-pulse" />

        <div className="space-y-2.5 sm:space-y-4">
          {config.screen3Messages.map((msg, idx) => {
            const isVisible = idx < visibleMessagesCount;
            return (
              <p
                key={idx}
                className={`font-serif-classic italic text-base xs:text-lg sm:text-2xl md:text-3xl text-cyan-50 drop-shadow-[0_0_25px_rgba(120,255,235,0.6)] leading-relaxed transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                "{msg}"
              </p>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="mb-4 sm:mb-10 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-cyan-300/50 bg-cyan-500/20 text-cyan-100 font-serif-classic text-xs sm:text-sm uppercase tracking-widest hover:bg-cyan-500/35 hover:border-cyan-200 transition-all shadow-[0_0_25px_rgba(111,255,230,0.4)] flex items-center gap-2"
        >
          Continuar <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { AppConfig } from '../types';
import { ChevronRight, Sun, Sparkles } from 'lucide-react';

interface Screen4Props {
  config: AppConfig;
  onNext: () => void;
}

export const Screen4Lilies: React.FC<Screen4Props> = ({ config, onNext }) => {
  const [visibleMessagesCount, setVisibleMessagesCount] = useState<number>(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const totalMsgs = config.screen4Messages.length;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleMessagesCount(current);
      if (current >= totalMsgs) {
        clearInterval(interval);
      }
    }, 1600);

    return () => clearInterval(interval);
  }, [config.screen4Messages]);

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparkle = { id: Date.now(), x, y };
    setSparkles((prev) => [...prev.slice(-10), newSparkle]);
  };

  // Generate Swaying Stargazer Lilies SVG markup
  const lilyCount = typeof window !== 'undefined' && window.innerWidth < 600 ? 16 : 28;
  const lilyElements = [];

  // Strictly Amarillos (Yellow), Rosas (Pink), Lilas (Lilac/Purple), and Blancos (White)
  const LILY_PALETTES = [
    // 0: Amarillo Sol (Vibrant Golden Yellow)
    { main: '#facc15', edge: '#fefce8', throat: '#84cc16', spot: '#ca8a04', stamen: '#ffffff', pollen: '#78350f' },
    // 1: Rosa Encantador (Vibrant Pink)
    { main: '#ec4899', edge: '#fdf2f8', throat: '#a3e635', spot: '#9f1239', stamen: '#fde047', pollen: '#78350f' },
    // 2: Lila Mágico (Vibrant Lilac / Lavender)
    { main: '#c084fc', edge: '#faf5ff', throat: '#a3e635', spot: '#6b21a8', stamen: '#fef08a', pollen: '#713f12' },
    // 3: Blanco Puro (Pristine White with Soft Pink Spots)
    { main: '#ffffff', edge: '#f8fafc', throat: '#84cc16', spot: '#f43f5e', stamen: '#fde047', pollen: '#854d0e' },
  ];

  for (let i = 0; i < lilyCount; i++) {
    const x = (i / lilyCount) * 1000 + (Math.sin(i * 4) * 18) + 15;
    const height = 210 + (i % 5) * 28;
    const baseY = 380;
    const topY = baseY - height;
    const sway = 5 + (i % 4) * 3;
    const dur = 3.2 + (i % 3) * 0.9;
    const delay = (i % 5) * 0.4;

    // Direct sequential cycling guarantees equal count of Yellow, Pink, Lilac, White
    const pal = LILY_PALETTES[i % LILY_PALETTES.length];
    const stemColor = '#2d5320';
    const leafColor = '#386328';
    const leafVein = '#589140';

    lilyElements.push(
      <g
        key={i}
        style={{
          transformOrigin: `${x}px ${baseY}px`,
          animation: `sway${i % 3} ${dur}s ease-in-out ${delay}s infinite`,
        }}
      >
        {/* Curved Stem */}
        <path
          d={`M ${x} ${baseY} Q ${x + sway * 1.8} ${baseY - height * 0.5} ${x} ${topY}`}
          stroke={stemColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Lower Lanceolate Leaf Left */}
        <path
          d={`M ${x} ${baseY - height * 0.3} Q ${x - 45} ${baseY - height * 0.35} ${x - 55} ${baseY - height * 0.22} Q ${x - 20} ${baseY - height * 0.22} ${x} ${baseY - height * 0.3}`}
          fill={leafColor}
        />
        <path
          d={`M ${x} ${baseY - height * 0.3} Q ${x - 30} ${baseY - height * 0.32} ${x - 55} ${baseY - height * 0.22}`}
          stroke={leafVein}
          strokeWidth="1.2"
          fill="none"
        />

        {/* Middle Lanceolate Leaf Right */}
        <path
          d={`M ${x} ${baseY - height * 0.55} Q ${x + 45} ${baseY - height * 0.6} ${x + 58} ${baseY - height * 0.48} Q ${x + 20} ${baseY - height * 0.48} ${x} ${baseY - height * 0.55}`}
          fill={leafColor}
        />
        <path
          d={`M ${x} ${baseY - height * 0.55} Q ${x + 30} ${baseY - height * 0.58} ${x + 58} ${baseY - height * 0.48}`}
          stroke={leafVein}
          strokeWidth="1.2"
          fill="none"
        />

        {/* Upper Lanceolate Leaf Left */}
        <path
          d={`M ${x} ${baseY - height * 0.75} Q ${x - 35} ${baseY - height * 0.8} ${x - 45} ${baseY - height * 0.7} Q ${x - 15} ${baseY - height * 0.7} ${x} ${baseY - height * 0.75}`}
          fill={leafColor}
        />

        {/* Green Flower Calyx Bud Base */}
        <path
          d={`M ${x - 6} ${topY + 6} L ${x + 6} ${topY + 6} L ${x} ${topY + 16} Z`}
          fill={stemColor}
        />

        {/* --- STARGAZER LILY FLOWER HEAD (6 Recurved Petals + Freckles + Stamens) --- */}
        <g transform={`translate(${x}, ${topY}) scale(${0.85 + (i % 4) * 0.1})`}>
          {/* Back 3 Petals (Outer layer) */}
          <path
            d="M 0 0 Q -18 -38 0 -68 Q 18 -38 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2"
          />
          <path d="M 0 0 Q -10 -35 0 -62" stroke={pal.edge} strokeWidth="1" opacity="0.6" fill="none" />

          {/* Top Left Recurved Petal */}
          <path
            d="M 0 0 Q -50 -30 -62 -12 Q -30 10 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2"
          />

          {/* Top Right Recurved Petal */}
          <path
            d="M 0 0 Q 50 -30 62 -12 Q 30 10 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2"
          />

          {/* Front 3 Petals (Larger, flared, curved with light edges) */}
          <path
            d="M 0 0 Q -55 15 -58 42 Q -22 35 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2.5"
          />

          <path
            d="M 0 0 Q 55 15 58 42 Q 22 35 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2.5"
          />

          <path
            d="M 0 0 Q -22 45 0 65 Q 22 45 0 0"
            fill={pal.main}
            stroke={pal.edge}
            strokeWidth="2.5"
          />

          {/* Petal Central Veins & Light Ruffled Edges */}
          <path d="M 0 0 Q -28 10 -48 30" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" fill="none" />
          <path d="M 0 0 Q 28 10 48 30" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" fill="none" />
          <path d="M 0 0 Q -12 32 0 52" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" fill="none" />

          {/* Freckles / Spots (Maculae) on Petals */}
          <circle cx="-12" cy="-22" r="1.3" fill={pal.spot} />
          <circle cx="-8" cy="-32" r="1" fill={pal.spot} />
          <circle cx="10" cy="-24" r="1.3" fill={pal.spot} />
          <circle cx="6" cy="-35" r="1" fill={pal.spot} />
          <circle cx="-25" cy="-8" r="1.2" fill={pal.spot} />
          <circle cx="-38" cy="-10" r="1" fill={pal.spot} />
          <circle cx="25" cy="-8" r="1.2" fill={pal.spot} />
          <circle cx="38" cy="-10" r="1" fill={pal.spot} />
          <circle cx="-22" cy="18" r="1.3" fill={pal.spot} />
          <circle cx="-35" cy="25" r="1" fill={pal.spot} />
          <circle cx="22" cy="18" r="1.3" fill={pal.spot} />
          <circle cx="35" cy="25" r="1" fill={pal.spot} />
          <circle cx="-6" cy="28" r="1.2" fill={pal.spot} />
          <circle cx="4" cy="36" r="1.2" fill={pal.spot} />

          {/* Bright Lime-Green Throat Star in Center */}
          <path
            d="M 0 0 L -8 -8 L 0 -14 L 8 -8 Z M 0 0 L -12 2 L -8 10 L 0 4 Z M 0 0 L 12 2 L 8 10 L 0 4 Z"
            fill={pal.throat}
            opacity="0.9"
          />
          <circle cx="0" cy="0" r="5" fill={pal.throat} />

          {/* Long Prominent Stamens / Filaments with Pollen Heads */}
          <path d="M 0 0 Q -15 -18 -26 -28" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="-31" y="-32" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(-30 -26 -28)" />

          <path d="M 0 0 Q 15 -18 26 -28" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="22" y="-32" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(30 26 -28)" />

          <path d="M 0 0 Q -24 -2 -38 -6" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="-44" y="-9" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(-10 -38 -6)" />

          <path d="M 0 0 Q 24 -2 38 -6" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="35" y="-9" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(10 38 -6)" />

          <path d="M 0 0 Q -18 18 -28 32" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="-33" y="30" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(40 -28 32)" />

          <path d="M 0 0 Q 18 18 28 32" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="24" y="30" width="9" height="4" rx="2" fill={pal.pollen} transform="rotate(-40 28 32)" />

          {/* Central Green Style & Stigma (Pistil) */}
          <path d="M 0 0 Q 0 10 0 24" stroke="#84cc16" strokeWidth="2.5" fill="none" />
          <circle cx="0" cy="25" r="3" fill="#4d7c0f" />
        </g>
      </g>
    );
  }

  // Pollen & Light Particles floating in daytime air
  const pollenParticles = Array.from({ length: 25 }, (_, idx) => {
    const left = `${(idx * 4.1 + Math.sin(idx) * 10) % 100}%`;
    const bottom = `${(idx * 2.5 + Math.cos(idx) * 15) % 70}%`;
    const durY = 3.5 + (idx % 4) * 0.8;
    const durX = 4.5 + (idx % 5) * 0.9;
    const delay = -(idx % 6);

    return (
      <div
        key={idx}
        className="absolute w-2 h-2 bg-amber-200/90 rounded-full shadow-[0_0_10px_3px_rgba(253,224,71,0.8)] pointer-events-none z-10"
        style={{
          left,
          bottom,
          animation: `floatY ${durY}s ease-in-out ${delay}s infinite alternate, floatX ${durX}s ease-in-out ${delay}s infinite alternate`,
        }}
      />
    );
  });

  // Butterfly Configuration with vibrant colors and motion keyframe names
  const butterflies = [
    { id: 'b1', name: 'flyButterfly1', color: '#f59e0b', secColor: '#fef08a', scale: 1.1, dur: '14s', delay: '0s' },
    { id: 'b2', name: 'flyButterfly2', color: '#ec4899', secColor: '#fbcfe8', scale: 1.0, dur: '17s', delay: '-3s' },
    { id: 'b3', name: 'flyButterfly3', color: '#0284c7', secColor: '#e0f2fe', scale: 1.15, dur: '15s', delay: '-6s' },
    { id: 'b4', name: 'flyButterfly4', color: '#a855f7', secColor: '#f3e8ff', scale: 1.05, dur: '18s', delay: '-9s' },
    { id: 'b5', name: 'flyButterfly5', color: '#ea580c', secColor: '#ffedd5', scale: 0.95, dur: '16s', delay: '-4s' },
    { id: 'b6', name: 'flyButterfly6', color: '#10b981', secColor: '#d1fae5', scale: 1.0, dur: '19s', delay: '-11s' },
  ];

  return (
    <div
      onClick={handleFieldClick}
      onTouchStart={(e) => {
        if (e.touches[0]) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;
          setSparkles((prev) => [...prev.slice(-10), { id: Date.now(), x, y }]);
        }
      }}
      className="relative w-full h-full min-h-[100dvh] bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] via-45% to-[#dbeafe] text-slate-800 flex flex-col items-center justify-between pt-8 pb-24 sm:pb-12 px-3 select-none overflow-hidden cursor-pointer"
    >
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes sway0 { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes sway1 { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(4deg); } }
        @keyframes sway2 { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(2deg); } }

        @keyframes flapL {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(65deg); }
        }
        @keyframes flapR {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-65deg); }
        }

        /* Wide Full-Screen Flight Paths across viewport */
        @keyframes flyButterfly1 {
          0% { transform: translate(5vw, 15vh) rotate(-5deg); }
          25% { transform: translate(35vw, 40vh) rotate(12deg); }
          50% { transform: translate(75vw, 18vh) rotate(-15deg); }
          75% { transform: translate(85vw, 55vh) rotate(10deg); }
          100% { transform: translate(15vw, 30vh) rotate(-8deg); }
        }
        @keyframes flyButterfly2 {
          0% { transform: translate(92vw, 35vh) rotate(10deg); }
          30% { transform: translate(50vw, 12vh) rotate(-12deg); }
          60% { transform: translate(15vw, 48vh) rotate(18deg); }
          100% { transform: translate(80vw, 22vh) rotate(-6deg); }
        }
        @keyframes flyButterfly3 {
          0% { transform: translate(10vw, 60vh) rotate(-12deg); }
          35% { transform: translate(45vw, 25vh) rotate(10deg); }
          70% { transform: translate(82vw, 65vh) rotate(-18deg); }
          100% { transform: translate(25vw, 15vh) rotate(8deg); }
        }
        @keyframes flyButterfly4 {
          0% { transform: translate(80vw, 15vh) rotate(8deg); }
          40% { transform: translate(20vw, 50vh) rotate(-16deg); }
          75% { transform: translate(65vw, 70vh) rotate(12deg); }
          100% { transform: translate(88vw, 28vh) rotate(-5deg); }
        }
        @keyframes flyButterfly5 {
          0% { transform: translate(40vw, 70vh) rotate(-8deg); }
          33% { transform: translate(12vw, 20vh) rotate(15deg); }
          66% { transform: translate(78vw, 15vh) rotate(-12deg); }
          100% { transform: translate(85vw, 60vh) rotate(8deg); }
        }
        @keyframes flyButterfly6 {
          0% { transform: translate(20vw, 25vh) rotate(15deg); }
          35% { transform: translate(65vw, 55vh) rotate(-10deg); }
          70% { transform: translate(30vw, 75vh) rotate(14deg); }
          100% { transform: translate(75vw, 20vh) rotate(-8deg); }
        }
      `}</style>

      {/* Bright Daytime Sun Glow in Corner */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-12 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-yellow-100/90 shadow-[0_0_90px_45px_rgba(253,224,71,0.7)] pointer-events-none z-0 flex items-center justify-center animate-pulse">
        <Sun className="w-16 h-16 sm:w-24 sm:h-24 text-amber-300 opacity-80 animate-spin-slow" />
      </div>

      {/* Fluffy Daytime Sky Clouds */}
      <div className="absolute top-12 left-[-10%] w-60 sm:w-96 h-20 bg-white/60 rounded-full blur-xl pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-28 right-[15%] w-72 sm:w-[32rem] h-24 bg-white/70 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="absolute top-6 left-[35%] w-48 sm:w-80 h-16 bg-white/50 rounded-full blur-lg pointer-events-none z-0" />

      {/* Floating Pollen Particles */}
      {pollenParticles}

      {/* Fluttering Butterflies Traveling Full Screen */}
      {butterflies.map((b) => (
        <div
          key={b.id}
          className="absolute top-0 left-0 z-30 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          style={{
            animation: `${b.name} ${b.dur} linear ${b.delay} infinite alternate`,
          }}
        >
          <div
            style={{
              transform: `scale(${b.scale})`,
            }}
            className="relative flex items-center justify-center"
          >
            {/* SVG Butterfly with 3D Flapping Wings */}
            <svg viewBox="0 0 70 60" className="w-14 h-12 sm:w-16 sm:h-14 overflow-visible">
              {/* Left Wing */}
              <g style={{ transformOrigin: '35px 30px', animation: 'flapL 0.3s ease-in-out infinite' }}>
                <path d="M 35 30 Q 5 0 2 25 Q 18 45 35 30 Z" fill={b.color} opacity="0.95" />
                <path d="M 35 30 Q 12 34 10 52 Q 28 54 35 30 Z" fill={b.secColor} opacity="0.85" />
                <circle cx="14" cy="18" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="8" cy="28" r="1.8" fill="#ffffff" opacity="0.9" />
              </g>
              {/* Right Wing */}
              <g style={{ transformOrigin: '35px 30px', animation: 'flapR 0.3s ease-in-out infinite' }}>
                <path d="M 35 30 Q 65 0 68 25 Q 52 45 35 30 Z" fill={b.color} opacity="0.95" />
                <path d="M 35 30 Q 58 34 60 52 Q 42 54 35 30 Z" fill={b.secColor} opacity="0.85" />
                <circle cx="56" cy="18" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="62" cy="28" r="1.8" fill="#ffffff" opacity="0.9" />
              </g>
              {/* Butterfly Body & Antennae */}
              <ellipse cx="35" cy="30" rx="2.5" ry="14" fill="#1e1e1e" />
              <path d="M 35 17 Q 28 8 22 6" stroke="#1e1e1e" strokeWidth="1.5" fill="none" />
              <path d="M 35 17 Q 42 8 48 6" stroke="#1e1e1e" strokeWidth="1.5" fill="none" />
              <circle cx="21" cy="5" r="1.5" fill="#1e1e1e" />
              <circle cx="49" cy="5" r="1.5" fill="#1e1e1e" />
            </svg>
          </div>
        </div>
      ))}

      {/* Touch Sparkles */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="absolute w-5 h-5 bg-amber-300 rounded-full blur-xs animate-ping pointer-events-none z-30"
          style={{ left: sp.x - 10, top: sp.y - 10 }}
        />
      ))}

      {/* Top Messages (UNFRAMED - directly on daytime background as requested) */}
      <div className="relative z-20 mt-2 sm:mt-6 text-center max-w-2xl px-4 space-y-3 sm:space-y-5">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/40 border border-amber-400/50 shadow-[0_2px_12px_rgba(251,191,36,0.3)] backdrop-blur-xs">
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600 animate-spin-slow" />
        </div>

        <div className="space-y-2 sm:space-y-4">
          {config.screen4Messages.map((msg, idx) => {
            const isVisible = idx < visibleMessagesCount;
            return (
              <p
                key={idx}
                className={`font-serif-classic italic text-lg xs:text-xl sm:text-3xl md:text-4xl text-slate-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)] leading-relaxed transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                "{msg}"
              </p>
            );
          })}
        </div>
      </div>

      {/* Ground Meadow SVG Layer (Soil / Earth Layer + Grass Blades + Stargazer Lilies) */}
      <div className="absolute bottom-0 left-0 w-full h-[55vh] sm:h-[60vh] z-10 pointer-events-none">
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* 1. Deep Background Grass Mounds */}
          <path
            d="M 0 400 L 1000 400 L 1000 320 Q 750 300 500 325 Q 250 340 0 310 Z"
            fill="#234c1b"
            opacity="0.95"
          />

          {/* 2. Stargazer Lilies */}
          {lilyElements}

          {/* 3. Lush Foreground Grass Blades Layer */}
          {Array.from({ length: 65 }).map((_, gi) => {
            const gx = (gi / 65) * 1020 - 10;
            const gh = 35 + (gi % 7) * 12;
            const gCurv = (gi % 2 === 0 ? 1 : -1) * (8 + (gi % 5) * 3);
            const gColor = gi % 3 === 0 ? '#40782b' : gi % 3 === 1 ? '#2d5320' : '#5ba13c';
            return (
              <path
                key={`grass-${gi}`}
                d={`M ${gx} 370 Q ${gx + gCurv} ${370 - gh / 2} ${gx + gCurv * 1.5} ${370 - gh} Q ${gx + gCurv * 0.5} ${370 - gh / 2} ${gx + 4} 370`}
                fill={gColor}
                opacity="0.95"
              />
            );
          })}

          {/* 4. Layer of Earth / Soil (Tierra) at the Bottom Base */}
          {/* Main Soil Mound Layer */}
          <path
            d="M 0 400 L 1000 400 L 1000 365 Q 800 355 600 368 Q 400 350 200 362 Q 80 355 0 360 Z"
            fill="#2c1508"
          />
          {/* Top Rich Humus Soil Rim */}
          <path
            d="M 0 360 Q 80 355 200 362 Q 400 350 600 368 Q 800 355 1000 365 L 1000 372 Q 800 362 600 375 Q 400 357 200 370 Q 80 362 0 368 Z"
            fill="#45230f"
            opacity="0.9"
          />
          {/* Soil Granules & Pebbles Texture */}
          {Array.from({ length: 30 }).map((_, pi) => (
            <ellipse
              key={`pebble-${pi}`}
              cx={(pi * 34 + (pi % 5) * 7) % 1000}
              cy={372 + (pi % 6) * 4}
              rx={1.5 + (pi % 3)}
              ry={1 + (pi % 2)}
              fill={pi % 2 === 0 ? '#542d13' : '#1f0d04'}
              opacity="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Next Button */}
      <div className="mb-3 sm:mb-12 z-20">
        <button
          onClick={onNext}
          className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-full border border-sky-600/40 bg-white/80 text-sky-950 font-serif-classic text-xs sm:text-sm font-semibold uppercase tracking-widest hover:bg-white hover:border-sky-500 transition-all shadow-[0_4px_20px_rgba(56,189,248,0.35)] flex items-center gap-1.5"
        >
          Continuar <ChevronRight className="w-4 h-4 text-sky-600" />
        </button>
      </div>
    </div>
  );
};




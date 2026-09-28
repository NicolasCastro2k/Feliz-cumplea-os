import React, { useEffect, useRef, useState } from 'react';
import { AppConfig } from '../types';
import { audioManager } from '../services/synthAudio';
import { Play, Pause, Music, Disc, Sparkles, Palette, X } from 'lucide-react';

interface Screen7TeslaProps {
  config: AppConfig;
  isPlaying: boolean;
  activeTrackId: string | null;
  onNext?: () => void;
}

// 4 Specific requested lightning colors
const LIGHTNING_COLORS = [
  { id: 0, name: 'Azul Clásico', main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.95)', core: '#dbeafe' },
  { id: 1, name: 'Terracota', main: '#ea580c', glow: 'rgba(234, 88, 12, 0.95)', core: '#ffedd5' },
  { id: 2, name: 'Lila', main: '#c084fc', glow: 'rgba(192, 132, 252, 0.95)', core: '#f3e8ff' },
  { id: 3, name: 'Granate', main: '#e11d48', glow: 'rgba(225, 29, 72, 0.95)', core: '#ffe4e6' },
];

interface DischargeArc {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: typeof LIGHTNING_COLORS[0];
  intensity: number;
  life: number;
  maxLife: number;
  displace: number;
  seed: number;
}

export const Screen7Tesla: React.FC<Screen7TeslaProps> = ({
  config,
  isPlaying,
  activeTrackId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Find designated Tesla song index set by creator
  const teslaSongIdx = Math.max(
    0,
    config.songs.findIndex((s) => s.isSecret)
  );

  const [selectedSongIdx, setSelectedSongIdx] = useState<number>(teslaSongIdx);
  const [selectedColorMode, setSelectedColorMode] = useState<number | 'all'>('all');
  const [isColorModalOpen, setIsColorModalOpen] = useState<boolean>(false);
  
  const selectedColorModeRef = useRef<number | 'all'>('all');
  selectedColorModeRef.current = selectedColorMode;

  const currentSong = config.songs[selectedSongIdx] || config.songs[teslaSongIdx] || config.songs[0];

  // Auto-play creator's designated Tesla song when entering Screen 7
  useEffect(() => {
    const targetSong = config.songs[teslaSongIdx] || config.songs[0];
    if (targetSong && audioManager.getActiveTrackId() !== targetSong.id) {
      audioManager.playTrack(targetSong.id, targetSong.title, targetSong.file);
    }
  }, [config.songs, teslaSongIdx]);

  const handleSelectSong = (idx: number) => {
    setSelectedSongIdx(idx);
    const song = config.songs[idx];
    if (song) {
      audioManager.playTrack(song.id, song.title, song.file);
    }
  };

  // Canvas Tesla Animation Loop synchronized strictly with rhythm beats
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let h = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Detect low-power / mobile devices to scale down the most expensive canvas
    // operations (shadowBlur, recursive branching, particle counts). shadowBlur
    // in particular is very costly to render on mobile GPUs.
    const isMobile =
      window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const maxLightningDepth = isMobile ? 2 : 4;
    const maxArcCount = isMobile ? 1 : 2;
    const maxSparksPerHit = isMobile ? 2 : 4;
    // Cap the animation loop itself on mobile (~30fps instead of 60fps) to
    // roughly halve total rendering work and battery/GPU load.
    const targetFrameInterval = isMobile ? 1000 / 30 : 0;
    let lastRenderTime = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Active arcs discharging on beat hits
    let activeArcs: DischargeArc[] = [];

    // Particle sparks list
    const sparkParticles: { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }[] = [];

    // Beat detection tracking state (measured in real milliseconds, not frame
    // counts, so timing stays correct regardless of the frame-rate cap above)
    let prevIntensity = 0;
    let msSinceLastBeat = 0;
    let colorCycleIndex = 0;
    const BEAT_MIN_GAP_SHARP_MS = 130; // was "framesSinceLastBeat > 8" at ~60fps
    const BEAT_MIN_GAP_PERIODIC_MS = 230; // was "framesSinceLastBeat > 14" at ~60fps

    // Helper: Draw seeded fractal lightning path for stable, non-flickering arc rendering
    const drawLightningPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displace: number,
      colorObj: typeof LIGHTNING_COLORS[0],
      alpha: number,
      seed: number,
      depth: number = 0
    ) => {
      if (displace < 4 || depth > maxLightningDepth) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        if (!isMobile) {
          // Pass 1: Outer Plasma Glow (skipped on mobile - shadowBlur is the
          // single most expensive canvas operation on mobile GPUs)
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = colorObj.glow;
          ctx.lineWidth = Math.max(1.5, 6 / (depth + 1));
          ctx.shadowColor = colorObj.main;
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        // Pass 2: High-voltage Plasma Shaft
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = colorObj.main;
        ctx.lineWidth = isMobile ? Math.max(1.5, 5 / (depth + 1)) : Math.max(1, 3 / (depth + 1));
        ctx.shadowBlur = isMobile ? 0 : 8;
        ctx.stroke();

        // Pass 3: White-Hot Core
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(0.7, 1.5 / (depth + 1));
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
        return;
      }

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const nx = -(y2 - y1);
      const ny = x2 - x1;
      const len = Math.sqrt(nx * nx + ny * ny) || 1;

      // Pseudo-random offset based on seed to keep the arc shape coherent as it snaps
      const pseudoRand = Math.sin(seed * 12.9898 + depth * 78.233) * 43758.5453;
      const normRand = (pseudoRand - Math.floor(pseudoRand)) - 0.5;

      const offset = normRand * displace;
      const finalX = midX + (nx / len) * offset;
      const finalY = midY + (ny / len) * offset;

      drawLightningPath(x1, y1, finalX, finalY, displace / 2, colorObj, alpha, seed + 1, depth);
      drawLightningPath(finalX, finalY, x2, y2, displace / 2, colorObj, alpha, seed + 2, depth);

      // Side branch (skipped on mobile to reduce recursive draw calls)
      if (!isMobile && Math.abs(normRand) > 0.3 && depth < 1) {
        const branchAngle = Math.atan2(y2 - y1, x2 - x1) + normRand * 1.2;
        const branchLen = 30 + Math.abs(normRand) * 40;
        const branchX = finalX + Math.cos(branchAngle) * branchLen;
        const branchY = finalY + Math.sin(branchAngle) * branchLen;

        drawLightningPath(finalX, finalY, branchX, branchY, displace / 2, colorObj, alpha * 0.7, seed + 3, depth + 1);
      }
    };

    const render = (timestamp: number = 0) => {
      // On mobile, skip frames to cap the loop at ~30fps instead of the
      // browser's default ~60fps, cutting total canvas work roughly in half.
      if (isMobile && timestamp - lastRenderTime < targetFrameInterval) {
        animId = requestAnimationFrame(render);
        return;
      }
      // Real elapsed time since the last frame we actually rendered. Falls
      // back to ~16.7ms (60fps) on the very first frame.
      const deltaMs = lastRenderTime ? timestamp - lastRenderTime : 16.67;
      lastRenderTime = timestamp;

      // 1. Query real-time audio intensity
      const rawIntensity = audioManager.getAudioIntensity();
      msSinceLastBeat += deltaMs;

      // Detect beat strike onset (when audio spikes or rhythm timer hits)
      let isBeatHit = false;
      if (isPlaying) {
        const delta = rawIntensity - prevIntensity;
        // Trigger beat if there is a sharp volume rise OR periodic rhythm tick
        if (
          (delta > 0.12 && msSinceLastBeat > BEAT_MIN_GAP_SHARP_MS) ||
          (rawIntensity > 0.35 && msSinceLastBeat > BEAT_MIN_GAP_PERIODIC_MS)
        ) {
          isBeatHit = true;
          msSinceLastBeat = 0;
        }
      }
      prevIntensity = rawIntensity;

      // Clear Canvas with pitch black fade
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, w, h);

      const coilX = w / 2;
      const coilH = h < 650 ? 110 : 140;
      const coilY = h < 650 ? h * 0.82 : h * 0.78;
      const toroidX = coilX;
      const toroidY = coilY - 40 - coilH;

      // Determine active color for coil glow
      let currentColorObj: typeof LIGHTNING_COLORS[0];
      if (typeof selectedColorModeRef.current === 'number') {
        currentColorObj = LIGHTNING_COLORS[selectedColorModeRef.current] || LIGHTNING_COLORS[0];
      } else {
        currentColorObj = LIGHTNING_COLORS[colorCycleIndex % LIGHTNING_COLORS.length];
      }

      // 2. Spawn Rhythmic Arc Discharges on Beats!
      if (isPlaying && isBeatHit) {
        // Increment color cycle if mode is 'all'
        if (selectedColorModeRef.current === 'all') {
          colorCycleIndex = (colorCycleIndex + 1) % LIGHTNING_COLORS.length;
          currentColorObj = LIGHTNING_COLORS[colorCycleIndex];
        }

        // Spawn 1 to 2 distinct sharp arcs (capped at 1 on mobile)
        const arcCount = Math.min(maxArcCount, rawIntensity > 0.6 ? 2 : 1);
        for (let a = 0; a < arcCount; a++) {
          const angle = -Math.PI * 0.9 + Math.random() * (Math.PI * 0.8);
          const dist = 90 + rawIntensity * 220 + Math.random() * 60;

          const startAngle = Math.random() * Math.PI * 2;
          const startX = toroidX + Math.cos(startAngle) * 45;
          const startY = toroidY + Math.sin(startAngle) * 15;

          const targetX = toroidX + Math.cos(angle) * dist;
          const targetY = toroidY + Math.sin(angle) * dist;

          // Lives for ~130-270ms real time (was frame-counted, which broke at
          // different frame rates)
          const maxLife = 130 + Math.random() * 140;

          activeArcs.push({
            startX,
            startY,
            targetX,
            targetY,
            color: currentColorObj,
            intensity: rawIntensity,
            life: maxLife,
            maxLife,
            displace: 25 + Math.random() * 20,
            seed: Math.random() * 1000,
          });

          // Impact sparks (fewer on mobile)
          for (let s = 0; s < maxSparksPerHit; s++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = 1.5 + Math.random() * 4;
            sparkParticles.push({
              x: targetX,
              y: targetY,
              vx: Math.cos(pAngle) * pSpeed,
              vy: Math.sin(pAngle) * pSpeed,
              color: currentColorObj.core,
              life: 1.0,
              maxLife: 200 + Math.random() * 250, // ~200-450ms real time
            });
          }
        }
      }

      // 3. Render Tesla Coil Structure
      ctx.save();

      // Base Box
      const baseW = 120;
      const baseH = 40;
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(coilX - baseW / 2, coilY - baseH, baseW, baseH, 8);
      ctx.fill();
      ctx.stroke();

      // Secondary Copper Coil
      const coilW = 34;
      const towerY = coilY - baseH - coilH;

      const copperGrd = ctx.createLinearGradient(coilX - coilW / 2, towerY, coilX + coilW / 2, towerY);
      copperGrd.addColorStop(0, '#78350f');
      copperGrd.addColorStop(0.5, '#d97706');
      copperGrd.addColorStop(1, '#451a03');

      ctx.fillStyle = copperGrd;
      ctx.fillRect(coilX - coilW / 2, towerY, coilW, coilH);

      // Winding lines
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      for (let y = towerY; y < towerY + coilH; y += 4) {
        ctx.beginPath();
        ctx.moveTo(coilX - coilW / 2, y);
        ctx.lineTo(coilX + coilW / 2, y);
        ctx.stroke();
      }

      // Primary Base Winding (Pulsing with rhythm)
      ctx.strokeStyle = isBeatHit ? currentColorObj.main : '#ea580c';
      ctx.lineWidth = 5 + (isBeatHit ? 4 : 0);
      ctx.shadowColor = currentColorObj.main;
      ctx.shadowBlur = isMobile ? (isBeatHit ? 10 : 0) : isBeatHit ? 20 : 6;
      for (let i = 0; i < 4; i++) {
        const py = coilY - baseH - 10 - i * 10;
        ctx.beginPath();
        ctx.ellipse(coilX, py, coilW * 0.95, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Metallic Toroid Terminal
      ctx.shadowBlur = isMobile
        ? isPlaying
          ? 8 + rawIntensity * 10
          : 4
        : isPlaying
        ? 15 + rawIntensity * 25
        : 8;
      ctx.shadowColor = isPlaying ? currentColorObj.main : '#38bdf8';

      const toroidGrd = ctx.createRadialGradient(toroidX - 15, toroidY - 10, 5, toroidX, toroidY, 65);
      toroidGrd.addColorStop(0, '#ffffff');
      toroidGrd.addColorStop(0.3, '#cbd5e1');
      toroidGrd.addColorStop(0.8, '#334155');
      toroidGrd.addColorStop(1, '#090d16');

      ctx.fillStyle = toroidGrd;
      ctx.beginPath();
      ctx.ellipse(toroidX, toroidY, 65, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // 4. Render Toroid Corona Plasma Aura (charging between beats)
      if (isPlaying) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const coronaRadius = 40 + rawIntensity * 70;
        const auraGrd = ctx.createRadialGradient(toroidX, toroidY, 10, toroidX, toroidY, coronaRadius);
        auraGrd.addColorStop(0, '#ffffff');
        auraGrd.addColorStop(0.4, currentColorObj.glow);
        auraGrd.addColorStop(0.8, currentColorObj.main);
        auraGrd.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = auraGrd;
        ctx.beginPath();
        ctx.arc(toroidX, toroidY, coronaRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 5. Draw Active Rhythmic Discharge Arcs
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = activeArcs.length - 1; i >= 0; i--) {
        const arc = activeArcs[i];
        arc.life -= deltaMs;

        if (arc.life <= 0) {
          activeArcs.splice(i, 1);
          continue;
        }

        const alpha = arc.life / arc.maxLife; // Smooth fade out as it snaps
        drawLightningPath(
          arc.startX,
          arc.startY,
          arc.targetX,
          arc.targetY,
          arc.displace,
          arc.color,
          alpha,
          arc.seed
        );
      }

      // Draw Spark Particles
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= deltaMs / p.maxLife;

        if (p.life <= 0) {
          sparkParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.life * 2.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black text-amber-100 flex flex-col items-center justify-between pt-16 pb-6 px-3 select-none overflow-hidden">
      {/* Background HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Header Info */}
      <div className="relative z-20 mt-2 sm:mt-4 text-center max-w-xl px-2 space-y-1.5">
        <h2 className="font-serif-classic text-xl sm:text-3xl text-amber-100 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          Rayos & Melodías de Amor ⚡
        </h2>
        <p className="font-sans-body text-[11px] sm:text-xs text-amber-200/80">
          Especialmente preparado para ti ♥ — La Bobina de Tesla baila al ritmo de nuestra canción.
        </p>

        {/* Color Configuration Modal Trigger Button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setIsColorModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-amber-400/40 text-amber-200 text-xs font-serif-classic flex items-center gap-2 backdrop-blur-md hover:bg-slate-800 hover:border-amber-300 transition-all shadow-[0_0_15px_rgba(234,88,12,0.25)] active:scale-95"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Color de los Rayos</span>
            <span
              className="w-2.5 h-2.5 rounded-full ml-0.5 shadow-[0_0_6px_currentColor]"
              style={{
                backgroundColor:
                  selectedColorMode === 'all'
                    ? '#a855f7'
                    : LIGHTNING_COLORS[selectedColorMode]?.main || '#3b82f6',
              }}
            />
          </button>
        </div>
      </div>

      {/* Color Configuration Modal Dialog */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-4 text-amber-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-classic text-base sm:text-lg font-semibold text-amber-100">
                  Color de los Rayos
                </h3>
              </div>
              <button
                onClick={() => setIsColorModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-200/70 font-sans-body">
              Selecciona el tono de los rayos de la Bobina de Tesla:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedColorMode('all');
                  setIsColorModalOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-sans-body transition-all flex items-center justify-between border ${
                  selectedColorMode === 'all'
                    ? 'bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-rose-600/30 border-amber-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-amber-400/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-serif-classic text-sm">Todos (Ciclo Rítmico)</span>
                </div>
                <span className="text-[10px] text-amber-300/80 uppercase tracking-wider">Automático</span>
              </button>

              {LIGHTNING_COLORS.map((c) => {
                const isSelected = selectedColorMode === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedColorMode(c.id);
                      setIsColorModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-sans-body transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'border-amber-400 text-white shadow-md bg-amber-500/15'
                        : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-white/30'
                    }`}
                    style={{
                      borderColor: isSelected ? c.main : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: c.main }}
                      />
                      <span className="font-serif-classic text-sm">{c.name}</span>
                    </div>
                    {isSelected && <span className="text-xs text-amber-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsColorModalOpen(false)}
                className="px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-serif-classic hover:bg-amber-500/30 transition-all"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Audio Controls & Songs Bar */}
      <div className="relative z-20 mb-4 sm:mb-6 w-full max-w-2xl bg-slate-950/85 border border-amber-500/30 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col gap-2.5">
        {/* Active Track Title & Play/Pause */}
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <Disc className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-serif-classic text-xs sm:text-sm text-amber-100 font-semibold truncate">
                {currentSong?.title || 'Canción Seleccionada'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-amber-300/70 truncate">
                {currentSong?.artist || 'Bailando con la Bobina'}
              </p>
            </div>
          </div>

          <button
            onClick={() => audioManager.togglePlayPause()}
            className={`px-4 py-2 rounded-full border text-xs font-serif-classic font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
              isPlaying
                ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-amber-500/25 border-amber-400 text-amber-200 hover:bg-amber-500/35'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-rose-200" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-200" /> Reproducir
              </>
            )}
          </button>
        </div>

        {/* Songs List Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-1 border-t border-white/10 px-1">
          {config.songs.map((song, idx) => {
            const isSelected = selectedSongIdx === idx;
            const isThisPlaying = isPlaying && activeTrackId === song.id;

            return (
              <button
                key={song.id}
                onClick={() => handleSelectSong(idx)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-serif-classic flex items-center gap-2 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-black/50 border-white/10 text-slate-300 hover:border-amber-500/30'
                }`}
              >
                <Music className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[100px] sm:max-w-[130px]">{song.title}</span>
                {isThisPlaying && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
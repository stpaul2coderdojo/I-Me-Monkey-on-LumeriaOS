import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { SemioticsCodex } from '../types';
import { Activity, Zap, Volume2, Sparkles } from 'lucide-react';

interface PixiSemioticsStageProps {
  codex: SemioticsCodex;
  isPlaying: boolean;
  currentFrame: number;
}

export const PixiSemioticsStage: React.FC<PixiSemioticsStageProps> = ({
  codex,
  isPlaying,
  currentFrame,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    let app: Application | null = null;

    const initPixi = async () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 384;

      app = new Application();
      await app.init({
        width: w,
        height: h,
        antialias: true,
        backgroundColor: 0x050914,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (!isMounted) {
        app.destroy(true);
        return;
      }

      appRef.current = app;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(app.canvas);

      // Pixi Container Graph
      const stageContainer = new Container();
      app.stage.addChild(stageContainer);

      const gridGraphic = new Graphics();
      stageContainer.addChild(gridGraphic);

      const waveGraphic = new Graphics();
      stageContainer.addChild(waveGraphic);

      const rigGraphic = new Graphics();
      stageContainer.addChild(rigGraphic);

      const particlesGraphic = new Graphics();
      stageContainer.addChild(particlesGraphic);

      // Soundwave particles
      const waveParticles: Array<{ x: number; y: number; vx: number; alpha: number; size: number }> = [];
      for (let i = 0; i < 90; i++) {
        waveParticles.push({
          x: Math.random() * w,
          y: h * 0.5 + (Math.random() - 0.5) * 120,
          vx: Math.random() * 2 + 1,
          alpha: Math.random() * 0.7 + 0.3,
          size: Math.random() * 2.5 + 1,
        });
      }

      let frameCount = 0;
      let lastFps = performance.now();

      const render = (time: number) => {
        animFrameIdRef.current = requestAnimationFrame(render);
        frameCount++;
        if (time - lastFps >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastFps = time;
        }

        if (!app) return;
        const curW = app.screen.width;
        const curH = app.screen.height;
        const t = time * 0.001;

        // 1. Digital Spectrogram Grid
        gridGraphic.clear();
        for (let x = 0; x < curW; x += 40) {
          gridGraphic.moveTo(x, 0).lineTo(x, curH);
          gridGraphic.stroke({ color: 0x0e1b33, width: 1, alpha: 0.5 });
        }
        for (let y = 0; y < curH; y += 30) {
          gridGraphic.moveTo(0, y).lineTo(curW, y);
          gridGraphic.stroke({ color: 0x0e1b33, width: 1, alpha: 0.5 });
        }

        // Center Axis
        gridGraphic.moveTo(0, curH * 0.5).lineTo(curW, curH * 0.5);
        gridGraphic.stroke({ color: 0x38bdf8, width: 1.5, alpha: 0.3 });

        // 2. Real-Time S-IPA Acoustic Waveform & Sub-Harmonic Tremor
        waveGraphic.clear();
        const baseFreq = (codex.acousticProfile?.fundamentalFreqHz || 450) * 0.003;
        const formants = codex.acousticProfile?.formantFrequenciesHz || [800, 1600, 2400];

        // Cyan Waveform
        waveGraphic.moveTo(0, curH * 0.5);
        for (let x = 0; x < curW; x += 3) {
          const sampleT = x * 0.015 - t * (isPlaying ? 3.5 : 0);
          const f1 = Math.sin(sampleT * baseFreq) * 35;
          const f2 = Math.sin(sampleT * (formants[0] * 0.002)) * 18;
          const tremor = Math.sin(sampleT * 0.8) * 12;
          const y = curH * 0.5 + f1 + f2 + tremor;
          waveGraphic.lineTo(x, y);
        }
        waveGraphic.stroke({ color: 0x06b6d4, width: 2.5, alpha: 0.9 });

        // Amber Harmonic Overtones
        waveGraphic.moveTo(0, curH * 0.5);
        for (let x = 0; x < curW; x += 4) {
          const sampleT = x * 0.02 - t * (isPlaying ? 5.0 : 0);
          const f3 = Math.sin(sampleT * (formants[1] * 0.0015)) * 22;
          const y = curH * 0.5 + f3;
          waveGraphic.lineTo(x, y);
        }
        waveGraphic.stroke({ color: 0xf59e0b, width: 1.5, alpha: 0.65 });

        // 3. Biomechanical Simian Motion Rig (Pixi 2D Articulated Skeleton)
        rigGraphic.clear();
        const kf = codex.motionModel?.keyframes[currentFrame] || codex.motionModel?.keyframes[0];
        const rigCenterX = curW * 0.78;
        const rigCenterY = curH * 0.55;

        if (kf) {
          // Torso Core
          const spineFlex = kf.spineFlexion * 25;
          rigGraphic.ellipse(rigCenterX, rigCenterY + spineFlex * 0.2, 28, 38).fill(0x1e293b);
          rigGraphic.stroke({ color: 0x38bdf8, width: 2 });

          // Head & Facial Angle
          const headX = rigCenterX + (kf.headYawDeg || 0) * 0.4;
          const headY = rigCenterY - 48 - spineFlex * 0.5;
          rigGraphic.circle(headX, headY, 20).fill(0x0f172a);
          rigGraphic.stroke({ color: 0xa855f7, width: 2 });

          // Lip-Smack Resonance Chamber
          const lipSmackActive = kf.facialLipSmack > 0.4;
          const lipRadius = lipSmackActive ? 7 + Math.sin(t * 18) * 3 : 4;
          rigGraphic.circle(headX + 14, headY + 5, lipRadius).fill(lipSmackActive ? 0xec4899 : 0x475569);

          // Articulated Tail IK Chain
          const tailAngleRad = ((kf.tailAngleDeg || 45) * Math.PI) / 180;
          let curTx = rigCenterX - 22;
          let curTy = rigCenterY + 12;

          rigGraphic.moveTo(curTx, curTy);
          for (let s = 0; s < 10; s++) {
            const nextTx = curTx - Math.cos(tailAngleRad + s * 0.15) * 9 + Math.sin(t * 4 + s) * 2;
            const nextTy = curTy - Math.sin(tailAngleRad + s * 0.15) * 9 + Math.cos(t * 4 + s) * 1.5;
            rigGraphic.lineTo(nextTx, nextTy);
            curTx = nextTx;
            curTy = nextTy;
          }
          rigGraphic.stroke({ color: 0x10b981, width: 4 });
        }

        // 4. Acoustic Air-Sac Resonance Particles
        particlesGraphic.clear();
        waveParticles.forEach((p) => {
          if (isPlaying) {
            p.x += p.vx;
            if (p.x > curW) p.x = 0;
          }
          particlesGraphic.circle(p.x, p.y, p.size).fill({ color: 0x38bdf8, alpha: p.alpha });
        });
      };

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    initPixi();

    const handleResize = () => {
      if (!container || !appRef.current || !appRef.current.renderer) return;
      try {
        appRef.current.renderer.resize(container.clientWidth || 800, container.clientHeight || 384);
      } catch {
        // Safe catch if canvas or renderer was unmounted
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [codex.id, isPlaying, currentFrame]);

  return (
    <div className="relative w-full h-96 bg-[#050914] rounded-xl overflow-hidden border border-cyan-500/30 shadow-inner group">
      {/* Pixi Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Real-Time Telemetry HUD Overlay */}
      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs font-mono flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Zap className="w-3.5 h-3.5" />
          PIXI.JS v8.21 GPU
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400" />
          Spectral Acoustic Rig
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300 font-bold">{fps} FPS</span>
      </div>

      {/* Acoustic Details HUD */}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono flex items-center gap-4 text-slate-300">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>F0: {codex.acousticProfile?.fundamentalFreqHz || 450} Hz</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>S-IPA: {codex.phoneticRepresentation}</span>
        </div>
      </div>
    </div>
  );
};

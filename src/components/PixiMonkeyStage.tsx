import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { CinematicUsdScene, MonkeyDigitalTwin } from '../types';
import {
  Compass,
  Activity,
  Sparkles,
  Layers,
  Wind,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap
} from 'lucide-react';

interface PixiMonkeyStageProps {
  twin: MonkeyDigitalTwin;
  activeScene: CinematicUsdScene;
  windSpeedKmH: number;
  gustiness: number;
  windDirectionDeg: number;
  cameraAnglePreset?: string;
  isPlaying?: boolean;
  playbackSpeed?: number;
  showSkeletalRig?: boolean;
  showLiDARPointCloud?: boolean;
  enableSubsurfaceScattering?: boolean;
  enableAnisotropicFur?: boolean;
  isWidescreenScope?: boolean;
  showEthologyOverlay?: boolean;
}

export const PixiMonkeyStage: React.FC<PixiMonkeyStageProps> = ({
  twin,
  activeScene,
  windSpeedKmH,
  gustiness,
  windDirectionDeg,
  cameraAnglePreset = 'master-shot',
  isPlaying = true,
  playbackSpeed = 1,
  showSkeletalRig = false,
  showLiDARPointCloud = false,
  enableSubsurfaceScattering = true,
  enableAnisotropicFur = true,
  isWidescreenScope = true,
  showEthologyOverlay = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Pan & Zoom interaction state
  const cameraStateRef = useRef<{
    panX: number;
    panY: number;
    targetPanX: number;
    targetPanY: number;
    zoom: number;
    targetZoom: number;
  }>({
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    zoom: 1,
    targetZoom: 1,
  });

  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);

  const [fps, setFps] = useState<number>(60);
  const [zoomDisplay, setZoomDisplay] = useState<number>(100);

  // Synchronize Camera presets with smooth interpolation targets
  useEffect(() => {
    const cam = cameraStateRef.current;
    const preset = (cameraAnglePreset || '').toLowerCase();

    if (preset.includes('macro') || preset.includes('close') || preset.includes('eye') || preset.includes('sss')) {
      cam.targetZoom = 2.2;
      cam.targetPanX = -40;
      cam.targetPanY = 160;
    } else if (preset.includes('wide') || preset.includes('crane') || preset.includes('drone') || preset.includes('sweep')) {
      cam.targetZoom = 0.75;
      cam.targetPanX = 0;
      cam.targetPanY = -20;
    } else if (preset.includes('profile') || preset.includes('side')) {
      cam.targetZoom = 1.35;
      cam.targetPanX = 30;
      cam.targetPanY = 40;
    } else if (preset.includes('turntable') || preset.includes('orbit')) {
      cam.targetZoom = 1.15;
      cam.targetPanX = 0;
      cam.targetPanY = 30;
    } else {
      // Master 3/4 scope
      cam.targetZoom = 1.0;
      cam.targetPanX = 0;
      cam.targetPanY = 0;
    }
  }, [cameraAnglePreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    let app: Application | null = null;

    const initPixi = async () => {
      const w = container.clientWidth || 960;
      const h = Math.round(w * (9 / 16)) || 540;

      app = new Application();
      await app.init({
        width: w,
        height: h,
        antialias: true,
        backgroundColor: 0x030712,
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

      // =======================================================================
      // SCENE GRAPH ARCHITECTURE (PIXI.JS v8 GPU CONTAINERS)
      // =======================================================================
      const rootStage = new Container();
      app.stage.addChild(rootStage);

      // 1. Sky & Environment Backdrop Layer
      const skyGraphic = new Graphics();
      rootStage.addChild(skyGraphic);

      // 2. Distant Horizon / Ocean Layer
      const oceanGraphic = new Graphics();
      rootStage.addChild(oceanGraphic);

      // 3. Canopy Perch / Studio Turntable Layer
      const perchGraphic = new Graphics();
      rootStage.addChild(perchGraphic);

      // 4. Foliage & Botanical Layer
      const foliageGraphic = new Graphics();
      rootStage.addChild(foliageGraphic);

      // 5. Primate Digital Twin Hero Character Layer
      const simianContainer = new Container();
      rootStage.addChild(simianContainer);

      const simianShadow = new Graphics();
      simianContainer.addChild(simianShadow);

      const simianBody = new Graphics();
      simianContainer.addChild(simianBody);

      const simianLimbs = new Graphics();
      simianContainer.addChild(simianLimbs);

      const simianHead = new Graphics();
      simianContainer.addChild(simianHead);

      const simianFurSheen = new Graphics();
      simianContainer.addChild(simianFurSheen);

      // 6. Articulated Skeletal Rig Overlay
      const skeletonGraphic = new Graphics();
      rootStage.addChild(skeletonGraphic);

      // 7. Dynamic Weather & Atmospheric Particles Layer
      const weatherGraphic = new Graphics();
      rootStage.addChild(weatherGraphic);

      // 8. LiDAR Holographic Point Cloud Layer
      const lidarGraphic = new Graphics();
      rootStage.addChild(lidarGraphic);

      // 9. Foreground Scope Letterbox (2.39:1 Anamorphic)
      const scopeGraphic = new Graphics();
      app.stage.addChild(scopeGraphic); // Placed on unscaled app.stage

      // Particle Simulation State
      const isVolumetric = activeScene.id === 'volumetric-scan';
      const isSunset = activeScene.id === 'pacific-sunset';
      const isMonsoon = activeScene.id === 'tropical-monsoon';
      const isDawn = activeScene.id === 'emerald-dawn';

      const particleCount = isMonsoon ? 450 : isVolumetric ? 260 : 320;
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        alpha: number;
        color: number;
      }> = [];

      const pColor = isMonsoon ? 0x67e8f9 : isSunset ? 0xfdba74 : isVolumetric ? 0xa855f7 : 0xfde047;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * (w * 1.5) - w * 0.25,
          y: Math.random() * h,
          vx: (Math.random() * 0.8 + 0.4) * (windSpeedKmH / 18 + 0.5),
          vy: isMonsoon ? Math.random() * 6 + 4 : Math.sin(i) * 0.5 + 0.2,
          size: isMonsoon ? Math.random() * 1.8 + 1.2 : Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.6 + 0.25,
          color: pColor,
        });
      }

      // LiDAR Point Cloud buffer (2,000 points)
      const lidarPoints: Array<{ rx: number; ry: number; rz: number; phase: number }> = [];
      for (let i = 0; i < 2000; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 60 + Math.random() * 65;
        lidarPoints.push({
          rx: radius * Math.sin(phi) * Math.cos(theta),
          ry: radius * Math.cos(phi),
          rz: radius * Math.sin(phi) * Math.sin(theta),
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Resize handler
      const handleResize = () => {
        if (!container || !app || !app.renderer) return;
        try {
          const newW = container.clientWidth || 960;
          const newH = Math.round(newW * (9 / 16)) || 540;
          app.renderer.resize(newW, newH);
        } catch {
          // Safe catch if canvas or renderer was unmounted
        }
      };
      window.addEventListener('resize', handleResize);

      // Pointer drag interaction
      const onPointerDown = (e: MouseEvent) => {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const onPointerMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - prevMousePosRef.current.x;
        const dy = e.clientY - prevMousePosRef.current.y;

        cameraStateRef.current.targetPanX += dx / cameraStateRef.current.zoom;
        cameraStateRef.current.targetPanY += dy / cameraStateRef.current.zoom;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDraggingRef.current = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 1.15 : 0.88;
        cameraStateRef.current.targetZoom = Math.max(0.6, Math.min(3.5, cameraStateRef.current.targetZoom * zoomDelta));
      };

      // Mobile Touch Handlers
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          touchDistRef.current = Math.hypot(dx, dy);
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1 && isDraggingRef.current) {
          const dx = e.touches[0].clientX - prevMousePosRef.current.x;
          const dy = e.touches[0].clientY - prevMousePosRef.current.y;
          cameraStateRef.current.targetPanX += dx / cameraStateRef.current.zoom;
          cameraStateRef.current.targetPanY += dy / cameraStateRef.current.zoom;
          prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2 && touchDistRef.current) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / touchDistRef.current;
          cameraStateRef.current.targetZoom = Math.max(0.6, Math.min(3.5, cameraStateRef.current.targetZoom * ratio));
          touchDistRef.current = dist;
        }
      };

      const onTouchEnd = () => {
        isDraggingRef.current = false;
        touchDistRef.current = null;
      };

      const canvasElem = app.canvas;
      canvasElem.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      canvasElem.addEventListener('wheel', onWheel, { passive: false });

      canvasElem.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });

      // =======================================================================
      // HIGH-PERFORMANCE PIXI.JS RENDER LOOP (60 FPS)
      // =======================================================================
      let frameCount = 0;
      let lastFpsCheck = performance.now();

      const renderLoop = (timeNow: number) => {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);

        // Frame timing
        frameCount++;
        if (timeNow - lastFpsCheck >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastFpsCheck = timeNow;
        }

        if (!isPlaying || !app) return;
        const elapsed = timeNow * 0.001 * playbackSpeed;
        const curW = app.screen.width;
        const curH = app.screen.height;

        // Smooth camera lerp
        const cam = cameraStateRef.current;
        cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;
        cam.panX += (cam.targetPanX - cam.panX) * 0.1;
        cam.panY += (cam.targetPanY - cam.panY) * 0.1;
        setZoomDisplay(Math.round(cam.zoom * 100));

        // Center stage coordinate space
        rootStage.scale.set(cam.zoom);
        rootStage.position.set(
          curW * 0.5 + cam.panX * cam.zoom,
          curH * 0.5 + cam.panY * cam.zoom
        );

        // ---------------------------------------------------------------------
        // 1. SKY & ATMOSPHERE PASS
        // ---------------------------------------------------------------------
        skyGraphic.clear();
        const skyW = curW * 2;
        const skyH = curH * 2;

        if (isVolumetric) {
          // Obsidian High-Tech Virtual Studio Cleanroom
          skyGraphic.rect(-skyW * 0.5, -skyH * 0.5, skyW, skyH).fill(0x040711);

          // Digital Isometric Calibration Floor Grid
          const gridExtent = 480;
          for (let g = -gridExtent; g <= gridExtent; g += 40) {
            skyGraphic.moveTo(g, 100);
            skyGraphic.lineTo(g * 1.8, 360);
            skyGraphic.stroke({ color: 0x1e293b, width: 1, alpha: 0.4 });

            skyGraphic.moveTo(-gridExtent * 1.4, 100 + (g + gridExtent) * 0.25);
            skyGraphic.lineTo(gridExtent * 1.4, 100 + (g + gridExtent) * 0.25);
            skyGraphic.stroke({ color: 0x0f172a, width: 1, alpha: 0.35 });
          }
        } else if (isSunset) {
          // Marshall Islands Sunset Glow
          skyGraphic.rect(-skyW * 0.5, -skyH * 0.5, skyW, skyH).fill(0x2e1065);
          skyGraphic.rect(-skyW * 0.5, -120, skyW, 260).fill({ color: 0xc2410c, alpha: 0.7 });
          skyGraphic.rect(-skyW * 0.5, 40, skyW, 180).fill({ color: 0xf59e0b, alpha: 0.85 });

          // Low Setting Sun Disc
          skyGraphic.circle(180, 20, 68).fill({ color: 0xfef08a, alpha: 0.95 });
          skyGraphic.circle(180, 20, 110).fill({ color: 0xfb923c, alpha: 0.25 });
        } else if (isMonsoon) {
          // Nocturnal Oceanic Monsoon
          skyGraphic.rect(-skyW * 0.5, -skyH * 0.5, skyW, skyH).fill(0x030b17);
          skyGraphic.rect(-skyW * 0.5, -100, skyW, 300).fill({ color: 0x0c2547, alpha: 0.65 });
        } else if (isDawn) {
          // Equatorial Dawn Radiance
          skyGraphic.rect(-skyW * 0.5, -skyH * 0.5, skyW, skyH).fill(0x0284c7);
          skyGraphic.rect(-skyW * 0.5, -60, skyW, 220).fill({ color: 0x38bdf8, alpha: 0.75 });
          skyGraphic.rect(-skyW * 0.5, 60, skyW, 160).fill({ color: 0xfde047, alpha: 0.6 });

          // Dawn Sun Flare
          skyGraphic.circle(-220, 30, 55).fill({ color: 0xffedd5, alpha: 0.9 });
          skyGraphic.circle(-220, 30, 95).fill({ color: 0xfba94c, alpha: 0.3 });
        } else {
          // Sanctuary Midday Pacific
          skyGraphic.rect(-skyW * 0.5, -skyH * 0.5, skyW, skyH).fill(0x0284c7);
          skyGraphic.rect(-skyW * 0.5, 0, skyW, 240).fill({ color: 0x7dd3fc, alpha: 0.8 });
        }

        // ---------------------------------------------------------------------
        // 2. OCEAN WAVE SWELL & HORIZON
        // ---------------------------------------------------------------------
        oceanGraphic.clear();
        if (!isVolumetric) {
          const oceanY = 120;
          const oceanColor = isSunset ? 0x9a3412 : isMonsoon ? 0x082f49 : 0x0369a1;
          oceanGraphic.rect(-skyW * 0.5, oceanY, skyW, skyH).fill(oceanColor);

          // Specular wave reflections
          for (let row = 0; row < 5; row++) {
            const waveY = oceanY + row * 24;
            const wavePhase = elapsed * 1.5 + row * 0.8;
            oceanGraphic.moveTo(-360, waveY);
            for (let wx = -360; wx <= 360; wx += 40) {
              const wy = waveY + Math.sin(wx * 0.02 + wavePhase) * 3;
              oceanGraphic.lineTo(wx, wy);
            }
            oceanGraphic.stroke({
              color: isSunset ? 0xfde047 : isMonsoon ? 0x38bdf8 : 0xbae6fd,
              width: 1.5,
              alpha: 0.4 - row * 0.06,
            });
          }
        }

        // ---------------------------------------------------------------------
        // 3. PERCH BOUGH / STUDIO LIDAR TURNTABLE
        // ---------------------------------------------------------------------
        perchGraphic.clear();
        if (isVolumetric) {
          // Futuristic LiDAR Turntable Platform
          const ttY = 120;

          // Turntable Base Cylinder
          perchGraphic.ellipse(0, ttY + 12, 230, 48).fill(0x090d1a);
          perchGraphic.ellipse(0, ttY, 230, 46).fill(0x0e1526);
          perchGraphic.stroke({ color: 0x06b6d4, width: 2, alpha: 0.9 });

          // Concentric LiDAR Range Rings
          const ringRadii = [60, 120, 180];
          ringRadii.forEach((r, idx) => {
            perchGraphic.ellipse(0, ttY, r, r * 0.2).stroke({
              color: idx === 1 ? 0x06b6d4 : 0xa855f7,
              width: 1.5,
              alpha: 0.65,
            });
          });

          // 360 Degree Angular Calibration Ticks
          for (let deg = 0; deg < 360; deg += 20) {
            const rad = (deg * Math.PI) / 180;
            const x1 = Math.cos(rad) * 210;
            const y1 = ttY + Math.sin(rad) * 42;
            const x2 = Math.cos(rad) * 228;
            const y2 = ttY + Math.sin(rad) * 45.6;
            perchGraphic.moveTo(x1, y1).lineTo(x2, y2);
            perchGraphic.stroke({ color: deg % 60 === 0 ? 0xec4899 : 0x06b6d4, width: 1.5, alpha: 0.7 });
          }

          // Animated LiDAR Laser Scan Sweep Line
          const sweepY = ttY - 140 + ((Math.sin(elapsed * 2.2) * 0.5 + 0.5) * 160);
          perchGraphic.rect(-170, sweepY, 340, 2).fill({ color: 0x06b6d4, alpha: 0.85 });
          perchGraphic.ellipse(0, sweepY, 170, 30).stroke({ color: 0x06b6d4, width: 1.5, alpha: 0.5 });
        } else {
          // Weathered Marshallese Breadfruit Tree Bough Perch
          const branchY = 110;
          perchGraphic.moveTo(-450, branchY - 20);
          perchGraphic.bezierCurveTo(-200, branchY + 15, 0, branchY - 5, 450, branchY + 35);
          perchGraphic.lineTo(450, branchY + 80);
          perchGraphic.bezierCurveTo(0, branchY + 45, -200, branchY + 65, -450, branchY + 30);
          perchGraphic.fill(isMonsoon ? 0x221611 : 0x3d271d);
          perchGraphic.stroke({ color: 0x1f130e, width: 2.5 });

          // Epiphytic Moss & Lichen
          perchGraphic.moveTo(-180, branchY - 2);
          perchGraphic.bezierCurveTo(-80, branchY - 8, 40, branchY - 6, 160, branchY + 4);
          perchGraphic.stroke({
            color: isMonsoon ? 0x059669 : 0x16a34a,
            width: 7,
            alpha: 0.65,
          });
        }

        // ---------------------------------------------------------------------
        // 4. BOTANICAL FOLIAGE (PALM FRONDS & HIBISCUS BLOSSOMS)
        // ---------------------------------------------------------------------
        foliageGraphic.clear();
        if (!isVolumetric) {
          const windSway = Math.sin(elapsed * 2.2) * (windSpeedKmH / 18) * 8;

          // Tropical Palm Frond Left
          foliageGraphic.moveTo(-320, -140);
          foliageGraphic.quadraticCurveTo(-180 + windSway, -60, -90 + windSway, 30);
          foliageGraphic.stroke({ color: 0x14532d, width: 4 });

          for (let p = 0; p < 8; p++) {
            const px = -280 + p * 24 + windSway * (p / 8);
            const py = -110 + p * 16;
            foliageGraphic.moveTo(px, py);
            foliageGraphic.lineTo(px - 35, py + 22);
            foliageGraphic.stroke({ color: 0x15803d, width: 2.5 });
          }

          // Tropical Plumeria Blossoms on Branch
          const flowerX = -130;
          const flowerY = 96;
          for (let fl = 0; fl < 5; fl++) {
            const rad = (fl * Math.PI * 2) / 5;
            foliageGraphic.circle(flowerX + Math.cos(rad) * 11, flowerY + Math.sin(rad) * 11, 7).fill(0xf43f5e);
          }
          foliageGraphic.circle(flowerX, flowerY, 5).fill(0xfacc15);
        }

        // ---------------------------------------------------------------------
        // 5. PRIMATE DIGITAL TWIN HERO PASS (HIGH-FIDELITY ARTICULATED RIG)
        // ---------------------------------------------------------------------
        const speciesLower = (twin.species || '').toLowerCase();
        const isChimp = speciesLower.includes('chimp');
        const isCapuchin = speciesLower.includes('capuchin');

        const furColor = isChimp ? 0x1c1917 : isCapuchin ? 0x3d2817 : 0x654321;
        const skinColor = isChimp ? 0xc2a48a : 0xd97706;

        // Simian Center Position atop Perch
        const simX = 0;
        const simY = 70;

        // Physiological Respiration (Ribcage Breath Cycle)
        const breathScale = 1.0 + Math.sin(elapsed * 2.6) * 0.04;

        // Soft Cast Shadow on Perch
        simianShadow.clear();
        simianShadow.ellipse(simX, simY + 36, 68 * breathScale, 16).fill({ color: 0x000000, alpha: 0.45 });

        // Simian Pelvis & Lumbar Core
        simianBody.clear();
        simianBody.ellipse(simX, simY, 44, 38).fill(furColor);
        simianBody.stroke({ color: 0x1a0f0a, width: 1.5 });

        // Thorax & Chest (Respiration)
        simianBody.ellipse(simX + 10, simY - 32, 42 * breathScale, 36 * breathScale).fill(furColor);

        // Prehensile 14-Segment Articulated Vertebral Tail
        if (!isChimp) {
          const ethPattern = twin.ethologyProfile?.tailLanguageRepertoire[0];
          const twitchHz = ethPattern ? ethPattern.twitchFrequencyHz : 1.2;
          const tailTwitch = Math.sin(elapsed * Math.PI * 2 * twitchHz) * 6;
          const windSwayTail = Math.sin(elapsed * 2.8) * 5 * (windSpeedKmH / 20);

          let curTailX = simX - 32;
          let curTailY = simY + 8;
          simianBody.moveTo(curTailX, curTailY);

          for (let s = 0; s < 14; s++) {
            const segRatio = s / 14;
            const segThick = Math.max(2.5, 7.5 - segRatio * 5);
            const nextX = curTailX - 9 + Math.sin(s * 0.4 + elapsed * 2.5) * 3 + tailTwitch * segRatio;
            const nextY = curTailY - 8 + Math.cos(s * 0.4 + elapsed * 2.5) * 2 + windSwayTail * segRatio;

            simianBody.moveTo(curTailX, curTailY).lineTo(nextX, nextY);
            simianBody.stroke({ color: furColor, width: segThick });

            curTailX = nextX;
            curTailY = nextY;
          }
        }

        // Articulated Limbs
        simianLimbs.clear();

        // Forelimb Left (Grasping Perch)
        simianLimbs.moveTo(simX + 18, simY - 30);
        simianLimbs.lineTo(simX + 42, simY - 5); // Elbow
        simianLimbs.lineTo(simX + 54, simY + 34); // Wrist & Palm
        simianLimbs.stroke({ color: furColor, width: 13 });

        // Dexterous 5-Digit Hand Left
        simianLimbs.circle(simX + 54, simY + 34, 7).fill(skinColor);
        for (let d = -2; d <= 2; d++) {
          simianLimbs.moveTo(simX + 54, simY + 34);
          simianLimbs.lineTo(simX + 54 + d * 3.5, simY + 44);
          simianLimbs.stroke({ color: skinColor, width: 2.5 });
        }

        // Forelimb Right (Closer Forearm)
        simianLimbs.moveTo(simX - 4, simY - 26);
        simianLimbs.lineTo(simX + 14, simY - 2);
        simianLimbs.lineTo(simX + 22, simY + 36);
        simianLimbs.stroke({ color: furColor, width: 11 });
        simianLimbs.circle(simX + 22, simY + 36, 6.5).fill(skinColor);

        // Hindlimb (Seated Thigh & Foot)
        simianLimbs.moveTo(simX - 16, simY + 6);
        simianLimbs.lineTo(simX - 34, simY + 28);
        simianLimbs.lineTo(simX - 12, simY + 38);
        simianLimbs.stroke({ color: furColor, width: 14 });

        // Grasping Foot with Opposable Hallux
        simianLimbs.ellipse(simX - 8, simY + 38, 9, 5).fill(skinColor);

        // Saccadic Head Micro-Turns & Facial Disk
        const headSwayX = Math.sin(elapsed * 1.1) * 4 + Math.sin(elapsed * 3.4) * 1.5;
        const headSwayY = Math.sin(elapsed * 0.7) * 2;
        const headX = simX + 24 + headSwayX;
        const headY = simY - 72 + headSwayY;

        simianHead.clear();

        // Cranium
        simianHead.circle(headX, headY, 28).fill(furColor);
        simianHead.stroke({ color: 0x1a0f0a, width: 1.5 });

        // Lateral Simian Auricles (Ears with Helix & Concha)
        simianHead.circle(headX - 25, headY + 2, 9).fill(skinColor);
        simianHead.circle(headX - 25, headY + 2, 5).fill(0xa16207);

        simianHead.circle(headX + 25, headY + 2, 9).fill(skinColor);
        simianHead.circle(headX + 25, headY + 2, 5).fill(0xa16207);

        // Facial Mask & Supraorbital Brow Ridge
        simianHead.ellipse(headX, headY + 5, 20, 18).fill(skinColor);
        simianHead.ellipse(headX, headY - 4, 18, 5).fill(0xb45309); // Brow Torus

        // Snout & Nostrils
        simianHead.ellipse(headX, headY + 12, 11, 8).fill(skinColor);
        simianHead.circle(headX - 3.5, headY + 13, 2).fill(0x1a0f0a);
        simianHead.circle(headX + 3.5, headY + 13, 2).fill(0x1a0f0a);

        // Binocular Primate Eyes
        const eyeSpacing = 8;
        const eyeY = headY - 1;

        // Sclera
        simianHead.circle(headX - eyeSpacing, eyeY, 4.5).fill(0xf8fafc);
        simianHead.circle(headX + eyeSpacing, eyeY, 4.5).fill(0xf8fafc);

        // Iris
        simianHead.circle(headX - eyeSpacing + 0.5, eyeY, 2.8).fill(0x78350f);
        simianHead.circle(headX + eyeSpacing + 0.5, eyeY, 2.8).fill(0x78350f);

        // Pupil & Corneal Specular Glint
        simianHead.circle(headX - eyeSpacing + 0.5, eyeY, 1.4).fill(0x050505);
        simianHead.circle(headX + eyeSpacing + 0.5, eyeY, 1.4).fill(0x050505);

        simianHead.circle(headX - eyeSpacing + 1.2, eyeY - 1, 0.8).fill(0xffffff);
        simianHead.circle(headX + eyeSpacing + 1.2, eyeY - 1, 0.8).fill(0xffffff);

        // Anisotropic Fur Sheen Ridge
        simianFurSheen.clear();
        if (enableAnisotropicFur) {
          const sheenAlpha = isSunset ? 0.45 : isVolumetric ? 0.35 : 0.25;
          const sheenColor = isSunset ? 0xfdba74 : isVolumetric ? 0xa855f7 : 0xfde047;

          simianFurSheen.moveTo(headX - 18, headY - 18);
          simianFurSheen.quadraticCurveTo(headX, headY - 26, headX + 18, headY - 18);
          simianFurSheen.stroke({ color: sheenColor, width: 3, alpha: sheenAlpha });

          simianFurSheen.moveTo(simX - 10, simY - 45);
          simianFurSheen.quadraticCurveTo(simX + 15, simY - 48, simX + 32, simY - 40);
          simianFurSheen.stroke({ color: sheenColor, width: 3.5, alpha: sheenAlpha });
        }

        // ---------------------------------------------------------------------
        // 6. SKELETAL RIG OVERLAY
        // ---------------------------------------------------------------------
        skeletonGraphic.clear();
        if (showSkeletalRig) {
          skeletonGraphic.moveTo(simX, simY).lineTo(simX + 10, simY - 32); // Spine
          skeletonGraphic.lineTo(headX, headY); // Neck to Head
          skeletonGraphic.lineTo(simX + 42, simY - 5); // Shoulder to Elbow
          skeletonGraphic.lineTo(simX + 54, simY + 34); // Elbow to Wrist
          skeletonGraphic.moveTo(simX, simY).lineTo(simX - 34, simY + 28); // Hip to Knee
          skeletonGraphic.lineTo(simX - 8, simY + 38); // Knee to Ankle
          skeletonGraphic.stroke({ color: 0x22c55e, width: 2, alpha: 0.85 });

          // Joints
          const joints = [
            { x: simX, y: simY },
            { x: simX + 10, y: simY - 32 },
            { x: headX, y: headY },
            { x: simX + 42, y: simY - 5 },
            { x: simX + 54, y: simY + 34 },
            { x: simX - 34, y: simY + 28 },
            { x: simX - 8, y: simY + 38 },
          ];
          joints.forEach((j) => {
            skeletonGraphic.circle(j.x, j.y, 3.5).fill(0x4ade80);
          });
        }

        // ---------------------------------------------------------------------
        // 7. WEATHER & ATMOSPHERIC PARTICLE SIMULATION
        // ---------------------------------------------------------------------
        weatherGraphic.clear();
        const windFactor = windSpeedKmH / 20;

        particles.forEach((p) => {
          p.x += p.vx * windFactor;
          p.y += p.vy;

          if (p.x > curW * 0.8) p.x = -curW * 0.8;
          if (p.y > curH * 0.8) p.y = -curH * 0.8;
          if (p.y < -curH * 0.8) p.y = curH * 0.8;

          if (isMonsoon) {
            // High-speed rain streak
            weatherGraphic.moveTo(p.x, p.y);
            weatherGraphic.lineTo(p.x - p.vx * 2, p.y + p.vy * 2.5);
            weatherGraphic.stroke({ color: p.color, width: p.size, alpha: p.alpha });
          } else {
            // Glowing pollen / fungal spore
            weatherGraphic.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
          }
        });

        // ---------------------------------------------------------------------
        // 8. LIDAR SPATIAL POINT CLOUD (2,000+ POINTS)
        // ---------------------------------------------------------------------
        lidarGraphic.clear();
        if (showLiDARPointCloud) {
          const ptRot = elapsed * 0.4;
          const cosR = Math.cos(ptRot);
          const sinR = Math.sin(ptRot);

          lidarPoints.forEach((pt) => {
            const rotX = pt.rx * cosR - pt.rz * sinR;
            const rotY = pt.ry + (simY - 20);
            const ptAlpha = Math.sin(elapsed * 3 + pt.phase) * 0.35 + 0.55;
            lidarGraphic.circle(rotX, rotY, 1.4).fill({ color: 0x06b6d4, alpha: ptAlpha });
          });
        }

        // ---------------------------------------------------------------------
        // 9. CINEMATIC SCOPE OVERLAY (2.39:1 ANAMORPHIC BARS)
        // ---------------------------------------------------------------------
        scopeGraphic.clear();
        if (isWidescreenScope) {
          const targetH = curW / 2.39;
          const barH = Math.max(0, (curH - targetH) * 0.5);
          if (barH > 0) {
            scopeGraphic.rect(0, 0, curW, barH).fill(0x000000);
            scopeGraphic.rect(0, curH - barH, curW, barH).fill(0x000000);
          }
        }
      };

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    initPixi();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [
    activeScene.id,
    twin.species,
    twin.name,
    windSpeedKmH,
    showSkeletalRig,
    showLiDARPointCloud,
    enableSubsurfaceScattering,
    enableAnisotropicFur,
    isWidescreenScope,
  ]);

  const resetCamera = () => {
    cameraStateRef.current.targetZoom = 1.0;
    cameraStateRef.current.targetPanX = 0;
    cameraStateRef.current.targetPanY = 0;
  };

  const zoomIn = () => {
    cameraStateRef.current.targetZoom = Math.min(3.5, cameraStateRef.current.targetZoom * 1.25);
  };

  const zoomOut = () => {
    cameraStateRef.current.targetZoom = Math.max(0.6, cameraStateRef.current.targetZoom * 0.8);
  };

  return (
    <div className="relative w-full aspect-video bg-[#030712] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl group select-none">
      {/* Pixi.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
      />

      {/* Top-Left Telemetry & Pixi.js GPU HUD Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 text-xs shadow-2xl max-w-xs space-y-2 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono font-bold text-cyan-400 tracking-wider">PIXI.JS v8.21</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono text-[10px] border border-cyan-800/60 font-semibold">
            {fps} FPS
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">ENGINE PIPELINE</span>
            <span className="text-white font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              WebGL2 2.5D
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">DIGITAL TWIN</span>
            <span className="text-cyan-300 font-semibold truncate block">{twin.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">CANOPY WIND</span>
            <span className="text-white font-medium flex items-center gap-1">
              <Wind className="w-3 h-3 text-emerald-400" />
              {windSpeedKmH} km/h
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">STAGE ZOOM</span>
            <span className="text-amber-300 font-semibold">{zoomDisplay}%</span>
          </div>
        </div>

        {showEthologyOverlay && twin.ethologyProfile && (
          <div className="border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-300 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              Ethogram IK:
            </span>
            <span className="text-cyan-300 font-mono font-medium">
              {twin.ethologyProfile.tailLanguageRepertoire[0]?.context || 'Active Alert'}
            </span>
          </div>
        )}
      </div>

      {/* Floating Interactive Stage Controls (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl">
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Interactive Helper Toast */}
      <div className="absolute bottom-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/75 backdrop-blur-sm border border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 font-mono flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Drag to Pan • Wheel/Pinch to Zoom • PixiJS v8 2.5D Rig</span>
      </div>
    </div>
  );
};

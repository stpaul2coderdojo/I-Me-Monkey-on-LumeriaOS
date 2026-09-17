import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CinematicUsdScene, MonkeyDigitalTwin, WindPhysicsProfile } from '../types';
import { CINEMATIC_USD_SCENES } from '../data/cinematicUsdScenes';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  Code,
  Download,
  Copy,
  Check,
  Eye,
  Box,
  Trees,
  Compass,
  Activity,
  Heart,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  Wand2,
  Loader2,
  X,
  RefreshCw,
  SlidersHorizontal,
  Wind,
  Flower,
  Cpu
} from 'lucide-react';
import { OpenGlMonkeyStage } from './OpenGlMonkeyStage';

// Image caching system for high-resolution USD plates and primate portraits
const imageCache = new Map<string, HTMLImageElement>();
function getCachedImage(src?: string): HTMLImageElement | null {
  if (!src) return null;
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imageCache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

interface CinematicUsdStageProps {
  selectedTwin: MonkeyDigitalTwin;
  allTwins: MonkeyDigitalTwin[];
  onSelectTwin: (twinId: string) => void;
  onNavigateToGovernance?: () => void;
  onNavigateToWalletPass?: () => void;
  scenes?: CinematicUsdScene[];
  onAddScene?: (scene: CinematicUsdScene) => void;
}

export const CinematicUsdStage: React.FC<CinematicUsdStageProps> = ({
  selectedTwin,
  allTwins,
  onSelectTwin,
  onNavigateToGovernance,
  onNavigateToWalletPass,
  scenes,
  onAddScene,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scene reel state (supports default and dynamically generated scenes)
  const [scenesList, setScenesList] = useState<CinematicUsdScene[]>(scenes || CINEMATIC_USD_SCENES);
  
  // Sync if parent updates scenes
  useEffect(() => {
    if (scenes && scenes.length > 0) {
      setScenesList(scenes);
    }
  }, [scenes]);

  // Active scene state
  const [activeSceneId, setActiveSceneId] = useState<string>('emerald-dawn');
  const activeScene = useMemo(() => {
    return scenesList.find((s) => s.id === activeSceneId) || scenesList[0] || CINEMATIC_USD_SCENES[0];
  }, [scenesList, activeSceneId]);

  // Viewport mode
  const [viewportTab, setViewportTab] = useState<'cinematic' | 'usda-code' | 'render-passes'>('cinematic');
  const [renderEngine, setRenderEngine] = useState<'opengl-3d' | 'canvas-composite'>('opengl-3d');

  // Animation & Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(30);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWidescreenScope, setIsWidescreenScope] = useState<boolean>(true); // 2.39:1 Anamorphic
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Google Antigravity Agent Scene Generation Modal State
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [agentStep, setAgentStep] = useState<string>('');
  const [genAtoll, setGenAtoll] = useState<string>('Majuro Atoll');
  const [genPrimate, setGenPrimate] = useState<string>(selectedTwin.name);
  const [genTimeOfDay, setGenTimeOfDay] = useState<string>('Golden Hour Sunset');
  const [genCameraLens, setGenCameraLens] = useState<string>('50mm Anamorphic Prime f/1.2');
  const [genEnvironmentMood, setGenEnvironmentMood] = useState<string>('Miyawaki Bio-Corridor High Canopy');
  const [genNotes, setGenNotes] = useState<string>('');
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccessToast, setGenSuccessToast] = useState<string | null>(null);

  // Keep genPrimate synced with selectedTwin if modal closed
  useEffect(() => {
    if (!showGenerateModal) {
      setGenPrimate(selectedTwin.name);
    }
  }, [selectedTwin, showGenerateModal]);

  // Camera preset & manual orbit
  const [activeCameraAngle, setActiveCameraAngle] = useState<string>(activeScene.cameraAngles[0].id);
  const [orbitAngle, setOrbitAngle] = useState<number>(0);
  const [orbitPitch, setOrbitPitch] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hyperrealism Shader Toggles
  const [enableSubsurfaceScattering, setEnableSubsurfaceScattering] = useState<boolean>(true);
  const [enableAnisotropicFur, setEnableAnisotropicFur] = useState<boolean>(true);
  const [enableDepthOfField, setEnableDepthOfField] = useState<boolean>(true);
  const [enableVolumetricAtmosphere, setEnableVolumetricAtmosphere] = useState<boolean>(true);
  const [showSkeletalRig, setShowSkeletalRig] = useState<boolean>(false);
  const [showLiDARPointCloud, setShowLiDARPointCloud] = useState<boolean>(false);

  // Dynamic Wind Physics and Interactive Controls
  const [windSpeedKmH, setWindSpeedKmH] = useState<number>(
    activeScene.windPhysics?.windSpeedKmH || 24
  );
  const [gustiness, setGustiness] = useState<number>(
    activeScene.windPhysics?.gustiness || 0.45
  );
  const [windDirectionDeg, setWindDirectionDeg] = useState<number>(
    activeScene.windPhysics?.directionDegrees || 72
  );
  const [showWindPanel, setShowWindPanel] = useState<boolean>(false);
  const [showEthologyOverlay, setShowEthologyOverlay] = useState<boolean>(true);

  // Pre-load all environment plates and primate portraits for instantaneous rendering
  useEffect(() => {
    scenesList.forEach((scene) => {
      if (scene.highResImageUrl) {
        getCachedImage(scene.highResImageUrl);
      }
    });
    allTwins.forEach((twin) => {
      if (twin.imageUrl) {
        getCachedImage(twin.imageUrl);
      }
    });
  }, [scenesList, allTwins]);

  // Sync wind physics when active scene changes
  useEffect(() => {
    if (activeScene.windPhysics) {
      setWindSpeedKmH(activeScene.windPhysics.windSpeedKmH);
      setGustiness(activeScene.windPhysics.gustiness);
      setWindDirectionDeg(activeScene.windPhysics.directionDegrees);
    }
  }, [activeSceneId, activeScene]);

  // ResizeObserver for DPR-aware 16:9 viewport canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const displayWidth = rect.width;
      const displayHeight = rect.width * (9 / 16);

      const targetW = Math.round(displayWidth * dpr);
      const targetH = Math.round(displayHeight * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    const ro = new ResizeObserver(() => {
      updateDimensions();
    });
    ro.observe(container);
    updateDimensions();

    return () => ro.disconnect();
  }, [viewportTab]);

  // Web Audio Context reference for generative ambient soundscape
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ masterGain: GainNode | null; oceanGain: GainNode | null; windGain: GainNode | null }>({
    masterGain: null,
    oceanGain: null,
    windGain: null,
  });

  // Keep camera angle updated when scene changes
  useEffect(() => {
    if (activeScene.cameraAngles.length > 0) {
      setActiveCameraAngle(activeScene.cameraAngles[0].id);
    }
  }, [activeSceneId]);

  // Ambient sound synthesizer
  const toggleAudio = () => {
    if (isAudioMuted) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Pink noise generator for Pacific ocean waves & canopy trade breeze
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for ocean rumble
        const oceanFilter = ctx.createBiquadFilter();
        oceanFilter.type = 'lowpass';
        oceanFilter.frequency.setValueAtTime(240, ctx.currentTime);

        const oceanGain = ctx.createGain();
        oceanGain.gain.setValueAtTime(0.4, ctx.currentTime);

        whiteNoise.connect(oceanFilter);
        oceanFilter.connect(oceanGain);
        oceanGain.connect(masterGain);

        whiteNoise.start();

        // LFO for wave swelling
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Wave every ~8 seconds
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.2, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oceanGain.gain);
        lfo.start();

        ambientNodesRef.current = { masterGain, oceanGain, windGain: null };
        setIsAudioMuted(false);
      } catch (err) {
        console.warn('Audio context init deferred:', err);
        setIsAudioMuted(true);
      }
    } else {
      if (ambientNodesRef.current.masterGain && audioCtxRef.current) {
        ambientNodesRef.current.masterGain.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
      setIsAudioMuted(true);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Frame tick loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setCurrentFrame((prev) => {
          const next = prev + dt * 60 * playbackSpeed;
          return next >= 360 ? 0 : next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  // Main Canvas Render Loop (Retina DPR-Aware 1920x1080 Logical Space)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Physical canvas buffer dimensions
    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    // Time calculations
    const timeNorm = (currentFrame % 360) / 360;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Save initial state & scale to standard 1920x1080 16:9 logical stage
    ctx.save();
    ctx.scale(width / 1920, height / 1080);
    const W = 1920;
    const H = 1080;

    // 1. HIGH-RES ENVIRONMENT & BACKGROUND SKY / PLATE
    drawEnvironment(ctx, W, H, activeSceneId, timeNorm, enableVolumetricAtmosphere, orbitAngle, activeScene);

    // 2. BACKGROUND CANOPY & VEGETATION (DEPTH LAYERS)
    drawBackgroundCanopy(ctx, W, H, activeSceneId, timeNorm, enableDepthOfField);

    // 3. CINEMATIC GODRAYS / BIOLUMINESCENCE ATMOSPHERE
    if (enableVolumetricAtmosphere) {
      drawAtmosphereFx(ctx, W, H, activeSceneId, timeNorm);
    }

    // 4. ANIMATED FLORAL ELEMENTS & TREES IN REALISTIC WIND
    drawAnimatedFloraAndWind(
      ctx,
      W,
      H,
      timeNorm,
      activeSceneId,
      windSpeedKmH,
      gustiness,
      windDirectionDeg,
      activeScene.windPhysics
    );

    // 5. MAIN CANOPY BRANCH & FOREGROUND VINES
    drawMainCanopyPerch(ctx, W, H, activeSceneId, timeNorm);

    // 6. HYPERREALISTIC SIMIAN CHARACTER RIG, ETHOLOGY & PORTRAIT COMPOSITE
    drawHyperrealisticSimian(
      ctx,
      W,
      H,
      activeSceneId,
      timeNorm,
      selectedTwin,
      activeCameraAngle,
      orbitAngle,
      orbitPitch,
      {
        enableSubsurfaceScattering,
        enableAnisotropicFur,
        showSkeletalRig,
        showLiDARPointCloud,
      },
      showEthologyOverlay,
      windSpeedKmH,
      windDirectionDeg
    );

    // 7. FOREGROUND FOLIAGE & DEPTH OF FIELD BOKEH
    if (enableDepthOfField) {
      drawForegroundBokeh(ctx, W, H, activeSceneId, timeNorm);
    }

    // 8. CINEMATIC WIDESCREEN BARS (2.39:1 Anamorphic Scope)
    if (isWidescreenScope) {
      const barHeight = H * 0.085;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, barHeight);
      ctx.fillRect(0, H - barHeight, W, barHeight);

      // Subtle aspect ratio stamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '14px monospace';
      ctx.fillText('2.39:1 ANAMORPHIC SCOPE', 40, barHeight - 14);
      ctx.fillText('LUMERIAOS USD 60FPS • 1920×1080 RETINA RENDER', W - 440, barHeight - 14);
    }

    ctx.restore();
  }, [
    currentFrame,
    activeSceneId,
    selectedTwin,
    activeCameraAngle,
    orbitAngle,
    orbitPitch,
    enableSubsurfaceScattering,
    enableAnisotropicFur,
    enableDepthOfField,
    enableVolumetricAtmosphere,
    showSkeletalRig,
    showLiDARPointCloud,
    isWidescreenScope,
    windSpeedKmH,
    gustiness,
    windDirectionDeg,
    showEthologyOverlay,
    activeScene,
  ]);

  // Mouse drag handlers for manual 3D orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setOrbitAngle((prev) => prev + dx * 0.008);
    setOrbitPitch((prev) => Math.max(-0.4, Math.min(0.4, prev + dy * 0.006)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyUsd = () => {
    navigator.clipboard.writeText(activeScene.usdaCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadUsda = () => {
    const blob = new Blob([activeScene.usdaCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeScene.id}_hyperreal_usd.usda`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSceneWithAntigravity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);
    setAgentStep('Connecting to Google Antigravity Agent...');

    try {
      setTimeout(() => setAgentStep('Grounding Marshall Islands atoll geography & coral canopy...'), 600);
      setTimeout(() => setAgentStep('Synthesizing Pixar USDA 1.0 scene & anisotropic grooming...'), 1400);
      setTimeout(() => setAgentStep('Raytracing lighting setup in ACEScg color space...'), 2200);

      const res = await fetch('/api/antigravity/generate-hd-usd-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atoll: genAtoll,
          primateName: genPrimate,
          timeOfDay: genTimeOfDay,
          cameraLens: genCameraLens,
          environmentMood: genEnvironmentMood,
          userInstructions: genNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.scene) {
        throw new Error(data.error || 'Failed to generate HD Cinematic USD Scene');
      }

      const newScene: CinematicUsdScene = data.scene;
      
      setScenesList((prev) => {
        const filtered = prev.filter((s) => s.id !== newScene.id);
        return [newScene, ...filtered];
      });

      if (onAddScene) {
        onAddScene(newScene);
      }

      setActiveSceneId(newScene.id);
      setShowGenerateModal(false);
      setGenSuccessToast(`HD Cinematic Scene "${newScene.title}" rendered by Google Antigravity Agent!`);
      setTimeout(() => setGenSuccessToast(null), 5000);
    } catch (err: any) {
      setGenError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
      setAgentStep('');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner & Scene Selector Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Cinematic Pixar USD Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-cyan-300 font-mono">Hyperrealistic Simian Twin Rig v4.2</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-amber-300 font-medium">Marshall Islands Haven Sanctuary</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Cinematic USD Scenes</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                ACEScg PBR
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Experience the digital twin of <span className="text-emerald-300 font-bold">{selectedTwin.name}</span> rendered in hyperrealism across cinematic lighting setups, volumetric Pacific atmospheres, and multi-strand anisotropic fur shaders in the Republic of the Marshall Islands.
            </p>
          </div>

          {/* Primate Star Switcher */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-mono">Hero Simian Twin</span>
              <span className="text-xs font-bold text-white">{selectedTwin.name}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xs sm:max-w-none">
              {allTwins.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTwin(t.id)}
                  className={`relative rounded-xl overflow-hidden p-0.5 transition-all flex-shrink-0 ${
                    t.id === selectedTwin.id
                      ? 'ring-2 ring-emerald-400 scale-105 shadow-md shadow-emerald-500/30'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`Star ${t.name} in Cinematic USD Scene`}
                >
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    className="w-9 h-9 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center font-bold text-slate-200">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scene Selector Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {scenesList.map((scene) => {
            const isSelected = scene.id === activeSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => setActiveSceneId(scene.id)}
                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-400/80 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: scene.moodColor }}
                  ></span>
                  <span className="text-[10px] font-mono text-slate-400">{scene.timeOfDay}</span>
                </div>

                <div className="font-bold text-xs text-white line-clamp-1">{scene.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{scene.subtitle}</div>

                <div className="mt-2 text-[9px] font-mono text-emerald-400/90 truncate flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5 flex-shrink-0" />
                  <span>{scene.cameraFocalLength.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}

          {/* Antigravity Autonomous Agent Scene Generator Button */}
          <button
            onClick={() => {
              setGenPrimate(selectedTwin.name);
              setShowGenerateModal(true);
            }}
            className="text-left p-3 rounded-xl border border-dashed border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-sm"
            title="Generate new HD Cinematic USD Scene with Google Antigravity Agent"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                AI AGENT
              </span>
            </div>

            <div>
              <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>+ Generate USD Schema</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Marshall Islands USD Scene</div>
            </div>

            <div className="mt-2 text-[9px] font-mono text-cyan-400 flex items-center gap-1">
              <Wand2 className="w-2.5 h-2.5" />
              <span>Google Antigravity</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Cinematic USD Viewport Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Viewport Top Header & Control Toolbar */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Active Scene & Stage Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white font-mono">{activeScene.title}</span>
            </div>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              {activeScene.location}
            </span>
          </div>

          {/* Center: Viewport Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewportTab('cinematic')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewportTab === 'cinematic'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cinematic Render
            </button>
            <button
              onClick={() => setViewportTab('usda-code')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewportTab === 'usda-code'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pixar USDA Stage
            </button>
            <button
              onClick={() => setViewportTab('render-passes')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewportTab === 'render-passes'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PBR Shaders & Rig
            </button>
          </div>

          {/* Right: Render Engine Selector, Sound, Widescreen & Fullscreen Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* OpenGL 3D vs 2D Canvas Engine Toggle */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setRenderEngine('opengl-3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  renderEngine === 'opengl-3d'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
                title="Three.js WebGL / OpenGL 3D Hardware Accelerated Stage"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>OpenGL 3D</span>
              </button>
              <button
                onClick={() => setRenderEngine('canvas-composite')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  renderEngine === 'canvas-composite'
                    ? 'bg-slate-800 text-slate-200 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
                title="2D Canvas Composite Fallback"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Canvas</span>
              </button>
            </div>

            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-semibold ${
                !isAudioMuted
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={isAudioMuted ? 'Unmute Pacific Ocean & Canopy Soundscape' : 'Mute Soundscape'}
            >
              {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{!isAudioMuted ? 'Ambience On' : 'Ambience'}</span>
            </button>

            <button
              onClick={() => setIsWidescreenScope(!isWidescreenScope)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                isWidescreenScope
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle 2.39:1 Anamorphic Scope Letterboxing"
            >
              2.39:1 Scope
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* TAB 1: Real-Time Interactive Cinematic Viewport */}
        {viewportTab === 'cinematic' && (
          renderEngine === 'opengl-3d' ? (
            <OpenGlMonkeyStage
              twin={selectedTwin}
              activeScene={activeScene}
              windSpeedKmH={windSpeedKmH}
              gustiness={gustiness}
              windDirectionDeg={windDirectionDeg}
              cameraAnglePreset={activeCameraAngle}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              showSkeletalRig={showSkeletalRig}
              showLiDARPointCloud={showLiDARPointCloud}
              enableSubsurfaceScattering={enableSubsurfaceScattering}
              enableAnisotropicFur={enableAnisotropicFur}
              isWidescreenScope={isWidescreenScope}
              showEthologyOverlay={showEthologyOverlay}
            />
          ) : (
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] bg-[#020509] select-none overflow-hidden flex items-center justify-center"
          >
            {/* HTML5 Canvas Surface (Dynamic DPR-Aware 16:9) */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
            />

            {/* Top-Left Telemetry & Biometrics HUD Overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 text-xs shadow-2xl max-w-xs space-y-1.5 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-white font-mono">{selectedTwin.name}</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div>
                  <span className="text-slate-400 text-[9px] block">Rehab Stability</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {100 - selectedTwin.lumeriaOsAnimation.biometrics.stressIndex}% Calm
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] block">Stress Index</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedTwin.lumeriaOsAnimation.biometrics.stressIndex}/100 (Peaceful)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] block">Trade Wind</span>
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    {windSpeedKmH} km/h
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] block">Camera Focus</span>
                  <span className="text-amber-300 font-bold">{activeScene.cameraFocalLength.split(' ')[0]}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Sanctuary: {selectedTwin.rehabHavenLocation.atoll}</span>
                <span className="text-emerald-400 font-semibold">{activeScene.weather.split(' ')[0]}</span>
              </div>
            </div>

            {/* Top-Right Camera Angle & Shot Presets */}
            <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5 text-xs shadow-2xl space-y-1.5 pointer-events-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>Cinematic Shot Angle</span>
              </div>

              <div className="flex flex-col gap-1">
                {activeScene.cameraAngles.map((angle) => (
                  <button
                    key={angle.id}
                    onClick={() => setActiveCameraAngle(angle.id)}
                    className={`text-left px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      activeCameraAngle === angle.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-800/80 text-[9px] text-slate-500 text-center">
                Click & drag canvas to orbit 3D
              </div>
            </div>

            {/* Floating Interactive Trade Wind & Flora Physics Panel (Toggled via Pill Bar) */}
            {showWindPanel && (
              <div className="absolute bottom-16 left-4 bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 text-xs shadow-2xl space-y-3 pointer-events-auto w-72">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Flora & Wind Dynamics</span>
                  </div>
                  <button
                    onClick={() => setShowWindPanel(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Pacific Trade Breeze</span>
                      <span className="font-mono text-cyan-300 font-bold">{windSpeedKmH} km/h</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={55}
                      value={windSpeedKmH}
                      onChange={(e) => setWindSpeedKmH(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Turbulence Gustiness</span>
                      <span className="font-mono text-emerald-300 font-bold">{Math.round(gustiness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={gustiness}
                      onChange={(e) => setGustiness(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Wind Azimuth Angle</span>
                      <span className="font-mono text-amber-300 font-bold">{windDirectionDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={5}
                      value={windDirectionDeg}
                      onChange={(e) => setWindDirectionDeg(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Flower className="w-3 h-3 text-rose-400" />
                      Hibiscus & Plumeria
                    </span>
                    <span className="text-emerald-400 font-mono">Dynamic Flex Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom-Center Interactive Shaders & Overlays Pill Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xl pointer-events-auto text-[11px]">
              <button
                onClick={() => setShowWindPanel(!showWindPanel)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  showWindPanel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Pacific Trade Wind & Flora Physics Controls"
              >
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Wind: {windSpeedKmH}km/h</span>
              </button>

              <button
                onClick={() => setShowEthologyOverlay(!showEthologyOverlay)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  showEthologyOverlay
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Species Ethology Tail Rig & Bioacoustic Vector Overlay"
              >
                <Activity className="w-3 h-3 text-purple-400" />
                <span>Ethology HUD</span>
              </button>

              <div className="w-[1px] h-3.5 bg-slate-800 hidden sm:block"></div>

              <button
                onClick={() => setEnableSubsurfaceScattering(!enableSubsurfaceScattering)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  enableSubsurfaceScattering
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Subsurface Scattering (Translucent Ear Cartilage & Epidermis)"
              >
                SSS
              </button>

              <button
                onClick={() => setEnableAnisotropicFur(!enableAnisotropicFur)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  enableAnisotropicFur
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Multi-strand Anisotropic Fur Sheen & Rim Highlight"
              >
                Fur
              </button>

              <button
                onClick={() => setEnableDepthOfField(!enableDepthOfField)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  enableDepthOfField
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Cinematic Depth of Field (DoF Bokeh Blur)"
              >
                DoF
              </button>

              <button
                onClick={() => setEnableVolumetricAtmosphere(!enableVolumetricAtmosphere)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  enableVolumetricAtmosphere
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Volumetric Godrays & Pacific Mist"
              >
                Volumetrics
              </button>

              <button
                onClick={() => setShowSkeletalRig(!showSkeletalRig)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  showSkeletalRig
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Skeletal Kinematic USD Bones & Joints"
              >
                IK Bones
              </button>
            </div>

            {/* Bottom-Right Frame & FPS Indicator */}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-auto">
              <span>{Math.round(currentFrame)}f / 360f</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">60.0 FPS</span>
            </div>
          </div>
          )
        )}

        {/* TAB 2: Pixar USDA 1.0 Code View */}
        {viewportTab === 'usda-code' && (
          <div className="p-5 bg-[#070b12] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-slate-200 font-semibold">{activeScene.usdScenePath}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                  Pixar USDA 1.0 (ASCII)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyUsd}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied USDA' : 'Copy USDA'}</span>
                </button>

                <button
                  onClick={handleDownloadUsda}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .usda</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300/95 overflow-x-auto max-h-[420px] leading-relaxed select-text shadow-inner">
              {activeScene.usdaCode}
            </pre>
          </div>
        )}

        {/* TAB 3: PBR Shaders & Rig Inspector */}
        {viewportTab === 'render-passes' && (
          <div className="p-5 bg-[#070b12] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-sm">
                OpenPBR / UsdPreviewSurface Materials & Kinematics
              </h3>
              <span className="font-mono text-cyan-300 text-[11px]">
                Target: {selectedTwin.species}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Material 1: Epidermis SSS */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center justify-between">
                  <span>Epidermis Subsurface</span>
                  <span className="text-[10px] font-mono text-slate-500">UsdShade</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">subsurfaceColor:</span>
                    <span className="text-rose-400">RGB(0.85, 0.24, 0.12)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">subsurfaceRadius:</span>
                    <span className="text-amber-300">1.85mm (Cartilage)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">roughness:</span>
                    <span className="text-cyan-300">0.32 (Moist)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ior:</span>
                    <span className="text-white">1.45 (Primate Tissue)</span>
                  </div>
                </div>
              </div>

              {/* Material 2: Anisotropic Fur Groom */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-amber-300 flex items-center justify-between">
                  <span>Anisotropic Fur Groom</span>
                  <span className="text-[10px] font-mono text-slate-500">Curves USD</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">strandCount:</span>
                    <span className="text-white">450,000 instanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">specularShift:</span>
                    <span className="text-amber-400">0.08 rad</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">medullaScatter:</span>
                    <span className="text-emerald-400">0.42 (Golden Core)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">wetnessWeight:</span>
                    <span className="text-cyan-300">{activeScene.id === 'tropical-monsoon' ? '0.95 (Wet)' : '0.05'}</span>
                  </div>
                </div>
              </div>

              {/* Material 3: Kinematic Skeletal IK */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-purple-300 flex items-center justify-between">
                  <span>Kinematic SkelRoot</span>
                  <span className="text-[10px] font-mono text-slate-500">UsdSkel</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">jointNodes:</span>
                    <span className="text-white">48 articulated joints</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">spineFlexRange:</span>
                    <span className="text-purple-300">-28° to +42°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">tailVerletSegments:</span>
                    <span className="text-emerald-300">8 dynamic segments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">prehensileIK:</span>
                    <span className="text-cyan-400">Active Hand & Foot Bough Grip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Viewport Playback & Timeline Controls Toolbar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Play, Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30"
              title={isPlaying ? 'Pause Animation' : 'Play Cinematic Animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() => {
                setCurrentFrame(0);
                setOrbitAngle(0);
                setOrbitPitch(0);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Reset Frame & Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Playback Speed Multipliers */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {[0.25, 0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    playbackSpeed === spd ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`}
                  title={`${spd}x Speed`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="flex-1 max-w-md mx-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500">0f</span>
            <input
              type="range"
              min="0"
              max="360"
              value={Math.round(currentFrame)}
              onChange={(e) => {
                setCurrentFrame(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-500">360f</span>
          </div>

          {/* Camera Info Badge */}
          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Lens: {activeScene.cameraFocalLength}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{activeScene.lightingSetup.split(',')[0]}</span>
          </div>
        </div>
      </div>

      {/* Success Toast Notification */}
      {genSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-950 border border-emerald-400 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-spin" />
          <div className="text-xs">
            <span className="font-bold block text-white">Scene Generated Successfully</span>
            <span>{genSuccessToast}</span>
          </div>
          <button
            onClick={() => setGenSuccessToast(null)}
            className="text-emerald-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Google Antigravity Agent Scene Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Ambient background glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <span>Google Antigravity Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Autonomous USD Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synthesize HD Pixar USD 1.0 cinematic scenes set in the Marshall Islands
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isGenerating && setShowGenerateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                disabled={isGenerating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSceneWithAntigravity} className="mt-4 space-y-4">
              {genError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                  {genError}
                </div>
              )}

              {/* Marshall Islands Atoll */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Marshall Islands Atoll Sanctuary</span>
                  <span className="text-[10px] text-emerald-400 font-mono">GPS Coordinates Verified</span>
                </label>
                <select
                  value={genAtoll}
                  onChange={(e) => setGenAtoll(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="Majuro Atoll">Majuro Atoll (7.1167° N, 171.1833° E) - Capital Sanctuary</option>
                  <option value="Jaluit Atoll">Jaluit Atoll (5.9167° N, 169.5833° E) - Protected Marine Biosphere</option>
                  <option value="Arno Atoll">Arno Atoll (7.0500° N, 171.5500° E) - Miyawaki Agroforestry Corridor</option>
                  <option value="Rongelap Atoll">Rongelap Atoll (11.1500° N, 166.8833° E) - Ecological Regeneration Haven</option>
                  <option value="Kwajalein Atoll">Kwajalein Atoll (9.1833° N, 167.4500° E) - Deep Lagoon Coral Fringe</option>
                </select>
              </div>

              {/* Protagonist Primate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Featured Simian Digital Twin
                  </label>
                  <select
                    value={genPrimate}
                    onChange={(e) => setGenPrimate(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {allTwins.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Atmosphere & Time of Day
                  </label>
                  <select
                    value={genTimeOfDay}
                    onChange={(e) => setGenTimeOfDay(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="Golden Hour Sunset">Golden Hour Sunset (Warm Pacific Glow)</option>
                    <option value="Emerald Dawn Godrays">Emerald Dawn Godrays (Volumetric Atoll Mist)</option>
                    <option value="Tropical Monsoon Bioluminescence">Tropical Monsoon Bioluminescence (Nocturnal Rain)</option>
                    <option value="Moonlit Pacific Starlight">Moonlit Pacific Starlight (Clear Night Lagoon)</option>
                    <option value="Midday Marine Caustics">Midday Marine Caustics (High Sun Turquoise)</option>
                  </select>
                </div>
              </div>

              {/* Optics & Canopy Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Camera Rig & Lens Optics
                  </label>
                  <select
                    value={genCameraLens}
                    onChange={(e) => setGenCameraLens(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="50mm Anamorphic Prime f/1.2">50mm Anamorphic Prime f/1.2 (Cinematic Bokeh)</option>
                    <option value="85mm Macro Portrait f/1.4">85mm Macro Portrait f/1.4 (Fur & Whisker Focus)</option>
                    <option value="24mm Ultra-Wide Cinema f/2.8">24mm Ultra-Wide Cinema f/2.8 (Panoramic Atoll View)</option>
                    <option value="200mm Telephoto Wildlife f/2.0">200mm Telephoto Wildlife f/2.0 (Intimate Wildlife Observation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Canopy & Habitat Architecture
                  </label>
                  <select
                    value={genEnvironmentMood}
                    onChange={(e) => setGenEnvironmentMood(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="Miyawaki Bio-Corridor High Canopy">Miyawaki Bio-Corridor High Canopy</option>
                    <option value="Pacific Mangrove Coral Fringe">Pacific Mangrove Coral Fringe</option>
                    <option value="Ancient Breadfruit & Teak Boughs">Ancient Breadfruit & Teak Boughs</option>
                    <option value="Autonomous Solar Observation Perch">Autonomous Solar Observation Perch</option>
                  </select>
                </div>
              </div>

              {/* Custom Directing Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Directorial Notes & Custom Instructions</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <textarea
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  disabled={isGenerating}
                  rows={2}
                  placeholder="e.g. Highlight grooming on the arm fur, gentle ocean waves crashing against outer reef crest in background..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                ></textarea>
              </div>

              {/* Agent Progress Feedback */}
              {isGenerating && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{agentStep || 'Generating Pixar USD scene...'}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full animate-pulse w-3/4"></div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Google Antigravity Agent v2.4 • ACEScg PBR Shader Compiler
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Scene...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate HD Cinematic USD Scene</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   CANVAS RENDERING HELPER FUNCTIONS
   ========================================================================= */

/** Draw background sky and Pacific Horizon or High-Resolution Environment Plate */
function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number,
  volumetric: boolean,
  orbitAngle: number,
  activeScene?: CinematicUsdScene
) {
  // If a high-resolution environment image is cached, draw it directly on the canvas!
  const bgImg = activeScene?.highResImageUrl ? getCachedImage(activeScene.highResImageUrl) : null;
  if (bgImg) {
    ctx.save();
    // Parallax motion based on 3D orbit angle and subtle ocean swell
    const panX = -orbitAngle * 80;
    const panY = Math.sin(t * Math.PI * 2) * 8;
    ctx.drawImage(bgImg, panX - 40, panY - 30, w + 80, h + 60);

    // Subtle atmospheric tint matching the scene's lighting profile
    const timeLower = (activeScene?.timeOfDay || '').toLowerCase();
    if (sceneId === 'emerald-dawn' || timeLower.includes('dawn')) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fillRect(0, 0, w, h);
    } else if (sceneId === 'pacific-sunset' || timeLower.includes('sunset')) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fillRect(0, 0, w, h);
    } else if (sceneId === 'tropical-monsoon' || timeLower.includes('monsoon')) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    return;
  }

  // Fallback procedural sky and Pacific Horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  const timeLower = (activeScene?.timeOfDay || '').toLowerCase();

  if (sceneId === 'emerald-dawn' || timeLower.includes('dawn') || timeLower.includes('morning')) {
    skyGrad.addColorStop(0, '#041d24');
    skyGrad.addColorStop(0.45, '#0b4743');
    skyGrad.addColorStop(0.75, '#c2883f');
    skyGrad.addColorStop(1, '#f5ba63');
  } else if (sceneId === 'pacific-sunset' || timeLower.includes('sunset') || timeLower.includes('dusk') || timeLower.includes('golden')) {
    skyGrad.addColorStop(0, '#1a0b2e');
    skyGrad.addColorStop(0.4, '#4a154b');
    skyGrad.addColorStop(0.7, '#c2410c');
    skyGrad.addColorStop(1, '#ea580c');
  } else if (sceneId === 'tropical-monsoon' || timeLower.includes('monsoon') || timeLower.includes('night') || timeLower.includes('moon')) {
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.5, '#09152b');
    skyGrad.addColorStop(1, '#062038');
  } else if (sceneId === 'sanctuary-awakening' || timeLower.includes('day') || timeLower.includes('noon') || timeLower.includes('radiance')) {
    skyGrad.addColorStop(0, '#0369a1');
    skyGrad.addColorStop(0.5, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
  } else {
    // Volumetric scan studio or fallback
    skyGrad.addColorStop(0, '#0a0a14');
    skyGrad.addColorStop(0.5, '#0f172a');
    skyGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Pacific Lagoon ocean surface (lower 35%)
  if (sceneId !== 'volumetric-scan') {
    const lagoonY = h * 0.65;
    const oceanGrad = ctx.createLinearGradient(0, lagoonY, 0, h);

    if (sceneId === 'emerald-dawn' || timeLower.includes('dawn')) {
      oceanGrad.addColorStop(0, '#0d9488');
      oceanGrad.addColorStop(1, '#044e47');
    } else if (sceneId === 'pacific-sunset' || timeLower.includes('sunset') || timeLower.includes('golden')) {
      oceanGrad.addColorStop(0, '#9a3412');
      oceanGrad.addColorStop(0.4, '#0369a1');
      oceanGrad.addColorStop(1, '#0f172a');
    } else if (sceneId === 'tropical-monsoon' || timeLower.includes('night') || timeLower.includes('monsoon')) {
      oceanGrad.addColorStop(0, '#0f314d');
      oceanGrad.addColorStop(1, '#031424');
    } else {
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(1, '#0369a1');
    }

    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.moveTo(0, lagoonY);
    for (let x = 0; x <= w; x += 40) {
      const wave = Math.sin((x / 60) + t * Math.PI * 4) * 3;
      ctx.lineTo(x, lagoonY + wave);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Shimmering specular caustics on lagoon
    ctx.strokeStyle = sceneId === 'pacific-sunset' ? 'rgba(251, 146, 60, 0.4)' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = lagoonY + 15 + i * 18;
      ctx.beginPath();
      const waveOffset = (t * 80 + i * 35) % w;
      ctx.moveTo((waveOffset + 100) % w, y);
      ctx.lineTo((waveOffset + 240) % w, y);
      ctx.stroke();
    }
  } else {
    // Studio LiDAR Grid Matrix
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Concentric Turntable Stage Rings
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.78, 220, 65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.78, 140, 42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** Draw dense background Miyawaki canopy clusters */
function drawBackgroundCanopy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number,
  dof: boolean
) {
  if (sceneId === 'volumetric-scan') return;

  ctx.save();
  // We use soft alpha rather than heavy ctx.filter blur to prevent canvas softness
  if (dof) {
    ctx.globalAlpha = 0.82;
  }

  // Silhouette of distant Marshall atoll palms & breadfruit
  ctx.fillStyle = sceneId === 'pacific-sunset' ? '#2e0f1a' : '#042820';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.quadraticCurveTo(w * 0.25, h * 0.42, w * 0.5, h * 0.58);
  ctx.quadraticCurveTo(w * 0.75, h * 0.38, w, h * 0.52);
  ctx.lineTo(w, h * 0.65);
  ctx.lineTo(0, h * 0.65);
  ctx.closePath();
  ctx.fill();

  // Mid-tier Miyawaki canopy foliage crowns
  const foliageColor = sceneId === 'pacific-sunset' ? '#451a03' : '#064e3b';
  ctx.fillStyle = foliageColor;

  const treeX = [120, 260, 480, 720, 860];
  treeX.forEach((x, idx) => {
    const radius = 90 + (idx % 3) * 20;
    const y = h * 0.52 - (idx % 2) * 30;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/** Draw animated Marshall Islands floral elements and trees with realistic motion in wind */
function drawAnimatedFloraAndWind(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  sceneId: string,
  windSpeedKmH: number,
  gustiness: number,
  windDirectionDeg: number,
  windProfile?: WindPhysicsProfile
) {
  if (sceneId === 'volumetric-scan') return;

  ctx.save();

  // Wind speed scalar (10km/h = gentle, 35km/h = strong ocean tradewind)
  const speedNorm = Math.max(0.2, windSpeedKmH / 30);
  const gustWave = Math.sin(t * Math.PI * 6 + gustiness * 4) * gustiness * 0.45;
  const totalSway = speedNorm + gustWave;

  // Direction vector (-1 to 1)
  const dirRad = (windDirectionDeg * Math.PI) / 180;
  const dirX = Math.cos(dirRad);

  // 1. WIND-SWAYING COCONUT PALM & BREADFRUIT BRANCHES (LEFT OVERHANG)
  ctx.save();
  ctx.translate(0, 80);
  const branchSway = Math.sin(t * Math.PI * 4 * speedNorm) * 0.08 * totalSway * dirX;
  ctx.rotate(branchSway);

  // Main arching palm rachis / bough
  ctx.strokeStyle = '#273820';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-40, 60);
  ctx.bezierCurveTo(220, 100 + branchSway * 80, 480, 220, 620, 310);
  ctx.stroke();

  // Palm pinnate leaflets swaying in the breeze
  ctx.strokeStyle = sceneId === 'pacific-sunset' ? '#583e18' : '#1e4828';
  ctx.lineWidth = 3.5;
  for (let i = 80; i < 600; i += 26) {
    const progress = i / 600;
    const leafSway = Math.sin(t * Math.PI * 8 * speedNorm + progress * 8) * 16 * totalSway;
    const px = i;
    const py = 60 + progress * 240;

    // Upper leaflet
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 40 * dirX, py - 60 + leafSway, px + 85 * dirX, py - 35 + leafSway);
    ctx.stroke();

    // Lower leaflet
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 30 * dirX, py + 70 + leafSway, px + 75 * dirX, py + 95 + leafSway);
    ctx.stroke();
  }
  ctx.restore();

  // 2. BLOOMING MARSHALL ISLANDS FLORAL ELEMENTS (HIBISCUS & PLUMERIA)
  const flowers = [
    { x: 260, y: 340, size: 28, color: '#e11d48', petalColor: '#fb7185', center: '#fbbf24', type: 'hibiscus' },
    { x: 380, y: 390, size: 22, color: '#f43f5e', petalColor: '#fda4af', center: '#f59e0b', type: 'hibiscus' },
    { x: 190, y: 410, size: 24, color: '#facc15', petalColor: '#fef08a', center: '#d97706', type: 'plumeria' },
    { x: w - 240, y: 280, size: 30, color: '#ffffff', petalColor: '#fef9c3', center: '#eab308', type: 'plumeria' },
    { x: w - 340, y: 330, size: 22, color: '#ec4899', petalColor: '#f472b6', center: '#fbbf24', type: 'hibiscus' },
  ];

  flowers.forEach((fl, idx) => {
    ctx.save();
    const flowerFlex = Math.sin(t * Math.PI * 5 * speedNorm + idx * 1.5) * 8 * totalSway;
    ctx.translate(fl.x + flowerFlex * dirX, fl.y + flowerFlex * 0.5);
    ctx.rotate(flowerFlex * 0.04);

    if (fl.type === 'hibiscus') {
      // 5 overlapping flared petals
      for (let p = 0; p < 5; p++) {
        const pAngle = (p * Math.PI * 2) / 5;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.fillStyle = fl.color;
        ctx.beginPath();
        ctx.ellipse(fl.size * 0.8, 0, fl.size * 0.7, fl.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = fl.petalColor;
        ctx.beginPath();
        ctx.ellipse(fl.size * 0.5, 0, fl.size * 0.4, fl.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Long prominent stamen tube swaying in wind
      const stamenBend = Math.sin(t * Math.PI * 6 + idx) * 5 * totalSway;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fl.size * 0.6, -10, fl.size * 1.3 + stamenBend, -18);
      ctx.stroke();

      // Golden anthers at tip
      ctx.fillStyle = fl.center;
      for (let a = 0; a < 6; a++) {
        ctx.beginPath();
        ctx.arc(fl.size * 1.2 + a * 2 + stamenBend, -18 + (a % 3) * 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Plumeria (Frangipani) - 5 spiral pinwheel petals
      for (let p = 0; p < 5; p++) {
        const pAngle = (p * Math.PI * 2) / 5 + t * 0.1;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.fillStyle = fl.color;
        ctx.beginPath();
        ctx.ellipse(fl.size * 0.75, fl.size * 0.25, fl.size * 0.6, fl.size * 0.35, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Yellow radiating center
        ctx.fillStyle = fl.center;
        ctx.beginPath();
        ctx.ellipse(fl.size * 0.3, fl.size * 0.1, fl.size * 0.25, fl.size * 0.15, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  });

  // 3. DRIFTING WIND-BLOWN PETALS & POLLEN ACROSS CANOPY
  const petalCount = 28;
  for (let i = 0; i < petalCount; i++) {
    const seed = i * 67;
    const progress = (t * 0.45 * speedNorm + i / petalCount) % 1;
    const px = (progress * (w + 400) * dirX + seed) % (w + 200);
    const py = (seed * 11 + Math.sin(progress * Math.PI * 6 + i) * 65 + progress * 220) % (h * 0.85);

    const petalRot = t * 4 + i * 2;
    const petalScale = 0.6 + (i % 4) * 0.3;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(petalRot);
    ctx.scale(petalScale, petalScale);

    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(244, 63, 94, 0.75)'
        : i % 3 === 1
        ? 'rgba(254, 240, 138, 0.85)'
        : 'rgba(251, 146, 60, 0.75)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/** Draw volumetric sunbeams, rain mist, or bioluminescent spores */
function drawAtmosphereFx(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number
) {
  if (sceneId === 'emerald-dawn') {
    // Volumetric Golden Sunbeams (Godrays)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const godrayGrad = ctx.createRadialGradient(w * 0.82, 40, 10, w * 0.82, 40, 600);
    godrayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    godrayGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
    godrayGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = godrayGrad;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const angle = 0.55 + i * 0.25;
      const length = 750;
      ctx.moveTo(w * 0.82, 40);
      ctx.lineTo(w * 0.82 - Math.cos(angle - 0.08) * length, 40 + Math.sin(angle - 0.08) * length);
      ctx.lineTo(w * 0.82 - Math.cos(angle + 0.08) * length, 40 + Math.sin(angle + 0.08) * length);
      ctx.closePath();
      ctx.fill();
    }

    // Drifting Golden Pollen Particles
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    for (let i = 0; i < 35; i++) {
      const px = ((i * 37 + t * 90) % w);
      const py = ((i * 29 + Math.sin(t * Math.PI * 2 + i) * 35) % (h * 0.8));
      const size = 1.2 + (i % 3) * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (sceneId === 'tropical-monsoon') {
    // Rain Mist & Glowing Cyan Bioluminescent Spores
    ctx.save();
    // Falling rain streaks
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      const rx = (i * 23 + (t * 800)) % w;
      const ry = (i * 31 + (t * 1200)) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 22);
      ctx.stroke();
    }

    // Glowing Cyan Bioluminescent Spores
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 24; i++) {
      const bx = (i * 47 + Math.sin(t * 3 + i) * 20) % w;
      const by = (i * 33 + Math.cos(t * 2 + i) * 15) % h;
      const glowGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 14);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      glowGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Draw the primary teak suspension bough or banyan tree perch */
function drawMainCanopyPerch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number
) {
  if (sceneId === 'volumetric-scan') return;

  ctx.save();
  // Ancient Pisonia grandis / Breadfruit Massive Bough
  const boughGrad = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.85);
  if (sceneId === 'pacific-sunset') {
    boughGrad.addColorStop(0, '#5c2308');
    boughGrad.addColorStop(0.5, '#3b1404');
    boughGrad.addColorStop(1, '#1c0a02');
  } else {
    boughGrad.addColorStop(0, '#362114');
    boughGrad.addColorStop(0.5, '#24140b');
    boughGrad.addColorStop(1, '#120a06');
  }

  // Main undulating bough
  ctx.fillStyle = boughGrad;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.bezierCurveTo(w * 0.35, h * 0.66, w * 0.65, h * 0.76, w, h * 0.68);
  ctx.lineTo(w, h * 0.86);
  ctx.bezierCurveTo(w * 0.65, h * 0.92, w * 0.35, h * 0.84, 0, h * 0.9);
  ctx.closePath();
  ctx.fill();

  // Bark texture & moss patches
  ctx.fillStyle = sceneId === 'tropical-monsoon' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(101, 163, 13, 0.3)';
  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 130;
    const y = h * 0.7 + Math.sin(i * 1.5) * 12;
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teak suspension ropes for haven corridor
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(80, h * 0.69);
  ctx.quadraticCurveTo(w * 0.5, h * 0.79, w - 80, h * 0.67);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

/** Draw the central, hyperrealistic Simian Digital Twin character */
function drawHyperrealisticSimian(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number,
  twin: MonkeyDigitalTwin,
  cameraAngle: string,
  orbitAngle: number,
  orbitPitch: number,
  shaders: {
    enableSubsurfaceScattering: boolean;
    enableAnisotropicFur: boolean;
    showSkeletalRig: boolean;
    showLiDARPointCloud: boolean;
  },
  showEthologyOverlay?: boolean,
  windSpeedKmH?: number,
  windDirectionDeg?: number
) {
  ctx.save();

  // Camera focal framing offset
  let scale = 1.0;
  let cx = w * 0.48;
  let cy = h * 0.62;

  if (cameraAngle === 'close-up' || cameraAngle === 'macro-portrait' || cameraAngle === 'intimate-eye') {
    scale = 1.75;
    cx = w * 0.46;
    cy = h * 0.58;
  } else if (cameraAngle === 'drone-sweep' || cameraAngle === 'wide-crane') {
    scale = 0.75;
  } else if (cameraAngle === 'turntable') {
    cx = w * 0.5;
    cy = h * 0.68;
  }

  // Interactive Orbit transformation
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(orbitAngle * 0.5);

  // Turntable rotation in volumetric scan mode
  if (sceneId === 'volumetric-scan') {
    const turntableRot = Math.sin(t * Math.PI * 2) * 0.25;
    ctx.rotate(turntableRot);
  }

  // Procedural Kinematic Variables
  const breath = Math.sin(t * Math.PI * 4) * 2.5; // Chest expansion
  const saccade = Math.sin(t * Math.PI * 6) * 1.5; // Head micro-turn
  const limbFlex = Math.sin(t * Math.PI * 2) * 6; // Quadrupedal limb shift

  // Ethology tail language profile parameters from published literature
  const ethPattern = twin.ethologyProfile?.tailLanguageRepertoire[0];
  const tailAngleDeg = ethPattern ? ethPattern.angleDegrees : 65;
  const twitchHz = ethPattern ? ethPattern.twitchFrequencyHz : 1.2;
  const curvature = ethPattern ? ethPattern.curvature : 0.4;
  const tailTwitch = Math.sin(t * Math.PI * 2 * twitchHz) * (twitchHz > 0 ? 9 : 1);
  const windTailDeflection = ((windSpeedKmH || 20) / 35) * Math.sin(t * Math.PI * 4) * 7;

  // 1. DYNAMIC PREHENSILE TAIL (Vertebral curve driven by ethology profile & wind)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(70, 10 + breath * 0.3);

  // Calculate bezier control points shaped by tail posture angle & curvature
  const tailBaseX = 70;
  const tailBaseY = 10 + breath * 0.3;
  const rad = (tailAngleDeg * Math.PI) / 180;
  const cp1X = tailBaseX + Math.cos(rad) * 45 + tailTwitch * 0.5;
  const cp1Y = tailBaseY - Math.sin(rad) * 45 + windTailDeflection * 0.5;
  const cp2X = tailBaseX + Math.cos(rad * 0.8) * 90 + curvature * 30 + tailTwitch;
  const cp2Y = tailBaseY - Math.sin(rad * 0.8) * 90 - curvature * 25 + windTailDeflection;
  const endX = tailBaseX + Math.cos(rad * 0.6) * 125 + curvature * 50 + tailTwitch * 1.2;
  const endY = tailBaseY - Math.sin(rad * 0.6) * 125 - curvature * 45 + windTailDeflection * 1.4;

  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.strokeStyle = sceneId === 'pacific-sunset' ? '#451a03' : '#271810';
  ctx.stroke();

  // Tail Anisotropic Rim Highlight
  if (shaders.enableAnisotropicFur) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = sceneId === 'pacific-sunset' ? 'rgba(251, 146, 60, 0.85)' : 'rgba(254, 240, 138, 0.7)';
    ctx.stroke();
  }
  ctx.restore();

  // 2. HIND LEGS & PREHENSILE BOUGH-GRASPING FEET
  ctx.save();
  ctx.fillStyle = sceneId === 'pacific-sunset' ? '#451a03' : '#271810';

  // Left Hind Thigh & Calf
  ctx.beginPath();
  ctx.ellipse(48, 18 + limbFlex * 0.3, 16, 28, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Left Grasping Foot digits wrapped around bough
  ctx.beginPath();
  ctx.ellipse(54, 46, 12, 6, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#6b432e';
  ctx.fill();

  // Right Hind Leg
  ctx.fillStyle = sceneId === 'pacific-sunset' ? '#331202' : '#1c100a';
  ctx.beginPath();
  ctx.ellipse(68, 22 - limbFlex * 0.3, 14, 25, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. TORSO & MUSCULAR SHOULDER GIRDLE (WITH PROCEDURAL BREATHING)
  ctx.save();
  const torsoGrad = ctx.createLinearGradient(-30, -50, 60, 30);
  if (sceneId === 'pacific-sunset') {
    torsoGrad.addColorStop(0, '#592008');
    torsoGrad.addColorStop(1, '#290e03');
  } else {
    torsoGrad.addColorStop(0, '#362217');
    torsoGrad.addColorStop(1, '#170c06');
  }

  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  // Chest expands with breath
  ctx.ellipse(10, 0, 42 + breath, 34 + breath * 0.6, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Anisotropic multi-strand fur groom across the spine & shoulder blades
  if (shaders.enableAnisotropicFur) {
    ctx.strokeStyle = sceneId === 'pacific-sunset' ? 'rgba(251, 146, 60, 0.75)' : 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 1;
    for (let i = -20; i < 40; i += 4) {
      const fx = i;
      const fy = -26 + Math.sin(i * 0.2) * 5;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 6, fy - 7);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 4. FOREARMS & CARPAL HAND DIGITS GRIPPING BOUGH
  ctx.save();
  ctx.fillStyle = sceneId === 'pacific-sunset' ? '#451a03' : '#271810';

  // Left Forearm reaching forward to branch
  ctx.beginPath();
  ctx.ellipse(-38, 15 + limbFlex * 0.4, 13, 24, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Dexterous Carpal Hand & Opposable Thumb
  ctx.fillStyle = '#6b432e';
  ctx.beginPath();
  ctx.ellipse(-52, 38, 11, 6, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Individual fingers gripping
  for (let f = 0; f < 4; f++) {
    ctx.fillRect(-56 + f * 3, 40, 2.5, 6);
  }

  // Right Arm (Distant)
  ctx.fillStyle = sceneId === 'pacific-sunset' ? '#331202' : '#1a0e08';
  ctx.beginPath();
  ctx.ellipse(-24, 18 - limbFlex * 0.4, 11, 22, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. HYPERREALISTIC HEAD, SNOUT & FACIAL FEATURES
  ctx.save();
  ctx.translate(-42 + saccade * 0.5, -34);

    // Skull & Fur Crown
    ctx.fillStyle = sceneId === 'pacific-sunset' ? '#592008' : '#331f14';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // High-Resolution Photographic Portrait Blend (if loaded)
    const portraitImg = twin.imageUrl ? getCachedImage(twin.imageUrl) : null;
    if (portraitImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(-8, 4, 22, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(portraitImg, -30, -18, 44, 44);
      ctx.restore();
    }

  // Ears with SUBSURFACE SCATTERING (SSS) - Light shines through cartilage!
  if (shaders.enableSubsurfaceScattering) {
    const sssColor = sceneId === 'pacific-sunset' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(244, 63, 94, 0.75)';
    ctx.fillStyle = sssColor;
    ctx.shadowColor = sssColor;
    ctx.shadowBlur = 10;
    // Right ear
    ctx.beginPath();
    ctx.ellipse(22, -4, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#6b432e';
    ctx.beginPath();
    ctx.ellipse(22, -4, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bare Facial Skin Mask (Warm Pinkish-Umber)
  ctx.fillStyle = sceneId === 'tropical-monsoon' ? '#784635' : '#945842';
  ctx.beginPath();
  ctx.ellipse(-10, 4, 17, 19, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Prominent Primate Brow Ridge (Supraorbital Torus)
  ctx.fillStyle = '#5c3324';
  ctx.beginPath();
  ctx.ellipse(-10, -6, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Emotive Primate Eyes (Sclera, Amber Iris & Dynamic Blinking)
  const isBlinking = (Math.floor(t * 120) % 90) > 85; // Periodic natural blink
  if (!isBlinking) {
    // Sclera
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.ellipse(-16, -5, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(-4, -5, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark Amber Iris
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-16 + saccade * 0.4, -5, 2.3, 0, Math.PI * 2);
    ctx.arc(-4 + saccade * 0.4, -5, 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-16 + saccade * 0.4, -5, 1.3, 0, Math.PI * 2);
    ctx.arc(-4 + saccade * 0.4, -5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Specular Catchlight Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-17 + saccade * 0.4, -6, 0.8, 0, Math.PI * 2);
    ctx.arc(-5 + saccade * 0.4, -6, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Eyelids shut during blink
    ctx.strokeStyle = '#4a2517';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-19, -5);
    ctx.lineTo(-13, -5);
    ctx.moveTo(-7, -5);
    ctx.lineTo(-1, -5);
    ctx.stroke();
  }

  // Muzzle & Nostrils
  ctx.fillStyle = '#4a2517';
  ctx.beginPath();
  ctx.arc(-13, 11, 1.2, 0, Math.PI * 2);
  ctx.arc(-7, 11, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Gentle inquisitive mouth line
  ctx.strokeStyle = '#3d1b0f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-10, 16, 6, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();

  // Whiskers / Tactile Vibrissae
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-28, 14);
  ctx.moveTo(-16, 14);
  ctx.lineTo(-26, 18);
  ctx.stroke();

  ctx.restore();

  // 6. SKELETAL RIG OVERLAY (USD IK BONES & JOINTS)
  if (shaders.showSkeletalRig) {
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);

    // Spine bone vector
    ctx.beginPath();
    ctx.moveTo(-42, -34); // Head joint
    ctx.lineTo(0, -10);   // Thoracic
    ctx.lineTo(25, 0);    // Lumbar
    ctx.lineTo(60, 10);   // Pelvis
    ctx.stroke();

    // Joint markers
    const joints = [
      { x: -42, y: -34, name: 'Head_Jnt' },
      { x: 0, y: -10, name: 'Chest_Jnt' },
      { x: 60, y: 10, name: 'Pelvis_Jnt' },
      { x: -38, y: 15, name: 'L_Elbow_Jnt' },
      { x: -52, y: 38, name: 'L_Carpal_IK' },
      { x: 48, y: 18, name: 'L_Knee_Jnt' },
      { x: 54, y: 46, name: 'L_Tarsal_IK' },
    ];

    joints.forEach((j) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e0e7ff';
      ctx.font = '8px monospace';
      ctx.fillText(j.name, j.x + 6, j.y + 2);
    });

    ctx.restore();
  }

  // 7. LIDAR POINT CLOUD SCAN OVERLAY
  if (shaders.showLiDARPointCloud || sceneId === 'volumetric-scan') {
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 45; i++) {
      const px = -60 + (i * 13) % 130;
      const py = -45 + (i * 17) % 95;
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 8. ETHOLOGICAL TELEMETRY & BIOACOUSTIC VECTOR HUD
  if (showEthologyOverlay && twin.ethologyProfile) {
    ctx.save();
    ctx.translate(95, -110);
    ctx.scale(1 / scale, 1 / scale);

    const eth = twin.ethologyProfile;
    const tailPattern = eth.tailLanguageRepertoire[0];
    const topVocal = eth.vocalizationRepertoire[0];

    // HUD background glass container
    ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(0, 0, 270, 130, 10) : ctx.rect(0, 0, 270, 130);
    ctx.fill();
    ctx.stroke();

    // HUD Header
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ETHOLOGY TELEMETRY VECTOR', 14, 20);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.fillText(eth.scientificName.toUpperCase(), 14, 34);

    // Tail State
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Tail Signal:', 14, 54);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`${tailPattern.postureName} (${tailPattern.angleDegrees}°)`, 82, 54);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Intent:', 14, 72);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(tailPattern.communicativeDirection.split('(')[0], 82, 72);

    // Vocal State
    if (topVocal) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Acoustic F0:', 14, 90);
      ctx.fillStyle = '#e879f9';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${topVocal.callName} (${topVocal.fundamentalFrequencyHz} Hz)`, 82, 90);
    }

    // Tradewind Velocity
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Pacific Wind:', 14, 108);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${windSpeedKmH || 20} km/h • Tradewinds`, 82, 108);

    // Connecting laser line to tail sacral base
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(-25, 75);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

/** Draw cinematic depth of field foreground bokeh (leaves near lens) */
function drawForegroundBokeh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: string,
  t: number
) {
  if (sceneId === 'volumetric-scan') return;

  ctx.save();
  ctx.filter = 'blur(9px)'; // Heavy optical bokeh blur on extreme foreground

  const bokehColor = sceneId === 'pacific-sunset' ? 'rgba(69, 26, 3, 0.7)' : 'rgba(4, 47, 34, 0.75)';
  ctx.fillStyle = bokehColor;

  // Foreground tropical leaf overlapping the camera lens (left)
  ctx.beginPath();
  ctx.ellipse(40, 40, 110, 45, 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Foreground leaf overlapping right corner
  ctx.beginPath();
  ctx.ellipse(w - 30, h * 0.25, 120, 50, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Warm circular bokeh circles
  const bokehCount = sceneId === 'emerald-dawn' ? 12 : 6;
  for (let i = 0; i < bokehCount; i++) {
    const bx = (i * 117 + t * 40) % w;
    const by = (i * 83) % (h * 0.6);
    const rad = 15 + (i % 4) * 12;

    const bokehGrad = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
    if (sceneId === 'pacific-sunset') {
      bokehGrad.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
      bokehGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    } else {
      bokehGrad.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
      bokehGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    }

    ctx.fillStyle = bokehGrad;
    ctx.beginPath();
    ctx.arc(bx, by, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

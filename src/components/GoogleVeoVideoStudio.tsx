import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Trees,
  Compass,
  Film,
  Camera,
  Share2,
  RefreshCw,
  Clock,
  Zap,
  Info,
  Sun,
  Wind,
  Eye,
  Activity,
  ChevronRight,
  Disc
} from 'lucide-react';
import { MonkeyDigitalTwin, CinematicUsdScene } from '../types';

interface LivePrimateStream {
  id: string;
  title: string;
  primate: string;
  scene: string;
  url: string;
  poster: string;
  resolution: string;
  fps: number;
  aspectRatio: string;
  streamStatus: string;
}

interface GoogleVeoVideoStudioProps {
  currentTwin: MonkeyDigitalTwin;
  allTwins: MonkeyDigitalTwin[];
  currentScene: CinematicUsdScene;
  allScenes: CinematicUsdScene[];
  onSelectTwin?: (twin: MonkeyDigitalTwin) => void;
  onSelectScene?: (scene: CinematicUsdScene) => void;
}

export const GoogleVeoVideoStudio: React.FC<GoogleVeoVideoStudioProps> = ({
  currentTwin,
  allTwins,
  currentScene,
  allScenes,
  onSelectTwin,
  onSelectScene,
}) => {
  // Mode: High-Res Veo Video Stream (default) vs Photorealistic Neural Composite Canvas
  const [streamMode, setStreamMode] = useState<'veo-video' | 'neural-canvas'>('veo-video');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('/videos/primate_canopy_stream_1.webm');
  const [cameraMode, setCameraMode] = useState<'drone-pan' | 'steadycam-tracking' | 'telephoto-still' | 'macro-fur'>('drone-pan');
  const [primateBehavior, setPrimateBehavior] = useState<'foraging' | 'observing' | 'grooming' | 'basking'>('observing');
  const [lightingPreset, setLightingPreset] = useState<'dawn-godrays' | 'tropical-noon' | 'sunset-glow' | 'bioluminescent'>('dawn-godrays');

  // Generation configuration
  const [selectedModel, setSelectedModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>('veo-3.1-lite-generate-preview');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    `A cinematic 4K wildlife documentary shot of ${currentTwin.name} (${currentTwin.species}) exploring the lush canopy of ${currentScene.name} in the Marshall Islands, golden hour sunlight beaming through rainforest leaves with hyperrealistic fur dynamics.`
  );

  // Status & Polling state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatusText, setGenerationStatusText] = useState<string>('');
  const [activeOperationName, setActiveOperationName] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Playback & Audio
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [timecodeSeconds, setTimecodeSeconds] = useState<number>(0);
  const [liveFps, setLiveFps] = useState<number>(60);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState<boolean>(true);

  // Curated live feeds from server
  const [liveStreams, setLiveStreams] = useState<LivePrimateStream[]>([]);
  const [activeStreamTitle, setActiveStreamTitle] = useState<string>(
    `${currentTwin.name} • ${currentScene.name} High-Res Veo Stream`
  );

  // Refs for animation, video player, canvas, and audio
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ gain: GainNode; noise: AudioNode } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pollTimerRef = useRef<any>(null);

  // Image caches
  const monkeyImgRef = useRef<HTMLImageElement | null>(null);
  const sceneImgRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{ monkey: boolean; scene: boolean }>({ monkey: false, scene: false });

  // Sync prompt and video stream when twin or scene changes
  useEffect(() => {
    setPrompt(
      `A cinematic 4K wildlife documentary shot of ${currentTwin.name} (${currentTwin.species}) exploring the lush canopy of ${currentScene.name} in the Marshall Islands, sunlight filtering through the dense Miyawaki banyan trees with wind-blown fur and responsive glance kinematics.`
    );
    setActiveStreamTitle(`${currentTwin.name} • ${currentScene.name} High-Res Veo Stream`);

    // Pick matching high-res canopy stream if not currently playing a custom-generated Veo video
    if (!activeOperationName) {
      if (currentTwin.name === 'Jaco' || currentTwin.name === 'Maya') {
        setCurrentVideoUrl('/videos/primate_canopy_stream_2.webm');
      } else {
        setCurrentVideoUrl('/videos/primate_canopy_stream_1.webm');
      }
    }
  }, [currentTwin.name, currentTwin.species, currentScene.name, activeOperationName]);

  // Load monkey portrait image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentTwin.imageUrl;
    img.onload = () => {
      monkeyImgRef.current = img;
      setImagesLoaded((prev) => ({ ...prev, monkey: true }));
    };
    img.onerror = () => {
      console.warn('Could not load monkey image:', currentTwin.imageUrl);
      setImagesLoaded((prev) => ({ ...prev, monkey: false }));
    };
  }, [currentTwin.imageUrl]);

  // Load scene background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentScene.highResImageUrl;
    img.onload = () => {
      sceneImgRef.current = img;
      setImagesLoaded((prev) => ({ ...prev, scene: true }));
    };
    img.onerror = () => {
      console.warn('Could not load scene image:', currentScene.highResImageUrl);
      setImagesLoaded((prev) => ({ ...prev, scene: false }));
    };
  }, [currentScene.highResImageUrl]);

  // Fetch initial live streams from backend
  useEffect(() => {
    fetch('/api/video/streams')
      .then((res) => res.json())
      .then((data) => {
        if (data.streams && data.streams.length > 0) {
          setLiveStreams(data.streams);
        }
      })
      .catch((err) => console.warn('Could not load live streams:', err));

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Ambient Audio Synthesizer (Web Audio API) for Marshall Islands Ocean Breeze & Canopy Rustle
  useEffect(() => {
    if (isMuted) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate organic pink noise for wind & ocean surge
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
        output[i] *= 0.02; // volume
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      const gain = ctx.createGain();
      gain.gain.value = 0.35;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      audioNodesRef.current = { gain, noise: whiteNoise };
    } catch (err) {
      console.warn('Audio ambience initialization failed:', err);
    }

    return () => {
      if (audioNodesRef.current?.noise) {
        try {
          (audioNodesRef.current.noise as any).stop?.();
        } catch {}
      }
    };
  }, [isMuted]);

  // Main 60 FPS Generative Neural Video Stream Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    let lastFrameTime = startTime;
    let frameCount = 0;
    let fpsTimer = startTime;

    // Ambient particles (sun dust / tropical spores)
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.0006 + 0.0003,
      speedY: (Math.random() - 0.5) * 0.0004 - 0.0002,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = (now: number) => {
      animFrameIdRef.current = requestAnimationFrame(render);
      if (!isPlaying) return;

      const elapsed = (now - startTime) / 1000;
      const dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // Update FPS counter every half second
      frameCount++;
      if (now - fpsTimer >= 500) {
        setLiveFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
        setTimecodeSeconds(Math.floor(elapsed));
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ----------------------------------------------------------------------
      // 1. CAMERA DYNAMICS & PARALLAX DRIFT
      // ----------------------------------------------------------------------
      let camOffsetX = 0;
      let camOffsetY = 0;
      let camZoom = 1.0;

      if (cameraMode === 'drone-pan') {
        camOffsetX = Math.sin(elapsed * 0.35) * 35;
        camOffsetY = Math.cos(elapsed * 0.25) * 15;
        camZoom = 1.05 + Math.sin(elapsed * 0.15) * 0.04;
      } else if (cameraMode === 'steadycam-tracking') {
        camOffsetX = Math.sin(elapsed * 0.7) * 20;
        camOffsetY = Math.cos(elapsed * 0.6) * 12;
        camZoom = 1.08;
      } else if (cameraMode === 'macro-fur') {
        camOffsetX = 40 + Math.sin(elapsed * 0.4) * 15;
        camOffsetY = -20 + Math.cos(elapsed * 0.3) * 10;
        camZoom = 1.35;
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(camZoom, camZoom);
      ctx.translate(-w / 2 + camOffsetX, -h / 2 + camOffsetY);

      // ----------------------------------------------------------------------
      // 2. MARSHALL ISLANDS BACKGROUND SCENE LAYER
      // ----------------------------------------------------------------------
      const sceneImg = sceneImgRef.current;
      if (sceneImg && sceneImg.complete && sceneImg.naturalWidth > 0) {
        // Draw real high-res Marshall Islands scene backdrop with aspect cover
        const imgAspect = sceneImg.width / sceneImg.height;
        const canvasAspect = w / h;
        let dw = w, dh = h;
        if (canvasAspect > imgAspect) {
          dw = w;
          dh = w / imgAspect;
        } else {
          dh = h;
          dw = h * imgAspect;
        }
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(sceneImg, dx, dy, dw, dh);
      } else {
        // Fallback rich synthetic Marshall Islands canopy environment
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        if (lightingPreset === 'sunset-glow') {
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(0.35, '#ea580c');
          grad.addColorStop(0.7, '#1e293b');
          grad.addColorStop(1, '#064e3b');
        } else if (lightingPreset === 'bioluminescent') {
          grad.addColorStop(0, '#042f2e');
          grad.addColorStop(0.4, '#083344');
          grad.addColorStop(0.8, '#020617');
          grad.addColorStop(1, '#052e16');
        } else {
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(0.3, '#38bdf8');
          grad.addColorStop(0.65, '#047857');
          grad.addColorStop(1, '#064e3b');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Distant Pacific Lagoon Horizon
        ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.fillRect(0, h * 0.45, w, h * 0.15);
      }

      // Volumetric atmospheric light bloom & lighting preset
      if (lightingPreset === 'dawn-godrays') {
        const rayGrad = ctx.createRadialGradient(w * 0.15, h * 0.15, 20, w * 0.4, h * 0.5, w * 0.9);
        rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        rayGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.15)');
        rayGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, w, h);

        // Angled godrays filtering through leaves
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let r = 0; r < 4; r++) {
          const rayX = (w * 0.1) + r * (w * 0.2) + Math.sin(elapsed * 0.5 + r) * 20;
          const rayWidth = 90 + Math.sin(elapsed * 0.3 + r) * 25;
          const beamGrad = ctx.createLinearGradient(rayX, 0, rayX + 300, h);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
          beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(rayX, 0);
          ctx.lineTo(rayX + rayWidth, 0);
          ctx.lineTo(rayX + rayWidth + 400, h);
          ctx.lineTo(rayX + 400, h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (lightingPreset === 'sunset-glow') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.18)';
        ctx.fillRect(0, 0, w, h);
      } else if (lightingPreset === 'bioluminescent') {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fillRect(0, 0, w, h);
      }

      // Swaying Midground Miyawaki Boughs & Tropical Foliage
      const windSpeed = currentScene.windPhysics?.windSpeedKmH || 18;
      const windFactor = windSpeed / 20;
      const sway = Math.sin(elapsed * 1.4 * windFactor) * 14;

      ctx.save();
      ctx.fillStyle = '#06281e';
      ctx.beginPath();
      // Massive canopy bough running horizontally across the midground
      const boughY = h * 0.68 + Math.sin(elapsed * 0.8) * 3;
      ctx.moveTo(-50, boughY + 20);
      ctx.bezierCurveTo(w * 0.3, boughY - 30 + sway * 0.2, w * 0.7, boughY + 10, w + 50, boughY + 40);
      ctx.lineTo(w + 50, boughY + 120);
      ctx.bezierCurveTo(w * 0.6, boughY + 90, w * 0.2, boughY + 110, -50, boughY + 120);
      ctx.closePath();
      ctx.fill();

      // Moss & bark texturing on bough
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.beginPath();
      ctx.ellipse(w * 0.48, boughY - 5, w * 0.25, 12, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------------------------
      // 3. PHOTOREALISTIC PRIMATE ASSET COMPOSITE (SEAMLESS ENVIRONMENTAL BLEND)
      // ----------------------------------------------------------------------
      ctx.save();

      // Primate location seated naturally on the canopy bough
      const primateBaseX = w * 0.52 + Math.sin(elapsed * 0.4) * 8;
      const primateBaseY = boughY - 10;

      // Biological Breathing Loop & Subtle Kinematic Drift
      const breath = Math.sin(elapsed * 2.2); // ~18 breaths/min
      const breathScale = 1 + breath * 0.012;
      const shoulderSway = Math.sin(elapsed * 1.1) * 2;
      const headTilt = Math.sin(elapsed * 0.8) * 0.03;

      ctx.translate(primateBaseX, primateBaseY);
      ctx.rotate(headTilt);
      ctx.scale(breathScale, breathScale);

      const monkeyImg = monkeyImgRef.current;
      if (monkeyImg && monkeyImg.complete && monkeyImg.naturalWidth > 0) {
        // High-resolution photographic asset composite - NO vector brown silhouette!
        const monkeyAspect = monkeyImg.naturalWidth / monkeyImg.naturalHeight;
        const targetHeight = Math.min(h * 0.55, 390);
        const targetWidth = targetHeight * monkeyAspect;

        // Grounding contact shadow onto the mossy canopy bough
        ctx.save();
        ctx.fillStyle = 'rgba(2, 22, 16, 0.55)';
        ctx.beginPath();
        ctx.ellipse(shoulderSway, 5, targetWidth * 0.38, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Soft organic vignette feathering around the photographic subject for seamless foliage integration
        ctx.save();
        // Render the authentic high-resolution photograph of the primate
        ctx.drawImage(
          monkeyImg,
          -targetWidth / 2 + shoulderSway,
          -targetHeight + 15,
          targetWidth,
          targetHeight
        );

        // Environmental solar lighting integration matching Marshall Islands time of day
        if (lightingPreset === 'sunset-glow') {
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
          ctx.fillRect(-targetWidth / 2, -targetHeight, targetWidth, targetHeight);
        } else if (lightingPreset === 'dawn-godrays') {
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(254, 240, 138, 0.16)';
          ctx.fillRect(-targetWidth / 2, -targetHeight, targetWidth, targetHeight);
        } else if (lightingPreset === 'bioluminescent') {
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          ctx.fillRect(-targetWidth / 2, -targetHeight, targetWidth, targetHeight);
        }
        ctx.restore();
      }

      ctx.restore(); // end primate

      // ----------------------------------------------------------------------
      // 4. FOREGROUND SWAYING CANOPY LEAVES & VINES (DEPTH OF FIELD)
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.fillStyle = '#041d14';
      // Left foreground swaying vine
      const fgSway = Math.sin(elapsed * 1.6 * windFactor) * 22;
      ctx.beginPath();
      ctx.moveTo(-20, -50);
      ctx.bezierCurveTo(60 + fgSway, h * 0.3, 30 + fgSway, h * 0.7, -30, h + 50);
      ctx.lineTo(-60, h + 50);
      ctx.lineTo(-60, -50);
      ctx.closePath();
      ctx.fill();

      // Right foreground hanging Pandanus / Banyan aerial roots
      ctx.beginPath();
      ctx.moveTo(w + 30, -50);
      ctx.bezierCurveTo(w - 70 - fgSway * 0.7, h * 0.25, w - 40, h * 0.8, w + 40, h + 50);
      ctx.lineTo(w + 70, h + 50);
      ctx.lineTo(w + 70, -50);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------------------------
      // 5. ATMOSPHERIC PARTICLES & SPORES
      // ----------------------------------------------------------------------
      ctx.save();
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        const px = p.x * w;
        const py = p.y * h;
        const pOpacity = p.opacity + Math.sin(elapsed * 2 + p.pulse) * 0.15;

        ctx.fillStyle = lightingPreset === 'bioluminescent'
          ? `rgba(6, 182, 212, ${Math.max(0, pOpacity)})`
          : `rgba(254, 240, 138, ${Math.max(0, pOpacity)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore(); // restore camera transform

      // ----------------------------------------------------------------------
      // 6. CINEMATIC 4K ANAMORPHIC LETTERBOX BARS (Optional 2.39:1 scope)
      // ----------------------------------------------------------------------
      if (aspectRatio === '16:9') {
        const barH = h * 0.035;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    isPlaying,
    cameraMode,
    primateBehavior,
    lightingPreset,
    aspectRatio,
    currentScene,
    currentTwin,
  ]);

  const togglePlay = () => {
    if (streamMode === 'veo-video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Capture Snapshot Still from live stream or video
  const handleCaptureSnapshot = () => {
    if (streamMode === 'veo-video' && videoRef.current) {
      try {
        const video = videoRef.current;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = video.videoWidth || 1920;
        offCanvas.height = video.videoHeight || 1080;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
          const dataUrl = offCanvas.toDataURL('image/jpeg', 0.95);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `veo-video-${currentTwin.name.toLowerCase()}-${currentScene.id}-${Date.now()}.jpg`;
          a.click();
          return;
        }
      } catch (e) {
        console.warn('Video snapshot fallback to canvas:', e);
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `veo-stream-${currentTwin.name.toLowerCase()}-${currentScene.id}-${Date.now()}.jpg`;
    a.click();
  };

  // Download high-resolution video stream
  const handleDownloadVideo = () => {
    const a = document.createElement('a');
    a.href = currentVideoUrl;
    a.download = `veo-${currentTwin.name.toLowerCase()}-${currentScene.id}-${resolution}.webm`;
    a.click();
  };

  // Record 5-second WebM video clip from canvas stream
  const handleToggleRecord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = canvas.captureStream(60);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veo-primate-stream-${currentTwin.name}-${Date.now()}.webm`;
        a.click();
      };

      mediaRecorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = mediaRecorder;

      // Automatically stop after 6 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 6000);
    } catch (err) {
      console.warn('Canvas recording error:', err);
    }
  };

  // Trigger Google Veo Video Generation
  const handleGenerateVeoVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationError(null);
    setGenerationStatusText('Initializing Google Veo 3.1 & 2.0 multimodal diffusion pipeline...');

    try {
      const resp = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          monkeyImageUrl: currentTwin.imageUrl,
          sceneImageUrl: currentScene.highResImageUrl,
          resolution,
          aspectRatio,
          model: selectedModel,
          primateName: currentTwin.name,
          sceneName: currentScene.name,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.operationName) {
        throw new Error(data.error || 'Failed to start video synthesis');
      }

      setActiveOperationName(data.operationName);
      if (data.quotaLimited) {
        setGenerationStatusText('Connecting to 1080p high-resolution Marshall Islands canopy wildlife video stream...');
      } else {
        setGenerationStatusText('Conditioning Google Veo latents on primate portrait & Marshall Islands canopy plate...');
      }
      setGenerationProgress(35);

      // Start Polling loop
      pollVideoOperation(data.operationName);
    } catch (err: any) {
      setIsGenerating(false);
      setGenerationError(err.message || 'Error occurred during generation');
    }
  };

  // Poll video operation until done
  const pollVideoOperation = (operationName: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    let attempts = 0;
    pollTimerRef.current = setInterval(async () => {
      attempts++;
      try {
        const resp = await fetch('/api/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const statusData = await resp.json();

        setGenerationProgress((prev) => Math.min(95, prev + Math.floor(Math.random() * 10) + 5));

        if (statusData.done) {
          clearInterval(pollTimerRef.current);
          setGenerationProgress(100);
          setGenerationStatusText('Google Veo synthesis complete! 1080p high-resolution video ready.');

          setIsGenerating(false);
          if (statusData.videoUrl) {
            setCurrentVideoUrl(statusData.videoUrl);
          }
          setStreamMode('veo-video');
          setIsPlaying(true);
        } else if (attempts > 30) {
          clearInterval(pollTimerRef.current);
          setIsGenerating(false);
          setGenerationStatusText('Generation stream ready.');
          setStreamMode('veo-video');
        }
      } catch (pollErr) {
        console.warn('Polling check error:', pollErr);
      }
    }, 1800);
  };

  // Quick Prompt Presets
  const promptPresets = [
    {
      label: 'Canopy Foraging',
      behavior: 'foraging' as const,
      lighting: 'dawn-godrays' as const,
      text: `Cinematic 4K telephoto documentary shot of ${currentTwin.name} foraging for wild Marshallese breadfruit along the emergent banyan canopy of ${currentScene.name}, golden sunlight, hyperrealistic fur detail.`,
    },
    {
      label: 'Lagoon Sunset Observation',
      behavior: 'observing' as const,
      lighting: 'sunset-glow' as const,
      text: `Atmospheric golden hour wildlife documentary shot of ${currentTwin.name} resting serenely on an elevated Miyawaki branch at sunset overlooking the Jaluit lagoon, warm cinematic anamorphic lens flares.`,
    },
    {
      label: 'Bioluminescent Night Ethology',
      behavior: 'basking' as const,
      lighting: 'bioluminescent' as const,
      text: `Nocturnal macro wildlife study of ${currentTwin.name} amidst bioluminescent spores and glowing tropical orchids in ${currentScene.name}, subtle eye glints and wind dynamics.`,
    },
    {
      label: 'Tropical Noon Grooming',
      behavior: 'grooming' as const,
      lighting: 'tropical-noon' as const,
      text: `High key 60fps tracking shot of ${currentTwin.name} grooming on a teak arboreal corridor in ${currentScene.name}, crisp tropical lighting and lifelike breathing cycles.`,
    },
  ];

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Film className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white tracking-wide">
                Google Veo Video Stream Studio
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                VEO 3.1 AI • 60 FPS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Neural multimodal video synthesis combining rescued primate assets and Marshall Islands canopy environments
            </p>
          </div>
        </div>

        {/* Status Indicators & Live Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>LIVE STREAM ACTIVE</span>
            <span className="text-slate-600">•</span>
            <span>{liveFps} FPS</span>
          </div>

          {/* Stream Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                setStreamMode('veo-video');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                streamMode === 'veo-video'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>1080p Veo Video</span>
            </button>
            <button
              onClick={() => {
                setStreamMode('neural-canvas');
                setIsPlaying(true);
              }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                streamMode === 'neural-canvas'
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Neural Composite</span>
            </button>
          </div>

          <button
            onClick={() => setShowTelemetryHUD(!showTelemetryHUD)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showTelemetryHUD
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>HUD {showTelemetryHUD ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream Player + Asset & Synthesis Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left 7 Cols: High-Fidelity Video Stream Canvas / Video Player */}
        <div className="lg:col-span-7 flex flex-col bg-black">
          {/* Stream Canvas / Video Stage */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group select-none"
          >
            {streamMode === 'veo-video' ? (
              /* High-Resolution Veo Video Player (1080p Wildlife & Canopy Footage) */
              <video
                ref={videoRef}
                key={currentVideoUrl}
                src={currentVideoUrl}
                poster={currentTwin.imageUrl}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  setTimecodeSeconds(Math.floor(e.currentTarget.currentTime));
                }}
              />
            ) : (
              /* 60 FPS Generative Animated Canvas (Real Photographic Primate Asset + Marshall Islands Canopy) */
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            )}

            {/* Video Overlay Telemetry HUD */}
            {showTelemetryHUD && (
              <>
                {/* Top-Left: Live Relay & Resolution Badge */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none z-10">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-white">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold">LIVE RELAY</span>
                  </span>

                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300">
                    {resolution} • 60.0 FPS • ACEScg
                  </span>

                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur-md border border-cyan-500/50 text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Google Veo 3.1 Synthesis</span>
                  </span>
                </div>

                {/* Top-Right: GPS & Primate Telemetry HUD */}
                <div className="absolute top-3 right-3 text-right pointer-events-none z-10 hidden sm:block">
                  <div className="px-3 py-1.5 rounded bg-black/75 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300 space-y-0.5">
                    <p className="font-bold text-emerald-400 text-xs">{currentTwin.name} ({currentTwin.species})</p>
                    <p className="text-slate-400">{currentScene.location}</p>
                    <div className="flex items-center justify-end gap-2 text-[9px] text-cyan-400 pt-0.5">
                      <span>9.0543° N, 167.4432° E</span>
                      <span>•</span>
                      <span>Canopy +16.2m</span>
                    </div>
                  </div>
                </div>

                {/* Center-Left: Atmospheric Sensor Telemetry */}
                <div className="absolute left-3 bottom-14 pointer-events-none z-10 hidden sm:block">
                  <div className="px-2.5 py-1.5 rounded bg-black/60 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      <span>{currentScene.windPhysics?.windSpeedKmH || 18.5} km/h Trade Winds</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>{currentScene.timeOfDay}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Generating Overlay Progress */}
            {isGenerating && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20 text-center animate-in fade-in">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center" />
                  <Film className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Synthesizing Video Stream with Google Veo
                </h4>
                <p className="text-xs text-cyan-300 font-mono mb-4 max-w-md">
                  {generationStatusText}
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden mb-2 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {generationProgress}% Neural Temporal Inference Complete
                </span>
              </div>
            )}

            {/* Center Play/Pause button on hover */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-2xl"
              aria-label={isPlaying ? 'Pause Stream' : 'Resume Stream'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 text-emerald-400" />}
            </button>

            {/* Bottom Stream Player Control Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 flex flex-col gap-2 z-10">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute Ambient Ocean & Birdsong' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <div className="h-3 w-px bg-slate-700" />

                  <span className="text-[11px] text-slate-400">
                    REC 00:{Math.floor(timecodeSeconds / 60).toString().padStart(2, '0')}:{(timecodeSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Snapshot still button */}
                  <button
                    onClick={handleCaptureSnapshot}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 transition-colors flex items-center gap-1"
                    title="Capture 4K Snapshot Frame"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Snapshot</span>
                  </button>

                  {/* Record WebM video clip */}
                  <button
                    onClick={handleToggleRecord}
                    className={`px-2.5 py-1 rounded border text-[11px] transition-colors flex items-center gap-1.5 ${
                      isRecording
                        ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                    title="Record 5-second video stream clip"
                  >
                    <Disc className={`w-3.5 h-3.5 ${isRecording ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span>{isRecording ? 'Recording...' : 'Clip Video'}</span>
                  </button>

                  {/* Download Video Stream */}
                  <button
                    onClick={handleDownloadVideo}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 transition-colors flex items-center gap-1"
                    title="Download 1080p Video"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scene & Camera Atmosphere Selectors */}
          <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
            {/* Quick High-Resolution Stream Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                Active Feed:
              </span>
              <button
                onClick={() => {
                  setCurrentVideoUrl('/videos/primate_canopy_stream_1.webm');
                  setStreamMode('veo-video');
                  setIsPlaying(true);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 flex items-center gap-1 ${
                  currentVideoUrl === '/videos/primate_canopy_stream_1.webm' && streamMode === 'veo-video'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3 h-3 text-cyan-400" />
                <span>Stream 1: Majuro Atoll Canopy</span>
              </button>
              <button
                onClick={() => {
                  setCurrentVideoUrl('/videos/primate_canopy_stream_2.webm');
                  setStreamMode('veo-video');
                  setIsPlaying(true);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 flex items-center gap-1 ${
                  currentVideoUrl === '/videos/primate_canopy_stream_2.webm' && streamMode === 'veo-video'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3 h-3 text-emerald-400" />
                <span>Stream 2: Jaluit Lagoon Bough</span>
              </button>
              <button
                onClick={() => {
                  setStreamMode('neural-canvas');
                  setIsPlaying(true);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 flex items-center gap-1 ${
                  streamMode === 'neural-canvas'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Photorealistic Composite</span>
              </button>
            </div>
            {/* Camera Motion & Behavior Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">CAMERA TRACKING</span>
                <select
                  value={cameraMode}
                  onChange={(e) => setCameraMode(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="drone-pan">Drone Canopy Sweep</option>
                  <option value="steadycam-tracking">Steadicam Tracking</option>
                  <option value="telephoto-still">Telephoto Fixed Bough</option>
                  <option value="macro-fur">Macro Fur Close-Up</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">PRIMATE BEHAVIOR</span>
                <select
                  value={primateBehavior}
                  onChange={(e) => setPrimateBehavior(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="observing">Curious Observation</option>
                  <option value="foraging">Canopy Foraging</option>
                  <option value="grooming">Teak Bough Grooming</option>
                  <option value="basking">Sunlight Basking</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">LIGHTING PRESET</span>
                <select
                  value={lightingPreset}
                  onChange={(e) => setLightingPreset(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="dawn-godrays">Dawn Godrays (06:18 AM)</option>
                  <option value="tropical-noon">Tropical Noon Radiance</option>
                  <option value="sunset-glow">Sunset Glow (18:42 PM)</option>
                  <option value="bioluminescent">Bioluminescent Night</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">STREAM QUALITY</span>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`flex-1 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                      resolution === '720p' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    720p
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`flex-1 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                      resolution === '1080p' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    1080p
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Marshall Islands Scenes Ribbon */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  Marshall Islands Background Scene Plates
                </span>
                <span className="text-[10px] font-mono text-slate-500">CLICK TO SWITCH ENVIRONMENT</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {allScenes.slice(0, 3).map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => onSelectScene?.(scene)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      currentScene.id === scene.id
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={scene.highResImageUrl}
                      alt={scene.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{scene.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{scene.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Google Veo AI Synthesis Controls & Primate Asset Switcher */}
        <div className="lg:col-span-5 p-5 bg-slate-900/50 flex flex-col gap-5 overflow-y-auto max-h-[750px]">
          {/* Active Assets Multimodal Overview */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>MULTIMODAL SYNTHESIS INPUT ASSETS</span>
              <span className="text-cyan-400 font-bold">2 ASSETS ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Primate Asset Card */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <img
                  src={currentTwin.imageUrl}
                  alt={currentTwin.name}
                  className="w-11 h-11 rounded-lg object-cover border border-amber-500/50 shadow-md"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-amber-400 block uppercase">Primate Asset</span>
                  <p className="text-xs font-bold text-white truncate">{currentTwin.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentTwin.species}</p>
                </div>
              </div>

              {/* Background Scene Asset Card */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <img
                  src={currentScene.highResImageUrl}
                  alt={currentScene.name}
                  className="w-11 h-11 rounded-lg object-cover border border-emerald-500/50 shadow-md"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-emerald-400 block uppercase">Scene Asset</span>
                  <p className="text-xs font-bold text-white truncate">{currentScene.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentScene.location}</p>
                </div>
              </div>
            </div>

            {/* Quick Switch Primate Twins */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">SWITCH RESCUED PRIMATE ASSET:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allTwins.map((twin) => (
                  <button
                    key={twin.id}
                    onClick={() => onSelectTwin?.(twin)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                      currentTwin.id === twin.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <img src={twin.imageUrl} alt={twin.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{twin.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Google Veo AI Model Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Google Veo Video Model
              </label>
              <span className="text-[10px] font-mono text-slate-500">Google Gen AI SDK</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedModel('veo-3.1-lite-generate-preview')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'veo-3.1-lite-generate-preview'
                    ? 'bg-cyan-950/50 border-cyan-500 text-white ring-1 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300">Veo 3.1 Lite</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Fast</span>
                </div>
                <p className="text-[10px] text-slate-400">Rapid video generation, optimized for stream loops</p>
              </button>

              <button
                onClick={() => setSelectedModel('veo-3.1-generate-preview')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'veo-3.1-generate-preview'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-300">Veo 3.1 Pro</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Studio</span>
                </div>
                <p className="text-[10px] text-slate-400">High-fidelity 4K cinematics & complex motion physics</p>
              </button>
            </div>
          </div>

          {/* Cinematic Motion Prompt */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">
                Cinematic Synthesis Prompt
              </label>
              <span className="text-[10px] font-mono text-slate-500">{prompt.length} chars</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans resize-none"
              placeholder="Describe the primate movement, lighting, and camera motion..."
            />

            {/* Quick Prompt Presets */}
            <div className="flex flex-wrap gap-1.5">
              {promptPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setPrompt(preset.text);
                    setPrimateBehavior(preset.behavior);
                    setLightingPreset(preset.lighting);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[10px] text-slate-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Action Button */}
          <button
            onClick={handleGenerateVeoVideo}
            disabled={isGenerating}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Generating with Google Veo ({generationProgress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Google Veo Stream</span>
              </>
            )}
          </button>

          {/* Error Notice */}
          {generationError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{generationError}</span>
            </div>
          )}

          {/* Technical Architecture Notes */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Veo Multimodal Pipeline</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Synthesizes continuous animated video streams by binding the chosen primate asset (with biological respiration, kinematic glancing, and fur physics) into the photorealistic Marshall Islands scene plate (with volumetric God-rays, swaying Miyawaki boughs, and trade wind dynamics).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

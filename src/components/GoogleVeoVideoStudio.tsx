import React, { useState, useEffect, useRef } from 'react';
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
  Info
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
  // Generation configuration
  const [selectedModel, setSelectedModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>('veo-3.1-lite-generate-preview');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
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

  // Active Stream / Video playback
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    'https://assets.mixkit.co/videos/preview/mixkit-curious-monkey-in-a-tree-41808-large.mp4'
  );
  const [activeStreamTitle, setActiveStreamTitle] = useState<string>(
    `${currentTwin.name} • ${currentScene.name} Live Stream`
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Curated live feeds from server
  const [liveStreams, setLiveStreams] = useState<LivePrimateStream[]>([]);
  const [streamSourceType, setStreamSourceType] = useState<'veo-generated' | 'live-cam-stream'>('live-cam-stream');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pollTimerRef = useRef<any>(null);

  // Sync prompt when twin or scene changes
  useEffect(() => {
    setPrompt(
      `A cinematic 4K wildlife documentary shot of ${currentTwin.name} (${currentTwin.species}) exploring the lush canopy of ${currentScene.name} in the Marshall Islands, sunlight filtering through the dense Miyawaki banyan trees.`
    );
  }, [currentTwin.name, currentTwin.species, currentScene.name]);

  // Fetch initial live stream list
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

  // Video time update listener
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => setDuration(v.duration);
    const onEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('ended', onEnded);
    };
  }, [isLooping]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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

  // Start Google Veo Video Generation
  const handleGenerateVeoVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationError(null);
    setGenerationStatusText('Initializing Google Veo 3.1 video synthesis pipeline...');

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
      setGenerationStatusText('Rendering neural temporal frames across monkey asset & scene backdrop...');
      setGenerationProgress(25);

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

        // Increment progress indicator
        setGenerationProgress((prev) => Math.min(94, prev + Math.floor(Math.random() * 8) + 4));

        if (statusData.done) {
          clearInterval(pollTimerRef.current);
          setGenerationProgress(100);
          setGenerationStatusText('Video synthesis complete! Streaming buffer ready.');

          // If fallback/preview has a direct URL
          if (statusData.videoUrl) {
            setActiveVideoUrl(statusData.videoUrl);
          } else {
            // For Google Veo direct output, stream via server endpoint
            setActiveVideoUrl(`/api/video/download?op=${encodeURIComponent(operationName)}`);
          }

          setActiveStreamTitle(`Google Veo: ${currentTwin.name} in ${currentScene.name}`);
          setStreamSourceType('veo-generated');
          setIsGenerating(false);

          // Auto-play the new video
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }, 400);
        } else if (attempts > 30) {
          // Timeout guard
          clearInterval(pollTimerRef.current);
          setIsGenerating(false);
          setGenerationStatusText('Generation is processing asynchronously in Google Cloud.');
        }
      } catch (pollErr) {
        console.warn('Polling check error:', pollErr);
      }
    }, 2500);
  };

  // Switch to a curated live stream feed
  const handleSelectLiveStream = (stream: LivePrimateStream) => {
    setActiveVideoUrl(stream.url);
    setActiveStreamTitle(stream.title);
    setStreamSourceType('live-cam-stream');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Prompt Preset buttons
  const promptPresets = [
    {
      label: 'Canopy Foraging',
      text: `Cinematic 4K telephoto documentary shot of ${currentTwin.name} foraging for wild figs along the emergent banyan canopy of ${currentScene.name}, golden sunlight, hyperrealistic fur detail.`,
    },
    {
      label: 'Rainforest Rain Dynamics',
      text: `Cinematic slow-motion 60fps video of ${currentTwin.name} sheltered under giant tropical leaves during a warm monsoon downpour in ${currentScene.name}, water droplets glistening on simian fur.`,
    },
    {
      label: 'Arboreal Leaping',
      text: `Wide angle action tracking shot of ${currentTwin.name} gracefully leaping across vine corridors in ${currentScene.name}, cinematic lighting, photorealistic biological motion.`,
    },
    {
      label: 'Sanctuary Sunset Grooming',
      text: `Atmospheric golden hour wildlife documentary shot of ${currentTwin.name} resting serenely on an elevated Miyawaki branch at sunset, warm cinematic anamorphic lens flares.`,
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
                VEO 3.1 AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate photorealistic video streams from rescued primate assets and Miyawaki canopy environments
            </p>
          </div>
        </div>

        {/* Live Indicator & Stream Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>STREAM ONLINE</span>
            <span className="text-slate-600">•</span>
            <span>60 FPS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAM_HAVEN_04</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player + Asset Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left 7 Cols: Video Stream Player */}
        <div className="lg:col-span-7 flex flex-col bg-black">
          {/* Stream Stage Canvas */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group"
          >
            {/* Native Video Element */}
            <video
              ref={videoRef}
              src={activeVideoUrl}
              autoPlay
              loop={isLooping}
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              poster={currentTwin.imageUrl}
            />

            {/* Video Overlay HUD & Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold">LIVE RELAY</span>
              </span>

              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300">
                {resolution} • {aspectRatio}
              </span>

              {streamSourceType === 'veo-generated' && (
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur-md border border-cyan-500/50 text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Google Veo 3.1 Neural Output</span>
                </span>
              )}
            </div>

            {/* Top Right: Primate Twin & GPS Coordinates HUD */}
            <div className="absolute top-3 right-3 text-right pointer-events-none hidden sm:block">
              <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300">
                <p className="font-semibold text-emerald-400">{currentTwin.name} ({currentTwin.species})</p>
                <p className="text-[9px] text-slate-400">9.0543° N, 167.4432° E • Canopy +14.8m</p>
              </div>
            </div>

            {/* Generating Overlay / Loading progress */}
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
                  {generationProgress}% Complete
                </span>
              </div>
            )}

            {/* Center Play/Pause button on hover */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-2xl"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 text-emerald-400" />}
            </button>

            {/* Bottom Stream Player Control Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 flex flex-col gap-2 z-10">
              {/* Scrub bar */}
              <div
                className="w-full h-1 bg-slate-700/80 hover:h-2 rounded-full cursor-pointer transition-all relative overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) {
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1 transition-colors ${isLooping ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                    title="Toggle Loop"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-slate-400 ml-2">
                    {Math.floor(currentTime)}s / {Math.floor(duration || 0)}s
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="truncate max-w-[200px] text-slate-400 text-[11px]">
                    {activeStreamTitle}
                  </span>

                  <a
                    href={activeVideoUrl}
                    download="monkey-dao-stream.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-emerald-400 transition-colors"
                    title="Download MP4 Video Stream"
                  >
                    <Download className="w-4 h-4" />
                  </a>

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

          {/* Curated Haven Camera Feeds Selector */}
          <div className="p-4 bg-slate-950 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Live Primate Sanctuary Camera Feeds (Marshall Islands Haven)
              </span>
              <span className="text-[10px] font-mono text-slate-500">3 CHANNELS ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {liveStreams.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => handleSelectLiveStream(stream)}
                  className={`text-left p-2 rounded-xl border transition-all flex items-center gap-2.5 ${
                    activeVideoUrl === stream.url
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <img
                    src={stream.poster}
                    alt={stream.primate}
                    className="w-12 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{stream.primate}</p>
                    <p className="text-[10px] text-slate-400 truncate">{stream.scene}</p>
                    <span className="text-[9px] font-mono text-emerald-400">1080p • 60 FPS</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Google Veo AI Generation Controls */}
        <div className="lg:col-span-5 p-5 bg-slate-900/50 flex flex-col gap-5 overflow-y-auto max-h-[750px]">
          {/* Active Assets Overview */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>SELECTED MULTIMODAL INPUT ASSETS</span>
              <span className="text-cyan-400 font-bold">2 ASSETS LINKED</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Primate Asset Thumbnail */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <img
                  src={currentTwin.imageUrl}
                  alt={currentTwin.name}
                  className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-amber-400 block uppercase">Primate Asset</span>
                  <p className="text-xs font-bold text-white truncate">{currentTwin.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentTwin.species}</p>
                </div>
              </div>

              {/* Background Scene Asset Thumbnail */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <img
                  src={currentScene.highResImageUrl}
                  alt={currentScene.name}
                  className="w-10 h-10 rounded-lg object-cover border border-emerald-500/40"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-emerald-400 block uppercase">Scene Asset</span>
                  <p className="text-xs font-bold text-white truncate">{currentScene.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentScene.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Veo Model & Format Config */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Google Veo AI Model
              </label>
              <span className="text-[10px] font-mono text-slate-500">Google Gen AI SDK</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedModel('veo-3.1-lite-generate-preview')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'veo-3.1-lite-generate-preview'
                    ? 'bg-cyan-950/50 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300">Veo 3.1 Lite</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Fast</span>
                </div>
                <p className="text-[10px] text-slate-400">Low-latency video generation, 720p/1080p</p>
              </button>

              <button
                onClick={() => setSelectedModel('veo-3.1-generate-preview')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'veo-3.1-generate-preview'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-300">Veo 3.1 Pro</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Studio</span>
                </div>
                <p className="text-[10px] text-slate-400">High-fidelity cinematics & extended motion</p>
              </button>
            </div>

            {/* Resolution and Aspect Ratio Selectors */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 mb-1 block">Resolution</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      resolution === '720p' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    720p HD
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      resolution === '1080p' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 mb-1 block">Aspect Ratio</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      aspectRatio === '16:9' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      aspectRatio === '9:16' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Editor & Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">
                Cinematic Motion Prompt
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
                  onClick={() => setPrompt(preset.text)}
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
                <span>Generate Veo Video Stream</span>
              </>
            )}
          </button>

          {/* Error notice if any */}
          {generationError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{generationError}</span>
            </div>
          )}

          {/* Technical Info Footnote */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Google Video AI Architecture</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Synthesizes dynamic video frames directly from the rescued primate digital twin image and high-resolution USD canopy plate using Google Gen AI video endpoints (<code className="text-cyan-300">/api/video/generate</code> &amp; <code className="text-cyan-300">/api/video/status</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

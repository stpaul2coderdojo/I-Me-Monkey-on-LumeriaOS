import React, { useState, useEffect, useMemo } from 'react';
import { CinematicUsdScene, MonkeyDigitalTwin } from '../types';
import { CINEMATIC_USD_SCENES } from '../data/cinematicUsdScenes';
import {
  Sparkles,
  Code,
  Download,
  Copy,
  Check,
  Wand2,
  Loader2,
  X,
  Film,
  Video,
  Layers,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { GoogleVeoVideoStudio } from './GoogleVeoVideoStudio';

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

  // Viewport mode — exclusively powered by Google Veo Video Studio, USDA Code, and Multi-Pass specs
  const [viewportTab, setViewportTab] = useState<'veo-video' | 'usda-code' | 'render-passes'>('veo-video');

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
    <div className="space-y-6">
      {/* Top Banner & Scene Selector Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Google Veo Video Stream Studio
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-cyan-300 font-mono">Neural Video Diffusion API</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-amber-300 font-medium">Marshall Islands Haven Sanctuary</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Cinematic Veo Video Stage</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                Veo 3.1 & 2.0 API
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Synthesizing hyperrealistic 1080p cinematic video streams directly from rescued Marshall Islands primate portraits and canopy scene assets using the Google Veo API.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/40 active:scale-95"
            >
              <Wand2 className="w-4 h-4 text-emerald-200" />
              <span>Generate USD Scene</span>
            </button>

            {onNavigateToGovernance && (
              <button
                onClick={onNavigateToGovernance}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
              >
                <span>Bio-Corridor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scene Reel Selector Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 relative z-10">
          {scenesList.map((scene) => {
            const isSelected = scene.id === activeSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => setActiveSceneId(scene.id)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                    : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Thumbnail background or fallback preview */}
                {scene.highResImageUrl && (
                  <div
                    className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${scene.highResImageUrl})` }}
                  />
                )}

                <div className="flex items-center justify-between gap-1 mb-1.5 relative z-10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    {scene.timeOfDay.split(' ')[0]}
                  </span>
                </div>

                <div className="relative z-10">
                  <div
                    className={`font-bold text-xs truncate transition-colors ${
                      isSelected ? 'text-emerald-300' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {scene.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {scene.location.split(',')[0]}
                  </div>
                </div>

                <div className="mt-2 text-[9px] font-mono text-slate-400 flex items-center justify-between relative z-10">
                  <span>{scene.cameraFocalLength.split(' ')[0]}</span>
                  <span className="text-emerald-400/80">{scene.timeOfDay.includes('Dawn') || scene.timeOfDay.includes('Noon') ? 'Day' : 'Night'}</span>
                </div>
              </button>
            );
          })}

          {/* Antigravity Agent USD Generator Quick Button */}
          <button
            onClick={() => setShowGenerateModal(true)}
            className="text-left p-3 rounded-xl border border-dashed border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                AI GEN
              </span>
            </div>

            <div>
              <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>+ Generate Scene</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Marshall Islands USD</div>
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
              onClick={() => setViewportTab('veo-video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
                viewportTab === 'veo-video'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Veo Stream</span>
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

          {/* Right: Primate & Lens Info */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">{selectedTwin.name}</span>
            <span>•</span>
            <span>{activeScene.cameraFocalLength}</span>
          </div>
        </div>

        {/* TAB 1: Google Veo AI Video Stream Studio */}
        {viewportTab === 'veo-video' && (
          <div className="p-4 bg-[#050811]">
            <GoogleVeoVideoStudio
              currentTwin={selectedTwin}
              allTwins={allTwins}
              currentScene={activeScene}
              allScenes={scenesList}
              onSelectTwin={(twin) => onSelectTwin(twin.id)}
              onSelectScene={(scene) => setActiveSceneId(scene.id)}
            />
          </div>
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">Hyperreal PBR Shaders & UsdSkel Telemetry</span>
              </div>
              <span className="font-mono text-purple-300 text-[11px]">Subsurface Diffusion Profile</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Material 1: Epidermal Subsurface Scattering */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center justify-between">
                  <span>Epidermal SSS Profile</span>
                  <span className="text-[10px] font-mono text-slate-500">UsdPreviewSurface</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">subsurfaceColor:</span>
                    <span className="text-emerald-400">(0.82, 0.44, 0.31)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">scatteringDistance:</span>
                    <span className="text-white">2.4 mm (Dermis)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">melaninDensity:</span>
                    <span className="text-amber-300">0.68 (Equatorial)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">roughness:</span>
                    <span className="text-cyan-300">0.34 (Hydrated)</span>
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
                    <span className="text-cyan-400">Active Bough Grip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                disabled={isGenerating}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSceneWithAntigravity} className="mt-4 space-y-4 text-xs">
              {genError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sanctuary Location</label>
                  <select
                    value={genAtoll}
                    onChange={(e) => setGenAtoll(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    disabled={isGenerating}
                  >
                    <option value="Majuro Atoll">Majuro Atoll (Canopy Haven)</option>
                    <option value="Kwajalein Atoll">Kwajalein Atoll (Coral Boughs)</option>
                    <option value="Jaluit Atoll">Jaluit Atoll (Mangrove Bio-Corridor)</option>
                    <option value="Arno Atoll">Arno Atoll (Coastal Palms & Palms)</option>
                    <option value="Mili Atoll">Mili Atoll (Pristine Coral Sanctuary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Primate Twin</label>
                  <select
                    value={genPrimate}
                    onChange={(e) => setGenPrimate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    disabled={isGenerating}
                  >
                    {allTwins.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.species})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Time & Solar Lighting</label>
                  <select
                    value={genTimeOfDay}
                    onChange={(e) => setGenTimeOfDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    disabled={isGenerating}
                  >
                    <option value="Golden Hour Sunset">Golden Hour Sunset (2800K Warm)</option>
                    <option value="Emerald Dawn">Emerald Dawn (4200K Soft Diffuse)</option>
                    <option value="High Noon Tropical">High Noon Equatorial (6500K Direct Sun)</option>
                    <option value="Tropical Monsoon">Tropical Monsoon Rain (Overcast & Mist)</option>
                    <option value="Bioluminescent Night">Bioluminescent Night (Moonlit Deep Blue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Camera Optical Preset</label>
                  <select
                    value={genCameraLens}
                    onChange={(e) => setGenCameraLens(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    disabled={isGenerating}
                  >
                    <option value="50mm Anamorphic Prime f/1.2">50mm Anamorphic Prime f/1.2</option>
                    <option value="85mm Portrait Cine f/1.4">85mm Portrait Cine f/1.4</option>
                    <option value="24mm Ultra-Wide Canopy Scope">24mm Ultra-Wide Canopy Scope</option>
                    <option value="105mm Macro Micro-Expression">105mm Macro Micro-Expression</option>
                    <option value="LiDAR Depth Scanner 360">LiDAR Depth Scanner 360</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Environment Mood & Vegetative Density</label>
                <input
                  type="text"
                  value={genEnvironmentMood}
                  onChange={(e) => setGenEnvironmentMood(e.target.value)}
                  placeholder="e.g. Miyawaki Bio-Corridor with breadfruit flowers & ocean salt mist"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Custom Artistic & Ethogram Directives (Optional)</label>
                <textarea
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="e.g. Focus on micro-expressions, tail relaxed at 45 degrees, trade breeze rustling high bough leaves..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  disabled={isGenerating}
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 animate-pulse font-mono">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{agentStep}</span>
                    </span>
                  ) : (
                    <span>Creates schema in ACEScg color space</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all shadow-md shadow-emerald-900/40 border border-emerald-400/30 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Synthesize Scene</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

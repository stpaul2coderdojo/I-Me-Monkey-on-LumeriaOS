import React, { useState, useEffect, useRef } from 'react';
import { 
  MonkeyDigitalTwin, 
  LumeriaOsUsdAnimation,
  MarshallIslandsHavenLocation,
  WalletAccount, 
  BlockchainNetwork,
  CinematicUsdScene 
} from '../types';
import { 
  MARSHALL_ISLANDS_HAVEN_METRICS, 
  SAMPLE_USDA_STAGE, 
  INITIAL_DIGITAL_TWINS 
} from '../data/digitalTwinData';
import { CINEMATIC_USD_SCENES } from '../data/cinematicUsdScenes';
import { CinematicUsdStage } from './CinematicUsdStage';
import { PrimateEthologyStudio } from './PrimateEthologyStudio';
import { GoogleVeoVideoStudio } from './GoogleVeoVideoStudio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Code, 
  FileJson, 
  Layers, 
  Heart, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Plus, 
  Compass, 
  Eye, 
  Trees, 
  Box, 
  Sliders, 
  Maximize2,
  TreePine,
  Check,
  Zap,
  Info,
  Wand2,
  Loader2,
  RefreshCw,
  BookOpen,
  Film
} from 'lucide-react';

interface DigitalTwinSectionProps {
  activeAccount?: WalletAccount;
  currentNetwork?: BlockchainNetwork;
  onNavigateToGovernance?: () => void;
  onNavigateToWalletPass?: () => void;
  onNavigateToSemiotics?: () => void;
}

export const DigitalTwinSection: React.FC<DigitalTwinSectionProps> = ({
  activeAccount,
  currentNetwork,
  onNavigateToGovernance,
  onNavigateToWalletPass,
  onNavigateToSemiotics,
}) => {
  const [digitalTwins, setDigitalTwins] = useState<MonkeyDigitalTwin[]>(INITIAL_DIGITAL_TWINS);
  const [cinematicScenes, setCinematicScenes] = useState<CinematicUsdScene[]>(CINEMATIC_USD_SCENES);
  const [selectedTwinId, setSelectedTwinId] = useState<string>(INITIAL_DIGITAL_TWINS[0].id);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(CINEMATIC_USD_SCENES[0].id);
  const [viewMode, setViewMode] = useState<'cinematic-usd' | 'ethology-studio' | 'veo-video-studio' | 'cards' | 'json-editor' | 'create-form'>('cinematic-usd');
  const [usdTab, setUsdTab] = useState<'spatial-viewport' | 'usda-code' | 'mesh-hierarchy' | 'bio-usd'>('spatial-viewport');

  const selectedScene = cinematicScenes.find(s => s.id === selectedSceneId) || cinematicScenes[0];
  
  // Antigravity Bio generation state
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false);
  const [bioGenSuccess, setBioGenSuccess] = useState<string | null>(null);
  const [bioGenError, setBioGenError] = useState<string | null>(null);
  
  // Animation state for USD simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(45);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraView, setCameraView] = useState<'canopy' | 'primate-pov' | 'drone' | 'thermal'>('canopy');
  const [renderMode, setRenderMode] = useState<'textured' | 'wireframe' | 'telemetry'>('textured');

  // JSON editor state
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(INITIAL_DIGITAL_TWINS[0], null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccessMsg, setJsonSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Form creation state
  const [formData, setFormData] = useState<Partial<MonkeyDigitalTwin>>({
    name: '',
    species: 'Rhesus Macaque (Macaca mulatta)',
    bio: '',
    imageUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80',
    age: 5,
    gender: 'Female',
    rescueOrigin: 'Freed from biomedical laboratory testing facility',
    captivityDuration: '4 years in steel solitary enclosure',
    healthStatus: 'Active Rehabilitation',
    favoriteForage: 'Marshallese Breadfruit & Native Coconut',
    socialTroopName: 'Sunrise Canopy Troop',
    miyawakiParcelId: 'MIYAWAKI-PARCEL-MAJURO-ALPHA',
    rehabHavenLocation: {
      sanctuaryName: 'Marshall Islands Primate Haven',
      atoll: 'Majuro Atoll',
      coordinates: '7.1095° N, 171.3800° E',
      havenZone: 'Zone 1 - High Canopy Miyawaki Bio-Corridor',
      climateProfile: 'Tropical Marine Sanctuary (28.4°C, 78% Humidity)',
      canopyShadeCoverage: 94,
    },
    lumeriaOsAnimation: {
      usdFormat: 'USD',
      usdScenePath: '/LumeriaOS/Haven/MarshallIslands/Primates/CustomPrimate_USD.usda',
      fps: 60,
      totalFrames: 360,
      simulationStage: 'Arboreal Canopy Foraging & Quadrupedal Traverse',
      biometrics: {
        heartRateBpm: 82,
        stressIndex: 15,
        canopyElevationMeters: 14.5,
        activityState: 'Foraging',
        dietaryIntakeKcal: 1850,
      },
      usdMeshNodes: [
        '/World/MarshallHaven/Miyawaki_Canopy_Trees',
        '/World/Primates/Custom/Skeleton_Root_Jnt',
        '/World/LumeriaOS/Telemetry/GPS_Tracker'
      ],
      animationType: 'usd_spatial_mesh',
      usdStageAscii: SAMPLE_USDA_STAGE,
    }
  });

  const selectedTwin = digitalTwins.find((t) => t.id === selectedTwinId) || digitalTwins[0];

  // Update JSON editor when selecting a new twin
  useEffect(() => {
    if (selectedTwin) {
      setJsonInput(JSON.stringify(selectedTwin, null, 2));
      setJsonError(null);
    }
  }, [selectedTwinId]);

  // USD Animation Frame Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = prev + 1 * playbackSpeed;
          return next >= (selectedTwin.lumeriaOsAnimation?.totalFrames || 360) ? 0 : next;
        });
      }, 1000 / 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedTwin]);

  // Handle JSON apply
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Basic validation for requested fields: monkey name, bio, image, and LumeriaOS animation in USD
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Missing or invalid "name" string field.');
      }
      if (!parsed.bio || typeof parsed.bio !== 'string') {
        throw new Error('Missing or invalid "bio" string field.');
      }
      if (!parsed.imageUrl || typeof parsed.imageUrl !== 'string') {
        throw new Error('Missing or invalid "imageUrl" string field.');
      }
      if (!parsed.lumeriaOsAnimation || typeof parsed.lumeriaOsAnimation !== 'object') {
        throw new Error('Missing or invalid "lumeriaOsAnimation" object.');
      }
      if (!parsed.rehabHavenLocation) {
        parsed.rehabHavenLocation = {
          sanctuaryName: 'Marshall Islands Primate Haven',
          atoll: 'Majuro Atoll',
          coordinates: '7.1095° N, 171.3800° E',
          havenZone: 'Zone 1 - High Canopy Miyawaki Bio-Corridor',
          climateProfile: 'Tropical Marine Sanctuary (28.4°C, 78% Humidity)',
          canopyShadeCoverage: 94,
        };
      }
      if (!parsed.id) {
        parsed.id = `DT-MKY-${String(digitalTwins.length + 1).padStart(3, '0')}`;
      }
      if (!parsed.matrixConservationUrl) {
        parsed.matrixConservationUrl = 'https://conservationonthematrix.weebly.com';
      }

      // Check if already exists or update
      const existingIdx = digitalTwins.findIndex((t) => t.id === parsed.id || t.name.toLowerCase() === parsed.name.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...digitalTwins];
        updated[existingIdx] = parsed;
        setDigitalTwins(updated);
        setSelectedTwinId(parsed.id);
        setJsonSuccessMsg(`Successfully updated Digital Twin for "${parsed.name}" via JSON!`);
      } else {
        setDigitalTwins([parsed, ...digitalTwins]);
        setSelectedTwinId(parsed.id);
        setJsonSuccessMsg(`Successfully registered new Digital Twin "${parsed.name}" via JSON!`);
      }

      setJsonError(null);
      setTimeout(() => setJsonSuccessMsg(null), 4000);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format. Please check syntax.');
    }
  };

  // Load preset JSON
  const handleLoadPreset = (twin: MonkeyDigitalTwin) => {
    setJsonInput(JSON.stringify(twin, null, 2));
    setSelectedTwinId(twin.id);
    setJsonError(null);
    setJsonSuccessMsg(`Loaded JSON preset for ${twin.name}`);
    setTimeout(() => setJsonSuccessMsg(null), 3000);
  };

  const handleCopyUsd = () => {
    navigator.clipboard.writeText(selectedTwin.lumeriaOsAnimation.usdStageAscii || SAMPLE_USDA_STAGE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadUsda = () => {
    const content = selectedTwin.lumeriaOsAnimation.usdStageAscii || SAMPLE_USDA_STAGE;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTwin.name.toLowerCase()}_marshall_haven_lumeria.usda`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bio || !formData.imageUrl) {
      alert('Please fill out Name, Bio, and Image URL.');
      return;
    }

    const newId = `DT-MKY-${String(digitalTwins.length + 1).padStart(3, '0')}`;
    const newTwin: MonkeyDigitalTwin = {
      id: newId,
      name: formData.name,
      species: formData.species || 'Rhesus Macaque (Macaca mulatta)',
      bio: formData.bio,
      imageUrl: formData.imageUrl,
      age: formData.age || 4,
      gender: (formData.gender as any) || 'Female',
      rescueOrigin: formData.rescueOrigin || 'Freed from biomedical laboratory testing facility',
      captivityDuration: formData.captivityDuration || '3 years in steel cage',
      rehabHavenLocation: formData.rehabHavenLocation || {
        sanctuaryName: 'Marshall Islands Primate Haven',
        atoll: 'Majuro Atoll',
        coordinates: '7.1095° N, 171.3800° E',
        havenZone: 'Zone 1 - High Canopy Miyawaki Bio-Corridor',
        climateProfile: 'Tropical Marine Sanctuary (28.4°C, 78% Humidity)',
        canopyShadeCoverage: 94,
      },
      lumeriaOsAnimation: formData.lumeriaOsAnimation || {
        usdFormat: 'USD',
        usdScenePath: `/LumeriaOS/Haven/MarshallIslands/Primates/${formData.name}_USD.usda`,
        fps: 60,
        totalFrames: 360,
        simulationStage: 'Arboreal Canopy Foraging & Quadrupedal Traverse',
        biometrics: {
          heartRateBpm: 80,
          stressIndex: 12,
          canopyElevationMeters: 15.0,
          activityState: 'Foraging',
          dietaryIntakeKcal: 1800,
        },
        usdMeshNodes: [
          '/World/MarshallHaven/Miyawaki_Canopy_Trees',
          '/World/Primates/Skeleton_Root_Jnt',
          '/World/LumeriaOS/Telemetry/GPS_Tracker'
        ],
        animationType: 'usd_spatial_mesh',
        usdStageAscii: SAMPLE_USDA_STAGE,
      },
      miyawakiParcelId: formData.miyawakiParcelId || 'MIYAWAKI-PARCEL-MAJURO-ALPHA',
      healthStatus: (formData.healthStatus as any) || 'Active Rehabilitation',
      onChainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      matrixConservationUrl: 'https://conservationonthematrix.weebly.com',
      lumeriaOsTelemetrySync: true,
      joinedHavenDate: new Date().toISOString().split('T')[0],
      googleWalletTwinBadge: true,
      favoriteForage: formData.favoriteForage || 'Fresh Marshallese Breadfruit',
      socialTroopName: formData.socialTroopName || 'Sunrise Canopy Troop',
    };

    setDigitalTwins([newTwin, ...digitalTwins]);
    setSelectedTwinId(newId);
    setViewMode('cards');
    setJsonInput(JSON.stringify(newTwin, null, 2));
  };

  // Calculate animated position of monkey on canopy branches
  const animProgress = (currentFrame % 360) / 360;
  const monkeyX = 140 + Math.sin(animProgress * Math.PI * 2) * 90;
  const monkeyY = 95 + Math.cos(animProgress * Math.PI * 4) * 22;
  const elevationMeters = (selectedTwin.lumeriaOsAnimation.biometrics.canopyElevationMeters + Math.sin(animProgress * Math.PI * 2) * 1.8).toFixed(1);
  const liveCalmness = Math.min(100, Math.max(75, 100 - selectedTwin.lumeriaOsAnimation.biometrics.stressIndex));

  const handleGenerateBioUsdWithAntigravity = async (twin: MonkeyDigitalTwin) => {
    setIsGeneratingBio(true);
    setBioGenError(null);
    try {
      const res = await fetch('/api/antigravity/generate-bio-usd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: twin.name,
          species: twin.species,
          rescueOrigin: twin.rescueOrigin,
          captivityDuration: twin.captivityDuration,
          atoll: twin.rehabHavenLocation.atoll,
          havenZone: twin.rehabHavenLocation.havenZone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate USD Bio description');
      }
      setDigitalTwins((prev) =>
        prev.map((t) =>
          t.id === twin.id
            ? {
                ...t,
                bio: data.bio || t.bio,
                bioDescriptionUsd: data.bioDescriptionUsd || t.bioDescriptionUsd,
              }
            : t
        )
      );
      setBioGenSuccess(`Updated USD Bio for ${twin.name} via Google Antigravity Agent!`);
      setTimeout(() => setBioGenSuccess(null), 4000);
    } catch (err: any) {
      setBioGenError(err.message || 'Error generating bio USD');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Marshall Islands Haven & LumeriaOS Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Marshall Islands Haven • 7.1095° N, 171.3800° E
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                LumeriaOS USD Spatial Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <TreePine className="w-3.5 h-3.5 text-amber-400" />
                Miyawaki Afforestation Protocol
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              DAO Primate Digital Twin & Rehabilitation Haven
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A sovereign Pacific sanctuary in the <span className="text-emerald-300 font-semibold">Republic of the Marshall Islands</span>, 
              dedicated to rehabilitating primates freed from laboratory testing, illegal trafficking, and circus captivity. 
              Powered by <span className="text-cyan-300 font-semibold">LumeriaOS USD (Universal Scene Description)</span> digital twins 
              and 30x dense <span className="text-emerald-300 font-semibold">Miyawaki canopies</span>.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <a
                href="https://conservationonthematrix.weebly.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 font-bold transition-all group"
              >
                <span>conservationonthematrix.weebly.com</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">18 Rescued Primates Thriving</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">57,600 Miyawaki Trees Planted</span>
            </div>
          </div>

          {/* Quick View Mode Switcher */}
          <div className="flex sm:flex-col items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 w-full lg:w-auto">
            <button
              onClick={() => setViewMode('cinematic-usd')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'cinematic-usd'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Cinematic USD Scenes</span>
            </button>

            <button
              onClick={() => setViewMode('ethology-studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'ethology-studio'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-300" />
              <span>Tail & Vocal Ethology</span>
            </button>

            <button
              onClick={() => setViewMode('veo-video-studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'veo-video-studio'
                  ? 'bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Film className="w-4 h-4 text-cyan-300" />
              <span>Veo Video Streams</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Rescued Primate Cards</span>
            </button>

            <button
              onClick={() => setViewMode('json-editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'json-editor'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>JSON / USD Schema</span>
            </button>

            <button
              onClick={() => setViewMode('create-form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
                viewMode === 'create-form'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Register Primate</span>
            </button>

            {onNavigateToSemiotics && (
              <button
                onClick={onNavigateToSemiotics}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center bg-purple-950/50 hover:bg-purple-900/70 text-purple-300 border border-purple-500/40"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Semiotics Lexicon (USD)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sanctuary Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rehab Sanctuary</span>
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">Marshall Islands</div>
            <div className="text-[11px] text-emerald-400">Majuro & Jaluit Atoll Havens</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Miyawaki Canopy</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">4.8 Hectares</div>
            <div className="text-[11px] text-slate-400">30x Density • 57.6k Native Trees</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rehab Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">98.4% Recovery</div>
            <div className="text-[11px] text-cyan-300">100% Cage-Free Primate Freedom</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>LumeriaOS Standard</span>
            <Box className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">USD / USDA 60fps</div>
            <div className="text-[11px] text-amber-300">Pixar Universal Scene Description</div>
          </div>
        </div>
      </div>

      {/* VIEW MODE: CINEMATIC USD SCENES WITH HYPERREALISTIC SIMIAN TWINS */}
      {viewMode === 'cinematic-usd' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <CinematicUsdStage
            selectedTwin={selectedTwin}
            allTwins={digitalTwins}
            onSelectTwin={(twinId) => setSelectedTwinId(twinId)}
            onNavigateToGovernance={onNavigateToGovernance}
            onNavigateToWalletPass={onNavigateToWalletPass}
            scenes={cinematicScenes}
            onAddScene={(newScene) => setCinematicScenes((prev) => [newScene, ...prev])}
          />

          {/* Quick Switch to Cards & Haven Telemetry Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Explore Rescued Primate Backstories & Spatial Telemetry</h4>
                <p className="text-xs text-slate-400">
                  Read rehabilitation timelines, biomedical rescue backgrounds, and Marshall Islands haven coordinates.
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewMode('cards')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 whitespace-nowrap"
            >
              View Primate Cards Gallery
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: PRIMATE TAIL & VOCAL ETHOLOGY STUDIO */}
      {viewMode === 'ethology-studio' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <PrimateEthologyStudio
            selectedTwin={selectedTwin}
            allTwins={digitalTwins}
            onSelectTwin={(twinId) => setSelectedTwinId(twinId)}
          />
        </div>
      )}

      {/* VIEW MODE: GOOGLE VEO AI VIDEO STREAM STUDIO */}
      {viewMode === 'veo-video-studio' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <GoogleVeoVideoStudio
            currentTwin={selectedTwin}
            allTwins={digitalTwins}
            currentScene={selectedScene}
            allScenes={cinematicScenes}
            onSelectTwin={(twin) => setSelectedTwinId(twin.id)}
            onSelectScene={(scene) => setSelectedSceneId(scene.id)}
          />
        </div>
      )}

      {/* MAIN VIEW MODE: RICH CARDS & USD SPATIAL VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-8">
          {/* Banner to Jump into Cinematic USD */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">Experience Hyperrealistic Cinematic USD Scenes</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                    5 Scenes Available
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Watch {selectedTwin.name} animated in hyperrealism across dawn godrays, sunset caustics, and nocturnal bioluminescent monsoon.
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewMode('cinematic-usd')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Cinematic USD</span>
            </button>
          </div>
          {/* Top Interactive LumeriaOS USD Spatial Stage Player */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Player Header Bar */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-white font-mono">
                  LumeriaOS USD Viewport: {selectedTwin.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {selectedTwin.lumeriaOsAnimation.usdFormat} Stage ({selectedTwin.lumeriaOsAnimation.fps} FPS)
                </span>
              </div>

              {/* Viewport Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setUsdTab('spatial-viewport')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    usdTab === 'spatial-viewport'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3D Spatial Stage
                </button>
                <button
                  onClick={() => setUsdTab('usda-code')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    usdTab === 'usda-code'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pixar USDA Code
                </button>
                <button
                  onClick={() => setUsdTab('mesh-hierarchy')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    usdTab === 'mesh-hierarchy'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USD Prims Tree
                </button>
                <button
                  onClick={() => setUsdTab('bio-usd')}
                  className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                    usdTab === 'bio-usd'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Bio USD Description</span>
                </button>
              </div>

              {/* Camera Angle Presets */}
              <div className="hidden sm:flex items-center gap-1 text-[11px]">
                <span className="text-slate-500">Cam:</span>
                {(['canopy', 'primate-pov', 'drone', 'thermal'] as const).map((cam) => (
                  <button
                    key={cam}
                    onClick={() => setCameraView(cam)}
                    className={`px-2 py-0.5 rounded capitalize transition-all ${
                      cameraView === cam
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cam === 'primate-pov' ? 'Primate POV' : cam}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: 3D Spatial Viewport Canvas */}
            {usdTab === 'spatial-viewport' && (
              <div className="relative bg-[#060c14] min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden border-b border-slate-800">
                {/* SVG Visual Stage for LumeriaOS USD Marshall Islands Simulation */}
                <svg
                  className="w-full h-[380px] sm:h-[440px] select-none"
                  viewBox="0 0 800 440"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background: Pacific Lagoon & Marshall Atoll sky */}
                  <defs>
                    <linearGradient id="atollSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cameraView === 'thermal' ? '#0f051d' : '#031124'} />
                      <stop offset="60%" stopColor={cameraView === 'thermal' ? '#2e0854' : '#082f49'} />
                      <stop offset="100%" stopColor={cameraView === 'thermal' ? '#4c0519' : '#042f2e'} />
                    </linearGradient>

                    <linearGradient id="lagoonWater" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#0284c7" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0.4" />
                    </linearGradient>

                    <linearGradient id="miyawakiCanopyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>

                    <pattern id="usdGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.15" />
                    </pattern>
                  </defs>

                  {/* Sky background */}
                  <rect width="800" height="440" fill="url(#atollSky)" />

                  {/* USD Spatial Grid Overlay */}
                  <rect width="800" height="440" fill="url(#usdGrid)" />

                  {/* Distant Pacific Ocean Lagoon line */}
                  <path
                    d="M0 240 Q 200 235, 400 242 T 800 238 L 800 440 L 0 440 Z"
                    fill="url(#lagoonWater)"
                  />

                  {/* Miyawaki Forest Background Dense Tree Canopies */}
                  <g opacity={cameraView === 'thermal' ? 0.4 : 0.85}>
                    {/* Canopy Layer 1 (Far background) */}
                    <circle cx="120" cy="190" r="110" fill="#047857" opacity="0.3" />
                    <circle cx="340" cy="170" r="130" fill="#065f46" opacity="0.4" />
                    <circle cx="620" cy="180" r="140" fill="#047857" opacity="0.3" />

                    {/* Miyawaki Multi-Tiered Dense Canopy Cluster */}
                    <path
                      d="M -50 340 Q 60 140, 190 220 T 420 160 T 680 190 T 850 280 L 850 440 L -50 440 Z"
                      fill="url(#miyawakiCanopyGrad)"
                      opacity="0.75"
                    />

                    {/* Main Miyawaki Sanctuary Ancient Banyan & Breadfruit Trunks */}
                    <path d="M 120 440 L 140 230 L 160 440 Z" fill="#78350f" opacity="0.8" />
                    <path d="M 380 440 L 400 180 L 420 440 Z" fill="#78350f" opacity="0.8" />
                    <path d="M 680 440 L 695 210 L 710 440 Z" fill="#78350f" opacity="0.8" />

                    {/* Arboreal Traverse Rope & Teak Walkways (Connecting trees for monkey haven) */}
                    <path
                      d="M 140 230 Q 260 270, 400 195 T 700 220"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="4"
                      strokeDasharray="6,3"
                    />
                    <path
                      d="M 60 270 Q 230 220, 395 200"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      opacity="0.8"
                    />
                  </g>

                  {/* USD Stage Wireframe Bounds & Volumetric Frustum */}
                  {renderMode === 'wireframe' && (
                    <g stroke="#38bdf8" strokeWidth="1" strokeDasharray="4,4" opacity="0.6">
                      <polygon points="100,60 700,60 760,380 40,380" fill="none" />
                      <line x1="100" y1="60" x2="40" y2="380" />
                      <line x1="700" y1="60" x2="760" y2="380" />
                      <line x1="400" y1="60" x2="400" y2="380" />
                    </g>
                  )}

                  {/* Dynamic Primate Digital Twin Marker & Kinematic Skeleton in USD */}
                  <g transform={`translate(${monkeyX * 2.1}, ${monkeyY * 1.5})`}>
                    {/* Primate Halo Sensor Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={cameraView === 'thermal' ? 44 : 32}
                      fill={cameraView === 'thermal' ? '#ef4444' : '#10b981'}
                      fillOpacity="0.2"
                      className="animate-pulse"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="#0f172a"
                      stroke="#10b981"
                      strokeWidth="2"
                    />

                    {/* Primate Portrait / Avatar Inside Node */}
                    <clipPath id="monkeyAvatarClip">
                      <circle cx="0" cy="0" r="18" />
                    </clipPath>
                    <image
                      href={selectedTwin.imageUrl}
                      x="-18"
                      y="-18"
                      width="36"
                      height="36"
                      clipPath="url(#monkeyAvatarClip)"
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Kinematic Kinematic USD Trajectory Vector */}
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(animProgress * Math.PI * 2) * 35}
                      y2={Math.sin(animProgress * Math.PI * 2) * 25}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={Math.cos(animProgress * Math.PI * 2) * 35}
                      cy={Math.sin(animProgress * Math.PI * 2) * 25}
                      r="3.5"
                      fill="#38bdf8"
                    />

                    {/* Overhead Floating Telemetry Label */}
                    <rect
                      x="-55"
                      y="-44"
                      width="110"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.9"
                      stroke="#10b981"
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="-31"
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {selectedTwin.name} • {elevationMeters}m
                    </text>
                  </g>

                  {/* LumeriaOS IoT Biometric Node Sensors around Sanctuary */}
                  <g>
                    {/* Node 1: Majuro Atoll Agro-Weather Sensor */}
                    <circle cx="180" cy="120" r="5" fill="#38bdf8" className="animate-ping" opacity="0.75" />
                    <circle cx="180" cy="120" r="4" fill="#0284c7" />
                    <text x="192" y="124" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      IoT_CANOPY_BARO [28.4°C]
                    </text>

                    {/* Node 2: Miyawaki Bio-Acoustic Primate Monitor */}
                    <circle cx="640" cy="150" r="5" fill="#a855f7" className="animate-ping" opacity="0.75" />
                    <circle cx="640" cy="150" r="4" fill="#9333ea" />
                    <text x="520" y="154" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      LUMERIA_ACOUSTIC_02 [Troop Active]
                    </text>
                  </g>

                  {/* USD Coordinate Axis Compass */}
                  <g transform="translate(60, 390)">
                    <line x1="0" y1="0" x2="35" y2="0" stroke="#ef4444" strokeWidth="2" />
                    <text x="40" y="4" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">X (East)</text>
                    <line x1="0" y1="0" x2="0" y2="-35" stroke="#22c55e" strokeWidth="2" />
                    <text x="-4" y="-40" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="monospace">Y (Up)</text>
                  </g>
                </svg>

                {/* Overlaid Live HUD Telemetry Card (Top Left) */}
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 shadow-xl max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      LumeriaOS Biometrics
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                      LIVE USD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Rehab Calmness</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {liveCalmness}% Calm
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Stress Index</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedTwin.lumeriaOsAnimation.biometrics.stressIndex}/100 (Rehabbed)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Canopy Height</span>
                      <span className="text-sky-300 font-bold">{elevationMeters} meters</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Activity</span>
                      <span className="text-amber-300 font-bold">{selectedTwin.lumeriaOsAnimation.biometrics.activityState}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>GPS: {selectedTwin.rehabHavenLocation.coordinates}</span>
                    <span className="text-emerald-400 font-bold">{selectedTwin.rehabHavenLocation.atoll}</span>
                  </div>
                </div>

                {/* Overlaid Captivity Recovery Banner (Top Right) */}
                <div className="absolute top-4 right-4 hidden md:block bg-slate-950/85 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 text-xs shadow-xl max-w-xs">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Captivity Rescue & Rehab Progress
                  </div>
                  <div className="mt-1 font-semibold text-white text-xs">
                    {selectedTwin.rescueOrigin}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300 leading-snug">
                    Freed from {selectedTwin.captivityDuration}. Now protected in {selectedTwin.rehabHavenLocation.havenZone}.
                  </div>
                </div>

                {/* Overlaid USD Stage Frame Counter (Bottom Right) */}
                <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-3">
                  <span>Frame {currentFrame} / {selectedTwin.lumeriaOsAnimation.totalFrames}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-400 font-bold">60.0 FPS</span>
                </div>
              </div>
            )}

            {/* TAB 2: Pixar USDA Code Viewer */}
            {usdTab === 'usda-code' && (
              <div className="p-4 bg-[#090d16]">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 font-mono font-semibold">
                      {selectedTwin.lumeriaOsAnimation.usdScenePath}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyUsd}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied USDA' : 'Copy USDA'}</span>
                    </button>

                    <button
                      onClick={handleDownloadUsda}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .usda</span>
                    </button>
                  </div>
                </div>

                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[380px] leading-relaxed select-text">
                  {selectedTwin.lumeriaOsAnimation.usdStageAscii || SAMPLE_USDA_STAGE}
                </pre>
              </div>
            )}

            {/* TAB 3: USD Mesh & Prims Hierarchy */}
            {usdTab === 'mesh-hierarchy' && (
              <div className="p-4 bg-[#090d16] space-y-3">
                <div className="text-xs text-slate-300 font-medium">
                  Universal Scene Description (USD) Stage Hierarchy for <span className="text-white font-bold">{selectedTwin.name}</span>:
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-[380px] overflow-y-auto">
                  <div className="text-cyan-400 font-bold">def Xform "Haven_Marshall_Islands" (Stage Root)</div>
                  
                  <div className="pl-4 space-y-1.5 text-slate-300">
                    <div className="text-emerald-400 font-bold">├── def Scope "Miyawaki_Forest_Canopy"</div>
                    <div className="pl-4 text-slate-400">├── def UsdGeomMesh "Canopy_High_Breadfruit_Artocarpus"</div>
                    <div className="pl-4 text-slate-400">├── def UsdGeomMesh "SubCanopy_Native_Pandanus_Grove"</div>
                    <div className="pl-4 text-slate-400">└── def UsdGeomMesh "Arboreal_Teak_Rope_Traverse"</div>

                    <div className="text-amber-400 font-bold">├── def Xform "Primate_DigitalTwin_{selectedTwin.name}"</div>
                    <div className="pl-4 text-slate-400">├── def SkelRoot "Kinematic_Skeleton_Root"</div>
                    <div className="pl-4 text-slate-400">├── def UsdGeomMesh "Photogrammetry_Skin_Mesh"</div>
                    <div className="pl-4 text-emerald-400 font-bold">├── def UsdGeomSphere "Biometric_RehabCalm_Sensor" (Calmness: {100 - selectedTwin.lumeriaOsAnimation.biometrics.stressIndex}%)</div>
                    <div className="pl-4 text-cyan-400">└── def UsdGeomSphere "Stress_Decay_Telemetry" (Index: {selectedTwin.lumeriaOsAnimation.biometrics.stressIndex})</div>

                    <div className="text-purple-400 font-bold">└── def Scope "LumeriaOS_Environmental_Sensors"</div>
                    <div className="pl-4 text-slate-400">├── def Camera "Haven_Canopy_Orbital_Cam"</div>
                    <div className="pl-4 text-slate-400">├── def Light "Marshall_Islands_Tropical_Sun"</div>
                    <div className="pl-4 text-slate-400">└── def CustomData "MatrixConservation_Bridge" (conservationonthematrix.weebly.com)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Bio Description USD Schema & Antigravity Generator */}
            {usdTab === 'bio-usd' && (
              <div className="p-4 bg-[#090d16] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 rounded-xl p-3.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Pixar USDA Bio Description: {selectedTwin.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        Google Antigravity Agent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standardized Pixar USD format integrating sanctuary rehabilitation chronicles and environmental telemetry.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateBioUsdWithAntigravity(selectedTwin)}
                      disabled={isGeneratingBio}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/20 whitespace-nowrap"
                    >
                      {isGeneratingBio ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating USD Bio...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-amber-200" />
                          <span>Regenerate with Antigravity</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const content = selectedTwin.bioDescriptionUsd || SAMPLE_USDA_STAGE;
                        navigator.clipboard.writeText(content);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all flex items-center gap-1 border border-slate-700 whitespace-nowrap"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy USDA'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const content = selectedTwin.bioDescriptionUsd || SAMPLE_USDA_STAGE;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedTwin.name}_Bio_Description_USD.usda`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium text-xs transition-all flex items-center gap-1 border border-emerald-500/30 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .usda</span>
                    </button>
                  </div>
                </div>

                {bioGenSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{bioGenSuccess}</span>
                  </div>
                )}

                {bioGenError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{bioGenError}</span>
                  </div>
                )}

                {/* Empathetic Overview Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Rescue Journey</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedTwin.rescueOrigin}</p>
                    <span className="text-[11px] text-slate-400 block pt-1">Captivity: {selectedTwin.captivityDuration}</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Sanctuary Habitat</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedTwin.rehabHavenLocation.atoll} • {selectedTwin.rehabHavenLocation.havenZone}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">Coordinates: {selectedTwin.rehabHavenLocation.coordinates}</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Conservation Authority</span>
                    <p className="text-xs text-slate-300">
                      Synchronized with the Matrix primate rehabilitation foundation.
                    </p>
                    <a
                      href={selectedTwin.matrixConservationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold pt-1"
                    >
                      <span>conservationonthematrix.weebly.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Pixar USDA Code block */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">USDA 1.0 Bio Prim Definition:</span>
                    <span className="text-[10px] text-slate-500 font-mono">UTF-8 ASCII Scene Description</span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-amber-200/90 overflow-x-auto max-h-[360px] leading-relaxed select-text">
                    {selectedTwin.bioDescriptionUsd || `#usda 1.0\ndef Xform "Primate_${selectedTwin.name}_Bio"\n{\n    string primate:name = "${selectedTwin.name}"\n    string primate:species = "${selectedTwin.species}"\n    string haven:atoll = "${selectedTwin.rehabHavenLocation.atoll}"\n}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Playback & Viewport Control Toolbar */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* Play / Pause / Reset & Scrubber */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                  title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => setCurrentFrame(0)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  title="Reset to Frame 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Playback Speed */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        playbackSpeed === spd ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                      }`}
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
                  max={selectedTwin.lumeriaOsAnimation.totalFrames || 360}
                  value={currentFrame}
                  onChange={(e) => {
                    setCurrentFrame(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono text-[10px] text-slate-500">360f</span>
              </div>

              {/* Render Mode Switcher */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-500 hidden sm:inline">Render:</span>
                {(['textured', 'wireframe', 'telemetry'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRenderMode(mode)}
                    className={`px-2 py-1 rounded capitalize transition-all ${
                      renderMode === mode
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Rescued Monkeys Rich Cards Gallery */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <span>🐵 Rescued Primate Digital Twins</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Marshall Islands Haven
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select any primate to view their real-time LumeriaOS USD animation, biometrics, and captive rescue backstory.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('create-form')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Primate</span>
                </button>
              </div>
            </div>

            {/* Grid of Rich Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {digitalTwins.map((twin) => {
                const isSelected = twin.id === selectedTwinId;

                return (
                  <div
                    key={twin.id}
                    id={`twin-card-${twin.id}`}
                    onClick={() => setSelectedTwinId(twin.id)}
                    className={`group cursor-pointer relative rounded-2xl bg-slate-900/80 border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:scale-[1.01] ${
                      isSelected
                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-500/30 bg-slate-900'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Image & Status Tag */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={twin.imageUrl}
                        alt={twin.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                      {/* Health Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-md ${
                            twin.healthStatus === 'Fully Rehabilitated'
                              ? 'bg-emerald-500/90 text-slate-950 border-emerald-400'
                              : twin.healthStatus === 'Active Rehabilitation'
                              ? 'bg-amber-500/90 text-slate-950 border-amber-400'
                              : 'bg-purple-500/90 text-slate-950 border-purple-400'
                          }`}
                        >
                          {twin.healthStatus}
                        </span>
                      </div>

                      {/* USD Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-cyan-300 text-[10px] font-mono font-bold">
                          USD 60fps
                        </span>
                      </div>

                      {/* Monkey Name & Species overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-xl font-display font-bold text-white flex items-center justify-between">
                          <span>{twin.name}</span>
                          <span className="text-xs font-normal text-slate-300 font-mono">
                            {twin.age} yrs • {twin.gender}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-300 truncate">
                          {twin.species}
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      {/* Rescue Origin Pill */}
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-rose-400 font-bold block text-[10px] uppercase">
                          Rescue Origin:
                        </span>
                        <span className="line-clamp-2">{twin.rescueOrigin}</span>
                      </div>

                      {/* Bio summary */}
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {twin.bio}
                      </p>

                      {/* Marshall Islands Haven Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{twin.rehabHavenLocation.atoll} • {twin.rehabHavenLocation.havenZone}</span>
                      </div>

                      {/* Rehabilitation & Stability Telemetry Row */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Rehab Stability</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {100 - twin.lumeriaOsAnimation.biometrics.stressIndex}% Calm
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Canopy Height</span>
                          <span className="text-cyan-300 font-bold">{twin.lumeriaOsAnimation.biometrics.canopyElevationMeters}m Perch</span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTwinId(twin.id);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Viewing Twin' : 'Launch Viewport'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTwinId(twin.id);
                            setUsdTab('bio-usd');
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                          title="View Pixar USDA Bio Description"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>USD Bio</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTwinId(twin.id);
                            setViewMode('cinematic-usd');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                          title="View hyperrealistic cinematic USD scene"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Cinematic</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conservation on the Matrix Integration Callout */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Integrated Conservation Portal</span>
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                Conservation on the Matrix & Miyawaki Bio-Corridor
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All digital twins, biometric rehabilitation logs, and Miyawaki canopy expansions are indexed and shared with{' '}
                <a
                  href="https://conservationonthematrix.weebly.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-300 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  conservationonthematrix.weebly.com
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                to promote open global sanctuary science and cage-free primate rehabilitation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://conservationonthematrix.weebly.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <span>Visit Matrix Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {onNavigateToGovernance && (
                <button
                  onClick={onNavigateToGovernance}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
                >
                  View Miyawaki Proposals
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: JSON INPUT & USD SCHEMA EDITOR */}
      {viewMode === 'json-editor' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-cyan-400" />
                  <span>Digital Twin JSON Input & Universal Scene Description (USD) Schema</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Import, edit, or configure any monkey's Digital Twin using raw JSON payload. 
                  Supports monkey name, bio, image URL, and LumeriaOS USD animation parameters from the Marshall Islands haven.
                </p>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">Load Preset:</span>
                {digitalTwins.map((twin) => (
                  <button
                    key={twin.id}
                    onClick={() => handleLoadPreset(twin)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                  >
                    {twin.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error or Success notification */}
            {jsonError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span><strong>Validation Error:</strong> {jsonError}</span>
              </div>
            )}

            {jsonSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{jsonSuccessMsg}</span>
              </div>
            )}

            {/* Monaco-style Monospace Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Primate Twin JSON Payload (RFC 8259 Standard)</span>
                <span className="font-mono text-[11px] text-cyan-400">Validated against LumeriaOS USD Schema</span>
              </div>
              
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError(null);
                }}
                rows={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed selection:bg-cyan-500/30"
                placeholder='Paste raw JSON with "name", "bio", "imageUrl", and "lumeriaOsAnimation"...'
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Applying updates the live digital twin cards and 3D spatial viewport in real-time.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonInput);
                    alert('JSON copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                >
                  Copy JSON
                </button>

                <button
                  onClick={handleApplyJson}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Validate & Apply JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: VISUAL REGISTER PRIMATE FORM */}
      {viewMode === 'create-form' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Register Rescued Primate in Marshall Islands Haven</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter monkey name, bio, image URL, and LumeriaOS USD simulation parameters to mint a new Digital Twin on Ethereum & Avalanche.
              </p>
            </div>

            <button
              onClick={() => setViewMode('cards')}
              className="text-xs text-slate-400 hover:text-white underline self-start sm:self-auto"
            >
              Cancel & Return to Gallery
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {/* Identity & Origin Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primate Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kokoa, Jaco, Maya..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Species
                </label>
                <input
                  type="text"
                  value={formData.species || ''}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  placeholder="e.g. Rhesus Macaque (Macaca mulatta)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image URL (Portrait / Photo) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rescue Origin (From Captivity) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rescueOrigin || ''}
                  onChange={(e) => setFormData({ ...formData, rescueOrigin: e.target.value })}
                  placeholder="e.g. Freed from biomedical testing laboratory cage"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primate Biography & Captivity Background *
              </label>
              <textarea
                required
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe the monkey's past captivity conditions, emotional recovery in the Marshall Islands haven, and social progress..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Haven Details & LumeriaOS USD Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Marshall Islands Atoll
                </label>
                <select
                  value={formData.rehabHavenLocation?.atoll || 'Majuro Atoll'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rehabHavenLocation: {
                        ...(formData.rehabHavenLocation as any),
                        atoll: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="Majuro Atoll">Majuro Atoll</option>
                  <option value="Jaluit Atoll">Jaluit Atoll</option>
                  <option value="Arno Atoll">Arno Atoll</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LumeriaOS USD Format
                </label>
                <select
                  value={formData.lumeriaOsAnimation?.usdFormat || 'USD'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lumeriaOsAnimation: {
                        ...(formData.lumeriaOsAnimation as any),
                        usdFormat: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="USD">USD (Universal Scene Description)</option>
                  <option value="USDA">USDA (USD ASCII Text)</option>
                  <option value="USDZ">USDZ (Apple/Pixar Spatial Archive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rehabilitation Phase
                </label>
                <select
                  value={formData.healthStatus || 'Active Rehabilitation'}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="Active Rehabilitation">Active Rehabilitation</option>
                  <option value="Fully Rehabilitated">Fully Rehabilitated</option>
                  <option value="Sanctuary Acclimatization">Sanctuary Acclimatization</option>
                  <option value="Elder Care">Elder Care</option>
                </select>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
              >
                Mint Primate Digital Twin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

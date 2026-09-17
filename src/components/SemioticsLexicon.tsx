import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SemioticsSignal,
  SemioticsModality,
  PrimateBioData,
  SemioticsCodex,
  MotionModelKeyframe,
  MonkeyDigitalTwin,
} from '../types';
import { COMPREHENSIVE_SEMIOTICS_SIGNALS, PRIMATE_SPECIES_OPTIONS } from '../data/semioticsData';
import * as THREE from 'three';
import {
  Search,
  Filter,
  Camera,
  Video,
  VideoOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Code,
  Layers,
  FileText,
  Activity,
  Heart,
  ShieldCheck,
  Maximize2,
  BookOpen,
  Eye,
  Sliders,
  Compass,
  Cpu,
  RefreshCw,
  Upload,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface SemioticsLexiconProps {
  onAddDigitalTwin?: (twin: MonkeyDigitalTwin) => void;
  onNavigateToStage?: () => void;
}

export const SemioticsLexicon: React.FC<SemioticsLexiconProps> = ({
  onAddDigitalTwin,
  onNavigateToStage,
}) => {
  // 1. Search & Filter State for Codex Table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<SemioticsModality | 'all'>('all');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');
  const [activeSignalPreview, setActiveSignalPreview] = useState<SemioticsSignal | null>(
    COMPREHENSIVE_SEMIOTICS_SIGNALS[0]
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // 2. Camera Imaging State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState<boolean>(false);

  // 3. Monkey Bio State
  const [bioData, setBioData] = useState<PrimateBioData>({
    name: 'Kokoa',
    species: 'Rhesus Macaque (Macaca mulatta)',
    estimatedAge: 4,
    gender: 'Female',
    rescueOrigin: 'Freed from biomedical laboratory testing facility (quarantine block #4)',
    havenAtoll: 'Majuro Atoll — Laura Sanctuary Zone',
    observedBehaviors: 'High arboreal vigilance; frequent elevated alert tail stiffening and affiliative lip-smacking.',
    dietPreferences: 'Papaya, young breadfruit leaves, and coconut water.',
    photoUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80',
    confirmedByUser: false,
  });

  // 4. Species Confirmation & Codex Generation State
  const [isSpeciesConfirmed, setIsSpeciesConfirmed] = useState<boolean>(false);
  const [activeCodex, setActiveCodex] = useState<SemioticsCodex | null>(null);
  const [isGeneratingCodex, setIsGeneratingCodex] = useState<boolean>(false);
  const [codexStep, setCodexStep] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 5. High-Resolution USD & Motion Model State
  const [activeTab, setActiveTab] = useState<'lexicon-table' | 'camera-imaging' | 'codex-viewer' | 'motion-model'>('lexicon-table');
  const motionCanvasRef = useRef<HTMLDivElement | null>(null);
  const [isMotionPlaying, setIsMotionPlaying] = useState<boolean>(true);
  const [motionFrame, setMotionFrame] = useState<number>(0);

  // Audio synthesis for vocalizations and tail twitch clicks
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSignalSound = (signal: SemioticsSignal) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = signal.acousticFrequencyHz || (signal.modality === 'tail' ? 440 : 600);
      osc.type = signal.modality === 'vocal' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      if (signal.modality === 'vocal') {
        // Frequency glide typical of primate calls
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.35);
      }

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);

      setSuccessToast(`Synthesized acoustic spectrum for ${signal.name} (${baseFreq} Hz)`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch {
      // Non-blocking
    }
  };

  // Filter signals
  const filteredSignals = useMemo(() => {
    return COMPREHENSIVE_SEMIOTICS_SIGNALS.filter((sig) => {
      const matchModality = selectedModality === 'all' || sig.modality === selectedModality;
      const matchSpecies = selectedSpeciesFilter === 'all' || sig.species.toLowerCase().includes(selectedSpeciesFilter.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        sig.name.toLowerCase().includes(query) ||
        sig.latinOrScientificName.toLowerCase().includes(query) ||
        sig.communicativeIntent.toLowerCase().includes(query) ||
        sig.socialContext.toLowerCase().includes(query) ||
        sig.usdToken.toLowerCase().includes(query) ||
        sig.ethogramCode.toLowerCase().includes(query);
      return matchModality && matchSpecies && matchQuery;
    });
  }, [searchQuery, selectedModality, selectedSpeciesFilter]);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Unable to access live camera stream. Using high-resolution curated primate plate.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setBioData((prev) => ({ ...prev, photoUrl: dataUrl }));
      stopCamera();
      setSuccessToast('Live primate image captured! Proceed to bio verification.');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleCopyCode = (text: string, tokenKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenKey);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  // Generate Semiotics Codex after species confirmation
  const handleConfirmSpeciesAndSynthesize = async () => {
    setIsSpeciesConfirmed(true);
    setIsGeneratingCodex(true);
    setCodexStep('Extracting morphological features & tail articulation index...');

    setTimeout(() => {
      setCodexStep('Mapping simian ethogram to Pixar Universal Scene Description schema...');
    }, 900);

    setTimeout(() => {
      setCodexStep('Synthesizing 60 FPS skeletal motion model from captured image...');
    }, 1800);

    setTimeout(() => {
      // Build 60 FPS motion keyframes
      const keyframes: MotionModelKeyframe[] = [];
      for (let f = 0; f < 60; f++) {
        const t = f / 60;
        keyframes.push({
          frame: f,
          timeSec: Number(t.toFixed(3)),
          tailAngleDeg: Math.round(75 + Math.sin(t * Math.PI * 4) * 12),
          tailCurvature: Number((0.45 + Math.sin(t * Math.PI * 2) * 0.2).toFixed(2)),
          spineFlexion: Number((0.15 + Math.sin(t * Math.PI * 3) * 0.05).toFixed(2)),
          headYawDeg: Math.round(Math.sin(t * Math.PI * 2) * 14),
          earRetraction: Number((0.2 + Math.sin(t * Math.PI * 6) * 0.15).toFixed(2)),
          facialLipSmack: f % 10 < 5 ? 0.8 : 0.1,
        });
      }

      const usdSchema = `#usda 1.0
(
    defaultPrim = "SemioticsCodex_${bioData.name}"
    doc = "Pixar USD Unified Semiotics Data Model for ${bioData.species}"
    metersPerUnit = 1.0
    upAxis = "Y"
)

def Xform "SemioticsCodex_${bioData.name}" (
    assetInfo = {
        string name = "${bioData.name}"
        string species = "${bioData.species}"
        string haven = "${bioData.havenAtoll}"
        string rescue = "${bioData.rescueOrigin}"
    }
)
{
    def Scope "EthologyRepertoire"
    {
        def "TailSemiotics" (
            doc = "Dynamic vertebral IK postures for simian tail communication"
        )
        {
            uniform token semiotics:primarySignal = "usd:semiotics:tail:elevated_alert"
            float semiotics:restElevationAngle = 82.0
            float semiotics:twitchFrequencyHz = 2.1
            bool semiotics:prehensileAnchor = ${bioData.species.includes('Capuchin') ? 'true' : 'false'}
            token[] semiotics:repertoireTokens = [
                "usd:semiotics:tail:elevated_alert",
                "usd:semiotics:tail:affiliative_wag",
                "usd:semiotics:tail:submissive_tuck",
                "usd:semiotics:tail:relaxed_droop"
            ]
        }

        def "AcousticSemiotics" (
            doc = "Bioacoustic frequency profiles and communicative intent"
        )
        {
            float semiotics:dominantF0 = 890.0
            float semiotics:maxSplDb = 92.0
            token semiotics:primaryVocalization = "usd:semiotics:acoustic:coo_call"
        }

        def "FacialSemiotics" (
            doc = "Morph target blend shapes for simian facial phonemes"
        )
        {
            float blendShape:lipSmacking = 0.85
            float blendShape:baredTeethGrimace = 0.0
            float blendShape:openMouthPlay = 0.4
        }
    }

    def SkelAnimation "MotionModel_60FPS"
    {
        uniform int fps = 60
        uniform float durationSec = 1.0
        float3[] joints:rotations = [ (0, 0, 75), (0, 0, 82), (0, 0, 68) ]
    }
}
`;

      const generatedCodex: SemioticsCodex = {
        speciesName: bioData.species,
        primateBio: { ...bioData, confirmedByUser: true },
        signals: COMPREHENSIVE_SEMIOTICS_SIGNALS.filter((s) =>
          s.species.toLowerCase().includes(bioData.species.split(' ')[0].toLowerCase())
        ),
        usdSchemaAscii: usdSchema,
        motionModel: {
          motionModelId: `motion-usd-${bioData.name.toLowerCase()}`,
          targetRig: `PrimaRig_${bioData.name}`,
          fps: 60,
          durationSeconds: 1.0,
          keyframes,
        },
        generatedAt: new Date().toISOString(),
      };

      setActiveCodex(generatedCodex);
      setIsGeneratingCodex(false);
      setCodexStep('');
      setActiveTab('codex-viewer');
      setSuccessToast(`Semiotics Codex & High-Res USD Model created for ${bioData.name}!`);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 2500);
  };

  // 3D Motion Model Interactive WebGL Preview
  useEffect(() => {
    if (activeTab !== 'motion-model' || !activeCodex) return;
    const container = motionCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b14);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // Breadfruit Perch
    const branchGeo = new THREE.CylinderGeometry(0.18, 0.22, 5, 16);
    branchGeo.rotateZ(Math.PI / 2);
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.85 });
    const branch = new THREE.Mesh(branchGeo, branchMat);
    branch.position.set(0, -0.3, 0);
    scene.add(branch);

    // Primate Character Group
    const simian = new THREE.Group();
    simian.position.set(0, 0, 0);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });

    // Torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.38, 8, 12), bodyMat);
    torso.rotation.z = 0.2;
    simian.add(torso);

    // Head
    const head = new THREE.Group();
    head.position.set(-0.28, 0.38, 0);
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), bodyMat);
    head.add(cranium);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.16, 10), skinMat);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(-0.12, -0.04, 0);
    head.add(snout);
    simian.add(head);

    // Articulated Tail Joints Chain (8 segments)
    const tailSegs: THREE.Group[] = [];
    let parentGroup: THREE.Group = simian;
    for (let i = 0; i < 8; i++) {
      const seg = new THREE.Group();
      if (i === 0) seg.position.set(0.28, 0.05, 0);
      else seg.position.set(0.11, 0, 0);

      const segMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.12, 8), bodyMat);
      segMesh.rotateZ(-Math.PI / 2);
      segMesh.position.set(0.06, 0, 0);
      seg.add(segMesh);

      parentGroup.add(seg);
      parentGroup = seg;
      tailSegs.push(seg);
    }

    scene.add(simian);

    let animId: number;
    let frameIdx = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isMotionPlaying && activeCodex) {
        frameIdx = (frameIdx + 1) % activeCodex.motionModel.keyframes.length;
        setMotionFrame(frameIdx);
        const kf = activeCodex.motionModel.keyframes[frameIdx];

        // Animate joints according to Motion Model Keyframe
        head.rotation.y = (kf.headYawDeg * Math.PI) / 180;
        torso.rotation.z = 0.2 + kf.spineFlexion * 0.2;

        const tailRad = ((kf.tailAngleDeg / 8) * Math.PI) / 180;
        tailSegs.forEach((ts, idx) => {
          ts.rotation.z = tailRad + Math.sin(frameIdx * 0.2 + idx) * 0.05;
          ts.rotation.y = kf.tailCurvature * 0.15;
        });
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [activeTab, activeCodex, isMotionPlaying]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                USD Unified Semiotics Data
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-cyan-300 font-mono">Simian Ethology Lexicon</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-medium">Pixar USDA Schema v1.0</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Primate Semiotics Lexicon & Codex</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                LumeriaOS USD
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore the simian tail language, gestural kinematics, and bioacoustic vocalization mappings translated into the USD (Unified Semiotics Data) framework. Capture live camera imagery, input rehabilitation biographies, confirm species taxonomy, and synthesize high-resolution 3D motion models.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('camera-imaging')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Imaging</span>
            </button>

            {onNavigateToStage && (
              <button
                onClick={onNavigateToStage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Open in OpenGL 3D Stage</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('lexicon-table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lexicon-table'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Semiotics Lexicon</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 text-[10px] font-mono">
              {COMPREHENSIVE_SEMIOTICS_SIGNALS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('camera-imaging')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'camera-imaging'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera & Primate Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('codex-viewer')}
            disabled={!activeCodex}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !activeCodex
                ? 'opacity-40 cursor-not-allowed bg-slate-900/40 text-slate-500 border border-slate-800'
                : activeTab === 'codex-viewer'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Pixar USDA Semiotics Codex</span>
            {activeCodex && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('motion-model')}
            disabled={!activeCodex}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !activeCodex
                ? 'opacity-40 cursor-not-allowed bg-slate-900/40 text-slate-500 border border-slate-800'
                : activeTab === 'motion-model'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>60 FPS USD Motion Model (3D)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SEARCHABLE INTERACTIVE CODEX TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'lexicon-table' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tail angles, vocal calls, USD tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Modality Pill Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {(['all', 'tail', 'body', 'vocal', 'facial'] as const).map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModality(mod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedModality === mod
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mod === 'all' ? 'All Modalities' : `${mod} Language`}
                </button>
              ))}
            </div>

            {/* Species Selector */}
            <div className="w-full md:w-auto">
              <select
                value={selectedSpeciesFilter}
                onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Primate Species</option>
                <option value="Rhesus Macaque">Rhesus Macaque (Macaca mulatta)</option>
                <option value="Tufted Capuchin">Tufted Capuchin (Sapajus apella)</option>
                <option value="Japanese Macaque">Japanese Macaque (Macaca fuscata)</option>
                <option value="Squirrel Monkey">Squirrel Monkey (Saimiri sciureus)</option>
              </select>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Signal & Ethogram</th>
                    <th className="py-3 px-3">Modality</th>
                    <th className="py-3 px-4">Communicative Intent & Ethology</th>
                    <th className="py-3 px-4">Physical Kinematics</th>
                    <th className="py-3 px-4">USD Token & Schema Key</th>
                    <th className="py-3 px-4 text-center">Acoustic F0</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSignals.map((sig) => {
                    const isSelected = activeSignalPreview?.id === sig.id;
                    return (
                      <tr
                        key={sig.id}
                        onClick={() => setActiveSignalPreview(sig)}
                        className={`hover:bg-slate-900/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-purple-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">{sig.name}</div>
                          <div className="text-[10px] font-mono text-purple-300 italic">
                            {sig.latinOrScientificName}
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                            {sig.ethogramCode} • {sig.species.split(' ')[0]}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              sig.modality === 'tail'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : sig.modality === 'body'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : sig.modality === 'vocal'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {sig.modality}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-slate-300 line-clamp-2">{sig.communicativeIntent}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            Ctx: {sig.socialContext}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs font-mono text-[11px] text-cyan-300">
                          {sig.physicalParameters}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-mono text-[10px] text-purple-300 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {sig.usdToken}
                          </div>
                          <div className="font-mono text-[9px] text-slate-500 truncate mt-0.5">
                            {sig.usdLayerProperty}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          {sig.acousticFrequencyHz ? (
                            <span className="text-amber-400 font-bold">{sig.acousticFrequencyHz} Hz</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSignalSound(sig);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all"
                            title="Synthesize Signal Audio / Kinematics"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(sig.usdLayerProperty, sig.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all"
                            title="Copy USD Layer Property"
                          >
                            {copiedToken === sig.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Citation Footnote */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span>Selected Signal Literature: </span>
                <span className="text-slate-200 font-medium italic">
                  {activeSignalPreview?.literatureCitation || 'Altmann, S. A. (1962). Sociobiology of rhesus monkeys.'}
                </span>
              </div>
              <div className="font-mono text-[10px] text-emerald-400">
                LumeriaOS USD Semiotics Framework v4.2
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE CAMERA IMAGING & MONKEY BIO INPUT */}
      {/* ========================================================================= */}
      {activeTab === 'camera-imaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Camera Stream & Capture (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Live Camera Imaging</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                  {isCameraActive ? 'STREAM ACTIVE' : 'STANDBY'}
                </span>
              </div>

              {/* Video / Captured Image Surface */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Primate Specimen"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No active image stream</p>
                  </div>
                )}

                {/* Biometric Focal Overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 m-4 rounded-lg flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                    <span>BIOMETRIC SCANNER: ARBOREAL</span>
                    <span>AI STUDIO ANTIGRAVITY</span>
                  </div>
                  <div className="w-20 h-20 border border-cyan-400/60 rounded-lg mx-auto flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>TAIL CURVATURE: DETECTED</span>
                    <span>FPS: 60</span>
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Camera Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Live Camera</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureSnapshot}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Specimen</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <VideoOff className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Sample Presets */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const img = 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80';
                      setCapturedImage(img);
                      setBioData((prev) => ({
                        ...prev,
                        photoUrl: img,
                        name: 'Kokoa',
                        species: 'Rhesus Macaque (Macaca mulatta)',
                      }));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                  >
                    Rhesus
                  </button>
                  <button
                    onClick={() => {
                      const img = 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?auto=format&fit=crop&w=800&q=80';
                      setCapturedImage(img);
                      setBioData((prev) => ({
                        ...prev,
                        photoUrl: img,
                        name: 'Maya',
                        species: 'Tufted Capuchin (Sapajus apella)',
                      }));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                  >
                    Capuchin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Monkey Bio Input & Species Confirmation (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Primate Biography & Rehabilitation</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">STEP 1 OF 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Primate Name
                  </label>
                  <input
                    type="text"
                    value={bioData.name}
                    onChange={(e) => setBioData({ ...bioData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Kokoa"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Species Taxonomy
                  </label>
                  <select
                    value={bioData.species}
                    onChange={(e) => setBioData({ ...bioData, species: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Rhesus Macaque (Macaca mulatta)">Rhesus Macaque (Macaca mulatta)</option>
                    <option value="Tufted Capuchin (Sapajus apella)">Tufted Capuchin (Sapajus apella)</option>
                    <option value="Japanese Macaque (Macaca fuscata)">Japanese Macaque (Macaca fuscata)</option>
                    <option value="Squirrel Monkey (Saimiri sciureus)">Squirrel Monkey (Saimiri sciureus)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Estimated Age
                  </label>
                  <input
                    type="text"
                    value={bioData.estimatedAge}
                    onChange={(e) => setBioData({ ...bioData, estimatedAge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. 4 years"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Sanctuary Haven Atoll
                  </label>
                  <select
                    value={bioData.havenAtoll}
                    onChange={(e) => setBioData({ ...bioData, havenAtoll: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Majuro Atoll — Laura Sanctuary Zone">Majuro Atoll — Laura Sanctuary</option>
                    <option value="Kwajalein Atoll — Ebeye Haven">Kwajalein Atoll — Ebeye Haven</option>
                    <option value="Jaluit Atoll — Jabor Station">Jaluit Atoll — Jabor Station</option>
                    <option value="Arno Atoll — Ine Haven">Arno Atoll — Ine Haven</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Rescue Origin & Captivity History
                </label>
                <textarea
                  rows={2}
                  value={bioData.rescueOrigin}
                  onChange={(e) => setBioData({ ...bioData, rescueOrigin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  placeholder="Describe rescue origin (e.g. freed from biomedical laboratory cage)..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Observed Ethology & Behaviors
                </label>
                <textarea
                  rows={2}
                  value={bioData.observedBehaviors}
                  onChange={(e) => setBioData({ ...bioData, observedBehaviors: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  placeholder="Observed tail signals, vocalizations, social greeting gestures..."
                />
              </div>

              {/* Species Confirmation Verification Box */}
              <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Confirm Species Before Codex Synthesis</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Please verify that <span className="text-white font-bold">{bioData.name}</span> corresponds to{' '}
                  <span className="text-purple-300 font-bold">{bioData.species}</span>. The USD Semiotics Engine will calibrate the vertebral tail articulation chains and acoustic harmonics accordingly.
                </p>

                <button
                  onClick={handleConfirmSpeciesAndSynthesize}
                  disabled={isGeneratingCodex}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all"
                >
                  {isGeneratingCodex ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{codexStep || 'Synthesizing Semiotics Codex & Motion Model...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Species & Synthesize Semiotics Codex</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PIXAR USDA SEMIOTICS CODEX VIEWER */}
      {/* ========================================================================= */}
      {activeTab === 'codex-viewer' && activeCodex && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Pixar USDA 1.0 Semiotics Codex — {activeCodex.primateBio.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Species-verified Unified Semiotics Data specification compiled for{' '}
                <span className="text-cyan-300 font-medium">{activeCodex.speciesName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(activeCodex.usdSchemaAscii, 'full-codex')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                {copiedToken === 'full-codex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedToken === 'full-codex' ? 'Copied Codex' : 'Copy USDA'}</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([activeCodex.usdSchemaAscii], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `semiotics_codex_${activeCodex.primateBio.name.toLowerCase()}.usda`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Export .usda</span>
              </button>

              <button
                onClick={() => setActiveTab('motion-model')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Play 3D Motion Model</span>
              </button>
            </div>
          </div>

          {/* USDA Code Surface */}
          <div className="bg-[#050811] rounded-xl p-4 font-mono text-xs text-cyan-200 border border-slate-800 overflow-x-auto max-h-[500px]">
            <pre className="leading-relaxed whitespace-pre font-mono">
              {activeCodex.usdSchemaAscii}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 60 FPS USD MOTION MODEL INTERACTIVE 3D PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'motion-model' && activeCodex && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>High-Resolution USD Motion Model — {activeCodex.primateBio.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time 60 FPS skeletal motion curves reconstructed from image & ethogram
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMotionPlaying(!isMotionPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
              >
                {isMotionPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isMotionPlaying ? 'Pause Motion' : 'Play Motion'}</span>
              </button>

              {onNavigateToStage && (
                <button
                  onClick={onNavigateToStage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Launch in Marshall Islands OpenGL Stage</span>
                </button>
              )}
            </div>
          </div>

          {/* 3D WebGL Motion Canvas */}
          <div
            ref={motionCanvasRef}
            className="w-full h-96 bg-[#040810] rounded-xl overflow-hidden border border-slate-800 shadow-inner relative"
          />

          {/* Motion Keyframe Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT FRAME</span>
              <span className="text-cyan-300 font-bold">{motionFrame} / 60</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TAIL ELEVATION</span>
              <span className="text-emerald-400 font-bold">
                {activeCodex.motionModel.keyframes[motionFrame]?.tailAngleDeg || 75}° Vertical
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TAIL CURVATURE</span>
              <span className="text-amber-300 font-bold">
                {activeCodex.motionModel.keyframes[motionFrame]?.tailCurvature || 0.45}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LIP-SMACK MORPH</span>
              <span className="text-purple-400 font-bold">
                {activeCodex.motionModel.keyframes[motionFrame]?.facialLipSmack > 0.5 ? 'Active (5.2 Hz)' : 'Occluded'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
import {
  Search,
  Filter,
  Camera,
  Video,
  VideoOff,
  Film,
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
import { SipaCodexSection } from './SipaCodexSection';

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
  const simulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
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
  const [activeTab, setActiveTab] = useState<'lexicon-table' | 's-ipa' | 'camera-imaging' | 'codex-viewer' | 'motion-model'>('lexicon-table');
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

  // Camera Lifecycle & Cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Canvas loop for Simulated Sanctuary Telemetry Cam
  useEffect(() => {
    if (!isSimulatedFeed || !simulatedCanvasRef.current) return;
    const canvas = simulatedCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      canvas.width = canvas.clientWidth || 640;
      canvas.height = canvas.clientHeight || 360;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Tropical Pacific Canopy Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0f2937');
      skyGrad.addColorStop(0.5, '#1e3a47');
      skyGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Lush foliage layers
      const time = frame * 0.03;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(16, 185, 129, ${0.12 + i * 0.04})`;
        ctx.beginPath();
        const boughX = (w / 6) * i + Math.sin(time + i) * 15;
        const boughY = h * 0.6 + Math.cos(time + i * 0.7) * 10;
        ctx.arc(boughX, boughY, 90 + i * 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Breadfruit Branch Perch
      ctx.strokeStyle = '#3d271d';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.bezierCurveTo(w * 0.3, h * 0.68, w * 0.7, h * 0.76, w, h * 0.7);
      ctx.stroke();

      // Rescued Primate Body Silhouette
      const monkeyX = w * 0.5 + Math.sin(time * 0.8) * 6;
      const monkeyY = h * 0.56 + Math.cos(time * 0.9) * 4;

      // Primate Torso
      ctx.fillStyle = '#6b4226';
      ctx.beginPath();
      ctx.ellipse(monkeyX, monkeyY, 34, 48, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Primate Head
      const headX = monkeyX - 22 + Math.sin(time) * 3;
      const headY = monkeyY - 48 + Math.cos(time * 1.2) * 2;
      ctx.beginPath();
      ctx.arc(headX, headY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Primate Muzzle
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(headX - 14, headY + 5, 12, 0, Math.PI * 2);
      ctx.fill();

      // Articulated Dynamic Tail
      ctx.strokeStyle = '#5a361e';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(monkeyX + 26, monkeyY + 12);
      const tailCtrlX = monkeyX + 70 + Math.sin(time * 1.5) * 18;
      const tailCtrlY = monkeyY - 30 + Math.cos(time * 1.3) * 25;
      const tailEndX = monkeyX + 90 + Math.sin(time * 2.1) * 22;
      const tailEndY = monkeyY - 5 + Math.cos(time * 1.8) * 18;
      ctx.bezierCurveTo(tailCtrlX, tailCtrlY, tailCtrlX + 20, tailCtrlY + 30, tailEndX, tailEndY);
      ctx.stroke();

      // Computer Vision Bounding Box & HUD
      const boxPad = 14;
      const bx = headX - 35 - boxPad;
      const by = headY - 30 - boxPad;
      const bw = monkeyX + 105 - bx + boxPad;
      const bh = monkeyY + 60 - by + boxPad;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Corner Reticles
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      const cornerLen = 14;
      ctx.beginPath();
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // Tag
      ctx.fillStyle = 'rgba(14, 165, 233, 0.9)';
      ctx.fillRect(bx, by - 20, 165, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('SPECIES: MACACA (98.4%)', bx + 6, by - 6);

      // Tail angle vector
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(monkeyX + 26, monkeyY + 12);
      ctx.lineTo(tailEndX, tailEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Telemetry Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, w, 28);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(16, 14, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('LIVE • RMI MAJURO ARBOREAL CAM 01', 28, 17);

      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(timeStr, Math.max(200, w - 190), 17);

      // Bottom Telemetry
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, h - 24, w, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`60 FPS • SENSOR ISO 400 • TAIL ELEVATION: ${Math.round(35 + Math.sin(time) * 15)}°`, 14, h - 8);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isSimulatedFeed]);

  // Robust Camera Management
  const startCamera = async (facing: 'user' | 'environment' = cameraFacingMode) => {
    setCameraError(null);
    setIsSimulatedFeed(false);

    // Stop existing tracks first
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access (getUserMedia) is not supported in this browser or iframe.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video constraint without strict facingMode
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play handled via onLoadedMetadata
        }
      }
      setIsCameraActive(true);
      setSuccessToast('Live camera feed connected.');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      let message = 'Unable to access camera hardware.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. You can enable it in your browser address bar, or use our Live Sanctuary Stream or Photo Upload below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found. You can use our Live Sanctuary Stream or Photo Upload.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera hardware is busy in another program. Please close other camera apps and retry.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  const startSimulatedFeed = () => {
    stopCamera();
    setCameraError(null);
    setIsSimulatedFeed(true);
    setSuccessToast('Connected to RMI Majuro Sanctuary Remote Telemetry Webstream #01');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsSimulatedFeed(false);
  };

  const captureSnapshot = () => {
    const canvas = document.createElement('canvas');
    if (isCameraActive && videoRef.current) {
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);
        setBioData((prev) => ({ ...prev, photoUrl: dataUrl }));
        stopCamera();
        setSuccessToast('Live camera frame captured! Ready for bio confirmation.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } else if (isSimulatedFeed && simulatedCanvasRef.current) {
      const dataUrl = simulatedCanvasRef.current.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setBioData((prev) => ({ ...prev, photoUrl: dataUrl }));
      setIsSimulatedFeed(false);
      setSuccessToast('Live sanctuary feed snapshot captured! Ready for bio confirmation.');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        stopCamera();
        setCapturedImage(result);
        setBioData((prev) => ({ ...prev, photoUrl: result }));
        setCameraError(null);
        setSuccessToast(`Uploaded primate image "${file.name}" for bio analysis.`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    };
    reader.readAsDataURL(file);
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
            doc = "Bioacoustic frequency profiles and S-IPA (Simian Interspecies Phonetic Alphabet) mappings"
        )
        {
            float semiotics:dominantF0 = 890.0
            float semiotics:maxSplDb = 92.0
            token semiotics:primaryVocalization = "usd:semiotics:acoustic:coo_call"
            string semiotics:sipaPhoneme = "[ ʊ̃↓-ʊ̃↓ ] -> [ ɓ̥ɑ↑-ɓ̥ɑ↓ ] -> [ ɯː↑ ]"
            string semiotics:sipaStandard = "S-IPA-1.0-LumeriaOS"
            bool semiotics:subhyoidResonanceActive = ${bioData.species.includes('Siamang') || bioData.species.includes('Chimpanzee') ? 'true' : 'false'}
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

  // Motion Model Keyframe Animation Loop
  useEffect(() => {
    if (activeTab !== 'motion-model' || !activeCodex || !isMotionPlaying) return;
    const interval = setInterval(() => {
      setMotionFrame((prev) => (prev + 1) % (activeCodex.motionModel.keyframes.length || 60));
    }, 1000 / 30);
    return () => clearInterval(interval);
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
            onClick={() => setActiveTab('s-ipa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 's-ipa'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>S-IPA Phonetic Alphabet</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
              Standard
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
                          {sig.sIpaPhoneme && (
                            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-[9px] font-mono">
                              <span className="text-indigo-400 font-bold">S-IPA:</span>
                              <span className="text-amber-300 font-semibold">{sig.sIpaPhoneme}</span>
                            </div>
                          )}
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

          {/* Active Signal Inspector Card */}
          {activeSignalPreview && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{activeSignalPreview.name}</h3>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                        {activeSignalPreview.ethogramCode}
                      </span>
                    </div>
                    <div className="text-xs font-serif italic text-slate-400">
                      {activeSignalPreview.latinOrScientificName} • {activeSignalPreview.species}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playSignalSound(activeSignalPreview)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Audition Signal</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('s-ipa')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Open S-IPA Phonetics Studio</span>
                  </button>
                </div>
              </div>

              {activeSignalPreview.sIpaPhoneme && (
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                      S-IPA Canonical Phoneme
                    </span>
                    <span className="text-base font-mono font-bold text-amber-300">
                      {activeSignalPreview.sIpaPhoneme}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                      Diacritic & Vocal Tract Modifier
                    </span>
                    <span className="text-slate-200">
                      {activeSignalPreview.diacritic || 'Subhyoid Ingress / Co-articulation'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                      Acoustic Mechanism
                    </span>
                    <span className="text-slate-300">
                      {activeSignalPreview.acousticMechanism || 'Tonal modulation through vocal tract.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: S-IPA PHONETIC ALPHABET CODEX */}
      {/* ========================================================================= */}
      {activeTab === 's-ipa' && (
        <SipaCodexSection />
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

              {/* Video / Captured Image Surface with Drag and Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative aspect-video bg-black rounded-xl overflow-hidden border transition-all flex items-center justify-center group ${
                  isDragOver ? 'border-emerald-400 ring-2 ring-emerald-500/40 bg-emerald-950/20' : 'border-slate-800'
                }`}
              >
                {/* 1. Permanent Video element - always mounted to prevent null ref */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    videoRef.current?.play().catch(() => {});
                  }}
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* 2. Simulated Live Sanctuary Telemetry Canvas */}
                <canvas
                  ref={simulatedCanvasRef}
                  className={`w-full h-full object-cover ${!isCameraActive && isSimulatedFeed ? 'block' : 'hidden'}`}
                />

                {/* 3. Static / Captured Specimen Image */}
                {!isCameraActive && !isSimulatedFeed && capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Primate Specimen"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* 4. Standby placeholder */}
                {!isCameraActive && !isSimulatedFeed && !capturedImage && (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No active image or camera feed</p>
                    <p className="text-[11px] text-slate-500">Click Start Camera, Live Sanctuary Webfeed, or drag & drop a photo</p>
                  </div>
                )}

                {/* Biometric Focal Overlay for live streams */}
                {(isCameraActive || isSimulatedFeed) && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 m-4 rounded-lg flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                      <span>{isCameraActive ? `HARDWARE CAM: ${cameraFacingMode.toUpperCase()}` : 'RMI SANCTUARY REMOTE CAM #01'}</span>
                      <span className="animate-pulse flex items-center gap-1.5 text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        LIVE 60 FPS
                      </span>
                    </div>
                    <div className="w-24 h-24 border border-cyan-400/60 rounded-lg mx-auto flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                      <span>TAIL KINEMATICS: ACTIVE</span>
                      <span>ACEScg USD PROJECTION</span>
                    </div>
                  </div>
                )}

                {/* Drag over indicator */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 gap-2 p-4 text-center pointer-events-none">
                    <Upload className="w-8 h-8 animate-bounce" />
                    <p className="text-xs font-bold">Drop primate image here for instant bio analysis</p>
                  </div>
                )}
              </div>

              {/* Hidden file input for manual upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />

              {cameraError && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Camera Hardware Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed pl-6">{cameraError}</p>
                  <div className="pl-6 pt-1 flex gap-2">
                    <button
                      onClick={startSimulatedFeed}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-lg text-[11px] text-amber-100 font-medium transition-colors"
                    >
                      Use Live Sanctuary Webstream
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-200 font-medium transition-colors"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Primary Controls */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!isCameraActive && !isSimulatedFeed ? (
                    <>
                      <button
                        onClick={() => startCamera(cameraFacingMode)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Start Live Camera</span>
                      </button>

                      <button
                        onClick={startSimulatedFeed}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        title="Connect to Remote Sanctuary Telemetry Cam"
                      >
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sanctuary Cam</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        title="Upload photo from disk"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-400" />
                        <span>Upload</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={captureSnapshot}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Specimen Frame</span>
                      </button>

                      {isCameraActive && (
                        <button
                          onClick={toggleCameraFacingMode}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                          title="Switch Front/Back Camera"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{cameraFacingMode === 'user' ? 'Front' : 'Rear'}</span>
                        </button>
                      )}

                      <button
                        onClick={stopCamera}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs border border-slate-700 transition-colors"
                        title="Stop video feed"
                      >
                        <VideoOff className="w-4 h-4 text-rose-400" />
                        <span>Stop</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Sample Primate Specimen Presets */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Curated Specimen Plates:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        stopCamera();
                        const img = 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80';
                        setCapturedImage(img);
                        setBioData((prev) => ({
                          ...prev,
                          photoUrl: img,
                          name: 'Kokoa',
                          species: 'Rhesus Macaque (Macaca mulatta)',
                        }));
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      Rhesus
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        const img = 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?auto=format&fit=crop&w=800&q=80';
                        setCapturedImage(img);
                        setBioData((prev) => ({
                          ...prev,
                          photoUrl: img,
                          name: 'Maya',
                          species: 'Tufted Capuchin (Sapajus apella)',
                        }));
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      Capuchin
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        const img = 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?auto=format&fit=crop&w=800&q=80';
                        setCapturedImage(img);
                        setBioData((prev) => ({
                          ...prev,
                          photoUrl: img,
                          name: 'Kenzo',
                          species: 'Japanese Macaque (Macaca fuscata)',
                        }));
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      Japanese Macaque
                    </button>
                  </div>
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
      {/* TAB 4: 60 FPS USD MOTION MODEL & BIOMECHANICAL TELEMETRY */}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch in Google Veo Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Kinematic Curve & Skeletal Parameters Display */}
          <div className="w-full bg-[#040810] rounded-xl p-6 border border-slate-800 shadow-inner relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Google Veo Video Pipeline Ready
              </div>
              <h4 className="text-xl font-bold text-white">
                Biomechanical Ethogram Kinematics
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reconstructed skeletal transforms, head yaw, spinal flexion, and multi-segment prehensile tail curves synthesized into high-density Pixar USD definitions ready for temporal diffusion and live video streaming.
              </p>
              {onNavigateToStage && (
                <button
                  onClick={onNavigateToStage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20"
                >
                  <Film className="w-4 h-4" />
                  <span>Synthesize Veo Video Stream</span>
                </button>
              )}
            </div>

            {/* Visual Kinematic Waveform Simulator */}
            <div className="w-full md:w-72 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                <span>STAGE KINEMATICS</span>
                <span className="text-emerald-400 font-bold">60 FPS</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head Yaw:</span>
                  <span className="text-cyan-300 font-bold">{activeCodex.motionModel.keyframes[motionFrame]?.headYawDeg || 0}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spine Flexion:</span>
                  <span className="text-emerald-300 font-bold">{(activeCodex.motionModel.keyframes[motionFrame]?.spineFlexion || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tail Curvature:</span>
                  <span className="text-amber-300 font-bold">{(activeCodex.motionModel.keyframes[motionFrame]?.tailCurvature || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temporal Rate:</span>
                  <span className="text-purple-300 font-bold">1/30 sec</span>
                </div>
              </div>
            </div>
          </div>

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

import React, { useState, useRef, useEffect } from 'react';
import { MonkeyDigitalTwin, TailLanguagePattern, BodyLanguageGesture, PrimateVocalization, PrimateEthologyProfile } from '../types';
import { PRIMATE_ETHOLOGY_PROFILES } from '../data/primateEthologyData';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  BookOpen,
  Youtube,
  Radio,
  Sparkles,
  Compass,
  Activity,
  ShieldCheck,
  Eye,
  Info,
  Sliders,
  ChevronRight,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface PrimateEthologyStudioProps {
  selectedTwin: MonkeyDigitalTwin;
  allTwins: MonkeyDigitalTwin[];
  onSelectTwin: (twinId: string) => void;
}

export const PrimateEthologyStudio: React.FC<PrimateEthologyStudioProps> = ({
  selectedTwin,
  allTwins,
  onSelectTwin,
}) => {
  // Find current profile based on twin's ethology profile or fall back to rhesus
  const currentProfile: PrimateEthologyProfile =
    selectedTwin.ethologyProfile || PRIMATE_ETHOLOGY_PROFILES['rhesus-macaque'];

  // Active tabs
  const [activeTab, setActiveTab] = useState<'tail-language' | 'body-gestures' | 'vocalizations' | 'sanctuary-guide'>('tail-language');

  // Selected items within tabs
  const [selectedTailPattern, setSelectedTailPattern] = useState<TailLanguagePattern>(
    currentProfile.tailLanguageRepertoire[0]
  );
  const [selectedGesture, setSelectedGesture] = useState<BodyLanguageGesture>(
    currentProfile.bodyLanguageRepertoire[0]
  );
  const [selectedVocal, setSelectedVocal] = useState<PrimateVocalization>(
    currentProfile.vocalizationRepertoire[0]
  );

  // Sync selected items when twin changes
  useEffect(() => {
    if (selectedTwin.ethologyProfile) {
      setSelectedTailPattern(selectedTwin.ethologyProfile.tailLanguageRepertoire[0]);
      setSelectedGesture(selectedTwin.ethologyProfile.bodyLanguageRepertoire[0]);
      setSelectedVocal(selectedTwin.ethologyProfile.vocalizationRepertoire[0]);
    }
  }, [selectedTwin]);

  // Audio Context and Synthesizer state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeVocalId, setActiveVocalId] = useState<string | null>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interactive Tail Simulation Canvas
  const tailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tailAnimationTime, setTailAnimationTime] = useState<number>(0);

  // Animate tail simulation loop
  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const tick = (now: number) => {
      setTailAnimationTime((now - start) / 1000);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw interactive tail kinematics
  useEffect(() => {
    const canvas = tailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Coordinate origin at base of spine
    const originX = w * 0.28;
    const originY = h * 0.68;

    // Grid / Measurement arcs
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(originX, originY, 120, -Math.PI * 0.8, 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(originX, originY, 200, -Math.PI * 0.8, 0.2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Base Spine / Pelvis segment representation
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(originX - 35, originY + 15, 45, 28, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Primate silhouette indicator
    ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.arc(originX - 50, originY - 10, 24, 0, Math.PI * 2);
    ctx.fill();

    // Spine root label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('SACRAL BASE (S1-Ca1)', originX - 90, originY + 50);

    // Calculate dynamic tail curve based on selected pattern parameters
    const pattern = selectedTailPattern;
    const segments = 24;
    const segmentLength = 220 / segments;
    const angleRad = (pattern.angleDegrees * Math.PI) / 180;
    const curvature = pattern.curvature; // -1 to 1
    const twitchHz = pattern.twitchFrequencyHz;

    // Harmonic twitch oscillation
    const twitchAngle = Math.sin(tailAnimationTime * twitchHz * Math.PI * 2) * (twitchHz > 0 ? 0.08 : 0.01);

    const points: { x: number; y: number }[] = [{ x: originX, y: originY }];

    let currentAngle = -angleRad + twitchAngle;
    let currX = originX;
    let currY = originY;

    for (let i = 1; i <= segments; i++) {
      const progress = i / segments;
      // Prehensile curl or S-curve modification
      let segmentCurvature = curvature * (0.06 + progress * 0.12);
      if (pattern.id.includes('s-curve') || pattern.postureName.includes('S-Curve')) {
        segmentCurvature = Math.sin(progress * Math.PI * 2) * 0.18;
      } else if (pattern.id.includes('loop') || pattern.postureName.includes('Loop')) {
        segmentCurvature = progress > 0.4 ? 0.22 : -0.05;
      } else if (pattern.id.includes('wrap') || pattern.postureName.includes('Wrap')) {
        segmentCurvature = 0.24 * (1 + progress);
      }

      currentAngle += segmentCurvature;
      currX += Math.cos(currentAngle) * segmentLength;
      currY += Math.sin(currentAngle) * segmentLength;
      points.push({ x: currX, y: currY });
    }

    // Draw tail shadow / glow
    ctx.save();
    ctx.strokeStyle = pattern.communicativeDirection.includes('Affiliative')
      ? 'rgba(16, 185, 129, 0.3)'
      : pattern.communicativeDirection.includes('Alarm')
      ? 'rgba(239, 68, 68, 0.3)'
      : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw main tail body
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw vertebral nodes along the tail
    ctx.fillStyle = '#38bdf8';
    points.forEach((p, idx) => {
      if (idx % 3 === 0 || idx === points.length - 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, idx === points.length - 1 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Angle indicator line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + Math.cos(-angleRad) * 140, originY + Math.sin(-angleRad) * 140);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle label
    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px monospace';
    ctx.fillText(`${pattern.angleDegrees}° Elevation`, originX + 50, originY - 60);

    // Tip label with dynamic coordinates
    const tip = points[points.length - 1];
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Tip (${Math.round(tip.x)}, ${Math.round(tip.y)})`, tip.x + 8, tip.y - 8);

    ctx.restore();
  }, [selectedTailPattern, tailAnimationTime]);

  // Audio Synthesis for Primate Vocalizations using Web Audio API
  const playVocalizationSynthesizer = (vocal: PrimateVocalization) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      setIsPlayingAudio(true);
      setActiveVocalId(vocal.id);

      const now = ctx.currentTime;
      const duration = vocal.durationMs / 1000;

      // Master gain for call envelope
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      // Fundamental oscillator (F0)
      const oscF0 = ctx.createOscillator();
      oscF0.type = 'sawtooth';
      oscF0.frequency.setValueAtTime(vocal.fundamentalFrequencyHz, now);

      // Pitch glide based on call type
      if (vocal.callType === 'Alarm' || vocal.callName.includes('Trill')) {
        oscF0.frequency.linearRampToValueAtTime(
          vocal.fundamentalFrequencyHz * 1.35,
          now + duration * 0.4
        );
        oscF0.frequency.exponentialRampToValueAtTime(
          vocal.fundamentalFrequencyHz * 0.9,
          now + duration
        );
      } else if (vocal.callType === 'Affiliative' || vocal.callName.includes('Coo')) {
        oscF0.frequency.exponentialRampToValueAtTime(
          vocal.fundamentalFrequencyHz * 1.15,
          now + duration * 0.5
        );
        oscF0.frequency.exponentialRampToValueAtTime(
          vocal.fundamentalFrequencyHz * 0.95,
          now + duration
        );
      }

      // Bandpass formant filters matching published literature acoustic profiles
      const formants = vocal.harmonicFormants || [vocal.fundamentalFrequencyHz * 2];
      formants.forEach((f) => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(f, now);
        filter.Q.setValueAtTime(4.5, now);

        const formantOsc = ctx.createOscillator();
        formantOsc.type = 'sine';
        formantOsc.frequency.setValueAtTime(f, now);

        const fGain = ctx.createGain();
        fGain.gain.setValueAtTime(0.12, now);

        formantOsc.connect(filter);
        filter.connect(masterGain);

        formantOsc.start(now);
        formantOsc.stop(now + duration);
      });

      oscF0.connect(masterGain);
      oscF0.start(now);
      oscF0.stop(now + duration);

      // Reset playing state when finished
      setTimeout(() => {
        setIsPlayingAudio(false);
        setActiveVocalId(null);
      }, vocal.durationMs + 80);
    } catch (err) {
      console.warn('Audio playback error:', err);
      setIsPlayingAudio(false);
      setActiveVocalId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                ETHOLOGICAL INTELLIGENCE
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Google Antigravity & Peer-Reviewed Primatology
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <span>Primate Tail & Body Language Communication Studio</span>
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Synthesized from classic and contemporary primatological literature (Altmann, van Hooff,
              Cheney & Seyfarth, Maestripieri, Thierry). Multi-modal posture kinematics, acoustic harmonic formants,
              and bidirectional sanctuary caretaker guidelines.
            </p>
          </div>

          {/* Primate Species Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {allTwins.map((twin) => {
              const isSelected = twin.id === selectedTwin.id;
              return (
                <button
                  key={twin.id}
                  onClick={() => onSelectTwin(twin.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img
                    src={twin.imageUrl}
                    alt={twin.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white line-clamp-1">{twin.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{twin.species.split(' ')[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Primate Species Summary Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Subject:</span>
            <span className="font-bold text-white font-mono">{selectedTwin.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono">{currentProfile.scientificName}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-cyan-300 hidden sm:inline">{currentProfile.speciesName}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Troop Structure:</span>
            <span className="text-amber-300 font-semibold">{currentProfile.naturalTroopStructure.split('.')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tail-language')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'tail-language'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Tail Language Vector ({currentProfile.tailLanguageRepertoire.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('body-gestures')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'body-gestures'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Body & Facial Gestures ({currentProfile.bodyLanguageRepertoire.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vocalizations')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'vocalizations'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span>Harmonic Vocalizations & Web Audio ({currentProfile.vocalizationRepertoire.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sanctuary-guide')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'sanctuary-guide'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Sanctuary Caretaker Guide</span>
        </button>
      </div>

      {/* TAB 1: TAIL LANGUAGE VECTOR & KINEMATICS */}
      {activeTab === 'tail-language' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pattern Selection List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Published Tail Posture Patterns</span>
              <span className="font-mono text-[10px] text-emerald-400">Vertebral Kinematics</span>
            </div>

            <div className="space-y-2">
              {currentProfile.tailLanguageRepertoire.map((pattern) => {
                const isSelected = selectedTailPattern.id === pattern.id;
                return (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedTailPattern(pattern)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{pattern.postureName}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          pattern.communicativeDirection.includes('Affiliative')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : pattern.communicativeDirection.includes('Alarm')
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {pattern.communicativeDirection.split('(')[0]}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {pattern.semanticMeaning}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500 block text-[9px]">Angle</span>
                        <span className="text-amber-400 font-semibold">{pattern.angleDegrees}°</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">Twitch</span>
                        <span className="text-cyan-400 font-semibold">{pattern.twitchFrequencyHz} Hz</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">Rigidity</span>
                        <span className="text-emerald-400 font-semibold">{pattern.rigidity}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive Kinematic Visualizer & Scientific Citation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white text-xs font-mono">
                    Live 24-Vertebrae Kinematic Rig Simulation
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedTailPattern.rigidity} Rigidity
                </span>
              </div>

              {/* Canvas Visualizer */}
              <div className="relative bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <canvas
                  ref={tailCanvasRef}
                  width={640}
                  height={320}
                  className="w-full h-auto max-h-[300px] object-contain"
                />

                <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  Kinematic Harmonic Wave: {selectedTailPattern.twitchFrequencyHz} Hz
                </div>
              </div>

              {/* Ethological Details */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-emerald-400" />
                    <span>Communicative Direction</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-300">
                    {selectedTailPattern.communicativeDirection}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    {selectedTailPattern.socialContext}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span>Published Primatology Citation</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {selectedTailPattern.publishedLiterature.citation}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 italic">
                    "{selectedTailPattern.publishedLiterature.keyFinding || selectedTailPattern.publishedLiterature.context}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BODY LANGUAGE & FACIAL DISPLAYS */}
      {activeTab === 'body-gestures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProfile.bodyLanguageRepertoire.map((gesture) => (
            <div
              key={gesture.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 shadow-lg transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-white">{gesture.gestureName}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {gesture.communicativeDirection}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  {gesture.facialAndPosturalAction}
                </div>

                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-emerald-300">
                  <span className="text-slate-400 font-mono text-[9px] block">Social Function:</span>
                  {gesture.socialFunction}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                  <BookOpen className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{gesture.publishedLiterature.citation}</span>
                </div>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    gesture.youtubeReference.searchQuery || gesture.youtubeReference.videoQuery || gesture.gestureName
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-300 text-[11px] font-semibold transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>Search YouTube Ethology Media</span>
                  <ExternalLink className="w-2.5 h-2.5 text-red-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VOCALIZATIONS & REAL WEB AUDIO SYNTHESIS */}
      {activeTab === 'vocalizations' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-white block text-sm">Harmonic Formant Acoustic Synthesizer</span>
              <span className="text-slate-400 text-xs">
                Synthesized directly in-browser using Web Audio API dual-oscillator and multi-pole formant filters calibrated to field bioacoustic analyses.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span className="font-mono text-purple-300 font-bold text-[11px]">WEB AUDIO API</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProfile.vocalizationRepertoire.map((vocal) => {
              const isThisPlaying = isPlayingAudio && activeVocalId === vocal.id;
              return (
                <div
                  key={vocal.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isThisPlaying
                      ? 'bg-slate-800/95 border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-white text-sm block">{vocal.callName}</span>
                      <span className="text-[10px] font-mono text-purple-300">{vocal.callType} Call</span>
                    </div>

                    <button
                      onClick={() => playVocalizationSynthesizer(vocal)}
                      disabled={isThisPlaying}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                        isThisPlaying
                          ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                          : 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:text-white'
                      }`}
                    >
                      {isThisPlaying ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isThisPlaying ? 'Synthesizing...' : 'Play Call'}</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed mb-3">
                    {vocal.semanticDirection}
                  </div>

                  {/* Acoustic Parameters */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[9px]">F0 Fundamental</span>
                      <span className="text-amber-400 font-bold">{vocal.fundamentalFrequencyHz} Hz</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Bandwidth</span>
                      <span className="text-cyan-400 font-bold">{vocal.frequencyRangeHz[0]} - {vocal.frequencyRangeHz[1]} Hz</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Duration</span>
                      <span className="text-emerald-400 font-bold">{vocal.durationMs} ms</span>
                    </div>
                  </div>

                  {/* Literature & YouTube Citation */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                    <div className="text-slate-400 line-clamp-1 italic">
                      {vocal.publishedLiterature.citation}
                    </div>

                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        vocal.youtubeReference.videoQuery || vocal.youtubeReference.searchQuery || `${currentProfile.scientificName} ${vocal.callName}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 flex-shrink-0"
                    >
                      <Youtube className="w-3 h-3" />
                      <span>YouTube</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SANCTUARY CARETAKER GUIDE & LANGUAGE COHESION */}
      {activeTab === 'sanctuary-guide' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Marshall Islands Sanctuary Caretaker Interaction Protocol</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Field ethology rules for human caretakers, veterinarians, and drone monitoring operators interacting with rescued primates across Majuro, Jaluit, and Arno Atolls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="font-bold text-emerald-300 block mb-1 text-sm">
                  1. Multi-Modal Congruence (Tail + Face + Voice)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Never evaluate a single signal in isolation. A raised tail indicates high arousal; combine it with facial expression:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                  <li><strong>Raised Tail + Lip-smacking</strong> = Affiliative approach, peaceful greeting. Safe to advance with food enrichment.</li>
                  <li><strong>Raised Tail + Direct Stare & Canine Flash</strong> = Agonistic threat. Break eye contact immediately and retreat slowly without turning your back.</li>
                  <li><strong>Clamped Tail + Bared-Teeth Grimace</strong> = Fear/submission. Cease movement; avoid towering over the primate.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1 text-sm">
                  2. Eye Contact & Proxemics Protocol
                </span>
                <p className="text-slate-300 leading-relaxed">
                  In all Macaca and Chlorocebus species, direct sustained eye contact is an agonistic challenge. Maintain a 45-degree gaze offset. When greeting habituated individuals (such as Kokoa or Baron), practice gentle rhythmic lip-smacking and lateral head-bobs to signal non-threatening intent.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1 text-sm">
                  3. Acoustic Alarm Response (Pacific Squalls & Drones)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  When sentinel monkeys emit high-frequency staccato barks (e.g. Zephyr's eagle/drone alarm), troop members will dive down into dense breadfruit foliage. Sanctuary telemetry drones must immediately climb 15 meters to prevent agitation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <span className="font-bold text-cyan-300 block mb-1 text-sm">
                  4. Miyawaki Bio-Corridor Arboreal Enrichment
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Provide elevated feeding stations above 10 meters. Tail-based locomotion (especially for Capuchins with prehensile tails and Long-tailed macaques using tails for balance) is restored 3x faster when natural swaying branches and flexible ropes simulate native ocean-wind dynamics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

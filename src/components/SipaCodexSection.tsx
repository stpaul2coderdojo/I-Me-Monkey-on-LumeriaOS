import React, { useState, useRef, useEffect } from 'react';
import {
  SIPA_DIACRITICS,
  SIPA_CONSONANTS,
  SIPA_VOWELS,
  SIPA_SPECIES_TRANSCRIPTIONS,
} from '../data/sipaData';
import {
  SipaDiacritic,
  SipaConsonant,
  SipaVowel,
  SipaSpeciesTranscription,
} from '../types';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Copy,
  Check,
  Sparkles,
  Layers,
  Activity,
  Code,
  Compass,
  ArrowDown,
  ArrowUp,
  Radio,
  BookOpen,
  Info,
  ShieldCheck,
  Cpu,
  ChevronRight,
  ExternalLink,
  Mic,
  Sliders,
  Maximize2,
} from 'lucide-react';

export const SipaCodexSection: React.FC = () => {
  // Navigation sub-tabs within S-IPA
  const [subTab, setSubTab] = useState<'transcriptions' | 'vowels' | 'consonants' | 'diacritics' | 'builder'>('transcriptions');

  // Active transcription selected
  const [selectedTranscription, setSelectedTranscription] = useState<SipaSpeciesTranscription>(
    SIPA_SPECIES_TRANSCRIPTIONS[0]
  );
  const [activePlayingPhase, setActivePlayingPhase] = useState<number | null>(null);

  // Selected item previews
  const [selectedDiacritic, setSelectedDiacritic] = useState<SipaDiacritic>(SIPA_DIACRITICS[0]);
  const [selectedConsonant, setSelectedConsonant] = useState<SipaConsonant>(SIPA_CONSONANTS[0]);
  const [selectedVowel, setSelectedVowel] = useState<SipaVowel>(SIPA_VOWELS[0]);

  // Custom S-IPA String Builder
  const [customSipaString, setCustomSipaString] = useState<string>('[ k͡xæ-k͡xæ-k͡xæ ]');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizerNotice, setSynthesizerNotice] = useState<string | null>(null);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sequenceTimeoutsRef = useRef<number[]>([]);

  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Stop any ongoing sequences
  const stopAllAudio = () => {
    sequenceTimeoutsRef.current.forEach((t) => clearTimeout(t));
    sequenceTimeoutsRef.current = [];
    setActivePlayingPhase(null);
    setIsSynthesizing(false);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // ==========================================================================
  // ACOUSTIC SYNTHESIS ENGINES
  // ==========================================================================

  // 1. Synthesize Diacritic
  const playDiacriticSound = (diacritic: SipaDiacritic) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (diacritic.id === 'diacritic-air-sac') {
        // Deep subhyoid resonant boom with air-sac low chambering
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.7);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(70, now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(160, now);
        filter.Q.setValueAtTime(8.4, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.78);
        subOsc.stop(now + 0.78);
      } else if (diacritic.id === 'diacritic-lip-smack') {
        // High frequency wet labial inward click
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4200, now);
        filter.Q.setValueAtTime(5.0, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (diacritic.id === 'diacritic-subharmonic') {
        // Subharmonic tremor with 18Hz diaphragm pulse
        const carrier = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const mainGain = ctx.createGain();

        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(85, now);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(18, now); // 18 Hz tremor

        lfoGain.gain.setValueAtTime(0.3, now);
        lfo.connect(carrier.frequency);

        mainGain.gain.setValueAtTime(0.01, now);
        mainGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        carrier.connect(mainGain);
        mainGain.connect(ctx.destination);

        carrier.start(now);
        lfo.start(now);
        carrier.stop(now + 0.68);
        lfo.stop(now + 0.68);
      } else if (diacritic.id === 'diacritic-coarticulation') {
        // Dual phonation pulse [ k͡x ]
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (diacritic.id === 'diacritic-inhaled') {
        // Inhaled noisy high-friction ingress
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.linearRampToValueAtTime(780, now + 0.35); // Rising ingress

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else {
        // Exhaled egress [ ɑ↓ ]
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.4); // Falling egress

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
      }

      setSynthesizerNotice(`Synthesized S-IPA Diacritic: ${diacritic.displaySymbol} (${diacritic.name})`);
      setTimeout(() => setSynthesizerNotice(null), 3000);
    } catch {
      // Non-blocking
    }
  };

  // 2. Synthesize Consonant
  const playConsonantSound = (consonant: SipaConsonant) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (consonant.symbol === 'ǂ') {
        // Labial lip-smack: triple mucosal click
        [0, 0.07, 0.14].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(4200, now + offset);
          osc.frequency.exponentialRampToValueAtTime(1200, now + offset + 0.035);

          gain.gain.setValueAtTime(0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.045);
        });
      } else if (consonant.symbol === 'ʘ̂') {
        // Tooth clack: dry, high-frequency enamel click
        [0, 0.05, 0.1, 0.15].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(5800, now + offset);

          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.025);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.03);
        });
      } else if (consonant.symbol === 'ɓ̥') {
        // Laryngeal play pant / hiss: breathy noise
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.setValueAtTime(2.5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else {
        // Bark transient ʞ: explosive glottal burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1250, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      setSynthesizerNotice(`Synthesized S-IPA Consonant: ${consonant.symbol} (${consonant.name})`);
      setTimeout(() => setSynthesizerNotice(null), 3000);
    } catch {
      // Non-blocking
    }
  };

  // 3. Synthesize Vowel with Formant Filters (F1, F2)
  const playVowelSound = (vowel: SipaVowel) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const source = ctx.createOscillator();
      source.type = vowel.symbol === 'ɯ' ? 'sawtooth' : 'triangle';
      source.frequency.setValueAtTime(vowel.baseFrequencyHz, now);

      // Pitch contour modulation typical of simian calls
      if (vowel.symbol === 'ɯ') {
        source.frequency.linearRampToValueAtTime(vowel.baseFrequencyHz * 1.35, now + 0.25);
        source.frequency.exponentialRampToValueAtTime(vowel.baseFrequencyHz * 0.9, now + 0.5);
      } else if (vowel.symbol === 'ʊ') {
        // soft, low variance
        source.frequency.setValueAtTime(vowel.baseFrequencyHz, now);
      } else {
        source.frequency.exponentialRampToValueAtTime(vowel.baseFrequencyHz * 0.85, now + 0.4);
      }

      // Formant Filter F1
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(vowel.formants.f1, now);
      f1.Q.setValueAtTime(6.0, now);

      // Formant Filter F2
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(vowel.formants.f2, now);
      f2.Q.setValueAtTime(6.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      source.connect(f1);
      source.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + 0.58);

      setSynthesizerNotice(`Synthesized S-IPA Vowel: [ ${vowel.symbol} ] (${vowel.commonCallName})`);
      setTimeout(() => setSynthesizerNotice(null), 3000);
    } catch {
      // Non-blocking
    }
  };

  // 4. Synthesize Full Species Sequence
  const playTranscriptionSequence = (transcription: SipaSpeciesTranscription) => {
    stopAllAudio();
    setIsSynthesizing(true);
    const ctx = getAudioContext();

    let cumulativeDelayMs = 0;

    transcription.phases.forEach((phase) => {
      const timeoutId = window.setTimeout(() => {
        setActivePlayingPhase(phase.phaseNumber);

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Waveform selection based on phase acoustics
        if (phase.airSacEngagement) {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(phase.frequencyHz, now);
          osc.frequency.exponentialRampToValueAtTime(phase.frequencyHz * 1.15, now + 0.4);
        } else if (phase.frequencyHz > 2000) {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(phase.frequencyHz, now);
          osc.frequency.linearRampToValueAtTime(phase.frequencyHz * 1.25, now + 0.25);
          osc.frequency.exponentialRampToValueAtTime(phase.frequencyHz * 0.85, now + 0.5);
        } else {
          osc.type = phase.respiratoryDynamic === 'rapid_cycle' ? 'square' : 'triangle';
          osc.frequency.setValueAtTime(phase.frequencyHz, now);
        }

        const durSec = Math.min(phase.durationMs / 1000, 1.2);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durSec + 0.05);

        setSynthesizerNotice(`Playing Phase ${phase.phaseNumber}: ${phase.sipaNotation} (${phase.name})`);
      }, cumulativeDelayMs);

      sequenceTimeoutsRef.current.push(timeoutId);
      cumulativeDelayMs += Math.min(phase.durationMs, 1400) + 200;
    });

    const finalTimeout = window.setTimeout(() => {
      setActivePlayingPhase(null);
      setIsSynthesizing(false);
      setSynthesizerNotice(`Completed S-IPA sequence for ${transcription.species}`);
      setTimeout(() => setSynthesizerNotice(null), 3000);
    }, cumulativeDelayMs + 200);

    sequenceTimeoutsRef.current.push(finalTimeout);
  };

  // 5. Synthesize Custom S-IPA String
  const synthesizeCustomString = () => {
    stopAllAudio();
    setIsSynthesizing(true);
    const ctx = getAudioContext();
    const str = customSipaString;
    const now = ctx.currentTime;

    // Detect acoustic profile from the string
    let baseFreq = 480;
    let waveType: OscillatorType = 'triangle';
    let isClick = false;

    if (str.includes('ɯ') || str.includes('i')) {
      baseFreq = 2200;
      waveType = 'sawtooth';
    } else if (str.includes('ʊ̃') || str.includes('ɓ͉') || str.includes('ʊ')) {
      baseFreq = 160;
      waveType = 'triangle';
    } else if (str.includes('k͡x') || str.includes('ʞ')) {
      baseFreq = 850;
      waveType = 'square';
    } else if (str.includes('ǂ') || str.includes('ʘ̂') || str.includes('p͋')) {
      isClick = true;
    }

    if (isClick) {
      [0, 0.08, 0.16].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4500, now + offset);
        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveType;
      osc.frequency.setValueAtTime(baseFreq, now);

      if (str.includes('↑')) {
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + 0.4);
      } else if (str.includes('↓')) {
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.75, now + 0.45);
      }

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    }

    setSynthesizerNotice(`Synthesized Custom S-IPA String: ${customSipaString}`);
    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthesizerNotice(null);
    }, 1200);
  };

  const appendToCustom = (char: string) => {
    // If wrapped in brackets, insert inside or append
    if (customSipaString.endsWith(' ]')) {
      const inner = customSipaString.slice(0, -2);
      setCustomSipaString(`${inner} ${char} ]`);
    } else {
      setCustomSipaString((prev) => `${prev} ${char}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                S-IPA Specification 1.0
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Non-Human Primate Phonology
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Web Audio Resonator
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Simian Interspecies Phonetic Alphabet</span>
              <span className="text-base sm:text-lg font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/40">
                S-IPA
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Standardizing the unique vocal acoustics of non-human primates—ranging from low-frequency grunt registers to ultrasonic chatter. Unlike human supraglottal articulation (lips, tongue, teeth), S-IPA maps the structural acoustic mechanics of the primate vocal tract: <strong className="text-indigo-300">laryngeal sacs</strong>, <strong className="text-indigo-300">rapid diaphragm pulsing</strong>, and <strong className="text-indigo-300">lip-smacking percussives</strong>.
            </p>
          </div>

          {/* Quick Synthesizer Notice */}
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {synthesizerNotice && (
              <div className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>{synthesizerNotice}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={synthesizeCustomString}
                disabled={isSynthesizing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Play Live Phone</span>
              </button>

              <button
                onClick={stopAllAudio}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                title="Stop Audio"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('transcriptions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'transcriptions'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>4. Species Transcriptions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono">
              {SIPA_SPECIES_TRANSCRIPTIONS.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('vowels')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'vowels'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>3. Vowels & Resonant Quadrant</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono">
              {SIPA_VOWELS.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('consonants')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'consonants'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>2. Acoustic Consonants</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono">
              {SIPA_CONSONANTS.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('diacritics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'diacritics'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Vocal Tract Diacritics</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono">
              {SIPA_DIACRITICS.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'builder'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>S-IPA String Builder & USDA Node</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: SPECIES TRANSCRIPTIONS
         ===================================================================== */}
      {subTab === 'transcriptions' && (
        <div className="space-y-6">
          {/* Species Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SIPA_SPECIES_TRANSCRIPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedTranscription(item);
                  stopAllAudio();
                }}
                className={`p-4 rounded-xl text-left border transition-all ${
                  selectedTranscription.id === item.id
                    ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.species}</span>
                  <span className="text-[10px] font-mono text-indigo-400">
                    {item.phases.length} Phases
                  </span>
                </div>
                <div className="text-[11px] font-serif italic text-slate-400 mt-0.5">
                  {item.latinName}
                </div>
                <div className="mt-2 text-[10px] text-slate-300 line-clamp-1">
                  {item.callSequenceName}
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Active Transcription Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-white">
                    {selectedTranscription.species}
                  </h2>
                  <span className="text-xs font-serif italic text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                    {selectedTranscription.latinName}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    — {selectedTranscription.callSequenceName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedTranscription.behavioralContext}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => playTranscriptionSequence(selectedTranscription)}
                  disabled={isSynthesizing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isSynthesizing ? 'Playing Sequence...' : 'Synthesize Full Sequence'}</span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(selectedTranscription.sIpaRepresentation, 'transcription')
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                >
                  {copiedText === 'transcription' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy S-IPA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* S-IPA Canonical Representation Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>CANONICAL S-IPA TRANSCRIPTION</span>
                <span className="text-indigo-400">Format: [ Root ] ──&gt; [ Suffix ]</span>
              </div>
              <div className="text-base sm:text-xl font-mono font-bold text-amber-300 tracking-wide break-words py-1">
                {selectedTranscription.sIpaRepresentation}
              </div>
            </div>

            {/* Phase Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Acoustic Phase Progression & Resonance Profile</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedTranscription.phases.map((phase) => (
                  <div
                    key={phase.phaseNumber}
                    className={`p-4 rounded-xl border transition-all ${
                      activePlayingPhase === phase.phaseNumber
                        ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Phase 0{phase.phaseNumber}
                      </span>
                      {phase.airSacEngagement && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40">
                          Air-Sac Active
                        </span>
                      )}
                    </div>

                    <div className="text-lg font-mono font-bold text-white mb-1">
                      {phase.sipaNotation}
                    </div>

                    <div className="text-xs font-semibold text-indigo-300 mb-2">
                      {phase.name}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {phase.acousticDescription}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>F0: {phase.frequencyHz} Hz</span>
                      <span>{phase.respiratoryDynamic.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Highlight for Vervet Predatory Semantic Branch */}
            {selectedTranscription.id === 'sipa-vervet-alarm-calls' && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">
                    Vervet Monkey Referential Semantic Call Logic (Seyfarth & Cheney)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/30 space-y-1">
                    <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                      <span>🐆 Leopard Alarm</span>
                      <span className="font-mono">[ k͡xæ-k͡xæ-k͡xæ ]</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Low-frequency explosive bark (820 Hz)
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Escape Reaction: Immediate vertical canopy ascent to thin terminal branches.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-sky-500/30 space-y-1">
                    <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                      <span>🦅 Eagle Alarm</span>
                      <span className="font-mono">[ ər-ər-ər-əː ]</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Low coughing staccato grunt (460 Hz)
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Escape Reaction: Scanning sky directly overhead & diving downward into dense bushes.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-rose-500/30 space-y-1">
                    <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
                      <span>🐍 Snake Alarm</span>
                      <span className="font-mono">[ ǂ-i-i-i-i ]</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      High-frequency dental chatter (3,400 Hz)
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Escape Reaction: Standing bipedally on hind legs and scanning surrounding ground grass.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Highlight for Siamang Great Call Duo */}
            {selectedTranscription.id === 'sipa-siamang-great-call' && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                    Siamang Subhyoid Throat-Sac Acoustic Impedance
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The male Siamang inflates a gargantuan subhyoid sac beneath the chin during the <code className="text-amber-300">[ ʊ̃ː↑ ]</code> boom phase. This functions as an acoustic radiator that matches the vocal tract impedance to the air, driving deep sub-200 Hz energy through heavy tropical humidity over 4 kilometers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: VOWELS & RESONANTS QUADRANT
         ===================================================================== */}
      {subTab === 'vowels' && (
        <div className="space-y-6">
          {/* Interactive Vowel Quadrilateral Visualizer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>Simian Vocalic Acoustic Space (Vowel Quadrangle)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any S-IPA vowel node to synthesize its acoustic formants ($F_1, F_2$) and explore species usage.
                </p>
              </div>
              <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-500/30">
                Front ⟵ Central ⟶ Back
              </div>
            </div>

            {/* Interactive Grid Table */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-center text-[11px] font-mono uppercase font-bold text-slate-500 pb-2 border-b border-slate-800">
                Front
              </div>
              <div className="text-center text-[11px] font-mono uppercase font-bold text-slate-500 pb-2 border-b border-slate-800">
                Central
              </div>
              <div className="text-center text-[11px] font-mono uppercase font-bold text-slate-500 pb-2 border-b border-slate-800">
                Back
              </div>

              {/* HIGH ROW */}
              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">High Front</span>
                <button
                  onClick={() => {
                    const v = SIPA_VOWELS.find((v) => v.symbol === 'i')!;
                    setSelectedVowel(v);
                    playVowelSound(v);
                  }}
                  className={`w-12 h-12 rounded-xl text-xl font-mono font-bold transition-all flex items-center justify-center ${
                    selectedVowel.symbol === 'i'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  [ i ]
                </button>
                <span className="text-[10px] text-slate-400 text-center">Distress Pip</span>
              </div>

              <div className="p-3 bg-slate-900/30 rounded-lg border border-dashed border-slate-800/50 flex flex-col items-center justify-center text-slate-600 text-xs italic">
                — (Tract Gap) —
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">High Back</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const v = SIPA_VOWELS.find((v) => v.symbol === 'u')!;
                      setSelectedVowel(v);
                      playVowelSound(v);
                    }}
                    className={`w-10 h-10 rounded-xl text-lg font-mono font-bold transition-all flex items-center justify-center ${
                      selectedVowel.symbol === 'u'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                    }`}
                  >
                    [ u ]
                  </button>
                  <button
                    onClick={() => {
                      const v = SIPA_VOWELS.find((v) => v.symbol === 'ʊ')!;
                      setSelectedVowel(v);
                      playVowelSound(v);
                    }}
                    className={`w-10 h-10 rounded-xl text-lg font-mono font-bold transition-all flex items-center justify-center ${
                      selectedVowel.symbol === 'ʊ'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                    }`}
                    title="Rounded Hoo Call"
                  >
                    [ ʊ ]
                  </button>
                  <button
                    onClick={() => {
                      const v = SIPA_VOWELS.find((v) => v.symbol === 'ɯ')!;
                      setSelectedVowel(v);
                      playVowelSound(v);
                    }}
                    className={`w-10 h-10 rounded-xl text-lg font-mono font-bold transition-all flex items-center justify-center ${
                      selectedVowel.symbol === 'ɯ'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                    }`}
                    title="Open-Mouth Scream"
                  >
                    [ ɯ ]
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 text-center">Hoo [ʊ] / Scream [ɯ]</span>
              </div>

              {/* MID ROW */}
              <div className="p-3 bg-slate-900/30 rounded-lg border border-dashed border-slate-800/50 flex flex-col items-center justify-center text-slate-600 text-xs italic">
                —
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Mid Central</span>
                <button
                  onClick={() => {
                    const v = SIPA_VOWELS.find((v) => v.symbol === 'ə')!;
                    setSelectedVowel(v);
                    playVowelSound(v);
                  }}
                  className={`w-12 h-12 rounded-xl text-xl font-mono font-bold transition-all flex items-center justify-center ${
                    selectedVowel.symbol === 'ə'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  [ ə ]
                </button>
                <span className="text-[10px] text-slate-400 text-center">Coughing Bark</span>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Mid Back</span>
                <button
                  onClick={() => {
                    const v = SIPA_VOWELS.find((v) => v.symbol === 'o')!;
                    setSelectedVowel(v);
                    playVowelSound(v);
                  }}
                  className={`w-12 h-12 rounded-xl text-xl font-mono font-bold transition-all flex items-center justify-center ${
                    selectedVowel.symbol === 'o'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  [ o ]
                </button>
                <span className="text-[10px] text-slate-400 text-center">Travel Hoo</span>
              </div>

              {/* LOW ROW */}
              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Low Front</span>
                <button
                  onClick={() => {
                    const v = SIPA_VOWELS.find((v) => v.symbol === 'æ')!;
                    setSelectedVowel(v);
                    playVowelSound(v);
                  }}
                  className={`w-12 h-12 rounded-xl text-xl font-mono font-bold transition-all flex items-center justify-center ${
                    selectedVowel.symbol === 'æ'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  [ æ ]
                </button>
                <span className="text-[10px] text-slate-400 text-center">Leopard Alarm</span>
              </div>

              <div className="p-3 bg-slate-900/30 rounded-lg border border-dashed border-slate-800/50 flex flex-col items-center justify-center text-slate-600 text-xs italic">
                —
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Low Back</span>
                <button
                  onClick={() => {
                    const v = SIPA_VOWELS.find((v) => v.symbol === 'ɑ')!;
                    setSelectedVowel(v);
                    playVowelSound(v);
                  }}
                  className={`w-12 h-12 rounded-xl text-xl font-mono font-bold transition-all flex items-center justify-center ${
                    selectedVowel.symbol === 'ɑ'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                  }`}
                >
                  [ ɑ ]
                </button>
                <span className="text-[10px] text-slate-400 text-center">Low Open Grunt</span>
              </div>
            </div>

            {/* Selected Vowel Profile Card */}
            <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-bold text-indigo-400">
                    [ {selectedVowel.symbol} ]
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedVowel.name}</h3>
                    <span className="text-xs font-mono text-amber-300 font-semibold">
                      {selectedVowel.commonCallName}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-1">
                  {selectedVowel.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2">
                  <span>Base F0: {selectedVowel.baseFrequencyHz} Hz</span>
                  <span>
                    Formants: F1={selectedVowel.formants.f1} Hz | F2={selectedVowel.formants.f2} Hz
                  </span>
                  <span>Lip: {selectedVowel.lipPosition.toUpperCase()}</span>
                </div>
              </div>

              <button
                onClick={() => playVowelSound(selectedVowel)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Resonator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ACOUSTIC CONSONANTS (Non-Pulmonic & Percussive)
         ===================================================================== */}
      {subTab === 'consonants' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SIPA_CONSONANTS.map((consonant) => (
              <div
                key={consonant.id}
                className={`p-6 rounded-2xl border transition-all ${
                  selectedConsonant.id === consonant.id
                    ? 'bg-slate-900 border-indigo-500/60 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-3xl font-mono font-bold text-amber-300">
                      {consonant.symbol}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{consonant.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {consonant.pulmonic ? 'Pulmonic Diaphragm' : 'Non-Pulmonic Transient'}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          {consonant.defaultFrequencyHz} Hz
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedConsonant(consonant);
                      playConsonantSound(consonant);
                    }}
                    className="p-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all"
                    title="Synthesize Consonant"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="font-mono text-slate-500">MECHANISM: </span>
                    <span className="text-slate-300">{consonant.mechanism}</span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500">FUNCTION: </span>
                    <span className="text-slate-300">{consonant.functionalRole}</span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-500">SPECIES: </span>
                    <span className="text-indigo-300">{consonant.speciesUsage.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Token: {consonant.usdToken}</span>
                  <button
                    onClick={() => appendToCustom(consonant.symbol)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    + Add to Builder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: VOCAL TRACT MECHANICS & DIACRITICS
         ===================================================================== */}
      {subTab === 'diacritics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Vocal Tract Mechanics & S-IPA Diacritics</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simian vocalization relies heavily on resonance modifiers distinct from human supraglottal speech. Subhyoid air sacs, sub-harmonic tremors, and ingressive airflow alter acoustic mechanics directly at the source.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-4">Diacritic</th>
                    <th className="py-3 px-4">Phonetic Modifier</th>
                    <th className="py-3 px-4">Acoustic Mechanism & Meaning</th>
                    <th className="py-3 px-4">Example & Species</th>
                    <th className="py-3 px-4 text-right">Acoustic Audition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SIPA_DIACRITICS.map((diacritic) => (
                    <tr
                      key={diacritic.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded border border-indigo-500/30">
                            {diacritic.displaySymbol}
                          </span>
                          <span className="font-bold text-white">{diacritic.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {diacritic.phoneticModifier}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-md leading-relaxed">
                        {diacritic.acousticMechanism}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-300">
                          {diacritic.example}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {diacritic.exampleTranscription}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => playDiacriticSound(diacritic)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all font-mono font-bold text-[11px]"
                        >
                          Play Wave
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: S-IPA STRING BUILDER & PIXAR USDA NODE GENERATOR
         ===================================================================== */}
      {subTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Interactive S-IPA Phonetic Keyboard & USDA Generator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compose custom simian acoustic phonemes using S-IPA diacritics, percussives, and vowels. Synthesize real-time audio and export to Pixar USDA audio nodes.
              </p>
            </div>

            {/* Live Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>ACTIVE S-IPA BUFFER</span>
                <button
                  onClick={() => setCustomSipaString('[  ]')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear Buffer
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSipaString}
                  onChange={(e) => setCustomSipaString(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-indigo-500/40 text-white font-mono text-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  placeholder="[ k͡xæ-k͡xæ ]"
                />

                <button
                  onClick={synthesizeCustomString}
                  disabled={isSynthesizing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0"
                >
                  <Play className="w-4 h-4" />
                  <span>Synthesize</span>
                </button>

                <button
                  onClick={() => copyToClipboard(customSipaString, 'custom-string')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all shrink-0"
                  title="Copy S-IPA Unicode"
                >
                  {copiedText === 'custom-string' ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick S-IPA Character Palette */}
            <div className="space-y-4 pt-2">
              {/* Diacritics Palette */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Vocal Tract Diacritics
                </span>
                <div className="flex flex-wrap gap-2">
                  {SIPA_DIACRITICS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => appendToCustom(d.displaySymbol)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 font-mono text-sm transition-all flex items-center gap-1.5"
                    >
                      <span className="text-base font-bold">{d.displaySymbol}</span>
                      <span className="text-[10px] text-slate-400">{d.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => appendToCustom('ː')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-indigo-300 font-mono text-sm"
                  >
                    <span className="font-bold">ː</span> (Elongation)
                  </button>
                </div>
              </div>

              {/* Consonants Palette */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Percussive & Non-Pulmonic Consonants
                </span>
                <div className="flex flex-wrap gap-2">
                  {SIPA_CONSONANTS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => appendToCustom(c.symbol)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/50 text-amber-300 font-mono text-sm transition-all flex items-center gap-1.5"
                    >
                      <span className="text-lg font-bold">{c.symbol}</span>
                      <span className="text-[10px] text-slate-400">{c.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => appendToCustom('k͡x')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-amber-300 font-mono text-sm"
                  >
                    k͡x (Co-articulated Stop)
                  </button>
                  <button
                    onClick={() => appendToCustom('p͋')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-amber-300 font-mono text-sm"
                  >
                    p͋ (Ingressive Pop)
                  </button>
                </div>
              </div>

              {/* Vowels Palette */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Vowels & Resonant Contours
                </span>
                <div className="flex flex-wrap gap-2">
                  {SIPA_VOWELS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => appendToCustom(v.symbol)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/50 text-white font-mono text-sm transition-all flex items-center gap-1.5"
                    >
                      <span className="text-base font-bold text-emerald-400">[ {v.symbol} ]</span>
                      <span className="text-[10px] text-slate-400">{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pixar USD Audio Schema Output */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PIXAR USDA 1.0 AUDIO RIG BINDING (LUMERIAOS)</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `#usda 1.0
def AudioSource "CustomPrimateVocalization_SIPA"
{
    string sipa:phoneticString = "${customSipaString}"
    token sipa:acousticSchema = "S-IPA-1.0-LumeriaOS"
    float primvars:sipa:centroidHz = 1150.0
    bool primvars:sipa:airSacCoupling = ${customSipaString.includes('̃') ? 'true' : 'false'}
}`,
                      'usda-code'
                    )
                  }
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  {copiedText === 'usda-code' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied USDA!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy USDA Node</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`#usda 1.0
def AudioSource "CustomPrimateVocalization_SIPA"
{
    string sipa:phoneticString = "${customSipaString}"
    token sipa:acousticSchema = "S-IPA-1.0-LumeriaOS"
    float primvars:sipa:centroidHz = 1150.0
    bool primvars:sipa:airSacCoupling = ${customSipaString.includes('̃') ? 'true' : 'false'}
    string sipa:vocalTractModality = "${customSipaString.includes('ǂ') || customSipaString.includes('ʘ̂') ? 'percussive_transient' : 'laryngeal_harmonic'}"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

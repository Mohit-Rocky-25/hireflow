// ============================================================
// HireFlow — Pebble Audio Synth & Haptic Sound Engine
// Procedural Web Audio API synthesizer modeling tactile glass/pebble UI chimes
// Zero dependencies, fully client-side, zero latency
// ============================================================

export interface PebbleLayer {
  type: 'tone' | 'noise';
  freq?: { from: number; to: number; time: number; curve: number };
  color?: 'pink' | 'white';
  at: number;
  gain: number; // in dB
  punch?: boolean;
  filter?: Array<{ type: BiquadFilterType; freq: number; q?: number }>;
  env: { attack: number; decay: number; curve: number };
}

export interface PebbleConfig {
  duration: number;
  seed: number;
  loudness: number; // in dB
  lowpass: number;
  reverb: { mix: number; decay: number; predelay: number; damp: number };
  layers: PebbleLayer[];
}

export const pebble: PebbleConfig = {
  duration: 0.16,
  seed: 11,
  loudness: -18,
  lowpass: 7000,
  reverb: { mix: 0.08, decay: 0.3, predelay: 0.01, damp: 5000 },
  layers: [
    {
      type: 'tone',
      freq: { from: 560, to: 380, time: 0.028, curve: 3 },
      at: 0,
      gain: 0,
      env: { attack: 0.0015, decay: 0.075, curve: 6 }
    },
    {
      type: 'tone',
      freq: { from: 1120, to: 820, time: 0.02, curve: 3 },
      at: 0,
      gain: -19,
      env: { attack: 0.0015, decay: 0.03, curve: 6 }
    },
    {
      type: 'noise',
      color: 'pink',
      at: 0,
      gain: -21,
      punch: true,
      filter: [
        { type: 'bandpass', freq: 1150, q: 0.8 },
        { type: 'lowpass', freq: 2990, q: 0.5 }
      ],
      env: { attack: 0.001, decay: 0.007, curve: 6 }
    }
  ]
};

export default pebble;

// ── Audio Context & Playback Engine ──

let sharedAudioContext: AudioContext | null = null;
let isAudioMuted = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export function isMuted(): boolean {
  return isAudioMuted;
}

export function setMuted(muted: boolean): void {
  isAudioMuted = muted;
}

export function toggleMute(): boolean {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
}

/**
 * Procedurally synthesizes and plays the tactile pebble sound using Web Audio API
 */
export function playPebble(config: PebbleConfig = pebble, volumeMultiplier = 1.0): void {
  if (isAudioMuted || typeof window === 'undefined') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;

    // Master Gain (Convert dB loudness to linear gain)
    const masterGainNode = ctx.createGain();
    const linearMasterGain = Math.pow(10, config.loudness / 20) * volumeMultiplier;
    masterGainNode.gain.setValueAtTime(linearMasterGain, startTime);
    masterGainNode.connect(ctx.destination);

    // Master Lowpass Filter (7000 Hz)
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(config.lowpass, startTime);
    masterFilter.connect(masterGainNode);

    // Synthesize each layer
    for (const layer of config.layers) {
      const layerStartTime = startTime + (layer.at || 0);
      const layerGain = Math.pow(10, layer.gain / 20);

      if (layer.type === 'tone' && layer.freq) {
        const osc = ctx.createOscillator();
        const toneGainNode = ctx.createGain();
        osc.type = 'sine';

        // Frequency slide (e.g., 560 -> 380 Hz)
        osc.frequency.setValueAtTime(layer.freq.from, layerStartTime);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, layer.freq.to),
          layerStartTime + layer.freq.time
        );

        // Envelope (Attack & Decay)
        const attackEnd = layerStartTime + layer.env.attack;
        const decayEnd = attackEnd + layer.env.decay;

        toneGainNode.gain.setValueAtTime(0.0001, layerStartTime);
        toneGainNode.gain.linearRampToValueAtTime(layerGain, attackEnd);
        toneGainNode.gain.exponentialRampToValueAtTime(0.0001, decayEnd);

        osc.connect(toneGainNode);
        toneGainNode.connect(masterFilter);

        osc.start(layerStartTime);
        osc.stop(decayEnd + 0.01);
      } else if (layer.type === 'noise') {
        // Synthesize Pink Noise buffer (duration ~30ms)
        const bufferSize = Math.floor(ctx.sampleRate * 0.035);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const channelData = noiseBuffer.getChannelData(0);

        // Paul Kellet's Pink Noise Filter Approximation
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          channelData[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseGainNode = ctx.createGain();
        const attackEnd = layerStartTime + layer.env.attack;
        const decayEnd = attackEnd + layer.env.decay;

        noiseGainNode.gain.setValueAtTime(0.0001, layerStartTime);
        noiseGainNode.gain.linearRampToValueAtTime(layerGain, attackEnd);
        noiseGainNode.gain.exponentialRampToValueAtTime(0.0001, decayEnd);

        let lastNode: AudioNode = noiseSource;

        // Apply Layer Biquad Filters (bandpass + lowpass)
        if (layer.filter) {
          for (const filt of layer.filter) {
            const bq = ctx.createBiquadFilter();
            bq.type = filt.type;
            bq.frequency.setValueAtTime(filt.freq, layerStartTime);
            if (filt.q) bq.Q.setValueAtTime(filt.q, layerStartTime);
            lastNode.connect(bq);
            lastNode = bq;
          }
        }

        lastNode.connect(noiseGainNode);
        noiseGainNode.connect(masterFilter);

        noiseSource.start(layerStartTime);
        noiseSource.stop(decayEnd + 0.01);
      }
    }
  } catch {
    // Graceful fallback if audio is blocked by browser policy
  }
}

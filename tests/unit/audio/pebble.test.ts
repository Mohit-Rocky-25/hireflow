import { describe, it, expect } from 'vitest';
import pebble, { playPebble, isMuted, setMuted, toggleMute } from '../../../src/lib/audio/pebble';

describe('Pebble Audio & Sound Synth Invariant Suite', () => {
  it('strictly validates the pebble sound profile schema and values', () => {
    expect(pebble.duration).toBe(0.16);
    expect(pebble.seed).toBe(11);
    expect(pebble.loudness).toBe(-18);
    expect(pebble.lowpass).toBe(7000);
    expect(pebble.reverb).toEqual({ mix: 0.08, decay: 0.3, predelay: 0.01, damp: 5000 });

    expect(pebble.layers.length).toBe(3);

    // Layer 1: Primary tone slide
    const layer1 = pebble.layers[0];
    expect(layer1.type).toBe('tone');
    expect(layer1.freq).toEqual({ from: 560, to: 380, time: 0.028, curve: 3 });
    expect(layer1.gain).toBe(0);
    expect(layer1.env).toEqual({ attack: 0.0015, decay: 0.075, curve: 6 });

    // Layer 2: Harmonic tone chime
    const layer2 = pebble.layers[1];
    expect(layer2.type).toBe('tone');
    expect(layer2.freq).toEqual({ from: 1120, to: 820, time: 0.02, curve: 3 });
    expect(layer2.gain).toBe(-19);
    expect(layer2.env).toEqual({ attack: 0.0015, decay: 0.03, curve: 6 });

    // Layer 3: Pink noise punch
    const layer3 = pebble.layers[2];
    expect(layer3.type).toBe('noise');
    expect(layer3.color).toBe('pink');
    expect(layer3.gain).toBe(-21);
    expect(layer3.punch).toBe(true);
    expect(layer3.filter?.length).toBe(2);
    expect(layer3.env).toEqual({ attack: 0.001, decay: 0.007, curve: 6 });
  });

  it('safely calls playPebble in non-browser/test environments without throwing', () => {
    expect(() => playPebble()).not.toThrow();
    expect(() => playPebble(pebble, 0.5)).not.toThrow();
  });

  it('manages mute and unmute toggles deterministically', () => {
    setMuted(false);
    expect(isMuted()).toBe(false);

    expect(toggleMute()).toBe(true);
    expect(isMuted()).toBe(true);

    expect(toggleMute()).toBe(false);
    expect(isMuted()).toBe(false);
  });
});

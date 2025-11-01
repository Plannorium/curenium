import * as Tone from 'tone';

/**
 * SoundManager for Curenium
 * A centralized class to manage and play all UI sounds.
 * It creates a single master channel with reverb and a compressor
 * to ensure all sounds are cohesive and volume-normalized.
 */
class SoundManager {
  private masterReverb: Tone.Reverb | null = null;
  private masterCompressor: Tone.Compressor | null = null;
  private isInitialized = false;

  constructor() {
    // The constructor is kept empty to prevent server-side execution of Tone.js code.
    // Initialization is deferred to the initAudio method, which is called on the client.
  }

  async initAudio() {
    if (typeof window === 'undefined' || this.isInitialized || Tone.context.state === 'running') {
      return;
    }
    
    await Tone.start();

    this.masterReverb = new Tone.Reverb({
      decay: 0.6,
      preDelay: 0.03,
      wet: 0.2,
    });

    this.masterCompressor = new Tone.Compressor({
      threshold: -18,
      ratio: 4,
      attack: 0.01,
      release: 0.1,
    });

    if (this.masterReverb && this.masterCompressor) {
      this.masterReverb.connect(this.masterCompressor);
      this.masterCompressor.toDestination();
    }
    this.isInitialized = true;
    console.log('Curenium SoundManager Initialized');
  }

  private get masterChannel(): Tone.ToneAudioNode {
    if (!this.isInitialized || !this.masterReverb) {
      // Fallback to direct destination if not initialized.
      return Tone.getDestination();
    }
    return this.masterReverb;
  }

  public play(presetName: string) {
    if (typeof window === 'undefined' || !this.isInitialized) {
      if (typeof window !== 'undefined' && !this.isInitialized) {
        console.warn('SoundManager not initialized. Call initAudio() on a user gesture.');
      }
      return;
    }
    
    const now = Tone.now();

    switch (presetName) {
      case 'messageSent': {
        // A very short, low-pitched, "bloop" sound, similar to WhatsApp.
        const synth = new Tone.MembraneSynth({
          pitchDecay: 0.02,
          octaves: 3,
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('C2', '32n', now);
        setTimeout(() => synth.dispose(), 200);
        break;
      }
      case 'callStart': {
        const synth = new Tone.FMSynth({
          harmonicity: 2,
          modulationIndex: 3,
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
          modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.8 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('C5', '8n', now);
        synth.triggerAttackRelease('G5', '8n', now + 0.15);
        setTimeout(() => synth.dispose(), 1200);
        break;
      }
      case 'callEnd': {
        const synth = new Tone.FMSynth({
          harmonicity: 2,
          modulationIndex: 3,
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
          modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.8 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('G5', '8n', now);
        synth.triggerAttackRelease('C5', '8n', now + 0.15);
        setTimeout(() => synth.dispose(), 1400); // Slightly longer release
        break;
      }
      case 'mute': {
        const synth = new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 2,
          envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('C2', '16n', now);
        setTimeout(() => synth.dispose(), 400);
        break;
      }
      case 'unmute': {
        const synth = new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 4,
          envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('C3', '16n', now);
        setTimeout(() => synth.dispose(), 400);
        break;
      }
      case 'alert': {
        const synth = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.5 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('A4', '8n', now);
        setTimeout(() => synth.dispose(), 900);
        break;
      }
      case 'success': {
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease(['C5', 'E5', 'G5'], '16n', now);
        setTimeout(() => synth.dispose(), 600);
        break;
      }
      case 'error': {
        const synth = new Tone.AMSynth({
          harmonicity: 1.5,
          envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
          modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('G#2', '8n', now);
        setTimeout(() => synth.dispose(), 1000);
        break;
      }
      case 'notification': {
        // A classy, gentle, bell-like chime with a longer decay.
        const synth = new Tone.FMSynth({
          harmonicity: 3.5,
          modulationIndex: 8,
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1.2 },
          modulationEnvelope: { attack: 0.02, decay: 0.1, sustain: 0, release: 1.2 },
        }).connect(this.masterChannel);
        synth.triggerAttackRelease('A5', '4n', now);
        setTimeout(() => synth.dispose(), 1500);
        break;
      }
      default:
        console.error(`Sound preset "${presetName}" not found.`);
    }
  }
}

const soundManager = new SoundManager();

export const initAudio = () => soundManager.initAudio();
export const playSound = (presetName: string) => soundManager.play(presetName);
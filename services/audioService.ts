class AmbientSound {
  private context: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private currentMode: 'water' | 'rain' | 'night' = 'water';

  // Lazy initialization of AudioContext
  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  stopCurrent() {
    if (!this.context) return;
    const ctx = this.context;
    
    // Fade out logic could go here, but for simplicity we disconnect after a short timeout
    // or immediately if we want snappy mode switching.
    this.activeNodes.forEach(node => {
      try {
        if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) { /* ignore */ }
    });
    this.activeNodes = [];
  }

  resumeContext() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // --- Standard Water Flow ---
  playWater() {
    this.stopCurrent();
    this.currentMode = 'water';
    const ctx = this.resumeContext();

    const bufferSize = ctx.sampleRate * 2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; 
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noiseSource.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    noiseSource.start();
    lfo.start();

    this.activeNodes = [noiseSource, filter, masterGain, lfo, lfoGain];
  }

  // --- Rain Mode ---
  playRain() {
    this.stopCurrent();
    this.currentMode = 'rain';
    const ctx = this.resumeContext();

    // Pink Noise for Rain
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; 
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Highpass to remove muddy lows, Lowpass to soften highs
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 200;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 8000;

    const gain = ctx.createGain();
    gain.gain.value = 0.15; // Rain is slightly louder than water flow

    noise.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    this.activeNodes = [noise, hp, lp, gain];
  }

  // --- Night / ASMR Mode ---
  playNight() {
    this.stopCurrent();
    this.currentMode = 'night';
    const ctx = this.resumeContext();

    // Deep Drone (Brown Noise-ish via filtered oscillators)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 60; // Deep hum

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 110; // Harmonic

    // Binaural beat effect (slight detune)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 62; 

    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    // Gentle LFO for volume swell (breathing)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // Very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.activeNodes = [osc1, osc2, osc3, gain, lfo, lfoGain];
  }

  playChime(pitch: number = 523.25) { 
    if (!this.context || this.context.state === 'suspended') this.resumeContext();
    const t = this.context!.currentTime;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(pitch, t);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05); 
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4);

    osc.connect(gain);
    gain.connect(this.context!.destination);
    
    osc.start(t);
    osc.stop(t + 4);
  }

  playBoop() {
    if (!this.context || this.context.state === 'suspended') this.resumeContext();
    const t = this.context!.currentTime;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.context!.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playHover() {
    if (!this.context || this.context.state === 'suspended') this.resumeContext();
    const t = this.context!.currentTime;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();

    // Very gentle, higher pitch small blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.05); // Quiet
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.context!.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playWaterPour() {
    if (!this.context || this.context.state === 'suspended') this.resumeContext();
    const t = this.context!.currentTime;
    for (let i = 0; i < 5; i++) {
        const osc = this.context!.createOscillator();
        const gain = this.context!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 + Math.random() * 500, t + (i * 0.1));
        osc.frequency.linearRampToValueAtTime(osc.frequency.value + 200, t + (i * 0.1) + 0.1);
        gain.gain.setValueAtTime(0, t + (i * 0.1));
        gain.gain.linearRampToValueAtTime(0.3, t + (i * 0.1) + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (i * 0.1) + 0.2);
        osc.connect(gain);
        gain.connect(this.context!.destination);
        osc.start(t + (i * 0.1));
        osc.stop(t + (i * 0.1) + 0.25);
    }
  }
}

export const ambientSound = new AmbientSound();
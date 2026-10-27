// ═══════════════════════════════════════════════════════════
// TradeNova SN — Institutional Web Audio Sound Engine
// Zero external files | Real-time synthesized acoustic tones
// ═══════════════════════════════════════════════════════════

const SoundEngine = {
  enabled: localStorage.getItem('tradenova_sound') !== 'false',
  ctx: null,

  init() {
    // Lazy initialize on first user gesture
    window.addEventListener('click', () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    }, { once: true });
    this.updateUI();
  },

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('tradenova_sound', this.enabled);
    this.updateUI();
    if (this.enabled) this.playSuccess();
  },

  updateUI() {
    const el = document.getElementById('soundToggleBtn');
    if (el) {
      el.className = 'top-btn ' + (this.enabled ? 'active' : 'muted');
      el.innerHTML = this.enabled ? `${Icons.volume(14)} Sound ON` : `${Icons.volumeMute(14)} Muted`;
    }
  },

  playSuccess() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  },

  playSquareOff() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  },

  playAlert() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(783.99, now); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.1); // C6

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }
};

window.SoundEngine = SoundEngine;

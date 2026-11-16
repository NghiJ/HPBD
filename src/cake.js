// Interactive Cake and Candle Blowing Logic
// Supports both Microphone blow detection (Web Audio API) and manual click fallback
import confetti from 'canvas-confetti';
import { soundEngine } from './audio.js';

export class CakeManager {
  constructor(options = {}) {
    this.onExtinguished = options.onExtinguished || (() => {});
    this.isExtinguished = false;
    this.micStream = null;
    this.micContext = null;
    this.micAnalyser = null;
    this.micRunning = false;
    this.blowThreshold = 35; // Sensitivity threshold for blowing into mic
    this.blowCounter = 0;
    this.blowGoal = 8; // Consecutive positive blow samples
    this.micAnimFrame = null;
    this.candles = [];
    this.totalCandles = 5;

    this.initElements();
  }

  initElements() {
    this.cakeContainer = document.getElementById('cake-container');
    this.blowBtn = document.getElementById('btn-blow-manual');
    this.micToggleBtn = document.getElementById('btn-mic-toggle');
    this.micStatusBadge = document.getElementById('mic-status-badge');
    this.blowMeterBar = document.getElementById('blow-meter-fill');
    this.wishBanner = document.getElementById('wish-banner');

    this.renderCake();
    this.bindEvents();
  }

  renderCake() {
    if (!this.cakeContainer) return;

    // Build the 3-tier SVG / CSS luxury birthday cake
    this.cakeContainer.innerHTML = `
      <div class="cake-wrapper">
        <!-- Floating Sparkles around cake -->
        <div class="cake-sparkles" aria-hidden="true">
          <span class="c-sparkle s1">✨</span>
          <span class="c-sparkle s2">🌸</span>
          <span class="c-sparkle s3">⭐</span>
          <span class="c-sparkle s4">💖</span>
          <span class="c-sparkle s5">✨</span>
        </div>

        <!-- Candles Container -->
        <div class="candles-rack" id="candles-rack">
          ${this.createCandlesHTML()}
        </div>

        <!-- 3-Tier Cake Body -->
        <div class="cake-body">
          <!-- Top Tier (Pastel Strawberry Cream) -->
          <div class="tier tier-top">
            <div class="tier-frosting frosting-top"></div>
            <div class="tier-drips">
              <span class="drip d1"></span>
              <span class="drip d2"></span>
              <span class="drip d3"></span>
              <span class="drip d4"></span>
              <span class="drip d5"></span>
            </div>
            <div class="strawberries">
              <span class="berry b1">🍓</span>
              <span class="berry b2">🍓</span>
              <span class="berry b3">🍓</span>
            </div>
            <div class="cake-sprinkles">
              <span class="sprinkle sp1"></span>
              <span class="sprinkle sp2"></span>
              <span class="sprinkle sp3"></span>
              <span class="sprinkle sp4"></span>
              <span class="sprinkle sp5"></span>
            </div>
          </div>

          <!-- Middle Tier (Lavender & Vanilla Cream) -->
          <div class="tier tier-middle">
            <div class="tier-frosting frosting-middle"></div>
            <div class="macarons">
              <span class="macaron m1"></span>
              <span class="macaron m2"></span>
              <span class="macaron m3"></span>
              <span class="macaron m4"></span>
            </div>
            <div class="cream-swirls">
              <span class="swirl sw1"></span>
              <span class="swirl sw2"></span>
              <span class="swirl sw3"></span>
              <span class="swirl sw4"></span>
              <span class="swirl sw5"></span>
            </div>
          </div>

          <!-- Bottom Tier (Champagne Sponge & Golden Pearl Rim) -->
          <div class="tier tier-bottom">
            <div class="tier-frosting frosting-bottom"></div>
            <div class="sugar-pearls">
              <span class="pearl"></span><span class="pearl"></span><span class="pearl"></span>
              <span class="pearl"></span><span class="pearl"></span><span class="pearl"></span>
              <span class="pearl"></span><span class="pearl"></span><span class="pearl"></span>
            </div>
            <div class="ribbon-band"></div>
          </div>

          <!-- Cake Stand / Plate with Scalloped Lace Doily -->
          <div class="cake-doily"></div>
          <div class="cake-plate">
            <div class="plate-shine"></div>
          </div>
          <div class="cake-plate-base"></div>
        </div>
      </div>
    `;

    // Cache candle DOM elements
    this.candles = Array.from(this.cakeContainer.querySelectorAll('.candle'));
    this.candles.forEach((candle, idx) => {
      candle.addEventListener('click', () => {
        if (!this.isExtinguished) {
          this.extinguishSingleCandle(candle);
        }
      });
    });
  }

  createCandlesHTML() {
    const candleColors = ['#ff85a2', '#a29bfe', '#ffeaa7', '#74b9ff', '#fd79a8'];
    let html = '';
    for (let i = 0; i < this.totalCandles; i++) {
      const color = candleColors[i % candleColors.length];
      html += `
        <div class="candle candle-${i + 1}" data-index="${i}" title="Nhấn để thổi nến">
          <div class="flame-container">
            <div class="smoke-wisp"></div>
            <div class="flame">
              <div class="flame-inner"></div>
              <div class="flame-glow"></div>
            </div>
          </div>
          <div class="wick"></div>
          <div class="candle-stick" style="--candle-color: ${color};">
            <div class="candle-stripes"></div>
          </div>
        </div>
      `;
    }
    return html;
  }

  bindEvents() {
    if (this.blowBtn) {
      this.blowBtn.addEventListener('click', () => {
        this.extinguishAll();
      });
    }

    if (this.micToggleBtn) {
      this.micToggleBtn.addEventListener('click', () => {
        this.toggleMicrophone();
      });
    }
  }

  // Extinguish a single candle if tapped directly
  extinguishSingleCandle(candle) {
    if (candle.classList.contains('extinguished')) return;
    candle.classList.add('extinguished');
    soundEngine.playSparkleSound();

    const remaining = this.candles.filter(c => !c.classList.contains('extinguished'));
    if (remaining.length === 0) {
      this.celebrateExtinguish();
    }
  }

  // Blow out all candles at once
  extinguishAll() {
    if (this.isExtinguished) return;
    this.isExtinguished = true;

    this.candles.forEach((candle, index) => {
      setTimeout(() => {
        candle.classList.add('extinguished');
      }, index * 80);
    });

    this.celebrateExtinguish();
  }

  celebrateExtinguish() {
    this.isExtinguished = true;
    this.stopMicrophone();

    // Play celebration sounds
    soundEngine.playExtinguishSound();

    // Trigger high-energy confetti shower
    this.fireCelebrationConfetti();

    // Show Wish Came True Banner
    if (this.wishBanner) {
      this.wishBanner.classList.add('active');
    }

    // Update blow buttons state
    if (this.blowBtn) {
      this.blowBtn.disabled = true;
      this.blowBtn.innerHTML = '✨ Đã Thổi Nến Thành Công!';
    }
    if (this.micToggleBtn) {
      this.micToggleBtn.disabled = true;
      this.micToggleBtn.style.display = 'none';
    }
    if (this.micStatusBadge) {
      this.micStatusBadge.innerHTML = '✨ Nguyện ước đã bay lên trời sao!';
    }

    // Notify listeners (unfolds gallery & letter)
    this.onExtinguished();
  }

  fireCelebrationConfetti() {
    // 1st burst from center
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff85a2', '#a29bfe', '#ffeaa7', '#ff7675', '#fd79a8', '#fdcb6e']
    });

    // 2nd dual cannons from sides
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 70,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#ff85a2', '#e84393', '#fd79a8', '#fab1a0']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 70,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#a29bfe', '#6c5ce7', '#74b9ff', '#ffeaa7']
      });
    }, 250);

    // 3rd star & heart shower
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 120,
        startVelocity: 35,
        decay: 0.92,
        scalar: 1.2,
        origin: { y: 0.5 },
        shapes: ['circle', 'square']
      });
    }, 500);
  }

  // --- Microphone Blow Detection ---
  async toggleMicrophone() {
    if (this.micRunning) {
      this.stopMicrophone();
      return;
    }
    await this.startMicrophone();
  }

  async startMicrophone() {
    if (this.isExtinguished) return;

    try {
      this.updateMicBadge('Đang xin quyền Microphone... 🎙️');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.micContext = new AudioCtx();
      const source = this.micContext.createMediaStreamSource(stream);

      // Lowpass filter to focus on breath/wind noise (100 - 450Hz)
      const filter = this.micContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.micContext.currentTime);

      this.micAnalyser = this.micContext.createAnalyser();
      this.micAnalyser.fftSize = 512;
      this.micAnalyser.smoothingTimeConstant = 0.3;

      source.connect(filter);
      filter.connect(this.micAnalyser);

      this.micRunning = true;
      if (this.micToggleBtn) {
        this.micToggleBtn.classList.add('mic-active');
        this.micToggleBtn.innerHTML = '🎙️ Mic đang nghe... Hãy thổi vào mic! 🌬️';
      }
      this.updateMicBadge('Đang lắng nghe hơi thở của bạn... Hãy thổi mạnh vào mic nhé!');

      this.monitorBlow();
    } catch (err) {
      console.warn('Microphone permission denied or not supported:', err);
      this.updateMicBadge('Không thể mở mic. Hãy nhấn nút "Thổi nến" bên cạnh nha! 💕');
      if (this.micToggleBtn) {
        this.micToggleBtn.style.display = 'none';
      }
    }
  }

  monitorBlow() {
    if (!this.micRunning || !this.micAnalyser) return;

    const bufferLength = this.micAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.micAnalyser.getByteFrequencyData(dataArray);

    // Compute average energy in lower spectrum (blowing noise)
    let sum = 0;
    const sampleBins = Math.min(60, bufferLength);
    for (let i = 0; i < sampleBins; i++) {
      sum += dataArray[i];
    }
    const avgEnergy = sum / sampleBins;

    // Visual feedback in meter bar
    const meterPercent = Math.min(100, (avgEnergy / this.blowThreshold) * 100);
    if (this.blowMeterBar) {
      this.blowMeterBar.style.width = `${meterPercent}%`;
    }

    // Flicker candle flames in response to breath!
    this.flickerWithBreath(meterPercent);

    if (avgEnergy > this.blowThreshold) {
      this.blowCounter++;
      if (this.blowCounter >= this.blowGoal) {
        // Sustained blow detected!
        this.extinguishAll();
        return;
      }
    } else {
      this.blowCounter = Math.max(0, this.blowCounter - 1);
    }

    this.micAnimFrame = requestAnimationFrame(() => this.monitorBlow());
  }

  flickerWithBreath(intensity) {
    if (intensity < 15) return;
    const tilt = (Math.random() - 0.5) * (intensity * 0.4);
    const scale = 1 - (intensity / 150);
    this.candles.forEach(candle => {
      const flame = candle.querySelector('.flame');
      if (flame && !candle.classList.contains('extinguished')) {
        flame.style.transform = `scale(${Math.max(0.4, scale)}) rotate(${tilt}deg)`;
      }
    });
  }

  stopMicrophone() {
    this.micRunning = false;
    if (this.micAnimFrame) {
      cancelAnimationFrame(this.micAnimFrame);
      this.micAnimFrame = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micContext && this.micContext.state !== 'closed') {
      this.micContext.close();
      this.micContext = null;
    }
    if (this.micToggleBtn) {
      this.micToggleBtn.classList.remove('mic-active');
      this.micToggleBtn.innerHTML = '🎤 Bật Mic để thổi nến';
    }
    if (this.blowMeterBar) {
      this.blowMeterBar.style.width = '0%';
    }
  }

  updateMicBadge(msg) {
    if (this.micStatusBadge) {
      this.micStatusBadge.textContent = msg;
    }
  }

  reset() {
    this.isExtinguished = false;
    this.stopMicrophone();
    this.candles.forEach(c => {
      c.classList.remove('extinguished');
      const flame = c.querySelector('.flame');
      if (flame) flame.style.transform = '';
    });
    if (this.wishBanner) {
      this.wishBanner.classList.remove('active');
    }
    if (this.blowBtn) {
      this.blowBtn.disabled = false;
      this.blowBtn.innerHTML = '💨 Nhấn để Thổi nến ngay';
    }
    if (this.micToggleBtn) {
      this.micToggleBtn.disabled = false;
      this.micToggleBtn.style.display = 'inline-flex';
      this.micToggleBtn.innerHTML = '🎤 Bật Mic để thổi nến';
    }
    if (this.micStatusBadge) {
      this.micStatusBadge.textContent = 'Bạn có thể bật mic hoặc bấm nút để thổi nến nhé!';
    }
  }
}

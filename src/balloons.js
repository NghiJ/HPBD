// Interactive Floating Balloon Popping & Mini Compliments Game
import { soundEngine } from './audio.js';
import confetti from 'canvas-confetti';

export class BalloonsManager {
  constructor() {
    this.messages = [
      { text: "Chúc bạn một đời BÌNH AN, tâm hồn luôn tĩnh lặng, an nhiên giữa mọi bão giông! 🕊️🌿", color: "#b8e994" },
      { text: "Chúc bạn mỗi ngày đều ngập tràn niềm VUI VẺ, nụ cười rạng rỡ như ánh ban mai! 🌸✨", color: "#ff8fab" },
      { text: "Chúc bạn luôn MẠNH KHỎE dồi dào, tràn đầy sức sống để chinh phục mọi ước mơ! 💪💖", color: "#ffd166" },
      { text: "Chúc bạn tuổi mới VẠN SỰ NHƯ Ý, bước đến đâu may mắn mỉm cười đến đó! 🍀🎯", color: "#74b9ff" },
      { text: "Chúc bạn luôn được YÊU THƯƠNG và trân quý theo cách ngọt ngào, trọn vẹn nhất! 🎀🌷", color: "#fd79a8" },
      { text: "Luôn tự tin, kiêu hãnh và TỎA SÁNG rực rỡ nhất theo cách riêng của bạn nhé! 👑⭐", color: "#a29bfe" }
    ];

    this.container = null;
    this.modal = null;
    this.modalText = null;
    this.modalClose = null;
    this.poppedCount = 0;

    this.initElements();
  }

  initElements() {
    this.container = document.getElementById('balloons-cluster');
    this.modal = document.getElementById('balloon-surprise-modal');
    this.modalText = document.getElementById('balloon-surprise-text');
    this.modalClose = document.getElementById('balloon-surprise-close');
    this.counterEl = document.getElementById('balloons-counter');
    this.resetBtn = document.getElementById('btn-reset-balloons');

    this.renderBalloons();
    this.bindEvents();
  }

  renderBalloons() {
    if (!this.container) return;
    this.poppedCount = 0;
    this.updateCounter();

    this.container.innerHTML = this.messages.map((item, index) => {
      const delay = (index * 0.4).toFixed(1);
      const swayDuration = (3.5 + Math.random() * 1.5).toFixed(1);
      return `
        <div class="interactive-balloon" data-index="${index}" style="--balloon-color: ${item.color}; --delay: ${delay}s; --sway-time: ${swayDuration}s;">
          <div class="balloon-body">
            <div class="balloon-highlight"></div>
            <span class="balloon-icon">🎈</span>
          </div>
          <div class="balloon-string"></div>
          <span class="balloon-bow">🎀</span>
          <span class="tap-hint">Chạm nha! 💕</span>
        </div>
      `;
    }).join('');

    const balloonEls = this.container.querySelectorAll('.interactive-balloon');
    balloonEls.forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.dataset.index, 10);
        this.popBalloon(b, idx);
      });
    });
  }

  bindEvents() {
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        soundEngine.playSparkleSound();
        this.renderBalloons();
      });
    }
  }

  popBalloon(balloonEl, index) {
    if (balloonEl.classList.contains('popped')) return;

    balloonEl.classList.add('popped');
    this.poppedCount++;
    this.updateCounter();

    soundEngine.playPopSound();

    // Burst mini confetti at balloon coordinates
    const rect = balloonEl.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: [this.messages[index].color, '#ffffff', '#ffd166']
    });

    // Show surprise message modal
    setTimeout(() => {
      this.showSurpriseModal(this.messages[index].text);
    }, 200);

    if (this.poppedCount === this.messages.length) {
      setTimeout(() => {
        soundEngine.playFanfare();
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 }
        });
      }, 1500);
    }
  }

  showSurpriseModal(text) {
    if (this.modal && this.modalText) {
      this.modalText.textContent = text;
      this.modal.classList.add('active');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }

  updateCounter() {
    if (this.counterEl) {
      this.counterEl.textContent = `${this.poppedCount} / ${this.messages.length}`;
    }
  }
}

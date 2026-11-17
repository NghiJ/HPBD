// Birthday Letter & Typewriter Animation Manager
import { soundEngine } from './audio.js';
import confetti from 'canvas-confetti';

export class LetterManager {
  constructor() {
    this.letterTextParagraphs = [
      "Gửi người bạn đặc biệt nhất của ngày 18 tháng 11,",
      "Hôm nay là một ngày thật dịu dàng, ngày mà một người tuyệt vời như bạn xuất hiện trên thế giới này. Giữa muôn vàn những điều bình dị của cuộc sống, nụ cười rạng rỡ và sự ấm áp của bạn luôn là nguồn năng lượng kỳ diệu sưởi ấm trái tim mọi người xung quanh.",
      "Bước sang tuổi mới, chúc bạn luôn dồi dào MẠNH KHỎE, mỗi sáng thức dậy đều tràn đầy năng lượng tươi mới, ăn uống ngon miệng và luôn có những giấc ngủ thật an lành.",
      "Chúc bạn một đời BÌNH AN, tâm hồn luôn an nhiên, dịu êm đi qua mọi thăng trầm cuộc sống. Mong rằng bạn luôn tìm thấy sự thanh thản và bình yên trong từng khoảnh khắc.",
      "Chúc bạn mỗi ngày trôi qua đều ngập tràn niềm VUI VẺ và hạnh phúc ngọt ngào. Mong nụ cười rạng rỡ, đôi mắt trong veo và sự đáng yêu của bạn sẽ luôn tỏa sáng như đóa hoa hướng dương đón nắng!",
      "Dù chặng đường phía trước có ra sao, hãy luôn nhớ rằng bạn xứng đáng được yêu thương, nâng niu và hạnh phúc trọn vẹn nhất. Mọi ước nguyện chân thành bạn gửi vào ngọn nến hôm nay chắc chắn sẽ thành hiện thực!",
      "Chúc mừng sinh nhật 18/11! Chúc bạn tuổi mới: BÌNH AN • MẠNH KHỎE • VUI VẺ nha! ✨🎂💖"
    ];

    this.isOpen = false;
    this.isTyping = false;
    this.typingTimeout = null;
    this.currentPara = 0;
    this.currentChar = 0;

    this.initElements();
  }

  initElements() {
    this.envelope = document.getElementById('letter-envelope');
    this.waxSeal = document.getElementById('wax-seal');
    this.letterPaper = document.getElementById('letter-paper');
    this.letterContent = document.getElementById('letter-typewriter-content');
    this.openHint = document.getElementById('envelope-open-hint');
    this.retypeBtn = document.getElementById('btn-retype-letter');
    this.heartShowerBtn = document.getElementById('btn-heart-shower');
    this.copyWishBtn = document.getElementById('btn-copy-wish');

    this.bindEvents();
  }

  bindEvents() {
    if (this.envelope) {
      this.envelope.addEventListener('click', () => {
        if (!this.isOpen) {
          this.openLetter();
        }
      });
    }

    if (this.retypeBtn) {
      this.retypeBtn.addEventListener('click', () => {
        this.restartTyping();
      });
    }

    if (this.heartShowerBtn) {
      this.heartShowerBtn.addEventListener('click', () => {
        this.showerHearts();
      });
    }

    if (this.copyWishBtn) {
      this.copyWishBtn.addEventListener('click', () => {
        this.copyWishesToClipboard();
      });
    }
  }

  openLetter() {
    if (this.isOpen) return;
    this.isOpen = true;

    soundEngine.playEnvelopeSound();

    if (this.envelope) {
      this.envelope.classList.add('opened');
    }
    if (this.openHint) {
      this.openHint.style.display = 'none';
    }

    // After envelope flap opens, animate paper sliding out and start typewriter
    setTimeout(() => {
      if (this.letterPaper) {
        this.letterPaper.classList.add('extracted');
      }
      this.startTyping();
    }, 700);
  }

  startTyping() {
    if (!this.letterContent) return;
    this.letterContent.innerHTML = '';
    this.currentPara = 0;
    this.currentChar = 0;
    this.isTyping = true;
    this.typeNextCharacter();
  }

  typeNextCharacter() {
    if (!this.isTyping || !this.letterContent) return;

    if (this.currentPara >= this.letterTextParagraphs.length) {
      this.isTyping = false;
      this.onTypingComplete();
      return;
    }

    const currentText = this.letterTextParagraphs[this.currentPara];

    // Ensure container for paragraph exists
    let pElem = this.letterContent.children[this.currentPara];
    if (!pElem) {
      pElem = document.createElement('p');
      pElem.className = 'letter-para';
      if (this.currentPara === 0) pElem.classList.add('letter-greeting');
      if (this.currentPara === this.letterTextParagraphs.length - 1) pElem.classList.add('letter-signoff');
      this.letterContent.appendChild(pElem);
    }

    pElem.textContent = currentText.substring(0, this.currentChar + 1);
    this.currentChar++;

    // Soft keystroke sound every 3-4 chars
    if (this.currentChar % 3 === 0) {
      soundEngine.playTypewriterSound();
    }

    if (this.currentChar < currentText.length) {
      const speed = currentText[this.currentChar - 1] === '.' || currentText[this.currentChar - 1] === '!' ? 240 : 28;
      this.typingTimeout = setTimeout(() => this.typeNextCharacter(), speed);
    } else {
      // Finished this paragraph, move to next after pause
      this.currentPara++;
      this.currentChar = 0;
      this.typingTimeout = setTimeout(() => this.typeNextCharacter(), 380);
    }
  }

  onTypingComplete() {
    const letterActions = document.getElementById('letter-actions');
    if (letterActions) {
      letterActions.classList.add('visible');
    }
    soundEngine.playSparkleSound();
  }

  restartTyping() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.startTyping();
  }

  showerHearts() {
    soundEngine.playSparkleSound();
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#ff85a2', '#ff6b8b', '#ff477e', '#fd79a8'],
      shapes: ['circle']
    });

    // Spawn 15 floating heart elements up the screen
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-ambient-heart';
        heart.textContent = ['💖', '🌸', '✨', '💕', '🌷'][Math.floor(Math.random() * 5)];
        heart.style.left = `${15 + Math.random() * 70}%`;
        heart.style.bottom = '10%';
        heart.style.fontSize = `${20 + Math.random() * 24}px`;
        heart.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 4500);
      }, i * 120);
    }
  }

  copyWishesToClipboard() {
    const fullText = this.letterTextParagraphs.join('\n\n');
    navigator.clipboard.writeText(fullText).then(() => {
      soundEngine.playSparkleSound();
      if (this.copyWishBtn) {
        const originalText = this.copyWishBtn.innerHTML;
        this.copyWishBtn.innerHTML = '✅ Đã Sao Chép Lời Chúc!';
        setTimeout(() => {
          this.copyWishBtn.innerHTML = originalText;
        }, 2500);
      }
    }).catch(() => {
      alert('Đã chọn lời chúc!');
    });
  }

  reset() {
    this.isOpen = false;
    this.isTyping = false;
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.envelope) {
      this.envelope.classList.remove('opened');
    }
    if (this.letterPaper) {
      this.letterPaper.classList.remove('extracted');
    }
    if (this.letterContent) {
      this.letterContent.innerHTML = '';
    }
    if (this.openHint) {
      this.openHint.style.display = 'block';
    }
    const letterActions = document.getElementById('letter-actions');
    if (letterActions) {
      letterActions.classList.remove('visible');
    }
  }
}

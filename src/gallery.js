// Photo Gallery & Polaroid Scrapbook Manager
import { soundEngine } from './audio.js';

export class GalleryManager {
  constructor() {
    this.photos = [
      {
        id: 1,
        src: '/photos/real_1.jpg',
        title: 'Bình An Trong Tâm Hồn 🌿',
        caption: 'Chúc bạn một đời bình an, tâm hồn luôn tĩnh lặng, dịu êm và thảnh thơi đi qua những năm tháng thanh xuân tuyệt đẹp.',
        date: '18 . 11 • Bình An',
        rotation: -2.5,
        tapeColor: '#ffd1dc',
        sticker: '🕊️'
      },
      {
        id: 2,
        src: '/photos/real_2.jpg',
        title: 'Nụ Cười Luôn Vui Vẻ 🌸',
        caption: 'Mong nụ cười tươi tắn của bạn luôn rạng rỡ trên môi, mỗi ngày mới thức dậy đều ngập tràn niềm vui và tiếng cười rộn rã!',
        date: '18 . 11 • Vui Vẻ',
        rotation: 2.5,
        tapeColor: '#e8dff5',
        sticker: '🎀'
      },
      {
        id: 3,
        src: '/photos/real_3.jpg',
        title: 'Mạnh Khỏe & Tràn Đầy Năng Lượng 💪',
        caption: 'Tuổi mới chúc bạn luôn dồi dào sức khỏe, tinh thần dẻo dai, ngủ thật ngon và luôn tràn đầy năng lượng tích cực!',
        date: '18 . 11 • Mạnh Khỏe',
        rotation: -2,
        tapeColor: '#fcf4dd',
        sticker: '💖'
      },
      {
        id: 4,
        src: '/photos/real_4.jpg',
        title: 'Hạnh Phúc Ngọt Ngào 🌷',
        caption: 'Chúc bạn luôn được yêu thương, được nâng niu trân trọng và gặp được những điều dịu dàng, ấm áp nhất trên đời.',
        date: '18 . 11 • Hạnh Phúc',
        rotation: 3,
        tapeColor: '#ddedff',
        sticker: '🍓'
      },
      {
        id: 5,
        src: '/photos/real_5.jpg',
        title: 'Vạn Sự Như Ý & Tỏa Sáng ✨',
        caption: 'Mọi ước mơ bạn ấp ủ, mọi mục tiêu bạn hướng tới đều sẽ thành công rực rỡ và đơm hoa kết trái ngọt lành!',
        date: '18 . 11 • Như Ý',
        rotation: -2.5,
        tapeColor: '#ffd1dc',
        sticker: '⭐'
      },
      {
        id: 6,
        src: '/photos/photo_3.jpg',
        title: 'Tuổi Mới Thật Rực Rỡ 🎂',
        caption: 'Nguyện cho tất cả ước mong chân thành nhất của bạn gửi vào ngọn nến hôm nay đều sẽ hóa thành hiện thực.',
        date: 'Make A Wish 18.11',
        rotation: 2,
        tapeColor: '#e8dff5',
        sticker: '🧸'
      }
    ];

    this.currentIndex = 0;
    this.likes = [99, 120, 88, 105, 118, 92];
    this.initElements();
  }

  initElements() {
    this.grid = document.getElementById('polaroid-grid');
    this.modal = document.getElementById('lightbox-modal');
    this.modalImg = document.getElementById('lightbox-img');
    this.modalTitle = document.getElementById('lightbox-title');
    this.modalCaption = document.getElementById('lightbox-caption');
    this.modalDate = document.getElementById('lightbox-date');
    this.modalHeartBtn = document.getElementById('lightbox-heart-btn');
    this.modalHeartCount = document.getElementById('lightbox-heart-count');
    this.closeBtn = document.getElementById('lightbox-close');
    this.prevBtn = document.getElementById('lightbox-prev');
    this.nextBtn = document.getElementById('lightbox-next');

    this.renderGrid();
    this.bindEvents();
  }

  renderGrid() {
    if (!this.grid) return;

    this.grid.innerHTML = this.photos.map((photo, index) => `
      <div class="polaroid-card" data-index="${index}" style="--rotation: ${photo.rotation}deg; --tape-color: ${photo.tapeColor}">
        <div class="washi-tape"></div>
        <span class="corner-sticker">${photo.sticker}</span>
        <div class="photo-frame">
          <img src="${photo.src}" alt="${photo.title}" loading="lazy" class="polaroid-img" />
          <div class="photo-overlay">
            <span class="zoom-hint">🔍 Chạm để xem to</span>
          </div>
        </div>
        <div class="polaroid-info">
          <p class="polaroid-title">${photo.title}</p>
          <span class="polaroid-date">${photo.date}</span>
        </div>
      </div>
    `).join('');

    // Bind card clicks
    const cards = this.grid.querySelectorAll('.polaroid-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        this.openLightbox(idx);
      });
    });
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigate(-1);
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigate(1);
      });
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeLightbox();
      });
    }

    if (this.modalHeartBtn) {
      this.modalHeartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addLike();
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
  }

  openLightbox(index) {
    this.currentIndex = index;
    this.updateModalContent();
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    soundEngine.playSparkleSound();
  }

  closeLightbox() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  navigate(dir) {
    this.currentIndex = (this.currentIndex + dir + this.photos.length) % this.photos.length;
    this.updateModalContent();
    soundEngine.playSparkleSound();
  }

  updateModalContent() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    if (this.modalImg) {
      this.modalImg.src = photo.src;
      this.modalImg.alt = photo.title;
    }
    if (this.modalTitle) this.modalTitle.textContent = photo.title;
    if (this.modalCaption) this.modalCaption.textContent = photo.caption;
    if (this.modalDate) this.modalDate.textContent = photo.date;
    if (this.modalHeartCount) {
      this.modalHeartCount.textContent = this.likes[this.currentIndex];
    }
  }

  addLike() {
    this.likes[this.currentIndex]++;
    if (this.modalHeartCount) {
      this.modalHeartCount.textContent = this.likes[this.currentIndex];
    }
    soundEngine.playSparkleSound();

    if (this.modalHeartBtn) {
      this.modalHeartBtn.classList.add('heart-bump');
      setTimeout(() => this.modalHeartBtn.classList.remove('heart-bump'), 300);

      const heart = document.createElement('span');
      heart.className = 'floating-mini-heart';
      heart.textContent = '💖';
      this.modalHeartBtn.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }
  }
}

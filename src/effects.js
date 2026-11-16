// Ambient visual effects: Falling flower petals, sparkling cursor trail, floating hearts
export class AmbientEffects {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initCanvas();
    this.initCursorSparkles();
  }

  initCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => this.resize());

    // Create 35 ambient floating petals and hearts
    const items = ['🌸', '✨', '💖', '🌷', '🤍', '⭐'];
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        symbol: items[Math.floor(Math.random() * items.length)],
        size: 14 + Math.random() * 16,
        speedY: 0.4 + Math.random() * 0.7,
        speedX: (Math.random() - 0.5) * 0.6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        opacity: 0.3 + Math.random() * 0.5
      });
    }

    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.5 + p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y > this.height + 40) {
        p.y = -30;
        p.x = Math.random() * this.width;
      }
      if (p.x < -40) p.x = this.width + 30;
      if (p.x > this.width + 40) p.x = -30;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.font = `${p.size}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.symbol, 0, 0);
      this.ctx.restore();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  initCursorSparkles() {
    // Only on pointer devices with fine pointer (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let lastSparkleTime = 0;
    const sparkleSymbols = ['✨', '✧', '★', '💖'];

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime < 60) return; // Throttle
      lastSparkleTime = now;

      const sparkle = document.createElement('span');
      sparkle.className = 'cursor-trail-sparkle';
      sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
      sparkle.style.left = `${e.clientX + (Math.random() - 0.5) * 16}px`;
      sparkle.style.top = `${e.clientY + (Math.random() - 0.5) * 16}px`;
      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 700);
    });
  }
}

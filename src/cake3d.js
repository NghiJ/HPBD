// Full 3D Interactive Birthday Cake built with Three.js
// Features: Real-time 3D lighting, 360-degree drag rotation, realistic candle flames,
// dynamic flickering firelights, interactive raycasting, smoke particle emission, and microphone blow detection.

import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundEngine } from './audio.js';

export class Cake3DManager {
  constructor(options = {}) {
    this.container = document.getElementById('cake-container');
    this.onExtinguished = options.onExtinguished || (() => {});
    this.isExtinguished = false;

    // Three.js Core Components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cakeGroup = null;
    this.animId = null;

    // Candle and Flame objects
    this.candles = [];
    this.flameMeshes = [];
    this.candleLights = [];
    this.smokeParticles = [];

    // Interaction state
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = 0;
    this.autoRotateSpeed = 0.004;

    // Microphone Blow Detection
    this.micStream = null;
    this.micContext = null;
    this.micAnalyser = null;
    this.micRunning = false;
    this.blowThreshold = 35;
    this.blowCounter = 0;
    this.blowGoal = 8;
    this.breathIntensity = 0;

    // DOM UI Elements
    this.blowBtn = document.getElementById('btn-blow-manual');
    this.micToggleBtn = document.getElementById('btn-mic-toggle');
    this.micStatusBadge = document.getElementById('mic-status-badge');
    this.blowMeterBar = document.getElementById('blow-meter-fill');
    this.wishBanner = document.getElementById('wish-banner');

    this.init();
  }

  init() {
    if (!this.container) return;

    // Prepare container
    this.container.innerHTML = `
      <div class="cake3d-viewport" id="cake3d-viewport">
        <canvas id="cake3d-canvas"></canvas>
        <div class="cake3d-hint">
          <span>✨ Chạm & kéo xoay 360° để ngắm bánh nhé! 🎂</span>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('cake3d-canvas');
    this.viewport = document.getElementById('cake3d-viewport');

    this.setupScene();
    this.createLights();
    this.createCake();
    this.createCandles();
    this.setupEvents();
    this.animate();
  }

  setupScene() {
    const isMobile = window.innerWidth < 600;
    const width = this.viewport.clientWidth || window.innerWidth;
    const height = isMobile ? 350 : 440;

    this.scene = new THREE.Scene();

    // Soft perspective camera with mobile adaptation
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, isMobile ? 4.5 : 4.2, isMobile ? 10.4 : 9.2);
    this.camera.lookAt(0, 0.4, 0);

    // Renderer with antialias and soft shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Group that holds the entire cake for rotation
    this.cakeGroup = new THREE.Group();
    this.scene.add(this.cakeGroup);
  }

  createLights() {
    // Soft romantic ambient light
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.2);
    this.scene.add(ambientLight);

    // Main studio key light (warm gold/white)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Pink fill light from side
    const fillLight = new THREE.DirectionalLight(0xffb6c1, 0.9);
    fillLight.position.set(-5, 4, 3);
    this.scene.add(fillLight);

    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(0xe8dff5, 0.8);
    rimLight.position.set(0, 5, -6);
    this.scene.add(rimLight);
  }

  createCake() {
    // Materials
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.25,
      metalness: 0.85
    });

    const tierBottomMat = new THREE.MeshStandardMaterial({
      color: 0xfff9f2,
      roughness: 0.35
    });

    const tierMiddleMat = new THREE.MeshStandardMaterial({
      color: 0xf3e8ff,
      roughness: 0.4
    });

    const tierTopMat = new THREE.MeshStandardMaterial({
      color: 0xffb3c6,
      roughness: 0.3
    });

    const strawberryMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      roughness: 0.25,
      metalness: 0.1
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.4
    });

    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2
    });

    // 1. Cake Plate & Pedestal Stand
    const plateGeo = new THREE.CylinderGeometry(3.3, 3.1, 0.18, 48);
    const plate = new THREE.Mesh(plateGeo, plateMaterial);
    plate.position.y = -1.4;
    plate.receiveShadow = true;
    this.cakeGroup.add(plate);

    // Golden rim for plate
    const goldRimGeo = new THREE.TorusGeometry(3.26, 0.05, 16, 48);
    goldRimGeo.rotateX(Math.PI / 2);
    const goldRim = new THREE.Mesh(goldRimGeo, goldMaterial);
    goldRim.position.y = -1.32;
    this.cakeGroup.add(goldRim);

    // Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.3, 36);
    const baseMesh = new THREE.Mesh(baseGeo, plateMaterial);
    baseMesh.position.y = -1.6;
    baseMesh.receiveShadow = true;
    this.cakeGroup.add(baseMesh);

    // 2. Bottom Tier (Champagne Cream Sponge)
    const tier1Geo = new THREE.CylinderGeometry(2.8, 2.8, 1.1, 48);
    const tier1 = new THREE.Mesh(tier1Geo, tierBottomMat);
    tier1.position.y = -0.75;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    this.cakeGroup.add(tier1);

    // Bottom tier pink ribbon band
    const ribbonGeo = new THREE.CylinderGeometry(2.82, 2.82, 0.18, 48);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xff758f, roughness: 0.3 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.y = -1.15;
    this.cakeGroup.add(ribbon);

    // Pearls ring around bottom
    const pearlGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pearlMat = new THREE.MeshStandardMaterial({ color: 0xfff275, metalness: 0.7, roughness: 0.2 });
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.set(Math.cos(angle) * 2.83, -0.25, Math.sin(angle) * 2.83);
      this.cakeGroup.add(pearl);
    }

    // 3. Middle Tier (Lavender Vanilla)
    const tier2Geo = new THREE.CylinderGeometry(2.1, 2.1, 1.0, 48);
    const tier2 = new THREE.Mesh(tier2Geo, tierMiddleMat);
    tier2.position.y = 0.25;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    this.cakeGroup.add(tier2);

    // Macarons on Middle Tier shoulder
    const macaronColors = [0xff8fab, 0xffd166, 0xb8e994, 0x74b9ff, 0xe8dff5];
    const macaronGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const mat = new THREE.MeshStandardMaterial({
        color: macaronColors[i % macaronColors.length],
        roughness: 0.35
      });
      const macaron = new THREE.Mesh(macaronGeo, mat);
      macaron.position.set(Math.cos(angle) * 2.45, -0.15, Math.sin(angle) * 2.45);
      macaron.rotateX(0.2);
      macaron.rotateY(angle);
      this.cakeGroup.add(macaron);
    }

    // Cream dollops on middle tier
    const swirlGeo = new THREE.ConeGeometry(0.12, 0.2, 16);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const swirl = new THREE.Mesh(swirlGeo, creamMat);
      swirl.position.set(Math.cos(angle) * 2.05, 0.75, Math.sin(angle) * 2.05);
      swirl.castShadow = true;
      this.cakeGroup.add(swirl);
    }

    // 4. Top Tier (Strawberry Frosting with soft bevel)
    const tier3Geo = new THREE.CylinderGeometry(1.4, 1.4, 0.9, 48);
    const tier3 = new THREE.Mesh(tier3Geo, tierTopMat);
    tier3.position.y = 1.15;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    this.cakeGroup.add(tier3);

    // Dripping frosting edges
    const dripGeo = new THREE.SphereGeometry(0.1, 12, 12);
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dropHeight = (i % 2 === 0) ? 0.22 : 0.12;
      const drip = new THREE.Mesh(dripGeo, creamMat);
      drip.position.set(Math.cos(angle) * 1.42, 1.5 - dropHeight, Math.sin(angle) * 1.42);
      this.cakeGroup.add(drip);
    }

    // 5. Fresh 3D Strawberries on Top Tier
    const berryGeo = new THREE.ConeGeometry(0.18, 0.32, 16);
    const leafGeo = new THREE.ConeGeometry(0.08, 0.06, 6);
    const berryPositions = [
      { x: 0.75, z: 0.4 },
      { x: -0.75, z: -0.4 },
      { x: 0.4, z: -0.75 },
      { x: -0.4, z: 0.75 }
    ];

    berryPositions.forEach(pos => {
      const berryGroup = new THREE.Group();
      const berry = new THREE.Mesh(berryGeo, strawberryMat);
      berry.rotation.x = Math.PI;
      berry.castShadow = true;
      berryGroup.add(berry);

      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 0.16;
      berryGroup.add(leaf);

      berryGroup.position.set(pos.x, 1.62, pos.z);
      this.cakeGroup.add(berryGroup);
    });

    // 6. Confetti Sprinkles on top
    const sprinkleColors = [0xff5c8a, 0x74b9ff, 0xffd166, 0xb8e994, 0xffffff];
    const sprinkleGeo = new THREE.BoxGeometry(0.04, 0.02, 0.08);
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.15;
      const col = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
      const spMat = new THREE.MeshBasicMaterial({ color: col });
      const sprinkle = new THREE.Mesh(sprinkleGeo, spMat);
      sprinkle.position.set(Math.cos(angle) * radius, 1.61, Math.sin(angle) * radius);
      sprinkle.rotation.y = Math.random() * Math.PI;
      this.cakeGroup.add(sprinkle);
    }
  }

  createCandles() {
    const candleColors = [0xff758f, 0xa29bfe, 0xffd166, 0x74b9ff, 0xfd79a8];
    const candleRadius = 0.08;
    const candleHeight = 0.75;
    const candleGeo = new THREE.CylinderGeometry(candleRadius, candleRadius, candleHeight, 16);
    const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

    // 5 Candle positions (1 center, 4 surrounding)
    const positions = [
      { x: 0, z: 0 },
      { x: 0.55, z: 0 },
      { x: -0.55, z: 0 },
      { x: 0, z: 0.55 },
      { x: 0, z: -0.55 }
    ];

    positions.forEach((pos, idx) => {
      const candleGroup = new THREE.Group();
      candleGroup.position.set(pos.x, 1.6 + candleHeight / 2, pos.z);

      // Striped candle stick
      const candleMat = new THREE.MeshStandardMaterial({
        color: candleColors[idx % candleColors.length],
        roughness: 0.3
      });
      const stick = new THREE.Mesh(candleGeo, candleMat);
      stick.castShadow = true;
      candleGroup.add(stick);

      // Wick
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.y = candleHeight / 2 + 0.05;
      candleGroup.add(wick);

      // 3D Flame Mesh (Double cone with warm gradient)
      const flameGroup = new THREE.Group();
      flameGroup.position.y = candleHeight / 2 + 0.18;

      const flameGeo = new THREE.ConeGeometry(0.09, 0.28, 16);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.95
      });
      const flameOuter = new THREE.Mesh(flameGeo, flameMat);
      flameGroup.add(flameOuter);

      const flameInnerGeo = new THREE.ConeGeometry(0.05, 0.16, 16);
      const flameInnerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const flameInner = new THREE.Mesh(flameInnerGeo, flameInnerMat);
      flameInner.position.y = -0.04;
      flameGroup.add(flameInner);

      candleGroup.add(flameGroup);

      // Dynamic warm PointLight inside each flame casting light on cake!
      const flameLight = new THREE.PointLight(0xff8c00, 1.2, 3.2);
      flameLight.position.copy(flameGroup.position);
      flameLight.castShadow = true;
      candleGroup.add(flameLight);

      this.cakeGroup.add(candleGroup);

      this.candles.push(candleGroup);
      this.flameMeshes.push(flameGroup);
      this.candleLights.push(flameLight);
    });
  }

  setupEvents() {
    // 360-degree Drag Rotation on Canvas
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0
      };
      this.rotationVelocity = 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - this.previousMousePosition.x;

      this.cakeGroup.rotation.y += deltaX * 0.01;
      this.rotationVelocity = deltaX * 0.01;

      this.previousMousePosition = { x: clientX, y: 0 };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    if (this.canvas) {
      this.canvas.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    }

    // Window resize handler
    window.addEventListener('resize', () => {
      if (!this.viewport || !this.renderer || !this.camera) return;
      const isMobile = window.innerWidth < 600;
      const width = this.viewport.clientWidth;
      const height = isMobile ? 350 : 440;
      this.camera.aspect = width / height;
      this.camera.position.set(0, isMobile ? 4.5 : 4.2, isMobile ? 10.4 : 9.2);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Blow Buttons
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

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Smooth inertia and auto-rotation
    if (!this.isDragging) {
      this.rotationVelocity *= 0.94;
      this.cakeGroup.rotation.y += this.autoRotateSpeed + this.rotationVelocity;
    }

    // Flame flicker and breathing physics
    if (!this.isExtinguished) {
      this.flameMeshes.forEach((flame, idx) => {
        const noise = Math.sin(time * 16 + idx * 2.5) * 0.12;
        const windScale = Math.max(0.2, 1 - this.breathIntensity * 0.8);
        const windTilt = (this.breathIntensity * 0.5) + (noise * 0.5);

        flame.scale.set(
          (1 + noise) * windScale,
          (1 - noise * 0.8) * windScale,
          (1 + noise) * windScale
        );
        flame.rotation.z = noise * 0.4 + (this.breathIntensity * 0.4);
        flame.rotation.x = Math.cos(time * 12 + idx) * 0.15;

        // Flicker flame light
        if (this.candleLights[idx]) {
          this.candleLights[idx].intensity = 1.0 + noise * 1.5 - (this.breathIntensity * 0.6);
        }
      });
    }

    // Animate rising smoke particles when extinguished
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.mesh.position.y += p.speedY;
      p.mesh.position.x += p.speedX;
      p.mesh.scale.multiplyScalar(1.025);
      p.mesh.material.opacity *= 0.96;

      if (p.mesh.material.opacity < 0.02) {
        this.cakeGroup.remove(p.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  extinguishAll() {
    if (this.isExtinguished) return;
    this.isExtinguished = true;

    this.stopMicrophone();
    soundEngine.playExtinguishSound();

    // Shrink flames and fade lights
    this.flameMeshes.forEach((flame, idx) => {
      flame.visible = false;
      if (this.candleLights[idx]) {
        this.candleLights[idx].intensity = 0;
      }
      this.spawnSmoke(flame.parent.position);
    });

    // Trigger Confetti Showers
    this.fireCelebrationConfetti();

    // Show Wish Banner
    if (this.wishBanner) {
      this.wishBanner.classList.add('active');
    }

    // Update buttons
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

    // Notify listeners
    this.onExtinguished();
  }

  spawnSmoke(candlePos) {
    const smokeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    for (let i = 0; i < 6; i++) {
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xdcdde1,
        transparent: true,
        opacity: 0.75
      });
      const mesh = new THREE.Mesh(smokeGeo, smokeMat);
      mesh.position.set(
        candlePos.x + (Math.random() - 0.5) * 0.05,
        candlePos.y + 0.45 + i * 0.05,
        candlePos.z + (Math.random() - 0.5) * 0.05
      );
      this.cakeGroup.add(mesh);
      this.smokeParticles.push({
        mesh,
        speedY: 0.018 + Math.random() * 0.015,
        speedX: (Math.random() - 0.5) * 0.008
      });
    }
  }

  fireCelebrationConfetti() {
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff5c8a', '#ff8fab', '#ffd166', '#a29bfe', '#74b9ff']
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 75,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#ff5c8a', '#ff8fab', '#ffe5ec']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 75,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#a29bfe', '#b39ddb', '#ffd166']
      });
    }, 280);
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
      console.warn('Microphone permission denied:', err);
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

    let sum = 0;
    const sampleBins = Math.min(60, bufferLength);
    for (let i = 0; i < sampleBins; i++) {
      sum += dataArray[i];
    }
    const avgEnergy = sum / sampleBins;

    const meterPercent = Math.min(100, (avgEnergy / this.blowThreshold) * 100);
    this.breathIntensity = meterPercent / 100;

    if (this.blowMeterBar) {
      this.blowMeterBar.style.width = `${meterPercent}%`;
    }

    if (avgEnergy > this.blowThreshold) {
      this.blowCounter++;
      if (this.blowCounter >= this.blowGoal) {
        this.extinguishAll();
        return;
      }
    } else {
      this.blowCounter = Math.max(0, this.blowCounter - 1);
    }

    requestAnimationFrame(() => this.monitorBlow());
  }

  stopMicrophone() {
    this.micRunning = false;
    this.breathIntensity = 0;
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

    this.flameMeshes.forEach((flame, idx) => {
      flame.visible = true;
      flame.scale.set(1, 1, 1);
      if (this.candleLights[idx]) {
        this.candleLights[idx].intensity = 1.2;
      }
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

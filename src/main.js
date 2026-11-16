// Main Application Entry Point
import { soundEngine } from './audio.js';
import { CakeManager } from './cake.js';
import { GalleryManager } from './gallery.js';
import { LetterManager } from './letter.js';
import { BalloonsManager } from './balloons.js';
import { AmbientEffects } from './effects.js';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize ambient effects
  const ambient = new AmbientEffects();

  // Initialize Gallery, Letter, Balloons
  const gallery = new GalleryManager();
  const letter = new LetterManager();
  const balloons = new BalloonsManager();

  // Sections that unlock or reveal
  const interactiveSections = document.getElementById('interactive-experience');

  // Initialize Cake
  const cake = new CakeManager({
    onExtinguished: () => {
      // Reveal the rest of the surprise
      if (interactiveSections) {
        interactiveSections.classList.add('unlocked');
      }
      // Smooth scroll gently to gallery after a brief celebration moment
      setTimeout(() => {
        const gallerySec = document.getElementById('gallery-section');
        if (gallerySec) {
          gallerySec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 2600);
    }
  });

  // Background Music Controls
  const musicToggleBtn = document.getElementById('btn-music-toggle');
  const musicStatusText = document.getElementById('music-status-text');
  const volumeSlider = document.getElementById('volume-slider');

  function updateMusicUI(isPlaying) {
    if (musicToggleBtn) {
      if (isPlaying) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.setAttribute('title', 'Tắt nhạc nền');
        if (musicStatusText) musicStatusText.textContent = 'Đang phát nhạc 🎵';
      } else {
        musicToggleBtn.classList.remove('playing');
        musicToggleBtn.setAttribute('title', 'Bật nhạc nền');
        if (musicStatusText) musicStatusText.textContent = 'Bật nhạc 🔇';
      }
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      const isPlaying = soundEngine.toggleMusic();
      updateMusicUI(isPlaying);
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      soundEngine.setVolume(parseFloat(e.target.value));
    });
  }

  // Hero "Open Your Gift" Button
  const openGiftBtn = document.getElementById('btn-open-gift');
  const giftBoxWrapper = document.getElementById('hero-gift-box');

  if (openGiftBtn) {
    openGiftBtn.addEventListener('click', () => {
      soundEngine.init();
      soundEngine.playSparkleSound();

      // Start music automatically on first user interaction
      soundEngine.startMusic();
      updateMusicUI(true);

      // Animate gift box popping open
      if (giftBoxWrapper) {
        giftBoxWrapper.classList.add('opened');
      }

      // Confetti burst
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff85a2', '#a29bfe', '#ffeaa7', '#ff7675']
      });

      // Smooth scroll to the Cake section
      setTimeout(() => {
        const cakeSection = document.getElementById('cake-section');
        if (cakeSection) {
          cakeSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 800);
    });
  }

  // Replay All Button
  const replayBtn = document.getElementById('btn-replay-all');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      soundEngine.playSparkleSound();
      cake.reset();
      letter.reset();
      if (giftBoxWrapper) {
        giftBoxWrapper.classList.remove('opened');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 }
      });
    });
  }
});

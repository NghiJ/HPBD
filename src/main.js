// Main Application Entry Point
import { soundEngine } from './audio.js';
import { Cake3DManager } from './cake3d.js';
import { GalleryManager } from './gallery.js';
import { LetterManager } from './letter.js';
import { AmbientEffects } from './effects.js';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize ambient effects (petals, sparkle trails)
  const ambient = new AmbientEffects();

  // Initialize Gallery, Letter
  const gallery = new GalleryManager();
  const letter = new LetterManager();

  // Sections that unlock or reveal
  const interactiveSections = document.getElementById('interactive-experience');

  // Initialize 3D Interactive Cake
  const cake = new Cake3DManager({
    onExtinguished: () => {
      // Reveal the rest of the surprise smoothly
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
        if (musicStatusText) musicStatusText.innerHTML = 'Đang phát nhạc 🎵<span class="music-wave-bars"><i></i><i></i><i></i></span>';
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
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff5c8a', '#ff8fab', '#ffd166', '#a29bfe', '#74b9ff']
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

  // Modern 3D Parallax Tilt for Polaroid Scrapbook Cards
  setTimeout(() => {
    const cards = document.querySelectorAll('.polaroid-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.04)`;
      });

      card.addEventListener('mouseleave', () => {
        const initialRot = card.style.getPropertyValue('--rotation') || '0deg';
        card.style.transform = `rotate(${initialRot})`;
      });
    });
  }, 400);
});

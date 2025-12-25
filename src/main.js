/**
 * Main Application Entry Point
 * Orchestrates the robotic arm simulation
 */

import './style.css';
import * as THREE from 'three';
import { SceneManager } from './scene-manager.js';
import { IKSolver } from './ik-solver.js';
import { HandTracker, HandLandmarks } from './hand-tracker.js';

class RoboticArmApp {
  constructor() {
    // State
    this.state = {
      target: new THREE.Vector3(10, 10, 0),
      smoothTarget: new THREE.Vector3(10, 10, 0),
      isTracking: false,
      smoothing: 0.1,
      scale: 1.5,
      speed: 0.8
    };

    // Performance tracking
    this.stats = {
      frameCount: 0,
      lastTime: performance.now(),
      fps: 0
    };

    // Initialize components
    this.initUI();
    this.initScene();
    this.initIK();
    this.initHandTracking();
    this.startAnimationLoop();

    // Hide loading screen
    this.hideLoadingScreen();
  }

  initUI() {
    // Get UI elements
    this.ui = {
      cameraToggle: document.getElementById('camera-toggle'),
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),
      fpsCounter: document.getElementById('fps-counter'),

      smoothingSlider: document.getElementById('smoothing-slider'),
      smoothingValue: document.getElementById('smoothing-value'),

      scaleSlider: document.getElementById('scale-slider'),
      scaleValue: document.getElementById('scale-value'),

      speedSlider: document.getElementById('speed-slider'),
      speedValue: document.getElementById('speed-value'),

      posX: document.getElementById('pos-x'),
      posY: document.getElementById('pos-y'),
      posZ: document.getElementById('pos-z')
    };

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Camera toggle
    this.ui.cameraToggle.addEventListener('click', () => {
      this.toggleCamera();
    });

    // Smoothing slider
    this.ui.smoothingSlider.addEventListener('input', (e) => {
      this.state.smoothing = parseFloat(e.target.value);
      this.ui.smoothingValue.textContent = this.state.smoothing.toFixed(2);
    });

    // Scale slider
    this.ui.scaleSlider.addEventListener('input', (e) => {
      this.state.scale = parseFloat(e.target.value);
      this.ui.scaleValue.textContent = this.state.scale.toFixed(1);
    });

    // Speed slider
    this.ui.speedSlider.addEventListener('input', (e) => {
      this.state.speed = parseFloat(e.target.value);
      this.ui.speedValue.textContent = this.state.speed.toFixed(2);
    });
  }

  initScene() {
    const container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(container);
  }

  initIK() {
    this.ikSolver = new IKSolver({
      baseHeight: 4,
      lowerArmLength: 12,
      upperArmLength: 10
    });
  }

  initHandTracking() {
    const videoElement = document.getElementById('webcam');

    this.handTracker = new HandTracker(videoElement, (results) => {
      this.onHandResults(results);
    });
  }

  async toggleCamera() {
    if (!this.state.isTracking) {
      // Start tracking
      try {
        await this.handTracker.start();
        this.state.isTracking = true;

        this.ui.cameraToggle.textContent = '⏹️ Stop Camera';
        this.ui.cameraToggle.classList.add('active');
        this.ui.statusText.textContent = 'Camera Active';
        this.ui.statusDot.classList.add('active');
      } catch (error) {
        console.error('Camera error:', error);
        alert('Failed to start camera. Please ensure camera permissions are granted.');
      }
    } else {
      // Stop tracking
      await this.handTracker.stop();
      this.state.isTracking = false;

      this.ui.cameraToggle.textContent = '🎥 Start Camera Tracking';
      this.ui.cameraToggle.classList.remove('active');
      this.ui.statusText.textContent = 'System Idle';
      this.ui.statusDot.classList.remove('active');
    }
  }

  onHandResults(results) {
    // Update FPS
    this.updateFPS();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Get index finger tip position
      const normalized = HandTracker.getLandmarkPosition(
        landmarks,
        HandLandmarks.INDEX_FINGER_TIP
      );

      if (normalized) {
        // Map to world space
        const worldPos = HandTracker.mapToWorldSpace(normalized, this.state.scale);

        // Update target
        this.state.target.set(worldPos.x, worldPos.y, worldPos.z);

        // Update status
        if (this.state.isTracking) {
          this.ui.statusText.textContent = 'Tracking Hand';
          this.ui.statusDot.classList.add('active');
        }
      }
    } else {
      if (this.state.isTracking) {
        this.ui.statusText.textContent = 'Searching...';
        this.ui.statusDot.classList.remove('active');
      }
    }
  }

  updateFPS() {
    this.stats.frameCount++;
    const now = performance.now();

    if (now - this.stats.lastTime >= 1000) {
      this.stats.fps = this.stats.frameCount;
      this.ui.fpsCounter.textContent = `${this.stats.fps} FPS`;

      this.stats.frameCount = 0;
      this.stats.lastTime = now;
    }
  }

  updateSimulation() {
    // Smooth target transition
    const smoothingFactor = this.state.smoothing * this.state.speed;
    this.state.smoothTarget.lerp(this.state.target, smoothingFactor);

    // Update UI stats
    this.ui.posX.textContent = this.state.smoothTarget.x.toFixed(1);
    this.ui.posY.textContent = this.state.smoothTarget.y.toFixed(1);
    this.ui.posZ.textContent = this.state.smoothTarget.z.toFixed(1);

    // Solve IK
    const angles = this.ikSolver.solve(this.state.smoothTarget);

    // Update arm
    this.sceneManager.updateArmAngles(angles);

    // Update target marker
    this.sceneManager.updateTargetMarker(this.state.smoothTarget);
  }

  startAnimationLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      this.updateSimulation();
      this.sceneManager.render();
    };

    animate();
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 1000);
    }
  }

  dispose() {
    if (this.handTracker) {
      this.handTracker.dispose();
    }
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.roboticArmApp = new RoboticArmApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.roboticArmApp) {
    window.roboticArmApp.dispose();
  }
});

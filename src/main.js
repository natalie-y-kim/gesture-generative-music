import { initCamera } from './camera.js';
import { initHandTracker } from './handTracker.js';
import { initGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { initMarkovEngine } from './markovEngine.js';
import { initScheduler } from './scheduler.js';
import { initAudioEngine, startAudioEngine } from './audioEngine.js';
import { initVisuals, renderVisuals } from './visuals.js';

// Shared app state. Keep this small and explicit while the project shape settles.
export const appState = {
  isAudioStarted: false,
  gestureFeatures: {
    leftHand: null,
    rightHand: null,
    handDistance: 0,
    handSpeed: 0,
    openness: 0,
  },
  musicParameters: {
    tempo: 96,
    volume: 0.4,
    density: 0.25,
    pitchRange: [48, 72],
    timbre: 0.5,
  },
  markov: {
    currentState: 'idle',
    nextEvent: null,
  },
  debug: {
    cameraReady: false,
    trackerReady: false,
    schedulerReady: false,
  },
};

const elements = {
  startAudioButton: document.querySelector('#start-audio'),
  audioStatus: document.querySelector('#audio-status'),
  debugOutput: document.querySelector('#debug-output'),
};

function initApp() {
  initCamera(appState);
  initHandTracker(appState);
  initGestureFeatures(appState);
  initMarkovEngine(appState);
  initScheduler(appState);
  initAudioEngine(appState);
  initVisuals(appState);

  elements.startAudioButton.addEventListener('click', handleStartAudio);
  updateDebugPanel();
  renderVisuals(appState);
}

async function handleStartAudio() {
  await startAudioEngine(appState);
  appState.isAudioStarted = true;
  elements.audioStatus.textContent = 'Audio engine started';
  elements.startAudioButton.disabled = true;

  // Placeholder data flow until camera, tracking, and Markov logic are implemented.
  mapGesturesToMusic(appState);
  updateDebugPanel();
  renderVisuals(appState);
}

function updateDebugPanel() {
  elements.debugOutput.textContent = JSON.stringify(appState, null, 2);
}

initApp();

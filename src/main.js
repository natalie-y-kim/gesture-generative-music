import { initCamera, startCamera } from './camera.js';
import { initHandTracker } from './handTracker.js';
import { initGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { initMarkovEngine } from './markovEngine.js';
import { initScheduler, startTrackingLoop } from './scheduler.js';
import { initAudioEngine, startAudioEngine, playTestTone } from './audioEngine.js';
import { initVisuals, renderVisuals } from './visuals.js';

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

async function initApp() {
  initCamera(appState);
  await initHandTracker(appState);
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
  await startCamera();
  await startAudioEngine(appState);
  appState.isAudioStarted = true;
  elements.audioStatus.textContent = 'Audio engine started';
  elements.startAudioButton.disabled = true;

  playTestTone();
  startTrackingLoop(appState, updateDebugPanel);

  mapGesturesToMusic(appState);
  updateDebugPanel();
  renderVisuals(appState);
}

function updateDebugPanel() {
  elements.debugOutput.textContent = JSON.stringify(appState, null, 2);
}

initApp();
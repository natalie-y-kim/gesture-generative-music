import { initCamera, startCamera, stopCamera } from './camera.js';
import { initHandTracker } from './handTracker.js';
import { initGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { initMarkovEngine } from './markovEngine.js';
import { initScheduler, startTrackingLoop, stopTrackingLoop } from './scheduler.js';
import { initAudioEngine, startAudioEngine, stopAudioEngine, playTestTone } from './audioEngine.js';
import { initVisuals, renderVisuals } from './visuals.js';

export const appState = {
  isAudioStarted: false,
  gestureFeatures: {
    leftHand: null,
    rightHand: null,
    handDistance: 0,
    handSpeed: 0,
    openness: 0,
    temperature: 0.5,
    rightHandSpeed: 0,
    rightWristPrevious: null,
    rightWristVelocity: null,
  },
  hands: {
    leftHand: null,
    rightHand: null,
  },
  tracking: {
    leftHand: false,
    rightHand: false,
    missedFrames: 0,
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
  videoFrame: document.querySelector('.video-frame'),
  debugOutput: document.querySelector('#debug-output'),
  controlRows: document.querySelectorAll('.control-row'),
  pitchMeter: document.querySelector('#pitch-meter'),
  pitchValue: document.querySelector('#pitch-value'),
  volumeMeter: document.querySelector('#volume-meter'),
  volumeValue: document.querySelector('#volume-value'),
  densityMeter: document.querySelector('#density-meter'),
  densityValue: document.querySelector('#density-value'),
  reverbMeter: document.querySelector('#reverb-meter'),
  reverbValue: document.querySelector('#reverb-value'),
  variationMeter: document.querySelector('#variation-meter'),
  variationValue: document.querySelector('#variation-value'),
  trackingEmptyState: document.querySelector('#tracking-empty-state'),
};

async function initApp() {
  initCamera(appState);
  await initHandTracker(appState);
  initGestureFeatures(appState);
  initMarkovEngine(appState);
  initScheduler(appState);
  initAudioEngine(appState);
  initVisuals(appState);

  elements.startAudioButton.addEventListener('click', handleAudioButtonClick);
  setTransportState('idle');
  updateDebugPanel();
  updateControlPanel(appState);
  renderVisuals(appState);
}

async function handleAudioButtonClick() {
  elements.startAudioButton.disabled = true;

  try {
    if (appState.isAudioStarted) {
      await handleStopAudio();
    } else {
      await handleStartAudio();
    }
  } catch (error) {
    console.error(error);
    setTransportState('error');
  } finally {
    elements.startAudioButton.disabled = false;
  }
}

async function handleStartAudio() {
  await startCamera();
  await startAudioEngine(appState);
  appState.isAudioStarted = true;
  setTransportState('active');

  playTestTone();
  startTrackingLoop(appState, handleTrackingUpdate);

  mapGesturesToMusic(appState);
  updateDebugPanel();
  updateControlPanel(appState);
  renderVisuals(appState);
}

async function handleStopAudio() {
  stopTrackingLoop();
  await stopAudioEngine(appState);
  stopCamera();
  resetTrackingState();

  setTransportState('idle');

  updateDebugPanel();
  updateControlPanel(appState);
  renderVisuals(appState);
}

function setTransportState(stateName) {
  const isActive = stateName === 'active';
  const isError = stateName === 'error';

  elements.startAudioButton.textContent = isActive ? 'Stop Audio' : 'Start Audio';
  elements.startAudioButton.classList.toggle('is-active', isActive);
  elements.audioStatus.classList.toggle('is-active', isActive);
  elements.audioStatus.classList.toggle('is-error', isError);
  elements.videoFrame?.classList.toggle('is-active', isActive);

  if (isActive) {
    elements.audioStatus.textContent = 'Listening for gestures';
  } else if (isError) {
    elements.audioStatus.textContent = 'Audio could not start';
  } else {
    elements.audioStatus.textContent = 'Audio stopped';
  }
}

function resetTrackingState() {
  appState.hands = {
    leftHand: null,
    rightHand: null,
  };
  appState.tracking = {
    leftHand: false,
    rightHand: false,
    missedFrames: 0,
  };
  appState.gestureFeatures.rightWristPrevious = null;
  appState.gestureFeatures.rightWristVelocity = null;
}

function updateDebugPanel() {
  elements.debugOutput.textContent = JSON.stringify(appState, null, 2);
}

function handleTrackingUpdate(state) {
  updateDebugPanel();
  updateControlPanel(state);
  renderVisuals(state);
}

function updateControlPanel(state) {
  const { musicParameters, hands } = state;
  const hasTrackedHand = Boolean(state.tracking?.leftHand || state.tracking?.rightHand);
  const pitchCenter = (musicParameters.pitchRange[0] + musicParameters.pitchRange[1]) / 2;
  const reverbAmount = musicParameters.reverbAmount ?? 0;
  const variation = musicParameters.markovOpenness ?? 0;

  setMeter(elements.pitchMeter, pitchCenter);
  setMeter(elements.volumeMeter, musicParameters.volume);
  setMeter(elements.densityMeter, musicParameters.density);
  setMeter(elements.reverbMeter, reverbAmount);
  setMeter(elements.variationMeter, variation);

  elements.pitchValue.textContent = `${Math.round(pitchCenter)} midi`;
  elements.volumeValue.textContent = `${Math.round(musicParameters.volume * 100)}%`;
  elements.densityValue.textContent = `${musicParameters.density.toFixed(1)}x`;
  elements.reverbValue.textContent = `${Math.round(reverbAmount * 100)}%`;
  elements.variationValue.textContent = `${Math.round(variation * 100)}%`;

  setControlActive('pitch', Boolean(hands.leftHand));
  setControlActive('volume', Boolean(hands.rightHand));
  setControlActive('density', Boolean(hands.rightHand));
  setControlActive('reverb', Boolean(hands.leftHand && hands.rightHand));
  setControlActive('variation', Boolean(hands.leftHand));

  if (elements.trackingEmptyState) {
    elements.trackingEmptyState.hidden = !state.isAudioStarted || hasTrackedHand;
  }
}

function setMeter(meter, value) {
  if (!meter) return;
  meter.value = Number.isFinite(value) ? value : 0;
}

function setControlActive(controlName, isActive) {
  const row = [...elements.controlRows].find((element) => element.dataset.control === controlName);
  if (!row) return;
  row.classList.toggle('is-active', isActive);
}

initApp();

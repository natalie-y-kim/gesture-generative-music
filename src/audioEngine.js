import { getNextMarkovEvent } from './markovEngine.js';

let audioContext = null;
let nextNoteTime = 0;
let schedulerTimer = null;

export function initAudioEngine() {
  audioContext = null;
}

export async function startAudioEngine(state) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = audioContext || new AudioContextClass();

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  state.isAudioStarted = true;
  nextNoteTime = audioContext.currentTime;
  startMarkovLoop(state);
  return audioContext;
}

function startMarkovLoop(state) {
  if (schedulerTimer) clearInterval(schedulerTimer);

  schedulerTimer = setInterval(() => {
    // Schedule notes slightly ahead of time for smooth playback.
    while (nextNoteTime < audioContext.currentTime + 0.2) {
      const event = getNextMarkovEvent(state);
      playNote(event.frequency, event.duration, state.musicParameters.volume, nextNoteTime);
      nextNoteTime += event.duration;
    }
  }, 50);
}

function playNote(frequency, duration, volume, startTime) {
  // Main melody voice.
  scheduleOsc(frequency, duration, volume, 'sine', startTime);
  // Bass voice one octave below at lower volume.
  scheduleOsc(frequency / 2, duration, volume * 0.3, 'triangle', startTime);
}

function scheduleOsc(frequency, duration, volume, type, startTime) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function scheduleAudioEvent(event) {
  return event;
}

export function playTestTone() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.value = 440;
  gain.gain.value = 0.2;

  osc.start();
  osc.stop(audioContext.currentTime + 1);
}
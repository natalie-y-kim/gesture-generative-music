import { getNextMarkovEvent } from './markovEngine.js';

let audioContext = null;
let reverbNode = null;
let nextNoteTime = 0;
let schedulerTimer = null;

async function createReverb() {
  const convolver = audioContext.createConvolver();
  const length = audioContext.sampleRate * 2;
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);

  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);

    for (let i = 0; i < length; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }

  convolver.buffer = impulse;
  return convolver;
}

export function initAudioEngine() {
  audioContext = null;
}

export async function startAudioEngine(state) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = !audioContext || audioContext.state === 'closed'
    ? new AudioContextClass()
    : audioContext;

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  reverbNode = await createReverb();
  reverbNode.connect(audioContext.destination);

  state.isAudioStarted = true;
  nextNoteTime = audioContext.currentTime;

  startMarkovLoop(state);

  return audioContext;
}

export async function stopAudioEngine(state) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  if (reverbNode) {
    reverbNode.disconnect();
    reverbNode = null;
  }

  if (audioContext && audioContext.state !== 'closed') {
    await audioContext.close();
  }

  audioContext = null;
  nextNoteTime = 0;
  state.isAudioStarted = false;
}

function startMarkovLoop(state) {
  if (schedulerTimer) clearInterval(schedulerTimer);

  schedulerTimer = setInterval(() => {
    while (nextNoteTime < audioContext.currentTime + 0.2) {
      const event = getNextMarkovEvent(state);

      playNote(
        event.frequency,
        event.duration,
        state.musicParameters.volume,
        nextNoteTime,
        state
      );

      // Right hand speed → note density.
      // Higher density = shorter interval between notes.
      const density = state.musicParameters.density ?? 1;

      nextNoteTime += event.duration / density;
    }
  }, 50);
}

function playNote(frequency, duration, volume, startTime, state) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();

  // Hand distance → reverb amount.
  const reverbAmount = state.musicParameters.reverbAmount ?? 0.3;

  dryGain.gain.value = 1 - reverbAmount;
  wetGain.gain.value = reverbAmount;

  osc.connect(gain);
  gain.connect(dryGain);
  gain.connect(wetGain);

  dryGain.connect(audioContext.destination);
  wetGain.connect(reverbNode);

  osc.type = 'triangle';
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + duration * 1.5
  );

  osc.start(startTime);
  osc.stop(startTime + duration * 1.5);
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

let audioContext = null;

// Audio engine placeholder. The Start Audio button creates/resumes the context
// so future synthesis work starts from a browser-approved user gesture.
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
  return audioContext;
}

export function scheduleAudioEvent(event) {
  // TODO: turn Markov events into Web Audio nodes and envelopes.
  return event;
}

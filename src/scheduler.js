import { detectHands } from './handTracker.js';
import { extractGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { getNextMarkovEvent } from './markovEngine.js';

// Scheduler placeholder. Later this should own the timing loop that connects
// camera frames, hand tracking, gesture mapping, Markov generation, and audio.
export function initScheduler(state) {
  state.debug.schedulerReady = true;
}

export function tick(state) {
  const hands = detectHands();
  extractGestureFeatures(state, hands);
  mapGesturesToMusic(state);
  return getNextMarkovEvent(state);
}

// Markov engine placeholder. Keep the public surface tiny until the musical
// state model is designed.
export function initMarkovEngine(state) {
  state.markov.currentState = 'idle';
  state.markov.nextEvent = null;
}

export function getNextMarkovEvent(state) {
  // TODO: choose the next musical event from transition probabilities.
  return state.markov.nextEvent;
}

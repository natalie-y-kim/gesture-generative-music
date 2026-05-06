// Hand tracking placeholder. MediaPipe or another detector can live behind this
// small interface without changing the rest of the app.
export function initHandTracker(state) {
  state.debug.trackerReady = true;
}

export function detectHands() {
  // TODO: return hand landmark data from the current video frame.
  return {
    leftHand: null,
    rightHand: null,
  };
}

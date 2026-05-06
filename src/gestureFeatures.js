// Gesture feature extraction placeholder. Raw landmarks should be reduced here
// before they are mapped to musical parameters.
export function initGestureFeatures(state) {
  state.gestureFeatures.handDistance = 0;
  state.gestureFeatures.handSpeed = 0;
  state.gestureFeatures.openness = 0;
}

export function extractGestureFeatures(state, hands) {
  // TODO: compute stable features from MediaPipe landmarks.
  state.gestureFeatures.leftHand = hands.leftHand;
  state.gestureFeatures.rightHand = hands.rightHand;

  return state.gestureFeatures;
}

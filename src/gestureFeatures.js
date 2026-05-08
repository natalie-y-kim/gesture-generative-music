// Gesture feature extraction placeholder. Raw landmarks should be reduced here
// before they are mapped to musical parameters.
export function initGestureFeatures(state) {
  state.gestureFeatures.handDistance = 0;
  state.gestureFeatures.handSpeed = 0;
  state.gestureFeatures.openness = 0;
}

export function extractGestureFeatures(state, hands) {
  const left = hands.leftHand;
  const right = hands.rightHand;

  if (left) {
    // Use the wrist y-coordinate to represent vertical hand position (height)
    state.gestureFeatures.leftY = left[0].y;
  }

  if (right) {
    // Estimate hand openness using the distance between thumb tip and index finger tip
    const dx = right[4].x - right[8].x;
    const dy = right[4].y - right[8].y;
    state.gestureFeatures.openness = Math.sqrt(dx * dx + dy * dy);
  }

  return state.gestureFeatures;
}
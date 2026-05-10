let prevLeftWrist = null;

export function initGestureFeatures(state) {
  state.gestureFeatures.handDistance = 0;
  state.gestureFeatures.handSpeed = 0;
  state.gestureFeatures.openness = 0;
}

export function extractGestureFeatures(state, hands) {
  const left = hands.leftHand;
  const right = hands.rightHand;

  if (left) {
    // Left hand vertical position → pitch range.
    state.gestureFeatures.leftY = left[0].y;

    // Left hand openness → Markov temperature.
    // Distance between thumb tip (4) and pinky tip (20).
    const dx = left[4].x - left[20].x;
    const dy = left[4].y - left[20].y;
    state.gestureFeatures.leftOpenness = Math.sqrt(dx * dx + dy * dy);
  }

  if (right) {
    // Right hand openness → volume.
    const dx = right[4].x - right[8].x;
    const dy = right[4].y - right[8].y;
    state.gestureFeatures.openness = Math.sqrt(dx * dx + dy * dy);
  
    // Right hand movement speed → note density.
    // Use wrist movement between frames as a simple speed estimate.
    const wrist = right[0];
    const prev = state.gestureFeatures.rightWristPrevious;
  
    if (prev) {
      const speedDx = wrist.x - prev.x;
      const speedDy = wrist.y - prev.y;
      state.gestureFeatures.rightHandSpeed = Math.sqrt(
        speedDx * speedDx + speedDy * speedDy
      );
      state.gestureFeatures.rightWristVelocity = {
        x: speedDx,
        y: speedDy,
      };
    }
  
    state.gestureFeatures.rightWristPrevious = {
      x: wrist.x,
      y: wrist.y,
    };
  }

  if (left && right) {
    const dx = left[0].x - right[0].x;
    const dy = left[0].y - right[0].y;
    state.gestureFeatures.handDistance = Math.sqrt(dx * dx + dy * dy);
  }

  return state.gestureFeatures;
}

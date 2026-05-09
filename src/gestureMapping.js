export function mapGesturesToMusic(state) {
  const { leftY, leftOpenness, openness, handDistance, rightHandSpeed } = state.gestureFeatures;

  // Left hand vertical position → pitch range.
  if (leftY !== undefined) {
    const low = 52;
    const high = 84;
    const mapped = low + (1 - leftY) * (high - low);
    state.musicParameters.pitchRange = [mapped - 6, mapped + 6];
  }

  // Left hand openness → Markov order control.
  if (leftOpenness !== undefined) {
    state.musicParameters.markovOpenness = Math.min(1, leftOpenness * 4);
  }

  // Right hand openness → volume.
  if (openness !== undefined) {
    state.musicParameters.volume = Math.min(1, openness * 5);
  }

  // Hand distance → reverb amount.
  if (handDistance !== undefined) {
    state.musicParameters.reverbAmount = Math.min(0.8, handDistance * 3);
  }

  // Right hand movement speed → note density.
  if (rightHandSpeed !== undefined) {
    state.musicParameters.density = Math.min(2.5, Math.max(0.6, 0.8 + rightHandSpeed * 20));
  }

  return state.musicParameters;
}
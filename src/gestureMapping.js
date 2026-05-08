// Gesture-to-music mapping placeholder. This is where interaction design choices
// become concrete musical controls.
export function mapGesturesToMusic(state) {
  const { leftY, openness } = state.gestureFeatures;

  if (leftY !== undefined) {
    const low = 40;
    const high = 80;
    const mapped = low + (1 - leftY) * (high - low);

    state.musicParameters.pitchRange = [mapped - 5, mapped + 5];
  }

  if (openness !== undefined) {
    state.musicParameters.volume = Math.min(1, openness * 2);
  }

  return state.musicParameters;
}
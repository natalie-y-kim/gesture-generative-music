import { detectHands } from './handTracker.js';
import { extractGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { getVideoElement } from './camera.js';

export function initScheduler(state) {
  state.debug.schedulerReady = true;
}

export function startTrackingLoop(state, onUpdate) {
  function loop() {
    const video = getVideoElement();
    const hands = detectHands(video);
    if (hands.leftHand || hands.rightHand) {
      state.hands = hands;
    }
    extractGestureFeatures(state, hands);
    mapGesturesToMusic(state);
    if (onUpdate) onUpdate(state);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

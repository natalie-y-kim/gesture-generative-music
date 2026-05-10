import { detectHands } from './handTracker.js';
import { extractGestureFeatures } from './gestureFeatures.js';
import { mapGesturesToMusic } from './gestureMapping.js';
import { getVideoElement } from './camera.js';

const MISSED_FRAME_GRACE = 5;

export function initScheduler(state) {
  state.debug.schedulerReady = true;
}

export function startTrackingLoop(state, onUpdate) {
  function loop() {
    const video = getVideoElement();
    const hands = detectHands(video);
    const hasDetectedHand = Boolean(hands.leftHand || hands.rightHand);

    if (hasDetectedHand) {
      state.hands = hands;
      state.tracking = {
        leftHand: Boolean(hands.leftHand),
        rightHand: Boolean(hands.rightHand),
        missedFrames: 0,
      };
    } else {
      const missedFrames = (state.tracking?.missedFrames ?? 0) + 1;
      const hasRecentHands = Boolean(state.hands.leftHand || state.hands.rightHand);
      const shouldKeepRendering = hasRecentHands && missedFrames <= MISSED_FRAME_GRACE;

      if (!shouldKeepRendering) {
        state.hands = { leftHand: null, rightHand: null };
      }

      state.tracking = {
        leftHand: shouldKeepRendering && Boolean(state.hands.leftHand),
        rightHand: shouldKeepRendering && Boolean(state.hands.rightHand),
        missedFrames,
      };
    }

    extractGestureFeatures(state, hands);
    mapGesturesToMusic(state);
    if (onUpdate) onUpdate(state);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let handLandmarker = null;
let lastVideoTime = -1;

export async function initHandTracker(state) {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
  });

  state.debug.trackerReady = true;
}

export function detectHands(video) {
  if (!handLandmarker || !video || video.currentTime === lastVideoTime) {
    return { leftHand: null, rightHand: null };
  }

  lastVideoTime = video.currentTime;
  const results = handLandmarker.detectForVideo(video, performance.now());

  let leftHand = null;
  let rightHand = null;

  if (results.landmarks && results.handednesses) {
    results.landmarks.forEach((landmarks, i) => {
      const label = results.handednesses[i][0].categoryName;
      // MediaPipe labels are mirrored, so Left = right hand in real life.
      if (label === 'Left') rightHand = landmarks;
      if (label === 'Right') leftHand = landmarks;
    });
  }

  return { leftHand, rightHand };
}
let videoElement = null;

// Camera module placeholder. Later this will request webcam permission and attach
// a MediaStream to the video element.
export function initCamera(state) {
  videoElement = document.querySelector('#webcam-video');
  state.debug.cameraReady = Boolean(videoElement);
}

export async function startCamera() {
  // TODO: request navigator.mediaDevices.getUserMedia and set videoElement.srcObject.
  return videoElement;
}

export function getVideoElement() {
  return videoElement;
}

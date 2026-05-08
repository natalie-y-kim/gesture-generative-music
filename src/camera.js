let videoElement = null;

// Camera module placeholder. Later this will request webcam permission and attach
// a MediaStream to the video element.
export function initCamera(state) {
  videoElement = document.querySelector('#webcam-video');
  state.debug.cameraReady = Boolean(videoElement);
}

export async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  await videoElement.play();

  const placeholder = document.querySelector('.video-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  return videoElement;
}

export function getVideoElement() {
  return videoElement;
}

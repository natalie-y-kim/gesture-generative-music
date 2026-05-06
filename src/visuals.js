let canvas = null;
let context = null;

// Visuals placeholder. This starts with a simple canvas background and can later
// draw hand landmarks, trails, and music-state feedback.
export function initVisuals() {
  canvas = document.querySelector('#visuals-canvas');
  context = canvas?.getContext('2d') || null;
}

export function renderVisuals(state) {
  if (!canvas || !context) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = state.isAudioStarted ? '#1db954' : '#3b82f6';
  context.fillRect(0, canvas.height - 6, canvas.width, 6);
}

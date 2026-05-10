let canvas = null;
let context = null;

const LANDMARK_COLOR = '#ff7a00';
const LANDMARK_RADIUS = 4;
const FINGERTIP_RADIUS = 7;

export function initVisuals() {
  canvas = document.querySelector('#visuals-canvas');
  context = canvas?.getContext('2d') || null;
}

export function renderVisuals(state) {
  if (!canvas || !context) return;

  resizeCanvasToDisplaySize(canvas);

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);

  if (!isAnyHandTracked(state)) return;

  drawHands(context, state.hands, width, height);
  drawControlFeedback(context, state, width, height);
}

function resizeCanvasToDisplaySize(targetCanvas) {
  const rect = targetCanvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * pixelRatio));
  const height = Math.max(1, Math.round(rect.height * pixelRatio));

  if (targetCanvas.width !== width || targetCanvas.height !== height) {
    targetCanvas.width = width;
    targetCanvas.height = height;
  }
}

function isAnyHandTracked(state) {
  return Boolean(state.tracking?.leftHand || state.tracking?.rightHand);
}

function drawControlFeedback(ctx, state, width, height) {
  const leftHand = state.hands?.leftHand;
  const rightHand = state.hands?.rightHand;

  if (leftHand) {
    drawPitchFeedback(ctx, state, leftHand, width, height);
    drawVariationFeedback(ctx, state, leftHand, width, height);
  }

  if (rightHand) {
    drawVolumeFeedback(ctx, state, rightHand, width, height);
    drawDensityFeedback(ctx, state, rightHand, width, height);
  }

  if (leftHand && rightHand) {
    drawReverbFeedback(ctx, state, leftHand, rightHand, width, height);
  }
}

function drawPitchFeedback(ctx, state, landmarks, width, height) {
  const wrist = toCanvasPoint(landmarks[0], width, height);
  const pitchCenter = (state.musicParameters.pitchRange[0] + state.musicParameters.pitchRange[1]) / 2;
  drawValueBadge(ctx, wrist.x + 16, wrist.y - 18, 'PITCH', getPitchValue(state), '#90ee90');
}

function drawVolumeFeedback(ctx, state, landmarks, width, height) {
  const thumb = toCanvasPoint(landmarks[4], width, height);
  const index = toCanvasPoint(landmarks[8], width, height);
  const center = midpoint(thumb, index);
  const volume = Math.min(1, Math.max(0, state.musicParameters.volume));

  drawMeasuredLine(ctx, thumb, index, '#87cefa', volume);
  drawValueBadge(ctx, center.x + 16, center.y - 18, 'VOLUME', getPercentValue(volume), '#87cefa');
}

function drawDensityFeedback(ctx, state, landmarks, width, height) {
  const wrist = toCanvasPoint(landmarks[0], width, height);
  const velocity = state.gestureFeatures.rightWristVelocity;
  const density = normalize(state.musicParameters.density, 0.6, 2.5);

  if (velocity) {
    const dx = velocity.x * width;
    const dy = velocity.y * height;

    ctx.save();
    ctx.strokeStyle = `rgba(247, 37, 133, ${0.28 + density * 0.52})`;
    ctx.lineWidth = 4 + density * 8;
    ctx.lineCap = 'round';

    for (let index = 1; index <= 3; index += 1) {
      ctx.globalAlpha = (1 - index * 0.22) * (0.4 + density * 0.6);
      ctx.beginPath();
      ctx.moveTo(wrist.x - dx * index * 7, wrist.y - dy * index * 7);
      ctx.lineTo(wrist.x - dx * (index + 1) * 12, wrist.y - dy * (index + 1) * 12);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawValueBadge(ctx, wrist.x + 16, wrist.y + 18, 'DENSITY', getDensityValue(state.musicParameters.density), '#f72585');
}

function drawReverbFeedback(ctx, state, leftHand, rightHand, width, height) {
  const leftWrist = toCanvasPoint(leftHand[0], width, height);
  const rightWrist = toCanvasPoint(rightHand[0], width, height);
  const reverb = normalize(state.musicParameters.reverbAmount ?? 0, 0, 0.8);
  const center = midpoint(leftWrist, rightWrist);

  drawMeasuredLine(ctx, leftWrist, rightWrist, '#f0b429', reverb);
  drawValueBadge(ctx, center.x, center.y - 18, 'REVERB', getPercentValue(state.musicParameters.reverbAmount ?? 0), '#f0b429');
}

function drawVariationFeedback(ctx, state, landmarks, width, height) {
  const thumb = toCanvasPoint(landmarks[4], width, height);
  const pinky = toCanvasPoint(landmarks[20], width, height);
  const center = midpoint(thumb, pinky);
  const variation = Math.min(1, Math.max(0, state.musicParameters.markovOpenness ?? 0));

  drawMeasuredLine(ctx, thumb, pinky, '#ffd166', variation);
  drawValueBadge(ctx, center.x + 16, center.y + 18, 'VARIATION', getPercentValue(variation), '#ffd166');
}

function drawValueBadge(ctx, x, y, label, value, color) {
  const width = Math.max(118, label.length * 9 + value.length * 11 + 24);
  const height = 44;
  const left = Math.max(8, Math.min(ctx.canvas.width - width - 8, x - width / 2));
  const top = Math.max(8, Math.min(ctx.canvas.height - height - 8, y - height / 2));

  ctx.save();
  ctx.shadowColor = hexToRgba(color, 0.42);
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(5, 6, 7, 0.72)';
  roundRect(ctx, left, top, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.78);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = hexToRgba(color, 0.95);
  ctx.font = '800 13px sans-serif';
  ctx.fillText(label, left + 12, top + 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '800 19px sans-serif';
  ctx.fillText(value, left + 12, top + 31);
  ctx.restore();
}

function drawMeasuredLine(ctx, start, end, color, value) {
  const clampedValue = Math.min(1, Math.max(0, value));

  ctx.save();
  ctx.strokeStyle = hexToRgba(color, 0.78);
  ctx.lineWidth = 3 + clampedValue * 8;
  ctx.lineCap = 'round';
  ctx.shadowColor = hexToRgba(color, 0.65);
  ctx.shadowBlur = 14 + clampedValue * 16;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

function drawHands(ctx, hands, width, height) {
  if (!hands) return;

  for (const landmarks of [hands.leftHand, hands.rightHand]) {
    if (landmarks) drawHand(ctx, landmarks, width, height);
  }
}

function drawHand(ctx, landmarks, width, height) {
  drawLandmarks(ctx, landmarks, width, height);
}

function drawLandmarks(ctx, landmarks, width, height) {
  ctx.fillStyle = LANDMARK_COLOR;
  for (const [index, landmark] of landmarks.entries()) {
    const isFingertip = [4, 8, 12, 16, 20].includes(index);

    ctx.beginPath();
    ctx.arc(
      mirrorX(landmark.x, width),
      landmark.y * height,
      isFingertip ? FINGERTIP_RADIUS : LANDMARK_RADIUS,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function toCanvasPoint(landmark, width, height) {
  return {
    x: mirrorX(landmark.x, width),
    y: landmark.y * height,
  };
}

function midpoint(start, end) {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

function normalize(value, min, max) {
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function getPitchValue(state) {
  const { pitchRange } = state.musicParameters;
  const pitchCenter = (pitchRange[0] + pitchRange[1]) / 2;
  return `${Math.round(pitchCenter)} midi`;
}

function getPercentValue(value) {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

function getDensityValue(value) {
  return `${value.toFixed(1)}x`;
}

function roundRect(ctx, x, y, width, height, radius) {
  const boundedRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + boundedRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, boundedRadius);
  ctx.arcTo(x + width, y + height, x, y + height, boundedRadius);
  ctx.arcTo(x, y + height, x, y, boundedRadius);
  ctx.arcTo(x, y, x + width, y, boundedRadius);
  ctx.closePath();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mirrorX(normalizedX, width) {
  return (1 - normalizedX) * width;
}

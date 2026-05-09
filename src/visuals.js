let canvas = null;
let context = null;

const PITCH_ZONE_COLOR = 'rgba(144, 238, 144, 0.22)';
const VOLUME_ZONE_COLOR = 'rgba(135, 206, 250, 0.2)';
const LANDMARK_COLOR = '#ff7a00';
const CONNECTION_COLOR = 'rgba(255, 122, 0, 1)';
const GUIDE_COLOR = 'rgba(255, 255, 255, 0.68)';
const LANDMARK_RADIUS = 4;
const FINGERTIP_RADIUS = 7;
const PITCH_ZONE_WIDTH_RATIO = 0.22;
const VOLUME_ZONE_HEIGHT_RATIO = 0.22;

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];

const FINGER_PATHS = [
  { color: '#ff7a00', points: [0, 1, 2, 3, 4] },
  { color: '#ffd166', points: [0, 5, 6, 7, 8] },
  { color: '#06d6a0', points: [0, 9, 10, 11, 12] },
  { color: '#4cc9f0', points: [0, 13, 14, 15, 16] },
  { color: '#f72585', points: [0, 17, 18, 19, 20] },
];

export function initVisuals() {
  canvas = document.querySelector('#visuals-canvas');
  context = canvas?.getContext('2d') || null;
}

export function renderVisuals(state) {
  if (!canvas || !context) return;

  resizeCanvasToDisplaySize(canvas);

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);

  drawZones(context, width, height);
  drawMusicIndicators(context, state, width, height);
  drawHands(context, state.hands, width, height);
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

function getZoneRects(width, height) {
  const pitchWidth = width * PITCH_ZONE_WIDTH_RATIO;
  const volumeHeight = height * VOLUME_ZONE_HEIGHT_RATIO;

  return {
    leftPitch: { x: 0, y: 0, w: pitchWidth, h: height },
    rightPitch: { x: width - pitchWidth, y: 0, w: pitchWidth, h: height },
    volume: {
      x: pitchWidth,
      y: height - volumeHeight,
      w: width - pitchWidth * 2,
      h: volumeHeight,
    },
  };
}

function drawZones(ctx, width, height) {
}

function drawRotatedLabel(ctx, text, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawMusicIndicators(ctx, state, width, height) {
  const { pitchRange, volume } = state.musicParameters;
  const centerMidi = (pitchRange[0] + pitchRange[1]) / 2;
  const pitchY = midiToY(centerMidi, height);

  const volumeValue = Math.min(1, Math.max(0, volume));
  const volumeWidth = volumeValue * width;

  // Moving pitch guide line.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(0, pitchY);
  ctx.lineTo(width, pitchY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pitch label follows the guide line and stays on the right side.
  ctx.fillStyle = GUIDE_COLOR;
  ctx.font = `${Math.max(14, width * 0.018)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('PITCH', width - 18, pitchY - 14);

  // Volume bar across the full bottom width.
  ctx.fillStyle = 'rgba(29, 185, 84, 0.88)';
  ctx.fillRect(0, height - 8, volumeWidth, 8);

  // Volume label follows the end of the green bar.
  ctx.fillStyle = GUIDE_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const labelX = Math.min(width - 55, Math.max(55, volumeWidth));
  ctx.fillText('VOLUME', labelX, height - 14);
}

function midiToY(midi, height) {
  const low = 36;
  const high = 84;
  const clamped = Math.min(high, Math.max(low, midi));
  return height - ((clamped - low) / (high - low)) * height;
}

function drawHands(ctx, hands, width, height) {
  if (!hands) return;

  for (const landmarks of [hands.leftHand, hands.rightHand]) {
    if (landmarks) drawHand(ctx, landmarks, width, height);
  }
}

function drawHand(ctx, landmarks, width, height) {
  drawPalmSkeleton(ctx, landmarks, width, height);
  drawFingerPaths(ctx, landmarks, width, height);
  drawLandmarks(ctx, landmarks, width, height);
}

function drawPalmSkeleton(ctx, landmarks, width, height) {
  ctx.strokeStyle = CONNECTION_COLOR;
  ctx.lineWidth = 4;

  for (const [start, end] of HAND_CONNECTIONS) {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    if (!startPoint || !endPoint) continue;

    ctx.beginPath();
    ctx.moveTo(mirrorX(startPoint.x, width), startPoint.y * height);
    ctx.lineTo(mirrorX(endPoint.x, width), endPoint.y * height);
    ctx.stroke();
  }
}

function drawFingerPaths(ctx, landmarks, width, height) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;

  for (const finger of FINGER_PATHS) {
    ctx.strokeStyle = finger.color;
    ctx.beginPath();

    for (const [index, landmarkIndex] of finger.points.entries()) {
      const landmark = landmarks[landmarkIndex];
      if (!landmark) continue;

      const x = mirrorX(landmark.x, width);
      const y = landmark.y * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
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

function mirrorX(normalizedX, width) {
  return (1 - normalizedX) * width;
}

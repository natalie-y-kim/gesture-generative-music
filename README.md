# Markov Motion

Markov Motion is a Vite + vanilla JavaScript scaffold for a gesture-controlled generative music system.

The current version is intentionally minimal. It provides the app shell, module boundaries, shared state, a Start Audio button, a webcam video placeholder, a canvas placeholder, and a debug panel. MediaPipe hand tracking and Markov music generation are not implemented yet.

## Project Structure

```text
src/
  main.js
  camera.js
  handTracker.js
  gestureFeatures.js
  gestureMapping.js
  markovEngine.js
  scheduler.js
  audioEngine.js
  visuals.js
  style.css
index.html
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Module Responsibilities

- `src/main.js` defines shared app state, initializes modules, wires UI events, and updates the debug panel.
- `src/camera.js` owns the webcam video element and will later attach a MediaStream.
- `src/handTracker.js` is the hand tracking integration point.
- `src/gestureFeatures.js` reduces raw landmarks into gesture features.
- `src/gestureMapping.js` maps gesture features to music parameters.
- `src/markovEngine.js` will generate musical events from Markov state.
- `src/scheduler.js` will own the main timing/data-flow loop.
- `src/audioEngine.js` creates/resumes the Web Audio context from the Start Audio gesture.
- `src/visuals.js` owns the canvas placeholder for future visual feedback.
- `src/style.css` contains the starter layout and visual styling.

## Next Implementation Steps

1. Add camera startup in `src/camera.js`.
2. Integrate MediaPipe or another hand tracker in `src/handTracker.js`.
3. Compute stable gesture features in `src/gestureFeatures.js`.
4. Design gesture-to-music mappings in `src/gestureMapping.js`.
5. Define the Markov state model in `src/markovEngine.js`.
6. Connect scheduler ticks to audio events in `src/scheduler.js` and `src/audioEngine.js`.

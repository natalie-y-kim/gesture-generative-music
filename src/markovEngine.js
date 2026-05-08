const transitionMatrix = {
  G3: { C4: 0.5, E4: 0.3, A3: 0.2 },
  A3: { C4: 0.4, G3: 0.3, E4: 0.3 },
  C4: { E4: 0.3, G4: 0.3, A4: 0.2, C5: 0.2 },
  E4: { C4: 0.2, G4: 0.3, B4: 0.2, E5: 0.3 },
  G4: { E4: 0.3, A4: 0.3, C5: 0.2, G3: 0.2 },
  A4: { G4: 0.3, E4: 0.2, C5: 0.3, A3: 0.2 },
  B4: { C5: 0.5, G4: 0.3, E4: 0.2 },
  C5: { B4: 0.3, G4: 0.3, E4: 0.2, A4: 0.2 },
  E5: { C5: 0.4, B4: 0.3, G4: 0.3 },
};

const noteMidi = {
  G3: 55,
  A3: 57,
  C4: 60,
  E4: 64,
  G4: 67,
  A4: 69,
  B4: 71,
  C5: 72,
  E5: 76,
};

const durations = [0.25, 0.5, 0.5, 0.75, 1.0];

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function fitMidiToPitchRange(midi, pitchRange) {
  const [low, high] = pitchRange;

  let mappedMidi = midi;

  while (mappedMidi < low) {
    mappedMidi += 12;
  }

  while (mappedMidi > high) {
    mappedMidi -= 12;
  }

  return mappedMidi;
}

export function initMarkovEngine(state) {
  state.markov.currentState = 'C4';
  state.markov.nextEvent = null;
}

export function getNextMarkovEvent(state) {
  const current = state.markov.currentState;
  const transitions = transitionMatrix[current];

  const roll = Math.random();
  let cumulative = 0;
  let nextNote = current;

  for (const [note, prob] of Object.entries(transitions)) {
    cumulative += prob;
    if (roll < cumulative) {
      nextNote = note;
      break;
    }
  }

  const duration = durations[Math.floor(Math.random() * durations.length)];

  const originalMidi = noteMidi[nextNote];
  const mappedMidi = fitMidiToPitchRange(
    originalMidi,
    state.musicParameters.pitchRange
  );

  const frequency = midiToFrequency(mappedMidi);

  state.markov.currentState = nextNote;

  return {
    note: nextNote,
    midi: mappedMidi,
    frequency,
    duration,
  };
}
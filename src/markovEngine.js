const trainingSequence = [
  'C4','C4','G4','G4','A4','A4','G4',
  'F4','F4','E4','E4','D4','D4','C4',
  'G4','G4','F4','F4','E4','E4','D4',
  'G4','G4','F4','F4','E4','E4','D4',
  'C4','C4','G4','G4','A4','A4','G4',
  'F4','F4','E4','E4','D4','D4','C4',
];

const trainingDurations = [
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
  0.5,0.5,0.5,0.5,0.5,0.5,1.0,
];

const noteMidi = {
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  G4: 67,
  A4: 69,
};

function buildMatrix(sequence, order) {
  const matrix = {};

  for (let i = 0; i < sequence.length - order; i++) {
    const key = sequence.slice(i, i + order).join(',');
    const next = sequence[i + order];

    if (!matrix[key]) matrix[key] = {};
    matrix[key][next] = (matrix[key][next] ?? 0) + 1;
  }

  for (const key of Object.keys(matrix)) {
    const total = Object.values(matrix[key]).reduce((a, b) => a + b, 0);

    for (const note of Object.keys(matrix[key])) {
      matrix[key][note] /= total;
    }
  }

  return matrix;
}

const matrices = {
  1: buildMatrix(trainingSequence, 1),
  2: buildMatrix(trainingSequence, 2),
  3: buildMatrix(trainingSequence, 3),
};

let sequenceIndex = 0;

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function fitMidiToPitchRange(midi, pitchRange) {
  const [low, high] = pitchRange;
  let mappedMidi = midi;

  while (mappedMidi < low) mappedMidi += 12;
  while (mappedMidi > high) mappedMidi -= 12;

  return mappedMidi;
}

function chooseMarkovOrder(openness) {
  if (openness < 0.25) return 0; // fully closed: original sequence
  if (openness < 0.5) return 3;  // half closed: most structured
  if (openness < 0.75) return 2; // half open: medium structure
  return 1;                      // fully open: most random
}

function chooseNextNoteFromTransitions(transitions) {
  const roll = Math.random();
  let cumulative = 0;

  for (const [note, probability] of Object.entries(transitions)) {
    cumulative += probability;

    if (roll < cumulative) {
      return note;
    }
  }

  return Object.keys(transitions)[0];
}

export function initMarkovEngine(state) {
  state.markov.currentState = ['C4'];
  state.markov.nextEvent = null;
  sequenceIndex = 0;
}

export function getNextMarkovEvent(state) {
  const openness = state.musicParameters.markovOpenness ?? 0.5;
  const order = chooseMarkovOrder(openness);

  let nextNote;
  let duration;

  if (order === 0) {
    // Fully closed hand: play the original melody in order.
    nextNote = trainingSequence[sequenceIndex % trainingSequence.length];
    duration = trainingDurations[sequenceIndex % trainingDurations.length];
    sequenceIndex++;
  } else {
    // Open hand: generate with the selected Markov order.
    const history = state.markov.currentState;
    let transitions = null;
    let usedOrder = order;

    while (usedOrder >= 1) {
      const key = history.slice(-usedOrder).join(',');

      if (matrices[usedOrder][key]) {
        transitions = matrices[usedOrder][key];
        break;
      }

      usedOrder--;
    }

    if (transitions) {
      nextNote = chooseNextNoteFromTransitions(transitions);
    } else {
      const allNotes = Object.keys(noteMidi);
      nextNote = allNotes[Math.floor(Math.random() * allNotes.length)];
    }

    duration = trainingDurations[sequenceIndex % trainingDurations.length];
    sequenceIndex++;
  }

  state.markov.currentState = [...state.markov.currentState, nextNote].slice(-3);

  const originalMidi = noteMidi[nextNote];
  const mappedMidi = fitMidiToPitchRange(
    originalMidi,
    state.musicParameters.pitchRange
  );
  const frequency = midiToFrequency(mappedMidi);

  return {
    note: nextNote,
    midi: mappedMidi,
    frequency,
    duration,
    order,
  };
}
/**
 * Generador procedural de audio y música con Web Audio API
 * Sintetiza pistas melódicas y acordes en tiempo real y exporta a formato WAV reproducible.
 */

export interface SynthesizedMusicTrack {
  audioUrl: string;
  waveform: number[];
  durationSeconds: number;
}

/**
 * Genera un archivo WAV en memoria sintetizando notas armónicas y ritmo
 */
export function synthesizeTrack(
  genre: string,
  tempoBpm: number = 110,
  durationSeconds: number = 18
): SynthesizedMusicTrack {
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = sampleRate * durationSeconds;

  // Escalas musicales según género
  let scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // Pentatónica mayor C
  if (genre.toLowerCase().includes('lo-fi') || genre.toLowerCase().includes('ambient')) {
    scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Menor melódica suave
  } else if (genre.toLowerCase().includes('cinematic') || genre.toLowerCase().includes('épic')) {
    scale = [196.00, 220.00, 246.94, 261.63, 329.63, 392.00]; // Tonalidad orquestal
  } else if (genre.toLowerCase().includes('synthwave') || genre.toLowerCase().includes('electr')) {
    scale = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66]; // D menor synth
  }

  // Generación de buffers de audio
  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  const beatDuration = 60 / tempoBpm;
  const samplesPerBeat = Math.floor(sampleRate * beatDuration);

  // Sintetizador aditivo polifónico: Pad + Arpegio + Bajo + Pulso rítmico
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentBeat = Math.floor(i / samplesPerBeat);
    const beatPhase = (i % samplesPerBeat) / samplesPerBeat;

    // 1. Armonía ambiental (Pad / Warm Sine chord)
    const rootNote = scale[currentBeat % scale.length];
    const fifthNote = rootNote * 1.5;
    const padEnv = 0.5 + 0.5 * Math.sin((t * Math.PI) / 4);
    const pad = (Math.sin(2 * Math.PI * rootNote * t) * 0.15 +
                 Math.sin(2 * Math.PI * fifthNote * t) * 0.08) * padEnv;

    // 2. Melodía arpegiada sutil con decaimiento percusivo
    const noteIdx = (currentBeat * 2 + Math.floor(beatPhase * 4)) % scale.length;
    const melodyFreq = scale[noteIdx] * 2;
    const noteEnv = Math.exp(-beatPhase * 3.5); // Decay suave
    const melody = Math.sin(2 * Math.PI * melodyFreq * t) * 0.18 * noteEnv;

    // 3. Bajo profundo cálido
    const bassFreq = scale[0] * 0.5;
    const bassEnv = Math.exp(-beatPhase * 1.5);
    const bass = (Math.sin(2 * Math.PI * bassFreq * t) + 
                  0.3 * Math.sin(4 * Math.PI * bassFreq * t)) * 0.2 * bassEnv;

    // 4. Pulso rítmico percusivo (Hi-hat / Shaker sutil con ruido blanco filtrado)
    let percussion = 0;
    if (beatPhase < 0.15) {
      percussion = (Math.random() * 2 - 1) * 0.03 * (1 - beatPhase / 0.15);
    }

    // Mezcla estéreo y limitador suave
    const mixedMono = pad + melody + bass + percussion;
    // Fade in inicial y fade out final de 1 segundo
    let masterEnv = 1;
    if (t < 1.0) masterEnv = t;
    if (t > durationSeconds - 1.5) masterEnv = Math.max(0, (durationSeconds - t) / 1.5);

    leftChannel[i] = Math.tanh(mixedMono * masterEnv * 1.1) * 0.85;
    rightChannel[i] = Math.tanh((pad * 0.9 + melody * 1.1 + bass * 0.95 + percussion * 0.8) * masterEnv) * 0.85;
  }

  // Generar datos de forma de onda (waveform bars) para el reproductor interactivo (40 barras)
  const numBars = 48;
  const samplesPerBar = Math.floor(totalSamples / numBars);
  const waveform: number[] = [];
  for (let b = 0; b < numBars; b++) {
    let sum = 0;
    const start = b * samplesPerBar;
    for (let s = 0; s < samplesPerBar; s += 20) {
      sum += Math.abs(leftChannel[start + s] || 0);
    }
    const avg = sum / (samplesPerBar / 20);
    // Escala normalizada entre 0.15 y 1.0
    waveform.push(Math.min(1.0, Math.max(0.18, avg * 3.2)));
  }

  // Codificar buffer a archivo WAV
  const wavBuffer = encodeWAV(leftChannel, rightChannel, sampleRate);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(blob);

  return {
    audioUrl,
    waveform,
    durationSeconds,
  };
}

/**
 * Función auxiliar para estructurar encabezados y datos PCM 16-bit en formato RIFF WAV
 */
function encodeWAV(leftChannel: Float32Array, rightChannel: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 2;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = leftChannel.length;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Encabezado RIFF
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // Sub-chunk "fmt "
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Tamaño de subchunk
  view.setUint16(20, 1, true);  // PCM lineal
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // Sub-chunk "data"
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Escribir muestras intercaladas L / R
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Canal izquierdo
    const sLeft = Math.max(-1, Math.min(1, leftChannel[i]));
    view.setInt16(offset, sLeft < 0 ? sLeft * 0x8000 : sLeft * 0x7fff, true);
    offset += 2;

    // Canal derecho
    const sRight = Math.max(-1, Math.min(1, rightChannel[i]));
    view.setInt16(offset, sRight < 0 ? sRight * 0x8000 : sRight * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

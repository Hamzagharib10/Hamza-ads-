import { BackgroundMusicId, MasteringPresetId } from "../types/studio";

function encodeWavFromAudioBuffer(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function createNoiseBuffer(ctx: BaseAudioContext, durationSec: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function scheduleProceduralMusic(
  ctx: OfflineAudioContext,
  destination: AudioNode,
  musicId: Exclude<BackgroundMusicId, "none" | "custom">,
  totalDuration: number
): void {
  const musicBus = ctx.createGain();
  musicBus.gain.value = 1;

  // Warm smoothing & vocal pocket cut around 2.2kHz so spoken voice stays clear
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = musicId === "upbeat" ? 4200 : 2500;

  const vocalPocket = ctx.createBiquadFilter();
  vocalPocket.type = "peaking";
  vocalPocket.frequency.value = 2200;
  vocalPocket.Q.value = 1.0;
  vocalPocket.gain.value = -3.5;

  musicBus.connect(lowpass);
  lowpass.connect(vocalPocket);
  vocalPocket.connect(destination);

  const playPadChord = (
    freqs: number[],
    start: number,
    dur: number,
    gainVal: number,
    wave: OscillatorType = "triangle"
  ) => {
    const chordGain = ctx.createGain();
    chordGain.gain.setValueAtTime(0.0001, start);
    chordGain.gain.linearRampToValueAtTime(gainVal, start + Math.min(0.35, dur * 0.25));
    chordGain.gain.setValueAtTime(gainVal, Math.max(start + 0.35, start + dur - 0.35));
    chordGain.gain.linearRampToValueAtTime(0.0001, start + dur);
    chordGain.connect(musicBus);

    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(f, start);
      osc.connect(chordGain);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    }
  };

  const playPluckNote = (
    freq: number,
    start: number,
    dur: number,
    gainVal: number,
    wave: OscillatorType = "triangle"
  ) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gainVal, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    g.connect(musicBus);

    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    osc.connect(g);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  };

  const playKick = (start: number, gainVal: number) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    g.connect(musicBus);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(105, start);
    osc.frequency.exponentialRampToValueAtTime(38, start + 0.18);
    osc.connect(g);
    osc.start(start);
    osc.stop(start + 0.24);
  };

  if (musicId === "cinematic") {
    // Dm -> Bb -> C -> Am dramatic commercial bed
    const chords = [
      [146.83, 174.61, 220.0],
      [116.54, 174.61, 233.08],
      [130.81, 164.81, 196.0],
      [110.0, 164.81, 220.0],
    ];
    const chordDur = 2.0;
    for (let t = 0, idx = 0; t < totalDuration; t += chordDur, idx++) {
      const segDur = Math.min(chordDur, totalDuration - t + 0.2);
      const chord = chords[idx % chords.length];
      playPadChord(chord, t, segDur, 0.14, "triangle");
      playPadChord([chord[0] / 2], t, segDur, 0.18, "sine");
    }
    for (let t = 0; t < totalDuration; t += 1.0) {
      playKick(t, 0.26);
    }
    return;
  }

  if (musicId === "upbeat") {
    // 120 BPM energetic Reels groove: C -> G -> Am -> F
    const progressions = [
      { bass: 65.41, notes: [261.63, 329.63, 392.0, 523.25] },
      { bass: 98.0, notes: [246.94, 293.66, 392.0, 493.88] },
      { bass: 110.0, notes: [261.63, 329.63, 440.0, 523.25] },
      { bass: 87.31, notes: [261.63, 349.23, 440.0, 523.25] },
    ];
    const beatDur = 0.5; // 120 BPM
    const noiseBuf = createNoiseBuffer(ctx, 0.06);
    for (let beat = 0; beat * beatDur < totalDuration; beat++) {
      const t = beat * beatDur;
      const bar = Math.floor(beat / 4) % progressions.length;
      const prog = progressions[bar];

      // Kick on every beat
      playKick(t, 0.24);

      // Bass pulse
      playPluckNote(prog.bass, t, 0.35, 0.18, "triangle");

      // Arpeggio synth notes
      const noteA = prog.notes[beat % prog.notes.length];
      const noteB = prog.notes[(beat + 1) % prog.notes.length];
      playPluckNote(noteA, t, 0.22, 0.09, "triangle");
      if (t + 0.25 < totalDuration) {
        playPluckNote(noteB, t + 0.25, 0.2, 0.075, "sine");

        // Soft off-beat shaker/hat
        const hat = ctx.createBufferSource();
        hat.buffer = noiseBuf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 6000;
        const hg = ctx.createGain();
        hg.gain.setValueAtTime(0.055, t + 0.25);
        hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        hat.connect(hp);
        hp.connect(hg);
        hg.connect(musicBus);
        hat.start(t + 0.25);
      }
    }
    return;
  }

  if (musicId === "corporate") {
    // Warm trusting Cmaj7 -> G6 -> Am7 -> Fmaj7 electric piano + pad
    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [196.0, 246.94, 293.66, 329.63],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
    ];
    const chordDur = 2.0;
    for (let t = 0, idx = 0; t < totalDuration; t += chordDur, idx++) {
      const chord = chords[idx % chords.length];
      const segDur = Math.min(chordDur, totalDuration - t + 0.2);
      playPadChord(chord.slice(0, 3), t, segDur, 0.1, "sine");
      chord.forEach((freq, nIdx) => {
        const noteTime = t + nIdx * 0.25;
        if (noteTime < totalDuration) {
          playPluckNote(freq, noteTime, 1.1, 0.07, "sine");
        }
      });
    }
    return;
  }

  // luxury: Lush ambient Em9 -> Cmaj9 -> D6 -> Bm7
  const luxuryChords = [
    [164.81, 246.94, 293.66, 369.99],
    [130.81, 196.0, 246.94, 293.66],
    [146.83, 220.0, 293.66, 369.99],
    [123.47, 185.0, 220.0, 293.66],
  ];
  const chordDur = 2.5;
  for (let t = 0, idx = 0; t < totalDuration; t += chordDur, idx++) {
    const chord = luxuryChords[idx % luxuryChords.length];
    const segDur = Math.min(chordDur, totalDuration - t + 0.25);
    playPadChord(chord, t, segDur, 0.11, "sine");
    playPluckNote(chord[3] * 2, t + 0.3, 1.6, 0.055, "sine");
    if (t + 1.25 < totalDuration) {
      playPluckNote(chord[2] * 2, t + 1.25, 1.2, 0.045, "sine");
    }
  }
}

export async function renderMusicPreview(params: {
  musicId: BackgroundMusicId;
  musicVolume: number;
  customMusicUrl?: string | null;
}): Promise<{ url: string; durationSec: number }> {
  const duration = 6.0;
  const sampleRate = 24000;
  const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

  const musicMaster = offline.createGain();
  const vol = Math.max(0.15, Math.min(1, params.musicVolume * 2.2));
  musicMaster.gain.setValueAtTime(0.001, 0);
  musicMaster.gain.linearRampToValueAtTime(vol, 0.25);
  musicMaster.gain.setValueAtTime(vol, duration - 0.8);
  musicMaster.gain.linearRampToValueAtTime(0.0001, duration);
  musicMaster.connect(offline.destination);

  if (params.musicId === "custom" && params.customMusicUrl) {
    const res = await fetch(params.customMusicUrl);
    const bytes = await res.arrayBuffer();
    const TempCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const decodeCtx = new TempCtx();
    const musicBuf = await decodeCtx.decodeAudioData(bytes.slice(0));
    await decodeCtx.close();

    const src = offline.createBufferSource();
    src.buffer = musicBuf;
    src.loop = true;
    src.connect(musicMaster);
    src.start(0);
    src.stop(duration);
  } else if (params.musicId !== "none" && params.musicId !== "custom") {
    scheduleProceduralMusic(offline, musicMaster, params.musicId, duration);
  }

  const rendered = await offline.startRendering();
  const blob = encodeWavFromAudioBuffer(rendered);
  return { url: URL.createObjectURL(blob), durationSec: rendered.duration };
}

export async function renderMasteredVoiceover(params: {
  voiceUrl: string;
  mastering: MasteringPresetId;
  musicId?: BackgroundMusicId;
  musicVolume?: number;
  customMusicUrl?: string | null;
}): Promise<{ url: string; blob: Blob; durationSec: number }> {
  const res = await fetch(params.voiceUrl);
  const voiceBytes = await res.arrayBuffer();

  const TempCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const decodeCtx = new TempCtx();
  const voiceBuffer = await decodeCtx.decodeAudioData(voiceBytes.slice(0));

  const musicId = params.musicId ?? "none";
  const musicVol = Math.max(0, Math.min(0.75, params.musicVolume ?? 0.22));
  const hasMusic =
    musicId !== "none" &&
    musicVol > 0 &&
    (musicId !== "custom" || Boolean(params.customMusicUrl));

  let customMusicBuffer: AudioBuffer | null = null;
  if (hasMusic && musicId === "custom" && params.customMusicUrl) {
    try {
      const mRes = await fetch(params.customMusicUrl);
      const mBytes = await mRes.arrayBuffer();
      customMusicBuffer = await decodeCtx.decodeAudioData(mBytes.slice(0));
    } catch {
      customMusicBuffer = null;
    }
  }
  await decodeCtx.close();

  const voiceDuration = voiceBuffer.duration;
  const tailDuration = hasMusic ? 0.9 : 0;
  const totalDuration = voiceDuration + tailDuration;
  const sampleRate = voiceBuffer.sampleRate;
  const offline = new OfflineAudioContext(
    1,
    Math.ceil(totalDuration * sampleRate),
    sampleRate
  );

  // Voice Chain + Broadcast Mastering
  const source = offline.createBufferSource();
  source.buffer = voiceBuffer;

  let voiceNode: AudioNode = source;

  if (params.mastering !== "raw") {
    const highpass = offline.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 85;

    const warmth = offline.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 150;
    warmth.gain.value = params.mastering === "broadcast" ? 3.2 : 1.5;

    const presence = offline.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = params.mastering === "punchy" ? 3200 : 3800;
    presence.Q.value = 1.1;
    presence.gain.value = params.mastering === "punchy" ? 4.2 : 2.8;

    const compressor = offline.createDynamicsCompressor();
    compressor.threshold.value = params.mastering === "punchy" ? -22 : -18;
    compressor.knee.value = 12;
    compressor.ratio.value = params.mastering === "punchy" ? 4.5 : 3.2;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.14;

    const makeup = offline.createGain();
    makeup.gain.value = params.mastering === "punchy" ? 1.28 : 1.16;

    voiceNode.connect(highpass);
    highpass.connect(warmth);
    warmth.connect(presence);
    presence.connect(compressor);
    compressor.connect(makeup);
    voiceNode = makeup;
  }

  voiceNode.connect(offline.destination);
  source.start(0);

  // Background Music Mixing + Auto-Ducking & Outro Fade
  if (hasMusic) {
    const musicGain = offline.createGain();
    // Auto-ducking: steady ducked bed during voice, gentle swell at outro, then fade out
    musicGain.gain.setValueAtTime(0.0001, 0);
    musicGain.gain.linearRampToValueAtTime(musicVol, 0.25);
    musicGain.gain.setValueAtTime(musicVol, Math.max(0.26, voiceDuration - 0.05));
    musicGain.gain.linearRampToValueAtTime(
      Math.min(0.65, musicVol * 1.35),
      voiceDuration + 0.15
    );
    musicGain.gain.linearRampToValueAtTime(0.0001, totalDuration);
    musicGain.connect(offline.destination);

    if (musicId === "custom" && customMusicBuffer) {
      const musicSrc = offline.createBufferSource();
      musicSrc.buffer = customMusicBuffer;
      musicSrc.loop = true;

      const pocket = offline.createBiquadFilter();
      pocket.type = "peaking";
      pocket.frequency.value = 2200;
      pocket.Q.value = 1.0;
      pocket.gain.value = -3.5;

      musicSrc.connect(pocket);
      pocket.connect(musicGain);
      musicSrc.start(0);
      musicSrc.stop(totalDuration);
    } else if (musicId !== "custom") {
      scheduleProceduralMusic(offline, musicGain, musicId, totalDuration);
    }
  }

  const rendered = await offline.startRendering();
  const blob = encodeWavFromAudioBuffer(rendered);
  const url = URL.createObjectURL(blob);

  return { url, blob, durationSec: rendered.duration };
}

function formatSrtTimestamp(sec: number): string {
  const totalMs = Math.max(0, Math.round(sec * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function generateSrtFromSegments(
  segments: string[],
  totalDurationSec: number
): string {
  const cleanSegments = segments.map((s) => s.trim()).filter(Boolean);
  if (cleanSegments.length === 0 || totalDurationSec <= 0) return "";

  const wordCounts = cleanSegments.map((seg) => Math.max(1, seg.split(/\s+/).length));
  const totalWords = wordCounts.reduce((acc, n) => acc + n, 0);

  let cursor = 0;
  const blocks: string[] = [];

  cleanSegments.forEach((seg, idx) => {
    const share = (wordCounts[idx] / totalWords) * totalDurationSec;
    const start = cursor;
    const end = idx === cleanSegments.length - 1 ? totalDurationSec : cursor + share;
    cursor = end;

    blocks.push(
      `${idx + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${seg}\n`
    );
  });

  return blocks.join("\n");
}

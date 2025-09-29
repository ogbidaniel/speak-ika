"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioContextConstructor = typeof AudioContext;

// Lightweight placeholders until the real speech services are integrated.
type MockResult = {
  ika: string;
  english: string;
};

const mockResults: MockResult[] = [
  {
    ika: "Ugbu a ka anyi na lekwasi okwu a anya.",
    english: "Right now we are paying attention to this speech.",
  },
  {
    ika: "Kpoo mu na nso ka anyi kwuo maka oru a.",
    english: "Call me nearby so we can discuss this task.",
  },
  {
    ika: "Biko nye anyi okwu gi ka anyi mee ka o doo anya.",
    english: "Please share your words so we can make it clear.",
  },
];

export default function TryPage() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [ikaTranscript, setIkaTranscript] = useState<string>("");
  const [englishTranslation, setEnglishTranslation] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isPreviewing, setIsPreviewing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Lazily bootstrap the AudioContext so we only touch the API client-side.
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: AudioContextConstructor })
          .webkitAudioContext;
      if (!AudioContextClass) {
        setStatusMessage("Web Audio API is not supported in this browser.");
        return null;
      }
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const resetPlayback = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    audioElementRef.current?.pause();
    audioElementRef.current?.load();
    setIsPreviewing(false);
    setAudioUrl(null);
    setAudioBuffer(null);
  }, [audioUrl]);

  const loadBlobAsAudioBuffer = useCallback(
    async (blob: Blob) => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = getAudioContext();
        if (!audioContext) return;
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
      } catch (error) {
        console.error("Failed to decode audio", error);
        setStatusMessage("Could not decode the audio file.");
      }
    },
    [getAudioContext],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      resetPlayback();
      setStatusMessage("Loading audio file...");

      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      await loadBlobAsAudioBuffer(blob);
      setStatusMessage("Audio ready. Preview or transcribe when you're set.");
    },
    [loadBlobAsAudioBuffer, resetPlayback],
  );

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setStatusMessage("Processing recorded audio...");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        resetPlayback();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        await loadBlobAsAudioBuffer(blob);
        setStatusMessage("Recording complete. Preview or transcribe when you're set.");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusMessage("Recording... click again to stop.");
    } catch (error) {
      console.error("Recording failed", error);
      setStatusMessage("Could not access the microphone. Check permissions.");
    }
  }, [loadBlobAsAudioBuffer, resetPlayback]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Provide a simple toggle so reviewers can preview the uploaded clip.
  const handlePreviewToggle = useCallback(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) {
      setStatusMessage("Load audio before playing a preview.");
      return;
    }

    if (audioElement.paused) {
      void audioElement
        .play()
        .then(() => setStatusMessage("Playing preview..."))
        .catch(() => {
          setStatusMessage("Unable to start playback. Check your audio device.");
        });
    } else {
      audioElement.pause();
      setStatusMessage("Playback paused.");
    }
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!audioBuffer) {
      setStatusMessage("Upload or record audio before transcribing.");
      return;
    }
    // Simulate async ingestion to highlight where a real request will go.
    setIsTranscribing(true);
    setStatusMessage("Transcribing Ika audio...");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    if (!result) {
      // Protect build when no placeholder data exists on deploy.
      setStatusMessage("No sample transcription available yet. Add mock data to continue.");
      setIsTranscribing(false);
      return;
    }

    setIkaTranscript(result.ika);
    setEnglishTranslation(result.english);
    setStatusMessage("Transcription complete.");
    setIsTranscribing(false);
  }, [audioBuffer]);

  useEffect(() => {
    if (!canvasRef.current || !audioBuffer || typeof window === "undefined") {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Re-render the waveform whenever we have fresh audio or viewport changes.
    const drawWaveform = () => {
      const deviceRatio = window.devicePixelRatio ?? 1;
      const width = canvas.clientWidth * deviceRatio;
      const height = canvas.clientHeight * deviceRatio;
      canvas.width = width;
      canvas.height = height;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(255, 255, 255, 0.05)";
      context.fillRect(0, 0, width, height);

      const channelData = audioBuffer.getChannelData(0);
      const step = Math.ceil(channelData.length / width);
      const amp = height / 2;

      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "rgba(255, 255, 255, 0.9)";
      context.moveTo(0, amp);

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
          const datum = channelData[i * step + j] ?? 0;
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        context.lineTo(i, (1 + min) * amp);
        context.lineTo(i, (1 + max) * amp);
      }

      context.lineTo(width, amp);
      context.stroke();
    };

    drawWaveform();

    window.addEventListener("resize", drawWaveform);
    return () => window.removeEventListener("resize", drawWaveform);
  }, [audioBuffer]);

  useEffect(() => {
    setIsPreviewing(false);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => undefined);
      resetPlayback();
    };
  }, [resetPlayback]);

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-12">
        <header className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-muted)]">Speech Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl text-[color:var(--color-text)]">
            Curate Ika audio, then transcribe and translate effortlessly.
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Import an existing recording or capture something new, preview the sound, and run the mock pipeline to see
            where the real models will plug in.
          </p>
        </header>

        <div className="grid flex-1 gap-8 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-5 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-muted)]">Audio</span>
              <div className="h-56 w-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
                <canvas ref={canvasRef} className="h-full w-full" />
              </div>
              {audioUrl ? (
                <audio
                  className="mt-3 w-full rounded-xl bg-[color:var(--color-surface-muted)] p-2 text-[color:var(--color-text)]"
                  controls
                  controlsList="nodownload"
                  onEnded={() => {
                    setIsPreviewing(false);
                    setStatusMessage("Playback finished.");
                  }}
                  onPause={() => setIsPreviewing(false)}
                  onPlay={() => setIsPreviewing(true)}
                  ref={audioElementRef}
                  src={audioUrl}
                />
              ) : (
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">Load audio to visualize and preview playback.</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-center text-sm text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]">
                <span>Upload Audio</span>
                <input
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              <button
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)] ${
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]"
                }`}
                onClick={handleRecordToggle}
                type="button"
              >
                {isRecording ? "Stop Recording" : "Record Audio"}
              </button>
              <button
                className="rounded-2xl border border-[color:var(--color-accent)] bg-[color:var(--color-surface-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--color-accent)] transition hover:bg-[color:var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!audioUrl}
                onClick={handlePreviewToggle}
                type="button"
              >
                {isPreviewing ? "Pause Preview" : "Play Preview"}
              </button>
              <button
                className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!audioBuffer || isTranscribing}
                onClick={() => void handleTranscribe()}
                type="button"
              >
                {isTranscribing ? "Transcribing..." : "Transcribe"}
              </button>
            </div>

            {statusMessage && (
              <p className="text-xs text-[color:var(--color-muted)]">{statusMessage}</p>
            )}
          </div>

          <div className="flex h-full flex-col gap-5">
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Ika Transcription</h2>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                {ikaTranscript || "Run transcription to populate the Ika text."}
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">English Translation</h2>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                {englishTranslation || "Translation will appear after transcription completes."}
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5 text-sm text-[color:var(--color-muted)] backdrop-blur-xl">
              <p className="font-semibold text-[color:var(--color-text)]">Heads up</p>
              <p className="mt-2">
                This page still uses a mocked transcription pipeline. Replace the handler logic with your speech
                recognition and machine translation calls when they are ready.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

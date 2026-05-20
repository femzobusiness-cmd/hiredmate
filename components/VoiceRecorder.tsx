'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Check, Mic, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

type VoiceRecorderProps = {
  onTranscriptReady: (transcript: string, durationSeconds: number) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  isDisabled?: boolean;
};

const BAR_COUNT = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function WaveformBars({ data }: { data: number[] }) {
  const barWidth = 3;
  const gap = 2;
  const totalWidth = BAR_COUNT * barWidth + (BAR_COUNT - 1) * gap;
  const centerY = 40;

  return (
    <svg
      width="100%"
      height={80}
      viewBox={`0 0 ${totalWidth} 80`}
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto block max-w-full"
    >
      {data.map((value, i) => {
        const height = value * 70 + 4;
        const x = i * (barWidth + gap);
        const y = centerY - height / 2;
        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            rx={2}
            fill="url(#waveGradient)"
            animate={{ height, y }}
            transition={{ type: 'tween', duration: 0.08 }}
          />
        );
      })}
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C5CBF" />
          <stop offset="100%" stopColor="#00C6B2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function VoiceRecorder({
  onTranscriptReady,
  onRecordingStart,
  onRecordingStop,
  isDisabled = false,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] =
    useState<RecordingState>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(
    () => new Array(BAR_COUNT).fill(0.1)
  );
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastWaveformUpdateRef = useRef(0);
  const durationRef = useRef(0);

  const cleanupStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioContextRef.current?.state !== 'closed') {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupStream();
  }, [cleanupStream]);

  const runWaveformLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const now = Date.now();
      if (now - lastWaveformUpdateRef.current >= 50) {
        const step = Math.floor(dataArray.length / BAR_COUNT);
        const samples = Array.from({ length: BAR_COUNT }, (_, i) => {
          const value = dataArray[i * step] ?? 0;
          return Math.max(0.08, value / 255);
        });
        setWaveformData(samples);
        lastWaveformUpdateRef.current = now;
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const transcribeBlob = async (blob: Blob, duration: number) => {
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');

    try {
      const res = await fetch('/api/voice-transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const transcript =
        typeof data.transcript === 'string' ? data.transcript : '';
      onTranscriptReady(transcript, duration);
      setRecordingState('done');
    } catch {
      onTranscriptReady('', duration);
      setRecordingState('done');
    }
  };

  const startRecording = async () => {
    if (isDisabled || recordingState !== 'idle') return;

    setPermissionDenied(false);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const duration = durationRef.current;
        cleanupStream();
        setRecordingState('processing');
        void transcribeBlob(blob, duration);
      };

      recorder.start(250);
      startTimeRef.current = Date.now();
      durationRef.current = 0;
      setDurationSeconds(0);
      setRecordingState('recording');
      onRecordingStart();

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        durationRef.current = elapsed;
        setDurationSeconds(elapsed);
      }, 1000);

      runWaveformLoop();
    } catch {
      setPermissionDenied(true);
      cleanupStream();
    }
  };

  const stopRecording = () => {
    if (recordingState !== 'recording' || !mediaRecorderRef.current) return;
    onRecordingStop();
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecorder = () => {
    cleanupStream();
    mediaRecorderRef.current = null;
    setRecordingState('idle');
    setDurationSeconds(0);
    setWaveformData(new Array(BAR_COUNT).fill(0.1));
  };

  useEffect(() => {
    if (recordingState === 'done') {
      const timeout = setTimeout(resetRecorder, 1200);
      return () => clearTimeout(timeout);
    }
  }, [recordingState]);

  return (
    <div
      className={cn(
        'rounded-[20px] bg-white p-8 shadow-[0_8px_30px_rgba(124,92,191,0.12)]',
        isDisabled && 'pointer-events-none opacity-60'
      )}
    >
      {permissionDenied && (
        <div className="mb-6 rounded-[12px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          Microphone access denied — please allow microphone access in your
          browser settings.
        </div>
      )}

      {recordingState === 'idle' && (
        <div className="flex flex-col items-center">
          <div className="relative">
            <motion.span
              className="absolute inset-0 rounded-full bg-[#7C5CBF]/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <button
              type="button"
              onClick={startRecording}
              disabled={isDisabled}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CBF] to-[#9B7FD4] text-white shadow-lg"
            >
              <Mic className="h-8 w-8" />
            </button>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            Tap to start recording
          </p>
        </div>
      )}

      {recordingState === 'recording' && (
        <motion.div className="flex flex-col items-center">
          <motion.div className="mb-4 flex items-center gap-2">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-2xl font-black text-[#1a1a2e]">
              {formatTime(durationSeconds)}
            </span>
          </motion.div>
          <WaveformBars data={waveformData} />
          <button
            type="button"
            onClick={stopRecording}
            className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg"
          >
            <Square className="h-8 w-8 fill-white" />
          </button>
          <p className="mt-4 text-sm font-medium text-gray-600">Tap to stop</p>
        </motion.div>
      )}

      {(recordingState === 'processing' || recordingState === 'done') && (
        <motion.div className="relative flex flex-col items-center">
          <WaveformBars data={waveformData} />
          <p className="mt-2 text-sm font-bold text-[#1a1a2e]">
            {formatTime(durationSeconds)}
          </p>

          {recordingState === 'processing' && (
            <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-10 w-10 rounded-full border-4 border-[#7C5CBF]/20 border-t-[#7C5CBF]"
              />
              <p className="mt-4 font-bold text-[#7C5CBF]">
                Transcribing your answer...
              </p>
              <motion.div className="mt-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#7C5CBF]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {recordingState === 'done' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 flex flex-col items-center text-green-600"
            >
              <Check className="h-10 w-10" />
              <p className="mt-2 font-bold">Transcribed!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

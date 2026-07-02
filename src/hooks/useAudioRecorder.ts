"use client";

import { useRef, useState } from "react";

export type AudioRecorderPhase = "idle" | "recording" | "stopped";

export function useAudioRecorder() {
  const [phase, setPhase] = useState<AudioRecorderPhase>("idle");
  const [durationSec, setDurationSec] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStreamAndTimer = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionDenied(false);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();

      startTimeRef.current = Date.now();
      setDurationSec(0);
      setPhase("recording");
      timerRef.current = setInterval(() => {
        setDurationSec((Date.now() - startTimeRef.current) / 1000);
      }, 250);
    } catch (err) {
      console.error("Microphone permission denied or unavailable", err);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () =>
    new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setDurationSec((Date.now() - startTimeRef.current) / 1000);
        stopStreamAndTimer();
        setPhase("stopped");
        resolve();
      };
      recorder.stop();
    });

  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    stopStreamAndTimer();
    chunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setDurationSec(0);
    setPhase("idle");
  };

  const discardRecording = () => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAudioBlob(null);
    setDurationSec(0);
    setPhase("idle");
  };

  return {
    phase,
    durationSec,
    audioBlob,
    audioUrl,
    permissionDenied,
    startRecording,
    stopRecording,
    cancelRecording,
    discardRecording,
  };
}

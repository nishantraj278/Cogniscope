"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/Button";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioBase64: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionDenied(false);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onRecordingComplete(audioBlob, base64Audio);
        };

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setPermissionDenied(true);
      alert(
        "Unable to access microphone. Please grant permission and try again.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);

        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);

        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Status */}
      <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isRecording && (
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </div>
          )}
          <div className="text-4xl font-black text-gray-900">
            {formatTime(recordingTime)}
          </div>
        </div>

        <div className="text-sm font-medium text-gray-600 mb-6">
          {isRecording && !isPaused && "Recording in progress..."}
          {isRecording && isPaused && "Recording paused"}
          {!isRecording && !hasRecording && "Ready to record your answer"}
          {!isRecording && hasRecording && "Recording complete!"}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !hasRecording && (
            <Button
              onClick={startRecording}
              disabled={disabled || permissionDenied}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg"
            >
              <svg
                className="w-6 h-6 mr-2 inline"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 text-lg font-bold rounded-full shadow-lg"
              >
                {isPaused ? (
                  <>
                    <svg
                      className="w-6 h-6 mr-2 inline"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 mr-2 inline"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pause
                  </>
                )}
              </Button>

              <Button
                onClick={stopRecording}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 text-lg font-bold rounded-full shadow-lg"
              >
                <svg
                  className="w-6 h-6 mr-2 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
                Stop
              </Button>
            </>
          )}

          {!isRecording && hasRecording && (
            <>
              <Button
                onClick={resetRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 text-lg font-bold rounded-full shadow-lg"
              >
                <svg
                  className="w-6 h-6 mr-2 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Record Again
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">Your Recording</h3>
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Permissions Error */}
      {permissionDenied && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-800 font-semibold">
            Microphone access denied. Please enable microphone permissions in
            your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}

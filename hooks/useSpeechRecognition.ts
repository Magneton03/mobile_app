import { useState, useRef } from "react";
import { Platform } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import type { SpeechError, SpeechStatus } from "../types/speech";

export function useSpeechRecognition() {
  const [error, setError] = useState<SpeechError | null>(null);
  const transcriptTallyRef = useRef<string>("");
  const [transcription, setTranscription] = useState<string>("");
  const [status, setStatus] = useState<SpeechStatus>("idle");

  useSpeechRecognitionEvent("result", (ev) => {
    console.log("[event]: result", {
      isFinal: ev.isFinal,
      transcripts: ev.results.map((result) => result.transcript),
    });

    const transcript = ev.results[0]?.transcript || "";

    if (ev.isFinal) {
      transcriptTallyRef.current += transcript;
      setTranscription(transcriptTallyRef.current);
    } else {
      setTranscription(transcriptTallyRef.current + transcript);
    }
  });

  useSpeechRecognitionEvent("start", () => {
    transcriptTallyRef.current = "";
    setTranscription("");
    setStatus("recognizing");
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("[event]: end");
    setStatus("idle");
  });

  useSpeechRecognitionEvent("error", (ev) => {
    console.log("[event]: error", ev.error, ev.message);
    setError(ev);
  });

  useSpeechRecognitionEvent("nomatch", (ev) => {
    console.log("[event]: nomatch");
  });

  useSpeechRecognitionEvent("languagedetection", (ev) => {
    console.log("[event]: languagedetection", ev);
  });

  const startListening = async (settings: ExpoSpeechRecognitionOptions) => {
    if (status !== "idle") {
      return;
    }
    transcriptTallyRef.current = "";
    setTranscription("");
    setError(null);
    setStatus("starting");

    const microphonePermissions =
      await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    console.log("Microphone permissions", microphonePermissions);
    if (!microphonePermissions.granted) {
      setError({ error: "not-allowed", message: "Permissions not granted" });
      setStatus("idle");
      return;
    }

    if (!settings.requiresOnDeviceRecognition && Platform.OS === "ios") {
      const speechRecognizerPermissions =
        await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      console.log("Speech recognizer permissions", speechRecognizerPermissions);
      if (!speechRecognizerPermissions.granted) {
        setError({ error: "not-allowed", message: "Permissions not granted" });
        setStatus("idle");
        return;
      }
    }

    ExpoSpeechRecognitionModule.start(settings);
  };

  return {
    error,
    transcription,
    status,
    startListening,
  };
}

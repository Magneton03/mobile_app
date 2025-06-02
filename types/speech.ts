import type {
  ExpoSpeechRecognitionOptions,
  AudioEncodingAndroidValue,
} from "expo-speech-recognition";

export interface SpeechError {
  error: string;
  message: string;
}

export type SpeechStatus = "idle" | "starting" | "recognizing";

export interface TranscribeRemoteFileProps {
  remoteUrl: string;
  description: string;
  audioEncoding: AudioEncodingAndroidValue;
  fileName: string;
}

export interface SettingsProps {
  value: ExpoSpeechRecognitionOptions;
  onChange: (v: ExpoSpeechRecognitionOptions) => void;
}

export type SettingsTab = "general" | "android" | "ios" | "other";

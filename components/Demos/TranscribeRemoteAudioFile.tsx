import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import type { TranscribeRemoteFileProps } from "../../types/speech";
import { BigButton } from "../Buttons";

export function TranscribeRemoteAudioFile({
  remoteUrl,
  description,
  audioEncoding,
  fileName,
}: TranscribeRemoteFileProps) {
  const [busy, setBusy] = useState(false);

  const handleTranscribe = async () => {
    setBusy(true);
    // download the file
    const file = await FileSystem.downloadAsync(
      remoteUrl,
      FileSystem.cacheDirectory + fileName,
    );
    if (file.status >= 300 || file.status < 200) {
      console.warn("Failed to download file", file);
      setBusy(false);
      return;
    }
    console.log("Downloaded file", file);
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      audioSource: {
        uri: file.uri,
        audioChannels: 1,
        audioEncoding: audioEncoding,
        sampleRate: 16000,
      },
    });
  };

  useSpeechRecognitionEvent("end", () => setBusy(false));

  return (
    <View style={styles.card}>
      <Text style={[styles.text, styles.mb2]}>{description}</Text>
      <Text style={[styles.text, styles.mb2]}>{remoteUrl}</Text>
      <BigButton
        disabled={busy}
        color="#539bf5"
        title={busy ? "Transcribing..." : "Transcribe remote audio file"}
        onPress={handleTranscribe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 2,
    width: "100%",
  },
  text: {
    fontFamily: "monospace",
  },
  mb2: { marginBottom: 8 },
});

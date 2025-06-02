import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import { BigButton } from "./components/Buttons";
import { Settings } from "./components/Settings";
import { DownloadOfflineModel } from "./components/Demos";
import { StatusBar } from "expo-status-bar";
import { VolumeMeteringAvatar } from "./components/VolumeMeteringAvatar";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import * as FileSystem from "expo-file-system";

export default function App() {
  const { error, transcription, status, startListening } = useSpeechRecognition();

  const [settings, setSettings] = useState<ExpoSpeechRecognitionOptions>({
    lang: "en-US",
    interimResults: true,
    maxAlternatives: 3,
    continuous: true,
    requiresOnDeviceRecognition: false,
    addsPunctuation: true,
    contextualStrings: [
      "expo-speech-recognition",
      "Carlsen",
      "Ian Nepomniachtchi",
      "Praggnanandhaa",
    ],
    volumeChangeEventOptions: {
      enabled: false,
      intervalMillis: 300,
    },
  });

  const [recordingPath, setRecordingPath] = useState<string | null>(null);

  useSpeechRecognitionEvent("audiostart", (event) => {
    console.log("Recording started for file:", event.uri);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    console.log("Local file path:", event.uri);
    setRecordingPath(event.uri);
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {settings.volumeChangeEventOptions?.enabled ? (
        <VolumeMeteringAvatar />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.text}>
          {error ? JSON.stringify(error) : "Error messages go here"}
        </Text>
      </View>

      <ScrollView
        style={[styles.card, { padding: 0, height: 140, maxHeight: 140 }]}
        contentContainerStyle={{ padding: 10 }}
      >
        <View>
          <Text style={styles.text}>
            Status:{" "}
            <Text style={{ color: status === "idle" ? "green" : "red" }}>
              {status}
            </Text>
          </Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>
            {transcription || "transcript goes here"}
          </Text>
        </View>
      </ScrollView>

      <ScrollView
        style={styles.card}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Settings value={settings} onChange={setSettings} />
      </ScrollView>

      <View
        style={[
          styles.card,
          styles.buttonContainer,
          { justifyContent: "space-between" },
        ]}
      >
        {Platform.OS === "android" && settings.requiresOnDeviceRecognition && (
          <View style={styles.flex1}>
            <DownloadOfflineModel locale={settings.lang ?? "en-US"} />
          </View>
        )}

        {status === "idle" ? (
          <BigButton
            title="Start Recognition"
            onPress={() => startListening(settings)}
          />
        ) : (
          <View style={[styles.row, styles.gap1]}>
            <BigButton
              title="Stop"
              disabled={status !== "recognizing"}
              onPress={() => ExpoSpeechRecognitionModule.stop()}
            />
            <BigButton
              title="Abort"
              disabled={status !== "recognizing"}
              onPress={() => ExpoSpeechRecognitionModule.abort()}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 2,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  flex1: { flex: 1 },
  row: { flexDirection: "row" },
  gap1: { gap: 4 },
});
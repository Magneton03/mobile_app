import React, { useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSOutputFormat,
} from "expo-av/build/Audio";
import { ExpoSpeechRecognitionModule, AudioEncodingAndroid } from "expo-speech-recognition";
import { BigButton } from "../Buttons";
import { AudioPlayer } from "./AudioPlayer";

export function RecordUsingExpoAvDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const handleStart = async () => {
    setIsRecording(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          bitRate: 32000,
          extension: ".m4a",
          outputFormat: AndroidOutputFormat.MPEG_4,
          audioEncoder: AndroidAudioEncoder.AAC,
          numberOfChannels: 1,
          sampleRate: 16000,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          numberOfChannels: 1,
          bitRate: 16000,
          extension: ".wav",
          outputFormat: IOSOutputFormat.LINEARPCM,
        },
        web: {
          mimeType: "audio/wav",
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
    } catch (e) {
      console.log("Error starting recording", e);
    }
  };

  const handleStop = async () => {
    setIsRecording(false);
    const recording = recordingRef.current;
    if (!recording) {
      return;
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
  };

  return (
    <View style={styles.card}>
      <Text style={[styles.text, styles.mb2]}>Record using Expo AV</Text>

      <View style={styles.row}>
        {!isRecording ? (
          <BigButton
            title="Start Recording"
            color="#539bf5"
            onPress={handleStart}
          />
        ) : (
          <BigButton
            title="Stop Recording"
            color="#7C90DB"
            onPress={handleStop}
          />
        )}
      </View>

      {recordingUri && <AudioPlayer source={recordingUri} />}

      {recordingUri && (
        <BigButton
          title="Transcribe the recording"
          color="#539bf5"
          onPress={() => {
            console.log("Transcribing recording", recordingUri);
            ExpoSpeechRecognitionModule.start({
              lang: "en-US",
              interimResults: true,
              requiresOnDeviceRecognition: false,
              audioSource: {
                uri: recordingUri,
                audioChannels: 1,
                audioEncoding: AudioEncodingAndroid.ENCODING_MP3,
                sampleRate: 16000,
              },
            });
          }}
        />
      )}
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
  row: { flexDirection: "row" },
});

import React, { useState } from "react";
import { View, Text, Alert, Platform, StyleSheet } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent, AudioEncodingAndroid } from "expo-speech-recognition";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import * as FileSystem from "expo-file-system";
import { BigButton, CheckboxButton } from "../Buttons";
import { WebSpeechAPIDemo } from "../Demos/WebSpeechAPIDemo";
import { RecordUsingExpoAvDemo } from "../Demos/RecordUsingExpoAvDemo";
import { TranscribeRemoteAudioFile } from "../Demos/TranscribeRemoteAudioFile";
import { AudioPlayer } from "../Demos/AudioPlayer";

interface Props {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}

export function OtherSettings({ value: settings, onChange: handleChange }: Props) {
  const [recordingPath, setRecordingPath] = useState<string | null>(null);

  useSpeechRecognitionEvent("audiostart", (event) => {
    console.log("Recording started for file:", event.uri);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    console.log("Local file path:", event.uri);
    setRecordingPath(event.uri);
  });

  return (
    <View style={styles.gap1}>
      <View style={[styles.row, styles.gap1, styles.flexWrap]}>
        <BigButton
          title="Get permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.getPermissionsAsync().then((result) => {
              Alert.alert("Get Permissions result", JSON.stringify(result));
            });
          }}
        />
        <BigButton
          title="Request permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestPermissionsAsync().then(
              (result) => {
                Alert.alert(
                  "RequestPermissions result",
                  JSON.stringify(result),
                );
              },
            );
          }}
        />
        <BigButton
          title="Get microphone permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.getMicrophonePermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <BigButton
          title="Request microphone permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <BigButton
          title="Get speech recognizer permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.getSpeechRecognizerPermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <BigButton
          title="Request speech recognizer permissions"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <BigButton
          title="Get speech recognizer state"
          color="#7C90DB"
          onPress={() => {
            ExpoSpeechRecognitionModule.getStateAsync().then((state) => {
              console.log("Current state:", state);
              Alert.alert("Current state", state);
            });
          }}
        />
        <BigButton
          title="Call isRecognitionAvailable()"
          color="#7C90DB"
          onPress={() => {
            const isAvailable =
              ExpoSpeechRecognitionModule.isRecognitionAvailable();
            Alert.alert("isRecognitionAvailable()", isAvailable.toString());
          }}
        />
        {Platform.OS === "ios" && (
          <BigButton
            title="Set audio session active state"
            color="#7C90DB"
            onPress={() => {
              ExpoSpeechRecognitionModule.setAudioSessionActiveIOS(true, {
                notifyOthersOnDeactivation: false,
              });
            }}
          />
        )}
      </View>
      
      <CheckboxButton
        title="Persist audio recording to filesystem"
        checked={Boolean(settings.recordingOptions?.persist)}
        onPress={() =>
          handleChange("recordingOptions", {
            persist: !settings.recordingOptions?.persist,
            outputDirectory: FileSystem.documentDirectory ?? undefined,
            outputFileName: "recording.wav",
            outputSampleRate: 16000,
            outputEncoding: "pcmFormatInt16",
          })
        }
      />
      
      {settings.recordingOptions?.persist ? (
        <View style={styles.recordingContainer}>
          {recordingPath ? (
            <View>
              <Text style={styles.text}>
                Audio recording saved to {recordingPath}
              </Text>
              <AudioPlayer source={recordingPath} />
              <BigButton
                title="Transcribe the recording"
                color="#539bf5"
                onPress={() => {
                  ExpoSpeechRecognitionModule.start({
                    lang: "en-US",
                    interimResults: true,
                    audioSource: {
                      uri: recordingPath,
                      audioChannels: 1,
                      audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
                      sampleRate: 16000,
                    },
                  });
                }}
              />
            </View>
          ) : (
            <Text style={styles.text}>
              Waiting for speech recognition to end...
            </Text>
          )}
        </View>
      ) : null}

      <WebSpeechAPIDemo />
      <RecordUsingExpoAvDemo />
      
      <TranscribeRemoteAudioFile
        fileName="remote-en-us-sentence-16000hz-pcm_s16le.wav"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz-pcm_s16le.wav"
        audioEncoding={AudioEncodingAndroid.ENCODING_PCM_16BIT}
        description="16000hz 16-bit 1-channel PCM audio file"
      />

      <TranscribeRemoteAudioFile
        fileName="remote-en-us-sentence-16000hz.mp3"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz.mp3"
        audioEncoding={AudioEncodingAndroid.ENCODING_MP3}
        description="16000hz MP3 1-channel audio file"
      />

      <TranscribeRemoteAudioFile
        fileName="remote-en-us-sentence-16000hz.ogg"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz.ogg"
        audioEncoding={AudioEncodingAndroid.ENCODING_OPUS}
        description="(May not work on iOS) 16000hz ogg vorbis 1-channel audio file"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap1: { gap: 4 },
  row: { flexDirection: "row" },
  flexWrap: { flexWrap: "wrap" },
  recordingContainer: {
    borderStyle: "dashed",
    borderWidth: 2,
    padding: 10,
    minHeight: 100,
    flex: 1,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});

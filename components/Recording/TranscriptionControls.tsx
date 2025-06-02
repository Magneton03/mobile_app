import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ExpoSpeechRecognitionModule, AudioEncodingAndroid } from "expo-speech-recognition";
import { BigButton } from "../Buttons";
import { RecordingSelector } from "./RecordingSelector";
import type { RecordingInfo } from "../../hooks/useAudioRecording";

interface Props {
  onTranscriptionStart?: (recording: RecordingInfo) => void;
}

export function TranscriptionControls({ onTranscriptionStart }: Props) {
  const [selectedRecording, setSelectedRecording] = useState<RecordingInfo | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleStartTranscription = async () => {
    if (!selectedRecording) {
      Alert.alert("エラー", "文字起こしするファイルを選択してください");
      return;
    }

    try {
      setIsTranscribing(true);
      
      // マイクの権限を確認
      const permissions = await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
      if (!permissions.granted) {
        Alert.alert("エラー", "マイクの権限が必要です");
        setIsTranscribing(false);
        return;
      }

      // 文字起こし開始
      ExpoSpeechRecognitionModule.start({
        lang: "ja-JP", // 日本語設定
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        audioSource: {
          uri: selectedRecording.uri,
          audioChannels: 1,
          audioEncoding: selectedRecording.name.endsWith('.m4a') 
            ? AudioEncodingAndroid.ENCODING_MP3 
            : AudioEncodingAndroid.ENCODING_PCM_16BIT,
          sampleRate: 16000,
        },
      });

      onTranscriptionStart?.(selectedRecording);
    } catch (error) {
      console.log("文字起こしエラー:", error);
      Alert.alert("エラー", "文字起こしを開始できませんでした");
      setIsTranscribing(false);
    }
  };

  const handleStopTranscription = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsTranscribing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 文字起こし</Text>
      
      <RecordingSelector
        selectedRecording={selectedRecording}
        onSelectRecording={setSelectedRecording}
      />

      <View style={styles.controlsContainer}>
        {!isTranscribing ? (
          <BigButton
            title="文字起こし開始"
            color="#4CAF50"
            onPress={handleStartTranscription}
            disabled={!selectedRecording}
          />
        ) : (
          <BigButton
            title="文字起こし停止"
            color="#f44336"
            onPress={handleStopTranscription}
          />
        )}
      </View>

      {isTranscribing && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔄 文字起こし中...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  controlsContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

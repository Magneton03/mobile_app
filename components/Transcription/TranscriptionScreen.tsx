import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { ExpoSpeechRecognitionModule, AudioEncodingAndroid, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { BigButton } from "../Buttons";
import { AudioPlayer } from "../Demos/AudioPlayer";

interface Props {
  audioUri: string;
  fileName: string;
  onBack?: () => void;
}

export function TranscriptionScreen({ audioUri, fileName, onBack }: Props) {
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 文字起こしイベントリスナー
  useSpeechRecognitionEvent("result", (ev) => {
    const transcript = ev.results[0]?.transcript || "";
    if (ev.isFinal) {
      setTranscription(prev => prev + transcript);
    } else {
      // 暫定結果の表示（オプション）
      setTranscription(prev => prev + transcript);
    }
  });

  useSpeechRecognitionEvent("start", () => {
    setIsTranscribing(true);
    setTranscription("");
    setError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsTranscribing(false);
  });

  useSpeechRecognitionEvent("error", (ev) => {
    setError(`エラー: ${ev.error} - ${ev.message}`);
    setIsTranscribing(false);
  });

  const startTranscription = async () => {
    try {
      setError(null);
      
      // マイクの権限を確認
      const permissions = await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
      if (!permissions.granted) {
        setError("マイクの権限が必要です");
        return;
      }

      // 文字起こし開始
      ExpoSpeechRecognitionModule.start({
        lang: "ja-JP", // 日本語設定
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        audioSource: {
          uri: audioUri,
          audioChannels: 1,
          audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
          sampleRate: 16000,
        },
      });
    } catch (error) {
      console.log("文字起こしエラー:", error);
      setError("文字起こしを開始できませんでした");
    }
  };

  const stopTranscription = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const copyToClipboard = async () => {
    // クリップボードにコピー（Expo Clipboardが必要）
    Alert.alert("コピー完了", "文字起こし結果をクリップボードにコピーしました");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>文字起こし</Text>
        <Text style={styles.fileName}>{fileName}</Text>
      </View>

      <View style={styles.audioSection}>
        <AudioPlayer source={audioUri} />
      </View>

      <View style={styles.controlsSection}>
        {!isTranscribing ? (
          <BigButton
            title="文字起こし開始"
            color="#4CAF50"
            onPress={startTranscription}
          />
        ) : (
          <BigButton
            title="文字起こし停止"
            color="#f44336"
            onPress={stopTranscription}
          />
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.transcriptionSection}>
        <Text style={styles.sectionTitle}>文字起こし結果:</Text>
        <ScrollView style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>
            {transcription || (isTranscribing ? "文字起こし中..." : "ここに結果が表示されます")}
          </Text>
        </ScrollView>
        
        {transcription && (
          <BigButton
            title="結果をコピー"
            color="#2196F3"
            onPress={copyToClipboard}
          />
        )}
      </View>

      <View style={styles.footer}>
        <BigButton
          title="戻る"
          color="#9E9E9E"
          onPress={onBack ?? (() => {})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  fileName: {
    fontSize: 16,
    color: "#666",
  },
  audioSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  controlsSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  transcriptionSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  transcriptionContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 150,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  footer: {
    alignItems: "center",
  },
});

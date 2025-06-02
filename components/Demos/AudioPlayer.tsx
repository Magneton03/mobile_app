import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { BigButton } from "../Buttons";

interface Props {
  source: string;
  compact?: boolean;
}

export function AudioPlayer({ source, compact = false }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = async () => {
    try {
      setError(null);
      setIsPlaying(true);

      const { sound } = await Audio.Sound.createAsync(
        { uri: source },
        { shouldPlay: true },
      );

      // 再生終了時の処理
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("音声再生エラー:", error);
      setError("音声ファイルを再生できませんでした");
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsPlaying(false);
      // 現在再生中の音声を停止
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.log("音声停止エラー:", error);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <BigButton
          title={isPlaying ? "⏹️" : "▶️"}
          color={isPlaying ? "#f44336" : "#4CAF50"}
          onPress={isPlaying ? handleStop : handlePlay}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BigButton
        title={isPlaying ? "再生停止" : "再生"}
        color={isPlaying ? "#f44336" : "#4CAF50"}
        onPress={isPlaying ? handleStop : handlePlay}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  compactContainer: {
    alignItems: "flex-start",
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});

import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { BigButton } from "../Buttons";
import { AudioPlayer } from "../Demos/AudioPlayer";
import { useAudioRecording, RecordingInfo } from "../../hooks/useAudioRecording";

interface Props {
  onSelectRecording?: (uri: string, name: string) => void;
}

export function RecordingList({ onSelectRecording }: Props) {
  const { recordings, loadExistingRecordings, deleteRecording } = useAudioRecording();

  useEffect(() => {
    console.log("RecordingList: 初期化時に録音ファイルを読み込み");
    loadExistingRecordings();
  }, []);

  useEffect(() => {
    console.log("RecordingList: 録音リスト更新:", recordings.length, "件");
    recordings.forEach((recording, index) => {
      console.log(`録音 ${index + 1}:`, recording.name, recording.uri);
    });
  }, [recordings]);

  const handleDelete = (recording: RecordingInfo) => {
    Alert.alert(
      "録音削除",
      `"${recording.name}"を削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => {
            console.log("録音削除:", recording.name);
            deleteRecording(recording.uri);
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    console.log("手動リフレッシュ");
    loadExistingRecordings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>録音ファイル一覧</Text>
        <BigButton
          title="🔄 更新"
          color="#2196F3"
          onPress={handleRefresh}
        />
      </View>
      
      {recordings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>録音ファイルがありません</Text>
          <Text style={styles.emptySubtext}>
            録音ボタンを押して音声を録音してください
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {recordings.map((recording, index) => (
            <View key={recording.uri} style={styles.recordingItem}>
              <View style={styles.recordingHeader}>
                <Text style={styles.recordingName}>{recording.name}</Text>
                <Text style={styles.recordingDate}>
                  {formatDate(recording.createdAt)}
                </Text>
                <Text style={styles.recordingPath}>{recording.uri}</Text>
              </View>
              
              <View style={styles.controlsContainer}>
                <AudioPlayer source={recording.uri} />
                
                <View style={styles.buttonRow}>
                  <BigButton
                    title="文字起こし"
                    color="#4CAF50"
                    onPress={() => {
                      console.log("文字起こし選択:", recording.name);
                      onSelectRecording?.(recording.uri, recording.name);
                    }}
                  />
                  <BigButton
                    title="削除"
                    color="#f44336"
                    onPress={() => handleDelete(recording)}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContainer: {
    maxHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 120,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  recordingItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingHeader: {
    marginBottom: 12,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  recordingPath: {
    fontSize: 10,
    color: "#999",
    fontFamily: "monospace",
  },
  controlsContainer: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
});

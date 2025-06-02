import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { BigButton } from "../Buttons";
import { useAudioRecording } from "../../hooks/useAudioRecording";

interface Props {
  onRecordingComplete?: (uri: string) => void;
}

export function RecordingControls({ onRecordingComplete }: Props) {
  const {
    isRecording,
    recordings,
    permissionError,
    startRecording,
    stopRecording,
    loadExistingRecordings,
    requestPermissions,
  } = useAudioRecording();

  useEffect(() => {
    console.log("RecordingControls: 初期化時に録音ファイルを読み込み");
    loadExistingRecordings();
  }, []);

  useEffect(() => {
    console.log("RecordingControls: 録音リスト更新:", recordings.length, "件");
  }, [recordings]);

  const handleStartRecording = async () => {
    try {
      console.log("録音開始処理開始");
      // 最初に権限を確認
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          "権限が必要です",
          "録音機能を使用するには、マイクへのアクセス権限が必要です。設定から権限を有効にしてください。"
        );
        return;
      }

      await startRecording();
      console.log("録音開始完了");
    } catch (error) {
      console.log("録音開始エラー:", error);
      Alert.alert(
        "録音エラー",
        "録音を開始できませんでした: " +
          (error instanceof Error ? error.message : "不明なエラー")
      );
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log("録音停止処理開始");
      const recordingInfo = await stopRecording();
      if (recordingInfo) {
        console.log("録音完了:", recordingInfo);
        if (onRecordingComplete) {
          onRecordingComplete(recordingInfo.uri);
        }
        Alert.alert("録音完了", `録音が保存されました: ${recordingInfo.name}`);

        // 少し待ってからリストを再読み込み
        setTimeout(() => {
          console.log("録音完了後にリスト再読み込み");
          loadExistingRecordings();
        }, 500);
      } else {
        Alert.alert("録音エラー", "録音の保存に失敗しました");
      }
    } catch (error) {
      console.log("録音停止エラー:", error);
      Alert.alert("録音エラー", "録音を停止できませんでした");
    }
  };

  const handleRequestPermissions = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      Alert.alert("権限取得成功", "録音権限が正常に取得されました。");
    } else {
      Alert.alert(
        "権限取得失敗",
        "録音権限を取得できませんでした。設定から手動で権限を有効にしてください。"
      );
    }
  };

  const handleRefreshList = () => {
    console.log("手動でリスト更新");
    loadExistingRecordings();
  };

  return (
    <View style={styles.container}>
      {permissionError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{permissionError}</Text>
          <BigButton
            title="権限を再要求"
            color="#FF9800"
            onPress={handleRequestPermissions}
          />
        </View>
      )}

      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <View style={styles.buttonRow}>
            <BigButton
              title="録音開始"
              color="#4CAF50"
              onPress={handleStartRecording}
            />
            <BigButton
              title="リスト更新"
              color="#2196F3"
              onPress={handleRefreshList}
            />
          </View>
        ) : (
          <BigButton
            title="録音停止"
            color="#f44336"
            onPress={handleStopRecording}
          />
        )}
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>🔴 録音中...</Text>
        </View>
      )}

      <Text style={styles.infoText}>保存済み録音: {recordings.length}件</Text>

      {Platform.OS === "android" && (
        <Text style={styles.hintText}>
          ※ Androidの場合、初回起動時に権限の許可が必要です
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    margin: 8,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  recordingIndicator: {
    alignItems: "center",
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff4444",
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  hintText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    marginBottom: 8,
  },
});

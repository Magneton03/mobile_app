import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { BigButton } from "../Buttons";
import { AudioPlayer } from "../Demos/AudioPlayer";
import { useAudioRecording, RecordingInfo } from "../../hooks/useAudioRecording";

interface Props {
  onSelectRecording?: (recording: RecordingInfo | null) => void;
  selectedRecording?: RecordingInfo | null;
}

export function RecordingSelector({ onSelectRecording, selectedRecording }: Props) {
  const { recordings, loadExistingRecordings } = useAudioRecording();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadExistingRecordings();
  }, []);

  const handleSelectRecording = (recording: RecordingInfo) => {
    onSelectRecording?.(recording);
    setIsModalVisible(false);
  };

  const handleClearSelection = () => {
    onSelectRecording?.(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>録音ファイル選択</Text>
      
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedRecording ? selectedRecording.name : "ファイルを選択してください"}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        
        {selectedRecording && (
          <BigButton
            title="選択解除"
            color="#9E9E9E"
            onPress={handleClearSelection}
          />
        )}
      </View>

      {selectedRecording && (
        <View style={styles.selectedFileInfo}>
          <Text style={styles.selectedFileName}>選択中: {selectedRecording.name}</Text>
          <Text style={styles.selectedFileDate}>
            録音日時: {formatDate(selectedRecording.createdAt)}
          </Text>
          <View style={styles.playerContainer}>
            <AudioPlayer source={selectedRecording.uri} />
          </View>
        </View>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>録音ファイルを選択</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {recordings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>録音ファイルがありません</Text>
              </View>
            ) : (
              recordings.map((recording) => (
                <TouchableOpacity
                  key={recording.uri}
                  style={[
                    styles.recordingItem,
                    selectedRecording?.uri === recording.uri && styles.selectedItem
                  ]}
                  onPress={() => handleSelectRecording(recording)}
                >
                  <View style={styles.recordingHeader}>
                    <Text style={styles.recordingName}>{recording.name}</Text>
                    <Text style={styles.recordingDate}>
                      {formatDate(recording.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.previewPlayer}>
                    <AudioPlayer source={recording.uri} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  selectorContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  selectorButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  selectedFileInfo: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  selectedFileDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  playerContainer: {
    alignItems: "flex-start",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  recordingItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedItem: {
    borderColor: "#4CAF50",
    backgroundColor: "#f0f8ff",
  },
  recordingHeader: {
    marginBottom: 8,
  },
  recordingName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 12,
    color: "#666",
  },
  previewPlayer: {
    alignItems: "flex-start",
  },
});

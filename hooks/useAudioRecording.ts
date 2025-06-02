import { useState, useRef } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSOutputFormat,
} from "expo-av/build/Audio";

export interface RecordingInfo {
  uri: string;
  name: string;
  duration: number;
  createdAt: Date;
}

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordingInfo[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const requestPermissions = async () => {
    try {
      setPermissionError(null);
      
      // オーディオ録音の権限を要求
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        const errorMsg = "オーディオ録音の権限が必要です。設定で権限を有効にしてください。";
        setPermissionError(errorMsg);
        throw new Error(errorMsg);
      }
      
      return true;
    } catch (error) {
      console.log("権限取得エラー:", error);
      setPermissionError(error instanceof Error ? error.message : "権限取得に失敗しました");
      return false;
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setPermissionError(null);
      
      // 権限を確認・要求
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsRecording(false);
        return;
      }
      
      // オーディオモードを設定
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // 録音設定
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          bitRate: 128000,
          extension: ".m4a",
          outputFormat: AndroidOutputFormat.MPEG_4,
          audioEncoder: AndroidAudioEncoder.AAC,
          numberOfChannels: 1,
          sampleRate: 44100,
        },
        ios: {
          bitRate: 128000,
          numberOfChannels: 1,
          sampleRate: 44100,
          extension: ".m4a",
          outputFormat: IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.audioQuality,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      
      console.log("録音開始成功");
    } catch (error) {
      console.log("録音開始エラー:", error);
      setIsRecording(false);
      setPermissionError(error instanceof Error ? error.message : "録音開始に失敗しました");
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return null;

      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      if (!uri) return null;

      console.log("録音終了、一時ファイル:", uri);

      // 録音ファイル情報を取得
      const status = await recording.getStatusAsync();
      const duration = status.isLoaded ? status.durationMillis || 0 : 0;
      
      // ファイル名を生成
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `recording_${timestamp}.m4a`;
      
      // ドキュメントディレクトリに保存
      const documentsDir = FileSystem.documentDirectory;
      if (documentsDir) {
        const newUri = `${documentsDir}${fileName}`;
        
        // ファイルをコピー（moveAsyncの代わりにcopyAsyncを使用）
        try {
          await FileSystem.copyAsync({
            from: uri,
            to: newUri,
          });
          console.log("ファイルコピー成功:", newUri);
        } catch (copyError) {
          console.log("ファイルコピーエラー、moveAsyncを試行:", copyError);
          await FileSystem.moveAsync({
            from: uri,
            to: newUri,
          });
          console.log("ファイル移動成功:", newUri);
        }

        const recordingInfo: RecordingInfo = {
          uri: newUri,
          name: fileName,
          duration,
          createdAt: new Date(),
        };

        setRecordings(prev => {
          const newRecordings = [recordingInfo, ...prev];
          console.log("録音リスト更新:", newRecordings.length, "件");
          return newRecordings;
        });
        
        // 録音リストを再読み込み
        setTimeout(() => loadExistingRecordings(), 1000);
        
        return recordingInfo;
      }

      return null;
    } catch (error) {
      console.log("録音停止エラー:", error);
      setIsRecording(false);
      return null;
    }
  };

  const loadExistingRecordings = async () => {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) {
        console.log("ドキュメントディレクトリが見つかりません");
        return;
      }

      console.log("ドキュメントディレクトリ:", documentsDir);
      
      const files = await FileSystem.readDirectoryAsync(documentsDir);
      console.log("ディレクトリ内のファイル:", files);
      
      // 音声ファイルをフィルタリング（.m4a, .wav, .mp3など）
      const audioFiles = files.filter(file => 
        file.endsWith('.m4a') || 
        file.endsWith('.wav') || 
        file.endsWith('.mp3') ||
        file.startsWith('recording_')
      );
      
      console.log("音声ファイル:", audioFiles);
      
      const recordingInfos: RecordingInfo[] = [];
      
      for (const file of audioFiles) {
        const uri = `${documentsDir}${file}`;
        console.log("ファイル情報確認:", uri);
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          console.log("ファイル情報:", fileInfo);
          
          if (fileInfo.exists && !fileInfo.isDirectory) {
            recordingInfos.push({
              uri,
              name: file,
              duration: 0,
              createdAt: new Date(fileInfo.modificationTime || 0),
            });
          }
        } catch (fileError) {
          console.log("ファイル情報取得エラー:", file, fileError);
        }
      }

      const sortedRecordings = recordingInfos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      console.log("読み込み完了:", sortedRecordings.length, "件");
      setRecordings(sortedRecordings);
    } catch (error) {
      console.log("録音ファイル読み込みエラー:", error);
    }
  };

  const deleteRecording = async (uri: string) => {
    try {
      await FileSystem.deleteAsync(uri);
      setRecordings(prev => prev.filter(recording => recording.uri !== uri));
      console.log("ファイル削除成功:", uri);
    } catch (error) {
      console.log("録音ファイル削除エラー:", error);
    }
  };

  return {
    isRecording,
    recordings,
    permissionError,
    startRecording,
    stopRecording,
    loadExistingRecordings,
    deleteRecording,
    requestPermissions,
  };
}

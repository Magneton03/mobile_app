import React, { useState } from "react";
import { View, Text, Alert, TouchableNativeFeedback } from "react-native";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

interface Props {
  locale: string;
}

export function DownloadOfflineModel({ locale }: Props) {
  const [downloading, setDownloading] = useState<{ locale: string } | null>(null);

  const handleDownload = () => {
    setDownloading({ locale });

    ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
      locale,
    })
      .then((result) => {
        if (result.status === "opened_dialog") {
          Alert.alert("Offline model download dialog opened.");
        } else if (result.status === "download_success") {
          Alert.alert("Offline model downloaded successfully!");
        } else if (result.status === "download_canceled") {
          Alert.alert("Offline model download was canceled.");
        }
      })
      .catch((err) => {
        Alert.alert("Failed to download offline model!", err.message);
      })
      .finally(() => {
        setDownloading(null);
      });
  };

  return (
    <TouchableNativeFeedback
      disabled={Boolean(downloading)}
      onPress={handleDownload}
    >
      <View>
        <Text
          style={{
            fontWeight: "bold",
            color: downloading ? "#999" : "#539bf5",
          }}
          adjustsFontSizeToFit
        >
          {downloading
            ? `Downloading ${locale} model...`
            : `Download ${locale} Offline Model`}
        </Text>
      </View>
    </TouchableNativeFeedback>
  );
}

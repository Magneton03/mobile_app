import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import { TabButton } from "../Buttons";
import { GeneralSettings } from "./GeneralSettings";
import { AndroidSettings } from "./AndroidSettings";
import { IOSSettings } from "./IOSSettings";
import { OtherSettings } from "./OtherSettings";
import type { SettingsProps, SettingsTab } from "../../types/speech";

export function Settings(props: SettingsProps) {
  const { value: settings, onChange } = props;
  const [tab, setTab] = useState<SettingsTab>("general");

  const handleChange = <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => {
    onChange({ ...props.value, [key]: value });
  };

  return (
    <View>
      <View style={[styles.flex1, styles.row, styles.mb2, styles.gap1]}>
        <TabButton
          title="General Settings"
          active={tab === "general"}
          onPress={() => setTab("general")}
        />
        <TabButton
          title="Android"
          active={tab === "android"}
          onPress={() => setTab("android")}
        />
        <TabButton
          title="iOS"
          active={tab === "ios"}
          onPress={() => setTab("ios")}
        />
        <TabButton
          title="Other"
          active={tab === "other"}
          onPress={() => setTab("other")}
        />
      </View>
      {tab === "general" && (
        <GeneralSettings value={settings} onChange={handleChange} />
      )}
      {tab === "android" && (
        <AndroidSettings value={settings} onChange={handleChange} />
      )}
      {tab === "other" && (
        <OtherSettings value={settings} onChange={handleChange} />
      )}
      {tab === "ios" && (
        <IOSSettings value={settings} onChange={handleChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: "row" },
  mb2: { marginBottom: 8 },
  gap1: { gap: 4 },
});

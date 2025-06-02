import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  TaskHintIOS,
  AVAudioSessionCategory,
  AVAudioSessionCategoryOptions,
  AVAudioSessionMode,
} from "expo-speech-recognition";
import type {
  ExpoSpeechRecognitionOptions,
  AVAudioSessionCategoryValue,
  AVAudioSessionModeValue,
  AVAudioSessionCategoryOptionsValue,
  SetCategoryOptions,
} from "expo-speech-recognition";
import { OptionButton, CheckboxButton } from "../Buttons";

interface Props {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}

export function IOSSettings({ value: settings, onChange: handleChange }: Props) {
  const updateCategoryOptions = (options: Partial<SetCategoryOptions>) => {
    handleChange("iosCategory", {
      category:
        options.category ?? settings.iosCategory?.category ?? "playAndRecord",
      categoryOptions: options.categoryOptions ??
        settings.iosCategory?.categoryOptions ?? [
          AVAudioSessionCategoryOptions.defaultToSpeaker,
          AVAudioSessionCategoryOptions.allowBluetooth,
        ],
      mode: options.mode ?? settings.iosCategory?.mode ?? "measurement",
    });
  };

  return (
    <View style={styles.gap1}>
      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Task Hint</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(TaskHintIOS).map((hint) => (
            <OptionButton
              key={hint}
              title={hint}
              active={settings.iosTaskHint === hint}
              onPress={() =>
                handleChange("iosTaskHint", hint as keyof typeof TaskHintIOS)
              }
            />
          ))}
        </View>
      </View>
      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Audio Category</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(AVAudioSessionCategory).map((category) => (
            <OptionButton
              key={category}
              title={category}
              active={settings.iosCategory?.category === category}
              onPress={() =>
                updateCategoryOptions({
                  category: category as AVAudioSessionCategoryValue,
                })
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.gap1}>
        <View style={styles.flex1}>
          <Text style={styles.textLabel}>Category Options</Text>
          <View style={[styles.row, styles.flexWrap]}>
            {Object.keys(AVAudioSessionCategoryOptions).map((option) => (
              <CheckboxButton
                key={option}
                title={option}
                checked={Boolean(
                  settings.iosCategory?.categoryOptions?.includes(
                    option as AVAudioSessionCategoryOptionsValue,
                  ),
                )}
                onPress={() => {
                  let newOptions = [
                    ...(settings.iosCategory?.categoryOptions ?? []),
                  ];
                  if (
                    newOptions.includes(
                      option as AVAudioSessionCategoryOptionsValue,
                    )
                  ) {
                    newOptions = newOptions.filter((o) => o !== option);
                  } else {
                    newOptions.push(
                      option as AVAudioSessionCategoryOptionsValue,
                    );
                  }

                  updateCategoryOptions({
                    categoryOptions: newOptions,
                  });
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Audio Mode</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(AVAudioSessionMode).map((mode) => (
            <OptionButton
              key={mode}
              title={mode}
              active={settings.iosCategory?.mode === mode}
              onPress={() =>
                updateCategoryOptions({
                  mode: mode as AVAudioSessionModeValue,
                })
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gap1: { gap: 4 },
  textLabel: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  row: { flexDirection: "row" },
  flexWrap: { flexWrap: "wrap" },
  flex1: { flex: 1 },
});

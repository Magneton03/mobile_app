import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  getSpeechRecognitionServices,
} from "expo-speech-recognition";
import type { 
  ExpoSpeechRecognitionOptions,
  AndroidIntentOptions,
} from "expo-speech-recognition";
import { OptionButton, CheckboxButton } from "../Buttons";
import { androidIntentNumberInputOptions, androidIntentBooleanInputOptions } from "../../constants/locales";

interface Props {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}

export function AndroidSettings({ value: settings, onChange: handleChange }: Props) {
  const speechRecognitionServices = getSpeechRecognitionServices();
  const defaultRecognitionService =
    ExpoSpeechRecognitionModule.getDefaultRecognitionService().packageName;
  const assistantService =
    ExpoSpeechRecognitionModule.getAssistantService().packageName;

  return (
    <View style={styles.gap1}>
      <View>
        <View style={[styles.card, styles.mb2]}>
          <View style={styles.gap1}>
            <Text style={styles.textLabel}>Device preferences</Text>
            {defaultRecognitionService ? (
              <Text style={styles.textSubtle}>
                Default Recognition Service: {defaultRecognitionService}
              </Text>
            ) : null}
            {assistantService ? (
              <Text style={styles.textSubtle}>
                Assistant Service: {assistantService}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.textLabel}>Android Recognition Service</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {speechRecognitionServices.map((service) => (
            <OptionButton
              key={service}
              title={service}
              active={settings.androidRecognitionServicePackage === service}
              onPress={() => {
                handleChange("androidRecognitionServicePackage", service);
              }}
            />
          ))}
          {speechRecognitionServices.length === 0 && (
            <Text style={styles.text}>No services found</Text>
          )}
        </View>
      </View>

      <View>
        <Text style={[styles.textLabel, styles.mb2]}>
          Android Intent Options
        </Text>
        <View style={styles.gap1}>
          <View style={styles.flex1}>
            <Text style={styles.textLabel}>EXTRA_LANGUAGE_MODEL</Text>
            <View style={[styles.row, styles.flexWrap]}>
              {["free_form", "web_search"].map((model) => (
                <OptionButton
                  key={model}
                  title={model}
                  active={Boolean(
                    settings.androidIntentOptions?.EXTRA_LANGUAGE_MODEL ===
                      model,
                  )}
                  onPress={() =>
                    handleChange("androidIntentOptions", {
                      ...settings.androidIntentOptions,
                      EXTRA_LANGUAGE_MODEL:
                        model as AndroidIntentOptions["EXTRA_LANGUAGE_MODEL"],
                    })
                  }
                />
              ))}
            </View>
          </View>
          {androidIntentNumberInputOptions.map((key) => (
            <TextInput
              key={key}
              style={[styles.textInput, styles.flex1]}
              keyboardType="number-pad"
              autoCorrect={false}
              placeholder={key}
              defaultValue={
                settings.androidIntentOptions?.[key]
                  ? String(settings.androidIntentOptions?.[key])
                  : ""
              }
              onChangeText={(v) =>
                handleChange("androidIntentOptions", {
                  ...settings.androidIntentOptions,
                  [key]: Number(v) || 0,
                })
              }
            />
          ))}
          {androidIntentBooleanInputOptions.map((key) => (
            <CheckboxButton
              key={key}
              title={key}
              checked={Boolean(settings.androidIntentOptions?.[key]) ?? false}
              onPress={() =>
                handleChange("androidIntentOptions", {
                  ...settings.androidIntentOptions,
                  [key]: !settings.androidIntentOptions?.[key],
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
  card: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 2,
    width: "100%",
  },
  mb2: { marginBottom: 8 },
  textLabel: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  textSubtle: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
  },
  row: { flexDirection: "row" },
  flexWrap: { flexWrap: "wrap" },
  text: {
    fontFamily: "monospace",
  },
  flex1: { flex: 1 },
  textInput: {
    height: 30,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
});

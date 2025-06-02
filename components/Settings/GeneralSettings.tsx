import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Platform, ScrollView, StyleSheet } from "react-native";
import { getSupportedLocales } from "expo-speech-recognition";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import { CheckboxButton, OptionButton } from "../Buttons";
import { fallbackLocales } from "../../constants/locales";

interface Props {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}

export function GeneralSettings({ value: settings, onChange: handleChange }: Props) {
  const [supportedLocales, setSupportedLocales] = useState<{
    locales: string[];
    installedLocales: string[];
  }>({ locales: [], installedLocales: [] });

  useEffect(() => {
    getSupportedLocales({
      androidRecognitionServicePackage:
        settings.androidRecognitionServicePackage,
    })
      .then(setSupportedLocales)
      .catch((err) => {
        console.log(
          "Error getting supported locales for package:",
          settings.androidRecognitionServicePackage,
          err,
        );
      });
  }, [settings.androidRecognitionServicePackage]);

  const locales =
    supportedLocales.locales.length === 0
      ? fallbackLocales
      : supportedLocales.locales;

  return (
    <View>
      <View style={[styles.row, styles.flexWrap, { flexDirection: "row", gap: 2 }]}>
        <CheckboxButton
          title="Interim Results"
          checked={Boolean(settings.interimResults)}
          onPress={() =>
            handleChange("interimResults", !settings.interimResults)
          }
        />
        <CheckboxButton
          title="Punctuation"
          checked={Boolean(settings.addsPunctuation)}
          onPress={() =>
            handleChange("addsPunctuation", !settings.addsPunctuation)
          }
        />
        <CheckboxButton
          title="OnDevice Recognition"
          checked={Boolean(settings.requiresOnDeviceRecognition)}
          onPress={() =>
            handleChange(
              "requiresOnDeviceRecognition",
              !settings.requiresOnDeviceRecognition,
            )
          }
        />
        <CheckboxButton
          title="Continuous"
          checked={Boolean(settings.continuous)}
          onPress={() => handleChange("continuous", !settings.continuous)}
        />
        <CheckboxButton
          title="Volume events"
          checked={Boolean(settings.volumeChangeEventOptions?.enabled)}
          onPress={() =>
            handleChange("volumeChangeEventOptions", {
              enabled: !settings.volumeChangeEventOptions?.enabled,
              intervalMillis: settings.volumeChangeEventOptions?.intervalMillis,
            })
          }
        />
      </View>

      <View style={styles.textOptionContainer}>
        <Text style={styles.textLabel}>Max Alternatives</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          autoCorrect={false}
          defaultValue={String(settings.maxAlternatives)}
          onChangeText={(v) => handleChange("maxAlternatives", Number(v) || 1)}
        />
      </View>
      
      <View>
        <Text style={styles.textLabel}>Locale</Text>
        <Text style={[styles.textLabel, { color: "#999" }]}>
          Your {Platform.OS} device supports {supportedLocales.locales.length}{" "}
          locales ({supportedLocales.installedLocales.length} installed)
        </Text>

        <ScrollView contentContainerStyle={[styles.row, styles.flexWrap]}>
          {locales.map((locale) => {
            const isInstalled =
              Platform.OS === "android" &&
              supportedLocales.installedLocales.includes(locale);

            return (
              <OptionButton
                key={locale}
                color={isInstalled ? "#00c853" : "#999"}
                title={
                  isInstalled
                    ? `${locale} (${
                        supportedLocales.installedLocales.includes(locale)
                          ? "installed"
                          : "not installed"
                      })`
                    : locale
                }
                active={settings.lang === locale}
                onPress={() =>
                  handleChange(
                    "lang",
                    settings.lang === locale ? undefined : locale,
                  )
                }
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  flexWrap: { flexWrap: "wrap" },
  textLabel: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  textOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  textInput: {
    height: 30,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
});

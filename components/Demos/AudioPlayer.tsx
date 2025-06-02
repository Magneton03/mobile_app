import React from "react";
import { Button } from "react-native";
import { Audio } from "expo-av";

interface Props {
  source: string;
}

export function AudioPlayer({ source }: Props) {
  const handlePlay = () => {
    Audio.Sound.createAsync({ uri: source }, { shouldPlay: true }).catch(
      (reason) => {
        console.log("Failed to play audio", reason);
      },
    );
  };

  return <Button title="Play back recording" onPress={handlePlay} />;
}

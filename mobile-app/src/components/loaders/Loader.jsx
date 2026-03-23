import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { COLORS } from "../../config/theme";

export default function Loader({ message = "Loading..." }) {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text className="text-muted text-sm mt-3">{message}</Text>
    </View>
  );
}
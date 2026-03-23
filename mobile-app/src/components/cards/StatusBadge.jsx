import React from "react";
import { View, Text } from "react-native";
import { getStatusColor, getStatusLightColor } from "../../utils/helpers";
import { ORDER_STATUS_LABELS } from "../../utils/constants";

export default function StatusBadge({ status, size = "md" }) {
  const color = getStatusColor(status);
  const bgColor = getStatusLightColor(status);
  const label = ORDER_STATUS_LABELS[status] || status;
  const textSize = size === "sm" ? 10 : 12;
  const paddingH = size === "sm" ? 8 : 10;
  const paddingV = size === "sm" ? 3 : 4;

  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: paddingH,
      paddingVertical: paddingV, borderRadius: 999, alignSelf: "flex-start" }}>
      <Text style={{ color, fontSize: textSize, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
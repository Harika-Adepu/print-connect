import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate, shortOrderId } from "../../utils/helpers";
import { SHADOW } from "../../config/theme";

export default function OrderCard({ order, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      className="bg-card rounded-2xl p-4 mb-3" style={SHADOW.sm}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink font-bold text-base">{shortOrderId(order._id)}</Text>
        <StatusBadge status={order.status} size="sm" />
      </View>
      <Text className="text-ink-soft text-sm mb-3">
        {order.product?.name || "Product"}{"  ·  "}
        <Text className="text-muted">Qty: {order.quantity}</Text>
      </Text>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-muted text-xs">Total</Text>
          <Text className="text-ink font-semibold text-base">{formatCurrency(order.price)}</Text>
        </View>
        <View className="items-end">
          <Text className="text-muted text-xs">Placed</Text>
          <Text className="text-ink-soft text-sm">{formatDate(order.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
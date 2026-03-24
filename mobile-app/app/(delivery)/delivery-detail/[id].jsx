// app/(delivery)/delivery-detail/[id].jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMyDeliveries,
  confirmPickup,
  markDelivered,
} from "../../../src/services/delivery.service";
import Button from "../../../src/components/buttons/Button";
import Loader from "../../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../../src/config/theme";
import { formatCurrency, formatDate, shortOrderId } from "../../../src/utils/helpers";

const STATUS_STEPS = [
  { key: "assigned",  label: "Order Assigned",    emoji: "📋" },
  { key: "picked",    label: "Picked Up",          emoji: "📦" },
  { key: "delivered", label: "Delivered to Customer", emoji: "✅" },
];

export default function DeliveryDetailScreen() {
  const { id }    = useLocalSearchParams();
  const router    = useRouter();
  const [delivery, setDelivery] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);

  const fetchDelivery = async () => {
    try {
      const all = await getMyDeliveries();
      setDelivery(all.find(d => d._id === id) || null);
    } catch (_) { setDelivery(null); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchDelivery(); }, [id]));

  const handlePickup = () => {
    Alert.alert("Confirm Pickup",
      "Confirm you have picked up this order from the print shop?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Pickup", onPress: async () => {
            setActing(true);
            try {
              await confirmPickup(delivery._id);
              await fetchDelivery();
              Alert.alert("✅ Picked Up", "Head to the customer's location.");
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setActing(false); }
          },
        },
      ]
    );
  };

  const handleDeliver = () => {
    Alert.alert("Confirm Delivery",
      "Confirm you have delivered this order to the customer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Delivered", onPress: async () => {
            setActing(true);
            try {
              await markDelivered(delivery._id);
              await fetchDelivery();
              Alert.alert("🎉 Delivered!", "Order delivered successfully. Great work!");
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setActing(false); }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Loading delivery details..." />;

  if (!delivery) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface,
      alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
      <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
        Delivery not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const currentStep = STATUS_STEPS.findIndex(s => s.key === delivery.status);
  const order       = delivery.order;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center",
        padding: 20, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
            {shortOrderId(order?._id)}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            Assigned {formatDate(delivery.createdAt)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Delivery progress ── */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
          padding: 16, marginBottom: 16, ...SHADOW.sm }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
            marginBottom: 16 }}>
            Delivery Progress
          </Text>
          {STATUS_STEPS.map((step, index) => {
            const isDone    = index <= currentStep;
            const isCurrent = index === currentStep;
            return (
              <View key={step.key} style={{ flexDirection: "row",
                alignItems: "flex-start", marginBottom: 8 }}>
                <View style={{ alignItems: "center", width: 32 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: isDone ? COLORS.success : COLORS.border,
                    alignItems: "center", justifyContent: "center",
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: COLORS.successLight || "#DCFCE7",
                  }}>
                    <Text style={{ fontSize: 12 }}>
                      {isDone ? "✓" : step.emoji}
                    </Text>
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={{ width: 2, height: 24,
                      backgroundColor: index < currentStep ? COLORS.success : COLORS.border,
                      marginTop: 2 }} />
                  )}
                </View>
                <View style={{ marginLeft: 12, paddingTop: 4 }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: isCurrent ? "700" : "400",
                    color: isDone ? COLORS.success : COLORS.muted,
                  }}>
                    {step.label}
                  </Text>
                  {step.key === "picked" && delivery.pickupTime && (
                    <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                      {formatDate(delivery.pickupTime)}
                    </Text>
                  )}
                  {step.key === "delivered" && delivery.deliveryTime && (
                    <Text style={{ fontSize: 11, color: COLORS.success, marginTop: 2 }}>
                      {formatDate(delivery.deliveryTime)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Action button ── */}
        {delivery.status === "assigned" && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ backgroundColor: "#CFFAFE", borderRadius: 14,
              padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: COLORS.info, fontWeight: "600" }}>
                📍 Go to the print shop and collect this order, then confirm pickup.
              </Text>
            </View>
            <Button title="✅ Confirm Pickup" onPress={handlePickup}
              loading={acting} size="lg" />
          </View>
        )}

        {delivery.status === "picked" && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ backgroundColor: "#FEF3C7", borderRadius: 14,
              padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: COLORS.warning, fontWeight: "600" }}>
                🚚 Deliver this order to the customer, then confirm delivery.
              </Text>
            </View>
            <Button title="📦 Mark as Delivered" onPress={handleDeliver}
              loading={acting} size="lg" />
          </View>
        )}

        {delivery.status === "delivered" && (
          <View style={{ backgroundColor: "#DCFCE7", borderRadius: 14,
            padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🎉</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: COLORS.success }}>
                Delivered Successfully!</Text>
              <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                {formatDate(delivery.deliveryTime)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Customer info ── */}
        <DetailCard title="Customer Details">
          <DetailRow label="Name"  value={order?.customer?.name  || "—"} />
          <DetailRow label="Email" value={order?.customer?.email || "—"} />
          {order?.customer?.phone && (
            <DetailRow label="Phone" value={order.customer.phone} />
          )}
        </DetailCard>

        {/* ── Order info ── */}
        <DetailCard title="Order Details">
          <DetailRow label="Product"  value={order?.product?.name || "—"} />
          <DetailRow label="Quantity" value={String(order?.quantity || "—")} />
          <DetailRow label="Amount"   value={formatCurrency(order?.price)} bold />
          <DetailRow label="Color"    value={order?.color    || "—"} />
          <DetailRow label="Language" value={order?.language || "—"} />
        </DetailCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailCard({ title, children }) {
  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
      marginBottom: 16, ...SHADOW.sm }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
        marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value, bold }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: bold ? "800" : "600",
        color: COLORS.ink, textAlign: "right", flex: 1 }}>{value}</Text>
    </View>
  );
}
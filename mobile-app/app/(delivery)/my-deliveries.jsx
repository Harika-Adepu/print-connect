// app/(delivery)/my-deliveries.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMyDeliveries,
  confirmPickup,
  markDelivered,
} from "../../src/services/delivery.service";
import Loader from "../../src/components/loaders/Loader";
import Button from "../../src/components/buttons/Button";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

const FILTERS = [
  { label: "All",         value: null },
  { label: "Assigned",    value: "assigned" },
  { label: "In Transit",  value: "picked" },
  { label: "Delivered",   value: "delivered" },
];

const STATUS_CONFIG = {
  assigned:  { label: "Assigned",   color: COLORS.info,    bg: "#CFFAFE" },
  picked:    { label: "In Transit", color: COLORS.warning, bg: "#FEF3C7" },
  delivered: { label: "Delivered",  color: COLORS.success, bg: "#DCFCE7" },
};

export default function MyDeliveriesScreen() {
  const router = useRouter();
  const [deliveries,  setDeliveries]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [actionId,    setActionId]    = useState(null);

  const fetchDeliveries = async () => {
    try { setDeliveries(await getMyDeliveries()); }
    catch (_) { setDeliveries([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchDeliveries(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchDeliveries(); };

  const filtered = activeFilter
    ? deliveries.filter(d => d.status === activeFilter)
    : deliveries;

  const handlePickup = (delivery) => {
    Alert.alert("Confirm Pickup",
      `Confirm pickup of ${shortOrderId(delivery.order?._id)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm", onPress: async () => {
            setActionId(delivery._id);
            try {
              await confirmPickup(delivery._id);
              await fetchDeliveries();
              Alert.alert("✅ Picked Up!", "Now deliver to the customer.");
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setActionId(null); }
          },
        },
      ]
    );
  };

  const handleDeliver = (delivery) => {
    Alert.alert("Mark as Delivered",
      `Confirm delivery of ${shortOrderId(delivery.order?._id)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm", onPress: async () => {
            setActionId(delivery._id);
            try {
              await markDelivered(delivery._id);
              await fetchDeliveries();
              Alert.alert("🎉 Delivered!", "Great job! Order delivered successfully.");
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setActionId(null); }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Loading your deliveries..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>My Deliveries</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {deliveries.length} total · {filtered.length} shown
        </Text>
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal data={FILTERS} keyExtractor={i => String(i.value)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 14 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.value)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: activeFilter === item.value ? COLORS.primary : COLORS.card,
              borderWidth: 1,
              borderColor: activeFilter === item.value ? COLORS.primary : COLORS.border,
            }}
          >
            <Text style={{
              fontSize: 12, fontWeight: "600",
              color: activeFilter === item.value ? COLORS.white : COLORS.inkSoft,
            }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Deliveries list */}
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.assigned;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/(delivery)/delivery-detail/${item._id}`)}
              activeOpacity={0.85}
              style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
                marginBottom: 12, ...SHADOW.sm }}
            >
              {/* Top row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
                  {shortOrderId(item.order?._id)}
                </Text>
                <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10,
                  paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color }}>
                    {cfg.label}
                  </Text>
                </View>
              </View>

              {/* Customer + product */}
              <Text style={{ fontSize: 13, color: COLORS.inkSoft, fontWeight: "600",
                marginBottom: 2 }}>
                👤 {item.order?.customer?.name || "Customer"}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>
                📦 {item.order?.product?.name || "Product"} ·{" "}
                {formatCurrency(item.order?.price)}
              </Text>

              {/* Timestamps */}
              {item.pickupTime && (
                <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
                  📍 Picked up: {formatDate(item.pickupTime)}
                </Text>
              )}
              {item.deliveryTime && (
                <Text style={{ fontSize: 11, color: COLORS.success, marginBottom: 2 }}>
                  ✅ Delivered: {formatDate(item.deliveryTime)}
                </Text>
              )}

              {/* Action buttons */}
              {item.status === "assigned" && (
                <View style={{ marginTop: 12 }}>
                  <Button title="✅ Confirm Pickup" onPress={() => handlePickup(item)}
                    loading={actionId === item._id} size="sm" />
                </View>
              )}
              {item.status === "picked" && (
                <View style={{ marginTop: 12 }}>
                  <Button title="📦 Mark as Delivered" onPress={() => handleDeliver(item)}
                    loading={actionId === item._id} size="sm" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🚚</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
              No deliveries found
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
              {activeFilter ? "Try a different filter" : "Accept available orders to get started"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
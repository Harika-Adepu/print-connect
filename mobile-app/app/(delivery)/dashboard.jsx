// app/(delivery)/dashboard.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getDeliveryStats,
  getMyDeliveries,
  getAvailableOrders,
  confirmPickup,
  markDelivered,
} from "../../src/services/delivery.service";
import { useAuth } from "../../src/store/index";
import Loader from "../../src/components/loaders/Loader";
import Button from "../../src/components/buttons/Button";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats,      setStats]      = useState({ total: 0, assigned: 0, picked: 0, delivered: 0 });
  const [active,     setActive]     = useState([]); // assigned + picked
  const [available,  setAvailable]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId,   setActionId]   = useState(null); // which delivery is being updated

  const fetchData = async () => {
    try {
      const [statsData, myData, availData] = await Promise.all([
        getDeliveryStats(),
        getMyDeliveries(),
        getAvailableOrders(),
      ]);
      setStats(statsData);
      setActive(myData.filter(d => d.status !== "delivered"));
      setAvailable(availData);
    } catch (_) {
      setStats({ total: 0, assigned: 0, picked: 0, delivered: 0 });
      setActive([]);
      setAvailable([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Confirm pickup ──────────────────────────────────────────────────────────
  const handlePickup = (delivery) => {
    Alert.alert(
      "Confirm Pickup",
      `Confirm you have picked up order ${shortOrderId(delivery.order?._id)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Pickup",
          onPress: async () => {
            setActionId(delivery._id);
            try {
              await confirmPickup(delivery._id);
              await fetchData();
              Alert.alert("✅ Picked Up", "Pickup confirmed. Deliver to customer.");
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally { setActionId(null); }
          },
        },
      ]
    );
  };

  // ── Mark delivered ──────────────────────────────────────────────────────────
  const handleDeliver = (delivery) => {
    Alert.alert(
      "Mark as Delivered",
      `Confirm delivery of order ${shortOrderId(delivery.order?._id)} to customer?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Delivered",
          onPress: async () => {
            setActionId(delivery._id);
            try {
              await markDelivered(delivery._id);
              await fetchData();
              Alert.alert("🎉 Delivered!", "Order has been delivered successfully.");
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally { setActionId(null); }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Loading dashboard..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: COLORS.muted, fontWeight: "500",
            textTransform: "uppercase", letterSpacing: 1 }}>
            Delivery Agent
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.ink, marginTop: 2 }}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </Text>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <StatCard label="Total Jobs"  value={stats.total}     color={COLORS.primary} bg={COLORS.primaryLight} />
          <StatCard label="Assigned"    value={stats.assigned}  color={COLORS.info}    bg="#CFFAFE" />
          <StatCard label="In Transit"  value={stats.picked}    color={COLORS.warning} bg="#FEF3C7" />
          <StatCard label="Delivered"   value={stats.delivered} color={COLORS.success} bg="#DCFCE7" />
        </View>

        {/* Available orders banner */}
        {available.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(delivery)/available")}
            activeOpacity={0.85}
            style={{ backgroundColor: "#DCFCE7", borderRadius: 16, padding: 16,
              marginBottom: 24, flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "#86EFAC" }}
          >
            <Text style={{ fontSize: 28, marginRight: 14 }}>📬</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.success }}>
                {available.length} Order{available.length !== 1 ? "s" : ""} Available!
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                Tap to view and accept deliveries
              </Text>
            </View>
            <Text style={{ color: COLORS.success, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Active deliveries */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
              Active Deliveries ({active.length})
            </Text>
            {active.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/(delivery)/my-deliveries")}>
                <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>
                  View all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {active.length === 0 ? (
            <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 32,
              alignItems: "center", ...SHADOW.sm }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🚚</Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                No active deliveries</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4,
                textAlign: "center" }}>
                Accept available orders to start delivering
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(delivery)/available")}
                style={{ marginTop: 16, backgroundColor: COLORS.primary,
                  paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              >
                <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 13 }}>
                  View Available Orders
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            active.map(delivery => (
              <ActiveDeliveryCard
                key={delivery._id}
                delivery={delivery}
                onPickup={() => handlePickup(delivery)}
                onDeliver={() => handleDeliver(delivery)}
                onPress={() => router.push(`/(delivery)/delivery-detail/${delivery._id}`)}
                loading={actionId === delivery._id}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, bg }) {
  return (
    <View style={{ width: "47%", backgroundColor: bg, borderRadius: 14,
      padding: 14, ...SHADOW.sm }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 11, color, fontWeight: "600", marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ActiveDeliveryCard({ delivery, onPickup, onDeliver, onPress, loading }) {
  const isAssigned = delivery.status === "assigned";
  const isPicked   = delivery.status === "picked";

  const statusColor = isAssigned ? COLORS.info : COLORS.warning;
  const statusBg    = isAssigned ? "#CFFAFE"   : "#FEF3C7";
  const statusLabel = isAssigned ? "Assigned"  : "In Transit";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
        marginBottom: 12, ...SHADOW.sm }}>
      {/* Header row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
          {shortOrderId(delivery.order?._id)}
        </Text>
        <View style={{ backgroundColor: statusBg, paddingHorizontal: 10,
          paddingVertical: 4, borderRadius: 999 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: statusColor }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Customer info */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 10,
        padding: 10, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
          👤 {delivery.order?.customer?.name || "Customer"}
        </Text>
        {delivery.order?.customer?.phone && (
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            📞 {delivery.order.customer.phone}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
          ✉️ {delivery.order?.customer?.email || "—"}
        </Text>
      </View>

      {/* Product + amount */}
      <View style={{ flexDirection: "row", justifyContent: "space-between",
        marginBottom: 14 }}>
        <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
          📦 {delivery.order?.product?.name || "Product"}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
          {formatCurrency(delivery.order?.price)}
        </Text>
      </View>

      {/* Action button */}
      {isAssigned && (
        <Button
          title="✅ Confirm Pickup"
          onPress={onPickup}
          loading={loading}
          size="md"
        />
      )}
      {isPicked && (
        <Button
          title="📦 Mark as Delivered"
          onPress={onDeliver}
          loading={loading}
          size="md"
        />
      )}
    </TouchableOpacity>
  );
}
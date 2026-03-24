// app/(delivery)/available.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAvailableOrders,
  acceptDelivery,
} from "../../src/services/delivery.service";
import Loader from "../../src/components/loaders/Loader";
import Button from "../../src/components/buttons/Button";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

export default function AvailableOrdersScreen() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchOrders = async () => {
    try { setOrders(await getAvailableOrders()); }
    catch (_) { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrders(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const handleAccept = (order) => {
    Alert.alert(
      "Accept Delivery",
      `Accept delivery of order ${shortOrderId(order._id)} for ${order.customer?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            setAcceptingId(order._id);
            try {
              await acceptDelivery(order._id);
              Alert.alert(
                "✅ Accepted!",
                "Order assigned to you. Head to the print shop for pickup.",
                [{ text: "OK", onPress: fetchOrders }]
              );
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally { setAcceptingId(null); }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Fetching available orders..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>
          Available Orders
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} ready for pickup
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 18,
            padding: 16, marginBottom: 14, ...SHADOW.sm }}>
            {/* Top row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink }}>
                {shortOrderId(item._id)}
              </Text>
              <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 10,
                paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.success }}>
                  READY FOR PICKUP
                </Text>
              </View>
            </View>

            {/* Customer card */}
            <View style={{ backgroundColor: COLORS.surface, borderRadius: 12,
              padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink,
                marginBottom: 4 }}>
                👤 Customer Details
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
                {item.customer?.name || "—"}
              </Text>
              {item.customer?.phone && (
                <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                  📞 {item.customer.phone}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                ✉️ {item.customer?.email || "—"}
              </Text>
            </View>

            {/* Order details */}
            <View style={{ marginBottom: 14 }}>
              <DetailRow label="Product"  value={item.product?.name || "—"} />
              <DetailRow label="Quantity" value={String(item.quantity)} />
              <DetailRow label="Amount"   value={formatCurrency(item.price)} bold />
              <DetailRow label="Date"     value={formatDate(item.createdAt)} />
            </View>

            {/* Accept button */}
            <Button
              title="Accept This Delivery"
              onPress={() => handleAccept(item)}
              loading={acceptingId === item._id}
              size="md"
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
            <Text style={{ fontSize: 17, fontWeight: "700", color: COLORS.ink }}>
              No orders available
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 6,
              textAlign: "center", paddingHorizontal: 40 }}>
              Pull down to refresh. New orders will appear when the owner
              dispatches them.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function DetailRow({ label, value, bold }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      marginBottom: 6 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: bold ? "800" : "600",
        color: COLORS.ink }}>
        {value}
      </Text>
    </View>
  );
}
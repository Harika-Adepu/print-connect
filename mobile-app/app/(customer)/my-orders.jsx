// app/(customer)/my-orders.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMyOrders } from "../../src/services/order.service";
import OrderCard from "../../src/components/cards/OrderCard";
import Loader from "../../src/components/loaders/Loader";
import { COLORS } from "../../src/config/theme";
import { ORDER_STATUS_LABELS } from "../../src/utils/constants";

const FILTER_TABS = [
  { label: "All", value: null },
  { label: "Active", value: "active" },
  { label: "Payment Due", value: "payment" },
  { label: "Completed", value: "completed" },
];

export default function MyOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (_) {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const filteredOrders = orders.filter((o) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchesId = o._id.toLowerCase().includes(q);
      const matchesProduct = o.product?.name?.toLowerCase().includes(q);
      const matchesStatus = ORDER_STATUS_LABELS[o.status]?.toLowerCase().includes(q);
      if (!matchesId && !matchesProduct && !matchesStatus) return false;
    }

    // Tab filter
    if (activeFilter === "active") {
      return !["ORDER_COMPLETED", "DESIGN_REJECTED"].includes(o.status);
    }
    if (activeFilter === "payment") {
      return ["ADVANCE_PAYMENT_PENDING", "REMAINING_PAYMENT_PENDING"].includes(o.status);
    }
    if (activeFilter === "completed") {
      return o.status === "ORDER_COMPLETED";
    }
    return true;
  });

  if (loading) return <Loader message="Loading your orders..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>
          My Orders
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 20, marginBottom: 14,
        backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1,
        borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 10,
        flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search by product, status..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, fontSize: 14, color: COLORS.ink }}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16,
        marginBottom: 16, gap: 8 }}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={String(tab.value)}
            onPress={() => setActiveFilter(tab.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: activeFilter === tab.value
                ? COLORS.primary : COLORS.card,
              borderWidth: 1,
              borderColor: activeFilter === tab.value
                ? COLORS.primary : COLORS.border,
            }}
          >
            <Text style={{
              fontSize: 12, fontWeight: "600",
              color: activeFilter === tab.value ? COLORS.white : COLORS.inkSoft,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/(customer)/order-detail/${item._id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
              No orders found
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
              {search ? "Try a different search term" : "Place your first order!"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
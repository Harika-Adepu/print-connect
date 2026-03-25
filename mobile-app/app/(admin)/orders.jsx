// app/(admin)/orders.jsx
import React, { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllOrders } from "../../src/services/admin.service";
import StatusBadge from "../../src/components/cards/StatusBadge";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { ORDER_STATUS_LABELS } from "../../src/utils/constants";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

export default function AdminOrdersScreen() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState("");

  const fetchOrders = async () => {
    try { setOrders(await getAllOrders()); }
    catch (_) { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrders(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.product?.name?.toLowerCase().includes(q) ||
      ORDER_STATUS_LABELS[o.status]?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader message="Loading all orders..." />;

  // Quick revenue stats
  const totalRevenue = orders
    .filter(o => o.status === "ORDER_COMPLETED")
    .reduce((s, o) => s + (o.price || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>All Orders</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {orders.length} orders · Revenue: {formatCurrency(totalRevenue)}
        </Text>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.card,
        borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 14, paddingVertical: 10,
        flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput placeholder="Search customer, product, status..."
          placeholderTextColor={COLORS.muted} value={search} onChangeText={setSearch}
          style={{ flex: 1, fontSize: 14, color: COLORS.ink }} />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered} keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor="#7C3AED" />}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
            padding: 16, marginBottom: 12, ...SHADOW.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontWeight: "800", color: COLORS.ink, fontSize: 15 }}>
                {shortOrderId(item._id)}</Text>
              <StatusBadge status={item.status} size="sm" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: COLORS.inkSoft, fontWeight: "600" }}>
                👤 {item.customer?.name || "—"}</Text>
              <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
                {item.product?.name || "—"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(item.createdAt)}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
                {formatCurrency(item.price)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
              No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
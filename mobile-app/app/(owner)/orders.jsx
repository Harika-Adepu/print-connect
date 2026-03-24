// app/(owner)/orders.jsx
import React, { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllOrders } from "../../src/services/owner.service";
import StatusBadge from "../../src/components/cards/StatusBadge";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../src/utils/constants";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

const FILTERS = [
  { label: "All", value: null },
  { label: "New", value: ORDER_STATUS.ORDER_PLACED },
  { label: "Adv. Paid", value: ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED },
  { label: "Printing", value: ORDER_STATUS.PRINTING_IN_PROGRESS },
  { label: "Rem. Paid", value: ORDER_STATUS.REMAINING_PAYMENT_COMPLETED },
  { label: "Delivery", value: ORDER_STATUS.OUT_FOR_DELIVERY },
  { label: "Done", value: ORDER_STATUS.ORDER_COMPLETED },
];

export default function OwnerOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try { setOrders(await getAllOrders()); }
    catch (_) { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrders(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const filtered = orders.filter(o => {
    if (search) {
      const q = search.toLowerCase();
      if (!o._id.toLowerCase().includes(q) &&
          !o.product?.name?.toLowerCase().includes(q) &&
          !o.customer?.name?.toLowerCase().includes(q) &&
          !ORDER_STATUS_LABELS[o.status]?.toLowerCase().includes(q)) return false;
    }
    if (activeFilter) return o.status === activeFilter;
    return true;
  });

  if (loading) return <Loader message="Loading all orders..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>All Orders</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {orders.length} total · {filtered.length} shown
        </Text>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 20, marginBottom: 12, backgroundColor: COLORS.card,
        borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput placeholder="Search customer, product, status..." value={search}
          onChangeText={setSearch} placeholderTextColor={COLORS.muted}
          style={{ flex: 1, fontSize: 14, color: COLORS.ink }} />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <FlatList
        horizontal data={FILTERS} keyExtractor={i => String(i.value)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveFilter(item.value)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: activeFilter === item.value ? COLORS.primary : COLORS.card,
              borderWidth: 1,
              borderColor: activeFilter === item.value ? COLORS.primary : COLORS.border }}>
            <Text style={{ fontSize: 12, fontWeight: "600",
              color: activeFilter === item.value ? COLORS.white : COLORS.inkSoft }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      <FlatList
        data={filtered} keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(owner)/order-detail/${item._id}`)}
            activeOpacity={0.85}
            style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
              marginBottom: 12, ...SHADOW.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontWeight: "800", color: COLORS.ink, fontSize: 15 }}>
                {shortOrderId(item._id)}</Text>
              <StatusBadge status={item.status} size="sm" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: COLORS.inkSoft, fontWeight: "600" }}>
                👤 {item.customer?.name || "Customer"}</Text>
              <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
                {item.product?.name || "Product"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(item.createdAt)}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
                {formatCurrency(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
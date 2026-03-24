// app/(owner)/dashboard.jsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllOrders, getMyRequests } from "../../src/services/owner.service";
import { useAuth } from "../../src/store/index";
import Loader from "../../src/components/loaders/Loader";
import StatusBadge from "../../src/components/cards/StatusBadge";
import { COLORS, SHADOW } from "../../src/config/theme";
import { ORDER_STATUS } from "../../src/utils/constants";
import { formatCurrency, formatDate, shortOrderId } from "../../src/utils/helpers";

export default function OwnerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersData, requestsData] = await Promise.all([
        getAllOrders(),
        getMyRequests(),
      ]);
      setOrders(ordersData);
      setRequests(requestsData);
    } catch (_) {
      setOrders([]); setRequests([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Stats
  const newOrders      = orders.filter(o => o.status === ORDER_STATUS.ORDER_PLACED).length;
  const inProgress     = orders.filter(o => o.status === ORDER_STATUS.PRINTING_IN_PROGRESS).length;
  const outDelivery    = orders.filter(o => o.status === ORDER_STATUS.OUT_FOR_DELIVERY).length;
  const completed      = orders.filter(o => o.status === ORDER_STATUS.ORDER_COMPLETED).length;
  const totalRevenue   = orders
    .filter(o => o.status === ORDER_STATUS.ORDER_COMPLETED)
    .reduce((s, o) => s + (o.price || 0), 0);
  const pendingRevenue = orders
    .filter(o => !o.payment?.remainingPaid && o.price)
    .reduce((s, o) => {
      const adv = Math.round(o.price * 0.4);
      return s + (o.payment?.advancePaid ? o.price - adv : o.price);
    }, 0);

  const actionRequired = orders.filter(o =>
    [ORDER_STATUS.ORDER_PLACED, ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED,
     ORDER_STATUS.REMAINING_PAYMENT_COMPLETED].includes(o.status)
  );
  const pendingRequests  = requests.filter(r => r.status === "PENDING").length;
  const approvedRequests = requests.filter(r => r.status === "APPROVED").length;

  if (loading) return <Loader message="Loading dashboard..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: COLORS.muted, fontWeight: "500",
            textTransform: "uppercase", letterSpacing: 1 }}>Owner Panel</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.ink, marginTop: 2 }}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </Text>
        </View>

        {/* Revenue row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.ink, borderRadius: 18,
            padding: 16, ...SHADOW.md }}>
            <Text style={{ fontSize: 11, color: COLORS.muted, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 1 }}>Total Revenue</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.white, marginTop: 4 }}>
              {formatCurrency(totalRevenue)}</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
              {completed} completed</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#FEF3C7", borderRadius: 18,
            padding: 16, ...SHADOW.sm }}>
            <Text style={{ fontSize: 11, color: COLORS.warning, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 1 }}>Pending Revenue</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.warning, marginTop: 4 }}>
              {formatCurrency(pendingRevenue)}</Text>
            <Text style={{ fontSize: 11, color: COLORS.warning, marginTop: 4 }}>Awaiting payments</Text>
          </View>
        </View>

        {/* Order stats */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <StatCard label="New Orders"       value={newOrders}   color={COLORS.info}    bg="#CFFAFE" />
          <StatCard label="Printing"         value={inProgress}  color={COLORS.primary} bg={COLORS.primaryLight} />
          <StatCard label="Out for Delivery" value={outDelivery} color={COLORS.warning} bg="#FEF3C7" />
          <StatCard label="Completed"        value={completed}   color={COLORS.success} bg="#DCFCE7" />
        </View>

        {/* Admin requests banner */}
        <TouchableOpacity onPress={() => router.push("/(owner)/requests")}
          activeOpacity={0.85}
          style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
            marginBottom: 24, flexDirection: "row", alignItems: "center", ...SHADOW.sm }}>
          <Text style={{ fontSize: 28, marginRight: 14 }}>📨</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}>Admin Requests</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              {pendingRequests} pending · {approvedRequests} approved
            </Text>
          </View>
          <Text style={{ color: COLORS.primary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Action required */}
        {actionRequired.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <SectionHeader title={`⚡ Action Required (${actionRequired.length})`}
              onViewAll={() => router.push("/(owner)/orders")} />
            {actionRequired.slice(0, 3).map(o => (
              <ActionCard key={o._id} order={o}
                onPress={() => router.push(`/(owner)/order-detail/${o._id}`)} />
            ))}
          </View>
        )}

        {/* Recent orders */}
        <SectionHeader title="Recent Orders" onViewAll={() => router.push("/(owner)/orders")} />
        {orders.slice(0, 4).map(order => (
          <TouchableOpacity key={order._id}
            onPress={() => router.push(`/(owner)/order-detail/${order._id}`)}
            activeOpacity={0.85}
            style={{ backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
              marginBottom: 10, ...SHADOW.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontWeight: "700", color: COLORS.ink, fontSize: 14 }}>
                {shortOrderId(order._id)}</Text>
              <StatusBadge status={order.status} size="sm" />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>
                👤 {order.customer?.name || "Customer"}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.ink }}>
                {formatCurrency(order.price)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <View style={{ width: "47%", backgroundColor: bg, borderRadius: 14, padding: 14, ...SHADOW.sm }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 11, color, fontWeight: "600", marginTop: 2 }}>{label}</Text>
    </View>
  );
}
function SectionHeader({ title, onViewAll }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
function ActionCard({ order, onPress }) {
  const actionText = {
    [ORDER_STATUS.ORDER_PLACED]: "Approve or reject design",
    [ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED]: "Start printing",
    [ORDER_STATUS.REMAINING_PAYMENT_COMPLETED]: "Send out for delivery",
  };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ backgroundColor: "#FEF3C7", borderRadius: 14, padding: 14,
        marginBottom: 10, borderWidth: 1, borderColor: "#FDE68A" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontWeight: "700", color: COLORS.ink, fontSize: 14 }}>
          {shortOrderId(order._id)}</Text>
        <Text style={{ fontSize: 12, color: COLORS.muted }}>{formatDate(order.createdAt)}</Text>
      </View>
      <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: "600" }}>
        → {actionText[order.status] || "Update status"}
      </Text>
    </TouchableOpacity>
  );
}
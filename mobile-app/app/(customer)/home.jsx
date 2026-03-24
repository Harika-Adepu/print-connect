// app/(customer)/home.jsx
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/store/index";
import { getMyOrders } from "../../src/services/order.service";
import OrderCard from "../../src/components/cards/OrderCard";
import Loader from "../../src/components/loaders/Loader";
import Button from "../../src/components/buttons/Button";
import { COLORS, SHADOW } from "../../src/config/theme";
import { ORDER_STATUS } from "../../src/utils/constants";
import { formatCurrency } from "../../src/utils/helpers";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  // Stats
  const activeOrders = orders.filter(
    (o) => o.status !== ORDER_STATUS.ORDER_COMPLETED &&
            o.status !== ORDER_STATUS.DESIGN_REJECTED
  );
  const pendingPayments = orders.filter(
    (o) => o.status === ORDER_STATUS.ADVANCE_PAYMENT_PENDING ||
            o.status === ORDER_STATUS.REMAINING_PAYMENT_PENDING
  );
  const recentOrders = orders.slice(0, 3);

  if (loading) return <Loader message="Loading your dashboard..." />;

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
            Good day,
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.ink,
            marginTop: 2 }}>
            {user?.name?.split(" ")[0]} 👋
          </Text>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
          <StatCard
            label="Active Orders"
            value={activeOrders.length}
            color={COLORS.primary}
            bg={COLORS.primaryLight}
          />
          <StatCard
            label="Pending Payments"
            value={pendingPayments.length}
            color={COLORS.warning}
            bg="#FEF3C7"
          />
        </View>

        {/* Quick action */}
        <View style={{ marginBottom: 28 }}>
          <Button
            title="➕  Place New Order"
            onPress={() => router.push("/(customer)/new-order")}
            size="lg"
          />
        </View>

        {/* Recent orders */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: COLORS.ink }}>
              Recent Orders
            </Text>
            {orders.length > 3 && (
              <TouchableOpacity onPress={() => router.push("/(customer)/my-orders")}>
                <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>
                  View all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {recentOrders.length === 0 ? (
            <EmptyState onPress={() => router.push("/(customer)/new-order")} />
          ) : (
            recentOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onPress={() =>
                  router.push(`/(customer)/order-detail/${order._id}`)
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 16,
      padding: 16, ...SHADOW.sm }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 12, color, fontWeight: "600", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState({ onPress }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 40,
      backgroundColor: COLORS.card, borderRadius: 20, ...SHADOW.sm }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🖨️</Text>
      <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink,
        marginBottom: 6 }}>No orders yet</Text>
      <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20,
        textAlign: "center", paddingHorizontal: 24 }}>
        Place your first print order and track it in real-time
      </Text>
      <TouchableOpacity onPress={onPress}
        style={{ backgroundColor: COLORS.primary, paddingHorizontal: 24,
          paddingVertical: 12, borderRadius: 12 }}>
        <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 14 }}>
          Place Order
        </Text>
      </TouchableOpacity>
    </View>
  );
}
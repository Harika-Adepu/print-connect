// app/(admin)/dashboard.jsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAdminStats, getAdminRequests } from "../../src/services/admin.service";
import { useAuth } from "../../src/store/index";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency } from "../../src/utils/helpers";
import { ORDER_STATUS_LABELS } from "../../src/utils/constants";

const ADMIN_COLOR = "#7C3AED";
const ADMIN_BG    = "#EDE9FE";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats,      setStats]      = useState(null);
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, reqData] = await Promise.all([
        getAdminStats(),
        getAdminRequests({ status: "PENDING" }),
      ]);
      setStats(statsData);
      setRequests(reqData);
    } catch (_) {
      setStats(null);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <Loader message="Loading admin dashboard..." />;

  // Build users by role map
  const roleMap = {};
  (stats?.usersByRole || []).forEach(r => { roleMap[r._id] = r.count; });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={ADMIN_COLOR} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: COLORS.muted, fontWeight: "500",
            textTransform: "uppercase", letterSpacing: 1 }}>Admin Panel</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.ink, marginTop: 2 }}>
            Hello, {user?.name?.split(" ")[0]} ⚙️
          </Text>
        </View>

        {/* Revenue + orders hero */}
        <View style={{ backgroundColor: ADMIN_COLOR, borderRadius: 20,
          padding: 20, marginBottom: 16, ...SHADOW.md }}>
          <Text style={{ fontSize: 12, color: "#C4B5FD", fontWeight: "600",
            textTransform: "uppercase", letterSpacing: 1 }}>Total Revenue</Text>
          <Text style={{ fontSize: 32, fontWeight: "800", color: COLORS.white, marginTop: 4 }}>
            {formatCurrency(stats?.totalRevenue || 0)}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 16, gap: 20 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.white }}>
                {stats?.totalOrders || 0}</Text>
              <Text style={{ fontSize: 11, color: "#C4B5FD" }}>Total Orders</Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.white }}>
                {stats?.completedOrders || 0}</Text>
              <Text style={{ fontSize: 11, color: "#C4B5FD" }}>Completed</Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.white }}>
                {stats?.totalUsers || 0}</Text>
              <Text style={{ fontSize: 11, color: "#C4B5FD" }}>Total Users</Text>
            </View>
          </View>
        </View>

        {/* System stats grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <StatCard label="Products"   value={stats?.totalProducts  || 0} color={COLORS.primary} bg={COLORS.primaryLight} />
          <StatCard label="Templates"  value={stats?.totalTemplates || 0} color={COLORS.info}    bg="#CFFAFE" />
          <StatCard label="Customers"  value={roleMap["customer"]   || 0} color={COLORS.success} bg="#DCFCE7" />
          <StatCard label="Owners"     value={roleMap["owner"]      || 0} color={COLORS.warning} bg="#FEF3C7" />
        </View>

        {/* Pending requests alert */}
        {requests.length > 0 && (
          <TouchableOpacity onPress={() => router.push("/(admin)/requests")}
            activeOpacity={0.85}
            style={{ backgroundColor: "#FEF3C7", borderRadius: 16, padding: 16,
              marginBottom: 20, flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "#FDE68A" }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.warning }}>
                {requests.length} Pending Request{requests.length !== 1 ? "s" : ""}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                Owner requests awaiting your review
              </Text>
            </View>
            <Text style={{ color: COLORS.warning, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Quick nav grid */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft,
          textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Quick Access
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            { emoji: "📨", label: "Requests",  badge: stats?.pendingRequests, route: "/(admin)/requests" },
            { emoji: "📦", label: "Orders",    badge: null, route: "/(admin)/orders" },
            { emoji: "🗂️", label: "Products", badge: null, route: "/(admin)/products" },
            { emoji: "👥", label: "Users",     badge: null, route: "/(admin)/users" },
          ].map(item => (
            <TouchableOpacity key={item.label}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
              style={{ width: "47%", backgroundColor: COLORS.card, borderRadius: 16,
                padding: 16, ...SHADOW.sm }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}>
                {item.label}</Text>
              {item.badge > 0 && (
                <View style={{ marginTop: 6, backgroundColor: "#FEF3C7",
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
                  alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.warning }}>
                    {item.badge} pending
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <View style={{ width: "47%", backgroundColor: bg, borderRadius: 14,
      padding: 14, ...SHADOW.sm }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 11, color, fontWeight: "600", marginTop: 2 }}>{label}</Text>
    </View>
  );
}
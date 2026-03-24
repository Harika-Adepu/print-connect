// app/(delivery)/profile.jsx
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { useAuth } from "../../src/store/index";
import { getDeliveryStats } from "../../src/services/delivery.service";
import { COLORS, SHADOW } from "../../src/config/theme";

export default function DeliveryProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, assigned: 0, picked: 0, delivered: 0 });

  useFocusEffect(useCallback(() => {
    getDeliveryStats().then(setStats).catch(() => {});
  }, []));

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive",
        onPress: async () => { await logout(); } },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "D";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink,
          marginBottom: 24 }}>Profile</Text>

        {/* Avatar card */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
          alignItems: "center", marginBottom: 20, ...SHADOW.sm }}>
          <View style={{ width: 72, height: 72, borderRadius: 36,
            backgroundColor: "#DCFCE7", alignItems: "center",
            justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "800",
              color: COLORS.success }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
            {user?.name}</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
            {user?.email}</Text>
          <View style={{ marginTop: 10, backgroundColor: "#DCFCE7",
            paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.success,
              textTransform: "uppercase", letterSpacing: 1 }}>🚚 Delivery Agent</Text>
          </View>
        </View>

        {/* Stats card */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
          marginBottom: 20, ...SHADOW.sm }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
            marginBottom: 16 }}>My Delivery Stats</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <MiniStat label="Total"     value={stats.total}     color={COLORS.primary} />
            <MiniStat label="Assigned"  value={stats.assigned}  color={COLORS.info} />
            <MiniStat label="Transit"   value={stats.picked}    color={COLORS.warning} />
            <MiniStat label="Done"      value={stats.delivered} color={COLORS.success} />
          </View>
        </View>

        {/* Quick links */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
          overflow: "hidden", marginBottom: 20, ...SHADOW.sm }}>
          <MenuRow emoji="📊" label="Dashboard"
            onPress={() => router.push("/(delivery)/dashboard")} />
          <MenuRow emoji="📬" label="Available Orders"
            onPress={() => router.push("/(delivery)/available")} />
          <MenuRow emoji="🚚" label="My Deliveries"
            onPress={() => router.push("/(delivery)/my-deliveries")} />
        </View>

        <TouchableOpacity onPress={handleLogout}
          style={{ backgroundColor: "#FEE2E2", borderRadius: 16,
            padding: 16, alignItems: "center" }} activeOpacity={0.8}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.danger }}>
            🚪  Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function MenuRow({ emoji, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", padding: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <Text style={{ fontSize: 20, marginRight: 14 }}>{emoji}</Text>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.ink }}>
        {label}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
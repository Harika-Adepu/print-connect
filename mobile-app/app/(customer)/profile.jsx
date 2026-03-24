// app/(customer)/profile.jsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../../src/store/index";
import { COLORS, SHADOW } from "../../src/config/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive",
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink,
          marginBottom: 28 }}>
          Profile
        </Text>

        {/* Avatar card */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
          padding: 20, alignItems: "center", marginBottom: 20, ...SHADOW.sm }}>
          <View style={{ width: 72, height: 72, borderRadius: 36,
            backgroundColor: COLORS.primaryLight,
            alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.primary }}>
              {initials}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
            {user?.name}
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
            {user?.email}
          </Text>
          <View style={{ marginTop: 10, backgroundColor: COLORS.primaryLight,
            paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.primary,
              textTransform: "uppercase", letterSpacing: 1 }}>
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Quick links */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
          overflow: "hidden", marginBottom: 20, ...SHADOW.sm }}>
          <MenuRow
            emoji="📦"
            label="My Orders"
            onPress={() => router.push("/(customer)/my-orders")}
          />
          <MenuRow
            emoji="➕"
            label="Place New Order"
            onPress={() => router.push("/(customer)/new-order")}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: "#FEE2E2", borderRadius: 16,
            padding: 16, alignItems: "center" }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.danger }}>
            🚪  Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ emoji, label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center",
        padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
    >
      <Text style={{ fontSize: 20, marginRight: 14 }}>{emoji}</Text>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.ink }}>
        {label}
      </Text>
      <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
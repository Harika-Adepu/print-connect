// app/(owner)/profile.jsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/store/index";
import { COLORS, SHADOW } from "../../src/config/theme";

export default function OwnerProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => { await logout(); } },
    ]);
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "O";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink, marginBottom: 28 }}>
          Profile</Text>

        {/* Avatar */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
          alignItems: "center", marginBottom: 20, ...SHADOW.sm }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#FEF3C7",
            alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.warning }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>{user?.name}</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{user?.email}</Text>
          <View style={{ marginTop: 10, backgroundColor: "#FEF3C7",
            paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.warning,
              textTransform: "uppercase", letterSpacing: 1 }}>🖨️ Owner</Text>
          </View>
        </View>

        {/* Quick links */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
          overflow: "hidden", marginBottom: 20, ...SHADOW.sm }}>
          <MenuRow emoji="📊" label="Dashboard"     onPress={() => router.push("/(owner)/dashboard")} />
          <MenuRow emoji="📦" label="All Orders"    onPress={() => router.push("/(owner)/orders")} />
          <MenuRow emoji="🗂️" label="Products"     onPress={() => router.push("/(owner)/products")} />
          <MenuRow emoji="📨" label="Admin Requests" onPress={() => router.push("/(owner)/requests")} />
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

function MenuRow({ emoji, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", padding: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <Text style={{ fontSize: 20, marginRight: 14 }}>{emoji}</Text>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.ink }}>{label}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
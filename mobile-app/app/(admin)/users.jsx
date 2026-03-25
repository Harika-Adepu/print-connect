// app/(admin)/users.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, Alert, TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllUsers, deleteUser } from "../../src/services/admin.service";
import { useAuth } from "../../src/store/index";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatDate } from "../../src/utils/helpers";

const ROLE_FILTERS = [
  { label: "All",      value: null },
  { label: "Customer", value: "customer" },
  { label: "Owner",    value: "owner" },
  { label: "Delivery", value: "delivery" },
  { label: "Admin",    value: "admin" },
];

const ROLE_CONFIG = {
  customer: { emoji: "🛒", color: COLORS.primary,  bg: COLORS.primaryLight },
  owner:    { emoji: "🖨️", color: COLORS.warning,  bg: "#FEF3C7" },
  admin:    { emoji: "⚙️", color: "#7C3AED",        bg: "#EDE9FE" },
  delivery: { emoji: "🚚", color: COLORS.success,  bg: "#DCFCE7" },
};

export default function AdminUsersScreen() {
  const { user: currentUser } = useAuth();
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [roleFilter,   setRoleFilter]   = useState(null);
  const [search,       setSearch]       = useState("");

  const fetchUsers = async () => {
    try { setUsers(await getAllUsers(roleFilter)); }
    catch (_) { setUsers([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchUsers(); }, [roleFilter]));
  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const handleDelete = (user) => {
    if (user._id === currentUser?.id) {
      Alert.alert("Error", "You cannot delete your own account."); return;
    }
    Alert.alert(
      "Delete User",
      `Delete "${user.name}" (${user.role})? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user._id);
              Alert.alert("Deleted", "User has been removed.");
              fetchUsers();
            } catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader message="Loading users..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>Users</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {users.length} total · {filtered.length} shown</Text>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 20, marginBottom: 12, backgroundColor: COLORS.card,
        borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 14, paddingVertical: 10,
        flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput placeholder="Search name or email..." placeholderTextColor={COLORS.muted}
          value={search} onChangeText={setSearch}
          style={{ flex: 1, fontSize: 14, color: COLORS.ink }} />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role filter tabs */}
      <FlatList
        horizontal data={ROLE_FILTERS} keyExtractor={i => String(i.value)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 14 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setRoleFilter(item.value)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: roleFilter === item.value ? "#7C3AED" : COLORS.card,
              borderWidth: 1,
              borderColor: roleFilter === item.value ? "#7C3AED" : COLORS.border }}>
            <Text style={{ fontSize: 12, fontWeight: "600",
              color: roleFilter === item.value ? COLORS.white : COLORS.inkSoft }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered} keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor="#7C3AED" />}
        renderItem={({ item }) => {
          const cfg = ROLE_CONFIG[item.role] || { emoji: "👤", color: COLORS.muted, bg: COLORS.surface };
          const isMe = item._id === currentUser?.id;
          return (
            <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
              padding: 16, marginBottom: 10, ...SHADOW.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Avatar */}
                <View style={{ width: 46, height: 46, borderRadius: 23,
                  backgroundColor: cfg.bg, alignItems: "center",
                  justifyContent: "center", marginRight: 14 }}>
                  <Text style={{ fontSize: 20 }}>{cfg.emoji}</Text>
                </View>
                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}>
                      {item.name}</Text>
                    {isMe && (
                      <View style={{ backgroundColor: "#EDE9FE", paddingHorizontal: 6,
                        paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, color: "#7C3AED", fontWeight: "700" }}>
                          YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    {item.email}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center",
                    gap: 8, marginTop: 4 }}>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8,
                      paddingVertical: 2, borderRadius: 999 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: cfg.color }}>
                        {item.role?.toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>
                      Joined {formatDate(item.createdAt)}</Text>
                  </View>
                </View>
                {/* Delete button */}
                {!isMe && (
                  <TouchableOpacity onPress={() => handleDelete(item)}
                    style={{ backgroundColor: "#FEE2E2", borderRadius: 10,
                      padding: 8 }}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>👥</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
              No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
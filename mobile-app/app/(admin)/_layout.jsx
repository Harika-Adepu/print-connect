// app/(admin)/_layout.jsx
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { COLORS } from "../../src/config/theme";

function TabIcon({ label, emoji, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        fontWeight: focused ? "700" : "400",
        color: focused ? "#7C3AED" : COLORS.muted,
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" emoji="📊" focused={focused} /> }} />
      <Tabs.Screen name="requests"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Requests" emoji="📨" focused={focused} /> }} />
      <Tabs.Screen name="orders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Orders" emoji="📦" focused={focused} /> }} />
      <Tabs.Screen name="products"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Products" emoji="🗂️" focused={focused} /> }} />
      <Tabs.Screen name="users"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Users" emoji="👥" focused={focused} /> }} />
      <Tabs.Screen name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}
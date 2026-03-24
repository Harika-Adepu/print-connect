// app/(customer)/_layout.jsx
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
        color: focused ? COLORS.primary : COLORS.muted,
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function CustomerLayout() {
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
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-order"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="New Order" emoji="➕" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="My Orders" emoji="📦" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" emoji="👤" focused={focused} />
          ),
        }}
      />
      {/* Hide order-detail from tab bar */}
      <Tabs.Screen
        name="order-detail/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
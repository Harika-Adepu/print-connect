// app/index.jsx
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/store/index";
import { COLORS } from "../src/config/theme";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else {
      if (user?.role === "customer") router.replace("/(customer)/home");
      else if (user?.role === "owner") router.replace("/(owner)/dashboard");
      else if (user?.role === "admin") router.replace("/(admin)/dashboard");
      else if (user?.role === "delivery") router.replace("/(delivery)/dashboard");
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View
      style={{ flex: 1, backgroundColor: COLORS.ink,
        alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: "800",
        letterSpacing: 1 }}>
        PrintConnect
      </Text>
      <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>
        Printing made simple
      </Text>
    </View>
  );
}
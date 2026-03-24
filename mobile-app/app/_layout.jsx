// app/_layout.jsx
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/store/index";

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Route based on role
      if (user?.role === "customer") router.replace("/(customer)/home");
      else if (user?.role === "owner") router.replace("/(owner)/dashboard");
      else if (user?.role === "admin") router.replace("/(admin)/dashboard");
      else if (user?.role === "delivery") router.replace("/(delivery)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
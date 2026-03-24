// app/(auth)/login.jsx
import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/store/index";
import { loginUser } from "../../src/services/auth.service";
import { validateLoginForm } from "../../src/utils/validators";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import { COLORS } from "../../src/config/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleLogin = async () => {
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await loginUser(form);
      login(user, token);
      // Navigation handled by _layout.jsx
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary,
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              PrintConnect
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: COLORS.ink,
              marginBottom: 8 }}>
              Welcome back 👋
            </Text>
            <Text style={{ fontSize: 15, color: COLORS.inkSoft }}>
              Sign in to manage your print orders
            </Text>
          </View>

          {/* Form */}
          <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
            padding: 20, marginBottom: 24,
            shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={{ flexDirection: "row", justifyContent: "center",
            alignItems: "center" }}>
            <Text style={{ color: COLORS.inkSoft, fontSize: 14 }}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
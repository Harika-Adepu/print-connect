// app/(auth)/register.jsx
import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { registerUser, loginUser } from "../../src/services/auth.service";
import { useAuth } from "../../src/store/index";
import { validateRegisterForm } from "../../src/utils/validators";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import { COLORS } from "../../src/config/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleRegister = async () => {
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Register then auto-login
      await registerUser({ ...form, role: "customer" });
      const { user, token } = await loginUser({
        email: form.email,
        password: form.password,
      });
      login(user, token);
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
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
              Create account
            </Text>
            <Text style={{ fontSize: 15, color: COLORS.inkSoft }}>
              Start placing print orders in minutes
            </Text>
          </View>

          {/* Form */}
          <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
            padding: 20, marginBottom: 24,
            shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
              autoCapitalize="words"
              error={errors.name}
            />

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
              placeholder="Min. 6 characters"
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={{ flexDirection: "row", justifyContent: "center",
            alignItems: "center" }}>
            <Text style={{ color: COLORS.inkSoft, fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
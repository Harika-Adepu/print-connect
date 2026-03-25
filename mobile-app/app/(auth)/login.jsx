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
import { COLORS, SHADOW } from "../../src/config/theme";

const ROLES = [
  { value: "customer", label: "Customer",      emoji: "🛒", color: COLORS.primary, bg: COLORS.primaryLight },
  { value: "owner",    label: "Owner",          emoji: "🖨️", color: COLORS.warning, bg: "#FEF3C7" },
  { value: "admin",    label: "Admin",          emoji: "⚙️", color: "#7C3AED",      bg: "#EDE9FE" },
  { value: "delivery", label: "Delivery Agent", emoji: "🚚", color: COLORS.success, bg: "#DCFCE7" },
];

function roleDescription(role) {
  switch (role) {
    case "customer": return "Browse products and place print orders";
    case "owner":    return "Manage orders, printing and operations";
    case "admin":    return "Full system access and approvals";
    case "delivery": return "Collect and deliver print orders";
    default:         return "";
  }
}

export default function LoginScreen() {
  const router    = useRouter();
  const { login } = useAuth();

  const [step,         setStep]         = useState(0); // 0=role, 1=credentials
  const [selectedRole, setSelectedRole] = useState(null);
  const [form,         setForm]         = useState({ email: "", password: "" });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);

  const activeRole = ROLES.find(r => r.value === selectedRole?.value);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(1);
  };

  const handleBack = () => {
    setStep(0);
    setSelectedRole(null);
    setErrors({});
  };

  // const handleLogin = async () => {
  //   const validationErrors = validateLoginForm(form);
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const { user, token } = await loginUser(form);

  //     // ── Role mismatch guard ─────────────────────────────────────────────────
  //     if (user.role !== selectedRole.value) {
  //       Alert.alert(
  //         "Wrong Role Selected",
  //         `This account is registered as "${user.role}".\n\nPlease go back and select "${user.role}" instead.`,
  //         [{ text: "Go Back", onPress: handleBack }]
  //       );
  //       setLoading(false);
  //       return;
  //     }

  //     login(user, token);
  //     // _layout.jsx handles redirect by role automatically
  //   } catch (error) {
  //     Alert.alert("Login Failed", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    // 1. Validate form inputs (email/password)
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 2. Call the login service
      const response = await loginUser(form);
      const { user, token } = response;

      // DEBUG: Uncomment these to see exactly what is being compared in your console
      // console.log("Backend User Role:", user.role);
      // console.log("UI Selected Role:", selectedRole.value);

      // 3. Role mismatch guard (using .toLowerCase() to prevent casing bugs)
      const backendRole = user.role?.toLowerCase();
      const uiRole = selectedRole.value?.toLowerCase();

      if (backendRole !== uiRole) {
        Alert.alert(
          "Wrong Role Selected",
          `This account is registered as a "${user.role}".\n\nPlease go back and select the correct role to continue.`,
          [
            { 
              text: "Go Back", 
              onPress: () => {
                handleBack(); // Resets step to 0 and clears selectedRole
              } 
            }
          ]
        );
        setLoading(false);
        return;
      }

      // 4. If roles match, update global auth state
      // This will trigger the redirect in your _layout.jsx
      login(user, token);

    } catch (error) {
      // Handle API errors (401 Unauthorized, 404 Not Found, etc.)
      const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={{ marginTop: 20, marginBottom: 32 }}>
            {step === 1 && (
              <TouchableOpacity onPress={handleBack} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary,
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              PrintConnect
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: COLORS.ink, marginBottom: 6 }}>
              {step === 0 ? "Who are you?" : "Welcome back 👋"}
            </Text>
            <Text style={{ fontSize: 15, color: COLORS.inkSoft }}>
              {step === 0 ? "Select your role to sign in" : `Signing in as ${activeRole?.label}`}
            </Text>
            {/* Progress bar */}
            <View style={{ marginTop: 20, height: 4,
              backgroundColor: COLORS.border, borderRadius: 4 }}>
              <View style={{ height: 4, backgroundColor: COLORS.primary, borderRadius: 4,
                width: step === 0 ? "50%" : "100%" }} />
            </View>
          </View>

          {/* ── STEP 0: Role cards ── */}
          {step === 0 && (
            <View>
              {ROLES.map(role => (
                <TouchableOpacity key={role.value}
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.8}
                  style={{ flexDirection: "row", alignItems: "center",
                    backgroundColor: role.bg, borderRadius: 18, padding: 18,
                    marginBottom: 12, borderWidth: 1.5,
                    borderColor: role.color + "40", ...SHADOW.sm }}
                >
                  {/* Icon */}
                  <View style={{ width: 52, height: 52, borderRadius: 26,
                    backgroundColor: role.color + "20",
                    alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                    <Text style={{ fontSize: 24 }}>{role.emoji}</Text>
                  </View>
                  {/* Label */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
                      {role.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>
                      {roleDescription(role.value)}
                    </Text>
                  </View>
                  {/* Arrow */}
                  <View style={{ width: 32, height: 32, borderRadius: 16,
                    backgroundColor: role.color,
                    alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "800" }}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={{ flexDirection: "row", justifyContent: "center",
                alignItems: "center", marginTop: 24 }}>
                <Text style={{ color: COLORS.inkSoft, fontSize: 14 }}>
                  New to PrintConnect?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                  <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── STEP 1: Credentials ── */}
          {step === 1 && (
            <View>
              {/* Role badge */}
              <View style={{ flexDirection: "row", alignItems: "center",
                backgroundColor: activeRole?.bg, borderRadius: 14, padding: 14,
                marginBottom: 24, borderWidth: 1,
                borderColor: activeRole?.color + "30" }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{activeRole?.emoji}</Text>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "800",
                    color: activeRole?.color }}>
                    Signing in as {activeRole?.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    You'll land on the {activeRole?.label} dashboard
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
                padding: 20, marginBottom: 24, ...SHADOW.md }}>
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={form.email}
                  onChangeText={v => handleChange("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChangeText={v => handleChange("password", v)}
                  secureTextEntry
                  error={errors.password}
                />
                <Button
                  title={`Sign In as ${activeRole?.label}`}
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                />
              </View>

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
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
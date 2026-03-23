import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { COLORS } from "../../config/theme";

export default function Input({
  label, value, onChangeText, placeholder, error,
  secureTextEntry = false, keyboardType = "default",
  multiline = false, numberOfLines = 1,
  leftIcon, rightIcon, editable = true, ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-ink-soft text-sm font-medium mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-card rounded-xl border px-4 ${focused ? "border-primary" : "border-border"} ${error ? "border-danger" : ""} ${!editable ? "bg-surface" : ""} ${multiline ? "items-start py-3" : ""}`}
        style={{ minHeight: multiline ? numberOfLines * 24 + 24 : 52 }}
      >
        {leftIcon && <View className={`mr-3 ${multiline ? "mt-0.5" : ""}`}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, color: COLORS.ink, fontSize: 15 }}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text className="text-muted text-sm">{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        )}
        {!secureTextEntry && rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

export default function Button({
  title, onPress, variant = "primary", size = "md",
  loading = false, disabled = false, fullWidth = true, icon,
}) {
  const variantStyles = {
    primary: "bg-primary active:bg-primary-dark",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-danger",
  };
  const textStyles = {
    primary: "text-white font-semibold",
    outline: "text-primary font-semibold",
    ghost: "text-ink-soft font-medium",
    danger: "text-white font-semibold",
  };
  const sizeStyles = { sm: "px-4 py-2", md: "px-5 py-3.5", lg: "px-6 py-4" };
  const textSizeStyles = { sm: "text-sm", md: "text-base", lg: "text-md" };
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-xl ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : "self-start"} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator size="small"
          color={variant === "outline" || variant === "ghost" ? "#2563EB" : "#fff"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && icon}
          <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
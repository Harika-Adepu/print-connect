// app/(customer)/new-order.jsx
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProducts, getTemplates, createOrder } from "../../src/services/order.service";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import { COLORS, SHADOW } from "../../src/config/theme";
import { LANGUAGE_OPTIONS, COLOR_OPTIONS } from "../../src/utils/constants";
import { validateOrderForm } from "../../src/utils/validators";
import { formatCurrency } from "../../src/utils/helpers";

const STEPS = ["Product", "Details", "Review"];

export default function NewOrderScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    product: null,       // product object
    template: null,      // template object
    quantity: "1",
    language: "ENGLISH",
    color: "SINGLE",
    details: "",
    timeRequired: "",
  });

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => Alert.alert("Error", "Could not load products"))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleSelectProduct = async (product) => {
    setForm((prev) => ({ ...prev, product, template: null }));
    setErrors((prev) => ({ ...prev, product: null }));
    setLoadingTemplates(true);
    try {
      const tmpl = await getTemplates(product._id);
      setTemplates(tmpl);
    } catch (_) {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const totalPrice = form.product
    ? form.product.price * (parseInt(form.quantity) || 0)
    : 0;

  const advanceAmount = Math.round(totalPrice * 0.4);
  const remainingAmount = totalPrice - advanceAmount;

  const validateStep = () => {
    if (step === 0) {
      const errs = validateOrderForm({
        product: form.product?._id,
        quantity: parseInt(form.quantity),
      });
      if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        product: form.product._id,
        template: form.template?._id || undefined,
        quantity: parseInt(form.quantity),
        language: form.language,
        color: form.color,
        details: form.details || undefined,
        timeRequired: form.timeRequired ? parseInt(form.timeRequired) : undefined,
      };
      await createOrder(payload);
      Alert.alert(
        "Order Placed! 🎉",
        "Your order has been submitted. The owner will review it shortly.",
        [{ text: "View My Orders", onPress: () => router.replace("/(customer)/my-orders") }]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20,
        paddingBottom: 12 }}>
        {step > 0 && (
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
            New Order
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 20, height: 4,
        backgroundColor: COLORS.border, borderRadius: 4 }}>
        <View style={{ height: 4, backgroundColor: COLORS.primary, borderRadius: 4,
          width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── STEP 0: Product Selection ───────────────────────────── */}
        {step === 0 && (
          <View>
            <SectionLabel>Select Product</SectionLabel>
            {loadingProducts ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              products.map((p) => (
                <SelectableCard
                  key={p._id}
                  selected={form.product?._id === p._id}
                  onPress={() => handleSelectProduct(p)}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between",
                    alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                        {p.name}
                      </Text>
                      {p.category && (
                        <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                          {p.category}
                        </Text>
                      )}
                      {p.description && (
                        <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
                          {p.description}
                        </Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.primary,
                      marginLeft: 12 }}>
                      {formatCurrency(p.price)}
                    </Text>
                  </View>
                </SelectableCard>
              ))
            )}
            {errors.product && (
              <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>
                {errors.product}
              </Text>
            )}

            {/* Templates */}
            {form.product && (
              <View style={{ marginTop: 24 }}>
                <SectionLabel>Select Template (Optional)</SectionLabel>
                {loadingTemplates ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : templates.length === 0 ? (
                  <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                    No templates available for this product
                  </Text>
                ) : (
                  templates.map((t) => (
                    <SelectableCard
                      key={t._id}
                      selected={form.template?._id === t._id}
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          template: prev.template?._id === t._id ? null : t,
                        }))
                      }
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink }}>
                        {t.name}
                      </Text>
                    </SelectableCard>
                  ))
                )}
              </View>
            )}

            {/* Quantity */}
            {form.product && (
              <View style={{ marginTop: 24 }}>
                <SectionLabel>Quantity</SectionLabel>
                <Input
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChangeText={(v) => {
                    setForm((prev) => ({ ...prev, quantity: v }));
                    setErrors((prev) => ({ ...prev, quantity: null }));
                  }}
                  keyboardType="numeric"
                  error={errors.quantity}
                />
                {form.product && parseInt(form.quantity) > 0 && (
                  <View style={{ backgroundColor: COLORS.primaryLight,
                    borderRadius: 12, padding: 12, marginTop: 4 }}>
                    <Text style={{ color: COLORS.primary, fontSize: 13,
                      fontWeight: "600" }}>
                      Estimated Total: {formatCurrency(totalPrice)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ marginTop: 24 }}>
              <Button title="Continue →" onPress={handleNext}
                disabled={!form.product} size="lg" />
            </View>
          </View>
        )}

        {/* ─── STEP 1: Details ─────────────────────────────────────── */}
        {step === 1 && (
          <View>
            <SectionLabel>Language</SectionLabel>
            <OptionGroup
              options={LANGUAGE_OPTIONS}
              selected={form.language}
              onSelect={(v) => setForm((prev) => ({ ...prev, language: v }))}
            />

            <SectionLabel style={{ marginTop: 20 }}>Color</SectionLabel>
            <OptionGroup
              options={COLOR_OPTIONS}
              selected={form.color}
              onSelect={(v) => setForm((prev) => ({ ...prev, color: v }))}
            />

            <View style={{ marginTop: 20 }}>
              <Input
                label="Time Required (days)"
                placeholder="e.g. 3"
                value={form.timeRequired}
                onChangeText={(v) => setForm((prev) => ({ ...prev, timeRequired: v }))}
                keyboardType="numeric"
              />
            </View>

            <Input
              label="Additional Details (Optional)"
              placeholder="Any specific instructions, sizes, notes..."
              value={form.details}
              onChangeText={(v) => setForm((prev) => ({ ...prev, details: v }))}
              multiline
              numberOfLines={4}
            />

            <View style={{ marginTop: 8 }}>
              <Button title="Review Order →" onPress={handleNext} size="lg" />
            </View>
          </View>
        )}

        {/* ─── STEP 2: Review ──────────────────────────────────────── */}
        {step === 2 && (
          <View>
            <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
              padding: 20, marginBottom: 20, ...SHADOW.sm }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink,
                marginBottom: 16 }}>
                Order Summary
              </Text>

              <ReviewRow label="Product" value={form.product?.name} />
              <ReviewRow label="Template" value={form.template?.name || "None"} />
              <ReviewRow label="Quantity" value={form.quantity} />
              <ReviewRow label="Language" value={form.language} />
              <ReviewRow label="Color" value={form.color} />
              {form.timeRequired ? (
                <ReviewRow label="Time Required" value={`${form.timeRequired} days`} />
              ) : null}
              {form.details ? (
                <ReviewRow label="Details" value={form.details} />
              ) : null}

              <View style={{ height: 1, backgroundColor: COLORS.border,
                marginVertical: 16 }} />

              <ReviewRow label="Total Price" value={formatCurrency(totalPrice)} bold />
              <ReviewRow label="Advance (40%)" value={formatCurrency(advanceAmount)}
                color={COLORS.warning} />
              <ReviewRow label="Remaining (60%)" value={formatCurrency(remainingAmount)}
                color={COLORS.inkSoft} />
            </View>

            <View style={{ backgroundColor: "#FEF3C7", borderRadius: 12,
              padding: 14, marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: "600" }}>
                ℹ️  You'll pay 40% advance after design approval. Remaining 60% after printing.
              </Text>
            </View>

            <Button
              title="Place Order 🚀"
              onPress={handleSubmit}
              loading={submitting}
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft,
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function SelectableCard({ selected, onPress, children }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: selected ? COLORS.primaryLight : COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: selected ? COLORS.primary : COLORS.border,
        ...SHADOW.sm,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}

function OptionGroup({ options, selected, onSelect }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: selected === opt.value ? COLORS.primary : COLORS.border,
            backgroundColor: selected === opt.value ? COLORS.primaryLight : COLORS.card,
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: "600",
            color: selected === opt.value ? COLORS.primary : COLORS.inkSoft,
          }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewRow({ label, value, bold, color }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
      <Text style={{
        fontSize: 13,
        fontWeight: bold ? "800" : "600",
        color: color || COLORS.ink,
        flex: 1,
        textAlign: "right",
        flexShrink: 1,
      }}>
        {value}
      </Text>
    </View>
  );
}
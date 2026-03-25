// // app/(customer)/new-order.jsx
// import React, { useEffect, useState } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   Alert, ActivityIndicator,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { getProducts, getTemplates, createOrder } from "../../src/services/order.service";
// import Input from "../../src/components/inputs/Input";
// import Button from "../../src/components/buttons/Button";
// import { COLORS, SHADOW } from "../../src/config/theme";
// import { LANGUAGE_OPTIONS, COLOR_OPTIONS } from "../../src/utils/constants";
// import { validateOrderForm } from "../../src/utils/validators";
// import { formatCurrency } from "../../src/utils/helpers";

// const STEPS = ["Product", "Details", "Review"];

// export default function NewOrderScreen() {
//   const router = useRouter();

//   const [step, setStep] = useState(0);
//   const [products, setProducts] = useState([]);
//   const [templates, setTemplates] = useState([]);
//   const [loadingProducts, setLoadingProducts] = useState(true);
//   const [loadingTemplates, setLoadingTemplates] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});

//   const [form, setForm] = useState({
//     product: null,       // product object
//     template: null,      // template object
//     quantity: "1",
//     language: "ENGLISH",
//     color: "SINGLE",
//     details: "",
//     timeRequired: "",
//   });

//   useEffect(() => {
//     getProducts()
//       .then(setProducts)
//       .catch(() => Alert.alert("Error", "Could not load products"))
//       .finally(() => setLoadingProducts(false));
//   }, []);

//   const handleSelectProduct = async (product) => {
//     setForm((prev) => ({ ...prev, product, template: null }));
//     setErrors((prev) => ({ ...prev, product: null }));
//     setLoadingTemplates(true);
//     try {
//       const tmpl = await getTemplates(product._id);
//       setTemplates(tmpl);
//     } catch (_) {
//       setTemplates([]);
//     } finally {
//       setLoadingTemplates(false);
//     }
//   };

//   const totalPrice = form.product
//     ? form.product.price * (parseInt(form.quantity) || 0)
//     : 0;

//   const advanceAmount = Math.round(totalPrice * 0.4);
//   const remainingAmount = totalPrice - advanceAmount;

//   const validateStep = () => {
//     if (step === 0) {
//       const errs = validateOrderForm({
//         product: form.product?._id,
//         quantity: parseInt(form.quantity),
//       });
//       if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (!validateStep()) return;
//     setStep((s) => s + 1);
//   };

//   const handleBack = () => setStep((s) => s - 1);

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     try {
//       const payload = {
//         product: form.product._id,
//         template: form.template?._id || undefined,
//         quantity: parseInt(form.quantity),
//         language: form.language,
//         color: form.color,
//         details: form.details || undefined,
//         timeRequired: form.timeRequired ? parseInt(form.timeRequired) : undefined,
//       };
//       await createOrder(payload);
//       Alert.alert(
//         "Order Placed! 🎉",
//         "Your order has been submitted. The owner will review it shortly.",
//         [{ text: "View My Orders", onPress: () => router.replace("/(customer)/my-orders") }]
//       );
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
//       {/* Header */}
//       <View style={{ flexDirection: "row", alignItems: "center", padding: 20,
//         paddingBottom: 12 }}>
//         {step > 0 && (
//           <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
//             <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
//           </TouchableOpacity>
//         )}
//         <View style={{ flex: 1 }}>
//           <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
//             New Order
//           </Text>
//           <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
//             Step {step + 1} of {STEPS.length} — {STEPS[step]}
//           </Text>
//         </View>
//       </View>

//       {/* Progress bar */}
//       <View style={{ marginHorizontal: 20, marginBottom: 20, height: 4,
//         backgroundColor: COLORS.border, borderRadius: 4 }}>
//         <View style={{ height: 4, backgroundColor: COLORS.primary, borderRadius: 4,
//           width: `${((step + 1) / STEPS.length) * 100}%` }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ─── STEP 0: Product Selection ───────────────────────────── */}
//         {step === 0 && (
//           <View>
//             <SectionLabel>Select Product</SectionLabel>
//             {loadingProducts ? (
//               <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
//             ) : (
//               products.map((p) => (
//                 <SelectableCard
//                   key={p._id}
//                   selected={form.product?._id === p._id}
//                   onPress={() => handleSelectProduct(p)}
//                 >
//                   <View style={{ flexDirection: "row", justifyContent: "space-between",
//                     alignItems: "center" }}>
//                     <View style={{ flex: 1 }}>
//                       <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
//                         {p.name}
//                       </Text>
//                       {p.category && (
//                         <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
//                           {p.category}
//                         </Text>
//                       )}
//                       {p.description && (
//                         <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
//                           {p.description}
//                         </Text>
//                       )}
//                     </View>
//                     <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.primary,
//                       marginLeft: 12 }}>
//                       {formatCurrency(p.price)}
//                     </Text>
//                   </View>
//                 </SelectableCard>
//               ))
//             )}
//             {errors.product && (
//               <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>
//                 {errors.product}
//               </Text>
//             )}

//             {/* Templates */}
//             {form.product && (
//               <View style={{ marginTop: 24 }}>
//                 <SectionLabel>Select Template (Optional)</SectionLabel>
//                 {loadingTemplates ? (
//                   <ActivityIndicator color={COLORS.primary} />
//                 ) : templates.length === 0 ? (
//                   <Text style={{ color: COLORS.muted, fontSize: 13 }}>
//                     No templates available for this product
//                   </Text>
//                 ) : (
//                   templates.map((t) => (
//                     <SelectableCard
//                       key={t._id}
//                       selected={form.template?._id === t._id}
//                       onPress={() =>
//                         setForm((prev) => ({
//                           ...prev,
//                           template: prev.template?._id === t._id ? null : t,
//                         }))
//                       }
//                     >
//                       <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink }}>
//                         {t.name}
//                       </Text>
//                     </SelectableCard>
//                   ))
//                 )}
//               </View>
//             )}

//             {/* Quantity */}
//             {form.product && (
//               <View style={{ marginTop: 24 }}>
//                 <SectionLabel>Quantity</SectionLabel>
//                 <Input
//                   placeholder="Enter quantity"
//                   value={form.quantity}
//                   onChangeText={(v) => {
//                     setForm((prev) => ({ ...prev, quantity: v }));
//                     setErrors((prev) => ({ ...prev, quantity: null }));
//                   }}
//                   keyboardType="numeric"
//                   error={errors.quantity}
//                 />
//                 {form.product && parseInt(form.quantity) > 0 && (
//                   <View style={{ backgroundColor: COLORS.primaryLight,
//                     borderRadius: 12, padding: 12, marginTop: 4 }}>
//                     <Text style={{ color: COLORS.primary, fontSize: 13,
//                       fontWeight: "600" }}>
//                       Estimated Total: {formatCurrency(totalPrice)}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}

//             <View style={{ marginTop: 24 }}>
//               <Button title="Continue →" onPress={handleNext}
//                 disabled={!form.product} size="lg" />
//             </View>
//           </View>
//         )}

//         {/* ─── STEP 1: Details ─────────────────────────────────────── */}
//         {step === 1 && (
//           <View>
//             <SectionLabel>Language</SectionLabel>
//             <OptionGroup
//               options={LANGUAGE_OPTIONS}
//               selected={form.language}
//               onSelect={(v) => setForm((prev) => ({ ...prev, language: v }))}
//             />

//             <SectionLabel style={{ marginTop: 20 }}>Color</SectionLabel>
//             <OptionGroup
//               options={COLOR_OPTIONS}
//               selected={form.color}
//               onSelect={(v) => setForm((prev) => ({ ...prev, color: v }))}
//             />

//             <View style={{ marginTop: 20 }}>
//               <Input
//                 label="Time Required (days)"
//                 placeholder="e.g. 3"
//                 value={form.timeRequired}
//                 onChangeText={(v) => setForm((prev) => ({ ...prev, timeRequired: v }))}
//                 keyboardType="numeric"
//               />
//             </View>

//             <Input
//               label="Additional Details (Optional)"
//               placeholder="Any specific instructions, sizes, notes..."
//               value={form.details}
//               onChangeText={(v) => setForm((prev) => ({ ...prev, details: v }))}
//               multiline
//               numberOfLines={4}
//             />

//             <View style={{ marginTop: 8 }}>
//               <Button title="Review Order →" onPress={handleNext} size="lg" />
//             </View>
//           </View>
//         )}

//         {/* ─── STEP 2: Review ──────────────────────────────────────── */}
//         {step === 2 && (
//           <View>
//             <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
//               padding: 20, marginBottom: 20, ...SHADOW.sm }}>
//               <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink,
//                 marginBottom: 16 }}>
//                 Order Summary
//               </Text>

//               <ReviewRow label="Product" value={form.product?.name} />
//               <ReviewRow label="Template" value={form.template?.name || "None"} />
//               <ReviewRow label="Quantity" value={form.quantity} />
//               <ReviewRow label="Language" value={form.language} />
//               <ReviewRow label="Color" value={form.color} />
//               {form.timeRequired ? (
//                 <ReviewRow label="Time Required" value={`${form.timeRequired} days`} />
//               ) : null}
//               {form.details ? (
//                 <ReviewRow label="Details" value={form.details} />
//               ) : null}

//               <View style={{ height: 1, backgroundColor: COLORS.border,
//                 marginVertical: 16 }} />

//               <ReviewRow label="Total Price" value={formatCurrency(totalPrice)} bold />
//               <ReviewRow label="Advance (40%)" value={formatCurrency(advanceAmount)}
//                 color={COLORS.warning} />
//               <ReviewRow label="Remaining (60%)" value={formatCurrency(remainingAmount)}
//                 color={COLORS.inkSoft} />
//             </View>

//             <View style={{ backgroundColor: "#FEF3C7", borderRadius: 12,
//               padding: 14, marginBottom: 24 }}>
//               <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: "600" }}>
//                 ℹ️  You'll pay 40% advance after design approval. Remaining 60% after printing.
//               </Text>
//             </View>

//             <Button
//               title="Place Order 🚀"
//               onPress={handleSubmit}
//               loading={submitting}
//               size="lg"
//             />
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function SectionLabel({ children }) {
//   return (
//     <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft,
//       textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
//       {children}
//     </Text>
//   );
// }

// function SelectableCard({ selected, onPress, children }) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       activeOpacity={0.8}
//       style={{
//         backgroundColor: selected ? COLORS.primaryLight : COLORS.card,
//         borderRadius: 14,
//         padding: 14,
//         marginBottom: 10,
//         borderWidth: 2,
//         borderColor: selected ? COLORS.primary : COLORS.border,
//         ...SHADOW.sm,
//       }}
//     >
//       {children}
//     </TouchableOpacity>
//   );
// }

// function OptionGroup({ options, selected, onSelect }) {
//   return (
//     <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
//       {options.map((opt) => (
//         <TouchableOpacity
//           key={opt.value}
//           onPress={() => onSelect(opt.value)}
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 10,
//             borderRadius: 999,
//             borderWidth: 2,
//             borderColor: selected === opt.value ? COLORS.primary : COLORS.border,
//             backgroundColor: selected === opt.value ? COLORS.primaryLight : COLORS.card,
//           }}
//         >
//           <Text style={{
//             fontSize: 13,
//             fontWeight: "600",
//             color: selected === opt.value ? COLORS.primary : COLORS.inkSoft,
//           }}>
//             {opt.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// function ReviewRow({ label, value, bold, color }) {
//   return (
//     <View style={{ flexDirection: "row", justifyContent: "space-between",
//       alignItems: "flex-start", marginBottom: 10 }}>
//       <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
//       <Text style={{
//         fontSize: 13,
//         fontWeight: bold ? "800" : "600",
//         color: color || COLORS.ink,
//         flex: 1,
//         textAlign: "right",
//         flexShrink: 1,
//       }}>
//         {value}
//       </Text>
//     </View>
//   );
// }


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

  const [step,             setStep]             = useState(0);
  const [products,         setProducts]         = useState([]);
  const [templates,        setTemplates]        = useState([]);
  const [loadingProducts,  setLoadingProducts]  = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [errors,           setErrors]           = useState({});
  const [productError,     setProductError]     = useState(null);

  const [form, setForm] = useState({
    product:      null,
    template:     null,
    quantity:     "1",
    language:     "ENGLISH",
    color:        "SINGLE",
    details:      "",
    timeRequired: "",
  });

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const data = await getProducts();
      setProducts(data);
      if (data.length === 0) {
        setProductError("No products available yet. The owner needs to add products first.");
      }
    } catch (err) {
      setProductError(err.message || "Failed to load products. Check your connection and try again.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSelectProduct = async (product) => {
    setForm(prev => ({ ...prev, product, template: null }));
    setErrors(prev => ({ ...prev, product: null }));
    setLoadingTemplates(true);
    setTemplates([]);
    try {
      const tmpl = await getTemplates(product._id);
      setTemplates(tmpl);
    } catch (_) {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const qty          = parseInt(form.quantity) || 0;
  const totalPrice   = form.product ? form.product.price * qty : 0;
  const advanceAmt   = Math.round(totalPrice * 0.4);
  const remainingAmt = totalPrice - advanceAmt;

  const validateStep = () => {
    if (step === 0) {
      const errs = validateOrderForm({ product: form.product?._id, quantity: parseInt(form.quantity) });
      if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
    }
    return true;
  };

  const handleNext = () => { if (!validateStep()) return; setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createOrder({
        product:      form.product._id,
        template:     form.template?._id || undefined,
        quantity:     parseInt(form.quantity),
        language:     form.language,
        color:        form.color,
        details:      form.details      || undefined,
        timeRequired: form.timeRequired ? parseInt(form.timeRequired) : undefined,
      });
      Alert.alert(
        "Order Placed! 🎉",
        "Your order has been submitted. The owner will review it shortly.",
        [{ text: "View My Orders", onPress: () => router.replace("/(customer)/my-orders") }]
      );
    } catch (error) {
      Alert.alert("Order Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 12 }}>
        {step > 0 && (
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.ink }}>New Order</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 20,
        height: 4, backgroundColor: COLORS.border, borderRadius: 4 }}>
        <View style={{ height: 4, backgroundColor: COLORS.primary, borderRadius: 4,
          width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── STEP 0: Product ── */}
        {step === 0 && (
          <View>
            {/* Loading */}
            {loadingProducts && (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 14 }}>
                  Loading products...
                </Text>
              </View>
            )}

            {/* Error with retry */}
            {!loadingProducts && productError && (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: 18,
                padding: 24, alignItems: "center" }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.danger,
                  marginBottom: 8, textAlign: "center" }}>
                  Products Unavailable
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.inkSoft, textAlign: "center",
                  marginBottom: 20, lineHeight: 20 }}>
                  {productError}
                </Text>
                <TouchableOpacity onPress={fetchProducts}
                  style={{ backgroundColor: COLORS.danger, borderRadius: 12,
                    paddingHorizontal: 24, paddingVertical: 12 }}>
                  <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 14 }}>
                    🔄 Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Product list */}
            {!loadingProducts && !productError && (
              <>
                <SectionLabel>Select Product *</SectionLabel>
                {products.map(p => {
                  const isSel = form.product?._id === p._id;
                  return (
                    <TouchableOpacity key={p._id} onPress={() => handleSelectProduct(p)}
                      activeOpacity={0.8}
                      style={{ backgroundColor: isSel ? COLORS.primaryLight : COLORS.card,
                        borderRadius: 16, padding: 16, marginBottom: 10,
                        borderWidth: 2,
                        borderColor: isSel ? COLORS.primary : COLORS.border, ...SHADOW.sm }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between",
                        alignItems: "center" }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text style={{ fontSize: 15, fontWeight: "700",
                            color: isSel ? COLORS.primary : COLORS.ink }}>
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
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontSize: 16, fontWeight: "800",
                            color: isSel ? COLORS.primary : COLORS.ink }}>
                            {formatCurrency(p.price)}
                          </Text>
                          {isSel && (
                            <View style={{ marginTop: 6, backgroundColor: COLORS.primary,
                              width: 22, height: 22, borderRadius: 11,
                              alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "800" }}>✓</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {errors.product && (
                  <Text style={{ color: COLORS.danger, fontSize: 12, marginBottom: 8 }}>
                    {errors.product}
                  </Text>
                )}

                {/* Templates */}
                {form.product && (
                  <View style={{ marginTop: 20 }}>
                    <SectionLabel>Select Template (Optional)</SectionLabel>
                    {loadingTemplates ? (
                      <View style={{ alignItems: "center", paddingVertical: 20 }}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
                          Loading templates...
                        </Text>
                      </View>
                    ) : templates.length === 0 ? (
                      <View style={{ backgroundColor: COLORS.surface, borderRadius: 12,
                        padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                        <Text style={{ color: COLORS.muted, fontSize: 13, textAlign: "center" }}>
                          No templates available for this product
                        </Text>
                      </View>
                    ) : (
                      templates.map(t => {
                        const isSel = form.template?._id === t._id;
                        return (
                          <TouchableOpacity key={t._id}
                            onPress={() => setForm(prev => ({
                              ...prev, template: prev.template?._id === t._id ? null : t,
                            }))}
                            activeOpacity={0.8}
                            style={{ backgroundColor: isSel ? COLORS.primaryLight : COLORS.card,
                              borderRadius: 12, padding: 14, marginBottom: 8,
                              borderWidth: 2,
                              borderColor: isSel ? COLORS.primary : COLORS.border,
                              flexDirection: "row", justifyContent: "space-between",
                              alignItems: "center" }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Text style={{ fontSize: 18, marginRight: 10 }}>🖼️</Text>
                              <Text style={{ fontSize: 14, fontWeight: "600",
                                color: isSel ? COLORS.primary : COLORS.ink }}>
                                {t.name}
                              </Text>
                            </View>
                            {isSel && (
                              <View style={{ backgroundColor: COLORS.primary,
                                width: 20, height: 20, borderRadius: 10,
                                alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: "800" }}>✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                )}

                {/* Quantity */}
                {form.product && (
                  <View style={{ marginTop: 20 }}>
                    <Input label="Quantity *" placeholder="e.g. 100"
                      value={form.quantity}
                      onChangeText={v => {
                        setForm(prev => ({ ...prev, quantity: v }));
                        setErrors(prev => ({ ...prev, quantity: null }));
                      }}
                      keyboardType="numeric" error={errors.quantity} />
                    {qty > 0 && (
                      <View style={{ backgroundColor: COLORS.primaryLight,
                        borderRadius: 14, padding: 14, marginTop: 4 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between",
                          marginBottom: 4 }}>
                          <Text style={{ fontSize: 13, color: COLORS.primary }}>
                            {formatCurrency(form.product.price)} × {qty}
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.primary }}>
                            {formatCurrency(totalPrice)}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: COLORS.inkSoft }}>
                          Advance: {formatCurrency(advanceAmt)} · Remaining: {formatCurrency(remainingAmt)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={{ marginTop: 24 }}>
                  <Button title="Continue →" onPress={handleNext}
                    disabled={!form.product} size="lg" />
                </View>
              </>
            )}
          </View>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <View>
            <SectionLabel>Language *</SectionLabel>
            <OptionGroup options={LANGUAGE_OPTIONS} selected={form.language}
              onSelect={v => setForm(prev => ({ ...prev, language: v }))} />

            <View style={{ marginTop: 20 }}>
              <SectionLabel>Color *</SectionLabel>
              <OptionGroup options={COLOR_OPTIONS} selected={form.color}
                onSelect={v => setForm(prev => ({ ...prev, color: v }))} />
            </View>

            <View style={{ marginTop: 20 }}>
              <Input label="Time Required (days)"
                placeholder="e.g. 3  (leave blank for standard)"
                value={form.timeRequired}
                onChangeText={v => setForm(prev => ({ ...prev, timeRequired: v }))}
                keyboardType="numeric" />
            </View>

            <Input label="Additional Instructions (Optional)"
              placeholder="Any specific sizes, notes, or special requirements..."
              value={form.details}
              onChangeText={v => setForm(prev => ({ ...prev, details: v }))}
              multiline numberOfLines={4} />

            <View style={{ marginTop: 8 }}>
              <Button title="Review Order →" onPress={handleNext} size="lg" />
            </View>
          </View>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <View>
            {/* Order summary */}
            <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
              padding: 20, marginBottom: 16, ...SHADOW.sm }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink,
                marginBottom: 16 }}>📋 Order Summary</Text>
              <ReviewRow label="Product"  value={form.product?.name} />
              <ReviewRow label="Template" value={form.template?.name || "None"} />
              <ReviewRow label="Quantity" value={form.quantity} />
              <ReviewRow label="Language" value={form.language} />
              <ReviewRow label="Color"    value={form.color} />
              {form.timeRequired ? <ReviewRow label="Time Required" value={`${form.timeRequired} days`} /> : null}
              {form.details      ? <ReviewRow label="Instructions"  value={form.details} /> : null}
            </View>

            {/* Payment breakdown */}
            <View style={{ backgroundColor: COLORS.card, borderRadius: 20,
              padding: 20, marginBottom: 16, ...SHADOW.sm }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink,
                marginBottom: 16 }}>💳 Payment Breakdown</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between",
                marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>
                  {formatCurrency(form.product?.price)} × {form.quantity}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
                  {formatCurrency(totalPrice)}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 12 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between",
                marginBottom: 8 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.inkSoft }}>
                    Advance (40%)</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>After design approval</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.warning }}>
                  {formatCurrency(advanceAmt)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.inkSoft }}>
                    Remaining (60%)</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>After printing done</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.inkSoft }}>
                  {formatCurrency(remainingAmt)}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: "#FEF3C7", borderRadius: 14,
              padding: 14, marginBottom: 24, flexDirection: "row" }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>ℹ️</Text>
              <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: "600",
                flex: 1, lineHeight: 18 }}>
                Owner will approve your design first. You'll be notified to pay the advance.
              </Text>
            </View>

            <Button title="Place Order 🚀" onPress={handleSubmit}
              loading={submitting} size="lg" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.inkSoft,
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function OptionGroup({ options, selected, onSelect }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
      {options.map(opt => {
        const isSel = selected === opt.value;
        return (
          <TouchableOpacity key={opt.value} onPress={() => onSelect(opt.value)}
            style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
              borderWidth: 2,
              borderColor: isSel ? COLORS.primary : COLORS.border,
              backgroundColor: isSel ? COLORS.primaryLight : COLORS.card }}>
            <Text style={{ fontSize: 13, fontWeight: "600",
              color: isSel ? COLORS.primary : COLORS.inkSoft }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.ink,
        flex: 1.5, textAlign: "right", flexShrink: 1 }}>
        {value}
      </Text>
    </View>
  );
}
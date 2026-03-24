// app/(owner)/requests.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  Alert, FlatList, RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { submitAdminRequest, getMyRequests, getProducts } from "../../src/services/owner.service";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatDate } from "../../src/utils/helpers";

// All request types from architecture diagram
const REQUEST_TYPES = [
  {
    type: "PRICE_UPDATE",
    label: "Price Update",
    emoji: "💰",
    description: "Request a product price change",
    color: COLORS.warning,
    bg: "#FEF3C7",
  },
  {
    type: "TEMPLATE_UPDATE",
    label: "Template Update",
    emoji: "🎨",
    description: "Submit new design or template update",
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
  {
    type: "PRODUCT_CHANGE",
    label: "Product / Category Change",
    emoji: "🗂️",
    description: "Request product or category modification",
    color: COLORS.info,
    bg: "#CFFAFE",
  },
  {
    type: "DISCOUNT_REQUEST",
    label: "Discount / Offer",
    emoji: "🏷️",
    description: "Request a discount or promotional offer",
    color: COLORS.success,
    bg: "#DCFCE7",
  },
  {
    type: "OPERATIONAL_FEEDBACK",
    label: "Operational Feedback",
    emoji: "📝",
    description: "Share operational feedback with admin",
    color: COLORS.inkSoft,
    bg: COLORS.surface,
  },
];

const STATUS_CONFIG = {
  PENDING:  { color: COLORS.warning, bg: "#FEF3C7",  label: "Pending"  },
  APPROVED: { color: COLORS.success, bg: "#DCFCE7",  label: "Approved" },
  REJECTED: { color: COLORS.danger,  bg: "#FEE2E2",  label: "Rejected" },
  REVIEWED: { color: COLORS.info,    bg: "#CFFAFE",  label: "Reviewed" },
};

export default function OwnerRequestsScreen() {
  const [requests,   setRequests]   = useState([]);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible,  setModalVisible]  = useState(false);
  const [selectedType,  setSelectedType]  = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  // Form fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    product: null,       // selected product object
    requestedPrice: "",
    discountPercentage: "",
    discountReason: "",
  });
  const [errors, setErrors] = useState({});
  const [productPickerVisible, setProductPickerVisible] = useState(false);

  const fetchData = async () => {
    try {
      const [req, prod] = await Promise.all([getMyRequests(), getProducts()]);
      setRequests(req);
      setProducts(prod);
    } catch (_) {
      setRequests([]); setProducts([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const openModal = (type) => {
    setSelectedType(type);
    setForm({ title: "", description: "", product: null,
      requestedPrice: "", discountPercentage: "", discountReason: "" });
    setErrors({});
    setModalVisible(true);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (selectedType?.type === "PRICE_UPDATE") {
      if (!form.product)        errs.product       = "Select a product";
      if (!form.requestedPrice) errs.requestedPrice = "Enter requested price";
    }
    if (selectedType?.type === "DISCOUNT_REQUEST") {
      if (!form.product)            errs.product           = "Select a product";
      if (!form.discountPercentage) errs.discountPercentage = "Enter discount %";
    }
    if (selectedType?.type === "PRODUCT_CHANGE" ||
        selectedType?.type === "TEMPLATE_UPDATE") {
      if (!form.product) errs.product = "Select a product";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await submitAdminRequest({
        type:               selectedType.type,
        title:              form.title.trim(),
        description:        form.description.trim(),
        product:            form.product?._id,
        currentPrice:       form.product?.price,
        requestedPrice:     form.requestedPrice ? parseFloat(form.requestedPrice) : undefined,
        discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage) : undefined,
        discountReason:     form.discountReason || undefined,
      });
      Alert.alert("✅ Request Submitted", "Your request has been sent to admin.");
      setModalVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const needsProduct = ["PRICE_UPDATE", "DISCOUNT_REQUEST", "PRODUCT_CHANGE", "TEMPLATE_UPDATE"]
    .includes(selectedType?.type);

  if (loading) return <Loader message="Loading requests..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>
            Admin Requests</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
            Submit requests and view responses from admin</Text>
        </View>

        {/* Request type cards */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft,
          textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          New Request
        </Text>
        {REQUEST_TYPES.map(rt => (
          <TouchableOpacity key={rt.type} onPress={() => openModal(rt)}
            activeOpacity={0.85}
            style={{ backgroundColor: rt.bg, borderRadius: 16, padding: 16,
              marginBottom: 10, flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: rt.color + "40" }}>
            <View style={{ width: 44, height: 44, borderRadius: 22,
              backgroundColor: rt.color + "20", alignItems: "center",
              justifyContent: "center", marginRight: 14 }}>
              <Text style={{ fontSize: 20 }}>{rt.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}>
                {rt.label}</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                {rt.description}</Text>
            </View>
            <Text style={{ color: rt.color, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* My submitted requests */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft,
          textTransform: "uppercase", letterSpacing: 1, marginTop: 28, marginBottom: 12 }}>
          My Requests ({requests.length})
        </Text>

        {requests.length === 0 ? (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 32,
            alignItems: "center", ...SHADOW.sm }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>No requests submitted yet</Text>
          </View>
        ) : (
          requests.map(req => {
            const cfg   = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            const rtype = REQUEST_TYPES.find(r => r.type === req.type);
            return (
              <View key={req._id} style={{ backgroundColor: COLORS.card, borderRadius: 16,
                padding: 16, marginBottom: 12, ...SHADOW.sm }}>
                {/* Top row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{rtype?.emoji || "📨"}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
                      {rtype?.label || req.type}</Text>
                  </View>
                  <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10,
                    paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color }}>
                      {cfg.label}</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink,
                  marginBottom: 4 }}>
                  {req.title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                  {req.description}</Text>

                {/* Product if any */}
                {req.product && (
                  <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                    📦 {req.product.name}
                  </Text>
                )}

                {/* Price details */}
                {req.requestedPrice && (
                  <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                    💰 Requested Price: ₹{req.requestedPrice}
                    {req.currentPrice ? ` (Current: ₹${req.currentPrice})` : ""}
                  </Text>
                )}

                {/* Discount details */}
                {req.discountPercentage && (
                  <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                    🏷️ Discount: {req.discountPercentage}%
                  </Text>
                )}

                {/* Admin note */}
                {req.adminNote && (
                  <View style={{ backgroundColor: cfg.bg, borderRadius: 10,
                    padding: 10, marginTop: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color,
                      marginBottom: 2 }}>Admin Response:</Text>
                    <Text style={{ fontSize: 12, color: COLORS.inkSoft }}>
                      {req.adminNote}</Text>
                  </View>
                )}

                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
                  Submitted {formatDate(req.createdAt)}
                  {req.reviewedAt ? ` · Reviewed ${formatDate(req.reviewedAt)}` : ""}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Submit Request Modal ── */}
      <Modal visible={modalVisible} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled">
            {/* Modal header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
                  {selectedType?.emoji} {selectedType?.label}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                  Request will be sent to admin for approval</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Product selector (for relevant types) */}
            {needsProduct && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.inkSoft,
                  marginBottom: 6 }}>
                  Product *
                </Text>
                <TouchableOpacity onPress={() => setProductPickerVisible(true)}
                  style={{ backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1,
                    borderColor: errors.product ? COLORS.danger : COLORS.border,
                    padding: 14, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: form.product ? COLORS.ink : COLORS.muted, fontSize: 14 }}>
                    {form.product ? form.product.name : "Select a product"}
                  </Text>
                  <Text style={{ color: COLORS.muted }}>▾</Text>
                </TouchableOpacity>
                {errors.product && (
                  <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.product}</Text>
                )}
                {form.product && (
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
                    Current price: ₹{form.product.price}
                  </Text>
                )}
              </View>
            )}

            <Input label="Title *" placeholder="Brief title for your request"
              value={form.title} onChangeText={v => handleChange("title", v)}
              error={errors.title} />

            <Input label="Description *"
              placeholder="Describe your request in detail..."
              value={form.description} onChangeText={v => handleChange("description", v)}
              multiline numberOfLines={4} error={errors.description} />

            {/* Price update fields */}
            {selectedType?.type === "PRICE_UPDATE" && (
              <Input label="Requested Price (₹) *" placeholder="e.g. 750"
                value={form.requestedPrice}
                onChangeText={v => handleChange("requestedPrice", v)}
                keyboardType="numeric" error={errors.requestedPrice} />
            )}

            {/* Discount fields */}
            {selectedType?.type === "DISCOUNT_REQUEST" && (
              <>
                <Input label="Discount Percentage (%) *" placeholder="e.g. 10"
                  value={form.discountPercentage}
                  onChangeText={v => handleChange("discountPercentage", v)}
                  keyboardType="numeric" error={errors.discountPercentage} />
                <Input label="Reason for Discount" placeholder="e.g. Festival offer"
                  value={form.discountReason}
                  onChangeText={v => handleChange("discountReason", v)} />
              </>
            )}

            <View style={{ marginTop: 8 }}>
              <Button title="Submit Request to Admin" onPress={handleSubmit}
                loading={submitting} size="lg" />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── Product Picker Modal ── */}
      <Modal visible={productPickerVisible} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setProductPickerVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20, flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
                Select Product</Text>
              <TouchableOpacity onPress={() => setProductPickerVisible(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList data={products} keyExtractor={i => i._id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setForm(prev => ({ ...prev, product: item }));
                  setErrors(prev => ({ ...prev, product: null }));
                  setProductPickerVisible(false);
                }}
                  style={{ backgroundColor: form.product?._id === item._id
                    ? COLORS.primaryLight : COLORS.card,
                    borderRadius: 14, padding: 16, marginBottom: 10,
                    borderWidth: 1.5,
                    borderColor: form.product?._id === item._id
                      ? COLORS.primary : COLORS.border }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}>
                    {item.name}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    ₹{item.price} · {item.category || "No category"}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
// app/(owner)/order-detail/[id].jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert, Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAllOrders, updateOrderStatus,
  getTemplates, createTemplate,
} from "../../../src/services/owner.service";
import StatusBadge from "../../../src/components/cards/StatusBadge";
import Button from "../../../src/components/buttons/Button";
import Loader from "../../../src/components/loaders/Loader";
import Input from "../../../src/components/inputs/Input";
import { COLORS, SHADOW } from "../../../src/config/theme";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../../src/utils/constants";
import { formatCurrency, formatDate, shortOrderId } from "../../../src/utils/helpers";

// Allowed transitions per architecture diagram
const STATUS_ACTIONS = {
  [ORDER_STATUS.ORDER_PLACED]: [
    { label: "✅ Approve Design", value: ORDER_STATUS.DESIGN_APPROVED, color: COLORS.success },
    { label: "❌ Reject Design",  value: ORDER_STATUS.DESIGN_REJECTED,  color: COLORS.danger  },
  ],
  [ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED]: [
    { label: "🖨️ Start Printing", value: ORDER_STATUS.PRINTING_IN_PROGRESS, color: COLORS.primary },
  ],
  [ORDER_STATUS.PRINTING_IN_PROGRESS]: [
    { label: "✅ Mark Printing Complete", value: ORDER_STATUS.PRINTING_COMPLETED, color: COLORS.success },
  ],
  [ORDER_STATUS.REMAINING_PAYMENT_COMPLETED]: [
    { label: "🚚 Send Out for Delivery", value: ORDER_STATUS.OUT_FOR_DELIVERY, color: COLORS.info },
  ],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [
    { label: "📦 Mark as Delivered", value: ORDER_STATUS.DELIVERED, color: COLORS.success },
  ],
  [ORDER_STATUS.DELIVERED]: [
    { label: "🏁 Complete Order", value: ORDER_STATUS.ORDER_COMPLETED, color: COLORS.success },
  ],
};

export default function OwnerOrderDetail() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  // Template modal
  const [templateModal,      setTemplateModal]      = useState(false);
  const [templates,          setTemplates]          = useState([]);
  const [newTemplateName,    setNewTemplateName]    = useState("");
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [loadingTemplates,   setLoadingTemplates]   = useState(false);

  const fetchOrder = async () => {
    try {
      const all = await getAllOrders();
      setOrder(all.find(o => o._id === id) || null);
    } catch (_) { setOrder(null); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchOrder(); }, [id]));

  // ── Status update ───────────────────────────────────────────────────────────
  const handleStatusUpdate = (newStatus) => {
    Alert.alert(
      "Update Status",
      `Change to: "${ORDER_STATUS_LABELS[newStatus]}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setUpdating(true);
            try {
              await updateOrderStatus(order._id, newStatus);
              await fetchOrder();
              Alert.alert("✅ Updated", "Order status updated successfully.");
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally { setUpdating(false); }
          },
        },
      ]
    );
  };

  // ── Template modal ──────────────────────────────────────────────────────────
  const openTemplateModal = async () => {
    setTemplateModal(true);
    setLoadingTemplates(true);
    try {
      setTemplates(await getTemplates(order.product?._id));
    } catch (_) { setTemplates([]); }
    finally { setLoadingTemplates(false); }
  };

  const handleSubmitTemplate = async () => {
    if (!newTemplateName.trim()) {
      Alert.alert("Error", "Template name is required"); return;
    }
    setSubmittingTemplate(true);
    try {
      await createTemplate({ name: newTemplateName.trim(), product: order.product?._id });
      Alert.alert("✅ Template Submitted", "Design added to this product.");
      setNewTemplateName("");
      setTemplates(await getTemplates(order.product?._id));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally { setSubmittingTemplate(false); }
  };

  if (loading) return <Loader message="Loading order..." />;

  if (!order) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface,
      alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
      <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>Order not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const actions        = STATUS_ACTIONS[order.status] || [];
  const advanceAmount  = Math.round((order.price || 0) * 0.4);
  const remainingAmount = (order.price || 0) - advanceAmount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
            {shortOrderId(order._id)}</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            {order.customer?.name} · {formatDate(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Status actions ── */}
        {actions.length > 0 && (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
            marginBottom: 16, ...SHADOW.sm }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink, marginBottom: 12 }}>
              ⚡ Available Actions
            </Text>
            {actions.map(action => (
              <TouchableOpacity key={action.value}
                onPress={() => handleStatusUpdate(action.value)}
                disabled={updating} activeOpacity={0.8}
                style={{ backgroundColor: action.color + "15", borderWidth: 1.5,
                  borderColor: action.color, borderRadius: 12, padding: 14,
                  marginBottom: 8, flexDirection: "row", alignItems: "center",
                  justifyContent: "space-between", opacity: updating ? 0.5 : 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: action.color }}>
                  {action.label}</Text>
                <Text style={{ color: action.color, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Submit design/template ── */}
        <TouchableOpacity onPress={openTemplateModal} activeOpacity={0.85}
          style={{ backgroundColor: COLORS.primaryLight, borderRadius: 16, padding: 16,
            marginBottom: 16, flexDirection: "row", alignItems: "center", ...SHADOW.sm }}>
          <Text style={{ fontSize: 22, marginRight: 12 }}>🎨</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.primary }}>
              Submit Design / Template</Text>
            <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
              Add or view templates for this product</Text>
          </View>
          <Text style={{ color: COLORS.primary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* ── Notify Delivery banner ── */}
        {order.status === ORDER_STATUS.OUT_FOR_DELIVERY && (
          <View style={{ backgroundColor: "#CFFAFE", borderRadius: 16, padding: 16,
            marginBottom: 16, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.info }}>
                Order is Out for Delivery</Text>
              <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                Delivery agent has been notified</Text>
            </View>
          </View>
        )}

        {/* ── Order details ── */}
        <DetailCard title="Order Details">
          <DetailRow label="Customer"  value={order.customer?.name} />
          <DetailRow label="Email"     value={order.customer?.email} />
          <DetailRow label="Product"   value={order.product?.name} />
          <DetailRow label="Template"  value={order.template?.name || "None"} />
          <DetailRow label="Quantity"  value={String(order.quantity)} />
          <DetailRow label="Language"  value={order.language} />
          <DetailRow label="Color"     value={order.color} />
          {order.timeRequired && (
            <DetailRow label="Time Required" value={`${order.timeRequired} days`} />
          )}
          {order.details && <DetailRow label="Details" value={order.details} />}
        </DetailCard>

        {/* ── Payment summary ── */}
        <DetailCard title="Payment Summary">
          <DetailRow label="Total Price"    value={formatCurrency(order.price)} bold />
          <DetailRow label="Advance (40%)"  value={formatCurrency(advanceAmount)}
            tag={order.payment?.advancePaid   ? "PAID" : "PENDING"} />
          <DetailRow label="Remaining (60%)" value={formatCurrency(remainingAmount)}
            tag={order.payment?.remainingPaid ? "PAID" : "PENDING"} />
        </DetailCard>
      </ScrollView>

      {/* ── Template Modal ── */}
      <Modal visible={templateModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setTemplateModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
                🎨 Designs / Templates</Text>
              <TouchableOpacity onPress={() => setTemplateModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 10,
              padding: 10, marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>
                Product: {order.product?.name}</Text>
            </View>

            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink, marginBottom: 8 }}>
              Submit New Design</Text>
            <Input placeholder="Design / template name" value={newTemplateName}
              onChangeText={setNewTemplateName} />
            <Button title="Submit Design" onPress={handleSubmitTemplate}
              loading={submittingTemplate} size="md" />

            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
              marginTop: 24, marginBottom: 12 }}>
              Existing Templates ({templates.length})</Text>
            {loadingTemplates ? (
              <Text style={{ color: COLORS.muted }}>Loading...</Text>
            ) : templates.length === 0 ? (
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>No templates yet</Text>
            ) : (
              templates.map(t => (
                <View key={t._id} style={{ backgroundColor: COLORS.card, borderRadius: 12,
                  padding: 12, marginBottom: 8, flexDirection: "row",
                  alignItems: "center", ...SHADOW.sm }}>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>🖼️</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink }}>{t.name}</Text>
                </View>
              ))
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DetailCard({ title, children }) {
  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
      marginBottom: 16, ...SHADOW.sm }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink, marginBottom: 12 }}>
        {title}</Text>
      {children}
    </View>
  );
}
function DetailRow({ label, value, bold, tag }) {
  const tagColor = tag === "PAID" ? COLORS.success : COLORS.warning;
  const tagBg    = tag === "PAID" ? "#DCFCE7" : "#FEF3C7";
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: bold ? "800" : "600",
          color: COLORS.ink, textAlign: "right", flexShrink: 1 }}>{value}</Text>
        {tag && (
          <View style={{ backgroundColor: tagBg, paddingHorizontal: 8,
            paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: tagColor }}>{tag}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
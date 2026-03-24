// app/(customer)/order-detail/[id].jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import RazorpayCheckout from "react-native-razorpay";

import { getMyOrders } from "../../../src/services/order.service";
import {
  createAdvanceOrder,
  createRemainingOrder,
  verifyPayment,
} from "../../../src/services/payment.service";
import { useAuth } from "../../../src/store/index";
import StatusBadge from "../../../src/components/cards/StatusBadge";
import Button from "../../../src/components/buttons/Button";
import Loader from "../../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../../src/config/theme";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../../../src/utils/constants";
import { formatCurrency, formatDate, shortOrderId } from "../../../src/utils/helpers";
import ENV from "../../../src/config/env";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const orders = await getMyOrders();
      const found = orders.find((o) => o._id === id);
      setOrder(found || null);
    } catch (_) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrder(); }, [id]));

  // ─── Payment handlers ─────────────────────────────────────────────────────

  const handlePayment = async (type) => {
    setPaymentLoading(true);
    try {
      // Step 1: Create Razorpay order on backend
      const data =
        type === "ADVANCE"
          ? await createAdvanceOrder(order._id)
          : await createRemainingOrder(order._id);

      const { razorpayOrder, amount } = data;

      // Step 2: Open Razorpay checkout
      const options = {
        description: `PrintConnect — ${type === "ADVANCE" ? "Advance" : "Remaining"} Payment`,
        currency: "INR",
        key: ENV.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,   // in paise from backend
        order_id: razorpayOrder.id,
        name: "PrintConnect",
        prefill: {
          email: user?.email || "",
          name: user?.name || "",
        },
        theme: { color: COLORS.primary },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // Step 3: Verify on backend
      await verifyPayment({
        orderId: order._id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        orderType: type,
      });

      Alert.alert("Payment Successful! ✅",
        `Your ${type === "ADVANCE" ? "advance" : "remaining"} payment of ${formatCurrency(amount)} was successful.`,
        [{ text: "OK", onPress: fetchOrder }]
      );
    } catch (error) {
      // Razorpay returns error object with `description` on user cancel
      if (error?.description !== "Payment Cancelled") {
        Alert.alert("Payment Failed", error?.description || error?.message || "Something went wrong");
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────

  const showAdvancePayment =
    order?.status === ORDER_STATUS.ADVANCE_PAYMENT_PENDING &&
    !order?.payment?.advancePaid;

  const showRemainingPayment =
    order?.status === ORDER_STATUS.REMAINING_PAYMENT_PENDING &&
    order?.payment?.advancePaid &&
    !order?.payment?.remainingPaid;

  if (loading) return <Loader message="Loading order details..." />;

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface,
        alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
          Order not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const advanceAmount = Math.round((order.price || 0) * 0.4);
  const remainingAmount = (order.price || 0) - advanceAmount;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center",
        padding: 20, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: COLORS.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
            {shortOrderId(order._id)}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            Placed on {formatDate(order.createdAt)}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status timeline */}
        <StatusTimeline currentStatus={order.status} />

        {/* Payment action card */}
        {(showAdvancePayment || showRemainingPayment) && (
          <View style={{ backgroundColor: "#FEF3C7", borderRadius: 16,
            padding: 16, marginBottom: 16, borderWidth: 1,
            borderColor: "#FDE68A" }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.warning,
              marginBottom: 4 }}>
              {showAdvancePayment ? "⚡ Advance Payment Due" : "⚡ Remaining Payment Due"}
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 12 }}>
              {showAdvancePayment
                ? `Pay ${formatCurrency(advanceAmount)} (40%) to start printing`
                : `Pay ${formatCurrency(remainingAmount)} (60%) to release your order`}
            </Text>
            <Button
              title={`Pay ${showAdvancePayment
                ? formatCurrency(advanceAmount)
                : formatCurrency(remainingAmount)} Now`}
              onPress={() => handlePayment(showAdvancePayment ? "ADVANCE" : "REMAINING")}
              loading={paymentLoading}
              size="md"
            />
          </View>
        )}

        {/* Order details card */}
        <DetailCard title="Order Details">
          <DetailRow label="Product" value={order.product?.name} />
          <DetailRow label="Template" value={order.template?.name || "None"} />
          <DetailRow label="Quantity" value={String(order.quantity)} />
          <DetailRow label="Language" value={order.language} />
          <DetailRow label="Color" value={order.color} />
          {order.timeRequired && (
            <DetailRow label="Time Required" value={`${order.timeRequired} days`} />
          )}
          {order.details && (
            <DetailRow label="Details" value={order.details} />
          )}
        </DetailCard>

        {/* Payment summary card */}
        <DetailCard title="Payment Summary">
          <DetailRow label="Total Price" value={formatCurrency(order.price)} bold />
          <DetailRow
            label="Advance (40%)"
            value={formatCurrency(advanceAmount)}
            tag={order.payment?.advancePaid ? "PAID" : "PENDING"}
          />
          <DetailRow
            label="Remaining (60%)"
            value={formatCurrency(remainingAmount)}
            tag={order.payment?.remainingPaid ? "PAID" : "PENDING"}
          />
        </DetailCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

const STATUS_FLOW = [
  ORDER_STATUS.ORDER_PLACED,
  ORDER_STATUS.ADVANCE_PAYMENT_PENDING,
  ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED,
  ORDER_STATUS.PRINTING_IN_PROGRESS,
  ORDER_STATUS.REMAINING_PAYMENT_PENDING,
  ORDER_STATUS.REMAINING_PAYMENT_COMPLETED,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.ORDER_COMPLETED,
];

function StatusTimeline({ currentStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isRejected = currentStatus === ORDER_STATUS.DESIGN_REJECTED;

  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
      padding: 16, marginBottom: 16, ...SHADOW.sm }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
        marginBottom: 14 }}>
        Order Progress
      </Text>

      {isRejected ? (
        <View style={{ flexDirection: "row", alignItems: "center",
          backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12 }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>❌</Text>
          <Text style={{ color: COLORS.danger, fontWeight: "700" }}>
            Design Rejected
          </Text>
        </View>
      ) : (
        STATUS_FLOW.map((status, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <View key={status} style={{ flexDirection: "row",
              alignItems: "flex-start", marginBottom: 8 }}>
              {/* Dot */}
              <View style={{ alignItems: "center", width: 24 }}>
                <View style={{
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: isDone ? COLORS.success
                    : isCurrent ? COLORS.primary : COLORS.border,
                  borderWidth: isCurrent ? 3 : 0,
                  borderColor: COLORS.primaryLight,
                  marginTop: 2,
                }} />
                {index < STATUS_FLOW.length - 1 && (
                  <View style={{ width: 2, height: 20,
                    backgroundColor: isDone ? COLORS.success : COLORS.border,
                    marginTop: 2 }} />
                )}
              </View>
              {/* Label */}
              <Text style={{
                marginLeft: 10,
                fontSize: 13,
                fontWeight: isCurrent ? "700" : "400",
                color: isDone ? COLORS.success
                  : isCurrent ? COLORS.primary : COLORS.muted,
              }}>
                {ORDER_STATUS_LABELS[status]}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

// ─── Detail card & row ────────────────────────────────────────────────────────

function DetailCard({ title, children }) {
  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
      padding: 16, marginBottom: 16, ...SHADOW.sm }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
        marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value, bold, tag }) {
  const tagColor = tag === "PAID" ? COLORS.success : COLORS.warning;
  const tagBg = tag === "PAID" ? "#DCFCE7" : "#FEF3C7";

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: 10 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{
          fontSize: 13,
          fontWeight: bold ? "800" : "600",
          color: COLORS.ink,
          textAlign: "right",
          flexShrink: 1,
        }}>
          {value}
        </Text>
        {tag && (
          <View style={{ backgroundColor: tagBg, paddingHorizontal: 8,
            paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: tagColor }}>
              {tag}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
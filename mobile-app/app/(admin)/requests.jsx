// app/(admin)/requests.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity,
  Modal, Alert, TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAdminRequests, reviewRequest } from "../../src/services/admin.service";
import Loader from "../../src/components/loaders/Loader";
import Button from "../../src/components/buttons/Button";
import Input from "../../src/components/inputs/Input";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatDate } from "../../src/utils/helpers";

const REQUEST_TYPES = {
  PRICE_UPDATE:         { label: "Price Update",          emoji: "💰", color: COLORS.warning  },
  TEMPLATE_UPDATE:      { label: "Template Update",       emoji: "🎨", color: COLORS.primary  },
  PRODUCT_CHANGE:       { label: "Product / Category",    emoji: "🗂️", color: COLORS.info     },
  DISCOUNT_REQUEST:     { label: "Discount / Offer",      emoji: "🏷️", color: COLORS.success  },
  OPERATIONAL_FEEDBACK: { label: "Operational Feedback",  emoji: "📝", color: COLORS.inkSoft  },
};

const STATUS_CONFIG = {
  PENDING:  { color: COLORS.warning, bg: "#FEF3C7", label: "Pending"  },
  APPROVED: { color: COLORS.success, bg: "#DCFCE7", label: "Approved" },
  REJECTED: { color: COLORS.danger,  bg: "#FEE2E2", label: "Rejected" },
  REVIEWED: { color: COLORS.info,    bg: "#CFFAFE", label: "Reviewed" },
};

const FILTERS = [
  { label: "All",      value: null },
  { label: "Pending",  value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminRequestsScreen() {
  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  // Review modal
  const [reviewModal,   setReviewModal]   = useState(false);
  const [selectedReq,   setSelectedReq]   = useState(null);
  const [adminNote,     setAdminNote]     = useState("");
  const [submitting,    setSubmitting]    = useState(false);

  const fetchRequests = async () => {
    try {
      const filter = activeFilter ? { status: activeFilter } : {};
      setRequests(await getAdminRequests(filter));
    } catch (_) { setRequests([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchRequests(); }, [activeFilter]));
  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  const openReview = (req) => {
    setSelectedReq(req);
    setAdminNote("");
    setReviewModal(true);
  };

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      await reviewRequest(selectedReq._id, { status, adminNote });
      Alert.alert(
        status === "APPROVED" ? "✅ Approved" : status === "REJECTED" ? "❌ Rejected" : "✅ Reviewed",
        `Request has been ${status.toLowerCase()}.${status === "APPROVED" && selectedReq.type === "PRICE_UPDATE" ? "\n\nProduct price has been updated automatically." : ""}`
      );
      setReviewModal(false);
      fetchRequests();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return <Loader message="Loading requests..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>
          Owner Requests</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal data={FILTERS} keyExtractor={i => String(i.value)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 14 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveFilter(item.value)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: activeFilter === item.value ? "#7C3AED" : COLORS.card,
              borderWidth: 1,
              borderColor: activeFilter === item.value ? "#7C3AED" : COLORS.border }}>
            <Text style={{ fontSize: 12, fontWeight: "600",
              color: activeFilter === item.value ? COLORS.white : COLORS.inkSoft }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Requests list */}
      <FlatList
        data={requests} keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor="#7C3AED" />}
        renderItem={({ item }) => {
          const type = REQUEST_TYPES[item.type] || { label: item.type, emoji: "📋", color: COLORS.muted };
          const cfg  = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
          return (
            <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
              padding: 16, marginBottom: 12, ...SHADOW.sm }}>
              {/* Top row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>{type.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
                    {type.label}</Text>
                </View>
                <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10,
                  paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color }}>
                    {cfg.label}</Text>
                </View>
              </View>

              {/* Owner */}
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                From: <Text style={{ fontWeight: "600", color: COLORS.inkSoft }}>
                  {item.owner?.name || "Owner"}</Text>
              </Text>

              {/* Title + description */}
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
                marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                {item.description}</Text>

              {/* Extra details */}
              {item.product && (
                <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                  📦 Product: {item.product.name} (₹{item.product.price})</Text>
              )}
              {item.requestedPrice && (
                <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                  💰 Requested Price: ₹{item.requestedPrice}</Text>
              )}
              {item.discountPercentage && (
                <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>
                  🏷️ Discount: {item.discountPercentage}%</Text>
              )}

              {/* Admin note if already reviewed */}
              {item.adminNote && (
                <View style={{ backgroundColor: cfg.bg, borderRadius: 10,
                  padding: 10, marginTop: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color,
                    marginBottom: 2 }}>Your Note:</Text>
                  <Text style={{ fontSize: 12, color: COLORS.inkSoft }}>{item.adminNote}</Text>
                </View>
              )}

              <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>
                {formatDate(item.createdAt)}
              </Text>

              {/* Review button — only for pending */}
              {item.status === "PENDING" && (
                <TouchableOpacity onPress={() => openReview(item)}
                  style={{ backgroundColor: "#7C3AED", borderRadius: 12,
                    padding: 12, alignItems: "center" }}>
                  <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 13 }}>
                    Review This Request
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
              No requests found</Text>
          </View>
        }
      />

      {/* Review Modal */}
      <Modal visible={reviewModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setReviewModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20 }}>
            {/* Modal header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
                Review Request</Text>
              <TouchableOpacity onPress={() => setReviewModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedReq && (
              <>
                {/* Request summary */}
                <View style={{ backgroundColor: COLORS.surface, borderRadius: 14,
                  padding: 14, marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
                    marginBottom: 4 }}>{selectedReq.title}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>
                    {selectedReq.description}</Text>
                  {selectedReq.type === "PRICE_UPDATE" && (
                    <View style={{ backgroundColor: "#FEF3C7", borderRadius: 10,
                      padding: 10 }}>
                      <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: "600" }}>
                        ⚠️ Approving will automatically update the product price to ₹{selectedReq.requestedPrice}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Admin note */}
                <Input
                  label="Note to Owner (optional)"
                  placeholder="Add a note or reason for your decision..."
                  value={adminNote}
                  onChangeText={setAdminNote}
                  multiline
                  numberOfLines={3}
                />

                {/* Action buttons */}
                <View style={{ gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleReview("APPROVED")}
                    disabled={submitting}
                    style={{ backgroundColor: COLORS.success, borderRadius: 14,
                      padding: 16, alignItems: "center",
                      opacity: submitting ? 0.5 : 1 }}>
                    <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 15 }}>
                      ✅ Approve
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReview("REVIEWED")}
                    disabled={submitting}
                    style={{ backgroundColor: COLORS.info, borderRadius: 14,
                      padding: 16, alignItems: "center",
                      opacity: submitting ? 0.5 : 1 }}>
                    <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 15 }}>
                      👁️ Mark Reviewed
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReview("REJECTED")}
                    disabled={submitting}
                    style={{ backgroundColor: COLORS.danger, borderRadius: 14,
                      padding: 16, alignItems: "center",
                      opacity: submitting ? 0.5 : 1 }}>
                    <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 15 }}>
                      ❌ Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
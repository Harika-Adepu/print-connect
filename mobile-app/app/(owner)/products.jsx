// app/(owner)/products.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, Alert, RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProducts, createProduct, getTemplates, createTemplate } from "../../src/services/owner.service";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency } from "../../src/utils/helpers";

export default function OwnerProductsScreen() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create product modal
  const [productModal, setProductModal] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "" });
  const [errors, setErrors] = useState({});

  // Template modal
  const [templateModal,       setTemplateModal]       = useState(false);
  const [selectedProduct,     setSelectedProduct]     = useState(null);
  const [templates,           setTemplates]           = useState([]);
  const [loadingTemplates,    setLoadingTemplates]    = useState(false);
  const [newTemplateName,     setNewTemplateName]     = useState("");
  const [submittingTemplate,  setSubmittingTemplate]  = useState(false);

  const fetchProducts = async () => {
    try { setProducts(await getProducts()); }
    catch (_) { setProducts([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchProducts(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleCreate = async () => {
    const errs = {};
    if (!form.name.trim())              errs.name  = "Product name is required";
    if (!form.price || isNaN(form.price)) errs.price = "Valid price is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name.trim(), price: parseFloat(form.price),
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
      });
      Alert.alert("✅ Product Created", `"${form.name}" has been added.`);
      setForm({ name: "", price: "", description: "", category: "" });
      setProductModal(false);
      fetchProducts();
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setSubmitting(false); }
  };

  const openTemplateModal = async (product) => {
    setSelectedProduct(product);
    setTemplateModal(true);
    setLoadingTemplates(true);
    try { setTemplates(await getTemplates(product._id)); }
    catch (_) { setTemplates([]); }
    finally { setLoadingTemplates(false); }
  };

  const handleSubmitTemplate = async () => {
    if (!newTemplateName.trim()) { Alert.alert("Error", "Template name is required"); return; }
    setSubmittingTemplate(true);
    try {
      await createTemplate({ name: newTemplateName.trim(), product: selectedProduct._id });
      Alert.alert("✅ Template Submitted");
      setNewTemplateName("");
      setTemplates(await getTemplates(selectedProduct._id));
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setSubmittingTemplate(false); }
  };

  if (loading) return <Loader message="Loading products..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", padding: 20, paddingBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>Products</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
            {products.length} active product{products.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setProductModal(true)}
          style={{ backgroundColor: COLORS.primary, borderRadius: 12,
            paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 13 }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={products} keyExtractor={i => i._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
            marginBottom: 12, ...SHADOW.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                  {item.name}</Text>
                {item.category && (
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    {item.category}</Text>
                )}
                {item.description && (
                  <Text style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
                    {item.description}</Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.primary }}>
                  {formatCurrency(item.price)}</Text>
                <View style={{ marginTop: 6, backgroundColor: "#DCFCE7",
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.success }}>
                    ACTIVE</Text>
                </View>
              </View>
            </View>
            {/* Templates button */}
            <TouchableOpacity onPress={() => openTemplateModal(item)}
              style={{ marginTop: 12, flexDirection: "row", alignItems: "center",
                backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>🎨</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>
                View / Add Templates</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🗂️</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>No products yet</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
              Tap "+ Add" to create your first product</Text>
          </View>
        }
      />

      {/* Create Product Modal */}
      <Modal visible={productModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setProductModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
                Add New Product</Text>
              <TouchableOpacity onPress={() => setProductModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>
            <Input label="Product Name *" placeholder="e.g. Visiting Card"
              value={form.name} onChangeText={v => handleChange("name", v)} error={errors.name} />
            <Input label="Price (₹) *" placeholder="e.g. 500"
              value={form.price} onChangeText={v => handleChange("price", v)}
              keyboardType="numeric" error={errors.price} />
            <Input label="Category" placeholder="e.g. Cards, Posters"
              value={form.category} onChangeText={v => handleChange("category", v)} />
            <Input label="Description" placeholder="Brief description..."
              value={form.description} onChangeText={v => handleChange("description", v)}
              multiline numberOfLines={3} />
            <View style={{ marginTop: 8 }}>
              <Button title="Create Product" onPress={handleCreate}
                loading={submitting} size="lg" />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Templates Modal */}
      <Modal visible={templateModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setTemplateModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20, flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>
                🎨 {selectedProduct?.name} Templates</Text>
              <TouchableOpacity onPress={() => setTemplateModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>
            <Input placeholder="New template / design name" value={newTemplateName}
              onChangeText={setNewTemplateName} />
            <Button title="Submit Template" onPress={handleSubmitTemplate}
              loading={submittingTemplate} size="md" />
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink,
              marginTop: 20, marginBottom: 12 }}>
              Existing ({loadingTemplates ? "..." : templates.length})</Text>
            {!loadingTemplates && templates.map(t => (
              <View key={t._id} style={{ backgroundColor: COLORS.card, borderRadius: 12,
                padding: 12, marginBottom: 8, flexDirection: "row",
                alignItems: "center", ...SHADOW.sm }}>
                <Text style={{ fontSize: 18, marginRight: 10 }}>🖼️</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink }}>{t.name}</Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
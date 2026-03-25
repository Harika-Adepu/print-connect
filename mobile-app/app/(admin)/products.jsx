// app/(admin)/products.jsx
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, Modal, Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAllProducts, updateProduct, deactivateProduct,
  getAllTemplates, updateTemplate,
} from "../../src/services/admin.service";
import Input from "../../src/components/inputs/Input";
import Button from "../../src/components/buttons/Button";
import Loader from "../../src/components/loaders/Loader";
import { COLORS, SHADOW } from "../../src/config/theme";
import { formatCurrency } from "../../src/utils/helpers";

const TABS = ["Products", "Templates"];

export default function AdminProductsScreen() {
  const [activeTab,  setActiveTab]  = useState("Products");
  const [products,   setProducts]   = useState([]);
  const [templates,  setTemplates]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit product modal
  const [editModal,      setEditModal]      = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm,    setProductForm]    = useState({});
  const [savingProduct,  setSavingProduct]  = useState(false);

  // Edit template modal
  const [templateModal,   setTemplateModal]   = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName,    setTemplateName]    = useState("");
  const [savingTemplate,  setSavingTemplate]  = useState(false);

  const fetchData = async () => {
    try {
      const [p, t] = await Promise.all([getAllProducts(), getAllTemplates()]);
      setProducts(p); setTemplates(t);
    } catch (_) { setProducts([]); setTemplates([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Edit product ──────────────────────────────────────────────────────────
  const openEditProduct = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      description: product.description || "",
      category: product.category || "",
    });
    setEditModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      Alert.alert("Error", "Name and price are required"); return;
    }
    setSavingProduct(true);
    try {
      await updateProduct(selectedProduct._id, {
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: productForm.description || undefined,
        category: productForm.category || undefined,
      });
      Alert.alert("✅ Updated", "Product updated successfully.");
      setEditModal(false);
      fetchData();
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setSavingProduct(false); }
  };

  const handleDeactivate = (product) => {
    Alert.alert("Deactivate Product",
      `Deactivate "${product.name}"? Customers won't see it anymore.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate", style: "destructive",
          onPress: async () => {
            try {
              await deactivateProduct(product._id);
              Alert.alert("Done", "Product deactivated.");
              fetchData();
            } catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  };

  // ── Edit template ─────────────────────────────────────────────────────────
  const openEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { Alert.alert("Error", "Template name required"); return; }
    setSavingTemplate(true);
    try {
      await updateTemplate(selectedTemplate._id, { name: templateName.trim() });
      Alert.alert("✅ Updated", "Template updated.");
      setTemplateModal(false);
      fetchData();
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setSavingTemplate(false); }
  };

  const handleDeactivateTemplate = (template) => {
    Alert.alert("Deactivate Template", `Deactivate "${template.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate", style: "destructive",
          onPress: async () => {
            try {
              await updateTemplate(template._id, { isActive: false });
              Alert.alert("Done", "Template deactivated.");
              fetchData();
            } catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Loading products & templates..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.ink }}>
          Products & Templates</Text>
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: "row", marginHorizontal: 20,
        backgroundColor: COLORS.border, borderRadius: 12,
        padding: 4, marginBottom: 16 }}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 10, alignItems: "center",
              borderRadius: 10,
              backgroundColor: activeTab === tab ? COLORS.card : "transparent" }}>
            <Text style={{ fontSize: 13, fontWeight: "700",
              color: activeTab === tab ? COLORS.ink : COLORS.muted }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products tab */}
      {activeTab === "Products" && (
        <FlatList
          data={products} keyExtractor={i => i._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor="#7C3AED" />}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
              padding: 16, marginBottom: 12, ...SHADOW.sm }}>
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
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#7C3AED" }}>
                    {formatCurrency(item.price)}</Text>
                  <View style={{ marginTop: 6,
                    backgroundColor: item.isActive ? "#DCFCE7" : "#FEE2E2",
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700",
                      color: item.isActive ? COLORS.success : COLORS.danger }}>
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Action buttons */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => openEditProduct(item)}
                  style={{ flex: 1, backgroundColor: "#EDE9FE", borderRadius: 10,
                    padding: 10, alignItems: "center" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#7C3AED" }}>
                    ✏️ Edit</Text>
                </TouchableOpacity>
                {item.isActive && (
                  <TouchableOpacity onPress={() => handleDeactivate(item)}
                    style={{ flex: 1, backgroundColor: "#FEE2E2", borderRadius: 10,
                      padding: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.danger }}>
                      🚫 Deactivate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🗂️</Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                No products found</Text>
            </View>
          }
        />
      )}

      {/* Templates tab */}
      {activeTab === "Templates" && (
        <FlatList
          data={templates} keyExtractor={i => i._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor="#7C3AED" />}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: COLORS.card, borderRadius: 16,
              padding: 16, marginBottom: 12, ...SHADOW.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between",
                alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                    🖼️ {item.name}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    Product: {item.product?.name || "—"}</Text>
                </View>
                <View style={{ backgroundColor: item.isActive ? "#DCFCE7" : "#FEE2E2",
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700",
                    color: item.isActive ? COLORS.success : COLORS.danger }}>
                    {item.isActive ? "ACTIVE" : "INACTIVE"}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity onPress={() => openEditTemplate(item)}
                  style={{ flex: 1, backgroundColor: "#EDE9FE", borderRadius: 10,
                    padding: 10, alignItems: "center" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#7C3AED" }}>
                    ✏️ Edit</Text>
                </TouchableOpacity>
                {item.isActive && (
                  <TouchableOpacity onPress={() => handleDeactivateTemplate(item)}
                    style={{ flex: 1, backgroundColor: "#FEE2E2", borderRadius: 10,
                      padding: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.danger }}>
                      🚫 Deactivate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🖼️</Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}>
                No templates found</Text>
            </View>
          }
        />
      )}

      {/* Edit Product Modal */}
      <Modal visible={editModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setEditModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
                Edit Product</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>
            <Input label="Product Name *" value={productForm.name}
              onChangeText={v => setProductForm(p => ({ ...p, name: v }))} />
            <Input label="Price (₹) *" value={productForm.price}
              onChangeText={v => setProductForm(p => ({ ...p, price: v }))}
              keyboardType="numeric" />
            <Input label="Category" value={productForm.category}
              onChangeText={v => setProductForm(p => ({ ...p, category: v }))} />
            <Input label="Description" value={productForm.description}
              onChangeText={v => setProductForm(p => ({ ...p, description: v }))}
              multiline numberOfLines={3} />
            <Button title="Save Changes" onPress={handleSaveProduct}
              loading={savingProduct} size="lg" />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Template Modal */}
      <Modal visible={templateModal} animationType="slide"
        presentationStyle="pageSheet" onRequestClose={() => setTemplateModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
                Edit Template</Text>
              <TouchableOpacity onPress={() => setTemplateModal(false)}>
                <Text style={{ fontSize: 22, color: COLORS.muted }}>×</Text>
              </TouchableOpacity>
            </View>
            <Input label="Template Name *" value={templateName}
              onChangeText={setTemplateName} />
            <Button title="Save Changes" onPress={handleSaveTemplate}
              loading={savingTemplate} size="lg" />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
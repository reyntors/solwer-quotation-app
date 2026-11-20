import { useGlobalContext } from "@/lib/global-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Client, ID, TablesDB } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const ADMIN_EMAIL = "reyntors2@gmail.com";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform("com.solwer.solwerquotation");

const tablesDB = new TablesDB(client);

type ProductRow = {
  $id: string;
  qty: number;
  unit: string;
  description: string;
  price: number;
  totalPrice: number;
};

type ProductForm = {
  description: string;
  qty: string;
  unit: string;
  price: string;
};

const emptyForm: ProductForm = {
  description: "",
  qty: "1",
  unit: "EA",
  price: "",
};

export default function ProductManagement() {
  const { user } = useGlobalContext();

  const isAdmin =
    user?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await tablesDB.listRows({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.EXPO_PUBLIC_APPWRITE_QUOTATIONS_COLLECTION_ID!,
        queries: [],
      });

      setProducts(response.rows as unknown as ProductRow[]);
    } catch (error: any) {
      console.error("Product loading error:", error);
      Alert.alert(
        "Loading Error",
        error?.message || "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.description?.toLowerCase().includes(term) ||
        product.unit?.toLowerCase().includes(term),
    );
  }, [products, search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (product: ProductRow) => {
    setEditingProduct(product);
    setForm({
      description: product.description || "",
      qty: String(product.qty ?? 1),
      unit: product.unit || "EA",
      price: String(product.price ?? ""),
    });
    setModalVisible(true);
  };

  const saveProduct = async () => {
    if (!isAdmin) return;

    const description = form.description.trim();
    const unit = form.unit.trim().toUpperCase();
    const qty = Number(form.qty);
    const price = Number(form.price);

    if (
      !description ||
      !unit ||
      form.qty.trim() === "" ||
      form.price.trim() === ""
    ) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    if (
      !Number.isFinite(qty) ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      Alert.alert(
        "Invalid Values",
        "Quantity must be a positive whole number and price must be zero or higher.",
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        description,
        qty,
        unit,
        price,
        totalPrice: qty * price,
      };

      if (editingProduct) {
        await tablesDB.updateRow({
          databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.EXPO_PUBLIC_APPWRITE_QUOTATIONS_COLLECTION_ID!,
          rowId: editingProduct.$id,
          data,
        });

        Alert.alert("Success", "Product updated successfully.");
      } else {
        await tablesDB.createRow({
          databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.EXPO_PUBLIC_APPWRITE_QUOTATIONS_COLLECTION_ID!,
          rowId: ID.unique(),
          data,
        });

        Alert.alert("Success", "Product added successfully.");
      }

      setModalVisible(false);
      setForm(emptyForm);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error: any) {
      console.error("Product save error:", error);
      Alert.alert("Save Error", error?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (product: ProductRow) => {
    if (!isAdmin) return;

    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.description}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await tablesDB.deleteRow({
                databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                tableId:
                  process.env.EXPO_PUBLIC_APPWRITE_QUOTATIONS_COLLECTION_ID!,
                rowId: product.$id,
              });

              setProducts((current) =>
                current.filter((item) => item.$id !== product.$id),
              );

              Alert.alert("Deleted", "Product deleted successfully.");
            } catch (error: any) {
              console.error("Product delete error:", error);
              Alert.alert(
                "Delete Error",
                error?.message || "Unable to delete product.",
              );
            }
          },
        },
      ],
    );
  };

  const formatCurrency = (value: number) =>
    `₱${Number(value || 0).toLocaleString("en-PH")}`;

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-xl font-rubik-bold text-red-500">
          Access Denied
        </Text>
        <Text className="text-center text-gray-500 mt-2">
          Only authorized administrators can manage products.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-rubik-bold text-black-300">
          Product Management
        </Text>
        <Text className="text-gray-500 mt-1">
          Manage your Solwer quotation products and prices.
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search product..."
          className="border border-gray-300 rounded-xl px-4 py-3 mt-5"
        />

        <TouchableOpacity
          onPress={openAddModal}
          className="bg-primary-300 rounded-xl py-3 mt-4"
        >
          <Text className="text-white text-center font-rubik-bold">
            + Add New Product
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-500 mt-4">
          Total products: {products.length}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-3 text-gray-500">Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshing={loading}
          onRefresh={fetchProducts}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              {search
                ? "No matching products found."
                : "No products yet. Add your first product."}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="border border-gray-200 rounded-xl p-4 mb-3">
              <Text className="text-base font-rubik-bold text-black-300">
                {item.description}
              </Text>

              <Text className="text-gray-500 mt-2">
                Quantity: {item.qty} {item.unit}
              </Text>

              <Text className="text-gray-500">
                Unit Price: {formatCurrency(item.price)}
              </Text>

              <Text className="text-primary-300 font-rubik-bold mt-1">
                Total: {formatCurrency(item.totalPrice)}
              </Text>

              <View className="flex-row mt-4 gap-3">
                <TouchableOpacity
                  onPress={() => openEditModal(item)}
                  className="flex-1 bg-blue-600 rounded-lg py-2"
                >
                  <Text className="text-white text-center font-rubik-medium">
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteProduct(item)}
                  className="flex-1 bg-red-500 rounded-lg py-2"
                >
                  <Text className="text-white text-center font-rubik-medium">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-5">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <View className="bg-white rounded-2xl p-5">
              <Text className="text-xl font-rubik-bold mb-5">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Text>

              <Text className="font-rubik-medium mb-2">Description</Text>
              <TextInput
                value={form.description}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, description: value }))
                }
                placeholder="Product description"
                className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
              />

              <Text className="font-rubik-medium mb-2">Quantity</Text>
              <TextInput
                value={form.qty}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, qty: value }))
                }
                keyboardType="numeric"
                placeholder="1"
                className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
              />

              <Text className="font-rubik-medium mb-2">Unit</Text>
              <TextInput
                value={form.unit}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, unit: value }))
                }
                placeholder="EA, PCS, MTS, SET"
                autoCapitalize="characters"
                className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
              />

              <Text className="font-rubik-medium mb-2">Unit Price (₱)</Text>
              <TextInput
                value={form.price}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, price: value }))
                }
                keyboardType="decimal-pad"
                placeholder="Enter price"
                className="border border-gray-300 rounded-lg px-3 py-3 mb-5"
              />

              <Text className="text-gray-500 mb-4">
                Total price:{" "}
                {formatCurrency(
                  (Number(form.qty) || 0) * (Number(form.price) || 0),
                )}
              </Text>

              <TouchableOpacity
                disabled={saving}
                onPress={saveProduct}
                className="bg-primary-300 rounded-xl py-3"
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-center font-rubik-bold">
                    {editingProduct ? "Save Changes" : "Add Product"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={saving}
                onPress={() => setModalVisible(false)}
                className="py-3 mt-2"
              >
                <Text className="text-center text-gray-500">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

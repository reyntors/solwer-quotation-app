import { Client, Databases, Query } from "appwrite";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Client as RNClient, TablesDB } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

const getCompanyLogoBase64 = async () => {
  const logoAsset = Asset.fromModule(require("@/assets/images/logo3.png"));

  await logoAsset.downloadAsync();

  const base64 = await FileSystem.readAsStringAsync(logoAsset.localUri!, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:image/png;base64,${base64}`;
};

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_QUOTATIONS_COLLECTION_ID!;

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const platform = "com.solwer.solwerquotation";

type ProductRow = {
  $id: string;
  qty: number;
  unit: string;
  description: string;
  price: number;
  totalPrice: number;
};

type QuotationItem = {
  description: string;
  qty: number;
  unit: string;
  price: number;
};

const accessoriesClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const accessoriesDB = new Databases(accessoriesClient);

const productsClient = new RNClient()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform);

const tablesDB = new TablesDB(productsClient);

const formatCurrency = (value: number) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });

export default function SolwerQuotation() {
  const { user } = useGlobalContext();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [railingsData, setRailingsData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [shippingFee, setShippingFee] = useState("0");

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const fetchQuotationData = useCallback(async () => {
    if (!user?.$id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch ALL products using pagination
      const limit = 100;
      let offset = 0;
      let allProducts: ProductRow[] = [];

      while (true) {
        const productResponse = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLE_ID,
          queries: [Query.limit(limit), Query.offset(offset)],
        });

        const rows = productResponse.rows as unknown as ProductRow[];

        allProducts = [...allProducts, ...rows];

        if (rows.length < limit) {
          break;
        }

        offset += limit;
      }

      setProducts(allProducts);

      console.log("Quotation products loaded:", allProducts.length);

      // Fetch the latest railing calculator result
      const railingResponse = await accessoriesDB.listDocuments(
        DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_ACCESORIES_COLLECTION_ID!,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ],
      );

      if (railingResponse.documents.length > 0) {
        setRailingsData(railingResponse.documents[0]);
      } else {
        setRailingsData(null);
      }
    } catch (error: any) {
      console.error("Quotation loading error:", error);

      Alert.alert(
        "Loading Error",
        error?.message || "Unable to load quotation products.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchQuotationData();
  }, [fetchQuotationData]);

  // Use the latest railing calculator quantities
  const quotationItems = useMemo<QuotationItem[]>(() => {
    return products.map((product) => {
      let quantity = Number(product.qty) || 0;

      // if (railingsData) {
      //   const description = product.description
      //     .trim()
      //     .toLowerCase();

      //   if (description === "railings 2.4m") {
      //     quantity = Number(railingsData.finalRailings ?? quantity);
      //   } else if (description === "mid clamp") {
      //     quantity = Number(railingsData.finalMidClamp ?? quantity);
      //   } else if (description === "end clamp") {
      //     quantity = Number(railingsData.finalEndClamp ?? quantity);
      //   } else if (description === "l foot") {
      //     quantity = Number(railingsData.superfinaltFoot ?? quantity);
      //   }
      // }

      return {
        description: product.description,
        qty: quantity,
        unit: product.unit,
        price: Number(product.price) || 0,
      };
    });
  }, [products, railingsData]);

  const subtotal = quotationItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  const shipping = Math.max(0, Number(shippingFee) || 0);
  const grandTotal = subtotal + shipping;

  const with125 = grandTotal * 1.25;
  const with130 = grandTotal * 1.3;
  const with135 = grandTotal * 1.35;
  const with140 = grandTotal * 1.4;

  const handleGeneratePDF = async () => {
    if (quotationItems.length === 0) {
      Alert.alert(
        "No Products",
        "Please add products in Product Management first.",
      );
      return;
    }

    try {
      setGeneratingPDF(true);
      const logoBase64 = await getCompanyLogoBase64();
      const now = new Date();
      const quotationNumber = `SOL-${now.getFullYear()}${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
        now.getHours(),
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

      const quotationDate = now.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const htmlItems = quotationItems
        .map(
          (item, index) => `
            <tr>
              <td class="center">${index + 1}</td>
              <td>${escapeHtml(item.description)}</td>
              <td class="center">${item.qty}</td>
              <td class="center">${escapeHtml(item.unit)}</td>
              <td class="number">${formatCurrency(item.price)}</td>
              <td class="number">${formatCurrency(item.qty * item.price)}</td>
            </tr>
          `,
        )
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            @page {
              size: A4;
              margin: 22mm 16mm;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #222;
              font-size: 11px;
              line-height: 1.5;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #16834a;
              padding-bottom: 15px;
              margin-bottom: 22px;
            }

            .brand {
              font-size: 25px;
              font-weight: bold;
              color: #16834a;
              letter-spacing: 1px;
            }

            .tagline {
              color: #666;
              font-size: 10px;
            }

            .quotation-title {
              text-align: right;
              font-size: 23px;
              font-weight: bold;
              color: #222;
            }

            .meta {
              text-align: right;
              color: #555;
              font-size: 10px;
            }

            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #16834a;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin: 20px 0 10px;
            }

            .customer-box {
              border: 1px solid #ddd;
              padding: 12px;
              border-radius: 4px;
            }

            .customer-row {
              margin-bottom: 5px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              font-size: 10px;
            }

            th {
              background: #16834a;
              color: white;
              padding: 9px 6px;
              text-align: left;
            }

            td {
              padding: 8px 6px;
              border-bottom: 1px solid #ddd;
            }

            tbody tr:nth-child(even) {
              background: #f7faf8;
            }

            .center {
              text-align: center;
            }

            .number {
              text-align: right;
              white-space: nowrap;
            }

            .summary {
              width: 48%;
              margin-left: auto;
              margin-top: 18px;
            }

            .summary td {
              padding: 7px;
            }

            .grand-total {
              background: #e9f5ee;
              color: #126b3d;
              font-size: 13px;
              font-weight: bold;
            }

            .package-box {
              border: 1px solid #ddd;
              padding: 12px;
              margin-top: 20px;
            }

            .package-table {
              margin-top: 5px;
            }

            .package-table th {
              background: #f0f4f1;
              color: #222;
            }

            .terms {
              margin-top: 22px;
              color: #666;
              font-size: 9px;
            }

            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 65px;
            }

            .signature {
              width: 42%;
              border-top: 1px solid #444;
              text-align: center;
              padding-top: 7px;
            }

            .footer {
              border-top: 1px solid #ddd;
              margin-top: 35px;
              padding-top: 8px;
              text-align: center;
              color: #777;
              font-size: 9px;
            }

            .company-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #222;
}

.company-logo {
  width: 100px;
  height: 80px;
  object-fit: contain;
}

.company-details h1 {
  margin: 0;
  font-size: 25px;
  font-weight: bold;
}

.company-details p {
  margin: 4px 0 0;
  font-size: 11px;
}
          </style>
        </head>

        <body>
          <div class="header">
            <div class="company-header">
            <img src="${logoBase64}" class="company-logo" />

            <div class="company-details">
              <h1>SOLWER</h1>
              <p>Solar Energy Solutions</p>
            </div>
          </div>

            <div>
              <div class="quotation-title">QUOTATION</div>
              <div class="meta">
                <b>Quotation No:</b> ${quotationNumber}<br />
                <b>Date:</b> ${quotationDate}
              </div>
            </div>
          </div>

          <div class="section-title">CUSTOMER INFORMATION</div>

          <div class="customer-box">
            <div class="customer-row">
              <b>Customer Name:</b>
              ${escapeHtml(customerName || "________________________")}
            </div>
            <div class="customer-row">
              <b>Contact Number:</b>
              ${escapeHtml(customerContact || "________________________")}
            </div>
            <div class="customer-row">
              <b>Installation Address:</b>
              ${escapeHtml(customerAddress || "________________________")}
            </div>
          </div>

          <div class="section-title">QUOTATION DETAILS</div>

          <table>
            <thead>
              <tr>
                <th class="center" style="width:5%">No.</th>
                <th style="width:39%">Description</th>
                <th class="center" style="width:9%">Qty</th>
                <th class="center" style="width:9%">Unit</th>
                <th class="number" style="width:18%">Unit Price</th>
                <th class="number" style="width:20%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${htmlItems}
            </tbody>
          </table>

          <table class="summary">
            <tr>
              <td>Subtotal</td>
              <td class="number">${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td>Shipping Fee</td>
              <td class="number">${formatCurrency(shipping)}</td>
            </tr>
            <tr class="grand-total">
              <td>GRAND TOTAL</td>
              <td class="number">${formatCurrency(grandTotal)}</td>
            </tr>
          </table>

          

          <div class="terms">
            <b>TERMS AND CONDITIONS</b>
            <p>
              This quotation is based on the products, quantities, and prices
              listed above. Any changes to the materials or scope of work may
              result in an adjusted quotation.
            </p>
            <p>
              Final pricing and installation arrangements are subject to
              confirmation and approval.
            </p>
          </div>

          <div class="signatures">
            <div class="signature">
              Prepared By / Authorized Representative
            </div>
            <div class="signature">
              Customer Approval / Signature
            </div>
          </div>

          <div class="footer">
            Thank you for considering SOLWER for your solar energy needs.
          </div>
        </body>
        </html>
      `;

      const file = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Rename PDF using customer name
      const safeCustomerName = customerName
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const newUri = `${FileSystem.cacheDirectory}${safeCustomerName}_Quotation.pdf`;

      await FileSystem.moveAsync({
        from: file.uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "Solwer Quotation",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("PDF Generated", `PDF saved at: ${newUri}`);
      }
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      Alert.alert(
        "PDF Error",
        error?.message || "Failed to generate quotation PDF.",
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        className="mt-5"
      >
        <Text className="text-2xl font-rubik-bold text-center mb-2">
          SOLWER QUOTATION
        </Text>

        <Text className="text-center text-gray-500 mb-6">
          Product list from Product Management
        </Text>

        <View className="mb-5">
          <Text className="font-rubik-medium mb-2">Customer Name</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
            placeholderTextColor="#888"
            className="border border-gray-300 rounded-lg px-3 py-3 text-black"
          />

          <Text className="font-rubik-medium mb-2 mt-4">Contact Number</Text>
          <TextInput
            value={customerContact}
            onChangeText={setCustomerContact}
            placeholder="Enter contact number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg px-3 py-3 text-black"
          />

          <Text className="font-rubik-medium mb-2 mt-4">
            Installation Address
          </Text>
          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            placeholder="Enter installation address"
            placeholderTextColor="#888"
            className="border border-gray-300 rounded-lg px-3 py-3 text-black"
          />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-rubik-bold">Quotation Items</Text>

          <TouchableOpacity onPress={fetchQuotationData}>
            <Text className="text-green-700 font-rubik-medium">Refresh</Text>
          </TouchableOpacity>
        </View>

        {quotationItems.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">
            No products found. Add products in Product Management.
          </Text>
        ) : (
          quotationItems.map((item, index) => (
            <View
              key={`${item.description}-${index}`}
              className="border border-gray-200 rounded-xl p-4 mb-3"
            >
              <Text className="font-rubik-bold text-black-300">
                {item.description}
              </Text>

              <Text className="text-gray-500 mt-2">
                Quantity: {item.qty} {item.unit}
              </Text>

              <Text className="text-gray-500">
                Unit Price: {formatCurrency(item.price)}
              </Text>

              <Text className="font-rubik-bold text-green-700 mt-1">
                Amount: {formatCurrency(item.qty * item.price)}
              </Text>
            </View>
          ))
        )}

        <View className="border-t border-gray-200 pt-4 mt-3">
          <View className="flex-row items-center mb-4">
            <Text className="w-32 text-base font-rubik-medium">
              Shipping Fee:
            </Text>

            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black"
              placeholder="Enter shipping fee"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={shippingFee}
              onChangeText={setShippingFee}
            />
          </View>

          <Text className="text-base text-gray-500">
            Subtotal: {formatCurrency(subtotal)}
          </Text>

          <Text className="text-xl font-rubik-bold text-right mt-2">
            GRAND TOTAL: {formatCurrency(grandTotal)}
          </Text>
        </View>

        {/* <View className="mt-5 bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-rubik-bold mb-3">
            INSTALLATION PACKAGE (1 PAX)
          </Text>

          <Text className="mb-2">
            125%: {formatCurrency(with125)}
          </Text>
          <Text className="mb-2">
            130%: {formatCurrency(with130)}
          </Text>
          <Text className="mb-2">
            135%: {formatCurrency(with135)}
          </Text>
          <Text>
            140%: {formatCurrency(with140)}
          </Text>
        </View> */}

        <TouchableOpacity
          disabled={generatingPDF || quotationItems.length === 0}
          onPress={handleGeneratePDF}
          className="bg-green-700 rounded-full py-4 mt-6 mb-5"
        >
          <View className="flex-row items-center justify-center">
            {generatingPDF ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Image
                  source={icons.document}
                  className="w-5 h-5"
                  tintColor="#FFFFFF"
                  resizeMode="contain"
                />
                <Text className="text-lg font-rubik-medium text-white ml-2">
                  Generate PDF Quotation
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

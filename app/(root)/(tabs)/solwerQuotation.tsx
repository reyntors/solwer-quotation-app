import { Client, Databases, Query } from "appwrite";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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

  const calculateManpowerTotal1 = (row: string[]) => {
    if (row[0]?.toLowerCase().includes("overtime budget")) {
      return row[4] || "";
    }

    return String(
      expenseNumber(row[1] || "0") *
        expenseNumber(row[2] || "0") *
        expenseNumber(row[3] || "0"),
    );
  };

  const [manpowerTableVisible, setManpowerTableVisible] = useState(false);
  const [travelTableVisible, setTravelTableVisible] = useState(false);
  const [laborPercentage, setLaborPercentage] = useState("40");

  const [miscellaneousRows, setMiscellaneousRows] = useState([
    { description: "Manpower Cost", amount: "" },
    { description: "Shipping Expense", amount: "" },
    { description: "Workmanship", amount: "" },
    { description: "Build Apparatus", amount: "" },
  ]);

  const [manpowerRows, setManpowerRows] = useState([
    ["Foreman", "1", "1000", "5", "5000", "6400"],
    ["Assistant", "1", "800", "4", "3200", "4400"],
    ["Helper", "2", "800", "1", "1600", "1600"],
    ["Overtime budget P50 / hour", "", "1500", "", "", ""],
    ["Meals", "3", "350", "5", "5250", ""],
    ["Helper", "2", "300", "1", "600", "600"],
    ["Lodge", "3", "500", "4", "6000", ""],
    ["Tagana-an → Gasoline (Vice-Versa)", "", "", "", "", ""],
  ]);

  const [travelRows, setTravelRows] = useState([
    ["7", "Day 1", "Travel Gingoog-Tagana-an", "3000", "1500"],
    ["8", "Day 2", "Solar Panels Mounting", "", "1500"],
    ["9", "Day 3", "Apparatu & Batt Mounting", "", "1500"],
    ["10", "Day 4", "Commissioning", "", "1500"],
    ["11", "Day 5", "Travel Tagana-an-Surigao", "1000", ""],
  ]);

  const updateManpowerCell = (
    rowIndex: number,
    cellIndex: number,
    value: string,
  ) => {
    setManpowerRows((previous) =>
      previous.map((row, index) => {
        if (index !== rowIndex) return row;

        const updatedRow = [...row];
        updatedRow[cellIndex] = value;

        // Recalculate Total 1 when Pax, Rate, or Days changes
        if ([1, 2, 3].includes(cellIndex)) {
          updatedRow[4] = String(
            expenseNumber(updatedRow[1] || "0") *
              expenseNumber(updatedRow[2] || "0") *
              expenseNumber(updatedRow[3] || "0"),
          );
        }

        return updatedRow;
      }),
    );
  };

  const updateTravelCell = (
    rowIndex: number,
    cellIndex: number,
    value: string,
  ) => {
    setTravelRows((previous) =>
      previous.map((row, index) =>
        index === rowIndex
          ? row.map((cell, column) => (column === cellIndex ? value : cell))
          : row,
      ),
    );
  };

  const expenseNumber = (value: string) => {
    const number = Number(value.replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  };

  const manpowerTotal1 = manpowerRows.reduce(
    (sum, row) => sum + expenseNumber(row[4] || "0"),
    0,
  );

  const manpowerTotal2 = manpowerRows.reduce(
    (sum, row) => sum + expenseNumber(row[5]),
    0,
  );

  const gasolineTotal = travelRows.reduce(
    (sum, row) => sum + expenseNumber(row[3]),
    0,
  );

  const lodgingTotal = travelRows.reduce(
    (sum, row) => sum + expenseNumber(row[4]),
    0,
  );

  const peso = (value: number) =>
    `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
  const [showAllQuotationItems, setShowAllQuotationItems] = useState(false);

  const visibleQuotationItems = showAllQuotationItems
    ? quotationItems
    : quotationItems.slice(0, 3);

  // const shipping = Math.max(0, Number(shippingFee) || 0);
  const grandTotal = subtotal;

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

  const getAmount = (value: string) => {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const manpowerCost = getAmount(miscellaneousRows[0]?.amount || "");
  const shippingExpense = getAmount(miscellaneousRows[1]?.amount || "");
  const workmanship = getAmount(miscellaneousRows[2]?.amount || "");
  const buildApparatus = getAmount(miscellaneousRows[3]?.amount || "");

  const totalMscCost =
    manpowerCost + shippingExpense + workmanship + buildApparatus;

  const laborRate = getAmount(laborPercentage) / 100;

  const laborCost = grandTotal * laborRate;

  const profitLimpyu = laborCost - (grandTotal + totalMscCost);

  const finalProjectCost = grandTotal + totalMscCost + laborCost;

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
          <>
            {visibleQuotationItems.map((item, index) => (
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
            ))}

            {quotationItems.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  setShowAllQuotationItems((previous) => !previous)
                }
                className="border border-green-700 rounded-xl py-3 mb-3"
              >
                <Text className="text-center font-rubik-bold text-green-700">
                  {showAllQuotationItems
                    ? "See Less ▲"
                    : `See More ▼ (${quotationItems.length - 3} more items)`}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View className="border-t border-gray-200 pt-4 mt-3">
          <Text className="text-xl font-rubik-bold text-right mt-2">
            GRAND TOTAL: {formatCurrency(grandTotal)}
          </Text>
        </View>

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

        <View className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <View className="bg-gray-800 px-4 py-4">
            <Text className="text-lg font-rubik-bold text-white">
              MISCELLANEOUS EXPENSES
            </Text>
            <Text className="mt-1 text-xs text-gray-300">
              Project cost breakdown and computation
            </Text>
          </View>

          <View className="flex-row border-b border-gray-200 bg-gray-100 px-4 py-3">
            <Text className="flex-1 text-xs font-rubik-bold text-gray-600">
              DESCRIPTION
            </Text>
            <Text className="w-32 text-right text-xs font-rubik-bold text-gray-600">
              AMOUNT (₱)
            </Text>
          </View>

          {miscellaneousRows.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center border-b border-gray-100 px-4 py-2"
            >
              <TextInput
                value={item.description}
                onChangeText={(value) =>
                  setMiscellaneousRows((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, description: value } : row,
                    ),
                  )
                }
                placeholder="Description"
                className="flex-1 py-2 text-sm text-gray-800"
              />

              <TextInput
                value={item.amount}
                onChangeText={(value) =>
                  setMiscellaneousRows((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, amount: value } : row,
                    ),
                  )
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-right text-sm font-rubik-medium text-gray-800"
              />
            </View>
          ))}
          <View className="flex-row items-center justify-between bg-gray-50 px-3 py-3">
            <View className="flex-1">
              <Text className="text-xs font-rubik-bold text-gray-700">
                INSTALLATION COST
              </Text>
              <Text className="text-xs text-gray-500">
                ( Grand Total × Percentage)
              </Text>
            </View>

            <View className="flex-row items-center">
              <TextInput
                value={laborPercentage}
                onChangeText={setLaborPercentage}
                keyboardType="decimal-pad"
                className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-2 text-center text-sm font-rubik-bold"
              />
              <Text className="ml-1 font-rubik-bold text-gray-700">%</Text>
            </View>
          </View>

          <View className="flex-row gap-2 p-3">
            <TouchableOpacity
              onPress={() =>
                setMiscellaneousRows((prev) => [
                  ...prev,
                  { description: "", amount: "" },
                ])
              }
              className="flex-1 rounded-lg bg-green-700 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                + Add Row
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setMiscellaneousRows((prev) =>
                  prev.length > 4 ? prev.slice(0, -1) : prev,
                )
              }
              className="flex-1 rounded-lg bg-red-600 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                Remove Row
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200">
            {[
              ["TOTAL MSC COST", totalMscCost],
              ["INSTALLATION COST (" + laborPercentage + "%)", laborCost],
              // ["PROFIT (LIMPYU)", profitLimpyu],
            ].map(([label, amount], index) => (
              <View
                key={String(label)}
                className={`flex-row items-center justify-between px-3 py-3 ${
                  index === 2 ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <Text className="flex-1 text-xs font-rubik-bold text-gray-700">
                  {label}
                </Text>
                <Text className="text-sm font-rubik-bold text-gray-900">
                  ₱
                  {Number(amount).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}

            <View className="flex-row items-center justify-between border-t-2 border-gray-300 bg-gray-800 px-3 py-4">
              <Text className="flex-1 text-sm font-rubik-bold text-white">
                FINAL PROJECT COST
              </Text>
              <Text className="text-lg font-rubik-bold text-white">
                ₱
                {finalProjectCost.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* MANPOWER & MAINTENANCE COST */}
        <View className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <View className="bg-gray-800 px-4 py-4">
            <Text className="text-lg font-rubik-bold text-white">
              MANPOWER & MAINTENANCE COST
            </Text>
            <Text className="mt-1 text-xs text-gray-300">
              Manpower, labor and maintenance breakdown
            </Text>
          </View>

          <View className="px-4 pt-4">
            <Text className="mb-3 font-rubik-bold text-green-700">
              Manpower Cost & Maintenance
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View className="flex-row bg-gray-100">
                  {["Skilled", "Pax", "Rate", "Days", "Total", "Total"].map(
                    (header, index) => (
                      <Text
                        key={index}
                        className="border border-gray-200 p-2 text-center text-xs font-rubik-bold text-gray-600"
                        style={{ width: 105 }}
                      >
                        {header}
                      </Text>
                    ),
                  )}
                </View>
                {manpowerRows.map((row, rowIndex) => {
                  const rowColor = rowIndex % 2 === 0 ? "#F3F4F6" : "#FFFFFF";
                  const total1 = calculateManpowerTotal1(row);

                  return (
                    <View
                      key={rowIndex}
                      className="flex-row"
                      style={{ backgroundColor: rowColor }}
                    >
                      {row.map((cell, cellIndex) => {
                        const isOvertimeBudget = row[0]
                          ?.toLowerCase()
                          .includes("overtime budget");

                        const isTotal1 = cellIndex === 4;

                        // Automatically calculated Total 1, except Overtime Budget
                        if (isTotal1 && !isOvertimeBudget) {
                          return (
                            <TextInput
                              key={cellIndex}
                              value={cell}
                              onChangeText={(value) =>
                                updateManpowerCell(rowIndex, cellIndex, value)
                              }
                              placeholder="Enter value"
                              placeholderTextColor="#999"
                              keyboardType={
                                [1, 2, 3, 4, 5].includes(cellIndex)
                                  ? "decimal-pad"
                                  : "default"
                              }
                              className="border border-gray-200 px-2 py-2 text-sm text-gray-800"
                              style={{
                                width: 105,
                                minHeight: 48,
                                backgroundColor: rowColor,
                              }}
                            />
                          );
                        }

                        // Overtime Budget Total 1 remains manually editable
                        return (
                          <TextInput
                            key={cellIndex}
                            value={cell}
                            onChangeText={(value) =>
                              updateManpowerCell(rowIndex, cellIndex, value)
                            }
                            placeholder="Enter value"
                            placeholderTextColor="#999"
                            keyboardType={
                              [1, 2, 3, 4, 5].includes(cellIndex)
                                ? "decimal-pad"
                                : "default"
                            }
                            className="border border-gray-200 px-2 py-2 text-sm text-gray-800"
                            style={{
                              width: 105,
                              minHeight: 48,
                              backgroundColor: rowColor,
                            }}
                          />
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          <TouchableOpacity
            onPress={() => setManpowerTableVisible(true)}
            className="mt-3 rounded-lg bg-blue-600 p-3"
          >
            <Text className="text-center font-semibold text-white">
              View Full Manpower Table
            </Text>
          </TouchableOpacity>

          <View className="flex-row gap-2 p-3">
            <TouchableOpacity
              onPress={() =>
                setManpowerRows([...manpowerRows, ["", "1", "", "1", "", ""]])
              }
              className="flex-1 rounded-lg bg-green-700 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                + Add Row
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setManpowerRows(manpowerRows.slice(0, -1))}
              disabled={manpowerRows.length <= 1}
              className="flex-1 rounded-lg bg-red-600 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                Remove Row
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200">
            <View className="flex-row items-center justify-between bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                TOTAL 1
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(manpowerTotal1)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200 bg-green-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                TOTAL 2
              </Text>
              <Text className="text-sm font-rubik-bold text-green-700">
                {peso(manpowerTotal2)}
              </Text>
            </View>
          </View>
        </View>

        {/* TRAVEL EXPENSES */}
        <View className="mt-5 mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <View className="bg-gray-800 px-4 py-4">
            <Text className="text-lg font-rubik-bold text-white">
              TRAVEL EXPENSES
            </Text>
            <Text className="mt-1 text-xs text-gray-300">
              Transportation, gasoline and lodging breakdown
            </Text>
          </View>

          <View className="p-4">
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View className="flex-row bg-gray-100">
                  {["Date", "Day", "Activity", "Gasoline", "Lodging"].map(
                    (header, index) => (
                      <Text
                        key={index}
                        className="border border-gray-200 p-2 text-center text-xs font-rubik-bold text-gray-600"
                        style={{ width: 125 }}
                      >
                        {header}
                      </Text>
                    ),
                  )}
                </View>

                {travelRows.map((row, rowIndex) => {
                  const rowColor = rowIndex % 2 === 0 ? "#F3F4F6" : "#FFFFFF";

                  return (
                    <View
                      key={rowIndex}
                      className="flex-row"
                      style={{ backgroundColor: rowColor }}
                    >
                      {row.map((cell, cellIndex) => (
                        <TextInput
                          key={cellIndex}
                          value={cell}
                          onChangeText={(value) =>
                            updateTravelCell(rowIndex, cellIndex, value)
                          }
                          placeholder="Enter value"
                          placeholderTextColor="#999"
                          keyboardType={
                            [3, 4].includes(cellIndex)
                              ? "decimal-pad"
                              : "default"
                          }
                          className="border border-gray-200 px-2 py-2 text-sm text-gray-800"
                          style={{
                            width: 125,
                            minHeight: 48,
                            backgroundColor: rowColor,
                          }}
                        />
                      ))}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          <TouchableOpacity
            onPress={() => setTravelTableVisible(true)}
            className="mt-3 rounded-lg bg-blue-600 p-3"
          >
            <Text className="text-center font-semibold text-white">
              View Full Travel Table
            </Text>
          </TouchableOpacity>

          <View className="flex-row gap-2 p-3">
            <TouchableOpacity
              onPress={() =>
                setTravelRows([...travelRows, ["", "", "", "", ""]])
              }
              className="flex-1 rounded-lg bg-green-700 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                + Add Row
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTravelRows(travelRows.slice(0, -1))}
              disabled={travelRows.length <= 1}
              className="flex-1 rounded-lg bg-red-600 py-3"
            >
              <Text className="text-center text-sm font-rubik-bold text-white">
                Remove Row
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200">
            <View className="flex-row items-center justify-between bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                GASOLINE TOTAL
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(gasolineTotal)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                LODGING TOTAL
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(lodgingTotal)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t-2 border-gray-300 bg-gray-800 px-3 py-4">
              <Text className="flex-1 text-sm font-rubik-bold text-white">
                TRAVEL EXPENSES TOTAL
              </Text>
              <Text className="text-lg font-rubik-bold text-white">
                {peso(gasolineTotal + lodgingTotal)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MANPOWER TABLE MODAL */}

      <Modal
        visible={manpowerTableVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setManpowerTableVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-100">
          <View className="flex-row items-center justify-between bg-gray-800 p-4">
            <Text className="text-lg font-bold text-white">
              Full Manpower Table
            </Text>

            <TouchableOpacity
              onPress={() => setManpowerTableVisible(false)}
              className="rounded-lg bg-red-500 px-4 py-2"
            >
              <Text className="font-semibold text-white">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal>
            <View className="p-3">
              <View className="flex-row bg-gray-800">
                {["Skilled", "Pax", "Rate", "Days", "Total", "Total"].map(
                  (header, index) => (
                    <Text
                      key={index}
                      className="w-28 border border-gray-300 p-3 text-center font-bold text-white"
                    >
                      {header}
                    </Text>
                  ),
                )}
              </View>

              {manpowerRows.map((row, rowIndex) => {
                const rowColor = rowIndex % 2 === 0 ? "#F3F4F6" : "#FFFFFF";

                return (
                  <View
                    key={rowIndex}
                    className="flex-row"
                    style={{ backgroundColor: rowColor }}
                  >
                    {row.map((cell, cellIndex) => (
                      <TextInput
                        key={cellIndex}
                        value={cell}
                        onChangeText={(value) =>
                          updateManpowerCell(rowIndex, cellIndex, value)
                        }
                        placeholder="Enter value"
                        placeholderTextColor="#999"
                        keyboardType={
                          [1, 2, 3, 4, 5].includes(cellIndex)
                            ? "decimal-pad"
                            : "default"
                        }
                        className="border border-gray-200 px-2 py-2 text-sm text-gray-800"
                        style={{
                          width: 105,
                          minHeight: 48,
                          backgroundColor: rowColor,
                        }}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <View className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200">
            <View className="flex-row items-center justify-between bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                TOTAL 1
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(manpowerTotal1)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200 bg-green-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                TOTAL 2
              </Text>
              <Text className="text-sm font-rubik-bold text-green-700">
                {peso(manpowerTotal2)}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* TRAVEL TABLE MODAL */}
      <Modal
        visible={travelTableVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setTravelTableVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-100">
          <View className="flex-row items-center justify-between bg-gray-800 p-4">
            <Text className="text-lg font-bold text-white">
              Full Travel Table
            </Text>

            <TouchableOpacity
              onPress={() => setTravelTableVisible(false)}
              className="rounded-lg bg-red-500 px-4 py-2"
            >
              <Text className="font-semibold text-white">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal>
            <View className="p-3">
              <View className="flex-row bg-gray-800">
                {["Date", "Day", "Activity", "Gasoline", "Lodging"].map(
                  (header, index) => (
                    <Text
                      key={index}
                      className="w-32 border border-gray-300 p-3 text-center font-bold text-white"
                    >
                      {header}
                    </Text>
                  ),
                )}
              </View>

              {travelRows.map((row, rowIndex) => {
                const rowColor = rowIndex % 2 === 0 ? "#F3F4F6" : "#FFFFFF";

                return (
                  <View
                    key={rowIndex}
                    className="flex-row"
                    style={{ backgroundColor: rowColor }}
                  >
                    {row.map((cell, cellIndex) => (
                      <TextInput
                        key={cellIndex}
                        value={cell}
                        onChangeText={(value) =>
                          updateTravelCell(rowIndex, cellIndex, value)
                        }
                        placeholder="Enter value"
                        placeholderTextColor="#999"
                        keyboardType={
                          [3, 4].includes(cellIndex) ? "decimal-pad" : "default"
                        }
                        className="w-32 border border-gray-200 p-3 text-center text-sm text-gray-800"
                        style={{
                          backgroundColor: rowColor,
                          minHeight: 48,
                        }}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <View className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200">
            <View className="flex-row items-center justify-between bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                GASOLINE TOTAL
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(gasolineTotal)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-3">
              <Text className="text-xs font-rubik-bold text-gray-700">
                LODGING TOTAL
              </Text>
              <Text className="text-sm font-rubik-bold text-gray-900">
                {peso(lodgingTotal)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t-2 border-gray-300 bg-gray-800 px-3 py-4">
              <Text className="flex-1 text-sm font-rubik-bold text-white">
                TRAVEL EXPENSES TOTAL
              </Text>
              <Text className="text-lg font-rubik-bold text-white">
                {peso(gasolineTotal + lodgingTotal)}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

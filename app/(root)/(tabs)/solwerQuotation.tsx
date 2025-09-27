// SolwerQuotation.tsx
import React, { useState, useEffect} from "react";
import { View, Text, TextInput, ScrollView, Alert, Platform, PermissionsAndroid, SafeAreaView, TouchableOpacity, Image } from "react-native";
// @ts-ignore
import RNHTMLtoPDF from "react-native-html-to-pdf";
import FileViewer from "react-native-file-viewer";
import { Client, Databases, Query } from "appwrite";
import icons from "@/constants/icons";
import { useGlobalContext } from '@/lib/global-provider';

export default function SolwerQuotation() {
  const [shippingFee, setShippingFee] = useState("0");
  const [railingsData, setRailingsData] = useState<any>(null);
  const {user} = useGlobalContext();


   const config = {
    platform: 'com.solwer.solwerquotation',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    collectionId: process.env.EXPO_PUBLIC_APPWRITE_ACCESORIES_COLLECTION_ID
}

  // ✅ Appwrite client setup
  const client = new Client()

  client
        .setEndpoint(config.endpoint!)
        .setProject(config.projectId!)
       

  const databases = new Databases(client);

  // ✅ Fetch railings & clamp data from Appwrite2
  useEffect(() => {
    const fetchRailings = async () => {
      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.collectionId!,
          // @ts-ignore
          [Query.equal("userId", user?.$id)]
        );

        console.log("📄 Appwrite documents loaded");

         if (res.documents.length > 0) {
      const sorted = res.documents.sort(
        (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );

      setRailingsData(sorted[0]);
    }
  } catch (err) {
    console.error("❌ Error fetching railings data:", err);
  }
    };
    fetchRailings();
  });

  // ✅ Build quotation only when data exists
  const quotationData = railingsData
    ? [
       {
      title: 'SOLAR MAIN COMPONENTS',
      items: [
        { qty: 1, unit: 'EA', description: 'Deye 51.2V 6.0KW Inverter Hybrid', price: 44000 },
        { qty: 14, unit: 'EA', description: 'Trina-Mono 600W Bifacial Solar Panels', price: 4300 },
        { qty: 1, unit: 'EA', description: 'LIFEPO4 Solar Homes 51.2V_230AH', price: 63000 },
      ],
    },
    {
      title: 'INVERTER SETUP',
      items: [
        { qty: 2, unit: 'EA', description: 'AC Grid & Load MCB 40A', price: 350 },
        { qty: 1, unit: 'EA', description: 'Main MCB 63A', price: 350 },
        { qty: 2, unit: 'EA', description: 'AC 2P SPD 385V', price: 500 },
        { qty: 1, unit: 'EA', description: 'Automatic Transfer Switch 2P 63A', price: 2000 },
        { qty: 1, unit: 'EA', description: 'Under-Over Voltage Protection', price: 400 },
      ],
    },
        {
          title: "SOLAR PANEL SETUP",
          items: [
            { qty: 40, unit: "MTS", description: "PV Cable 6mm2 PAIR", price: 100 },
            { qty: 2, unit: "EA", description: "DC PV MCB 32A", price: 450 },
            { qty: 2, unit: "EA", description: "DC 2P SPD 600V", price: 900 },
            {
              qty: railingsData.finalRailings,
              unit: "EA",
              description: "Railings 2.4m",
              price: 600,
            },
            {
              qty: railingsData.finalMidClamp,
              unit: "EA",
              description: "Mid Clamp",
              price: 50,
            },
            {
              qty: railingsData.finalEndClamp,
              unit: "EA",
              description: "End Clamp",
              price: 50,
            },
            {
              qty: railingsData.superfinaltFoot,
              unit: "EA",
              description: "L Foot",
              price: 80,
            },
            { qty: 2, unit: "EA", description: "MC4 Pair 30A", price: 60 },
            {
              qty: 30,
              unit: "EA",
              description: "HDPE Flexible Conduit Hose 3/4”",
              price: 50,
            },
          ],
        },
        {
      title: 'BATTERY SETUP',
      items: [
        { qty: 4, unit: 'MTS', description: 'Battery Cable 1m x 35mm2 Pair', price: 1200 },
        { qty: 1, unit: 'EA', description: 'DC Battery Combiner 225A', price: 4500 },
        { qty: 8, unit: 'EA', description: 'Battery Terminal Lug 35mm2', price: 35 },
      ],
    },
    {
      title: 'ACCESSORIES',
      items: [
        { qty: 1, unit: 'EA', description: 'Distribution box 40x30x20mm', price: 900 },
        { qty: 3, unit: 'EA', description: 'Cable Tray 50mm x 50mm x 2m', price: 400 },
        { qty: 10, unit: 'EA', description: 'Service Entrance Cable THW 8.0 mm2 ', price: 80 },
        { qty: 10, unit: 'EA', description: 'Home Load Cable THW 8.0 mm2  ', price: 80 },
        { qty: 3, unit: 'SET', description: 'Tox Screw (10pcs) ', price: 50 },
        { qty: 10, unit: 'MTS', description: 'Inverter-DT Cable THW 8.0 mm2 ', price: 80 },
        { qty: 10, unit: 'PCS', description: 'HDPE Flexible Conduit Hose 3/4”', price: 50 },
        { qty: 1, unit: 'EA', description: 'Sealant', price: 50 },
        { qty: 5, unit: 'SET', description: 'Cable Tie  ', price: 100 },
        { qty: 5, unit: 'PCS', description: 'Electrical Tape ', price: 50 },
      ],
    },
    {
      title: 'GROUNDING SYSTEM',
      items: [
        { qty: 10, unit: 'MTS', description: 'Grounding Cable THW 10.0mm2 x 20m (Green)', price: 100 },
        { qty: 2, unit: 'PCS', description: 'Grounding Bus Bar (10 way)', price: 200 },
        { qty: 6, unit: 'PCS', description: 'Grounding Lugs (6.0mm2) ', price: 45 },
        { qty: 6, unit: 'PCS', description: 'Solar Panel Grounding Lugs', price: 45 },
        { qty: 1, unit: 'PCS', description: 'Grounding rod 800mm x 16mm', price: 264 },
      ],
    },
    {
      title: 'OTHERS',
      items: [
        { qty: 1, unit: 'KG', description: '16mm Tywire', price: 20 },
        { qty: 5, unit: 'PCS', description: 'Rubber Tape', price: 50 },
        { qty: 6, unit: 'PCS', description: 'HDPE Flexible Hose Quickfit Connector 3/4"', price: 45 },
        { qty: 6, unit: 'PCS', description: 'Metal Clamp for Conduit 3/4”', price: 45 },
        { qty: 1, unit: 'PCS', description: 'Circuit Breaker Metal Din Rail 1/2 Meter', price: 49 },
        { qty: 4, unit: 'MTS', description: 'INSULATOR HOSE (PER METER) ALL SIZE', price: 88 },
      ],
    },
      ]
    : [];

 
  // ✅ Helpers
  const computeTotal = (items: any[]) => items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const overall = quotationData.reduce((sum, s) => sum + computeTotal(s.items), 0);
  const shipping = parseFloat(shippingFee) || 0;
  const grandTotal = overall + shipping;

  const with125 = grandTotal * 1.25;
  const with130 = grandTotal * 1.3;
  const with135 = grandTotal * 1.35;
  const with140 = grandTotal * 1.4;

  // ✅ Generate PDF
  const handleGeneratePDF = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Cannot generate PDF without storage permission.");
          return;
        }
      }

      const htmlContent = `
        <html>
          <body>
            <h1>Solwer Quotation</h1>
            ${quotationData
              .map(
                (section) => `
                <h2>${section.title}</h2>
                ${section.items
                  .map(
                    (item) => `
                      <p>
                        ${item.qty} pcs - ${item.description} @ ₱${item.price.toLocaleString()} \n
                        Total: ₱${(item.qty * item.price).toLocaleString()}
                      </p>
                    `
                  )
                  .join("")}
                <p><b>Subtotal: ₱${computeTotal(section.items).toLocaleString()}</b></p>
              `
              )
              .join("")}
            <h2>Grand Total: ₱${grandTotal.toLocaleString()}</h2>
          </body>
        </html>
      `;

      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: "solwer_quotation",
        directory: "Download",
      });

      await FileViewer.open(file.filePath);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  return (
    <SafeAreaView className="h-full bg-white-100">
    <ScrollView   showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }} className="mt-20">
      <Text className="text-2xl font-rubik-bold text-center mb-5">
        6.0 KW HYBRID (FULL) SOLWER QUOTATION
      </Text>

      {quotationData.map((section, i) => (
        <View key={i} className="mb-5">
          <Text className="text-lg font-rubik-semibold mb-2">{section.title}</Text>
          {section.items.map((item, idx) => (
  <Text key={idx} className="text-sm mb-1 font-rubik">
    {item.qty} pcs • {item.description} — ₱{item.price.toLocaleString()}
    <Text className="font-rubik-bold text-lg">
    {"\n"}Total: ₱{(item.qty * item.price).toLocaleString()}
    </Text>
  </Text>
))}
          <Text className="font-rubik-bold mt-2 text-2xl">
            Subtotal: ₱{computeTotal(section.items).toLocaleString()}
          </Text>
        </View>
      ))}

      <View className="flex-row items-center mb-3">
        <Text className="w-32 text-base font-medium">Shipping Fee:</Text>
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter Shipping Fee"
          keyboardType="numeric"
          value={shippingFee}
          onChangeText={setShippingFee}
        />
      </View>

      <Text className="text-xl font-bold text-right mb-2">
        TOTAL + SHIPPING: ₱{grandTotal.toLocaleString()}
      </Text>

      <Text className="text-lg font-bold mt-3">INSTALLATION PACKAGE (1 PAX)</Text>
      <Text>125%: ₱{with125.toLocaleString()}</Text>
      <Text>130%: ₱{with130.toLocaleString()}</Text>
      <Text>135%: ₱{with135.toLocaleString()}</Text>
      <Text>140%: ₱{with140.toLocaleString()}</Text>

      <View className="mt-5">
          <TouchableOpacity onPress={handleGeneratePDF} className='bg-white shadow-md shadow-zinc-400 rounded-full py-4 mt-5'>
          
          
                          <View className='flex flex-row items-center justify-center'>
                          <Image source={icons.document} 
                                  className='w-5 h-5 ' 
                                  resizeMode='contain'/>
          
                          <Text className='text-lg font-rubik-medium text-black-300 ml-2'>Generate PDF Quotation</Text>
          
                          </View>
                    </TouchableOpacity>
        
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}


// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import FileViewer from 'react-native-file-viewer';

import { View, Text, StyleSheet, TextInput, ScrollView, Button, Alert, Platform, PermissionsAndroid } from 'react-native';
import React, { useState } from 'react';
import SolarQuotationForm from './railingsCalculator';


export default function SolwerQuotation() {
  const [shippingFee, setShippingFee] = useState<string>('0');
  const [accessoryData, setAccessoryData] = useState({
    finalRailings: 0,
    finalMidClamp: 0,
    finalEndClamp: 0,
    superfinaltFoot: 0,
    finalMc4: 0,
    mc4Y: 0,
  });
const handleGeneratePDF = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot generate PDF without storage permission.');
        return;
      }
    }

     const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #222; }
          h2 { color: #333; margin-top: 20px; }
          p, div { margin: 4px 0; }
          .section { margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
          .item { margin-left: 16px; }
          .total, .grand-total { font-weight: bold; margin-top: 12px; }
        </style>
      </head>
      <body>
        <h1>Solwer Quotation Summary</h1>
        ${quotationData
          .map(
            (section) => `
              <div class="section">
                <h2>${section.title}</h2>
                ${section.items
                  .map(
                    (item) => `
                      <div class="item">
                        ${item.qty} pcs<br />
                        Unit: ${item.unit}<br />
                        Description: ${item.description}<br />
                        Unli Solar: ₱${item.price.toLocaleString()}<br />
                        Total Price: ₱${(item.qty * item.price).toLocaleString()}
                      </div>
                    `
                  )
                  .join("")}
                <div class="total">TOTAL: ₱${computeTotal(section.items).toLocaleString()}</div>
              </div>
            `
          )
          .join("")}

        <div class="total">SHIPPING FEE: ₱${Number(shippingFee || 0).toLocaleString()}</div>
        <div class="grand-total">TOTAL MATERIAL COST + SHIPPING: ₱${grandTotal.toLocaleString()}</div>

        <div class="grand-total">INSTALLATION PACKAGE (1 PAX):</div>
        <div class="grand-total">125%: ₱${with125.toLocaleString()}</div>
        <div class="grand-total">130%: ₱${with130.toLocaleString()}</div>
        <div class="grand-total">135%: ₱${with135.toLocaleString()}</div>
        <div class="grand-total">140%: ₱${with140.toLocaleString()}</div>
      </body>
    </html>
    `;

    const options = {
      html: htmlContent,
      fileName: 'solwer_quotation',
      directory: 'Download',
    };

    const file = await RNHTMLtoPDF.convert(options);

    // Auto-open
    await FileViewer.open(file.filePath);

 

  } catch (error) {
    Alert.alert('Error', 'Failed to generate or open PDF.');
    console.error(error);
  }
};



  const quotationData = [
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
      title: 'SOLAR PANEL SETUP',
      items: [
        { qty: 40, unit: 'MTS', description: 'PV Cable 6mm2 PAIR', price: 100 },
        { qty: 2, unit: 'EA', description: 'DC PV MCB 32A', price: 450 },
        { qty: 2, unit: 'EA', description: 'DC 2P SPD 600V', price: 900 },
        { qty: accessoryData.finalRailings, unit: 'EA', description: 'Railings 2.4m', price: 600 },
        { qty: accessoryData.finalMidClamp, unit: 'EA', description: 'Mid Clamp', price: 50 },
        { qty: accessoryData.finalEndClamp, unit: 'EA', description: 'End Clamp', price: 50 },
        { qty: accessoryData.superfinaltFoot, unit: 'EA', description: 'L Foot', price: 80 },
        { qty: accessoryData.finalMc4, unit: 'EA', description: 'MC4 Pair 30A', price: 60 },
        { qty: 30, unit: 'EA', description: 'HDPE Flexible Conduit Hose 3/4”', price: 50 },
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
  ];

  const computeTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  const computeOverallTotal = (): number => {
    return quotationData.reduce(
      (total, section) => total + computeTotal(section.items),
      0
    );
  };

  const overall = computeOverallTotal();
  const shipping = parseFloat(shippingFee) || 0;
  const grandTotal = overall + shipping;

  const with125 = grandTotal * 1.25;
  const with130 = grandTotal * 1.30;
  const with135 = grandTotal * 1.35;
  const with140 = grandTotal * 1.40;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SolarQuotationForm onComputeResult={setAccessoryData} />

      <Text style={styles.title}>6.0 KW HYBRID (FULL) SOLWER QUOTATION</Text>

      {quotationData.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, idx) => (
            <Text key={idx} style={styles.itemText}>
              {item.qty}pcs {"\n"}Unit: {item.unit} {"\n"} Description: {item.description}{"\n"} Unli Solar: ₱{item.price.toLocaleString()} {"\n"} Total Price: ₱{(item.qty * item.price).toLocaleString()}
            </Text>
          ))}
          <Text style={styles.totalText}>TOTAL: ₱{computeTotal(section.items).toLocaleString()}</Text>
        </View>
      ))}

      <Text style={styles.overallTotal}>
        OVERALL TOTAL: ₱{overall.toLocaleString()}
      </Text>

      <View style={styles.inlineGroup}>
        <Text style={styles.label}>SHIPPING FEE:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter Shipping Fee"
          keyboardType="numeric"
          value={shippingFee}
          onChangeText={setShippingFee}
        />
      </View>

      <Text style={styles.overallTotal}>
        TOTAL MATERIAL COST + SHIPPING: ₱{grandTotal.toLocaleString()}
      </Text>
      <Text style={styles.overallTotal}>INSTALLATION PACKAGE (1 PAX):</Text>
      <Text style={styles.overallTotal}>125%: ₱{with125.toLocaleString()}</Text>
      <Text style={styles.overallTotal}>130%: ₱{with130.toLocaleString()}</Text>
      <Text style={styles.overallTotal}>135%: ₱{with135.toLocaleString()}</Text>
      <Text style={styles.overallTotal}>140%: ₱{with140.toLocaleString()}</Text>
   <Button title="Generate PDF" onPress={handleGeneratePDF} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalText: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  overallTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 10,
  },
  inlineGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    width: 130,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});

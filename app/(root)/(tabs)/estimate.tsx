import icons from '@/constants/icons';
import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

// Dummy appliances list
const APPLIANCES = [
  { name: "LED Lights", watts: 9 },
  { name: "Flourescent Lights", watts: 40 },
  { name: "Ceiling Fan", watts: 75 },
  { name: "Air Conditioner 1HP", watts: 746 },
  { name: "Air Conditioner 1.5HP", watts: 1119 },
  { name: "Refrigerator", watts: 150 },
  { name: "Washing Machine", watts: 500 },
  { name: "TV 32in", watts: 60 },
  { name: "TV 55in", watts: 150 },
  { name: "Rice Cooker", watts: 700 },
  { name: "Microwave", watts: 1000 },
  { name: "Desktop PC", watts: 300 },
];

const Explore = () => {
  const [bill, setBill] = useState("");
  const [rPKwH, setrPKwH] = useState("");
  const [applianceList, setApplianceList] = useState<any[]>([]);
  const [selectedAppliance, setSelectedAppliance] = useState("");
  const [results, setResults] = useState<any | null>(null); // store results

  const handleAddAppliance = (appliance: any) => {
    setApplianceList([
      ...applianceList,
      { ...appliance, quantity: 1, hours: 1 },
    ]);
  };

  const updateAppliance = (index: number, field: string, value: string) => {
    const updated = [...applianceList];
    updated[index][field] = parseInt(value) || 0;
    setApplianceList(updated);
  };

  const deleteAppliance = (index: number) => {
    const updated = applianceList.filter((_, i) => i !== index);
    setApplianceList(updated);
  };

  const calculateDailyConsumption = (watts: number, qty: number, hrs: number) =>
    (watts * qty * hrs) / 1000;

 const handleCalculate = () => {
  const monthlyBill = parseFloat(bill) || 0;
  const rate = parseFloat(rPKwH) || 0;

  // Monthly consumption (from bill)
  const monthlyKwh = rate > 0 ? monthlyBill / rate : 0;
  const dailyKwhFromBill = monthlyKwh / 30;

  // Daily consumption (from appliances)
  let totalKwhFromAppliances = 0;
  applianceList.forEach((item) => {
    totalKwhFromAppliances += calculateDailyConsumption(item.watts, item.quantity, item.hours);
  });

  // Use whichever is bigger (or you can pick only bill/appliances)
  const totalKwh = Math.max(dailyKwhFromBill, totalKwhFromAppliances);

  // Annual kWh
  const annualKwh = totalKwh * 365;

  const halfSystem = {
    cost: Number((totalKwh * 18850).toFixed(0)).toLocaleString(),
    savings: Number((annualKwh * rate * 0.5).toFixed(0)).toLocaleString(),
    panels: Math.max(1, Math.ceil(totalKwh / 1.4)), // 1 panel ≈ 1.4 kWh/day
    // inverter: `${(totalKwh / 2).toFixed(1)}kW Hybrid Inverter`,
  };

  const fullSystem = {
    cost: Number((totalKwh * 24750).toFixed(0)).toLocaleString(),
    savings: Number((annualKwh * rate).toFixed(0)).toLocaleString(),
    panels: Math.max(1, Math.ceil(totalKwh / 1.4)),
    inverter: `${(totalKwh).toFixed(1)}kW Hybrid Inverter`,
  };

  setResults({
    totalKwh: totalKwh.toFixed(2),
    halfSystem,
    fullSystem,
  });




  };

  return (
    <SafeAreaView className="h-full bg-gray-200">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
      >
        <View className="flex items-center justify-center">
          {/* Header */}
          <View className="bg-blue-400 rounded-2xl p-6 mt-5">
            <Image source={icons.sun} className="size-10" />
          </View>
          <Text className="text-xl font-rubik-bold mt-5">
            Calculate Your Solar Savings
          </Text>
          <Text className="text-xs font-rubik mt-5">
            Get instant estimates for your solar setup
          </Text>

          {/* Main Card */}
          <View className="bg-white mt-10 p-6 rounded-2xl w-full">
            {/* Monthly Bill Input */}
            <Text className="text-xl font-rubik-bold">Monthly Electricity Bill (₱)</Text>
            <TextInput
              value={bill}
              onChangeText={setBill}
              keyboardType="numeric"
              placeholder="Enter amount"
              className="border border-gray-400 py-4 px-3 rounded-2xl mt-3"
            />
              <Text className="text-xl font-rubik-bold mt-5">Power Rate Per Kwh (₱)</Text>
            <TextInput
              value={rPKwH}
              onChangeText={setrPKwH}
              keyboardType="numeric"
              placeholder="Enter amount"
              className="border border-gray-400 py-4 px-3 rounded-2xl mt-3"
            />

            {/* Appliances Dropdown */}
            <Text className="text-lg font-rubik-bold mt-5">Select Your Main Appliances</Text>
            <View className="border rounded-2xl mt-2">
              <Picker
                selectedValue={selectedAppliance}
                onValueChange={(value) => {
                  setSelectedAppliance(value);
                  const appliance = APPLIANCES.find(a => a.name === value);
                  if (appliance) handleAddAppliance(appliance);
                }}
              >
                <Picker.Item label="+ Add Appliances" value="" />
                {APPLIANCES.map((item, idx) => (
                  <Picker.Item
                    key={idx}
                    label={`${item.name} (${item.watts}W)`}
                    value={item.name}
                  />
                ))}
              </Picker>
            </View>

            {/* Dynamic Appliances */}
            {applianceList.map((item, index) => (
              <View key={index} className="mt-4 p-5 rounded-lg bg-gray-50">
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold">
                    {item.name} ({item.watts}W)
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteAppliance(index)}
                    className="bg-red-500 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-white text-sm">Remove</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-xs font-rubik-semibold mt-4">Quantity</Text>
                <TextInput
                  keyboardType="numeric"
                  value={item.quantity.toString()}
                  onChangeText={(val) => updateAppliance(index, "quantity", val)}
                  className="border p-2 rounded-lg mt-2"
                />

                <Text className="text-xs font-rubik-semibold mt-4">Hours/Day</Text>
                <TextInput
                  keyboardType="numeric"
                  value={item.hours.toString()}
                  onChangeText={(val) => updateAppliance(index, "hours", val)}
                  className="border p-2 rounded-lg mt-2"
                />

                <Text className="mt-2 text-sm text-gray-600">
                  Daily Consumption:{" "}
                  {calculateDailyConsumption(item.watts, item.quantity, item.hours).toFixed(2)} kWh
                </Text>
              </View>
            ))}

            {/* Calculate Button */}
            <TouchableOpacity
              onPress={handleCalculate}
              className="bg-blue-500 p-4 rounded-xl mt-6"
            >
              <Text className="text-center text-white font-bold">
                Calculate Solar Estimate
              </Text>
            </TouchableOpacity>

           
          </View>
        </View>
         {/* Results Section */}
            {results && (
              <View className="flex flex-col mt-2 p-6 px-2 rounded-2xl">
               <View className="border-blue-200 border-2 mt-2 p-4 bg-blue-100 rounded-2xl">
                <View className="flex-row items-center">
                  {/* Icon */}
                  <View className="bg-blue-500 rounded-xl p-2 mr-3">
                    <Image source={icons.light} className="size-10" />
                  </View>

                  {/* Texts */}
                  <View>
                    <Text className="font-rubik-bold text-base mb-1">
                      Total Daily Consumption:
                    </Text>
                    <Text className="font-rubik-semibold text-base">
                      {results.totalKwh} kWh/day
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="font-rubik-bold mt-5 text-center text-xl">Your Solar Options</Text>

                <View className="mt-5 p-5 bg-blue-50 rounded-2xl border-l-4 border-orange-400">
                  <View className='flex-row justify-between'>
                    <Text className="font-rubik-bold mt-3">Half Capacity System</Text>
                     <View className="bg-orange-100 rounded-xl px-3 py-1 items-center justify-center">
                        <Text className="font-rubik-medium text-orange-700 text-center">
                          Recommended
                        </Text>
                      </View>
                    </View>
                    <View className='flex-row justify-between'>
                            <View className='flex-col justify-between mt-5'>
                                <Text className='font-rubik text-base'>System Cost</Text>
                                <Text className='font-rubik-bold text-2xl'> ₱{results.halfSystem.cost}</Text>
                          </View>
                          <View className='flex-col justify-between mt-5 mr-12'>
                                <Text className='font-rubik'>Annual Savings</Text>
                                <Text className='font-rubik-bold text-2xl text-green-600'> ₱{results.halfSystem.savings}</Text>
                          </View>
                    </View>
                    <View className='flex-row justify-between'>
                              <View className='flex-col justify-between mt-5'>
                                 <Text>Solar Panels</Text>
                                 <Text className='font-rubik-bold'>{results.halfSystem.panels} panels</Text>
                              </View>
                              <View className='flex-col justify-between mt-5'>
                                <Text className='font-rubik ml-5'>Inverter:</Text>
                                <Text className='font-rubik-bold'> {results.halfSystem.inverter}</Text>
                              </View>
                    </View>
                </View>
                  <View className="mt-5 p-5 bg-blue-50 rounded-2xl border-l-4 border-green-400">
                  <View className='flex-row justify-between'>
                    <Text className="font-rubik-bold mt-3">Full Capacity System</Text>
                     <View className="bg-green-100 rounded-xl px-3 py-1 items-center justify-center">
                        <Text className="font-rubik-medium text-green-700 text-center">
                          Maximum Savings
                        </Text>
                      </View>
                    </View>
                    <View className='flex-row justify-between'>
                            <View className='flex-col justify-between mt-5'>
                                <Text className='font-rubik text-base'>System Cost</Text>
                                <Text className='font-rubik-bold text-2xl'> ₱{results.fullSystem.cost}</Text>
                          </View>
                          <View className='flex-col justify-between mt-5 mr-12'>
                                <Text className='font-rubik'>Annual Savings</Text>
                                <Text className='font-rubik-bold text-2xl text-green-600'> ₱{results.fullSystem.savings}</Text>
                          </View>
                    </View>
                    <View className='flex-row justify-between'>
                              <View className='flex-col justify-between mt-5'>
                                 <Text>Solar Panels</Text>
                                 <Text className='font-rubik-bold'>{results.fullSystem.panels} panels</Text>
                              </View>
                              <View className='flex-col justify-between mt-5'>
                                <Text className='font-rubik ml-5'>Inverter:</Text>
                                <Text className='font-rubik-bold'> {results.fullSystem.inverter}</Text>
                              </View>
                    </View>
                </View>
              </View>
            )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;

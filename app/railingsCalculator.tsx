import { useGlobalContext } from '@/lib/global-provider';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Client, Databases, ID } from "react-native-appwrite";

export const config = {
    platform: 'com.solwer.solwerquotation',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    collectionId: process.env.EXPO_PUBLIC_APPWRITE_ACCESORIES_COLLECTION_ID
}
export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform)
    


const databases = new Databases(client);

// @ts-ignore
export default function RailingsCalculator({ onComputeResult }: { onComputeResult?: (result: any) => void }) {
  const {user} = useGlobalContext();
  const [watts, setWatts] = useState('630');
  const [voc, setVoc] = useState('50.3');
  const [isc, setIsc] = useState('15.94');
  const [vmp, setVmp] = useState('42');
  const [imp, setImp] = useState('14.94');

  const [panelLength, setLength] = useState('2382');
  const [panelWidth, setWidth] = useState('1134');
  const [railLength, setRailLength] = useState('2.4');
  const [noOfPanels, setNoOfPanels] = useState('');
  const [panelsPerGroup, setPanelsPerGroup] = useState('');
  const [railingLengthPerGroup, setRailingLengthPerGroup] = useState('');
  const [numberOfRailingPerLength, setNumberOfRailingPerLength] = useState('');
  const [comparison, setComparison] = useState('');
  const [comparisonStatus, setComparisonStatus] = useState('');
  const [numberOfGroups, setNumberOfGroups] = useState('');
  const [result, setResult] = useState('');
  const [calculationResults, setCalculationResults] = useState<any>(null);

  // ✅ Make this async
  const compute = async () => {
    const panels = parseInt(noOfPanels) || 0;
    const group = parseInt(panelsPerGroup) || 0;
    const rail = parseFloat(railLength) || 0;
    const length = parseFloat(panelLength) || 0;
    const width = parseFloat(panelWidth) || 0;
    const numberRailing = parseFloat(numberOfRailingPerLength) || 0;
    const numberGroups = parseFloat(numberOfGroups) || 0;

    if (
  panels === 0 ||
  group === 0 ||
  rail === 0 ||
  length === 0 ||
  width === 0 ||
  numberRailing === 0 ||
  numberGroups === 0
) {
  setCalculationResults(null);
  setResult("Please fill all required fields properly.");
  return;
}

    const noOfGroups = Math.ceil(panels / group);
    const railingNeededPerGroup = ((length / 1000) * group) / 2;
    const railingsPerGroup = Math.ceil(railingNeededPerGroup / rail);
    const totalRailings = noOfGroups * railingsPerGroup;

    const midClamp = panels - noOfGroups;
    const endClamp = noOfGroups * 2;
    const tFoot = totalRailings * 3;
    const mc4 = 2;
    const mc4Y = Math.ceil(noOfGroups / 2);

    const railingLengthPerGroupValue = (group * width) / 1000;
    setRailingLengthPerGroup(railingLengthPerGroupValue.toFixed(3));

    const comparisonResult = numberRailing * rail;
    setComparison(comparisonResult.toFixed(1));

    const comparisonStatusVal = (comparisonResult >= railingLengthPerGroupValue) ? 'OK!' : 'NOT OK!';
    setComparisonStatus(comparisonStatusVal);

    const finalRailings = totalRailings * numberGroups;
    const finalMidClamp = midClamp * numberGroups;
    const finalEndClamp = endClamp * numberGroups;
    const finaltFoot = tFoot * numberGroups;
    const superfinaltFoot = finaltFoot + tFoot;
    const finalMc4 = mc4 + numberGroups - 1;

    const resultData = {
      totalRailings,
      midClamp,
      endClamp,
      tFoot,
      mc4,
      mc4Y,
      finalRailings,
      finalMidClamp,
      finalEndClamp,
      finaltFoot,
      finalMc4,
      superfinaltFoot
    };

    const resultString = `
Standard Data in 1 Group (Constant)
Railings: ${totalRailings}
Mid Clamp: ${midClamp} pcs
End Clamp: ${endClamp} pcs
T Foot: ${tFoot} pcs
MC4: ${mc4} pair
MC4-Y (No. of parallel): ${mc4Y} pair

Accessories Needed:
Railings: ${finalRailings} pcs.
Mid Clamp: ${finalMidClamp} pcs
End Clamp: ${finalEndClamp} pcs
T foot: ${finaltFoot} pcs
MC4: ${finalMc4} pair
MC4-Y: ${mc4Y} pair
    `;
    // Save calculation results for displaying in the UI
setCalculationResults(resultData);

// Mark calculation as successful
setResult("completed");

// Send results to parent component
if (onComputeResult) {
  onComputeResult(resultData);
}
    // ✅ Save to Appwrite
   
    try {
      await databases.createDocument(
              config.databaseId!,
              config.collectionId!,
              ID.unique(),
              {
                userId: user?.$id,
                finalRailings,
                finalMidClamp,
                finalEndClamp,
                superfinaltFoot,
              
              },
           
            );
      console.log("✅ Data saved to Appwrite");
    } catch (error) {
        
      console.error("❌ Error saving to Appwrite:", error);
    }
  };


  
return (
  <ScrollView
    className="flex-1 bg-gray-50"
    contentContainerClassName="p-5 pb-12"
    showsVerticalScrollIndicator={false}
  >
    {/* Header */}
    <View className="bg-green-700 rounded-2xl p-5 mb-6 shadow-md">
      <Text className="text-white text-2xl font-bold">
        SOLWER
      </Text>
      <Text className="text-green-100 text-sm mt-1">
        Solar Energy Solutions
      </Text>
      <View className="border-t border-green-500 mt-4 pt-4">
        <Text className="text-white text-xl font-bold">
          Railings Calculator
        </Text>
        <Text className="text-green-100 text-sm mt-1">
          Calculate the required solar panel mounting accessories.
        </Text>
      </View>
    </View>

    {/* Panel Specifications */}
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900">
        Panel Specifications
      </Text>
      <Text className="text-xs text-gray-400 mb-4">
        Enter your solar panel electrical specifications.
      </Text>

      {[
        { label: "Watts", value: watts, setter: setWatts, unit: "W", placeholder: "Enter watts" },
        { label: "Voc", value: voc, setter: setVoc, unit: "V", placeholder: "Enter voltage" },
        { label: "Isc", value: isc, setter: setIsc, unit: "A", placeholder: "Enter current" },
        { label: "Vmp", value: vmp, setter: setVmp, unit: "V", placeholder: "Enter voltage" },
        { label: "Imp", value: imp, setter: setImp, unit: "A", placeholder: "Enter current" },
      ].map((item) => (
        <View key={item.label} className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            {item.label}
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
            <TextInput
              className="flex-1 py-3 text-gray-900 text-base"
              placeholder={item.placeholder}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={item.value}
              onChangeText={item.setter}
            />
            <Text className="text-green-700 font-bold">{item.unit}</Text>
          </View>
        </View>
      ))}
    </View>

    {/* Panel Dimensions */}
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900">
        Panel Dimensions
      </Text>
      <Text className="text-xs text-gray-400 mb-4">
        Specify the length and width of your solar panel.
      </Text>

      {[
        { label: "Panel Length", value: panelLength, setter: setLength },
        { label: "Panel Width", value: panelWidth, setter: setWidth },
      ].map((item) => (
        <View key={item.label} className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            {item.label}
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
            <TextInput
              className="flex-1 py-3 text-gray-900 text-base"
              placeholder="Enter measurement"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={item.value}
              onChangeText={item.setter}
            />
            <Text className="text-green-700 font-bold">mm</Text>
          </View>
        </View>
      ))}
    </View>

    {/* Installation Inputs */}
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900">
        Installation Details
      </Text>
      <Text className="text-xs text-gray-400 mb-4">
        Enter the number of panels and installation configuration.
      </Text>

      {[
        { label: "No. of Solar Panels", value: noOfPanels, setter: setNoOfPanels, unit: "pcs" },
        { label: "Panels per Group", value: panelsPerGroup, setter: setPanelsPerGroup, unit: "pcs" },
        { label: "Length of Railings", value: railLength, setter: setRailLength, unit: "m" },
      ].map((item) => (
        <View key={item.label} className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            {item.label}
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
            <TextInput
              className="flex-1 py-3 text-gray-900 text-base"
              placeholder="Enter value"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={item.value}
              onChangeText={item.setter}
            />
            <Text className="text-green-700 font-bold">{item.unit}</Text>
          </View>
        </View>
      ))}

      {/* Railing Length Result */}
      <View className="bg-green-50 border border-green-100 rounded-xl p-4 mt-2">
        <Text className="text-xs text-green-700 font-semibold">
          RAILING LENGTH PER GROUP
        </Text>
        <Text className="text-2xl font-bold text-green-800 mt-1">
          {railingLengthPerGroup !== ""
            ? `${railingLengthPerGroup} m`
            : "---"}
        </Text>
        <Text className="text-xs text-gray-500 mt-2">
          Note: Choose a railing length greater than this value.
        </Text>
      </View>
    </View>

    {/* Railing Calculation */}
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900">
        Railing Calculation
      </Text>
      <Text className="text-xs text-gray-400 mb-4">
        Enter the number of railings per selected length.
      </Text>

      <Text className="text-sm font-semibold text-gray-700 mb-2">
        No. of Railings per Length
      </Text>
      <View className="border border-gray-200 rounded-xl bg-gray-50 px-3">
        <TextInput
          className="py-3 text-gray-900 text-base"
          placeholder="Enter number of railings"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={numberOfRailingPerLength}
          onChangeText={setNumberOfRailingPerLength}
        />
      </View>

      <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
        <Text className="text-xs font-semibold text-gray-500">
          COMPARISON RESULT
        </Text>
        <Text className="text-base font-bold text-gray-900 mt-1">
          {comparison !== ""
            ? `${comparison} m - ${comparisonStatus}`
            : "---"}
        </Text>
      </View>

      <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">
        Number of Groups
      </Text>
      <View className="border border-gray-200 rounded-xl bg-gray-50 px-3">
        <TextInput
          className="py-3 text-gray-900 text-base"
          placeholder="Enter number of groups"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={numberOfGroups}
          onChangeText={setNumberOfGroups}
        />
      </View>
    </View>

    {/* Compute Button */}
    <TouchableOpacity
      onPress={compute}
      activeOpacity={0.85}
      className="bg-green-700 rounded-xl py-4 mt-2 mb-5 shadow-md"
    >
      <Text className="text-center text-white font-bold text-base">
        COMPUTE PANEL ACCESSORIES
      </Text>
    </TouchableOpacity>


    


{/* Calculation Results */}
{result !== "" && result !== "completed" && (
  <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
    <View className="flex-row items-center">
      <Text className="text-red-600 text-lg mr-2">⚠</Text>
      <Text className="text-red-700 font-semibold flex-1">
        {result}
      </Text>
    </View>
  </View>
)}

{calculationResults && (
  <View className="mb-8">

    {/* Results Header */}
    <View className="bg-green-800 rounded-3xl p-5 mb-5">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-green-200 text-xs font-bold tracking-widest">
            SOLWER • CALCULATION SUMMARY
          </Text>
          <Text className="text-white text-2xl font-extrabold mt-2">
            Accessories
          </Text>
          <Text className="text-green-100 text-sm mt-1">
            Your solar installation requirements
          </Text>
        </View>

        <View className="bg-white/15 rounded-2xl w-12 h-12 items-center justify-center">
          <Text className="text-2xl">☀</Text>
        </View>
      </View>

      <View className="h-px bg-green-600 my-5" />

      <View className="flex-row justify-between">
        <View>
          <Text className="text-green-200 text-xs">Total Railings</Text>
          <Text className="text-white text-3xl font-extrabold mt-1">
            {calculationResults.finalRailings}
          </Text>
          <Text className="text-green-200 text-xs">pieces</Text>
        </View>

        <View className="items-end">
          <Text className="text-green-200 text-xs">Total T Foot</Text>
          <Text className="text-white text-3xl font-extrabold mt-1">
            {calculationResults.superfinaltFoot}
          </Text>
          <Text className="text-green-200 text-xs">pieces</Text>
        </View>
      </View>
    </View>

    {/* Standard Data */}
    <View className="bg-white rounded-3xl border border-gray-200 p-5 mb-4">

      <View className="flex-row items-center mb-4">
        <View className="bg-green-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
          <Text className="text-green-800 text-lg">▤</Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-extrabold text-lg">
            Standard Data
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            Required quantity in one group
          </Text>
        </View>

        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
          <Text className="text-gray-600 text-xs font-bold">
            PER GROUP
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {[
          { label: "Railings", value: calculationResults.totalRailings, unit: "pcs" },
          { label: "Mid Clamp", value: calculationResults.midClamp, unit: "pcs" },
          { label: "End Clamp", value: calculationResults.endClamp, unit: "pcs" },
          { label: "T Foot", value: calculationResults.tFoot, unit: "pcs" },
          { label: "MC4", value: calculationResults.mc4, unit: "pair" },
          { label: "MC4-Y", value: calculationResults.mc4Y, unit: "pair" },
        ].map((item) => (
          <View
            key={item.label}
            className="w-[48%] bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-3"
          >
            <Text className="text-gray-500 text-xs font-medium">
              {item.label}
            </Text>

            <View className="flex-row items-baseline mt-2">
              <Text className="text-gray-900 text-2xl font-extrabold">
                {item.value}
              </Text>
              <Text className="text-gray-500 text-xs font-medium ml-1">
                {item.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Final Accessories */}
    <View className="bg-white rounded-3xl border border-green-200 p-5">

      <View className="flex-row items-center mb-4">
        <View className="bg-green-700 w-10 h-10 rounded-xl items-center justify-center mr-3">
          <Text className="text-white text-lg">✓</Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-extrabold text-lg">
            Accessories Needed
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            Final calculated quantities
          </Text>
        </View>

        <View className="bg-green-100 px-3 py-1.5 rounded-full">
          <Text className="text-green-800 text-xs font-bold">
            FINAL
          </Text>
        </View>
      </View>

      {[
        { label: "Railings", value: calculationResults.finalRailings, unit: "pcs" },
        { label: "Mid Clamp", value: calculationResults.finalMidClamp, unit: "pcs" },
        { label: "End Clamp", value: calculationResults.finalEndClamp, unit: "pcs" },
        { label: "T Foot", value: calculationResults.finaltFoot, unit: "pcs" },
        { label: "MC4", value: calculationResults.finalMc4, unit: "pair" },
        { label: "MC4-Y", value: calculationResults.mc4Y, unit: "pair" },
      ].map((item, index) => (
        <View
          key={item.label}
          className={`flex-row justify-between items-center py-4 ${
            index !== 5 ? "border-b border-gray-100" : ""
          }`}
        >
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-600 mr-3" />
            <Text className="text-gray-700 font-semibold">
              {item.label}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-green-800 text-xl font-extrabold">
              {item.value}
            </Text>
            <Text className="text-gray-500 text-xs font-medium ml-2">
              {item.unit}
            </Text>
          </View>
        </View>
      ))}

      {/* Total T Foot Note */}
      <View className="bg-green-50 rounded-2xl p-4 mt-4">
        <Text className="text-green-800 text-xs font-bold">
          TOTAL T FOOT REQUIREMENT
        </Text>
        <View className="flex-row items-baseline mt-1">
          <Text className="text-green-900 text-3xl font-extrabold">
            {calculationResults.superfinaltFoot}
          </Text>
          <Text className="text-green-700 text-sm font-semibold ml-2">
            pcs
          </Text>
        </View>
        <Text className="text-green-700 text-xs mt-1">
          Includes the additional T Foot quantity
        </Text>
      </View>
    </View>

  </View>
)}


  </ScrollView>
);

}

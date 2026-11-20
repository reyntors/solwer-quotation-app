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
  const [watts, setWatts] = useState('');
  const [voc, setVoc] = useState('');
  const [isc, setIsc] = useState('');
  const [vmp, setVmp] = useState('');
  const [imp, setImp] = useState('');

  const [panelLength, setLength] = useState('');
  const [panelWidth, setWidth] = useState('');
  const [railLength, setRailLength] = useState('');
  const [noOfPanels, setNoOfPanels] = useState('');
  const [panelsPerGroup, setPanelsPerGroup] = useState('');
  const [railingLengthPerGroup, setRailingLengthPerGroup] = useState('');
  const [numberOfRailingPerLength, setNumberOfRailingPerLength] = useState('');
  const [comparison, setComparison] = useState('');
  const [comparisonStatus, setComparisonStatus] = useState('');
  const [numberOfGroups, setNumberOfGroups] = useState('');
  const [result, setResult] = useState('');

  // ✅ Make this async
  const compute = async () => {
    const panels = parseInt(noOfPanels) || 0;
    const group = parseInt(panelsPerGroup) || 0;
    const rail = parseFloat(railLength) || 0;
    const length = parseFloat(panelLength) || 0;
    const width = parseFloat(panelWidth) || 0;
    const numberRailing = parseFloat(numberOfRailingPerLength) || 0;
    const numberGroups = parseFloat(numberOfGroups) || 0;

    if (panels === 0 || group === 0 || rail === 0 || length === 0 || width === 0 || numberRailing === 0 || numberGroups === 0) {
      setResult('Please fill all required fields properly.');
      return;
    }

    const noOfGroups = Math.ceil(panels / group);
    const railingNeededPerGroup = ((length / 1000) * group) / 2;
    const railingsPerGroup = Math.ceil(railingNeededPerGroup / rail);
    const totalRailings = noOfGroups * railingsPerGroup;

    const midClamp = panels - noOfGroups;
    const endClamp = noOfGroups * 2;
    const tFoot = totalRailings * 2;
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
    setResult(resultString);

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
    <ScrollView contentContainerClassName="p-5 flex-grow">
      <Text className="text-xl font-bold mb-4 text-center">Railings Calculator</Text>

      <Text className="font-bold mt-5 mb-2">Panels Specs (Input):</Text>

      {/* Watts */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Watts:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="W"
          keyboardType="numeric"
          value={watts}
          onChangeText={setWatts}
        />
        <Text className="w-8 text-base">W</Text>
      </View>

      {/* Voc */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Voc:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="V"
          keyboardType="numeric"
          value={voc}
          onChangeText={setVoc}
        />
        <Text className="w-8 text-base">V</Text>
      </View>

      {/* Isc */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Isc:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="A"
          keyboardType="numeric"
          value={isc}
          onChangeText={setIsc}
        />
        <Text className="w-8 text-base">A</Text>
      </View>

      {/* Vmp */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Vmp:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="V"
          keyboardType="numeric"
          value={vmp}
          onChangeText={setVmp}
        />
        <Text className="w-8 text-base">V</Text>
      </View>

      {/* Imp */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Imp:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="A"
          keyboardType="numeric"
          value={imp}
          onChangeText={setImp}
        />
        <Text className="w-8 text-base">A</Text>
      </View>

      <Text className="font-bold mt-5 mb-2">Panel Dimension (Input):</Text>

      {/* Panel Length */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Length:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="mm"
          keyboardType="numeric"
          value={panelLength}
          onChangeText={setLength}
        />
        <Text className="w-10 text-base">mm</Text>
      </View>

      {/* Panel Width */}
      <View className="flex-row items-center my-2">
        <Text className="w-28 text-base">Width:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="mm"
          keyboardType="numeric"
          value={panelWidth}
          onChangeText={setWidth}
        />
        <Text className="w-10 text-base">mm</Text>
      </View>

      <Text className="font-bold mt-5 mb-2">Enter Data Below (Input):</Text>

      {/* No. of Panels */}
      <View className="flex-row items-center my-2">
        <Text className="w-40 text-base">No. of Solar Panels:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="No. of Solar Panels"
          keyboardType="numeric"
          value={noOfPanels}
          onChangeText={setNoOfPanels}
        />
        <Text className="w-12 text-base">pcs.</Text>
      </View>

      {/* Panels per Group */}
      <View className="flex-row items-center my-2">
        <Text className="w-40 text-base">Panels per Group:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="Panels per Group"
          keyboardType="numeric"
          value={panelsPerGroup}
          onChangeText={setPanelsPerGroup}
        />
        <Text className="w-12 text-base">pcs.</Text>
      </View>

      {/* Rail Length */}
      <View className="flex-row items-center my-2">
        <Text className="w-40 text-base">Length of Railings:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="Length of Railings"
          keyboardType="numeric"
          value={railLength}
          onChangeText={setRailLength}
        />
        <Text className="w-10 text-base">m</Text>
      </View>

      <Text className="font-bold mt-5 mb-1">
        Railing length per group: <Text className="font-normal">{railingLengthPerGroup !== '' ? ` ${railingLengthPerGroup} m` : ' ---'}</Text>
      </Text>
      <Text className="text-xs text-gray-500 mb-3">Note: Choose a length of railings greater than this value.</Text>

      <Text className="font-bold mt-5 mb-2">Calculate the No. of Railings per group:</Text>

      {/* Number of Railings */}
      <View className="flex-row items-center my-2">
        <Text className="w-48 text-base">Enter No. of Railing per length:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="Enter No. of Railing per length"
          keyboardType="numeric"
          value={numberOfRailingPerLength}
          onChangeText={setNumberOfRailingPerLength}
        />
      </View>

      <Text className="font-bold mt-5 mb-1">
        Comparison: <Text className="font-normal">{comparison !== '' ? ` ${comparison} m - ${comparisonStatus}` : ' ---'}</Text>
      </Text>

      {/* Number of Groups */}
      <View className="flex-row items-center my-2">
        <Text className="w-40 text-base">Number of Groups:</Text>
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded mr-2"
          placeholder="Number of Groups"
          keyboardType="numeric"
          value={numberOfGroups}
          onChangeText={setNumberOfGroups}
        />
      </View>

      {/* Button */}
       <TouchableOpacity 
  onPress={compute} 
  className="bg-blue-500 shadow-md shadow-zinc-400 rounded-full py-4 mt-5"
>
  <Text className="text-center text-white font-bold text-base">
    Compute Panel Accessories
  </Text>
</TouchableOpacity>

        

      {/* Result */}
      <Text className="mt-6 text-base">{result}</Text>
    </ScrollView>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
// @ts-ignore
export default function SolarQuotationForm({ onComputeResult }) {
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

  const compute = () => {
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
      finalRailings,
      finalMidClamp,
      finalEndClamp,
      superfinaltFoot,
      finalMc4,
      mc4Y,
    };

    setResult(`
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
    `);

    if (onComputeResult) {
      onComputeResult(resultData);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Railings Calculator</Text>

      <Text style={styles.section}>Panels Specs (Input):</Text>
      <View style={styles.inlineGroup}>
      <Text style={styles.label}>Watts:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="W"
          keyboardType="numeric"
          value={watts}
          onChangeText={setWatts}
        />
        <Text style={styles.unit}>W</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Voc:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="V"
          keyboardType="numeric"
          value={voc}
          onChangeText={setVoc}
        />
        <Text style={styles.unit}>V</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Isc:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="A"
          keyboardType="numeric"
          value={isc}
          onChangeText={setIsc}
        />
        <Text style={styles.unit}>A</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Vmp:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="V"
          keyboardType="numeric"
          value={vmp}
          onChangeText={setVmp}
        />
        <Text style={styles.unit}>V</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Imp:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="A"
          keyboardType="numeric"
          value={imp}
          onChangeText={setImp}
        />
        <Text style={styles.unit}>A</Text>
    </View>
      


      <Text style={styles.section}>Panel Dimension (Input):</Text>
       <View style={styles.inlineGroup}>
      <Text style={styles.label}>Length:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="mm"
          keyboardType="numeric"
          value={panelLength}
          onChangeText={setLength}
        />
        <Text style={styles.unit}>mm</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Width:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="mm"
          keyboardType="numeric"
          value={panelWidth}
          onChangeText={setWidth}
        />
        <Text style={styles.unit}>mm</Text>
    </View>
      <Text style={styles.section}>Enter Data Below (Input):</Text>
       <View style={styles.inlineGroup}>
      <Text style={styles.label}>No. of Solar Panels:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="No. of Solar Panels"
          keyboardType="numeric"
          value={noOfPanels}
          onChangeText={setNoOfPanels}
        />
        <Text style={styles.unit}>pcs.</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Panels per Group:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Panels per Group"
          keyboardType="numeric"
          value={panelsPerGroup}
          onChangeText={setPanelsPerGroup}
        />
        <Text style={styles.unit}>pcs.</Text>
    </View>
     <View style={styles.inlineGroup}>
      <Text style={styles.label}>Length of Railings:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Length of Railings"
          keyboardType="numeric"
          value={railLength}
          onChangeText={setRailLength}
        />
        <Text style={styles.unit}>m</Text>
    </View>
     
      <Text style={styles.section}>Railing length per group: <Text style={{ fontWeight: 'normal' }}>{railingLengthPerGroup !== '' ? ` ${railingLengthPerGroup} m` : ' ---'}</Text></Text>
      <Text style={{ fontSize: 12, color: 'gray' }}>Note: Choose a length of railings greater than this value.</Text>

      <Text style={styles.section}>Calculate the No. of Railings per group:</Text>
      <View style={styles.inlineGroup}>
      <Text style={styles.label}>Enter No. of Railing per length:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter No. of Railing per length"
          keyboardType="numeric"
          value={numberOfRailingPerLength}
          onChangeText={setNumberOfRailingPerLength}
        />
        <Text style={styles.unit}></Text>
    </View>
    

      <Text style={styles.section}>Comparison: <Text style={{ fontWeight: 'normal' }}>{comparison !== '' ? ` ${comparison} m - ${comparisonStatus}` : ' ---'}</Text></Text>

      <View style={styles.inlineGroup}>
      <Text style={styles.label}>Number of Groups:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Number of Groups"
          keyboardType="numeric"
          value={numberOfGroups}
          onChangeText={setNumberOfGroups}
        />
        <Text style={styles.unit}></Text>
    </View>
     

      <View style={styles.buttonContainer}>
        <Button title="Compute Panel Accessories" onPress={compute} />
      </View>

      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  result: {
    marginTop: 20,
    fontSize: 16,
  },
  inlineGroup: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 8,
},
label: {
  fontSize: 16,
  width: 120,
},
inlineInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  borderRadius: 5,
  marginRight: 6,
},
unit: {
  fontSize: 16,
  width: 30,
},
});

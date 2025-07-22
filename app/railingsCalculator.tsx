import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

export default function SolarQuotationForm() {
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

  if (panels === 0 || group === 0 || rail === 0 || length === 0 || width === 0 || numberRailing === 0) {
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

  
  const railingLengthPerGroupValue = (group * width) / 1000; // mm to meters
  setRailingLengthPerGroup(railingLengthPerGroupValue.toFixed(3));

  const comparisonResult = numberRailing * rail;
  setComparison(comparisonResult.toFixed(1));

  const comparisonStatus = (comparisonResult >= railingLengthPerGroupValue) ? 'OK!' : 'NOT OK!';
  setComparisonStatus(comparisonStatus);

  const finalRailings = totalRailings * numberGroups;

  setResult(`
Standard Data in 1 Group (Constant)
Railings: ${totalRailings}
Mid Clamp: ${midClamp} pcs
End Clamp: ${endClamp} pcs
T Foot: ${tFoot} pcs
MC4: ${mc4} pair
MC4-Y (MC4-Y (No. of parallel): ${mc4Y} pair

Accessories Needed:
Railings: ${finalRailings} pcs.
Mid Clamp: ${midClamp * numberGroups} pcs
End Clamp: ${endClamp * numberGroups} pcs
T foot: ${tFoot * numberGroups} pcs
MC4:  ${mc4 + numberGroups - 1} pair 
MC4-Y: ${mc4} pair

  `);
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Railings Calculator</Text>

      <Text style={styles.section}>Panels Specs (Input):</Text>
      <TextInput style={styles.input} placeholder="Watts (W)" keyboardType="numeric" value={watts} onChangeText={setWatts} />
      <TextInput style={styles.input} placeholder="Voc (V)" keyboardType="numeric" value={voc} onChangeText={setVoc} />
      <TextInput style={styles.input} placeholder="Isc (A)" keyboardType="numeric" value={isc} onChangeText={setIsc} />
      <TextInput style={styles.input} placeholder="Vmp (V)" keyboardType="numeric" value={vmp} onChangeText={setVmp} />
      <TextInput style={styles.input} placeholder="Imp (A)" keyboardType="numeric" value={imp} onChangeText={setImp} />

      <Text style={styles.section}>Panel Dimension (Input):</Text>
      <TextInput style={styles.input} placeholder="Length (mm)" keyboardType="numeric" value={panelLength} onChangeText={setLength} />
      <TextInput style={styles.input} placeholder="Width (mm)" keyboardType="numeric" value={panelWidth} onChangeText={setWidth} />

      <Text style={styles.section}>Enter Data Below (Input):</Text>
      <TextInput style={styles.input} placeholder="No. of Solar Panels" keyboardType="numeric" value={noOfPanels} onChangeText={setNoOfPanels} />
      <TextInput style={styles.input} placeholder="Panels per Group" keyboardType="numeric" value={panelsPerGroup} onChangeText={setPanelsPerGroup} />
      <TextInput style={styles.input} placeholder="Length of Railings (m)" keyboardType="numeric" value={railLength} onChangeText={setRailLength} />

      <Text style={styles.section}>
        Railing length per group:
        <Text style={{ fontWeight: 'normal' }}>
          {railingLengthPerGroup !== '' ? ` ${railingLengthPerGroup} m` : ' ---'}
        </Text>
      </Text>

      <Text style={{ fontSize: 12, color: 'gray' }}>
        Note: Choose a length of railings greater than this value.
      </Text>

      <Text style={styles.section}>Calculate the No. of Raillings per  group:</Text>
      <TextInput style={styles.input} placeholder="Enter No. of Railing per length" keyboardType="numeric" value={numberOfRailingPerLength} onChangeText={setNumberOfRailingPerLength} />
      
      <Text style={styles.section}>
        Comparison:
        <Text style={{ fontWeight: 'normal' }}>
          {comparison !== '' ? ` ${comparison} m - ${comparisonStatus}` : ' ---'}
        </Text>
      </Text>

    <TextInput style={styles.input} placeholder="Number of Groups" keyboardType="numeric" value={numberOfGroups} onChangeText={setNumberOfGroups} />

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
});

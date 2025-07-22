// BatteryCalculator.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function BatteryCalculator() {
  const [ah, setAh] = useState('');
  const [voltage, setVoltage] = useState('');
  const [result, setResult] = useState('');

  const compute = () => {
    const ahValue = parseFloat(ah) || 0;
    const voltageValue = parseFloat(voltage) || 0;

    const wh = ahValue * voltageValue;

    setResult(`Battery Capacity: ${wh} Wh`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battery Calculator</Text>
      <TextInput style={styles.input} placeholder="Amp Hours (Ah)" keyboardType="numeric" value={ah} onChangeText={setAh} />
      <TextInput style={styles.input} placeholder="Voltage (V)" keyboardType="numeric" value={voltage} onChangeText={setVoltage} />
      <Button title="Compute" onPress={compute} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  result: { marginTop: 20, fontSize: 16 },
});

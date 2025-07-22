

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet } from 'react-native';


export default function BatteryCalculator() {
  const [ah, setAh] = useState('');
  const [voltage, setVoltage] = useState('');

  const [result4, setResult4] = useState('');
  const [result5, setResult5] = useState('');
  const [result6, setResult6] = useState('');
  const [batteryNumVoltage, setBatteryNumVoltage] = useState('');
  const [battDod, setBattDod] = useState('');
  const [battEfficient, setbattEfficient] = useState('');
  const [loadConsum, setLoadConsum] = useState('');
  const [solarPanelSize, setSolarPanelSize] = useState('');
  const [seriesPanels, setSeriesPanels] = useState('');
  const [mpptEfficiency, setMpptEfficiency] = useState('');
  const [existingMonthlyBill, setExistingMonthlyBill] = useState('')
  const [eletricCoopRate, setElectricCoopRate] = useState('');
  const [purelySolarPower, setPurelySolarPOwer] = useState('')




  useEffect(() => {
    const ahValue = parseFloat(ah) || 0;
const voltageValue = parseFloat(voltage) || 0;
const battNumV = parseFloat(batteryNumVoltage) || 0;

const battDODPercent = parseFloat(battDod) || 0; // 70%
const battDOD = battDODPercent / 100;

const battEfficiencyPercent = parseFloat(battEfficient) || 0; // 93%
const battEfficiency = battEfficiencyPercent / 100;

const loadConsumption = parseFloat(loadConsum) || 0;

// Computations
const wh = ahValue * voltageValue;
const battWh = battNumV * wh;
const ratedDOD = battDOD * battWh * battEfficiency;

const runTimeRaw = loadConsumption > 0 ? ratedDOD / loadConsumption : 0;
const runTime = parseFloat(runTimeRaw.toFixed(1)); // 1 decimal place

const dischargePerHour = runTime > 0 ? battDODPercent / runTime : 0;

const remainingBattery = 100 - battDODPercent;

 // Solar and Grid Power Hours

  const solarHours = parseInt(purelySolarPower) || 0; // fixed value
 const notBatteryHours = 24 - runTime;
  const gridHours = notBatteryHours - solarHours; // No negative hours

const solarSize = parseFloat(solarPanelSize) || 0; // in Watts
const seriesCount = parseFloat(seriesPanels) || 0;
const mpptEffPercent = parseFloat(mpptEfficiency) || 0;
const mpptEff = mpptEffPercent / 100;

const totalSolarPower = solarSize * seriesCount; // Total solar panel output

const energyToRecharge = battWh * battDOD; // Wh
const adjustedPower = totalSolarPower * mpptEff; // 4 peak sun hours

const chargingTime = energyToRecharge / adjustedPower;


const existingBill = parseFloat(existingMonthlyBill) || 0;
const coopRate = parseFloat(eletricCoopRate) || 0;



const monthlyConsumption =  existingBill / coopRate; // kWh
const dailyConsumptionKwh = monthlyConsumption / 30; // kWh
const dailyLoadWatts = (dailyConsumptionKwh * 1000) / 24; // Watts



const batteryRunTimeHours = runTime; // from previous calculation

const dailySavedKwh = (batteryRunTimeHours * dailyLoadWatts) / 1000;
const dailySavingsPhp = dailySavedKwh * coopRate;
const monthlySavingsPhp = dailySavingsPhp * 30;


const solarSavedKwh = (solarHours * dailyLoadWatts) / 1000;
const solarMonthlyBill = Math.round((solarSavedKwh * coopRate) * 30);


const totalSavings = solarMonthlyBill + monthlySavingsPhp;
const finalDailyConsumption = (dailyLoadWatts * gridHours) / 1000;
const GridPurchaseMonthlyBill = (finalDailyConsumption * coopRate) * 30;

const estimatedMonthly = existingBill - totalSavings;


setResult4(`
  --Discharging Computation--

Battery Size: ${ahValue} Ah
Number of Batteries: ${voltageValue} pcs.
Total Battery Size: ${wh} (Ampere-Hour)
Battery Nom. Voltage: ${battNumV} Volts
Battery WH: ${battWh} (Watt-Hour)
Battery D.O.D: ${battDODPercent} %
Battery Efficiency: ${battEfficient} %
Rated D.O.D: ${ratedDOD.toFixed(3)}
Load Consumption: ${loadConsumption} Watts
Rated Runtime: ${runTime} Hours
Remaining Battery: ${remainingBattery}% 
Rate of Discharge per Hour: ${dischargePerHour.toFixed(1)}%

Not Battery Hours: ${notBatteryHours} Hours
(Battery @100%) Purely Solar Power: ${solarHours} Hours
Grid Power Only: ${gridHours}
`);

setResult5(`
  --Charging Computation--

Solar Panel Size: ${solarSize} W
Series Solar Panels: ${seriesCount} pcs
Total Solar Panels: ${totalSolarPower} W (Base from 4 hours sun hours)
MPPT Efficiency: ${mpptEffPercent}%
% Battery Discharge: ${battDODPercent}%
Remaining Battery :${100 - battDODPercent}%

Step 1: Energy to Recharge: ${energyToRecharge.toFixed(2)} Wh
Step 2: Adjusted for Efficiency: ${adjustedPower} W
Step 3: Charging Time: ${chargingTime.toFixed(2)} Hours
`);

setResult6(`
  --Energy Savings Computation--

Existing Monthly Bill: ₱${existingBill} 
Electric Cooperative Rate: ₱${coopRate} / kWh
Monthly Consumption: ${Math.round(monthlyConsumption)} kWh
Daily Consumption (Kwh): ${Math.round(dailyConsumptionKwh)} Kwh
Daily Consumption (Watts): ${Math.round(dailyLoadWatts)} Watts

Estimated Monthly Billing after installation of Solar: ${estimatedMonthly}

Actual Daily Load: ${Math.round(dailyLoadWatts)} Watts
Battery Runtime: ${batteryRunTimeHours} Hours
Daily Consumption Saved: ${dailySavedKwh.toFixed(2)} kWh
Daily Savings: ₱${dailySavingsPhp.toFixed(2)} Php
Monthly Savings: ₱${monthlySavingsPhp.toFixed(2)} Php (Using Battery)

(Battery @100%) Pure Solar Runtime: ${solarHours} Hours
Average Load Usage: ${Math.round(dailyLoadWatts)}
Daily Consumption: ${solarSavedKwh.toFixed(2)} Kwh
Solar Monthly Bill:  ${solarMonthlyBill} (Solar Peak Hours)
Total Savings: ${totalSavings.toFixed(2)}

Grid Power: ${gridHours} Hours
Average Load Usage: ${Math.round(dailyLoadWatts)} Watts
daily Consumption: ${finalDailyConsumption} Kwh
Grid Purchase Monthly Bill: ${GridPurchaseMonthlyBill} Php
`);





  }, [ah, voltage, batteryNumVoltage, battDod, battEfficient, loadConsum, solarPanelSize, seriesPanels, mpptEfficiency, existingMonthlyBill, eletricCoopRate, purelySolarPower]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Battery Calculator</Text>
      <Text style={styles.section}>Calculation for Discharging:</Text> 

      <TextInput style={styles.input} placeholder="Battery size (Ah)" keyboardType="numeric" value={ah} onChangeText={setAh} />

      <TextInput style={styles.input} placeholder="Number of Batteries" keyboardType="numeric" value={voltage} onChangeText={setVoltage} />

      <TextInput style={styles.input} placeholder="Battery Num. Voltage:" keyboardType="numeric" value={batteryNumVoltage} onChangeText={setBatteryNumVoltage} />
     
      <TextInput style={styles.input} placeholder="Battery D.O.D" keyboardType='numeric' value={battDod} onChangeText={setBattDod}/>
      <TextInput style={styles.input} placeholder="Battery Efficiency" keyboardType='numeric' value={battEfficient} onChangeText={setbattEfficient}/>
  
      <TextInput style={styles.input} placeholder="Load Consumption (Watts)" keyboardType='numeric' value={loadConsum} onChangeText={setLoadConsum}/>
      <TextInput style={styles.input} placeholder="(Battery @100%) Purely Solar Power:" keyboardType='numeric' value={purelySolarPower} onChangeText={setPurelySolarPOwer}/>
      <Text style={styles.result}>{result4}</Text>

      <Text style={styles.section}>Calculation for Charging:</Text>

      <TextInput style={styles.input} placeholder="Solar Panel Size (Watts)" keyboardType='numeric' value={solarPanelSize} onChangeText={setSolarPanelSize}/>
      <TextInput style={styles.input} placeholder="Series Solar Panels (Pcs)" keyboardType='numeric' value={seriesPanels} onChangeText={setSeriesPanels}/>
      <TextInput style={styles.input} placeholder="MPPT Efficiency (%)" keyboardType='numeric' value={mpptEfficiency} onChangeText={setMpptEfficiency}/>
      <Text style={styles.result}>{result5}</Text>

      <Text style={styles.section}>Calculation for Energy Savings:</Text>
      <TextInput style={styles.input} placeholder="(₱) Existing Monthly Bill" keyboardType='numeric' value={existingMonthlyBill} onChangeText={setExistingMonthlyBill}/>
      <TextInput style={styles.input} placeholder="(₱) Electric Cooperative Rate /kWh" keyboardType='numeric' value={eletricCoopRate} onChangeText={setElectricCoopRate}/>
      <TextInput style={styles.input} placeholder="(Battery @100%) Purely Solar Power:" keyboardType='numeric' value={purelySolarPower} onChangeText={setPurelySolarPOwer}/>
      <Text style={styles.result}>{result6}</Text>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    flexGrow: 1 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 
    'bold', 
    marginBottom: 15, 
    textAlign: 'center' },
  input: { 
    borderWidth: 1,
     borderColor: '#ccc',
      padding: 10,
       marginVertical: 5,
        borderRadius: 5 },
  result: { 
    marginTop: 0,
     fontSize: 13 
    },
     subtitle: {
    fontSize: 15, // H2 size (smaller)
    fontWeight: '500',
    color: '#555',
    marginBottom: 15,
  },
  section: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },

});

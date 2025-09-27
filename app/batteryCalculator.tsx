import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, SafeAreaView, Image } from 'react-native';
import icons from '@/constants/icons';

export default function BatteryCalculator() {
  const [ah, setAh] = useState('');
  const [voltage, setVoltage] = useState('');
  const [batteryNumVoltage, setBatteryNumVoltage] = useState('');
  const [battDod, setBattDod] = useState('');
  const [battEfficient, setBattEfficient] = useState('');
  const [loadConsum, setLoadConsum] = useState('');
  const [solarPanelSize, setSolarPanelSize] = useState('');
  const [seriesPanels, setSeriesPanels] = useState('');
  const [mpptEfficiency, setMpptEfficiency] = useState('');
  const [existingMonthlyBill, setExistingMonthlyBill] = useState('');
  const [eletricCoopRate, setElectricCoopRate] = useState('');
  const [purelySolarPower, setPurelySolarPower] = useState('');

  // parse helpers
  const num = (val: string) => parseFloat(val);

  return (
    <SafeAreaView className="h-full bg-white-100">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-1 pb-2">
        
                 <View className="flex-row items-center justify-center mt-5">
                      {/* Icon on the left */}
                      <View className="bg-blue-400 rounded-2xl p-3 mr-3">
                        <Image source={icons.accumulator} className="size-10" />
                      </View>

                      {/* Title centered */}
                      <Text className="text-2xl font-rubik-bold text-center">
                        Battery Calculator
                      </Text>
                      
                    </View>

           
       
        {/* Discharging Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-4 mt-5 items-center">
          <Text className="font-rubik-bold text-lg mb-3">🔋 Discharging Calculation</Text>

          {/* Inputs */}
          <View className="flex-row items-center my-2">
            <Text className="w-36 font-rubik-bold">Battery size</Text>
            <TextInput
              value={ah}
              onChangeText={setAh}
              keyboardType="numeric"
              placeholder="Ah"
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2 "
            />
            <Text className="w-10">Ah</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36 font-rubik-bold">Number of Batteries</Text>
            <TextInput
              value={voltage}
              onChangeText={setVoltage}
              keyboardType="numeric"
              placeholder="pcs."
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2"
            />
            <Text className="w-10">pcs.</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36 font-rubik-bold">Battery Nom. Voltage</Text>
            <TextInput
              value={batteryNumVoltage}
              onChangeText={setBatteryNumVoltage}
              keyboardType="numeric"
              placeholder="V"
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2"
            />
            <Text className="w-10">V</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36 font-rubik-bold">Battery D.O.D</Text>
            <TextInput
              value={battDod}
              onChangeText={setBattDod}
              keyboardType="numeric"
              placeholder="%"
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2"
            />
            <Text className="w-10">%</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36 font-rubik-bold">Battery Efficiency</Text>
            <TextInput
              value={battEfficient}
              onChangeText={setBattEfficient}
              keyboardType="numeric"
              placeholder="%"
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2 "
            />
            <Text className="w-10">%</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="font-rubik-bold w-36">Load Consumption</Text>
            <TextInput
              value={loadConsum}
              onChangeText={setLoadConsum}
              keyboardType="numeric"
              placeholder="W"
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-3 mr-2 "
            />
            <Text className="w-10">W</Text>
          </View>

      
          {ah && voltage && batteryNumVoltage && battDod && battEfficient && loadConsum ? (() => {
            const ahValue = num(ah);
            const voltageValue = num(voltage);
            const battNumV = num(batteryNumVoltage);
            const battDODPercent = num(battDod);
            const battEfficiencyPercent = num(battEfficient);
            const loadConsumption = num(loadConsum);
            const solarHours = parseInt(purelySolarPower) || 0;

            if (
              !isNaN(ahValue) && !isNaN(voltageValue) &&
              !isNaN(battNumV) && !isNaN(battDODPercent) &&
              !isNaN(battEfficiencyPercent) && !isNaN(loadConsumption)
            ) {
              const wh = ahValue * voltageValue;
              const battWh = battNumV * wh;
              const ratedDOD = (battDODPercent / 100) * battWh * (battEfficiencyPercent / 100);
              const runTime = ratedDOD / loadConsumption;
              const dischargePerHour = battDODPercent / runTime;
              const remainingBattery = 100 - battDODPercent;
              const notBatteryHours = 24 - runTime;
              const gridHours = notBatteryHours - solarHours;

              return (
                <View className="mt-3 bg-orange-100 rounded-2xl p-4 border-l-4 border-orange-400">
                  <Text className="font-rubik-bold text-xl p-5">Discharging Computation</Text>
                  <View className='flex flex-row justify-between mt-2'>
                        <Text className='font-rubik-medium text-lg'>Battery Size: </Text>
                        <Text className='font-rubik-bold text-xl color-orange-600'>{ahValue} Ah</Text>
                  </View>
                   <View className='flex flex-row justify-between mt-2  '>
                  <Text className='font-rubik-medium text-lg'>Number of Batteries: </Text>
                  <Text className='font-rubik-bold text-xl color-orange-600'>{voltageValue} pcs.</Text>
                  </View>
                   <View className='flex flex-row justify-between mt-2'>
                  <Text className='font-rubik-medium text-lg'>Total Battery Size: </Text>
                   <Text className='font-rubik-bold text-xl color-orange-600'>{wh} (AH)</Text>
                  </View>
                     <View className='flex flex-row justify-between mt-2'> 
                  <Text className='font-rubik-medium text-lg'>Battery Nom. Voltage: </Text>
                   <Text className='font-rubik-bold text-xl color-orange-600'>{battNumV} V</Text>
                  </View>
                  <View className=' flex flex-row justify-between mt-2'>
                  <Text className='font-rubik-medium text-lg'>Battery WH: </Text>
                  <Text className='font-rubik-bold text-xl color-orange-600'> {battWh} Wh</Text>
                  </View>
                   <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Battery D.O.D: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{battDODPercent}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Battery Efficiency: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{battEfficiencyPercent}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Rated D.O.D: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{ratedDOD.toFixed(2)}</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Load Consumption: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{loadConsumption} W</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Rated Runtime: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{runTime.toFixed(2)} Hrs</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Remaining Battery: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{remainingBattery}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Rate of Discharge per Hour: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{dischargePerHour.toFixed(1)}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Not Battery Hours: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{notBatteryHours.toFixed(2)} Hrs</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Purely Solar Power: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{solarHours} Hrs</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Grid Power Only: </Text>
    <Text className="font-rubik-bold text-xl text-orange-600">{gridHours.toFixed(2)} Hrs</Text>
  </View>
                </View>
              );
            }
          })() : null}
        </View>

        {/* ⚡ Charging Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-4">
          <Text className="font-rubik-bold text-lg mb-3">⚡ Charging Calculation</Text>

          <View className="flex-row items-center my-2">
            <Text className="w-36">Solar Panel Size</Text>
            <TextInput
              value={solarPanelSize}
              onChangeText={setSolarPanelSize}
              keyboardType="numeric"
              placeholder="W"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-3 mr-2"
            />
            <Text className="w-10">W</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36">Series Panels</Text>
            <TextInput
              value={seriesPanels}
              onChangeText={setSeriesPanels}
              keyboardType="numeric"
              placeholder="pcs."
              className="flex-1 border border-gray-300 rounded-xl px-3  py-3 mr-2"
            />
            <Text className="w-10">pcs.</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36">MPPT Efficiency</Text>
            <TextInput
              value={mpptEfficiency}
              onChangeText={setMpptEfficiency}
              keyboardType="numeric"
              placeholder="%"
              className="flex-1 border border-gray-300 rounded-xl px-3  py-3 mr-2"
            />
            <Text className="w-10">%</Text>
          </View>

          {/* Results inline */}
          {solarPanelSize && seriesPanels && mpptEfficiency && battDod ? (() => {
            const solarSize = num(solarPanelSize);
            const seriesCount = num(seriesPanels);
            const mpptEffPercent = num(mpptEfficiency);
            const battDODPercent = num(battDod);

            if (!isNaN(solarSize) && !isNaN(seriesCount) && !isNaN(mpptEffPercent) && !isNaN(battDODPercent)) {
              const mpptEff = mpptEffPercent / 100;
              const totalSolarPower = solarSize * seriesCount;
              const battWh = num(batteryNumVoltage) * (num(ah) * num(voltage));
              const energyToRecharge = battWh * (battDODPercent / 100);
              const adjustedPower = totalSolarPower * mpptEff;
              const chargingTime = energyToRecharge / adjustedPower;

              return (
                <View className="mt-3 bg-green-100 rounded-2xl p-4 border-l-4 border-green-400">
  <Text className="font-rubik-bold text-xl p-5">Charging Computation</Text>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Solar Panel Size: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{solarSize} W</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Series Solar Panels: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{seriesCount} pcs</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Total Solar Panels: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{totalSolarPower} W</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">MPPT Efficiency: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{mpptEffPercent}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Battery Discharge: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{battDODPercent}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Remaining Battery: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{100 - battDODPercent}%</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Energy to Recharge: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{energyToRecharge.toFixed(2)} Wh</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Adjusted for Efficiency: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{adjustedPower.toFixed(2)} W</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Charging Time: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{chargingTime.toFixed(2)} Hrs</Text>
  </View>
</View>
              );
            }
          })() : null}
        </View>

        {/* 💰 Energy Savings Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-6 items-center">
          <Text className="font-rubik-bold text-lg mb-3">💰 Energy Savings Calculation</Text>

          <View className="flex-row items-center my-2">
            <Text className="w-36">Monthly Bill (₱)</Text>
            <TextInput
              value={existingMonthlyBill}
              onChangeText={setExistingMonthlyBill}
              keyboardType="numeric"
              placeholder="₱"
              className="flex-1 border border-gray-300 rounded-xl px-3  py-3 mr-2"
            />
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36">Rate per kWh</Text>
            <TextInput
              value={eletricCoopRate}
              onChangeText={setElectricCoopRate}
              keyboardType="numeric"
              placeholder="₱"
              className="flex-1 border border-gray-300 rounded-xl px-3  py-3 mr-2"
            />
            <Text className="w-10">₱</Text>
          </View>

          <View className="flex-row items-center my-2">
            <Text className="w-36">Pure Solar Power</Text>
            <TextInput
              value={purelySolarPower}
              onChangeText={setPurelySolarPower}
              keyboardType="numeric"
              placeholder="hours"
              className="flex-1 border border-gray-300 rounded-xl px-3  py-3 mr-2"
            />
            <Text className="w-10">hrs</Text>
          </View>

          {/* Results inline */}
          {existingMonthlyBill && eletricCoopRate ? (() => {
            const existingBill = num(existingMonthlyBill);
            const coopRate = num(eletricCoopRate);
            const solarHours = parseInt(purelySolarPower) || 0;

            if (!isNaN(existingBill) && !isNaN(coopRate)) {
              const monthlyConsumption = existingBill / coopRate;
              const dailyConsumptionKwh = monthlyConsumption / 30;
              const dailyLoadWatts = (dailyConsumptionKwh * 1000) / 24;
              const solarSavedKwh = (solarHours * dailyLoadWatts) / 1000;
              const solarMonthlyBill = solarSavedKwh * coopRate * 30;
              const estimatedMonthly = existingBill - solarMonthlyBill;

              return (
                <View className="mt-3 bg-green-100 rounded-2xl p-4 border-l-4 border-green-400">
  <Text className="font-rubik-bold text-xl p-5 ">Energy Savings Computation</Text>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Existing Monthly Bill: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">₱{existingBill}</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Electric Coop Rate: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">₱{coopRate}/kWh</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Monthly Consumption: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{Math.round(monthlyConsumption)} kWh</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Daily Consumption: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{Math.round(dailyConsumptionKwh)} kWh</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Daily Load: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">{Math.round(dailyLoadWatts)} W</Text>
  </View>

  <View className="flex flex-row justify-between mt-2">
    <Text className="font-rubik-medium text-lg">Solar Monthly Bill: </Text>
    <Text className="font-rubik-bold text-xl text-green-600">₱{solarMonthlyBill.toFixed(2)}</Text>
  </View>
    <Text className="font-rubik-medium text-lg mt-5">Estimated Monthly Bill After Solar: </Text>
  <View className="flex flex-row justify-between mt-2">
    
    <Text className="font-rubik-bold text-xl text-green-600">₱{estimatedMonthly.toFixed(2)}</Text>
  </View>
</View>
              );
            }
          })() : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

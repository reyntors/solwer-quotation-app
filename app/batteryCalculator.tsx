import icons from "@/constants/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Client, ID, Query, TablesDB } from "react-native-appwrite";

export default function BatteryCalculator() {
  const [ah, setAh] = useState("");
  const [voltage, setVoltage] = useState("");
  const [batteryNumVoltage, setBatteryNumVoltage] = useState("");
  const [battDod, setBattDod] = useState("");
  const [battEfficient, setBattEfficient] = useState("");
  const [loadConsum, setLoadConsum] = useState("");
  const [solarPanelSize, setSolarPanelSize] = useState("");
  const [seriesPanels, setSeriesPanels] = useState("");
  const [mpptEfficiency, setMpptEfficiency] = useState("");
  const [existingMonthlyBill, setExistingMonthlyBill] = useState("");
  const [eletricCoopRate, setElectricCoopRate] = useState("");
  const [purelySolarPower, setPurelySolarPower] = useState("");
  const [createApplianceVisible, setCreateApplianceVisible] = useState(false);
  const [newApplianceName, setNewApplianceName] = useState("");
  const [newAppliancePower, setNewAppliancePower] = useState("");
  const [newApplianceQuantity, setNewApplianceQuantity] = useState("1");
  const [savingAppliance, setSavingAppliance] = useState(false);

  // parse helpers
  const num = (val: string) => parseFloat(val);

  const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform("com.solwer.solwerquotation");

  const tablesDB = new TablesDB(client);

  type ApplianceRow = {
    $id: string;
    name: string;
    power: number;
    quantity: number;
  };

  type SelectedAppliance = {
    id: string;
    name: string;
    power: number;
    quantity: number;
    hoursUsed: number;
  };

  const [appliances, setAppliances] = useState<ApplianceRow[]>([]);
  const [selectedAppliances, setSelectedAppliances] = useState<
    SelectedAppliance[]
  >([]);

  const [applianceLoading, setApplianceLoading] = useState(true);
  const [applianceModalVisible, setApplianceModalVisible] = useState(false);

  const [selectedAppliance, setSelectedAppliance] =
    useState<ApplianceRow | null>(null);

  const [applianceQty, setApplianceQty] = useState("1");
  const [hoursUsed, setHoursUsed] = useState("");

  const tableId = "6b0574bf001e681f1405";

  const createAppliance = async () => {
    const name = newApplianceName.trim();
    const power = Number(newAppliancePower);
    const quantity = Number(newApplianceQuantity);

    if (!name) {
      Alert.alert("Required", "Please enter the appliance name.");
      return;
    }

    if (!Number.isInteger(power) || power <= 0) {
      Alert.alert("Invalid Power", "Enter a valid wattage in whole numbers.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      Alert.alert("Invalid Quantity", "Enter a valid quantity.");
      return;
    }

    // Prevent duplicate appliance names (case-insensitive).
    const duplicate = appliances.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      Alert.alert("Already Exists", "This appliance is already in the list.");
      return;
    }

    try {
      setSavingAppliance(true);

      const response = await tablesDB.createRow({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId,
        rowId: ID.unique(),
        data: {
          name,
          power,
          quantity,
        },
      });

      const newAppliance = response as unknown as ApplianceRow;

      setAppliances((current) => [...current, newAppliance]);

      // Automatically select the newly created appliance.
      setSelectedAppliance(newAppliance);
      setApplianceQty(String(newAppliance.quantity));
      setHoursUsed("");

      setNewApplianceName("");
      setNewAppliancePower("");
      setNewApplianceQuantity("1");

      setCreateApplianceVisible(false);
      setApplianceModalVisible(false);

      Alert.alert("Success", "Appliance added successfully.");
    } catch (error: any) {
      console.error("Create appliance error:", error);

      Alert.alert(
        "Create Error",
        error?.message || "Unable to create appliance.",
      );
    } finally {
      setSavingAppliance(false);
    }
  };

  const fetchAppliances = useCallback(async () => {
    try {
      setApplianceLoading(true);

      const limit = 100;
      let offset = 0;
      let allAppliances: ApplianceRow[] = [];

      while (true) {
        const response = await tablesDB.listRows({
          databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId,
          queries: [Query.limit(limit), Query.offset(offset)],
        });

        const rows = response.rows as unknown as ApplianceRow[];

        allAppliances = [...allAppliances, ...rows];

        if (rows.length < limit) {
          break;
        }

        offset += limit;
      }

      setAppliances(allAppliances);
    } catch (error: any) {
      console.error("Appliance loading error:", error);

      Alert.alert(
        "Loading Error",
        error?.message || "Unable to load appliances.",
      );
    } finally {
      setApplianceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppliances();
  }, [fetchAppliances]);

  const deleteAppliance = (appliance: ApplianceRow) => {
    Alert.alert(
      "Delete Appliance",
      `Are you sure you want to delete "${appliance.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await tablesDB.deleteRow({
                databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                tableId,
                rowId: appliance.$id,
              });

              setAppliances((current) =>
                current.filter((item) => item.$id !== appliance.$id),
              );

              if (selectedAppliance?.$id === appliance.$id) {
                setSelectedAppliance(null);
                setApplianceQty("1");
                setHoursUsed("");
              }

              Alert.alert("Success", "Appliance deleted successfully.");
            } catch (error: any) {
              console.error("Delete appliance error:", error);

              Alert.alert(
                "Delete Error",
                error?.message || "Unable to delete appliance.",
              );
            }
          },
        },
      ],
    );
  };

  const addAppliance = () => {
    if (!selectedAppliance) {
      Alert.alert("Select Appliance", "Please select an appliance first.");
      return;
    }

    const quantity = Number(applianceQty);
    const hours = Number(hoursUsed);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(hours) ||
      hours <= 0 ||
      hours > 24
    ) {
      Alert.alert(
        "Invalid Input",
        "Enter a valid quantity and hours used (up to 24 hours).",
      );
      return;
    }

    setSelectedAppliances((current) => [
      ...current,
      {
        id: `${selectedAppliance.$id}-${Date.now()}`,
        name: selectedAppliance.name,
        power: selectedAppliance.power,
        quantity,
        hoursUsed: hours,
      },
    ]);

    setSelectedAppliance(null);
    setApplianceQty("1");
    setHoursUsed("");
  };

  const totalApplianceLoad = useMemo(
    () =>
      selectedAppliances.reduce(
        (sum, item) => sum + item.quantity * item.power,
        0,
      ),
    [selectedAppliances],
  );

  const totalDailyConsumption = useMemo(
    () =>
      selectedAppliances.reduce(
        (sum, item) => sum + item.quantity * item.power * item.hoursUsed,
        0,
      ),
    [selectedAppliances],
  );

  const removeAppliance = (id: string) => {
    setSelectedAppliances((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  return (
    <SafeAreaView className="h-full bg-white-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-1 pb-2"
      >
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
          <Text className="font-rubik-bold text-lg mb-3">
            🔋 Discharging Calculation
          </Text>

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

          {ah &&
          voltage &&
          batteryNumVoltage &&
          battDod &&
          battEfficient &&
          loadConsum
            ? (() => {
                const ahValue = num(ah);
                const voltageValue = num(voltage);
                const battNumV = num(batteryNumVoltage);
                const battDODPercent = num(battDod);
                const battEfficiencyPercent = num(battEfficient);
                const loadConsumption = num(loadConsum);
                const solarHours = parseInt(purelySolarPower) || 0;

                if (
                  !isNaN(ahValue) &&
                  !isNaN(voltageValue) &&
                  !isNaN(battNumV) &&
                  !isNaN(battDODPercent) &&
                  !isNaN(battEfficiencyPercent) &&
                  !isNaN(loadConsumption)
                ) {
                  const wh = ahValue * voltageValue;
                  const battWh = battNumV * wh;
                  const ratedDOD =
                    (battDODPercent / 100) *
                    battWh *
                    (battEfficiencyPercent / 100);
                  const runTime = ratedDOD / loadConsumption;
                  const dischargePerHour = battDODPercent / runTime;
                  const remainingBattery = 100 - battDODPercent;
                  const notBatteryHours = 24 - runTime;
                  const gridHours = notBatteryHours - solarHours;

                  return (
                    <View className="mt-3 bg-orange-100 rounded-2xl p-4 border-l-4 border-orange-400">
                      <Text className="font-rubik-bold text-xl p-5">
                        Discharging Computation
                      </Text>
                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery Size:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl color-orange-600">
                          {ahValue} Ah
                        </Text>
                      </View>
                      <View className="flex flex-row justify-between mt-2  ">
                        <Text className="font-rubik-medium text-lg">
                          Number of Batteries:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl color-orange-600">
                          {voltageValue} pcs.
                        </Text>
                      </View>
                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Total Battery Size:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl color-orange-600">
                          {wh} (AH)
                        </Text>
                      </View>
                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery Nom. Voltage:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl color-orange-600">
                          {battNumV} V
                        </Text>
                      </View>
                      <View className=" flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery WH:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl color-orange-600">
                          {" "}
                          {battWh} Wh
                        </Text>
                      </View>
                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery D.O.D:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-orange-600">
                          {battDODPercent}%
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery Efficiency:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-orange-600">
                          {battEfficiencyPercent}%
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Rated D.O.D:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-orange-600">
                          {ratedDOD.toFixed(2)}
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Load Consumption:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-orange-600">
                          {loadConsumption} W
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Rated Runtime:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-orange-600">
                          {runTime.toFixed(2)} Hrs
                        </Text>
                      </View>
                    </View>
                  );
                }
              })()
            : null}
        </View>

        {/* ⚡ Sizing of Battery (Backup load) Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-4">
          <Text className="font-rubik-bold text-lg mb-3">
            Sizing of Battery (Backup load)
          </Text>

          {/* Appliance Selection */}
          <Text className="font-rubik-bold mb-2">Select Appliance</Text>
          {createApplianceVisible ? (
            <View>
              <Text className="font-rubik-bold text-lg mb-3">
                Create New Appliance
              </Text>

              <Text className="font-rubik-medium mb-1">Appliance Name</Text>
              <TextInput
                value={newApplianceName}
                onChangeText={setNewApplianceName}
                placeholder="e.g. Electric Fan"
                className="border border-gray-300 rounded-xl px-3 py-3 mb-3"
              />

              <Text className="font-rubik-medium mb-1">Power (Watts)</Text>
              <TextInput
                value={newAppliancePower}
                onChangeText={setNewAppliancePower}
                keyboardType="number-pad"
                placeholder="e.g. 75"
                className="border border-gray-300 rounded-xl px-3 py-3 mb-3"
              />

              <Text className="font-rubik-medium mb-1">Default Quantity</Text>
              <TextInput
                value={newApplianceQuantity}
                onChangeText={setNewApplianceQuantity}
                keyboardType="number-pad"
                placeholder="e.g. 1"
                className="border border-gray-300 rounded-xl px-3 py-3 mb-4"
              />

              <TouchableOpacity
                onPress={createAppliance}
                disabled={savingAppliance}
                className="bg-primary-300 rounded-xl py-3"
              >
                {savingAppliance ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-rubik-bold">
                    Save Appliance
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCreateApplianceVisible(false)}
                disabled={savingAppliance}
                className="bg-gray-200 rounded-xl py-3 mt-3"
              >
                <Text className="text-center font-rubik-bold">
                  Back to List
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>{/* Keep your existing appliance loading/list UI here */}</>
          )}

          <TouchableOpacity
            onPress={() => setApplianceModalVisible(true)}
            className="border border-gray-300 rounded-xl p-3 mb-3"
          >
            <Text className="text-gray-700">
              {selectedAppliance
                ? selectedAppliance.name
                : "Choose an appliance..."}
            </Text>
          </TouchableOpacity>

          {selectedAppliance && (
            <View className="bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="font-rubik-medium mb-2">
                Appliance: {selectedAppliance.name}
              </Text>

              <Text className="text-gray-600 mb-3">
                Power: {selectedAppliance.power} W
              </Text>

              <Text className="font-rubik-medium mb-1">Quantity</Text>
              <TextInput
                value={applianceQty}
                onChangeText={setApplianceQty}
                keyboardType="number-pad"
                placeholder="Enter quantity"
                className="border border-gray-300 rounded-xl px-3 py-3 mb-3"
              />

              <Text className="font-rubik-medium mb-1">Hours Used</Text>
              <TextInput
                value={hoursUsed}
                onChangeText={setHoursUsed}
                keyboardType="decimal-pad"
                placeholder="Enter hours used"
                className="border border-gray-300 rounded-xl px-3 py-3 mb-3"
              />

              <TouchableOpacity
                onPress={addAppliance}
                className="bg-primary-300 rounded-xl py-3"
              >
                <Text className="text-white text-center font-rubik-bold">
                  + Add
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Appliance List */}
          <Text className="font-rubik-bold text-lg mt-3 mb-2">
            Backup Load Appliances
          </Text>

          {selectedAppliances.length === 0 ? (
            <Text className="text-gray-500 text-center py-5">
              No appliances added yet.
            </Text>
          ) : (
            selectedAppliances.map((item, index) => {
              const totalPower = item.quantity * item.power;
              const dailyConsumption = totalPower * item.hoursUsed;

              return (
                <View
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-3 mb-3"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="font-rubik-bold flex-1">
                      {index + 1}. {item.name}
                    </Text>

                    <TouchableOpacity
                      onPress={() => removeAppliance(item.id)}
                      className="bg-red-100 rounded-lg px-3 py-2"
                    >
                      <Text className="text-red-600 font-rubik-bold">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-600">Quantity</Text>
                    <Text className="font-rubik-medium">{item.quantity}</Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Power</Text>
                    <Text className="font-rubik-medium">{item.power} W</Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Total Power</Text>
                    <Text className="font-rubik-medium">{totalPower} W</Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Hours Used</Text>
                    <Text className="font-rubik-medium">
                      {item.hoursUsed} hrs
                    </Text>
                  </View>

                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Daily Consumption</Text>
                    <Text className="font-rubik-bold text-green-600">
                      {dailyConsumption.toFixed(1)} Wh
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Total Load */}
          <View className="bg-blue-50 rounded-xl p-4 mt-2">
            <Text className="font-rubik-bold text-lg mb-3">Load Summary</Text>

            <View className="flex-row justify-between mt-1">
              <Text className="font-rubik-medium">Total Appliances</Text>
              <Text className="font-rubik-bold">
                {selectedAppliances.length}
              </Text>
            </View>

            <View className="flex-row justify-between mt-2">
              <Text className="font-rubik-medium">Total Load</Text>
              <Text className="font-rubik-bold text-blue-700">
                {totalApplianceLoad.toLocaleString("en-PH")} W
              </Text>
            </View>

            <View className="flex-row justify-between mt-2">
              <Text className="font-rubik-medium">Daily Consumption</Text>
              <Text className="font-rubik-bold text-green-700">
                {totalDailyConsumption.toLocaleString("en-PH", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                Wh
              </Text>
            </View>
          </View>
        </View>

        {/* Appliance Selection Modal */}
        <Modal
          visible={applianceModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setApplianceModalVisible(false)}
        >
          <View className="flex-1 justify-center bg-black/50 px-5">
            <View className="bg-white rounded-2xl p-5 max-h-[75%]">
              <Text className="font-rubik-bold text-xl mb-4">
                Select Appliance
              </Text>

              {!createApplianceVisible && (
                <>
                  {applianceLoading ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator size="large" />
                      <Text className="text-gray-500 mt-3">
                        Loading appliances...
                      </Text>
                    </View>
                  ) : appliances.length === 0 ? (
                    <Text className="text-gray-500 py-5 text-center">
                      No appliances found in Appwrite.
                    </Text>
                  ) : (
                    <ScrollView>
                      {appliances.map((item) => (
                        <View
                          key={item.$id}
                          className="flex-row items-center justify-between border-b border-gray-200 py-3"
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedAppliance(item);
                              setApplianceQty(String(item.quantity ?? 1));
                              setApplianceModalVisible(false);
                            }}
                            className="flex-1 mr-3"
                          >
                            <Text className="font-rubik-bold">{item.name}</Text>
                            <Text className="text-gray-500 mt-1">
                              {item.power} W · Default quantity: {item.quantity}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => deleteAppliance(item)}
                            className="bg-red-100 rounded-lg px-3 py-2"
                          >
                            <Text className="text-red-600 font-rubik-bold">
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
              {!createApplianceVisible && !applianceLoading && (
                <TouchableOpacity
                  onPress={() => setCreateApplianceVisible(true)}
                  className="bg-primary-300 rounded-xl py-3 mt-4"
                >
                  <Text className="text-white text-center font-rubik-bold">
                    + Create New Appliance
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setApplianceModalVisible(false)}
                className="bg-gray-200 rounded-xl py-3 mt-4"
              >
                <Text className="text-center font-rubik-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ⚡ Charging Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-4">
          <Text className="font-rubik-bold text-lg mb-3">
            ⚡ Charging Calculation
          </Text>

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
          {solarPanelSize && seriesPanels && mpptEfficiency && battDod
            ? (() => {
                const solarSize = num(solarPanelSize);
                const seriesCount = num(seriesPanels);
                const mpptEffPercent = num(mpptEfficiency);
                const battDODPercent = num(battDod);

                if (
                  !isNaN(solarSize) &&
                  !isNaN(seriesCount) &&
                  !isNaN(mpptEffPercent) &&
                  !isNaN(battDODPercent)
                ) {
                  const mpptEff = mpptEffPercent / 100;
                  const totalSolarPower = solarSize * seriesCount;
                  const battWh =
                    num(batteryNumVoltage) * (num(ah) * num(voltage));
                  const energyToRecharge = battWh * (battDODPercent / 100);
                  const adjustedPower = totalSolarPower * mpptEff;
                  const chargingTime = energyToRecharge / adjustedPower;

                  return (
                    <View className="mt-3 bg-green-100 rounded-2xl p-4 border-l-4 border-green-400">
                      <Text className="font-rubik-bold text-xl p-5">
                        Charging Computation
                      </Text>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Solar Panel Size:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {solarSize} W
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Series Solar Panels:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {seriesCount} pcs
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Total Solar Panels:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {totalSolarPower} W
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          MPPT Efficiency:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {mpptEffPercent}%
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Battery Discharge:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {battDODPercent}%
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Remaining Battery:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {100 - battDODPercent}%
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Energy to Recharge:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {energyToRecharge.toFixed(2)} Wh
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Adjusted for Efficiency:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {adjustedPower.toFixed(2)} W
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Charging Time:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {chargingTime.toFixed(2)} Hrs
                        </Text>
                      </View>
                    </View>
                  );
                }
              })()
            : null}
        </View>

        {/* 💰 Energy Savings Card */}
        <View className="bg-white rounded-2xl p-4 shadow mb-6 items-center">
          <Text className="font-rubik-bold text-lg mb-3">
            💰 Energy Savings Calculation
          </Text>

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
          {existingMonthlyBill && eletricCoopRate
            ? (() => {
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
                      <Text className="font-rubik-bold text-xl p-5 ">
                        Energy Savings Computation
                      </Text>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Existing Monthly Bill:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          ₱{existingBill}
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Electric Coop Rate:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          ₱{coopRate}/kWh
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Monthly Consumption:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {Math.round(monthlyConsumption)} kWh
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Daily Consumption:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {Math.round(dailyConsumptionKwh)} kWh
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Daily Load:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          {Math.round(dailyLoadWatts)} W
                        </Text>
                      </View>

                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-medium text-lg">
                          Solar Monthly Bill:{" "}
                        </Text>
                        <Text className="font-rubik-bold text-xl text-green-600">
                          ₱{solarMonthlyBill.toFixed(2)}
                        </Text>
                      </View>
                      <Text className="font-rubik-medium text-lg mt-5">
                        Estimated Monthly Bill After Solar:{" "}
                      </Text>
                      <View className="flex flex-row justify-between mt-2">
                        <Text className="font-rubik-bold text-xl text-green-600">
                          ₱{estimatedMonthly.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                }
              })()
            : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

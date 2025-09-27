import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import BatteryCalculator from "@/app/batteryCalculator";
import RailingsCalculator from "@/app/railingsCalculator";

export default function ToolsTab() {
  const [activeTab, setActiveTab] = useState<"battery" | "railings">("battery");

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
      >
        {/* Tab Header */}
        <View className="flex-row bg-gray-200 rounded-xl mt-20 p-1">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === "battery" ? "bg-white" : ""
            }`}
            onPress={() => setActiveTab("battery")}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === "battery" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Battery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === "railings" ? "bg-white" : ""
            }`}
            onPress={() => setActiveTab("railings")}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === "railings" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Railings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="mt-4">
          {activeTab === "battery" ? <BatteryCalculator /> : <RailingsCalculator />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

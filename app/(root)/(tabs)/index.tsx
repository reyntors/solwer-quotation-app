import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { format, toZonedTime } from "date-fns-tz";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabRoute = "/estimate" | "/tools" | "/profile" | "/solwerQuotation";

export default function Index() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [avatarError, setAvatarError] = useState(false);

  // Get current time in Philippines
  const zonedDate = toZonedTime(new Date(), "Asia/Manila");
  const hour = parseInt(format(zonedDate, "H"));

  let greeting = "Good evening!";
  if (hour < 12) {
    greeting = "Good morning!";
  } else if (hour < 18) {
    greeting = "Good afternoon!";
  }

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const initialsAvatar = `${
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
  }/avatars/initials?name=${encodeURIComponent(
    user?.name || "User",
  )}&project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;

  const services: {
    title: string;
    desc: string;
    icon: any;
    route: TabRoute;
  }[] = [
    {
      title: "Solar Estimate",
      desc: "Calculate your solar setup costs",
      icon: icons.calculator2,
      route: "/estimate",
    },
    {
      title: "Professional Calculator",
      desc: "Advanced tools for installers",
      icon: icons.settings,
      route: "/tools",
    },
    {
      title: "Quotation Generator",
      desc: "Create professional quotes",
      icon: icons.document,
      route: "/solwerQuotation",
    },
    {
      title: "Account",
      desc: "Manage your profile",
      icon: icons.userShield,
      route: "/profile",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-24"
      >
        {/* Welcome Header */}
        <View className="mt-4 px-1">
          {/* Brand and Actions */}
          <View className="flex-row items-center justify-between">
            {/* SOLWER Branding */}
            <View className="flex-row items-center">
              <Image
                source={require("@/assets/images/logo3.png")}
                className="w-11 h-11"
                resizeMode="contain"
              />

              <View className="ml-2">
                <Text className="text-xl font-rubik-extraBold text-gray-900">
                  SOLWER
                </Text>
                <Text className="text-[10px] font-rubik text-gray-500 tracking-widest">
                  SOLAR POWER SOLUTIONS
                </Text>
              </View>
            </View>

            {/* Notifications */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Notifications, unread"
            >
              <Image
                source={icons.bell}
                className="w-6 h-6"
                resizeMode="contain"
              />
              <View className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            </TouchableOpacity>
          </View>

          {/* Personalized Greeting with Existing Profile Picture */}
          <View className="flex-row items-center mt-7">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/profile")}
              className="mr-2"
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <Image
                source={{
                  uri: avatarError
                    ? initialsAvatar
                    : user?.avatar || initialsAvatar,
                }}
                onError={() => setAvatarError(true)}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            </TouchableOpacity>

            <Text className="text-sm font-rubik text-gray-500">
              Hello, {user?.name || "User"}
            </Text>
          </View>

          <Text className="text-3xl font-rubik-medium text-gray-900 mt-1">
            {greeting}
          </Text>

          <Text className="text-sm text-gray-500 font-rubik mt-1">
            Welcome to your solar energy dashboard.
          </Text>
        </View>

        {/* Hero Section */}
        <View className="bg-blue-600 rounded-2xl p-6 mt-6">
          <Text className="text-white font-rubik-extraBold text-2xl">
            SOLWER, Energizing Your Brighter Future
          </Text>
          <Text className="text-white mt-2 font-rubik">
            Join thousands who&apos;ve switched to clean, affordable solar
            energy. Start your journey today!
          </Text>

          <TouchableOpacity
            className="bg-white mt-4 px-5 py-3 rounded-xl"
            onPress={() => router.replace("/estimate")}
          >
            <Text className="text-black font-rubik-bold text-center">
              Get Free Estimate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Our Services */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-rubik-bold">Our Tools</Text>
            <Text className="text-gray-400">{services.length} Tools</Text>
          </View>

          <View className="flex-row flex-wrap justify-between mt-4">
            {services.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                className="bg-white p-5 rounded-2xl shadow w-[48%] mb-4"
                activeOpacity={0.8}
                onPress={() => router.replace(item.route)}
              >
                <Image
                  source={item.icon}
                  className="w-8 h-8 mb-3"
                  resizeMode="contain"
                />
                <Text className="font-rubik-bold">{item.title}</Text>
                <Text className="text-gray-500 text-sm mt-1 font-rubik">
                  {item.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Why Choose Solar */}
        <Text className="text-xl font-rubik-medium mt-8">
          Why Choose Solar?
        </Text>

        <View className="flex-row justify-between mt-4">
          <View className="bg-white p-4 rounded-2xl shadow w-[30%] items-center">
            <Text className="text-orange-500 font-rubik">🌱</Text>
            <Text className="font-rubik-bold text-xs mt-2">Eco-Friendly</Text>
            <Text className="text-xs text-gray-500 text-center">
              Reduce carbon footprint
            </Text>
          </View>

          <View className="bg-white p-4 rounded-2xl shadow w-[30%] items-center">
            <Text className="text-orange-500 font-rubik-bold">💰</Text>
            <Text className="font-rubik-bold mt-2 text-xs">Save Money</Text>
            <Text className="text-xs text-gray-500 text-center">
              Lower electricity bills
            </Text>
          </View>

          <View className="bg-white p-4 rounded-2xl shadow w-[30%] items-center">
            <Text className="text-orange-500 font-bold">🔒</Text>
            <Text className="font-rubik-bold mt-2 text-xs">Reliable</Text>
            <Text className="text-xs text-gray-500 text-center">
              25-year warranty
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View className="bg-blue-500 rounded-3xl p-6 mt-5 items-center">
          <View className="bg-white/40 rounded-full p-6 mb-5 items-center">
            <Text className="text-orange-500 text-2xl">⚡</Text>
          </View>

          <Text className="text-white text-2xl mb-2 font-rubik-extraBold">
            Ready to Go Solar?
          </Text>

          <Text className="text-white text-center mb-4 font-rubik-medium">
            Join over 1,000+ satisfied customers who&apos;ve made the switch to
            clean energy
          </Text>

          <TouchableOpacity
            className="bg-white px-6 py-3 rounded-xl"
            onPress={() => router.replace("/estimate")}
          >
            <Text className="text-blue-500 font-rubik-bold text-center">
              Start Free Calculation
            </Text>
          </TouchableOpacity>

          <Text className="text-white/60 text-xs mt-4 text-center font-rubik-bold">
            ✓ No commitment • ✓ Instant results • ✓ Expert support
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

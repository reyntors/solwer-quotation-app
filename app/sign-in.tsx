import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import images from "@/constants/images";
import { login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";

const SignIn = () => {
  const { refetch, loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleLogin = async () => {
    const result = await login();
    if (result) {
      refetch();
    } else {
      Alert.alert("Error", "Failed to login");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E0F2FE", "#70a1e9"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="h-full">
          <Image
            source={images.logo}
            className="w-full h-[400px]"
            resizeMode="contain"
          />

          <View className="px-10">
            <Text className="text-base text-center uppercase font-rubik text-black-200 mb-5">
              Welcome to Solwer Solar Power Solutions
            </Text>

            <Text className="text-2xl font-rubik-bold text-black-300 text-center mt-2">
              Calculate solar estimates, access professional tools, and generate
              quotations for your projects
            </Text>

            <Text className="text-lg font-rubik text-black-200 text-center mt-10">
              Let's get started!
            </Text>

            <TouchableOpacity
              onPress={handleLogin}
              className="bg-white shadow-md shadow-zinc-400 rounded-full py-4 mt-5"
            >
              <View className="flex flex-row items-center justify-center">
                <Image
                  source={icons.google}
                  className="w-5 h-5"
                  resizeMode="contain"
                />

                <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>

            <Text className="text-lg font-rubik text-black-100 text-center mt-40">
              Powered by REYNT0RS
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignIn;

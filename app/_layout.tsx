import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer>
        <Drawer.Screen name="railingsCalculator" options={{ title: 'Railings Calculator' }} />
        <Drawer.Screen name="batteryCalculator" options={{ title: 'Battery Calculator' }} />
        <Drawer.Screen name="index" options={{ title: 'Home' }} />

      </Drawer>
      <StatusBar style="auto" />
      
    </ThemeProvider>
    
  );
}

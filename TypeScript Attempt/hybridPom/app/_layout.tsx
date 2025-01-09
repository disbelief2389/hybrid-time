import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font'; // Import useFonts from expo-font
import Timer from '@/components/Timer'; // Import Timer component

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [workDuration, setWorkDuration] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [resumeMode, setResumeMode] = useState('Manual Resume');

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }

    const loadState = async () => {
      const savedWorkDuration = await AsyncStorage.getItem('workDuration');
      const savedIsWorking = await AsyncStorage.getItem('isWorking');
      const savedResumeMode = await AsyncStorage.getItem('resumeMode');
      if (savedWorkDuration) setWorkDuration(parseInt(savedWorkDuration));
      if (savedIsWorking) setIsWorking(savedIsWorking === 'true');
      if (savedResumeMode) setResumeMode(savedResumeMode);
    };

    loadState();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Save timer state to AsyncStorage
        await AsyncStorage.setItem('workDuration', workDuration.toString());
        await AsyncStorage.setItem('isWorking', isWorking.toString());
        await AsyncStorage.setItem('resumeMode', resumeMode);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [fontsLoaded, workDuration, isWorking, resumeMode]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <View>
        <Text>Some text</Text>
      </View>
      <Timer /> {/* Add Timer component here */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

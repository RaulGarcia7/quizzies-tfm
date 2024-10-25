import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from 'expo-font';
import { Navigation, AuthProvider } from './Navigation';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Zain-Regular': require('./assets/Fonts/Zain-Regular.ttf'),
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        
        if (fontsLoaded) {
          await SplashScreen.hideAsync(); 
        }
      } catch (error) {
        console.error("Error durante la preparación de la app", error);
      }
    };
    
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <AuthProvider> 
      <SafeAreaView style={styles.container}>
        <Navigation /> 
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


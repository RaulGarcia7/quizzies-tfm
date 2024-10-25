import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const soundObject = new Audio.Sound();

// Obtenemos la configuración desde AsyncStorage (settings)
const getSoundSettings = async () => {
  try {
    const soundEnabled = JSON.parse(await AsyncStorage.getItem('soundEnabled')) ?? true;
    return soundEnabled;
  } catch (error) {
    console.error('Error getting sound settings:', error);
    return true; 
  }
};

export const playSound = async (soundFile) => {
  const soundEnabled = await getSoundSettings();

  if (!soundEnabled) {
    return; 
  }

  try {
    await soundObject.loadAsync(soundFile);
    await soundObject.playAsync();
    
    // Liberar recursos después de la reproducción
    soundObject.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        soundObject.unloadAsync(); // Quita el sonido despues de reproducir
      }
    });
  } catch (error) {
    console.error("Error loading or playing sound:", error);
  }
};

export const setSoundEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem('soundEnabled', JSON.stringify(enabled));
  } catch (error) {
    console.error('Error setting sound settings:', error);
  }
};

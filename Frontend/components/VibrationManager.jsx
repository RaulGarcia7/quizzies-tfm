import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getVibrationSettings = async () => {
  try {
    const vibrationEnabled = JSON.parse(await AsyncStorage.getItem('vibrationEnabled')) ?? true;
    return vibrationEnabled;
  } catch (error) {
    console.error('Error getting vibration settings:', error);
    return true;
  }
};

export const vibrate = async (duration = 50) => {
  const vibrationEnabled = await getVibrationSettings();
  
  if (vibrationEnabled) {
    Vibration.vibrate(duration);
  }
};

export const setVibrationEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(enabled));
  } catch (error) {
    console.error('Error setting vibration settings:', error);
  }
};
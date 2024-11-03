import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSoundEnabled } from './SoundManager';
import { setVibrationEnabled } from './VibrationManager';
import { AuthContext } from '../Navigation';

const Settings = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSoundEnabled = JSON.parse(await AsyncStorage.getItem('soundEnabled'));
        setSoundEnabledState(storedSoundEnabled ?? true);

        const storedVibrationEnabled = JSON.parse(await AsyncStorage.getItem('vibrationEnabled'));
        setVibrationEnabledState(storedVibrationEnabled ?? true);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabledState(newValue);
    await setSoundEnabled(newValue);
  };

  const toggleVibration = async () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabledState(newValue);
    await setVibrationEnabled(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.option}>
        <Text style={styles.optionText}>Sound</Text>
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>Vibration</Text>
        <Switch
          value={vibrationEnabled}
          onValueChange={toggleVibration}
        />
      </View>

      <TouchableOpacity style={styles.link} onPress={handleLogout}>
        <Text style={styles.linkText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>App Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#CDF6FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#083142',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  optionText: {
    fontSize: 18,
  },
  link: {
    marginVertical: 10,
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
  },
  version: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default Settings;
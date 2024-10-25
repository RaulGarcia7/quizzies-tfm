import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const Store = () => {
  const handlePurchasePremium = () => {
    Alert.alert('Compra Premium', 'Funcionalidad no implementada');
  };

  const handleWatchAd = () => {
    Alert.alert('Ver Video', 'Funcionalidad no implementada');
  };

  const userStatus = 'Standard';

  return (
    <View style={styles.container}>
      <Text style={styles.userInfo}>Status: {userStatus}</Text>

      <TouchableOpacity style={styles.premiumButton} onPress={handlePurchasePremium}>
        <Text style={styles.premiumButtonText}>Purchase Premium - No Ads</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.watchAdButton} onPress={handleWatchAd}>
        <Text style={styles.watchAdButtonText}>Watch a video to get temporary premium status!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#89e3f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userInfo: {
    fontSize: 22,
    color: '#083142',
    fontWeight: 'bold',
    fontFamily: 'Zain-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: '#d2b16c',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  premiumButtonText: {
    fontSize: 22,
    color: '#083142',
    fontFamily: 'Zain-Regular',
    textAlign: 'center',
  },
  watchAdButton: {
    backgroundColor: '#B4EFF5',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderColor: '#d2b16c',
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  watchAdButtonText: {
    fontSize: 22,
    color: '#083142',
    fontFamily: 'Zain-Regular',
    textAlign: 'center',
  },
});

export default Store;
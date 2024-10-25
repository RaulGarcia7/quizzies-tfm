import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { createButtonHandler } from './ButtonHandler';

const Home = ({ navigation }) => {
  
  const handlePress = async (screenName) => {
    await createButtonHandler();
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/Images/Quizzies_logo_completo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />

      {['Play', 'Practice', 'Settings'].map((screenName) => (
        <TouchableOpacity
          key={screenName}
          style={styles.homeButton}
          onPress={() => handlePress(screenName)}
        >
          <Text style={styles.homeButtonText}>{screenName}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#89e3f7',
    padding: 20,
  },
  logo: {
    width: 400, 
    height: 300, 
  },
  homeButton: {
    backgroundColor: '#B4EFF5',
    borderColor: '#d2b16c',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  homeButtonText: {
    fontSize: 24,
    color: '#083142',
    fontFamily: 'Zain-Regular',
  },
});

export default Home;

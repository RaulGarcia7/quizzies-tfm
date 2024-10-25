import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Modal } from 'react-native';
import { AuthContext } from '../Navigation';

const API_URL = 'url_login';

let username = '';

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchLogin = async () => {
    setModalMessage('');

    if (!email || !password) {
      setModalMessage('Todos los campos son obligatorios');
      setModalVisible(true);
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el inicio de sesión');
      }

      const data = await response.json();
      console.log("Se ha iniciado sesion");

      username = data.username;
      login();
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      setModalMessage(error.message);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/Images/Quizzies_logo_completo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#555555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.homeButton} onPress={fetchLogin}>
        <Text style={styles.homeButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.homeButtonText}>Registrar</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  input: {
    height: 50,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 0,
    elevation: 2, 
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeModalText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export const getUsername = () => username;
export default Login;
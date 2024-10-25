import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Modal } from 'react-native';

const API_URL = 'url_registro';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const fetchRegister = async () => {
    setModalMessage('');

    if (!username || !email || !password) {
      setModalMessage('Todos los campos son obligatorios');
      setModalVisible(true);
      return;
    }

    if (!validateEmail(email)) {
      setModalMessage('Por favor, introduce un correo electrónico válido');
      setModalVisible(true);
      return;
    }

    if (!validatePassword(password)) {
      setModalMessage('La contraseña debe tener al menos 8 caracteres');
      setModalVisible(true);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el registro');
      }

      setModalMessage('Registro exitoso, puedes iniciar sesión');
      setModalVisible(true);
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 4000);
      
    } catch (error) {
      console.error('Error en el registro:', error);
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
        placeholder="Username"
        placeholderTextColor="#555555"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={fetchRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Ir a inicio de sesión</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
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
  button: {
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
  buttonText: {
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

export default Register;
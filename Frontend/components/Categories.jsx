import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { createButtonHandler } from './ButtonHandler';
import { getUsername } from './Login';

const API_URL = 'url_no_disponible';

const Categories = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const username = getUsername();

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error fetching categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={async () => {
        await createButtonHandler();
        setSelectedCategory(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleSendSuggestion = async () => {
    if (categoryName && categoryDescription) {
      try {
        const response = await fetch('https://quizzies-backend-v-git-main-ragnar9907-gmailcoms-projects.vercel.app/suggestcategory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryName,
            categoryDescription,
            username: username,
          }),
        });

        if (!response.ok) {
          throw new Error('Error enviando la sugerencia');
        }

        Alert.alert('Sugerencia Enviada', 'Hemos recibido tu sugerencia ¡Muchas gracias!');
        setCategoryName('');
        setCategoryDescription('');
        setSuggestionModalVisible(false);
      } catch (error) {
        console.error('Error enviando la sugerencia:', error);
        Alert.alert('Error', 'Hubo un problema al enviar tu sugerencia. Inténtalo de nuevo más tarde.');
      }
    } else {
        Alert.alert('Error', 'Por favor, completa el formulario para enviar');
      }
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#d2b16c" />
        </View>
      ) : (
        <>
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
          <Text style={styles.comingSoonText}>More coming soon</Text>

          <TouchableOpacity 
            style={styles.suggestionButton} 
            onPress={async () =>{
              await createButtonHandler();
              setSuggestionModalVisible(true)
            }}
          >
            <Text style={styles.suggestionButtonText}>¿Any suggestions? Send us your category!</Text>
          </TouchableOpacity>

          {/* Modal detalles de categoría */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setSelectedCategory(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {selectedCategory ? (
                  <>
                    <Text style={styles.modalTitle}>{selectedCategory.name}</Text>
                    <Text style={styles.modalDescription}>{selectedCategory.description}</Text>
                    <Text style={styles.modalAuthor}>Author: {selectedCategory.author}</Text>
                    <TouchableOpacity style={styles.sendButton} onPress={() => setModalVisible(false)}>
                      <Text style={[styles.closeModalText, { marginTop: 0}]}>Close</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text>No category selected</Text>
                )}
              </View>
            </View>
          </Modal>

          {/* Modal sugerencias de categoría */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={suggestionModalVisible}
            onRequestClose={() => setSuggestionModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Suggest a Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Category Name"
                  placeholderTextColor="#7a7a7a"
                  keyboardType="default"
                  value={categoryName}
                  onChangeText={setCategoryName}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Category Description"
                  placeholderTextColor="#7a7a7a"
                  keyboardType="default"
                  value={categoryDescription}
                  onChangeText={setCategoryDescription}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendSuggestion}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSuggestionModalVisible(false)}>
                  <Text style={styles.closeModalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#89e3f7',
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  categoryCard: {
    flex: 1,
    margin: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#B4EFF5',
    borderColor: '#d2b16c',
    borderWidth: 2,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  categoryText: {
    fontSize: 23,
    color: '#083142',
    fontFamily: 'Zain-Regular',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  comingSoonText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Zain-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 6,
  },
  suggestionButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#B4EFF5',
    borderRadius: 10,
    borderColor: '#d2b16c',
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  suggestionButtonText: {
    fontSize: 18,
    color: '#083142',
    fontWeight: 'bold',
    fontFamily: 'Zain-Regular',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Zain-Regular',
    color: '#083142',
  },
  modalDescription: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Zain-Regular',
    color: '#000',
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Zain-Regular',
    color: '#000',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#d2b16c',
    borderRadius: 10,
    marginBottom: 15,
    fontFamily: 'Zain-Regular',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#B4EFF5',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderColor: '#d2b16c',
    borderWidth: 1,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonText: {
    color: '#083142',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Zain-Regular',
  },
  closeModalText: {
    marginTop: 15,
    color: '#083142',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Zain-Regular',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Categories;
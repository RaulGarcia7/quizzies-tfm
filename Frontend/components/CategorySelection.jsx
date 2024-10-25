import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const CategorySelection = ({ categories, onSelectCategory }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [categories]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona una Categoría</Text>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#89e3f7" />
        </View>
      ) : (
        categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryButton}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={styles.categoryButtonText}>{category}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#89e3f7',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Zain-Regular',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#89e3f7',
    width: '100%',
    height: '100%',
  },
  categoryButton: {
    backgroundColor: '#B4EFF5',
    borderColor: '#d2b16c',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 18,
    color: '#083142',
    fontFamily: 'Zain-Regular',
  },
});

export default CategorySelection;
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, ActivityIndicator, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'url_preguntas';

const Practice = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [feedbackColor, setFeedbackColor] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error fetching questions');
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setCurrentQuestion(getRandomQuestion);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(); 
  }, []);

  const getRandomQuestion = useCallback(() => {
    const remainingQuestions = questions.filter(q => !usedQuestions.includes(q));

    if (remainingQuestions.length === 0) {
      setUsedQuestions([]);
      setCurrentQuestion(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];

    setCurrentQuestion(selectedQuestion);
    setUsedQuestions([...usedQuestions, selectedQuestion]);
  }, [questions, usedQuestions]);

  useEffect(() => {
    if (!currentQuestion && questions.length > 0) {
      getRandomQuestion();
    }
  }, [currentQuestion, getRandomQuestion, questions]);

  const loadVibrationSettings = async () => {
    try {
      const storedVibrationEnabled = JSON.parse(await AsyncStorage.getItem('vibrationEnabled'));
      setVibrationEnabled(storedVibrationEnabled ?? true);
    } catch (error) {
      console.error('Error loading vibration settings:', error);
    }
  };

  useEffect(() => {
    loadVibrationSettings();
  }, []);

  const triggerFeedbackAnimation = useCallback((type) => {
    Animated.timing(feedbackColor, {
      toValue: type === 'correct' ? 1 : -1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(feedbackColor, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
  }, [feedbackColor]);

  const handleAnswer = useCallback((option) => {
    if (option === currentQuestion.answer) {
      setStreak(streak + 1);
      setHighScore(Math.max(streak + 1, highScore));
      triggerFeedbackAnimation('correct');
    } else {
      setStreak(0);
      triggerFeedbackAnimation('incorrect');
      if (vibrationEnabled) {
        Vibration.vibrate(50);
      }
    }
    getRandomQuestion();
  }, [currentQuestion, streak, highScore, getRandomQuestion, triggerFeedbackAnimation]);

  const backgroundColor = feedbackColor.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#ff4c4c', '#89e3f7', '#1EE3FD'],
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#89e3f7" />
      </View>
    );
  }

  if (!currentQuestion) {
    return <View style={styles.container}><Text>No hay preguntas disponibles.</Text></View>; //
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={40} color="#FF4500" style={styles.fireIcon} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options ? (
          currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.optionButtonText}>{option}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>Cargando opciones...</Text>
        )}
        <Text style={styles.highScore}>Racha Máxima: {highScore}</Text>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#89e3f7',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B4EFF5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fireIcon: {
    marginRight: 10,
  },
  streakText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black', 
    fontFamily: 'Zain-Regular', 
  },
  questionText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Zain-Regular', 
  },
  optionButton: {
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
  optionButtonText: {
    fontSize: 18,
    color: '#083142',
    fontFamily: 'Zain-Regular', 
  },
  highScore: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    fontFamily: 'Zain-Regular', 
  },
});

export default Practice;

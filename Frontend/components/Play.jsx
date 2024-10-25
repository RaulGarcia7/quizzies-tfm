import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, } from 'react-native';
import CategorySelection from './CategorySelection';
import { getUsername } from './Login';

const API_URL = 'url_questions';
const API_URL_userPoints = 'getPoints'
const API_URL_updatePoints = 'url_update'

const Play = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [feedbackColor, setFeedbackColor] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null); 
  const [progress, setProgress] = useState(Array(5).fill(null));
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0);
  const [isPointsUpdated, setIsPointsUpdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const totalScoreRef = useRef(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finalSummary, setFinalSummary] = useState(null)
  const username = getUsername();


  const fetchQuestions = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error fetching questions');
      }
      const data = await response.json();
      setQuestions(data);

      const uniqueCategories = [...new Set(data.map(question => question.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await fetch(API_URL_userPoints);
      if (!response.ok) {
        throw new Error('Error fetching user points');
      }
      const data = await response.json();
      setCurrentPoints(data.knowledge_points);
      console.log(data.knowledge_points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchUserPoints();
  }, []);

  const getRandomQuestion = useCallback(() => {
    const filteredQuestions = questions.filter(q => q.category === selectedCategory);
    const remainingQuestions = filteredQuestions.filter(q => !usedQuestions.includes(q));

    if (remainingQuestions.length === 0 || questionCount >= 5) {
      setCurrentQuestion(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];

    setCurrentQuestion(selectedQuestion);
    setUsedQuestions(prev => [...prev, selectedQuestion]);
    setTimeLeft(10); 
    setOptionsDisabled(false); 
    setFeedbackMessage(null); 
  }, [selectedCategory, usedQuestions, questionCount, questions]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(null); 
    }
  }, [timeLeft]);

  useEffect(() => {
    if (currentQuestion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timerRef.current);
      };
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (selectedCategory && !currentQuestion && usedQuestions.length === 0) {
      getRandomQuestion();
    }
  }, [selectedCategory, currentQuestion, usedQuestions, getRandomQuestion]);

  const handleAnswer = useCallback((option) => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }

  setOptionsDisabled(true);

  let updatedProgress = [...progress];
  let pointsForThisQuestion = 0;

//gestion para respuestas correctas e incorrectas
  if (option === currentQuestion?.answer) {
    setFeedbackColor('#1EE3FD');
    updatedProgress[questionCount] = true;
    setFeedbackMessage(null);
    pointsForThisQuestion = 10;
    setCorrectAnswers(prev => prev + 1);
  } else {
    setFeedbackColor('#ff4c4c');
    updatedProgress[questionCount] = false;
    setFeedbackMessage(`Respuesta correcta: ${currentQuestion?.answer}`);
    pointsForThisQuestion = -15;
  }

  // Sumar los puntos de pregunta
  setTotalScore(prevScore => {
    const newScore = prevScore + pointsForThisQuestion;
    totalScoreRef.current = newScore;  
    console.log('Nuevo total de puntos después de esta pregunta:', newScore);
    return newScore;
  });

  setProgress(updatedProgress);
  setQuestionCount(prev => prev + 1);

  if (questionCount < 4) {
    setTimeout(() => {
      setFeedbackColor(null);
      getRandomQuestion();
    }, 2500);
  } else {
    setFeedbackColor(null);
    setCurrentQuestion(null);

    setTimeout(() => {
      if (!isPointsUpdated) {
        setIsPointsUpdated(true);
        updateUserPoints();  
      }
      setFinalSummary({
          correctAnswers: correctAnswers + (option === currentQuestion?.answer ? 1 : 0),
          totalScore: totalScoreRef.current
      });
    }, 2500);
  }
}, [currentQuestion, questionCount, progress, getRandomQuestion, isPointsUpdated]);

  useEffect(() => {
    if (finalSummary) {
      const timer = setTimeout(() => {
        navigation.navigate('Home'); 
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [finalSummary, navigation]);

  if (!selectedCategory) {
    return <CategorySelection categories={categories} onSelectCategory={setSelectedCategory} />;
  }

  if (finalSummary) {
  return (
    <View style={[styles.container, { backgroundColor: '#89e3f7', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={styles.finalHeadingMessage}>
        {finalSummary.totalScore > 2 ? '¡Enhorabuena!' : 'Hay que practicar más...'}
      </Text>
      <Text style={styles.finalMessage}>Preguntas correctas: {finalSummary.correctAnswers}/5</Text>
      <Text style={styles.finalMessage}>Puntos finales: {finalSummary.totalScore}</Text>
    </View>
  );
}


  const updateUserPoints = async () => {
    try {

      console.log('Puntos totales de la partida:', totalScoreRef.current);
      console.log('Puntos de la base de datos: ', currentPoints)

      const newPoints = currentPoints + totalScoreRef.current;
      const finalPoints = Math.max(newPoints, 0);
      console.log('Puntos totales tras partida:', finalPoints);

      await fetch(API_URL_updatePoints, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          newPoints: finalPoints,
        }),
      });

      console.log('Puntos actualizados con éxito.');
    } catch (error) {
      console.error('Error actualizando los puntos:', error);
    }
  };

  const showTimer = currentQuestion && questionCount < 5;
  const timerWidth = timeLeft === 0 ? '0%' : `${(timeLeft / 10) * 100}%`;

  return (
    <View style={[styles.container, { backgroundColor: feedbackColor || '#89e3f7' }]}>
      <View style={styles.progressContainer}>
        {progress.map((result, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              result === null ? styles.dotUnanswered : result ? styles.dotCorrect : styles.dotIncorrect,
            ]}
          />
        ))}
      </View>
      {showTimer && (
        <View style={styles.timerContainer}>
          <Animated.View style={[styles.timerBar, { width: timerWidth }]} />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {currentQuestion ? (
          <>
            {feedbackMessage && (
              <Text style={styles.feedbackMessage}>{feedbackMessage}</Text>
            )}

            {currentQuestion.image && (
              <Image 
                source={{ uri: currentQuestion.image }} 
                style={styles.questionImage} 
              />
            )}

            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, optionsDisabled && styles.optionButtonDisabled]}
                onPress={() => !optionsDisabled && handleAnswer(option)}
                disabled={optionsDisabled}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={styles.finalMessage}>¡Se acabó!</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Zain-Regular',
  },
  feedbackMessage: {
    fontSize: 21,
    color: 'black',
    marginBottom: 10,
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
  optionButtonDisabled: {
    backgroundColor: '#A0A0A0', 
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  dotUnanswered: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1,
  },
  dotCorrect: {
    backgroundColor: '#35C5D4',
  },
  dotIncorrect: {
    backgroundColor: '#ff6347',
  },
  timerContainer: {
    height: 10,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 20,
    alignSelf: 'center',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#ff6347',
    borderRadius: 5,
  },
  finalMessage: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Zain-Regular',
    color: '#083142',
  },
  finalHeadingMessage: {
    fontSize: 30, 
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Zain-Regular',
    color: '#d2b16c',
  },
  questionImage: {
    width: 250,
    height: 250,
    marginBottom: 10,
    resizeMode: 'contain',
  }
});

export default Play;
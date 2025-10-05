import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { createShadow, createTextShadow } from '@/lib/platform-styles';
import {
  Quiz,
  Question,
  QuizAnswerRequest,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
  planetsService,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface QuizModalProps {
  visible: boolean;
  quiz: Quiz | null;
  onClose: () => void;
  onComplete: (result: QuizSubmissionResponse) => void;
}

interface SelectedAnswers {
  [questionId: number]: 'A' | 'B' | 'C' | 'D';
}

interface QuestionTimings {
  [questionId: number]: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  visible,
  quiz,
  onClose,
  onComplete,
}) => {
  const { backendUserId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [questionTimings, setQuestionTimings] = useState<QuestionTimings>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);


  // Animation values
  const slideAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    if (visible && quiz && backendUserId) {
      startQuiz();
    }
  }, [visible, quiz, backendUserId]);

  useEffect(() => {
    if (visible) {
      slideAnim.value = withSpring(1);
      progressAnim.value = 0;
    } else {
      slideAnim.value = withSpring(0);
    }
  }, [visible]);

  useEffect(() => {
    // Update progress animation
    const progress = questions.length > 0 ? currentQuestionIndex / questions.length : 0;
    progressAnim.value = withSpring(progress);
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    // Start timing for current question
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, questions]);

  const startQuiz = async () => {
    if (!quiz || !backendUserId) return;

    try {
      setLoading(true);
      console.log('Starting quiz:', { quizId: quiz.id, backendUserId });
      const response = await planetsService.startQuiz(quiz.id, backendUserId);
      
      console.log('Start quiz response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('Quiz started successfully, questions count:', response.data.questions.length);
        setQuestions(response.data.questions);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuestionTimings({});
      } else {
        console.error('Quiz start failed:', response);
        Alert.alert('Error', 'Failed to start quiz');
        onClose();
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert('Error', 'Failed to start quiz');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: 'A' | 'B' | 'C' | 'D') => {
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    setQuestionTimings(prev => ({
      ...prev,
      [questionId]: responseTime,
    }));

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !backendUserId || Object.keys(selectedAnswers).length !== questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);

      const answers: QuizAnswerRequest[] = questions.map(question => ({
        question_id: question.id,
        selected_answer: selectedAnswers[question.id],
        response_time_seconds: questionTimings[question.id],
      }));

      const submission: QuizSubmissionRequest = {
        quiz_id: quiz.id,
        answers,
      };

      const response = await planetsService.submitQuiz(submission, backendUserId);

      if (response.success && response.data) {
        onComplete(response.data);
        // Don't auto-close - let parent handle the flow
      } else {
        Alert.alert('Error', 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canSubmit = Object.keys(selectedAnswers).length === questions.length;

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - slideAnim.value) * height },
      { scale: 0.9 + slideAnim.value * 0.1 },
    ],
    opacity: slideAnim.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <LinearGradient colors={['#0f0f23', '#1a1a2e']} style={styles.loadingBackground}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Starting Quiz...</Text>
          </LinearGradient>
        </View>
      </Modal>
    );
  }



  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
          <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.quizTitle}>{quiz?.title}</Text>
              <Text style={styles.questionCounter}>
                {currentQuestionIndex + 1} / {questions.length}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
            </View>

            {/* Question Content */}
            {currentQuestion && (
              <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

                <View style={styles.optionsContainer}>
                  {[
                    { key: 'A' as const, text: currentQuestion.option_a },
                    { key: 'B' as const, text: currentQuestion.option_b },
                    { key: 'C' as const, text: currentQuestion.option_c },
                    { key: 'D' as const, text: currentQuestion.option_d },
                  ].map((option) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOption,
                        ]}
                        onPress={() => handleAnswerSelect(currentQuestion.id, option.key)}
                        disabled={selectedAnswers[currentQuestion.id] !== undefined}
                      >
                        <LinearGradient
                          colors={
                            isSelected
                              ? ['#8B5CF6', '#6D28D9']
                              : ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']
                          }
                          style={styles.optionGradient}
                        >
                          <Text style={styles.optionLetter}>{option.key}</Text>
                          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                            {option.text}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <View style={styles.navSpacer} />

              {!isLastQuestion ? (
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    selectedAnswers[currentQuestion?.id] && styles.navButtonActive,
                  ]}
                  onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={!selectedAnswers[currentQuestion?.id]}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    canSubmit && styles.submitButtonActive,
                  ]}
                  onPress={handleSubmitQuiz}
                  disabled={!canSubmit || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Quiz</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    height: height * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBackground: {
    width: 200,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  questionCounter: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 2,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    marginBottom: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 30,
    textAlign: 'center',
    ...createTextShadow({
      color: '#000',
      opacity: 0.5,
      radius: 3,
      offsetY: 1,
    }),
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    borderRadius: 15,
    overflow: 'hidden',
    ...createShadow({
      color: '#8B5CF6',
      opacity: 0.2,
      radius: 10,
      offsetY: 2,
      elevation: 5,
    }),
  },
  selectedOption: {
    ...createShadow({
      color: '#8B5CF6',
      opacity: 0.6,
      radius: 15,
      offsetY: 4,
      elevation: 8,
    }),
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 70,
  },
  optionLetter: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  navSpacer: {
    flex: 1,
  },
  navButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    minWidth: 100,
  },
  navButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    minWidth: 120,
  },
  submitButtonActive: {
    backgroundColor: '#10B981',
    ...createShadow({
      color: '#10B981',
      opacity: 0.4,
      radius: 10,
      offsetY: 3,
      elevation: 6,
    }),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 
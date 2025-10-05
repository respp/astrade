import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { createShadow, createTextShadow } from '@/lib/platform-styles';
import { QuizSubmissionResponse } from '@/lib/api';

const { width, height } = Dimensions.get('window');

interface QuizResultsModalProps {
  visible: boolean;
  results: QuizSubmissionResponse | null;
  onClose: () => void;
  onRetake?: () => void;
}

export const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  visible,
  results,
  onClose,
  onRetake,
}) => {
  // Animation values
  const slideAnim = useSharedValue(0);
  const scoreAnim = useSharedValue(0);
  const celebrationAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      slideAnim.value = withSpring(1, { damping: 15 });
      scoreAnim.value = withDelay(300, withSpring(1, { damping: 12 }));
      
      // Celebration animation for good scores
      if (results && results.completion_percentage >= 80) {
        celebrationAnim.value = withSequence(
          withDelay(800, withSpring(1.2, { damping: 10 })),
          withSpring(1, { damping: 15 })
        );
      }
    } else {
      slideAnim.value = withSpring(0);
      scoreAnim.value = 0;
      celebrationAnim.value = 0;
    }
  }, [visible, results]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#FBBF24'; // Yellow
    return '#F43F5E'; // Red
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return '🎉 Excellent!';
    if (percentage >= 80) return '🌟 Great Job!';
    if (percentage >= 70) return '👍 Good Work!';
    if (percentage >= 60) return '📚 Keep Learning!';
    return '💪 Try Again!';
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📖';
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - slideAnim.value) * height },
      { scale: 0.9 + slideAnim.value * 0.1 },
    ],
    opacity: slideAnim.value,
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scoreAnim.value * celebrationAnim.value },
    ],
    opacity: scoreAnim.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scoreAnim.value,
      [0, 1],
      [0, results ? results.completion_percentage / 100 : 0]
    );
    return {
      width: `${progress * 100}%`,
    };
  });

  // Early return after all hooks are declared
  if (!results) return null;

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
              <Text style={styles.title}>Quiz Results</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Score Section */}
              <Animated.View style={[styles.scoreSection, scoreAnimatedStyle]}>
                <Text style={styles.scoreEmoji}>{getScoreEmoji(results.completion_percentage)}</Text>
                <Text style={[styles.scoreMessage, { color: getScoreColor(results.completion_percentage) }]}>
                  {getScoreMessage(results.completion_percentage)}
                </Text>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>
                    {results.score} / {results.total_questions}
                  </Text>
                  <Text style={[styles.percentageText, { color: getScoreColor(results.completion_percentage) }]}>
                    {Math.round(results.completion_percentage)}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <Animated.View 
                      style={[
                        styles.progressBar, 
                        progressAnimatedStyle,
                        { backgroundColor: getScoreColor(results.completion_percentage) }
                      ]} 
                    />
                  </View>
                </View>

                {/* Achievement Badges */}
                <View style={styles.achievementsContainer}>
                  {results.is_new_best && (
                    <View style={[styles.achievementBadge, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.achievementText}>🏆 New Best!</Text>
                    </View>
                  )}
                  {results.completion_percentage === 100 && (
                    <View style={[styles.achievementBadge, { backgroundColor: '#8B5CF6' }]}>
                      <Text style={styles.achievementText}>⭐ Perfect Score!</Text>
                    </View>
                  )}
                  {results.completion_percentage >= 80 && (
                    <View style={[styles.achievementBadge, { backgroundColor: '#FBBF24' }]}>
                      <Text style={styles.achievementText}>🌟 High Score!</Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Statistics */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results.score}</Text>
                    <Text style={styles.statLabel}>Correct</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results.total_questions - results.score}</Text>
                    <Text style={styles.statLabel}>Incorrect</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results.previous_best_score}</Text>
                    <Text style={styles.statLabel}>Previous Best</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: getScoreColor(results.completion_percentage) }]}>
                      {Math.round(results.completion_percentage)}%
                    </Text>
                    <Text style={styles.statLabel}>Score</Text>
                  </View>
                </View>
              </View>

              {/* Detailed Results */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Question Details</Text>
                {results.answers.map((answer, index) => (
                  <View key={answer.question_id} style={styles.answerItem}>
                    <View style={styles.answerHeader}>
                      <Text style={styles.questionNumber}>Q{index + 1}</Text>
                      <View style={[
                        styles.answerStatus,
                        { backgroundColor: answer.is_correct ? '#10B981' : '#F43F5E' }
                      ]}>
                        <Text style={styles.answerStatusText}>
                          {answer.is_correct ? '✓' : '✗'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.answerDetails}>
                      <Text style={styles.answerText}>
                        Your answer: <Text style={styles.answerChoice}>{answer.selected_answer}</Text>
                      </Text>
                      {!answer.is_correct && (
                        <Text style={styles.correctAnswerText}>
                          Correct answer: <Text style={styles.correctChoice}>{answer.correct_answer}</Text>
                        </Text>
                      )}
                      {answer.explanation && (
                        <Text style={styles.explanationText}>{answer.explanation}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {onRetake && results.completion_percentage < 100 && (
                <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
                  <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>🔄 Retake Quiz</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                <LinearGradient 
                  colors={results.completion_percentage >= 70 ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']} 
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {results.completion_percentage >= 70 ? '🚀 Continue Learning' : '📚 Keep Studying'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
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
    height: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 20,
    ...createShadow({
      color: '#8B5CF6',
      opacity: 0.1,
      radius: 10,
      offsetY: 2,
      elevation: 5,
    }),
  },
  scoreEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    ...createTextShadow({
      color: '#000',
      opacity: 0.3,
      radius: 3,
      offsetY: 1,
    }),
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  achievementBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    ...createShadow({
      color: '#000',
      opacity: 0.2,
      radius: 5,
      offsetY: 2,
      elevation: 3,
    }),
  },
  achievementText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 20,
  },
  answerItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  questionNumber: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerDetails: {
    gap: 5,
  },
  answerText: {
    color: '#fff',
    fontSize: 14,
  },
  answerChoice: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  correctAnswerText: {
    color: '#10B981',
    fontSize: 14,
  },
  correctChoice: {
    fontWeight: 'bold',
  },
  explanationText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 5,
  },
  actionContainer: {
    gap: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  retakeButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  continueButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
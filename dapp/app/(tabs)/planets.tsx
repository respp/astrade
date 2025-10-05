import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate, runOnJS } from 'react-native-reanimated';
import Svg, { Circle, G, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { FlatList as GestureFlatList } from 'react-native-gesture-handler';
import { createShadow, createTextShadow, shadowPresets } from '@/lib/platform-styles';
import { 
  planetsService, 
  PlanetWithProgress, 
  QuizWithProgress, 
  Quiz,
  QuizSubmissionResponse,
  UserProgressOverview 
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { QuizModal } from '@/components/QuizModal';
import { QuizResultsModal } from '@/components/QuizResultsModal';
// import LottieView from 'lottie-react-native'; // Uncomment if you add a Lottie asset

const { width } = Dimensions.get('window');
// Replace PLANET_RADIUS and PLANET_POSITIONS for more 3D effect
const PLANET_RADIUS = 48;
const ORBIT_CENTER = { x: width / 2, y: 160 };
const ORBIT_RX = 150;
const ORBIT_RY = 70; // vertical squish for 3D
const PLANET_DEPTHS = [0.5, 0.75, 1.2, 0.75, 0.5]; // Z-depth for 5 planets
const PLANET_ANGLES = [-90, -45, 0, 45, 90]; // degrees around the orbit

// Removed hardcoded planets - now fetched from backend

function StarryBackground() {
  // Simple animated stars using opacity
  const stars: { x: number; y: number; r: number; delay: number; key: number }[] = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * 300 + 10,
    r: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 1000,
    key: i,
  }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={320}>
        {stars.map(star => (
          <AnimatedStar {...star} key={star.key} />
        ))}
      </Svg>
    </View>
  );
}

interface AnimatedStarProps {
  x: number;
  y: number;
  r: number;
  delay: number;
}
function AnimatedStar({ x, y, r, delay }: AnimatedStarProps) {
  const opacity = useSharedValue(0.5);
  React.useEffect(() => {
    opacity.value = interpolate(
      delay,
      [0, 1000],
      [0.5, 1],
      Extrapolate.CLAMP
    );
  }, [delay]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>
      <Svg width={r * 2} height={r * 2}>
        <Circle cx={r} cy={r} r={r} fill="#fff" />
      </Svg>
    </Animated.View>
  );
}

// 3D Planet component (legacy - not currently used)
interface Planet3DProps {
  planet: PlanetWithProgress;
  idx: number;
  selectedIdx: number;
  prevSelectedIdx: number;
  animValue: Animated.SharedValue<number>;
  onPress: () => void;
}
function Planet3D({ planet, idx, selectedIdx, prevSelectedIdx, animValue, onPress }: Planet3DProps) {
  // Animate position, scale, blur, and opacity for 3D effect
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position and depth
    let angle = PLANET_ANGLES[idx];
    let depth = PLANET_DEPTHS[idx];
    if (idx === selectedIdx) {
      angle = interpolate(animValue.value, [0, 1], [PLANET_ANGLES[idx], 0]);
      depth = interpolate(animValue.value, [0, 1], [PLANET_DEPTHS[idx], 1.4]);
    } else if (idx === prevSelectedIdx) {
      angle = interpolate(animValue.value, [0, 1], [0, PLANET_ANGLES[idx]]);
      depth = interpolate(animValue.value, [0, 1], [1.4, PLANET_DEPTHS[idx]]);
    }
    const rad = (angle * Math.PI) / 180;
    const x = ORBIT_CENTER.x + ORBIT_RX * Math.sin(rad) - PLANET_RADIUS;
    const y = ORBIT_CENTER.y + ORBIT_RY * Math.cos(rad) - PLANET_RADIUS;
    // Scale and blur for depth
    const scale = depth;
    const opacity = depth < 1 ? 0.5 + 0.5 * depth : 1;
    const blur = depth < 1 ? (1 - depth) * 8 : 0;
    return {
      position: 'absolute',
      left: x,
      top: y,
      transform: [{ scale }],
      opacity,
      zIndex: Math.round(depth * 10),
    };
  });
  // Glow animation
  const glow = useSharedValue(1);
  React.useEffect(() => {
    glow.value = interpolate(
      animValue.value,
      [0, 1],
      [1, 1.15],
      Extrapolate.CLAMP
    );
  }, [animValue.value]);
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: 0.5 + 0.3 * glow.value,
  }));
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <Animated.View style={[styles.planetGlow3D, { backgroundColor: planet.color }, glowStyle]} />
        <LinearGradient
          colors={[planet.color, '#fff0']}
          style={styles.planetBody3D}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        >
          <View style={styles.crater1} />
          <View style={styles.crater2} />
          <View style={styles.crater3} />
        </LinearGradient>
        <View style={styles.atmosphere3D} />
        {/* Optionally, add a BlurView for depth */}
        {/* {blur > 0 && <BlurView intensity={blur * 10} style={StyleSheet.absoluteFill} />} */}
        {/* Only show label for selected planet */}
        {idx === selectedIdx && (
          <Text style={styles.selectedPlanetLabel}>{planet.name}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

function PlanetCarouselItem({ item, index, scrollX, selected, ITEM_WIDTH, PLANET_SIZE, onPress }: any) {
  // 3D arc parameters
  const ARC_HEIGHT = 60;
  // Calculate animated styles based on scroll position
  const animatedStyle = useAnimatedStyle(() => {
    // Offset from center in item widths
    const offset = (scrollX.value / ITEM_WIDTH) - index;
    // Clamp theta to [-pi/2, pi/2] for a semi-circle
    const maxTheta = Math.PI / 2;
    const theta = Math.max(-maxTheta, Math.min(maxTheta, offset * (Math.PI / 3)));
    // Arc math (only Y for vertical arc effect)
    const translateY = ARC_HEIGHT * (1 - Math.cos(theta));
    // Scale and opacity for depth
    const scale = 0.7 + 0.5 * Math.cos(theta);
    const opacity = 0.5 + 0.5 * Math.cos(theta);
    const zIndex = Math.round(100 * Math.cos(theta));
    return {
      transform: [{ scale }, { translateY }],
      opacity,
      zIndex,
    };
  });

  // Smooth text animation based on how centered the planet is
  const textAnimatedStyle = useAnimatedStyle(() => {
    const offset = (scrollX.value / ITEM_WIDTH) - index;
    const distance = Math.abs(offset);
    // Text opacity: 1 when centered (distance = 0), fades out as distance increases
    const textOpacity = Math.max(0, 1 - distance * 2);
    // Slight scale for text
    const textScale = 0.8 + 0.2 * (1 - distance);
    return {
      opacity: textOpacity,
      transform: [{ scale: textScale }],
    };
  });

  return (
    <Animated.View style={[{ width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.8}>
        <LinearGradient
          colors={[item.color, '#fff0']}
          style={{
            width: PLANET_SIZE,
            height: PLANET_SIZE,
            borderRadius: PLANET_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            ...createShadow({
              color: item.color,
              opacity: 0.7,
              radius: 30,
              offsetY: 0,
              elevation: 8,
            }),
          }}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
        >
          <View style={{
            position: 'absolute',
            width: PLANET_SIZE * 1.5,
            height: PLANET_SIZE * 1.5,
            borderRadius: PLANET_SIZE * 0.75,
            backgroundColor: item.color,
            opacity: 0.25,
            top: -(PLANET_SIZE * 0.25),
            left: -(PLANET_SIZE * 0.25),
            zIndex: 0,
            ...createShadow({
              color: item.color,
              opacity: 0.7,
              radius: 30,
              offsetY: 0,
              elevation: 8,
            }),
          }} />
          <View style={{
            position: 'absolute',
            width: PLANET_SIZE * 1.1,
            height: PLANET_SIZE * 1.1,
            borderRadius: PLANET_SIZE * 0.55,
            borderWidth: 2,
            borderColor: 'rgba(191, 122, 240, 0.3)',
            top: -(PLANET_SIZE * 0.05),
            left: -(PLANET_SIZE * 0.05),
            zIndex: 2,
          }} />
          {/* Craters */}
          <View style={{
            position: 'absolute',
            width: PLANET_SIZE * 0.2,
            height: PLANET_SIZE * 0.2,
            borderRadius: PLANET_SIZE * 0.1,
            backgroundColor: '#fff',
            top: PLANET_SIZE * 0.2,
            left: PLANET_SIZE * 0.2,
            opacity: 0.15,
          }} />
          <View style={{
            position: 'absolute',
            width: PLANET_SIZE * 0.15,
            height: PLANET_SIZE * 0.15,
            borderRadius: PLANET_SIZE * 0.075,
            backgroundColor: '#fff',
            top: PLANET_SIZE * 0.5,
            left: PLANET_SIZE * 0.6,
            opacity: 0.12,
          }} />
          <View style={{
            position: 'absolute',
            width: PLANET_SIZE * 0.1,
            height: PLANET_SIZE * 0.1,
            borderRadius: PLANET_SIZE * 0.05,
            backgroundColor: '#fff',
            top: PLANET_SIZE * 0.7,
            left: PLANET_SIZE * 0.3,
            opacity: 0.1,
          }} />
        </LinearGradient>
        
        {/* Progress indicator for completed planet */}
        {item.user_progress?.is_completed && (
          <View style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
            ...createShadow({
              color: '#10B981',
              opacity: 0.6,
              radius: 8,
              offsetY: 2,
              elevation: 5,
            }),
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
          </View>
        )}
        
        {/* Progress bar for in-progress planet */}
        {item.user_progress && !item.user_progress.is_completed && item.user_progress.completed_quizzes > 0 && (
          <View style={{
            position: 'absolute',
            bottom: -10,
            left: PLANET_SIZE * 0.1,
            width: PLANET_SIZE * 0.8,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${(item.user_progress.completed_quizzes / item.total_quizzes) * 100}%`,
              height: '100%',
              backgroundColor: item.color,
              borderRadius: 2,
            }} />
          </View>
        )}
        
        {/* Smooth animated text that fades in/out based on position */}
        <Animated.Text style={[{
          marginTop: 18,
          fontWeight: '500',
          fontSize: 20,
          color: item.color,
          ...createTextShadow({
            color: '#000',
            opacity: 0.5,
            radius: 3,
            offsetY: 1,
          }),
          textAlign: 'center',
        }, textAnimatedStyle]}>
          {item.name}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Add animated orbital background component
function AnimatedOrbits({ scrollX, ITEM_WIDTH }: { scrollX: Animated.SharedValue<number>; ITEM_WIDTH: number }) {
  const orbit1Style = useAnimatedStyle(() => {
    // More fluid rotation based on scroll - continuous movement
    const rotation = (scrollX.value / 20) % 360; // Smooth continuous rotation
    const scale = 1 + Math.sin(scrollX.value / 100) * 0.05; // Subtle breathing effect
    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      opacity: 0.2,
    };
  });

  const orbit2Style = useAnimatedStyle(() => {
    // Counter-rotation at different speed
    const rotation = -(scrollX.value / 15) % 360; // Faster counter-rotation
    const scale = 1 + Math.cos(scrollX.value / 80) * 0.04;
    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      opacity: 0.15,
    };
  });

  const orbit3Style = useAnimatedStyle(() => {
    // Fastest rotation
    const rotation = (scrollX.value / 10) % 360; // Fastest rotation
    const scale = 1 + Math.sin(scrollX.value / 60) * 0.03;
    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      opacity: 0.12,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Slowest orbit layer */}
      <Animated.View style={[StyleSheet.absoluteFill, orbit1Style]}>
        <Svg width={width} height={320} style={StyleSheet.absoluteFill}>
          <Ellipse
            cx={width / 2}
            cy={160}
            rx={200}
            ry={100}
            stroke="#bf7af0"
            strokeWidth={1.5}
            fill="none"
            strokeDasharray="20,10"
            opacity={0.6}
          />
          <Ellipse
            cx={width / 2}
            cy={160}
            rx={160}
            ry={80}
            stroke="#bf7af0"
            strokeWidth={1.2}
            fill="none"
            strokeDasharray="15,8"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
      
      {/* Medium speed orbit layer */}
      <Animated.View style={[StyleSheet.absoluteFill, orbit2Style]}>
        <Svg width={width} height={320} style={StyleSheet.absoluteFill}>
          <Ellipse
            cx={width / 2}
            cy={160}
            rx={240}
            ry={120}
            stroke="#bf7af0"
            strokeWidth={1}
            fill="none"
            strokeDasharray="25,15"
            opacity={0.4}
          />
          <Ellipse
            cx={width / 2}
            cy={160}
            rx={120}
            ry={60}
            stroke="#bf7af0"
            strokeWidth={1}
            fill="none"
            strokeDasharray="12,6"
            opacity={0.4}
          />
        </Svg>
      </Animated.View>

      {/* Fastest orbit layer */}
      <Animated.View style={[StyleSheet.absoluteFill, orbit3Style]}>
        <Svg width={width} height={320} style={StyleSheet.absoluteFill}>
          <Ellipse
            cx={width / 2}
            cy={160}
            rx={280}
            ry={140}
            stroke="#bf7af0"
            strokeWidth={0.8}
            fill="none"
            strokeDasharray="30,20"
            opacity={0.3}
          />
          <Circle
            cx={width / 2}
            cy={160}
            r={80}
            stroke="#bf7af0"
            strokeWidth={0.8}
            fill="none"
            strokeDasharray="8,4"
            opacity={0.3}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function PlanetsScreen() {
  const { backendUserId } = useAuth();
  const [planets, setPlanets] = useState<PlanetWithProgress[]>([]);
  const [userOverview, setUserOverview] = useState<UserProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(0);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizSubmissionResponse | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const PLANET_SIZE = 110;
  const SPACING = 60;
  const ITEM_WIDTH = PLANET_SIZE + SPACING;
  
  const scrollX = useSharedValue(0);

  // Load planets data
  useEffect(() => {
    loadPlanets();
  }, [backendUserId]);

  const loadPlanets = async () => {
    try {
      setLoading(true);
      console.log('Loading planets...', { backendUserId });
      const response = await planetsService.getAllPlanets(backendUserId || undefined);
      
      console.log('Planets API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('Setting planets:', response.data.planets.length, 'planets');
        setPlanets(response.data.planets);
        setUserOverview(response.data.user_overview);
        
        // Initialize scroll position to first planet
        if (response.data.planets.length > 0) {
          setSelected(0);
          scrollX.value = 0;
          console.log('Planets loaded successfully, first planet:', response.data.planets[0].name);
        }
      } else {
        console.error('API response not successful:', response);
        Alert.alert('Error', 'Failed to load planets');
      }
    } catch (error) {
      console.error('Error loading planets:', error);
      Alert.alert('Error', 'Failed to load planets');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPlanets();
    setRefreshing(false);
  };

  // Animated scroll handler
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      // Update selection in real-time as user scrolls
      const newIndex = Math.round(event.contentOffset.x / ITEM_WIDTH);
      const clampedIndex = Math.max(0, Math.min(planets.length - 1, newIndex));
      runOnJS(setSelected)(clampedIndex);
    },
  });

  // Snap to planet when scroll ends
  const onMomentumScrollEnd = (event: any) => {
    const idx = Math.round(event.contentOffset.x / ITEM_WIDTH);
    const clampedIdx = Math.max(0, Math.min(planets.length - 1, idx));
    setSelected(clampedIdx);
  };

  // Also update on scroll end drag
  const onScrollEndDrag = (event: any) => {
    const idx = Math.round(event.contentOffset.x / ITEM_WIDTH);
    const clampedIdx = Math.max(0, Math.min(planets.length - 1, idx));
    setSelected(clampedIdx);
  };

  // Handle planet selection by tap
  const handlePlanetPress = useCallback((index: number) => {
    if (index === selected) return;
    
    setSelected(index);
    const targetScrollX = index * ITEM_WIDTH;
    
    flatListRef.current?.scrollToOffset({
      offset: targetScrollX,
      animated: true,
    });
  }, [ITEM_WIDTH, selected]);

  // Handle quiz start
  const handleQuizStart = (quiz: QuizWithProgress) => {
    console.log('Quiz start clicked:', { quiz: quiz.title, backendUserId });
    
    if (!backendUserId) {
      console.log('No backend user ID, showing auth alert');
      Alert.alert('Authentication Required', 'Please sign in to take quizzes');
      return;
    }
    
    console.log('Setting selected quiz and showing modal');
    setSelectedQuiz(quiz);
    setQuizModalVisible(true);
  };

  // Handle quiz completion
  const handleQuizComplete = (results: QuizSubmissionResponse) => {
    setQuizResults(results);
    setQuizModalVisible(false); // Close quiz modal
    setResultsModalVisible(true); // Show results modal
    // Refresh data to update progress
    refreshData();
  };

  // Handle quiz retake
  const handleQuizRetake = () => {
    setResultsModalVisible(false);
    if (selectedQuiz) {
      setQuizModalVisible(true);
    }
  };

  const renderPlanet = ({ item, index }: { item: PlanetWithProgress; index: number }) => (
    <PlanetCarouselItem
      item={item}
      index={index}
      scrollX={scrollX}
      selected={selected}
      ITEM_WIDTH={ITEM_WIDTH}
      PLANET_SIZE={PLANET_SIZE}
      onPress={handlePlanetPress}
    />
  );

  const renderQuizItem = ({ item }: { item: QuizWithProgress }) => (
    <TouchableOpacity 
      style={styles.quizCard}
      onPress={() => {
        console.log('Quiz card pressed!', item.title);
        handleQuizStart(item);
      }}
    >
      <LinearGradient
        colors={['rgba(191, 122, 240, 0.1)', 'rgba(191, 122, 240, 0.05)']}
        style={styles.quizCardGradient}
      >
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <Text style={styles.quizCode}>{item.quiz_code}</Text>
        </View>
        
        {item.user_progress ? (
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Best Score: {item.user_progress.best_score}/{item.total_questions} 
              ({Math.round(item.user_progress.completion_percentage)}%)
            </Text>
            <Text style={styles.attemptsText}>
              Attempts: {item.user_progress.attempts}
            </Text>
          </View>
        ) : (
          <Text style={styles.newQuizText}>🆕 Start Quiz</Text>
        )}
        
        <Text style={styles.quizDescription}>{item.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']} style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bf7af0" />
          <Text style={styles.loadingText}>Loading Planets...</Text>
        </View>
      </LinearGradient>
    );
  }

  const selectedPlanet = planets[selected];
  
  console.log('Rendering planets component:', { 
    planetsCount: planets.length, 
    loading, 
    selected, 
    selectedPlanet: selectedPlanet?.name,
    quizModalVisible,
    selectedQuiz: selectedQuiz?.title
  });

  return (
    <LinearGradient colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']} style={styles.container}>
      <StatusBar style="light" />
      <StarryBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Trading Academy</Text>
        <Text style={styles.subtitle}>Complete quizzes to master trading</Text>
        {userOverview && (
          <Text style={styles.progressOverview}>
            🏆 {userOverview.total_quizzes_completed} quizzes completed • 
            ⭐ {userOverview.overall_score} total points
          </Text>
        )}
      </View>
      
      {/* Planets Carousel */}
      <View style={{ height: PLANET_SIZE * 1.8, position: 'relative' }}>
        <AnimatedOrbits scrollX={scrollX} ITEM_WIDTH={ITEM_WIDTH} />
        <Animated.FlatList
          ref={flatListRef}
          data={planets}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPlanet}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: (width - ITEM_WIDTH) / 2,
            alignItems: 'center' 
          }}
          snapToInterval={ITEM_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          bounces={false}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          scrollEventThrottle={16}
          style={{ flexGrow: 0, height: PLANET_SIZE * 1.8 }}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          pagingEnabled={false}
          snapToStart={false}
          snapToEnd={false}
        />
      </View>
      
      {/* Quizzes Section */}
      <Animated.View style={styles.missionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.missionsTitle}>
            {selectedPlanet?.name || 'Select a Planet'}
          </Text>
          {selectedPlanet && (
            <Text style={styles.planetIndex}>
              Planet {selected + 1} of {planets.length}
            </Text>
          )}
        </View>
        
        {selectedPlanet?.user_progress && (
          <View style={styles.planetProgress}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressStats}>
              📚 {selectedPlanet.user_progress.completed_quizzes}/{selectedPlanet.total_quizzes} quizzes • 
              🎯 {selectedPlanet.user_progress.total_score} points
            </Text>
          </View>
        )}
        
        <FlatList
          data={selectedPlanet?.quizzes || []}
          keyExtractor={item => item.id.toString()}
          renderItem={renderQuizItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={refreshData}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quizzes available</Text>
            </View>
          )}
        />
      </Animated.View>

      {/* Quiz Modal */}
      <QuizModal
        visible={quizModalVisible}
        quiz={selectedQuiz}
        onClose={() => {
          setQuizModalVisible(false);
          setSelectedQuiz(null);
        }}
        onComplete={handleQuizComplete}
      />

      {/* Results Modal */}
      <QuizResultsModal
        visible={resultsModalVisible}
        results={quizResults}
        onClose={() => {
          setResultsModalVisible(false);
          setQuizResults(null);
        }}
        onRetake={handleQuizRetake}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  planetArea: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  planetLabel: {
    position: 'absolute',
    top: PLANET_RADIUS * 2 + 6,
    width: PLANET_RADIUS * 2 + 10,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    ...createTextShadow(shadowPresets.text),
  },
  missionsSection: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    marginTop: 1,
  },
  missionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 2,
  },
  missionCard: {
    backgroundColor: 'rgba(191, 122, 240, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.18)',
    ...createShadow({
      color: '#bf7af0',
      opacity: 0.12,
      radius: 8,
      offsetY: 2,
      elevation: 3,
    }),
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  missionDesc: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  missionReward: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  // Add new styles for 3D planet
  planetGlow3D: {
    position: 'absolute',
    width: PLANET_RADIUS * 2.5,
    height: PLANET_RADIUS * 2.5,
    borderRadius: PLANET_RADIUS * 1.25,
    backgroundColor: '#fff',
    opacity: 0.5,
    top: PLANET_RADIUS * -0.25,
    left: PLANET_RADIUS * -0.25,
    zIndex: 0,
    ...createShadow({
      color: '#fff',
      opacity: 0.7,
      radius: 30,
      offsetY: 0,
      elevation: 8,
    }),
  },
  planetBody3D: {
    width: PLANET_RADIUS * 2,
    height: PLANET_RADIUS * 2,
    borderRadius: PLANET_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  atmosphere3D: {
    position: 'absolute',
    width: PLANET_RADIUS * 2.2,
    height: PLANET_RADIUS * 2.2,
    borderRadius: PLANET_RADIUS * 1.1,
    borderWidth: 2,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    top: PLANET_RADIUS * -0.1,
    left: PLANET_RADIUS * -0.1,
    zIndex: 2,
  },
  crater1: {
    position: 'absolute',
    width: PLANET_RADIUS * 0.4,
    height: PLANET_RADIUS * 0.4,
    borderRadius: PLANET_RADIUS * 0.2,
    backgroundColor: '#fff',
    top: PLANET_RADIUS * 0.1,
    left: PLANET_RADIUS * 0.1,
  },
  crater2: {
    position: 'absolute',
    width: PLANET_RADIUS * 0.3,
    height: PLANET_RADIUS * 0.3,
    borderRadius: PLANET_RADIUS * 0.15,
    backgroundColor: '#fff',
    top: PLANET_RADIUS * 0.3,
    left: PLANET_RADIUS * 0.3,
  },
  crater3: {
    position: 'absolute',
    width: PLANET_RADIUS * 0.2,
    height: PLANET_RADIUS * 0.2,
    borderRadius: PLANET_RADIUS * 0.1,
    backgroundColor: '#fff',
    top: PLANET_RADIUS * 0.5,
    left: PLANET_RADIUS * 0.5,
  },
  selectedPlanetLabel: {
    position: 'absolute',
    top: PLANET_RADIUS * 2 + 12,
    width: PLANET_RADIUS * 3,
    left: -(PLANET_RADIUS * 0.5),
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#fff',
    ...createTextShadow(shadowPresets.textLarge),
  },
  planetIndex: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  progressOverview: {
    fontSize: 12,
    color: '#bf7af0',
    textAlign: 'center',
    marginTop: 5,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  planetProgress: {
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  progressTitle: {
    color: '#bf7af0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  progressStats: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  quizCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...createShadow({
      color: '#bf7af0',
      opacity: 0.2,
      radius: 10,
      offsetY: 2,
      elevation: 5,
    }),
  },
  quizCardGradient: {
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  quizCode: {
    color: '#bf7af0',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
  },
  attemptsText: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
  },
  newQuizText: {
    color: '#bf7af0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  quizDescription: {
    color: '#a0a0a0',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
  },
}); 
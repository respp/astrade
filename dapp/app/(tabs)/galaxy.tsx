import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Star, Trophy, Target, Gift, Zap, Crown, Grid3X3, Orbit } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import GalaxyPlanetCard from '@/components/GalaxyPlanetCard';
import { MissionsModal } from '@/components/MissionsModal';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

const { width, height } = Dimensions.get('window');

// Configuración para la vista de mapa de progresión
const MAP_VIEW_CONFIG = {
  planetSize: 60, // Planetas más grandes
  planetPositions: [
    { x: width * 0.2, y: height * 0.3 },   // Crypto Prime
    { x: width * 0.7, y: height * 0.25 },  // DeFi Nexus  
    { x: width * 0.4, y: height * 0.45 },  // NFT Galaxy
    { x: width * 0.8, y: height * 0.6 },   // DAO Constellation
    { x: width * 0.15, y: height * 0.7 },  // Vesu Planet
    { x: width * 0.6, y: height * 0.8 },   // Starknet Token
  ],
  pathConnections: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 }, // Connection to Vesu Planet
    { from: 4, to: 5 }, // Connection to Starknet Token
  ],
};

const galaxyPlanets = [
  {
    id: 1,
    name: 'Crypto Prime',
    type: 'Trading Hub',
    level: 'Beginner',
    color: '#F7931A',
    description: 'The golden world of cryptocurrency fundamentals',
    progress: 85,
    totalMissions: 12,
    completedMissions: 10,
    achievements: [
      { id: 1, name: 'First Trade', description: 'Complete your first cryptocurrency trade', completed: true, reward: '50 XP' },
      { id: 2, name: 'Hodler', description: 'Hold a position for 24 hours', completed: true, reward: '75 XP' },
      { id: 3, name: 'Profit Master', description: 'Make 5 profitable trades', completed: false, reward: '100 XP + NFT' },
    ],
    missions: [
      { id: 1, name: 'Market Analysis', description: 'Study Bitcoin price charts for 10 minutes', progress: 100, total: 100, completed: true, reward: '25 XP' },
      { id: 2, name: 'Portfolio Diversification', description: 'Add 3 different cryptocurrencies to your portfolio', progress: 2, total: 3, completed: false, reward: '50 XP' },
      { id: 3, name: 'Risk Management', description: 'Set stop-loss orders on 2 trades', progress: 0, total: 2, completed: false, reward: '40 XP' },
    ],
  },
  {
    id: 2,
    name: 'DeFi Nexus',
    type: 'Advanced Hub',
    level: 'Intermediate',
    color: '#627EEA',
    description: 'Decentralized finance protocols and yield farming',
    progress: 60,
    totalMissions: 15,
    completedMissions: 9,
    achievements: [
      { id: 4, name: 'Liquidity Provider', description: 'Provide liquidity to a DeFi pool', completed: true, reward: '100 XP' },
      { id: 5, name: 'Yield Farmer', description: 'Earn rewards from 3 different protocols', completed: false, reward: '150 XP + Rare NFT' },
      { id: 6, name: 'Smart Contract Expert', description: 'Interact with 10 different smart contracts', completed: false, reward: '200 XP' },
    ],
    missions: [
      { id: 4, name: 'Staking Rewards', description: 'Stake tokens in a DeFi protocol', progress: 1, total: 1, completed: true, reward: '75 XP' },
      { id: 5, name: 'Yield Optimization', description: 'Compare yields across 5 different pools', progress: 3, total: 5, completed: false, reward: '60 XP' },
      { id: 6, name: 'Impermanent Loss Study', description: 'Learn about impermanent loss risks', progress: 0, total: 1, completed: false, reward: '45 XP' },
    ],
  },
  {
    id: 3,
    name: 'NFT Galaxy',
    type: 'Creative Space',
    level: 'Advanced',
    color: '#8B5CF6',
    description: 'Non-fungible tokens and digital art marketplace',
    progress: 40,
    totalMissions: 20,
    completedMissions: 8,
    achievements: [
      { id: 7, name: 'First Mint', description: 'Create your first NFT', completed: true, reward: '75 XP' },
      { id: 8, name: 'Art Collector', description: 'Own 5 different NFTs', completed: false, reward: '120 XP + Special Badge' },
      { id: 9, name: 'Community Builder', description: 'Join 3 NFT communities', completed: false, reward: '100 XP' },
    ],
    missions: [
      { id: 7, name: 'NFT Marketplace', description: 'Browse and explore NFT collections', progress: 1, total: 1, completed: true, reward: '50 XP' },
      { id: 8, name: 'Royalty System', description: 'Learn about NFT royalties', progress: 0, total: 1, completed: false, reward: '60 XP' },
      { id: 9, name: 'Gas Optimization', description: 'Mint during low gas hours', progress: 0, total: 1, completed: false, reward: '70 XP' },
    ],
  },
  {
    id: 4,
    name: 'DAO Constellation',
    type: 'Governance Hub',
    level: 'Expert',
    color: '#10B981',
    description: 'Decentralized autonomous organizations and governance',
    progress: 25,
    totalMissions: 25,
    completedMissions: 6,
    achievements: [
      { id: 10, name: 'First Proposal', description: 'Submit your first DAO proposal', completed: false, reward: '150 XP + Governance NFT' },
      { id: 11, name: 'Active Voter', description: 'Vote on 10 proposals', completed: false, reward: '100 XP' },
      { id: 12, name: 'Delegate', description: 'Become a voting delegate', completed: false, reward: '200 XP + Special Role' },
    ],
    missions: [
      { id: 10, name: 'Governance Token', description: 'Acquire governance tokens', progress: 0, total: 1, completed: false, reward: '80 XP' },
      { id: 11, name: 'Proposal Analysis', description: 'Research and analyze 5 proposals', progress: 2, total: 5, completed: false, reward: '90 XP' },
      { id: 12, name: 'Community Engagement', description: 'Participate in DAO discussions', progress: 1, total: 3, completed: false, reward: '70 XP' },
    ],
  },
  {
    id: 5,
    name: 'Vesu Planet',
    type: 'Investment Hub',
    level: 'Advanced',
    color: '#FF6B35',
    description: 'Revolutionary investment platform where traditional finance meets DeFi',
    progress: 0,
    totalMissions: 5,
    completedMissions: 0,
    imageUrl: require('@/assets/images/logos/logo vesu.png'),
    achievements: [
      { id: 13, name: 'Vesu Pioneer', description: 'Make your first Vesu investment', completed: false, reward: '500 XP + Vesu Pioneer Title' },
      { id: 14, name: 'Portfolio Master', description: 'Diversify across Vesu products', completed: false, reward: '750 XP + Portfolio Badge NFT' },
      { id: 15, name: 'Vesu Master', description: 'Achieve mastery in Vesu investments', completed: false, reward: '2500 XP + Master Crown NFT' },
    ],
    missions: [
      { id: 13, name: 'Initial Investment', description: 'Make first Vesu investment ($50+)', progress: 0, total: 1, completed: false, reward: '500 XP + 100 Coins' },
      { id: 14, name: 'Portfolio Diversification', description: 'Invest in 3 Vesu products', progress: 0, total: 3, completed: false, reward: '750 XP + Badge NFT' },
      { id: 15, name: 'Yield Optimization', description: 'Generate $100+ profit from Vesu', progress: 0, total: 1, completed: false, reward: '1000 XP + 200 Coins' },
    ],
  },
  {
    id: 6,
    name: 'Starknet Token',
    type: 'Layer 2 Hub',
    level: 'Expert',
    color: '#FF6B35',
    description: 'Advanced Layer 2 scaling solutions with high-yield lending pools',
    progress: 0,
    totalMissions: 5,
    completedMissions: 0,
    achievements: [
      { id: 16, name: 'Starknet Pioneer', description: 'Invest in Starknet Genesis pool', completed: false, reward: '600 XP + Starknet Pioneer Title' },
      { id: 17, name: 'USDT Lender', description: 'Master Tether USD lending', completed: false, reward: '800 XP + USDT Lender Badge NFT' },
      { id: 18, name: 'Starknet Champion', description: 'Become Starknet ecosystem champion', completed: false, reward: '3000 XP + Champion Crown NFT' },
    ],
    missions: [
      { id: 16, name: 'Genesis Supply', description: 'Supply $100+ to Starknet Genesis pool', progress: 0, total: 1, completed: false, reward: '600 XP + 150 Coins' },
      { id: 17, name: 'Tether Lending', description: 'Lend $200+ USDT to Vesu protocol', progress: 0, total: 2, completed: false, reward: '800 XP + 200 Coins' },
      { id: 18, name: 'USDC Mega Pool', description: 'Master USD Coin lending pool', progress: 0, total: 2, completed: false, reward: '1200 XP + 300 Coins' },
    ],
  },
];

// Componente para estrellas animadas de fondo
const StarField = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.8 + 0.2,
    delay: Math.random() * 3000,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <AnimatedStar key={star.id} star={star} />
      ))}
    </View>
  );
};

// Componente individual de estrella
const AnimatedStar = ({ star }: { star: any }) => {
  const opacity = useSharedValue(star.opacity);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(star.opacity * 0.3, { duration: 2000 + star.delay }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          backgroundColor: '#fff',
          borderRadius: star.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

import { missionEngine } from '../../lib/missions/engine';
import { CRYPTO_PRIME_MISSIONS, DEFI_NEXUS_MISSIONS, VESU_MISSIONS, STARKNET_TOKEN_MISSIONS } from '../../lib/missions/types';

// Estados de progreso de planetas
enum PlanetState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked', 
  COMPLETED = 'completed'
}

// Lógica de progresión real basada en misiones completadas
const getPlanetState = (planetIndex: number): PlanetState => {
  // TODO: Obtener userId real del contexto de autenticación
  const userId = 'demo-user'; // Placeholder hasta que integres auth real
  
  const planetMissions = [
    CRYPTO_PRIME_MISSIONS, // Planet 0
    DEFI_NEXUS_MISSIONS,   // Planet 1
    [],                     // Planet 2 - NFT Galaxy (agregar después)
    [],                     // Planet 3 - DAO Constellation (agregar después)
    VESU_MISSIONS,         // Planet 4 - Vesu Planet
    STARKNET_TOKEN_MISSIONS // Planet 5 - Starknet Token Planet
  ];

  if (planetIndex === 0) {
    // Primer planeta siempre desbloqueado
    const completedMissions = missionEngine.getUserCompletedMissions(userId);
    const planetCompletedMissions = completedMissions.filter(progress => 
      progress.missionId.startsWith('cp_')
    );
    
    // Si todas las misiones del planeta están completadas
    if (planetCompletedMissions.length >= CRYPTO_PRIME_MISSIONS.length) {
      return PlanetState.COMPLETED;
    }
    return PlanetState.UNLOCKED;
  }
  
  if (planetIndex === 1) {
    // Segundo planeta se desbloquea al completar el primero
    const completedMissions = missionEngine.getUserCompletedMissions(userId);
    const cryptoPrimeCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('cp_')
    ).length >= CRYPTO_PRIME_MISSIONS.length;
    
    if (!cryptoPrimeCompleted) {
      return PlanetState.LOCKED;
    }
    
    const defiNexusCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('dn_')
    ).length >= DEFI_NEXUS_MISSIONS.length;
    
    return defiNexusCompleted ? PlanetState.COMPLETED : PlanetState.UNLOCKED;
  }
  
  if (planetIndex === 4) {
    // Vesu Planet - requires completing DeFi Nexus
    const completedMissions = missionEngine.getUserCompletedMissions(userId);
    const defiNexusCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('dn_')
    ).length >= DEFI_NEXUS_MISSIONS.length;
    
    if (!defiNexusCompleted) {
      return PlanetState.LOCKED;
    }
    
    const vesuCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('vesu_')
    ).length >= VESU_MISSIONS.length;
    
    return vesuCompleted ? PlanetState.COMPLETED : PlanetState.UNLOCKED;
  }
  
  if (planetIndex === 5) {
    // Starknet Token Planet - requires completing Vesu Planet
    const completedMissions = missionEngine.getUserCompletedMissions(userId);
    const vesuCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('vesu_')
    ).length >= VESU_MISSIONS.length;
    
    if (!vesuCompleted) {
      return PlanetState.LOCKED;
    }
    
    const starknetCompleted = completedMissions.filter(progress => 
      progress.missionId.startsWith('starknet_')
    ).length >= STARKNET_TOKEN_MISSIONS.length;
    
    return starknetCompleted ? PlanetState.COMPLETED : PlanetState.UNLOCKED;
  }
  
  // Planetas posteriores aún no implementados
  return PlanetState.LOCKED;
};

// Componente para planeta en mapa de progresión
const MapPlanet = ({ planet, index, onPress }: { planet: any; index: number; onPress: () => void }) => {
  const position = MAP_VIEW_CONFIG.planetPositions[index];
  const state = getPlanetState(index);
  const glowOpacity = useSharedValue(0.8);

  useEffect(() => {
    if (state === PlanetState.UNLOCKED) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [state]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: state === PlanetState.UNLOCKED ? glowOpacity.value : 0.4,
  }));

  const getInteractiveStyle = () => {
    switch (state) {
      case PlanetState.LOCKED:
        return { opacity: 0.3 };
      case PlanetState.COMPLETED:
        return { opacity: 1 };
      case PlanetState.UNLOCKED:
        return { opacity: 1 };
      default:
        return { opacity: 0.3 };
    }
  };

  const handlePress = () => {
    if (state !== PlanetState.LOCKED) {
      // Show missions for this planet instead of generic planet details
      onPress();
    }
  };

  return (
    <View style={{
      position: 'absolute',
      left: position.x - MAP_VIEW_CONFIG.planetSize / 2,
      top: position.y - MAP_VIEW_CONFIG.planetSize / 2,
    }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={state === PlanetState.LOCKED ? 1 : 0.8}>
        {/* Glow effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: MAP_VIEW_CONFIG.planetSize * 1.4,
              height: MAP_VIEW_CONFIG.planetSize * 1.4,
              borderRadius: MAP_VIEW_CONFIG.planetSize * 0.7,
              backgroundColor: planet.color,
              top: -MAP_VIEW_CONFIG.planetSize * 0.2,
              left: -MAP_VIEW_CONFIG.planetSize * 0.2,
              ...createShadow({
                color: planet.color,
                opacity: 0.6,
                radius: 25,
                offsetY: 0,
                elevation: 8,
              }),
            },
            glowStyle,
          ]}
        />
        
        {/* Planet body */}
        <LinearGradient
          colors={[planet.color, `${planet.color}80`] as unknown as readonly [string, string, ...string[]]}
          style={[
            {
              width: MAP_VIEW_CONFIG.planetSize,
              height: MAP_VIEW_CONFIG.planetSize,
              borderRadius: MAP_VIEW_CONFIG.planetSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow(shadowPresets.large),
            },
            getInteractiveStyle()
          ]}
        >
          {/* Custom planet image if available */}
          {planet.imageUrl && state !== PlanetState.LOCKED && (
            <Image
              source={planet.imageUrl}
              style={{
                width: MAP_VIEW_CONFIG.planetSize * 0.8,
                height: MAP_VIEW_CONFIG.planetSize * 0.8,
                borderRadius: MAP_VIEW_CONFIG.planetSize * 0.4,
              }}
              resizeMode="contain"
            />
          )}
          
          {/* Estado visual */}
          {state === PlanetState.LOCKED && (
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: MAP_VIEW_CONFIG.planetSize / 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#666', fontSize: 24 }}>🔒</Text>
            </View>
          )}
          
          {state === PlanetState.COMPLETED && (
            <View style={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: '#10B981',
              borderRadius: 15,
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#fff',
              ...createShadow({
                color: '#10B981',
                opacity: 0.8,
                radius: 8,
                offsetY: 2,
                elevation: 6,
              }),
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
            </View>
          )}
          
          {state === PlanetState.UNLOCKED && (
            <View style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: '#bf7af0',
              borderRadius: 10,
              width: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>!</Text>
            </View>
          )}
        </LinearGradient>
        
        {/* Planet label */}
        <Text
          style={{
            position: 'absolute',
            top: MAP_VIEW_CONFIG.planetSize + 12,
            left: -30,
            width: MAP_VIEW_CONFIG.planetSize + 60,
            textAlign: 'center',
            color: state === PlanetState.LOCKED ? '#666' : '#fff',
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          {planet.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente para líneas de conexión entre planetas
const PathConnections = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {MAP_VIEW_CONFIG.pathConnections.map((connection, index) => {
          const fromPos = MAP_VIEW_CONFIG.planetPositions[connection.from];
          const toPos = MAP_VIEW_CONFIG.planetPositions[connection.to];
          const fromState = getPlanetState(connection.from);
          const toState = getPlanetState(connection.to);
          
          // Línea activa si alguno de los planetas está completado o desbloqueado
          const isActive = fromState !== PlanetState.LOCKED || toState !== PlanetState.LOCKED;
          
          return (
            <g key={index}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isActive ? "#bf7af0" : "#444"}
                strokeWidth="3"
                strokeOpacity={isActive ? "0.8" : "0.3"}
                strokeDasharray="8,4"
              />
            </g>
          );
        })}
      </Svg>
    </View>
  );
};

export default function GalaxyExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState<typeof galaxyPlanets[0] | null>(null);
  const [isSpaceView, setIsSpaceView] = useState(false);

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <StarField />
      <PathConnections />
      
      {/* Planetas en el mapa */}
      {galaxyPlanets.map((planet, index) => (
        <MapPlanet
          key={planet.id}
          planet={planet}
          index={index}
          onPress={() => setSelectedPlanet(planet)}
        />
      ))}
    </View>
  );

  const renderListView = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Galaxy Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Star size={20} color="#bf7af0" />
          <Text style={styles.statLabel}>Planets Discovered</Text>
          <Text style={styles.statValue}>6/12</Text>
        </View>
        <View style={styles.statItem}>
          <Trophy size={20} color="#bf7af0" />
          <Text style={styles.statLabel}>Total Achievements</Text>
          <Text style={styles.statValue}>8/18</Text>
        </View>
      </View>

      {/* Planets Grid */}
      <View style={styles.planetsSection}>
        <Text style={styles.sectionTitle}>Available Planets</Text>
        <View style={styles.planetsGrid}>
          {galaxyPlanets.map((planet) => (
            <GalaxyPlanetCard
              key={planet.id}
              planet={planet}
              onPress={() => setSelectedPlanet(planet)}
            />
          ))}
        </View>
      </View>

      {/* Coming Soon Planets */}
      <View style={styles.comingSoonSection}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <View style={styles.comingSoonGrid}>
          <View style={styles.comingSoonPlanet}>
            <View style={styles.lockedPlanet}>
              <Crown size={24} color="#bf7af0" />
            </View>
            <Text style={styles.comingSoonText}>Cosmic Exchange</Text>
            <Text style={styles.comingSoonSubtext}>Unlock at Level 15</Text>
          </View>
          <View style={styles.comingSoonPlanet}>
            <View style={styles.lockedPlanet}>
              <Zap size={24} color="#bf7af0" />
            </View>
            <Text style={styles.comingSoonText}>Lightning Network</Text>
            <Text style={styles.comingSoonSubtext}>Unlock at Level 20</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Galaxy Explorer</Text>
          <Text style={styles.subtitle}>Discover planets and unlock their secrets</Text>
        </View>
        
        {/* View Toggle Button */}
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setIsSpaceView(!isSpaceView)}
        >
          {isSpaceView ? (
            <Grid3X3 size={24} color="#bf7af0" />
          ) : (
            <Orbit size={24} color="#bf7af0" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content based on view mode */}
      {isSpaceView ? renderMapView() : renderListView()}

      {/* Missions Modal */}
      {selectedPlanet && (
        <MissionsModal
          visible={!!selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
          planetIndex={galaxyPlanets.findIndex(p => p.id === selectedPlanet.id)}
          planetName={selectedPlanet.name}
          planetColor={selectedPlanet.color}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
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
  },
  viewToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  starBody: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...createShadow({
      color: '#bf7af0',
      opacity: 0.8,
      radius: 25,
      offsetY: 0,
      elevation: 10,
    }),
  },
  starLabel: {
    color: '#bf7af0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    alignItems: 'center',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginTop: 4,
  },
  planetsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 15,
  },
  planetsGrid: {
    gap: 15,
  },
  comingSoonSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  comingSoonPlanet: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  lockedPlanet: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  comingSoonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bf7af0',
    textAlign: 'center',
    marginBottom: 4,
  },
  comingSoonSubtext: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
});
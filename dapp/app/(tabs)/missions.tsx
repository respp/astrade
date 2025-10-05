import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Target, Clock, Gift, Star, Zap, Trophy } from 'lucide-react-native';
import MissionCard from '@/components/MissionCard';
import EventCard from '@/components/EventCard';

const dailyMissions = [
  {
    id: 1,
    title: 'First Trade',
    description: 'Execute your first trade of the day',
    reward: '+50 XP',
    progress: 1,
    total: 1,
    completed: true,
    icon: <Target size={24} color="#bf7af0" />,
  },
  {
    id: 2,
    title: 'Planet Explorer',
    description: 'Visit 3 different trading planets',
    reward: '+75 XP',
    progress: 2,
    total: 3,
    completed: false,
    icon: <Star size={24} color="#bf7af0" />,
  },
  {
    id: 3,
    title: 'Profit Hunter',
    description: 'Make a profitable trade worth $100+',
    reward: '+100 XP + NFT',
    progress: 0,
    total: 1,
    completed: false,
    icon: <Trophy size={24} color="#bf7af0" />,
  },
];

const weeklyMissions = [
  {
    id: 4,
    title: 'Galaxy Trader',
    description: 'Complete 10 trades across different planets',
    reward: '+500 XP + Rare NFT',
    progress: 7,
    total: 10,
    completed: false,
    icon: <Zap size={24} color="#bf7af0" />,
  },
  {
    id: 5,
    title: 'Portfolio Builder',
    description: 'Diversify across 5 different assets',
    reward: '+300 XP',
    progress: 3,
    total: 5,
    completed: false,
    icon: <Gift size={24} color="#bf7af0" />,
  },
];

const events = [
  {
    id: 1,
    title: 'Lunar Eclipse Trading Event',
    description: 'Double XP for all trades during the lunar eclipse',
    timeLeft: '2h 34m',
    reward: '2x XP Multiplier',
    participants: '1,247',
    type: 'limited' as const,
  },
  {
    id: 2,
    title: 'Mars Colony Launch',
    description: 'Special event celebrating the new Mars trading post',
    timeLeft: '5d 12h',
    reward: 'Exclusive Mars NFT',
    participants: '3,891',
    type: 'special' as const,
  },
];

export default function MissionsAndEvents() {
  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Missions & Events</Text>
          <Text style={styles.subtitle}>Complete missions to earn XP and unlock rewards</Text>
        </View>

        {/* Daily XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Daily XP Progress</Text>
            <Text style={styles.xpValue}>120 / 250 XP</Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpProgress, { width: '48%' }]} />
          </View>
          <Text style={styles.xpNext}>130 XP until daily bonus</Text>
        </View>

        {/* Daily Missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Missions</Text>
            <View style={styles.timeLeft}>
              <Clock size={16} color="#bf7af0" />
              <Text style={styles.timeText}>18h 23m</Text>
            </View>
          </View>
          {dailyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>

        {/* Weekly Missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Challenges</Text>
            <View style={styles.timeLeft}>
              <Clock size={16} color="#bf7af0" />
              <Text style={styles.timeText}>4d 12h</Text>
            </View>
          </View>
          {weeklyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>

        {/* Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galaxy Events</Text>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
  xpSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  xpValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bf7af0',
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#bf7af0',
    borderRadius: 4,
  },
  xpNext: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#bf7af0',
    fontWeight: '600',
  },
});
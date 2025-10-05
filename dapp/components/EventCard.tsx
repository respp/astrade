import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Users, Gift } from 'lucide-react-native';

interface Event {
  id: number;
  title: string;
  description: string;
  timeLeft: string;
  reward: string;
  participants: string;
  type: 'limited' | 'special';
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const getEventColors = () => {
    return event.type === 'limited' 
      ? { border: 'rgba(251, 191, 36, 0.3)', accent: '#FBBF24' }
      : { border: 'rgba(236, 72, 153, 0.3)', accent: '#EC4899' };
  };

  const colors = getEventColors();

  return (
    <TouchableOpacity style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={[styles.typeIndicator, { backgroundColor: colors.accent }]}>
          <Text style={styles.typeText}>
            {event.type === 'limited' ? 'LIMITED' : 'SPECIAL'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>{event.description}</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Clock size={16} color={colors.accent} />
          <Text style={styles.infoText}>{event.timeLeft}</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color="#9CA3AF" />
          <Text style={styles.infoText}>{event.participants} joined</Text>
        </View>
      </View>
      
      <View style={styles.rewardSection}>
        <Gift size={16} color="#10B981" />
        <Text style={styles.rewardText}>{event.reward}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
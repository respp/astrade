import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface InsufficientBalanceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  visible,
  onClose
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [opacityAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.background}
          >
            {/* Alien Image */}
            <View style={styles.alienContainer}>
              <Image 
                source={require('@/assets/images/navbar/alien-error-trade.png')}
                style={styles.alienImage}
                resizeMode="contain"
              />
            </View>

            {/* Message */}
            <View style={styles.content}>
              <Text style={styles.title}>Insufficient Balance</Text>
              <Text style={styles.message}>
                That's all you've got? With those coins you can't even buy an interstellar chip...
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF4757', '#FF3742']}
                style={styles.closeButtonGradient}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.closeButtonText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden'
  },
  background: {
    padding: 30,
    alignItems: 'center'
  },
  alienContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alienImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  alienEmoji: {
    fontSize: 60,
    textAlign: 'center'
  },
  content: {
    alignItems: 'center',
    marginBottom: 25
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15
  },
  message: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic'
  },
  closeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  closeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
}); 
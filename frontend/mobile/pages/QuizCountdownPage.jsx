import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Touchable, Pressable } from 'react-native';

export default function QuizCountdownPage({ navigation }) {
    const [countdown, setCountdown] = useState(5);

     useEffect(() => {
        if (countdown === 0) {
            // Ga naar je quiz scherm
            navigation.replace('Quiz'); // pas naam aan naar jouw route
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable className="flex-1" onPress={() => setCountdown(0)}>
        <View style={styles.container}>
          <Text style={styles.topText}>GET READY</Text>

          <View style={styles.circle}>
            <Text style={styles.countText}>{countdown}</Text>
          </View>

          <Text style={styles.bottomText}>PREPARE FOR QUIZ</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  )   
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5FD100',
  },
  container: {
    flex: 1,
    backgroundColor: '#5FD100',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  topText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  circle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#59B700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bottomText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

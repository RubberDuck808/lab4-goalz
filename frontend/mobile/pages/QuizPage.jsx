import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import QuizAnswerButton from '../components/QuizAnswerButton';
import QuizSpeechBubble from '../components/QuizSpeechBubble';
import GameButtons from '../components/GameButtons';
import { useGameContext } from '../context/GameContext';
import { apiFetch, authHeaders } from '../services/api/api';
import { submitQuizAnswer } from '../services/api/partyApi';

export default function QuizPage({ navigation, route }) {
  const fromGame = route?.params?.fromGame ?? false;
  const { addQuizScore } = useGameContext();

  const [countdown, setCountdown] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    setSelectedAnswer(null);
  }, []));

  const colors = ['red', 'yellow', 'green', 'blue'];

  useEffect(() => {
    const base = process.env.EXPO_PUBLIC_API_BASE_URL;
    authHeaders()
      .then(headers => apiFetch(`${base}/api/game/quiz/question`, { headers }))
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setQuestion(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (countdown === 0) {
      navigation.navigate('QuizResult', { score: 0, total: 1000, fromGame });
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, loading]);

  async function handleSubmit() {
    if (!selectedAnswer || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAnswer(question.id, selectedAnswer.id).catch(() => null);
      const correct = res?.data?.correct ?? false;
      const points  = res?.data?.points  ?? 0;
      if (correct && fromGame) addQuizScore(points);
      navigation.navigate('QuizResult', { score: points, total: 1000, fromGame });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#A239FA" />
        </View>
      </SafeAreaView>
    );
  }

  const answers = question?.answers ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titleText}>QUESTION</Text>
        <View style={styles.circle}>
          <Text style={styles.countText}>{countdown}</Text>
        </View>
        <View className="flex-row pt-5 items-center h-40">
          <Image
            source={require('../assets/avatar.png')}
            style={{ width: 100, height: 100 }}
          />
          <QuizSpeechBubble text={question?.text ?? 'Loading question...'} />
        </View>
        <View className="flex-1 flex-row flex-wrap p-2 mt-6">
          {answers.map((answer, index) => (
            <QuizAnswerButton
              key={answer.id}
              text={answer.text}
              color={colors[index % colors.length]}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={() => setSelectedAnswer(answer)}
            />
          ))}
        </View>
        <GameButtons
          variant="accept"
          onPress={handleSubmit}
          disabled={!selectedAnswer || submitting}
        >
          Lock In
        </GameButtons>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  safeArea: { flex: 1 },
  titleText: { fontSize: 48, fontWeight: '900', color: 'black' },
  container: { flex: 1, alignItems: 'center', paddingVertical: 40 },
  circle: {
    width: 56, height: 56, borderRadius: 95,
    backgroundColor: '#A239FA',
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
  },
  countText: { fontSize: 23, fontWeight: '900', color: '#FFFFFF' },
};

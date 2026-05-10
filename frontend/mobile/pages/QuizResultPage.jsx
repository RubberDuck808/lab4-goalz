import React from 'react';
import QuizResultIncorrect from '../components/QuizResultIncorrect';
import QuizResultCorrect from '../components/QuizResultCorrect';

export default function QuizResultPage({ navigation, route }) {
  const { score = 0, total = 0, fromGame = false } = route?.params ?? {};

  function handleContinue() {
    if (fromGame) {
      navigation.navigate('Map');
    } else {
      navigation.navigate('Home');
    }
  }

  if (score > 0) {
    return <QuizResultCorrect score={score} total={total} onContinue={handleContinue} />;
  }
  return <QuizResultIncorrect score={score} total={total} onContinue={handleContinue} />;
}

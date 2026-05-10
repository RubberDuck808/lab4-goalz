import React from 'react';
import QuizResultIncorrect from '../components/QuizResultIncorrect';
import QuizResultCorrect from '../components/QuizResultCorrect';

export default function QuizResultPage({ navigation, route }) {
  const { score = 0, total = 0 } = route?.params ?? {};

  function handleContinue() {
    navigation.navigate('Home');
  }

  if (score > 0) {
    return <QuizResultCorrect score={score} total={total} onContinue={handleContinue} />;
  }
  return <QuizResultIncorrect score={score} total={total} onContinue={handleContinue} />;
}

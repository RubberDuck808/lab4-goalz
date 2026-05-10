import React from 'react';
import QuizResultIncorrect from '../components/QuizResultIncorrect';
import QuizResultCorrect from '../components/QuizResultCorrect';
import { useGameContext } from '../context/GameContext';

export default function QuizResultPage({ navigation, route }) {
  const { score = 0, total = 0, fromGame = false } = route?.params ?? {};
  const { postQuizZoneId } = useGameContext();

  function handleContinue() {
    if (!fromGame) {
      navigation.navigate('Home');
      return;
    }
    // postQuizZoneId 0 = all zones done → go to completion; N → map handles advance
    if (postQuizZoneId === 0) {
      navigation.navigate('AllCheckpointsComplete');
    } else {
      // Pop Quiz + QuizResult off the stack so Map regains focus and the useEffect fires
      navigation.pop(2);
    }
  }

  if (score > 0) {
    return <QuizResultCorrect score={score} total={total} onContinue={handleContinue} />;
  }
  return <QuizResultIncorrect score={score} total={total} onContinue={handleContinue} />;
}

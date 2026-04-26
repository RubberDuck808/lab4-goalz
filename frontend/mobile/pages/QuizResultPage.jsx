import React from 'react'
import { SafeAreaView } from 'react-native'
import QuizResultInCorrect from '../components/QuizResultIncorrect'
import QuizResultCorrect from '../components/QuizResultCorrect'

export default function QuizResultPage({ route }) {
  const { score, total } = route.params;
  
  const renderContent = () => {
    {
      return score == 0 ? <QuizResultInCorrect /> : <QuizResultCorrect />
    }
  }

  return renderContent();  
}

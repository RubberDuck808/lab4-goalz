import React, { useState, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuizAnswerButton from '../components/QuizAnswerButton';
import QuizSpeechBubble from '../components/QuizSpeechBubble';
import GameButtons from '../components/GameButtons';

export default function QuizPage({ navigation }) {
    const [countdown, setCountdown] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [answers] = useState([
        {
            answer: 'ANSWER 1',
            isCorrect: true
        },
        {
            answer: 'ANSWER 2',
            isCorrect: false
        },
        {
            answer: 'ANSWER 3',
            isCorrect: false
        },
        {
            answer: 'ANSWER 4',
            isCorrect: false
        },
    ]);

    const [colors] = useState(["red", "yellow", "green", "blue"])

    useEffect(() => {
        if (countdown === 0) {
              navigation.navigate('QuizResult', {
                score: 0,
                total: 1000,
            });
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSubmit = () => {
        if(selectedAnswer.isCorrect){
            navigation.navigate('QuizResult', {
                score: 100,
                total: 1000,
            });
        }else {
            navigation.navigate('QuizResult', {
                score: 0,
                total: 1000,
            });
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.titleText}>QUESTION 1</Text>
                <View style={styles.circle}>
                    <Text style={styles.countText}>{countdown}</Text>
                </View>
                <View className="flex-row pt-5 items-center h-40">
                    <Image  
                        source={require('../assets/avatar.png')}
                        style={{ width: 100, height: 100 }}
                    />
                    <QuizSpeechBubble text="Quiz question" />
                </View>
                <View className="flex-1 flex-row flex-wrap p-2 mt-6">
                    {
                        answers && answers.map((answer, index) => <QuizAnswerButton key={index} text={answer.answer} color={colors[index]} onPress={() => console.log('pressed')} selectedAnswer={selectedAnswer} setSelectedAnswer={() => setSelectedAnswer(answer)} />)
                    }
                </View>
                <GameButtons variant="accept" onPress={handleSubmit}>
                    Submit
                </GameButtons>
            </View>
        </SafeAreaView>
    )
}

const styles = {
    safeArea: {
        flex: 1,
    },
    titleText: {
        fontSize: 48,
        fontWeight: '900',
        color: 'black',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 40,
    },
    circle: {
        width: 56,
        height: 56,
        borderRadius: 95,
        backgroundColor: '#A239FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    countText: {
        fontSize: 23,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    answerContainer: {
        flex: 1,
        flexDirection: 'row',   // naast elkaar
        flexWrap: 'wrap',       // nieuwe rij
        padding: 30,
    },
    box: {
        width: '50%',           // 2 kolommen
        height: 100,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    }
}

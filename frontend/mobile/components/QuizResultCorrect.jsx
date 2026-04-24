import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';

export default function QuizResultCorrect({score, streak}) {
  return (
    <SafeAreaView 
        style={{ flex: 1, backgroundColor: '#58CC02'}}
    >
        <View style={styles.container}>
            <View>
                <Text
                    className="text-white text-6xl font-extrabold"
                >CORRECT!</Text>
            </View>
            <View className="flex-1 items-center">
                <View 
                    style={{height: 250}}
                    className="justify-center items-center"
                >
                    <FontAwesome name="check" size={160} color="white"  />
                </View>
                <View
                    style={{backgroundColor: "#5DA700", width: 320}}
                    className="p-3 rounded-xl justify-center items-center mt-5"
                >
                    <Text className="text-white text-center font-extrabold text-4xl">+100</Text>
                </View>
                <View 
                    className="mt-4 flex-row justify-center items-center gap-2"
                >
                    <Text className="text-white text-center text-2xl">ANSWER STREAK</Text>
                    <View
                        className="w-12 h-12 bg-purple-500 rounded-full justify-center items-center ms-2"
                    >
                        <Text className="text-white font-extrabold text-2xl">2</Text>
                    </View>
                </View>
            </View>
            <View className="mt-4 w-full py-5 justify-center items-center">
                <Text 
                    className="text-white text-center text-xl font-bold m-auto"
                    style={{ width: '80%' }}
                >Tip: Keep your answer streak going, to get more bonus points!</Text>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  }
});
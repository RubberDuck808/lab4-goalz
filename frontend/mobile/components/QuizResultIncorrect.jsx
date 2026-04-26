import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';

export default function QuizResultIncorrect() {
return (
    <SafeAreaView 
        style={{ flex: 1, backgroundColor: '#FF4B4B'}}
    >
        <View style={styles.container}>
            <View>
                <Text
                    className="text-white text-6xl font-extrabold"
                >INCORRECT!</Text>
            </View>
            <View className="flex-1 items-center">
                <View 
                    style={{height: 250}}
                    className="justify-center items-center"
                >
                    <FontAwesome name="times" size={160} color="white"  />
                </View>
                <View
                    style={{backgroundColor: "#CA3C3C", width: 320}}
                    className="p-3 rounded-xl justify-center items-center mt-5"
                >
                    <Text className="text-white text-center font-extrabold text-4xl">+0</Text>
                </View>
                <View 
                    className="mt-4"
                >
                    <Text className="text-white text-center text-2xl">YOU LOST YOUR STREAK...</Text>
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
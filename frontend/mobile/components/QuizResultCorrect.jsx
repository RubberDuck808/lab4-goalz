import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome } from '@expo/vector-icons';

export default function QuizResultCorrect({ score, streak, onContinue }) {
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
                    <Text className="text-white text-center font-extrabold text-4xl">+{score ?? 100}</Text>
                </View>
                <View
                    className="mt-4 flex-row justify-center items-center gap-2"
                >
                    <Text className="text-white text-center text-2xl">ANSWER STREAK</Text>
                    <View
                        className="w-12 h-12 bg-purple-500 rounded-full justify-center items-center ms-2"
                    >
                        <Text className="text-white font-extrabold text-2xl">{streak ?? 0}</Text>
                    </View>
                </View>
            </View>
            <View className="mt-4 w-full py-5 justify-center items-center">
                <Text
                    className="text-white text-center text-xl font-bold m-auto"
                    style={{ width: '80%' }}
                >{(streak ?? 0) > 1 ? `${streak} in a row. Loggy's impressed.` : 'Off to a great start.'}</Text>
            </View>
            {onContinue && (
                <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
                </TouchableOpacity>
            )}
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
  },
  continueBtn: {
    backgroundColor: '#5DA700',
    borderBottomWidth: 4,
    borderBottomColor: '#3d7300',
    borderRadius: 13,
    alignSelf: 'stretch',
    maxWidth: 328,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginHorizontal: 24,
  },
  continueBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});
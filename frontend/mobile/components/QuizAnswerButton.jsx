import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function QuizAnswerButton({ text, color, selectedAnswer, setSelectedAnswer }) {

  const renderBackground = () => {
    switch (color) {
      case "red": return "#FF4B4B";
      case "green": return "#58CC02";
      case "yellow": return "#FFC800";
      case "blue": return "#63C9F9";
      default: return "#ccc";
    }
  };

  const isSelected = selectedAnswer.answer === text;

  return (
    <Pressable
      className="w-1/2 p-2"
      onPress={() => setSelectedAnswer()}
    >
      <View
        style={{
          backgroundColor: renderBackground(),
          transform: [{ scale: isSelected ? 0.92 : 1 }],
        }}
        className="h-32 items-center justify-center rounded-xl overflow-hidden"
      >

        {/* 👇 dark overlay bij selectie */}
        {isSelected && (
          <View className="absolute inset-0 bg-black/30" />
        )}

        <Text className="text-white text-lg font-extrabold text-center">
          {text}
        </Text>

      </View>
    </Pressable>
  );
}
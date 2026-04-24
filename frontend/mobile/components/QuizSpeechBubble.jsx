import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function SpeechBubble({ text }) {
  return (
    <View style={styles.wrapper}>
      <Svg
        width={227}
        height={83}
        viewBox="0 0 227 83"
        fill="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M13.7041 11C13.7041 5.47715 18.1813 1 23.7041 1H215.204C220.727 1 225.204 5.47715 225.204 11V71.5C225.204 77.0228 220.727 81.5 215.204 81.5H23.7041C18.1813 81.5 13.7041 77.0228 13.7041 71.5V47.5H3.00554C1.05415 47.5 0.257953 44.9914 1.85218 43.8661L13.7041 35.5V11Z"
          stroke="#22CF64"
          strokeWidth={2}
        />
      </Svg>

        <Text 
            style={styles.text}
            className="text-gray-500"
        >
            {text}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 227,
    height: 83,
    justifyContent: 'center',
    paddingLeft: 28,
    paddingRight: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
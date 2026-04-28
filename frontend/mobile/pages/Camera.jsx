import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const temp     = route?.params?.temp     ?? 18.4;
  const humidity = route?.params?.humidity ?? 62;
  const aqi      = route?.params?.aqi      ?? 32;

  const topBarHeight = insets.top + 63;
  const bottomBarHeight = insets.bottom + 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Viewfinder — camera placeholder with rule-of-thirds grid */}
      <View style={styles.viewfinder}>
        <View style={[styles.hLine, { top: '33.3%' }]} />
        <View style={[styles.hLine, { top: '66.6%' }]} />
        <View style={[styles.vLine, { left: '33.3%' }]} />
        <View style={[styles.vLine, { left: '66.6%' }]} />
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Sensor tag */}
      <View style={[styles.sensorTag, { top: topBarHeight + 8 }]}>
        <View style={styles.sensorDot} />
        <Text style={styles.sensorText}>{`SENSOR ON  ·  Live data`}</Text>
      </View>

      {/* Sensor data bar */}
      <View style={[styles.dataBar, { bottom: bottomBarHeight }]}>
        <Text style={styles.dataText}>
          {`Temp ${temp.toFixed(1)}°C  ·  Humidity ${humidity}%  ·  AQI ${aqi}`}
        </Text>
      </View>

      {/* Bottom bar with shutter */}
      <View style={[styles.bottomBar, { height: bottomBarHeight, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.shutterOuter}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UserPhoto', {
            imageUri: route?.params?.imageUri ?? null,
            gps: route?.params?.gps ?? null,
          })}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  // camera area
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#141414',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d0d0d',
    justifyContent: 'flex-end',
  },
  backBtn: {
    paddingHorizontal: 17,
    paddingBottom: 14,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // sensor tag
  sensorTag: {
    position: 'absolute',
    left: 17,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1cb0f6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 30,
  },
  sensorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  sensorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },

  // data bar
  dataBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 27,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  dataText: {
    color: '#b2e5bf',
    fontSize: 11,
  },

  // bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
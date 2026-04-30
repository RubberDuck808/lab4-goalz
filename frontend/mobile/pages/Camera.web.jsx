import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  const temp     = route?.params?.temp     ?? 18.4;
  const humidity = route?.params?.humidity ?? 62;
  const aqi      = route?.params?.aqi      ?? 32;

  const topBarHeight    = insets.top + 63;
  const bottomBarHeight = insets.bottom + 100;

  async function handleShutter() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      navigation.navigate('UserPhoto', {
        imageUri: photo.uri,
        gps: route?.params?.gps ?? null,
      });
    } finally {
      setCapturing(false);
    }
  }

  // ── Permission not yet determined ──
  if (!permission) {
    return <View style={styles.container} />;
  }

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.permissionCenter}>
          <Text style={styles.permissionText}>Camera access is required.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live webcam viewfinder */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="environment">
        {/* Rule-of-thirds grid */}
        <View style={[styles.hLine, { top: '33.3%' }]} />
        <View style={[styles.hLine, { top: '66.6%' }]} />
        <View style={[styles.vLine, { left: '33.3%' }]} />
        <View style={[styles.vLine, { left: '66.6%' }]} />
      </CameraView>

      {/* Top bar
      <View style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View> */}

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
          onPress={handleShutter}
          disabled={capturing}
        >
          {capturing
            ? <ActivityIndicator color="#1cb0f6" />
            : <View style={styles.shutterInner} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },

  hLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  vLine: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // topBar: {
  //   position: 'absolute',
  //   top: 0, left: 0, right: 0,
  //   backgroundColor: '#0d0d0d',
  //   justifyContent: 'flex-end',
  // },
  // backBtn:  { paddingHorizontal: 17, paddingBottom: 14 },
  // backText: { color: '#fff', fontSize: 14, fontWeight: '500' },

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
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  sensorText: { color: '#fff', fontSize: 11, fontWeight: '500' },

  dataBar: {
    position: 'absolute',
    left: 0, right: 0,
    height: 27,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  dataText: { color: '#b2e5bf', fontSize: 11 },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 59, height: 59, borderRadius: 30,
    backgroundColor: '#fff',
  },

  permissionCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  permissionText: { color: '#fff', fontSize: 16 },
  permissionBtn: {
    backgroundColor: '#1cb0f6',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12,
  },
  permissionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

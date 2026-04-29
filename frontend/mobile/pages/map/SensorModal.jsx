import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, ActivityIndicator,
  ScrollView, TouchableOpacity,
} from 'react-native';
import GameButtons from '../../components/GameButtons';
import { getSensorData } from '../../services/api';

export default function SensorModal({ visible, sensorId, sensorName, onClose }) {
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'loading' | 'data' | 'error'
  const [readings, setReadings] = useState([]);

  async function handleCheckSensor() {
    setPhase('loading');
    try {
      const result = await getSensorData(sensorId);
      if (result.success) {
        setReadings(result.data);
        setPhase('data');
      } else {
        setPhase('error');
      }
    } catch {
      setPhase('error');
    }
  }

  function handleClose() {
    setPhase('prompt');
    setReadings([]);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {phase === 'prompt' && (
            <>
              <Text style={styles.icon}>📡</Text>
              <Text style={styles.title}>Sensor Detected!</Text>
              <Text style={styles.subtitle}>{sensorName} is nearby and collecting data.</Text>
              <View style={styles.btnWrap}>
                <GameButtons variant="accept" onPress={handleCheckSensor}>Check Sensor</GameButtons>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.dismiss}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'loading' && (
            <>
              <Text style={styles.title}>{sensorName}</Text>
              <ActivityIndicator size="large" color="#1CB0F6" style={{ marginTop: 24 }} />
            </>
          )}

          {phase === 'data' && (
            <>
              <Text style={styles.title}>{sensorName}</Text>
              {readings.length === 0 ? (
                <Text style={styles.empty}>No readings found for this sensor.</Text>
              ) : (
                <ScrollView style={styles.list} contentContainerStyle={{ gap: 12 }}>
                  {readings.map(item => (
                    <View key={item.id} style={styles.card}>
                      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                      <View style={styles.row}>
                        <DataItem label="Temp"     value={`${item.temp.toFixed(1)} °C`} color="#FF6B35" />
                        <DataItem label="Humidity" value={`${item.humidity}%`}           color="#1CB0F6" />
                        <DataItem label="Light"    value={`${item.light} lx`}            color="#FFC107" />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={styles.btnWrap}>
                <GameButtons variant="task" onPress={handleClose}>Close</GameButtons>
              </View>
            </>
          )}

          {phase === 'error' && (
            <>
              <Text style={styles.title}>{sensorName}</Text>
              <Text style={styles.error}>Could not load sensor data.</Text>
              <View style={styles.btnWrap}>
                <GameButtons variant="task" onPress={handleClose}>Close</GameButtons>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function DataItem({ label, value, color }) {
  return (
    <View style={styles.dataItem}>
      <Text style={[styles.dataValue, { color }]}>{value}</Text>
      <Text style={styles.dataLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  icon:     { fontSize: 48, marginBottom: 8 },
  title:    { fontSize: 22, fontWeight: 'bold', color: '#27272a', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#71717a', textAlign: 'center' },
  btnWrap:  { marginTop: 20, alignItems: 'center' },
  dismiss:  { marginTop: 12 },
  dismissText: { fontSize: 13, color: '#a1a1aa', textDecorationLine: 'underline' },

  list:      { width: '100%', maxHeight: 300 },
  card:      { backgroundColor: '#f4f4f5', borderRadius: 14, padding: 16 },
  timestamp: { fontSize: 12, color: '#71717a', marginBottom: 10 },
  row:       { flexDirection: 'row', justifyContent: 'space-around' },
  dataItem:  { alignItems: 'center', gap: 2 },
  dataValue: { fontSize: 20, fontWeight: 'bold' },
  dataLabel: { fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 },
  error:     { fontSize: 14, color: '#ef4444', textAlign: 'center', marginTop: 20 },
  empty:     { fontSize: 14, color: '#71717a', textAlign: 'center', marginTop: 20 },
});

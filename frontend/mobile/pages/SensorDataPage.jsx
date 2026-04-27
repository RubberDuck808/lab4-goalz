import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, ActivityIndicator,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameButtons from '../components/GameButtons';
import { getSensorData } from '../services/api';

export default function SensorDataPage({ navigation, route }) {
  const sensorId = route?.params?.sensorId ?? 27;
  const sensorName = route?.params?.sensorName ?? 'Nearby Sensor';

  const [modalVisible, setModalVisible] = useState(true);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckSensor() {
    setModalVisible(false);
    setLoading(true);
    try {
      const result = await getSensorData(sensorId);
      if (result.success) {
        setReadings(result.data);
      } else {
        setError('Could not load sensor data.');
      }
    } catch (e) {
      setError(`Network error: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupIcon}>📡</Text>
            <Text style={styles.popupTitle}>Sensor Detected!</Text>
            <Text style={styles.popupSubtitle}>{sensorName} is nearby and collecting data.</Text>
            <View style={{ marginTop: 20 }}>
              <GameButtons variant="accept" onPress={handleCheckSensor}>
                Check Sensor
              </GameButtons>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!modalVisible && (
        <View style={styles.content}>
          <Text style={styles.heading}>{sensorName}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#1CB0F6" style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : readings.length === 0 ? (
            <Text style={styles.empty}>No readings found for this sensor.</Text>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={{ gap: 12 }}>
              {readings.map(item => (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                  <View style={styles.row}>
                    <DataItem label="Temp" value={`${item.temp.toFixed(1)} °C`} color="#FF6B35" />
                    <DataItem label="Humidity" value={`${item.humidity}%`} color="#1CB0F6" />
                    <DataItem label="Light" value={`${item.light} lx`} color="#FFC107" />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{ marginTop: 16 }}>
            <GameButtons variant="task" onPress={() => navigation.goBack()}>
              Back
            </GameButtons>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  safe: { flex: 1, backgroundColor: '#fff' },

  // modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  popupIcon: { fontSize: 48, marginBottom: 8 },
  popupTitle: { fontSize: 24, fontWeight: 'bold', color: '#27272a', textAlign: 'center' },
  popupSubtitle: { fontSize: 14, color: '#71717a', textAlign: 'center', marginTop: 6 },
  dismissText: { fontSize: 13, color: '#a1a1aa', textDecorationLine: 'underline' },

  // data view
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#27272a', marginBottom: 16 },
  list: { width: '100%' },
  card: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    padding: 16,
  },
  timestamp: { fontSize: 12, color: '#71717a', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  dataItem: { alignItems: 'center', gap: 2 },
  dataValue: { fontSize: 20, fontWeight: 'bold' },
  dataLabel: { fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 },
  error: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginTop: 40 },
  empty: { fontSize: 14, color: '#71717a', textAlign: 'center', marginTop: 40 },
});

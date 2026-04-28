import { View, Text, StyleSheet } from "react-native";

export default function MapPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map is not available on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, color: "#666" },
});

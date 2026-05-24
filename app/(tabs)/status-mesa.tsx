import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusMesaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Status Mesa</Text>
      <Text style={styles.subtitle}>Aqui ficará a representação gráfica das mesas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
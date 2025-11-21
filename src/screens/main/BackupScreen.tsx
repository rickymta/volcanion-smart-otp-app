import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BackupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Backup & Recovery</Text>
      <Text style={styles.subtext}>Feature coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#666' },
});

export default BackupScreen;

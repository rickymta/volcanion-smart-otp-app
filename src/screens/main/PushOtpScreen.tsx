import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PushOtpScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Push OTP Requests</Text>
      <Text style={styles.subtext}>No pending requests</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#666' },
});

export default PushOtpScreen;

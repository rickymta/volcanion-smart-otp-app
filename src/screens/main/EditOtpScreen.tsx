import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'EditOtp'>;

const EditOtpScreen: React.FC<Props> = ({ route }) => {
  const { account } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit OTP Account: {account.label}</Text>
      <Text style={styles.subtext}>Feature coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#666' },
});

export default EditOtpScreen;

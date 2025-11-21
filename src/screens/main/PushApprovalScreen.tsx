import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { pushOtpService } from '@/services/api/pushOtpService';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'PushApproval'>;

const PushApprovalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { request } = route.params;

  const handleApprove = async () => {
    try {
      await pushOtpService.approvePushOtp(request.id);
      Alert.alert('Success', 'Push OTP approved');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve push OTP');
    }
  };

  const handleDeny = async () => {
    try {
      await pushOtpService.denyPushOtp(request.id);
      Alert.alert('Denied', 'Push OTP request denied');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to deny push OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color="#ff9800" />
      <Text style={styles.title}>Push OTP Request</Text>
      <Text style={styles.device}>Device: {request.deviceName}</Text>
      <Text style={styles.time}>
        {new Date(request.timestamp).toLocaleString()}
      </Text>
      {request.location && (
        <Text style={styles.location}>Location: {request.location}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.denyButton} onPress={handleDeny}>
          <Text style={styles.denyButtonText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 24 },
  device: { fontSize: 16, color: '#666', marginBottom: 8 },
  time: { fontSize: 14, color: '#999', marginBottom: 4 },
  location: { fontSize: 14, color: '#999', marginBottom: 32 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 32 },
  approveButton: { backgroundColor: '#4caf50', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  approveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  denyButton: { backgroundColor: '#f44336', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  denyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PushApprovalScreen;

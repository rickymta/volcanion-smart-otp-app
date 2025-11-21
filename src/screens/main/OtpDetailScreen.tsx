import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store';
import { incrementHotpCounter } from '@/features/otp/otpSlice';
import { otpGenerator } from '@/services/utils/otpGenerator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'OtpDetail'>;

const OtpDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { account } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const dispatch = useAppDispatch();

  useEffect(() => {
    generateCode();

    if (account.type === 'TOTP') {
      const interval = setInterval(() => {
        const remaining = otpGenerator.getTOTPTimeRemaining(account.period);
        setTimeRemaining(remaining);

        if (remaining === account.period || remaining === 0) {
          generateCode();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [account]);

  const generateCode = () => {
    try {
      const code =
        account.type === 'TOTP'
          ? otpGenerator.generateTOTP(account)
          : otpGenerator.generateHOTP(account);
      setOtpCode(code);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate OTP code');
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(otpCode);
    Alert.alert('Copied', 'OTP code copied to clipboard');
  };

  const handleRefreshHOTP = async () => {
    if (account.type === 'HOTP') {
      await dispatch(incrementHotpCounter(account.id));
      generateCode();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.accountInfo}>
        <Text style={styles.issuer}>{account.issuer}</Text>
        <Text style={styles.label}>{account.label}</Text>
      </View>

      <View style={styles.otpContainer}>
        <Text style={styles.otpCode}>{otpCode}</Text>
        
        {account.type === 'TOTP' && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeRemaining}s</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(timeRemaining / account.period) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
        <Ionicons name="copy-outline" size={24} color="#fff" />
        <Text style={styles.copyButtonText}>Copy Code</Text>
      </TouchableOpacity>

      {account.type === 'HOTP' && (
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshHOTP}>
          <Ionicons name="refresh-outline" size={24} color="#6200ee" />
          <Text style={styles.refreshButtonText}>Generate Next Code</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditOtp', { account })}
        >
          <Ionicons name="create-outline" size={24} color="#6200ee" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  accountInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  issuer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  otpContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  otpCode: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200ee',
    letterSpacing: 8,
  },
  timerContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  timerText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  copyButton: {
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6200ee',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    color: '#6200ee',
    fontSize: 14,
    marginTop: 4,
  },
});

export default OtpDetailScreen;

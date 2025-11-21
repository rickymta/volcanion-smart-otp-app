import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { OtpAccount } from '@/types';
import { otpGenerator } from '@/services/utils/otpGenerator';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  account: OtpAccount;
  onPress: () => void;
}

const OtpCard: React.FC<Props> = ({ account, onPress }) => {
  const [otpCode, setOtpCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);

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
      setOtpCode('ERROR');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.accountInfo}>
          <Text style={styles.issuer}>{account.issuer}</Text>
          <Text style={styles.label}>{account.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>

      <View style={styles.otpContainer}>
        <Text style={styles.otpCode}>{otpCode}</Text>
        {account.type === 'TOTP' && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.timerText}>{timeRemaining}s</Text>
          </View>
        )}
        {account.type === 'HOTP' && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>Counter: {account.counter}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  issuer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    letterSpacing: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  counterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    color: '#666',
  },
});

export default OtpCard;

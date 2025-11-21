import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppDispatch } from '@/store';
import { addAccount } from '@/features/otp/otpSlice';
import { otpGenerator } from '@/services/utils/otpGenerator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'AddOtp'>;

const AddOtpScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [label, setLabel] = useState('');
  const [issuer, setIssuer] = useState('');
  const [secret, setSecret] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    const parsed = otpGenerator.parseOtpAuthUri(data);

    if (!parsed) {
      Alert.alert('Error', 'Invalid QR code format');
      setScanned(false);
      return;
    }

    try {
      await dispatch(
        addAccount({
          label: parsed.label,
          issuer: parsed.issuer,
          secret: parsed.secret,
          type: parsed.type,
          algorithm: parsed.algorithm,
          digits: parsed.digits,
          period: parsed.period,
        })
      ).unwrap();

      Alert.alert('Success', 'OTP account added successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to add account');
      setScanned(false);
    }
  };

  const handleManualAdd = async () => {
    if (!label || !issuer || !secret) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(
        addAccount({
          label,
          issuer,
          secret: secret.replace(/\s/g, '').toUpperCase(),
          type: 'TOTP',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
        })
      ).unwrap();

      Alert.alert('Success', 'OTP account added successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to add account');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (manualEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.manualForm}>
          <Text style={styles.title}>Enter Account Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Issuer (e.g., Google, GitHub)"
            value={issuer}
            onChangeText={setIssuer}
          />

          <TextInput
            style={styles.input}
            placeholder="Account Label (e.g., user@example.com)"
            value={label}
            onChangeText={setLabel}
          />

          <TextInput
            style={styles.input}
            placeholder="Secret Key"
            value={secret}
            onChangeText={setSecret}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.button} onPress={handleManualAdd}>
            <Text style={styles.buttonText}>Add Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setManualEntry(false)}
          >
            <Text style={styles.linkText}>Scan QR Code Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <View style={styles.scannerFrame} />
        <Text style={styles.scannerText}>Scan QR Code</Text>

        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setManualEntry(true)}
        >
          <Ionicons name="keypad" size={24} color="#fff" />
          <Text style={styles.manualButtonText}>Enter Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 24,
  },
  rescanButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  manualButton: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  permissionText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
  },
  manualForm: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#6200ee',
    fontSize: 14,
  },
});

export default AddOtpScreen;

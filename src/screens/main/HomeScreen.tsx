import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, HomeTabsParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAccounts, loadLocalAccounts } from '@/features/otp/otpSlice';
import { biometricService } from '@/services/utils/biometricService';
import { Ionicons } from '@expo/vector-icons';
import OtpCard from '@/components/OtpCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabsParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((state) => state.otp);
  const { biometricEnabled } = useAppSelector((state) => state.settings);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (biometricEnabled && !biometricVerified) {
      authenticateWithBiometric();
    } else if (!biometricEnabled) {
      setBiometricVerified(true);
    }
  }, [biometricEnabled]);

  const authenticateWithBiometric = async () => {
    const result = await biometricService.authenticate();
    if (result.success) {
      setBiometricVerified(true);
    } else {
      Alert.alert('Authentication Failed', result.error || 'Please try again');
    }
  };

  const loadData = async () => {
    try {
      // Load local accounts first for offline support
      await dispatch(loadLocalAccounts()).unwrap();
      // Then try to fetch from server
      await dispatch(fetchAccounts()).unwrap();
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddAccount = () => {
    navigation.navigate('AddOtp');
  };

  const handleAccountPress = (account: any) => {
    navigation.navigate('OtpDetail', { account });
  };

  if (biometricEnabled && !biometricVerified) {
    return (
      <View style={styles.lockedContainer}>
        <Ionicons name="lock-closed" size={64} color="#6200ee" />
        <Text style={styles.lockedText}>Authenticate to view OTP codes</Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={authenticateWithBiometric}
        >
          <Text style={styles.unlockButtonText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OTP Accounts</Text>
        <TouchableOpacity onPress={handleAddAccount}>
          <Ionicons name="add-circle" size={32} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No OTP accounts yet</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
            <Text style={styles.addButtonText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={({ item }) => (
            <OtpCard account={item} onPress={() => handleAccountPress(item)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 40,
  },
  lockedText: {
    fontSize: 18,
    color: '#666',
    marginTop: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { setBiometricEnabled, setAutoLockEnabled } from '@/features/settings/settingsSlice';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, HomeTabsParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabsParamList, 'Settings'>,
  NativeStackScreenProps<MainStackParamList>
>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => dispatch(logout()),
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="finger-print" size={24} color="#6200ee" />
            <Text style={styles.settingText}>Biometric Authentication</Text>
          </View>
          <Switch
            value={settings.biometricEnabled}
            onValueChange={(val) => { dispatch(setBiometricEnabled(val)); }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed" size={24} color="#6200ee" />
            <Text style={styles.settingText}>Auto Lock</Text>
          </View>
          <Switch
            value={settings.autoLockEnabled}
            onValueChange={(val) => { dispatch(setAutoLockEnabled(val)); }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup & Recovery</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Backup')}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#6200ee" />
          <Text style={styles.buttonText}>Backup & Recovery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#999', marginBottom: 12, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  settingRow: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 8 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 16, color: '#333' },
  button: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, gap: 12 },
  buttonText: { fontSize: 16, color: '#333' },
  logoutButton: { backgroundColor: '#f44336', marginHorizontal: 16, marginTop: 32, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default SettingsScreen;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { HomeTabsNavigator } from './HomeTabsNavigator';
import AddOtpScreen from '@/screens/main/AddOtpScreen';
import OtpDetailScreen from '@/screens/main/OtpDetailScreen';
import EditOtpScreen from '@/screens/main/EditOtpScreen';
import PushApprovalScreen from '@/screens/main/PushApprovalScreen';
import BackupScreen from '@/screens/main/BackupScreen';
import RecoveryScreen from '@/screens/main/RecoveryScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="HomeTabs" 
        component={HomeTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddOtp" 
        component={AddOtpScreen}
        options={{ title: 'Add OTP Account' }}
      />
      <Stack.Screen 
        name="OtpDetail" 
        component={OtpDetailScreen}
        options={{ title: 'OTP Details' }}
      />
      <Stack.Screen 
        name="EditOtp" 
        component={EditOtpScreen}
        options={{ title: 'Edit OTP Account' }}
      />
      <Stack.Screen 
        name="PushApproval" 
        component={PushApprovalScreen}
        options={{ title: 'Approve Push OTP' }}
      />
      <Stack.Screen 
        name="Backup" 
        component={BackupScreen}
        options={{ title: 'Backup & Recovery' }}
      />
      <Stack.Screen 
        name="Recovery" 
        component={RecoveryScreen}
        options={{ title: 'Restore Backup' }}
      />
    </Stack.Navigator>
  );
};

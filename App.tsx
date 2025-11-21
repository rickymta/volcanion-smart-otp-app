import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { RootNavigator } from '@/navigation';
import { initializeAuth } from '@/features/auth/authSlice';
import { loadSettings } from '@/features/settings/settingsSlice';
import { encryptionService } from '@/services/utils/encryptionService';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state: any) => state.auth);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize encryption service
      await encryptionService.initialize();

      // Load auth state
      await dispatch(initializeAuth()).unwrap();

      // Load settings
      await dispatch(loadSettings()).unwrap();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

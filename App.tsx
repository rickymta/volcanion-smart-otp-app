import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { RootNavigator } from '@/navigation';
import { initializeAuth } from '@/features/auth/authSlice';
import { loadSettings } from '@/features/settings/settingsSlice';
import { encryptionService } from '@/services/utils/encryptionService';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Ignore screen capture permission error - it's not critical
    if (error.message?.includes('DETECT_SCREEN_CAPTURE')) {
      console.warn('Screen capture permission denied - continuing anyway');
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (!error.message?.includes('DETECT_SCREEN_CAPTURE')) {
      console.error('App Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            An error occurred: {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state: any) => state.auth);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsInitialized(true);
    }
  };

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

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

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
});

import { registerRootComponent } from 'expo';

// Suppress screen capture warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('DETECT_SCREEN_CAPTURE')) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('DETECT_SCREEN_CAPTURE')) {
    return;
  }
  originalError(...args);
};

let App;
try {
  App = require('./App').default;
} catch (error) {
  console.log('Error loading App:', error);
  // Create a fallback error component
  const React = require('react');
  const { View, Text, StyleSheet } = require('react-native');
  
  App = () => (
    <View style={styles.container}>
      <Text style={styles.error}>Failed to load app: {error.message}</Text>
    </View>
  );
  
  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    error: { color: 'red', fontSize: 16, textAlign: 'center' },
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);


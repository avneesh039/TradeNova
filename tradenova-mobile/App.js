import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { MarketProvider } from './src/context/MarketContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MarketProvider>
          <RootNavigator />
        </MarketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { View, LogBox } from 'react-native';
import Home from './views/home.js';

export default function App() {
  LogBox.ignoreAllLogs(true);

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#232323' }}>
      <Home />
    </View>
  );
}


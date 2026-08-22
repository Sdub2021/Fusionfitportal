import 'react-native-get-random-values';
try {
  const { install } = require('react-native-quick-crypto');
  install();
} catch (_) {}
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);

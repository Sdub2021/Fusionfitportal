import AsyncStorage from '@react-native-async-storage/async-storage';
import { PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { toByteArray } from 'js-base64';
import { APP_IDENTITY, CLUSTER } from './config';

const AUTH_KEY = 'fit.mwa.authToken';
const ADDR_KEY = 'fit.mwa.addressB64';

export type Session = {
  authToken: string;
  address: string;
};

function addressFromBase64(b64: string): string {
  const bytes = toByteArray(b64);
  return new PublicKey(bytes).toBase58();
}

export async function loadCachedSession(): Promise<Session | null> {
  const [authToken, addressB64] = await Promise.all([
    AsyncStorage.getItem(AUTH_KEY),
    AsyncStorage.getItem(ADDR_KEY),
  ]);
  if (!authToken || !addressB64) return null;
  try {
    return { authToken, address: addressFromBase64(addressB64) };
  } catch {
    return null;
  }
}

export async function connectWallet(): Promise<Session> {
  const session = await transact(async (wallet) => {
    const result = await wallet.authorize({
      cluster: CLUSTER,
      identity: APP_IDENTITY,
    });
    const account = result.accounts[0];
    const address = addressFromBase64(account.address);
    await AsyncStorage.setItem(AUTH_KEY, result.auth_token);
    await AsyncStorage.setItem(ADDR_KEY, account.address);
    return { authToken: result.auth_token, address };
  });
  return session;
}

export async function disconnectWallet(): Promise<void> {
  const authToken = await AsyncStorage.getItem(AUTH_KEY);
  if (authToken) {
    try {
      await transact(async (wallet) => {
        await wallet.deauthorize({ auth_token: authToken });
      });
    } catch {}
  }
  await AsyncStorage.multiRemove([AUTH_KEY, ADDR_KEY]);
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

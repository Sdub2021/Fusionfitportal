import AsyncStorage from '@react-native-async-storage/async-storage';
import { PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { toByteArray } from 'js-base64';
import { APP_IDENTITY, CHAIN } from './config';

const AUTH_KEY = 'fit.mwa.authToken';
const ADDR_KEY = 'fit.mwa.addressB64';

export type Session = {
  authToken: string;
  address: string;
  publicKey: PublicKey;
};

function publicKeyFromBase64(b64: string): PublicKey {
  return new PublicKey(toByteArray(b64));
}

export async function loadCachedSession(): Promise<Session | null> {
  const [authToken, addressB64] = await Promise.all([
    AsyncStorage.getItem(AUTH_KEY),
    AsyncStorage.getItem(ADDR_KEY),
  ]);
  if (!authToken || !addressB64) return null;
  try {
    const publicKey = publicKeyFromBase64(addressB64);
    return { authToken, address: publicKey.toBase58(), publicKey };
  } catch {
    await AsyncStorage.multiRemove([AUTH_KEY, ADDR_KEY]);
    return null;
  }
}

export async function connectWallet(): Promise<Session> {
  const cached = await AsyncStorage.getItem(AUTH_KEY);
  const session = await transact(async (wallet) => {
    const result = await wallet.authorize({
      cluster: CHAIN,
      identity: APP_IDENTITY,
      auth_token: cached ?? undefined,
    });
    const account = result.accounts[0];
    const publicKey = publicKeyFromBase64(account.address);
    await AsyncStorage.setItem(AUTH_KEY, result.auth_token);
    await AsyncStorage.setItem(ADDR_KEY, account.address);
    return {
      authToken: result.auth_token,
      address: publicKey.toBase58(),
      publicKey,
    };
  });
  return session;
}

export async function signMessageWithWallet(
  authToken: string,
  message: string
): Promise<string> {
  const encoded = new TextEncoder().encode(message);
  const signed = await transact(async (wallet) => {
    await wallet.authorize({
      cluster: CHAIN,
      identity: APP_IDENTITY,
      auth_token: authToken,
    });
    const { signed_payloads } = await wallet.signMessages({
      addresses: [],
      payloads: [encoded],
    });
    return signed_payloads[0];
  });
  return Buffer.from(signed).toString('base64');
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
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

import { Platform } from 'react-native';

/**
 * Lightweight Seeker detection via Platform constants.
 * Good for UI treatments. Not cryptographic proof (can be spoofed).
 * For guaranteed Seeker ownership, verify Seeker Genesis Token on-chain.
 */
export function isSeekerDevice(): boolean {
  if (Platform.OS !== 'android') return false;
  const c = Platform.constants as Record<string, unknown>;
  const brand = String(c.Brand ?? '').toLowerCase();
  const manufacturer = String(c.Manufacturer ?? '').toLowerCase();
  const model = String(c.Model ?? '').toLowerCase();
  const fingerprint = String(c.Fingerprint ?? '').toLowerCase();

  return (
    brand.includes('solana') ||
    manufacturer.includes('solana') ||
    model.includes('seeker') ||
    model.includes('saga') ||
    fingerprint.includes('solanamobile') ||
    fingerprint.includes('seeker')
  );
}

export function deviceLabel(): string {
  if (isSeekerDevice()) return 'Seeker';
  if (Platform.OS === 'android') return 'Android';
  return Platform.OS;
}

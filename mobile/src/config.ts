import { clusterApiUrl } from '@solana/web3.js';

/** Shown in Seed Vault / Phantom / Solflare authorization sheet */
export const APP_IDENTITY = {
  name: 'FIT',
  uri: 'https://fusionfitportal.com',
  icon: 'icons/icon.svg',
};

/** mainnet for live CMC37 claims */
export const CHAIN = 'solana:mainnet-beta' as const;
export const ENDPOINT = clusterApiUrl('mainnet-beta');

export const SUPABASE_URL = 'https://kytvzrkretucgkairzny.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dHZ6cmtyZXR1Y2drYWlyem55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMzUyNzIsImV4cCI6MjEwMTkxMTI3Mn0.4TwXyF81TWzAuC4eWc7q2Oso3DGMtuAPZFPBvYyOVQg';

export const COLORS = {
  void: '#07070c',
  elevated: '#0e0e16',
  card: '#14141e',
  line: 'rgba(255,255,255,0.08)',
  text: 'rgba(255,255,255,0.94)',
  muted: 'rgba(255,255,255,0.48)',
  amber: '#e8a54b',
  amberSoft: '#f0c27a',
  success: '#86efac',
  danger: '#fca5a5',
};

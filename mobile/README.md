# FIT — Solana Mobile (Seeker)

Native wellness app for **Solana Seeker / Saga** and any Android phone with a Mobile Wallet Adapter wallet (Seed Vault, Phantom, Solflare).

## What it does

- Connect wallet via **Mobile Wallet Adapter** (biometric Seed Vault on Seeker)
- Claim **CMC37** (same Supabase signup as fusionfitportal.com)
- Level 1 **4-7-8 breath** with on-device timer

## Stack

- Expo (dev client) + React Native + TypeScript
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js`
- `@solana/web3.js`

Expo Go is **not** enough — MWA needs a **development build** on a real Android / Seeker.

## Run on Seeker or Android

```bash
cd mobile
npm install
npx expo prebuild --platform android
npx expo run:android
```

On device: install a wallet first (Seed Vault Wallet on Seeker, or Phantom / Solflare).

## Publish later

1. Build a signed release APK
2. Follow [Solana dApp Store submit](https://docs.solanamobile.com/dapp-store/submit-new-app)

Faster first listing: wrap the live PWA (fusionfitportal.com) as an APK. This folder is the **native** path.

## Identity

```
name: FIT
uri:  https://fusionfitportal.com
```

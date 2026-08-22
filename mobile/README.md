# FIT — Solana Mobile (Seeker)

Premium wellness dApp for **Solana Seeker**. Built for Seed Vault biometrics, Mobile Wallet Adapter, and the Solana dApp Store.

## Why this is Seeker-first

| Feature | Behavior on Seeker |
|--------|---------------------|
| Connect | Opens Seed Vault — keys never leave the TEE |
| Claim CMC37 | Optional **biometric message sign** before signup |
| Breath | Haptic feedback on every phase change |
| Device | Detects Seeker for UI (“Unlock Vault”) |
| Auth cache | Re-authorize with stored token (fewer prompts) |

## Run on Seeker / Android

```bash
cd mobile
npm install
npx expo prebuild --platform android
npx expo run:android
```

Expo Go will **not** work — MWA needs a custom native build.

## dApp Store

See `dapp-store/config.yaml`. Build signed APK then submit via Solana Mobile publisher portal.

## Identity

```
name: FIT
uri:  https://fusionfitportal.com
package: com.fusionfitportal.fit
```

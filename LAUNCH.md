# FIT — Launch Today (Seeker dApp Store)

**Goal:** Submit FIT to the Solana dApp Store **today**.
**Reality:** Review takes **3–5 business days**. You can submit today; it goes live after approval.

We ship the **live website as a PWA wrapped in an APK** (official Solana path).
Native React Native app stays in `mobile/` for a later v2 with deeper Seed Vault features.

---

## What you need on your computer

| Item | Notes |
|------|--------|
| Node.js 18+ | `node -v` |
| ~0.2+ SOL | In Phantom/Solflare browser extension (fees + ArDrive) |
| Screenshots | 2–5 phone screenshots of fusionfitportal.com (1080×1920 ideal) |
| 30–60 min | First-time Bubblewrap may install JDK/Android SDK |

You do **not** need a Seeker phone to build the APK.

---

## STEP 1 — Confirm PWA is live (2 min)

Open these in a browser:

1. https://fusionfitportal.com
2. https://fusionfitportal.com/manifest.json
3. https://fusionfitportal.com/icons/pX1Em.png (192)
4. https://fusionfitportal.com/icons/smmkn.png (512)

All must load. If manifest or icons fail, stop and fix the site first.

---

## STEP 2 — Install Bubblewrap (5 min)

```bash
npm i -g @bubblewrap/cli
bubblewrap --version
```

---

## STEP 3 — Create the Android wrapper (10–20 min)

```bash
mkdir -p ~/fit-twa && cd ~/fit-twa
bubblewrap init --manifest https://fusionfitportal.com/manifest.json
```

**Answer the prompts like this:**

| Prompt | Answer |
|--------|--------|
| Domain | `fusionfitportal.com` |
| URL path | `/` |
| App name | `FIT` |
| Short name | `FIT` |
| Application ID | `com.fusionfitportal.fit` |
| Display mode | `standalone` |
| Theme color | `#f97316` |
| Background color | `#05050f` |
| Splash | use defaults / icon |
| Keystore | **Create new** — write down password in a password manager |

**CRITICAL:** Save these forever or you cannot update the app later:

- `android.keystore` file
- Keystore password
- Key password
- Key alias

---

## STEP 4 — Digital Asset Links (full-screen, no Chrome bar)

```bash
cd ~/fit-twa
keytool -list -v -keystore android.keystore
```

Copy the **SHA256** fingerprint (looks like `AB:CD:12:...`).

```bash
bubblewrap fingerprint add PASTE_SHA256_HERE
bubblewrap fingerprint generateAssetLinks
```

That prints JSON. You need it live at:

`https://fusionfitportal.com/.well-known/assetlinks.json`

**Send me the JSON** (or paste it) and I will push it to the GitHub repo so it goes live on the site.

Without this file, the app shows a browser bar instead of feeling native.

---

## STEP 5 — Build the signed APK (5–15 min)

```bash
cd ~/fit-twa
bubblewrap build
```

Output file (usually in the same folder):

`app-release-signed.apk`

Optional install on a phone via USB:

```bash
bubblewrap install app-release-signed.apk
```

---

## STEP 6 — Publisher portal (15 min)

1. Open **https://publish.solanamobile.com**
2. Connect Phantom / Solflare (this becomes your **publisher wallet** — never lose it)
3. Complete publisher profile + KYC/KYB if asked
4. **Add a dApp → New dApp**

**Paste-ready listing copy:**

**Name:** FIT

**Short description:**
Ancient balance. Modern power. Yoga, Tai Chi, vestibular training & CMC37 claims on Solana.

**Long description:**
FIT is a cosmic wellness portal for Solana Mobile. Practice the 5 Levels of Ascension, start Yin Awakening with a guided 4-7-8 breath, and claim CMC37 with your wallet.

Built for Seeker — open in a full-screen app experience from the Solana dApp Store. Connect Phantom, Solflare, or Seed Vault and enter the portal.

**Category:** Health / Lifestyle

**Website:** https://fusionfitportal.com

5. **New Version** → upload `app-release-signed.apk`
6. Upload icon + screenshots
7. Submit and **approve every** wallet signature (Arweave upload + Release NFT)

---

## STEP 7 — After submit

- Email results from `publishersupport@dappstore.solanamobile.com` in **3–5 business days**
- If quiet after 5 days: Solana Mobile Discord → `#dev-answers` → App Review Inquiry

---

## Checklist

- [ ] PWA + icons load
- [ ] Bubblewrap init done
- [ ] Keystore backed up
- [ ] assetlinks.json live on fusionfitportal.com
- [ ] `app-release-signed.apk` built
- [ ] Publisher account + ~0.2 SOL
- [ ] Listing text + screenshots
- [ ] APK uploaded and signatures approved

---

## Parallel: Native app (later)

`mobile/` is the React Native / Seed Vault biometric build.
Ship PWA wrapper **today**; deepen native features in a follow-up release under the same package name if you keep `com.fusionfitportal.fit`.

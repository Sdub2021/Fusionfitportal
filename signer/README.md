# CMC37 backend signer

Pays **1 CMC37** from the distribution wallet.

Distribution wallet:

`68wcbLLBULTWKBriRq5BmgYw6fQREV54e59hRqrWWtj8`

Mint:

`QKWV6rjY5vy4fdpinnX8DkxQAoDkdRSpN4KCSCMpump`

This signer does **not** live on GitHub Pages. You control it by holding the secret key and flipping `PAYOUTS_ENABLED`.

## Never do this

- Do not paste the private key into chat, GitHub, `admin.html`, or the public site
- Do not commit `.env`
- Do not use the seed phrase in the browser

## One-time setup (your computer)

```bash
cd signer
cp .env.example .env
```

Put the **secret key** for `68wcb…Wtj8` into `.env` as `TREASURY_SECRET`.

Phantom → Settings → Security & Privacy → Show Secret Key
or export the base58 secret for that account only.

Install and test:

```bash
cd signer
npm install
npm run dry -- CLAIMANT_WALLET_HERE
```

Dry-run prints the from/to addresses and does not send.

## Pay one verified claim

```bash
cd signer
npm run pay -- CLAIMANT_WALLET_HERE
```

You will see a Solscan signature if it lands.

## How you control it

| Control | What it does |
| --- | --- |
| Leave `PAYOUTS_ENABLED=false` | Signer refuses every pay |
| Set `PAYOUTS_ENABLED=true` | Pays are allowed |
| Delete or empty `TREASURY_SECRET` | Nothing can send |
| Change `TREASURY_SECRET` | Rotates the signer (must still be 68wcb… key) |
| Do not run the command | No payout |

Conditions the script already enforces:

- Payouts flag must be on
- Destination must be a valid Solana wallet
- Destination cannot be the distribution wallet
- Sends exactly 1 CMC37
- Creates the token account if the claimant does not have one

## After vestibular + meditation

1. User finishes both practices on `/practice.html`
2. User submits email + **their** wallet
3. You verify the claim wallet
4. You run `npm run pay -- CLAIM_WALLET`
5. Check Solscan

This is manual-on-purpose until you are ready to attach the same script to a private server.

## Optional: Supabase Edge Function

`supabase/functions/pay-cmc37/index.ts` is a locked stub for later.

Deploy only after you add these **Edge secrets** in the Supabase dashboard (not in git):

- `TREASURY_SECRET`
- `PAYOUT_SECRET` (a long random password you make up)
- `PAYOUTS_ENABLED=true`

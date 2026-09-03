import "dotenv/config";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const MINT = new PublicKey(
  process.env.CMC37_MINT || "QKWV6rjY5vy4fdpinnX8DkxQAoDkdRSpN4KCSCMpump"
);
const DISTRIBUTION = (
  process.env.DISTRIBUTION_WALLET ||
  "68wcbLLBULTWKBriRq5BmgYw6fQREV54e59hRqrWWtj8"
).trim();
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const DECIMALS = 6;
const AMOUNT = BigInt(1) * BigInt(10 ** DECIMALS);
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function argWallet() {
  const argv = process.argv.slice(2).filter((a) => a !== "--dry");
  return (argv[0] || "").trim();
}

function loadKeypair(secret) {
  const raw = (secret || "").trim();
  if (!raw) throw new Error("TREASURY_SECRET is empty. Put it in signer/.env");
  if (raw.startsWith("[")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  }
  return Keypair.fromSecretKey(bs58.decode(raw));
}

async function main() {
  const dry = process.argv.includes("--dry");
  const toWallet = argWallet();
  if (!SOLANA_RE.test(toWallet)) {
    throw new Error("Pass the claimant wallet: npm run pay -- CLAIM_WALLET");
  }
  if (toWallet === DISTRIBUTION) {
    throw new Error("Refusing to pay the distribution wallet itself");
  }
  if (!dry && process.env.PAYOUTS_ENABLED !== "true") {
    throw new Error("Payouts locked. Set PAYOUTS_ENABLED=true in signer/.env");
  }

  const payer = loadKeypair(process.env.TREASURY_SECRET);
  if (payer.publicKey.toBase58() !== DISTRIBUTION) {
    throw new Error(
      "TREASURY_SECRET is not the 68wcb… distribution wallet. Got " +
        payer.publicKey.toBase58()
    );
  }

  const dest = new PublicKey(toWallet);
  const connection = new Connection(RPC, "confirmed");
  const fromAta = await getAssociatedTokenAddress(MINT, payer.publicKey);
  const toAta = await getAssociatedTokenAddress(MINT, dest);

  console.log(dry ? "DRY RUN" : "LIVE PAY");
  console.log("from", payer.publicKey.toBase58());
  console.log("to  ", dest.toBase58());
  console.log("amt ", "1 CMC37");

  if (dry) return;

  const tx = new Transaction();
  try {
    await getAccount(connection, toAta);
  } catch {
    tx.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        toAta,
        dest,
        MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }
  tx.add(createTransferInstruction(fromAta, toAta, payer.publicKey, AMOUNT));
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(payer);
  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, "confirmed");
  console.log("signature", sig);
  console.log("solscan", "https://solscan.io/tx/" + sig);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

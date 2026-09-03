const FIT_CHAIN = {
  name: "mainnet-beta",
  endpoint: "https://api.mainnet-beta.solana.com",
  explorer: "https://solscan.io",
  distribution: "68wcbLLBULTWKBriRq5BmgYw6fQREV54e59hRqrWWtj8",
  voteAccount: "",
  identity: "FIT · fusionfitportal.com"
};
function isValidSolana(a) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(String(a || ""));
}
function shortKey(a) {
  const s = String(a || "");
  return s.length > 10 ? s.slice(0, 4) + "\u2026" + s.slice(-4) : s;
}
function detectProvider() {
  const phantom = window.phantom && window.phantom.solana;
  if (phantom && phantom.isPhantom) return phantom;
  if (window.solflare && window.solflare.isSolflare) return window.solflare;
  if (window.solana && window.solana.isPhantom) return window.solana;
  if (window.solana) return window.solana;
  return null;
}
async function connectWallet() {
  const p = detectProvider();
  if (!p) {
    const err = new Error("NO_WALLET");
    err.code = "NO_WALLET";
    throw err;
  }
  const resp = await p.connect();
  const key = (resp && resp.publicKey && resp.publicKey.toString()) || (p.publicKey && p.publicKey.toString());
  if (!isValidSolana(key)) throw new Error("No public key");
  try { localStorage.setItem("fit_wallet", key); } catch (_) {}
  return { provider: p, address: key };
}
async function rpc(method, params) {
  const res = await fetch(FIT_CHAIN.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}
async function getSolBalance(address) {
  const lamports = await rpc("getBalance", [address, { commitment: "confirmed" }]);
  return (lamports && typeof lamports.value === "number" ? lamports.value : lamports) / 1e9;
}
function explorerAccount(address) {
  return FIT_CHAIN.explorer + "/account/" + address;
}
function mobileWalletUrl(page) {
  const target = encodeURIComponent(page || location.href);
  return "https://phantom.app/ul/browse/" + target + "?ref=" + encodeURIComponent(location.origin);
}
window.FITSolana = {
  FIT_CHAIN, isValidSolana, shortKey, detectProvider, connectWallet, rpc, getSolBalance, explorerAccount, mobileWalletUrl
};

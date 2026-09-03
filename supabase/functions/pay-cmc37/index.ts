// Optional later. Do not put TREASURY_SECRET in this file.
// Set secrets in the Supabase dashboard only.

const DISTRIBUTION = "68wcbLLBULTWKBriRq5BmgYw6fQREV54e59hRqrWWtj8";
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors() });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const enabled = Deno.env.get("PAYOUTS_ENABLED") === "true";
  const admin = Deno.env.get("PAYOUT_SECRET") || "";
  const auth = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  if (!admin || auth !== admin) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }
  if (!enabled) {
    return json({ ok: false, error: "Payouts locked" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const wallet = String(body.wallet || "").trim();
  if (!SOLANA_RE.test(wallet)) {
    return json({ ok: false, error: "Invalid wallet" }, 400);
  }
  if (wallet === DISTRIBUTION) {
    return json({ ok: false, error: "Cannot pay distribution wallet" }, 400);
  }

  return json({
    ok: false,
    error: "Use signer/pay.mjs on your computer first. Wire live sending here after that works.",
    wallet,
  }, 501);
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}

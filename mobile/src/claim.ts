import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolana(address: string): boolean {
  return SOLANA_RE.test(address);
}

export type ClaimResult = { ok: boolean; message: string };

export async function claimCmc37(
  email: string,
  wallet: string,
  extras?: { signature?: string; device?: string }
): Promise<ClaimResult> {
  if (!email.includes('@')) return { ok: false, message: 'Enter a valid email.' };
  if (!isValidSolana(wallet)) return { ok: false, message: 'Connect a valid Solana wallet.' };

  const body: Record<string, unknown> = {
    email: email.trim().toLowerCase(),
    wallet_address: wallet,
    verified: Boolean(extras?.signature),
    rewarded: true,
  };
  if (extras?.device) body.device = extras.device;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/signups`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 409) return { ok: false, message: 'Already registered.' };
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (text.includes('23505')) return { ok: false, message: 'Already registered.' };
    return { ok: false, message: 'Could not save. Try again.' };
  }
  return { ok: true, message: 'Success — you are entitled to 1 CMC37.' };
}

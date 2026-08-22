import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolana(address: string): boolean {
  return SOLANA_RE.test(address);
}

export async function claimCmc37(email: string, wallet: string): Promise<{ ok: boolean; message: string }> {
  if (!email.includes('@')) return { ok: false, message: 'Enter a valid email.' };
  if (!isValidSolana(wallet)) return { ok: false, message: 'Connect a valid Solana wallet.' };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/signups`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      email,
      wallet_address: wallet,
      verified: false,
      rewarded: true,
    }),
  });

  if (res.status === 409) return { ok: false, message: 'Already registered.' };
  if (!res.ok) {
    const text = await res.text();
    if (text.includes('23505')) return { ok: false, message: 'Already registered.' };
    return { ok: false, message: 'Could not save. Try again.' };
  }
  return { ok: true, message: 'Success — you are entitled to 1 CMC37.' };
}

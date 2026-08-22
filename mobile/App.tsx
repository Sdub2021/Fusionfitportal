import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from './src/config';
import { claimCmc37 } from './src/claim';
import { connectWallet, disconnectWallet, loadCachedSession, Session, shortAddress } from './src/wallet';

type Tab = 'portal' | 'breath' | 'claim';
const PHASES = [
  { name: 'Inhale', secs: 4 },
  { name: 'Hold', secs: 7 },
  { name: 'Exhale', secs: 8 },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('portal');
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [claimMsg, setClaimMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [pIndex, setPIndex] = useState(0);
  const [left, setLeft] = useState(4);

  useEffect(() => {
    loadCachedSession().then(setSession).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((n) => {
        if (n > 1) return n - 1;
        setPIndex((pi) => {
          if (pi < PHASES.length - 1) return pi + 1;
          setCycle((c) => {
            if (c >= 4) {
              setRunning(false);
              return 1;
            }
            return c + 1;
          });
          return 0;
        });
        return PHASES[(pIndex + 1) % PHASES.length].secs;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, pIndex]);

  async function onConnect() {
    setBusy(true);
    setStatus('');
    try {
      const s = await connectWallet();
      setSession(s);
      setStatus('Wallet connected');
    } catch {
      setStatus('Connect cancelled or no wallet found.');
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    await disconnectWallet();
    setSession(null);
    setStatus('');
  }

  async function onClaim() {
    if (!session) {
      setClaimMsg('Connect a wallet first.');
      return;
    }
    setClaimMsg('Claiming…');
    const result = await claimCmc37(email.trim(), session.address);
    setClaimMsg(result.message);
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>FIT</Text>
        <Text style={styles.sub}>Solana Mobile · Seeker</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {tab === 'portal' && (
          <View>
            <Text style={styles.h1}>Ancient balance.{\n}Modern power.</Text>
            <Text style={styles.p}>Yoga, Tai Chi, and vestibular work — claimed on-chain from your Seeker.</Text>
            <Pressable style={styles.primary} onPress={onConnect} disabled={busy}>
              <Text style={styles.primaryText}>
                {session ? shortAddress(session.address) : busy ? 'Connecting…' : 'Connect Seed Vault'}
              </Text>
            </Pressable>
            {session ? (
              <Pressable onPress={onDisconnect}><Text style={styles.link}>Disconnect</Text></Pressable>
            ) : null}
            {status ? <Text style={styles.muted}>{status}</Text> : null}
            <Text style={styles.label}>Five levels</Text>
            {['Yin Awakening', 'Yang Ignition', 'Fusion Harmony', 'Symbolic Elevation', 'Lotus Mastery'].map((name, i) => (
              <Pressable key={name} style={styles.card} onPress={() => (i === 0 ? setTab('breath') : null)}>
                <Text style={styles.muted}>0{i + 1}</Text>
                <Text style={styles.cardTitle}>{name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {tab === 'breath' && (
          <View style={styles.center}>
            <Text style={styles.label}>4 · 7 · 8</Text>
            <Text style={styles.h1}>Breathe deeply</Text>
            <Text style={styles.count}>{left}</Text>
            <Text style={styles.phase}>{running ? PHASES[pIndex].name : 'Ready'}</Text>
            <Text style={styles.muted}>{running ? `Cycle ${cycle} of 4` : 'Four cycles'}</Text>
            <Pressable style={styles.primary} onPress={() => {
              if (running) setRunning(false);
              else { setCycle(1); setPIndex(0); setLeft(4); setRunning(true); }
            }}>
              <Text style={styles.primaryText}>{running ? 'Pause' : 'Begin breath'}</Text>
            </Pressable>
          </View>
        )}
        {tab === 'claim' && (
          <View>
            <Text style={styles.h1}>Claim CMC37</Text>
            <Text style={styles.p}>Same signup as fusionfitportal.com. One claim per field.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" placeholderTextColor={COLORS.muted} value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Wallet</Text>
            <Text style={styles.walletLine}>{session ? session.address : 'Not connected'}</Text>
            {!session ? (
              <Pressable style={styles.primary} onPress={onConnect}><Text style={styles.primaryText}>Connect wallet</Text></Pressable>
            ) : (
              <Pressable style={styles.primary} onPress={onClaim}><Text style={styles.primaryText}>Claim 1 CMC37</Text></Pressable>
            )}
            {claimMsg ? <Text style={styles.muted}>{claimMsg}</Text> : null}
          </View>
        )}
      </ScrollView>
      <View style={styles.tabs}>
        {(['portal', 'breath', 'claim'] as Tab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.void },
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12 },
  brand: { color: '#fff', fontSize: 22, letterSpacing: 6, fontWeight: '500' },
  sub: { color: COLORS.amber, fontSize: 11, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  body: { padding: 22, paddingBottom: 40 },
  h1: { color: COLORS.text, fontSize: 32, lineHeight: 38, marginBottom: 12 },
  p: { color: COLORS.muted, fontSize: 16, lineHeight: 24, marginBottom: 22 },
  primary: { backgroundColor: COLORS.amber, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  primaryText: { color: COLORS.void, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', fontSize: 13 },
  link: { color: COLORS.amberSoft, textAlign: 'center', marginBottom: 10 },
  muted: { color: COLORS.muted, marginTop: 8, marginBottom: 8 },
  label: { color: COLORS.amber, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11, marginTop: 18, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 16, marginBottom: 10, backgroundColor: COLORS.card },
  cardTitle: { color: COLORS.text, fontSize: 18, marginTop: 4 },
  center: { alignItems: 'center', paddingTop: 20 },
  count: { color: '#fff', fontSize: 88, marginVertical: 8 },
  phase: { color: COLORS.amber, letterSpacing: 4, textTransform: 'uppercase', fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: '#000', color: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  walletLine: { color: COLORS.text, fontSize: 13, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.line, paddingBottom: 10 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 11 },
  tabOn: { color: COLORS.amberSoft },
});

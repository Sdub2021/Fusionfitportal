import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from './src/config';
import { claimCmc37 } from './src/claim';
import { deviceLabel, isSeekerDevice } from './src/seeker';
import {
  connectWallet,
  disconnectWallet,
  loadCachedSession,
  Session,
  shortAddress,
  signMessageWithWallet,
} from './src/wallet';

type Tab = 'home' | 'breath' | 'claim';

const PHASES = [
  { name: 'Inhale', secs: 4, hint: 'Nose in \u2014 soft and full' },
  { name: 'Hold', secs: 7, hint: 'Stillness at the top' },
  { name: 'Exhale', secs: 8, hint: 'Mouth out \u2014 slow release' },
] as const;

export default function App() {
  const seeker = isSeekerDevice();
  const [tab, setTab] = useState<Tab>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [claimMsg, setClaimMsg] = useState('');
  const [claimOk, setClaimOk] = useState<boolean | null>(null);
  const [signing, setSigning] = useState(false);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [pIndex, setPIndex] = useState(0);
  const [left, setLeft] = useState(4);
  const scale = useRef(new Animated.Value(0.72)).current;
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    loadCachedSession().then(setSession).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) {
      Animated.timing(scale, { toValue: 0.72, duration: 600, useNativeDriver: true }).start();
      return;
    }
    const p = PHASES[pIndex];
    if (p.name === 'Inhale') {
      Animated.timing(scale, { toValue: 1, duration: p.secs * 1000, useNativeDriver: true }).start();
    } else if (p.name === 'Exhale') {
      Animated.timing(scale, { toValue: 0.72, duration: p.secs * 1000, useNativeDriver: true }).start();
    }
  }, [running, pIndex, scale]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((n) => {
        if (n > 1) return n - 1;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setPIndex((pi) => {
          if (pi < PHASES.length - 1) {
            const next = pi + 1;
            setLeft(PHASES[next].secs);
            return next;
          }
          setCycle((c) => {
            if (c >= 4) {
              setRunning(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setLeft(PHASES[0].secs);
              return 1;
            }
            setLeft(PHASES[0].secs);
            return c + 1;
          });
          return 0;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const onConnect = useCallback(async () => {
    setBusy(true);
    setStatus('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const s = await connectWallet();
      setSession(s);
      setStatus(seeker ? 'Seed Vault linked \u00b7 biometrics ready' : 'Wallet connected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      setStatus('Connect cancelled \u2014 open Seed Vault or Phantom and try again.');
    } finally {
      setBusy(false);
    }
  }, [seeker]);

  const onDisconnect = useCallback(async () => {
    await disconnectWallet();
    setSession(null);
    setStatus('');
  }, []);

  const onClaim = useCallback(async () => {
    if (!session) {
      setClaimOk(false);
      setClaimMsg('Connect your wallet first.');
      return;
    }
    setSigning(true);
    setClaimMsg('Confirm with biometrics\u2026');
    setClaimOk(null);
    try {
      const msg = `FIT CMC37 claim\nwallet:${session.address}\nemail:${email.trim().toLowerCase()}\nts:${Date.now()}`;
      let signature: string | undefined;
      try {
        signature = await signMessageWithWallet(session.authToken, msg);
      } catch {
        signature = undefined;
      }
      const result = await claimCmc37(email, session.address, {
        signature,
        device: deviceLabel(),
      });
      setClaimOk(result.ok);
      setClaimMsg(result.message);
      if (result.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {
      setClaimOk(false);
      setClaimMsg('Something went wrong. Try again.');
    } finally {
      setSigning(false);
    }
  }, [session, email]);

  const startBreath = () => {
    setCycle(1);
    setPIndex(0);
    setLeft(4);
    setRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0c0c14', COLORS.void]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>FIT</Text>
          <Text style={styles.sub}>
            {seeker ? 'Seeker \u00b7 Seed Vault' : 'Solana Mobile'} \u00b7 Ancient balance
          </Text>
        </View>
        {session ? (
          <Pressable style={styles.chip} onPress={onDisconnect}>
            <View style={styles.dot} />
            <Text style={styles.chipText}>{shortAddress(session.address)}</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.chip, styles.chipGhost]} onPress={onConnect} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={COLORS.amber} size="small" />
            ) : (
              <Text style={styles.chipText}>{seeker ? 'Unlock Vault' : 'Connect'}</Text>
            )}
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {tab === 'home' && (
          <View>
            <Text style={styles.eyebrow}>\u2726 3-Day Cosmic Reset \u2726</Text>
            <Text style={styles.h1}>Ancient balance.{\n}Modern power.</Text>
            <Text style={styles.p}>
              Yoga, Tai Chi, and vestibular work \u2014 claimed from your phone with Seed Vault biometrics.
            </Text>
            {!session && (
              <Pressable style={styles.primary} onPress={onConnect} disabled={busy}>
                <Text style={styles.primaryText}>
                  {busy ? 'Opening wallet\u2026' : seeker ? 'Connect Seed Vault' : 'Connect wallet'}
                </Text>
              </Pressable>
            )}
            {status ? <Text style={styles.status}>{status}</Text> : null}
            {seeker && (
              <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Seeker ready</Text>
                <Text style={styles.bannerBody}>
                  Approvals use fingerprint / face. Keys never leave Seed Vault.
                </Text>
              </View>
            )}
            <Text style={styles.label}>The Path</Text>
            {[
              { n: '01', name: 'Yin Awakening', tab: 'breath' as Tab },
              { n: '02', name: 'Yang Ignition', tab: null },
              { n: '03', name: 'Fusion Harmony', tab: null },
              { n: '04', name: 'Symbolic Elevation', tab: null },
              { n: '05', name: 'Lotus Mastery', tab: null },
            ].map((item) => (
              <Pressable
                key={item.n}
                style={styles.card}
                onPress={() => item.tab && setTab(item.tab)}
              >
                <Text style={styles.cardNum}>{item.n}</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.tab ? <Text style={styles.cardCta}>Enter \u2192</Text> : null}
              </Pressable>
            ))}
          </View>
        )}
        {tab === 'breath' && (
          <View style={styles.center}>
            <Text style={styles.eyebrow}>4 \u00b7 7 \u00b7 8</Text>
            <Text style={styles.h1Center}>Breathe deeply</Text>
            <View style={styles.orbWrap}>
              <Animated.View
                style={[
                  styles.orbGlow,
                  { opacity: pulse, transform: [{ scale: Animated.multiply(scale, 1.15) }] },
                ]}
              />
              <Animated.View style={[styles.orb, { transform: [{ scale }] }]} />
              <View style={styles.countWrap}>
                <Text style={styles.count}>{running ? left : '4'}</Text>
              </View>
            </View>
            <Text style={styles.phase}>{running ? PHASES[pIndex].name : 'Ready'}</Text>
            <Text style={styles.hint}>{running ? PHASES[pIndex].hint : 'Four cycles \u00b7 soft body'}</Text>
            <Text style={styles.muted}>
              {running ? `Cycle ${Math.min(cycle, 4)} of 4` : 'Inhale 4 \u00b7 Hold 7 \u00b7 Exhale 8'}
            </Text>
            <Pressable style={styles.primary} onPress={() => (running ? setRunning(false) : startBreath())}>
              <Text style={styles.primaryText}>{running ? 'Pause' : 'Begin breath'}</Text>
            </Pressable>
          </View>
        )}
        {tab === 'claim' && (
          <View>
            <Text style={styles.eyebrow}>Entry</Text>
            <Text style={styles.h1}>Claim CMC37</Text>
            <Text style={styles.p}>
              Same signup as fusionfitportal.com. On Seeker, claim is sealed with a biometric signature.
            </Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@email.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.label}>Wallet</Text>
            <View style={styles.walletBox}>
              <Text style={styles.walletLine} numberOfLines={1}>
                {session ? session.address : 'Not connected'}
              </Text>
            </View>
            {!session ? (
              <Pressable style={styles.primary} onPress={onConnect} disabled={busy}>
                <Text style={styles.primaryText}>{seeker ? 'Unlock Seed Vault' : 'Connect wallet'}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primary} onPress={onClaim} disabled={signing}>
                <Text style={styles.primaryText}>{signing ? 'Confirm on device\u2026' : 'Claim 1 CMC37'}</Text>
              </Pressable>
            )}
            {claimMsg ? (
              <Text style={[styles.status, claimOk === true && styles.ok, claimOk === false && styles.err]}>
                {claimMsg}
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>
      <View style={styles.tabs}>
        {(
          [
            { id: 'home' as Tab, label: 'Portal' },
            { id: 'breath' as Tab, label: 'Breath' },
            { id: 'claim' as Tab, label: 'Claim' },
          ]
        ).map((t) => (
          <Pressable key={t.id} style={styles.tab} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabText, tab === t.id && styles.tabOn]}>{t.label}</Text>
            {tab === t.id ? <View style={styles.tabBar} /> : null}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.void },
  header: {
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { color: '#fff', fontSize: 22, letterSpacing: 7, fontWeight: '500' },
  sub: { color: COLORS.amber, fontSize: 10, letterSpacing: 1.6, marginTop: 3, textTransform: 'uppercase' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(232,165,75,0.35)', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(232,165,75,0.08)',
  },
  chipGhost: { borderColor: COLORS.line, backgroundColor: 'transparent' },
  chipText: { color: COLORS.amberSoft, fontSize: 12, letterSpacing: 0.4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  body: { padding: 20, paddingBottom: 36 },
  eyebrow: { color: COLORS.amber, letterSpacing: 3, textTransform: 'uppercase', fontSize: 11, marginBottom: 10 },
  h1: { color: COLORS.text, fontSize: 34, lineHeight: 40, marginBottom: 12, fontWeight: '500' },
  h1Center: { color: COLORS.text, fontSize: 28, marginBottom: 8, fontWeight: '500', textAlign: 'center' },
  p: { color: COLORS.muted, fontSize: 15, lineHeight: 23, marginBottom: 20 },
  primary: { backgroundColor: COLORS.amber, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginVertical: 8 },
  primaryText: { color: COLORS.void, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 13 },
  status: { color: COLORS.muted, marginTop: 10, marginBottom: 6, lineHeight: 20 },
  ok: { color: COLORS.success },
  err: { color: COLORS.danger },
  label: { color: COLORS.amber, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11, marginTop: 20, marginBottom: 10 },
  banner: {
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(232,165,75,0.25)',
    backgroundColor: 'rgba(232,165,75,0.06)', padding: 14, marginTop: 8, marginBottom: 4,
  },
  bannerTitle: { color: COLORS.amberSoft, fontWeight: '600', marginBottom: 4 },
  bannerBody: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  card: {
    borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 16, marginBottom: 10,
    backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardNum: { color: COLORS.muted, fontSize: 12, letterSpacing: 1, width: 28 },
  cardTitle: { color: COLORS.text, fontSize: 17, flex: 1 },
  cardCta: { color: COLORS.amber, fontSize: 12 },
  center: { alignItems: 'center', paddingTop: 12 },
  orbWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  orbGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(232,165,75,0.2)' },
  orb: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#f5c56a',
    shadowColor: '#e8a54b', shadowOpacity: 0.55, shadowRadius: 28, shadowOffset: { width: 0, height: 0 },
  },
  countWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  count: { color: '#1a1208', fontSize: 64, fontWeight: '500' },
  phase: { color: COLORS.amber, letterSpacing: 4, textTransform: 'uppercase', fontSize: 15, marginBottom: 6 },
  hint: { color: COLORS.text, fontSize: 15, marginBottom: 4 },
  muted: { color: COLORS.muted, marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: COLORS.line, backgroundColor: '#000', color: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 4, fontSize: 16,
  },
  walletBox: {
    borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 14,
    backgroundColor: COLORS.elevated, marginBottom: 8,
  },
  walletLine: { color: COLORS.text, fontSize: 13 },
  tabs: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.line,
    backgroundColor: COLORS.elevated, paddingBottom: 8,
  },
  tab: { flex: 1, paddingTop: 14, paddingBottom: 10, alignItems: 'center' },
  tabText: { color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1.6, fontSize: 11 },
  tabOn: { color: COLORS.amberSoft },
  tabBar: { marginTop: 6, height: 2, width: 28, borderRadius: 1, backgroundColor: COLORS.amber },
});

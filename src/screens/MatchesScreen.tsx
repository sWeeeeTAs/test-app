// Экран «Матчи тура» — задание в README.md, часть 1.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MATCHES_URL } from '../config';
import type { Match, MatchesResponse } from '../types';

// У каждого состояния свой набор полей.
// Не даст прочитать matches, если status 'loading'.
type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; matches: Match[]; round: number };

export function MatchesScreen() {
  const [state, setState] = useState<FetchState>({ status: 'loading' });
  // Триггер повторной загрузки для кнопки Повторить.
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    setState({ status: 'loading' });
    try {
      const response = await fetch(MATCHES_URL, { signal, cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as MatchesResponse;
      setState({ status: 'success', matches: data.matches, round: data.round });
    } catch (error) {
      if (signal.aborted) return; // отмена при размонтировании — не ошибка
      const message = error instanceof Error ? error.message : 'Не удалось загрузить данные';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const handleRetry = () => setReloadKey((k) => k + 1);

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Загружаем матчи…</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Не удалось загрузить матчи</Text>
        <Text style={styles.muted}>{state.message}</Text>
        <Pressable style={styles.button} onPress={handleRetry} accessibilityRole="button">
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  //! Заглушка
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тур {state.round}</Text>
      <Text style={styles.muted}>Загружено матчей: {state.matches.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  muted: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#b91c1c', textAlign: 'center' },
  button: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 8, backgroundColor: '#ef3124',
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
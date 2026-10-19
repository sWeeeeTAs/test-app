// Экран «Матчи тура» — задание в README.md, часть 1.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { MATCHES_URL } from '../config';
import type { Match, MatchesResponse } from '../types';

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; matches: Match[]; round: number };

// Сортировка: по startsAt по возрастанию, null в конец.
// Infinity больше любого timestamp, поэтому m7 (postponed без даты) уезжает вниз
function sortMatches(matches: Match[]): Match[] {
  const time = (m: Match) =>
    m.startsAt === null ? Number.POSITIVE_INFINITY : new Date(m.startsAt).getTime();
  // [...matches] важно: sort мутирует массив, нельзя сортировать state.matches напрямую
  return [...matches].sort((a, b) => time(a) - time(b));
}

export function MatchesScreen() {
  const [state, setState] = useState<FetchState>({ status: 'loading' });
  // Триггер повторной загрузки для кнопки "Повторить"
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    setState({ status: 'loading' });
    try {
      // cache: 'no-store', чтобы GitHub raw не отдавал кеш 5 минут (работает в вебе)
      const response = await fetch(MATCHES_URL, { signal, cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as MatchesResponse;
      setState({ status: 'success', matches: data.matches, round: data.round });
    } catch (error) {
      if (signal.aborted) return; // отмена при размонтировании не ошибка
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

  switch (state.status) {
    case 'loading':
      return (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Загружаем матчи…</Text>
        </View>
      );

    case 'error':
      return (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Не удалось загрузить матчи</Text>
          <Text style={styles.muted}>{state.message}</Text>
          <Pressable
            style={styles.button}
            onPress={handleRetry}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Повторить</Text>
          </Pressable>
        </View>
      );

    case 'success': {
      const sortedMatches = sortMatches(state.matches);
      return (
        <View style={styles.container}>
          <FlatList
            data={sortedMatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MatchCard match={item} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={<Text style={styles.title}>Тур {state.round}</Text>}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.muted}>Матчей пока нет</Text>
              </View>
            }
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
  separator: { height: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  muted: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#b91c1c', textAlign: 'center' },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef3124',
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
import { StyleSheet, Text, View } from 'react-native';
import type { Match, MatchStatus } from '../types';

// Форматтер создаём один раз на уровне модуля, переиспользуется между рендерами
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const STATUS_LABEL: Record<MatchStatus, string> = {
  finished: 'Завершён',
  live: 'Идёт',
  scheduled: 'Запланирован',
  postponed: 'Перенесён',
};

const STATUS_COLOR: Record<MatchStatus, string> = {
  finished: '#6b7280',
  live: '#dc2626',
  scheduled: '#2563eb',
  postponed: '#b45309',
};

function formatStart(iso: string | null): string {
  // m7 startsAt: null. Без этой проверки new Date(null) даст 01.01.1970
  if (iso === null) return 'Дата уточняется';
  return DATE_FORMATTER.format(new Date(iso));
}

function statusLabel(match: Match): string {
  const base = STATUS_LABEL[match.status];
  // minute есть только у live, typeof-проверка отсекает undefined
  if (match.status === 'live' && typeof match.minute === 'number') {
    return `${base} · ${match.minute}′`;
  }
  return base;
}

function scoreLabel(match: Match): string {
  // score === null (нет счёта)     !=    score = {home:0, away:0} (валидный 0:0)
  // Проверка на null, а НЕ на falsy. !match.score дал бы "-", для m2 - это баг
  if (match.score === null) return '—';
  return `${match.score.home} : ${match.score.away}`;
}

export function MatchCard({ match }: { match: Match }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatStart(match.startsAt)}</Text>
        <Text style={[styles.status, { color: STATUS_COLOR[match.status] }]}>
          {statusLabel(match)}
        </Text>
      </View>
      <View style={styles.teamsRow}>
        <Text style={[styles.team, styles.teamRight]} numberOfLines={1}>
          {match.home.name}
        </Text>
        <Text style={styles.score}>{scoreLabel(match)}</Text>
        <Text style={[styles.team, styles.teamLeft]} numberOfLines={1}>
          {match.away.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 12, color: '#6b7280' },
  status: { fontSize: 12, fontWeight: '600' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  team: { flex: 1, fontSize: 16, fontWeight: '600' },
  teamRight: { textAlign: 'right' },
  teamLeft: { textAlign: 'left' },
  score: { fontSize: 18, fontWeight: '700', minWidth: 56, textAlign: 'center' },
});
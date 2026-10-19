import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
//* Теперь хранит "какое сейчас время" (а не сколько прошло)
export function UpdatedAgo({ since }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    // cleanup: без него интервал тикает после размонтирования
    return () => clearInterval(id);
  }, []);

  const seconds = Math.max(0, Math.floor((now - since.getTime()) / 1000));

  return <Text style={styles.text}>{formatAgo(seconds)}</Text>;
}

// от 0 до 4 сек = «только что», всё,  что дальше = секунды, минуты.
function formatAgo(seconds: number): string {
  if (seconds < 5) return 'Обновлено только что';
  if (seconds < 60) return `Обновлено ${seconds} сек назад`;
  const minutes = Math.floor(seconds / 60);
  return `Обновлено ${minutes} мин назад`;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
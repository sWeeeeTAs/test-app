export type MatchStatus = 'finished' | 'live' | 'scheduled' | 'postponed';

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  startsAt: string | null;      // заставляет вспомнить про m7 при каждом обращении к startsAt (m7=null (перенесён, даты нет))
  status: MatchStatus;
  minute?: number;              // m4=есть только у live
  home: Team;
  away: Team;
  score: Score | null;          // m5/m6/m8=null; m2 (0:0)
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};
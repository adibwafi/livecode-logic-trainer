import { LeaderboardEntry, QuizTrack } from './types';

const STORAGE_KEY = 'livecode_quiz_leaderboard';

const DEFAULT_LEADERBOARD_DATA: LeaderboardEntry[] = [
  // Backend Track Seeds
  {
    id: 'seed-be-1',
    name: 'Aditya Pratama',
    companyTarget: 'Tokopedia Go Track',
    track: 'backend',
    score: 24250,
    accuracy: 96,
    correctCount: 24,
    totalQuestions: 25,
    date: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'seed-be-2',
    name: 'Dimas Wicaksono',
    companyTarget: 'GoTo Microservices',
    track: 'backend',
    score: 22800,
    accuracy: 92,
    correctCount: 23,
    totalQuestions: 25,
    date: '2026-09-11T14:15:00.000Z',
  },
  {
    id: 'seed-be-3',
    name: 'Kevin Santoso',
    companyTarget: 'DANA Fintech',
    track: 'backend',
    score: 21500,
    accuracy: 88,
    correctCount: 22,
    totalQuestions: 25,
    date: '2026-09-12T19:45:00.000Z',
  },
  {
    id: 'seed-be-4',
    name: 'Budi Hartono',
    companyTarget: 'BCA Digital',
    track: 'backend',
    score: 19800,
    accuracy: 80,
    correctCount: 20,
    totalQuestions: 25,
    date: '2026-09-13T11:00:00.000Z',
  },
  {
    id: 'seed-be-5',
    name: 'Rian Kurniawan',
    companyTarget: 'Shopee High Concurrency',
    track: 'backend',
    score: 18400,
    accuracy: 76,
    correctCount: 19,
    totalQuestions: 25,
    date: '2026-09-14T16:20:00.000Z',
  },

  // Frontend Track Seeds
  {
    id: 'seed-fe-1',
    name: 'Dewi Lestari',
    companyTarget: 'Traveloka Web Platform',
    track: 'frontend',
    score: 24600,
    accuracy: 96,
    correctCount: 24,
    totalQuestions: 25,
    date: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'seed-fe-2',
    name: 'Farhan Maulana',
    companyTarget: 'Tokopedia React Specialist',
    track: 'frontend',
    score: 23100,
    accuracy: 92,
    correctCount: 23,
    totalQuestions: 25,
    date: '2026-09-11T15:30:00.000Z',
  },
  {
    id: 'seed-fe-3',
    name: 'Nadia Salsabila',
    companyTarget: 'Blibli Frontend Tech',
    track: 'frontend',
    score: 21900,
    accuracy: 88,
    correctCount: 22,
    totalQuestions: 25,
    date: '2026-09-12T12:00:00.000Z',
  },
  {
    id: 'seed-fe-4',
    name: 'Anisa Rahma',
    companyTarget: 'Shopee Frontend OA',
    track: 'frontend',
    score: 20400,
    accuracy: 84,
    correctCount: 21,
    totalQuestions: 25,
    date: '2026-09-13T09:40:00.000Z',
  },
  {
    id: 'seed-fe-5',
    name: 'Bagus Setiawan',
    companyTarget: 'Astra Tech Track',
    track: 'frontend',
    score: 18900,
    accuracy: 80,
    correctCount: 20,
    totalQuestions: 25,
    date: '2026-09-14T17:10:00.000Z',
  }
];

export function getLeaderboard(track?: QuizTrack): LeaderboardEntry[] {
  if (typeof window === 'undefined') {
    return track ? DEFAULT_LEADERBOARD_DATA.filter((item) => item.track === track) : DEFAULT_LEADERBOARD_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: LeaderboardEntry[] = raw ? JSON.parse(raw) : DEFAULT_LEADERBOARD_DATA;

    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD_DATA));
    }

    if (track) {
      list = list.filter((item) => item.track === track);
    }

    // Sort by score descending
    return list.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('Failed reading leaderboard from localStorage', err);
    return track ? DEFAULT_LEADERBOARD_DATA.filter((item) => item.track === track) : DEFAULT_LEADERBOARD_DATA;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    date: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return newEntry;

  try {
    const current = getLeaderboard();
    const updated = [newEntry, ...current].sort((a, b) => b.score - a.score);
    // Keep top 50
    const trimmed = updated.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed writing to leaderboard in localStorage', err);
  }

  return newEntry;
}

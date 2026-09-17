export type QuizTrack = 'backend' | 'frontend';

export interface QuizOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  label: string; // The option text
}

export interface QuizQuestion {
  id: string;
  track: QuizTrack;
  category: string; // e.g. "Node.js Event Loop", "Database Indexing", "React 19 Re-render", "CSS Specificity"
  companyTag: string; // e.g. "Tokopedia OA", "Traveloka Core", "Shopee Technical", "DANA Fintech", "BCA Digital"
  difficulty: 'Junior-Mid' | 'Mid' | 'Mid-Senior' | 'Senior';
  question: string;
  codeSnippet?: string; // Optional code snippet (e.g. console.log / JS / SQL)
  codeLanguage?: string; // 'javascript' | 'typescript' | 'sql' | 'go'
  options: QuizOption[]; // 4 options
  correctOptionId: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string; // In-depth technical rationale & why it's tested
}

export interface QuizAnswerRecord {
  questionId: string;
  question: QuizQuestion;
  selectedOptionId: string | null; // null if timed out
  isCorrect: boolean;
  isTimeout: boolean;
  timeSpentSec: number;
  pointsEarned: number;
  streakAtAnswer: number;
}

export interface QuizSessionState {
  track: QuizTrack;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  answerRecords: QuizAnswerRecord[];
  sessionStartTime: number; // Unix timestamp
  isSessionFinished: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  companyTarget?: string;
  track: QuizTrack;
  score: number;
  accuracy: number; // Percentage (e.g. 92)
  correctCount: number;
  totalQuestions: number;
  date: string; // ISO string
}

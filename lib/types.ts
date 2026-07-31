export interface Problem {
  id: string;
  title: string;
  role: 'Backend Engineer' | 'Frontend Engineer' | 'Full Stack Engineer' | 'QA Engineer' | 'DevOps Engineer';
  level: 'Mid-Level' | 'Senior' | 'Junior';
  timeLimit: number; // in minutes
  category: string;
  description: string;
  starterCode: string;
  bonusQuestion: string;
  idealSolution: string;
  testCases: TestCase[];
}

export interface TestCase {
  id: string;
  name: string;
  input: {
    userId: number;
    voucherCode: string;
  };
  expectedStatus: number;
  expectedMessageSubstring?: string;
  setupFn?: string;
}

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  actualStatus?: number;
  actualBody?: unknown;
  error?: string;
}

export interface TestRunResult {
  passedCount: number;
  totalCount: number;
  results: TestResultItem[];
  logs: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type RecruiterPersona = 'indo-tech-lead' | 'faang-interviewer' | 'yc-founder';

export interface AssessmentResult {
  score: number; // 0 - 100
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  summary: string;
  errors: string[];
  bestPractices: string[];
  edgeCasesPassed: string[];
  edgeCasesMissed: string[];
  bonusEvaluation: string;
  idealSolution: string;
  achievements?: Achievement[];
}


import Groq from 'groq-sdk';
import { runLocalTests } from './evaluator';
import { AssessmentResult, Problem, TestRunResult } from './types';

/**
 * Checks whether a Groq API error is a daily token rate limit error (TPD exhausted).
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number }).status;
  return (
    status === 429 ||
    msg.toLowerCase().includes('rate limit') ||
    msg.toLowerCase().includes('tokens per day') ||
    msg.toLowerCase().includes('tpd')
  );
}

/**
 * Generates dynamic best practice hints based on test outcomes.
 */
function generateBestPractices(failedTests: ReturnType<typeof runLocalTests>['results'], problemTitle: string): string[] {
  return [
    'Pastikan setiap endpoint memvalidasi request body secara ketat sebelum memproses data.',
    'Gunakan HTTP status code yang tepat: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests.',
    'Implementasikan penanganan error dengan try/catch dan kembalikan pesan error yang informatif.',
    `Problem "${problemTitle}" mengharuskan penanganan edge case: ${
      failedTests.length > 0
        ? failedTests.map((r) => r.name).slice(0, 3).join(', ')
        : 'semua sudah ditangani dengan baik'
    }.`,
  ];
}

/**
 * Builds a rich fallback AssessmentResult from local test execution only,
 * used when the Groq API key is absent or the daily token quota is exceeded.
 */
export function buildFallbackAssessment(
  testRun: TestRunResult,
  problem: Problem,
  reason: 'no_api_key' | 'rate_limited'
): AssessmentResult {
  const score = Math.round((testRun.passedCount / Math.max(testRun.totalCount, 1)) * 100);
  const status: 'PASS' | 'PARTIAL' | 'FAIL' =
    score >= 90 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';

  const failedTests = testRun.results.filter((r) => !r.passed);
  const passedTests = testRun.results.filter((r) => r.passed);

  const rateLimitNote =
    reason === 'rate_limited'
      ? '⚠️ Groq AI daily token quota (TPD) telah tercapai — penilaian ini menggunakan Local Test Engine saja. AI deep-review akan tersedia kembali hingga batas reset harian.'
      : '⚠️ GROQ_API_KEY belum dikonfigurasi — menggunakan Local Test Engine. Set GROQ_API_KEY di .env.local untuk mengaktifkan AI deep-code review.';

  const summaryText =
    score >= 90
      ? `Luar biasa! Kode Anda berhasil melewati ${testRun.passedCount} dari ${testRun.totalCount} automated test cases. Solusi Anda terlihat sudah benar secara logika.`
      : score >= 50
      ? `Progres yang baik. Kode Anda melewati ${testRun.passedCount} dari ${testRun.totalCount} test cases. Masih terdapat ${failedTests.length} kasus yang perlu diperbaiki.`
      : `Kode Anda melewati ${testRun.passedCount} dari ${testRun.totalCount} test cases. Perlu perbaikan signifikan pada validasi request body, pengecekan kondisi, dan HTTP status code yang tepat.`;

  return {
    score,
    status,
    summary: `${summaryText} ${rateLimitNote}`,
    errors: failedTests.map((r) => `${r.name}: ${r.error || 'Failed'}`),
    bestPractices: generateBestPractices(failedTests, problem.title),
    edgeCasesPassed: passedTests.map((r) => r.name),
    edgeCasesMissed: failedTests.map((r) => r.name),
    bonusEvaluation:
      reason === 'rate_limited'
        ? `🤖 AI Bonus Evaluation tidak tersedia saat ini karena batas token harian Groq API telah tercapai. Jawaban bonus Anda akan dievaluasi secara AI setelah kuota reset. Pastikan Anda telah menuliskan penjelasan konseptual yang lengkap di komentar kode.`
        : `🤖 Konfigurasi GROQ_API_KEY di .env.local untuk mendapatkan evaluasi AI mendalam atas pertanyaan bonus konseptual Anda (${problem.bonusQuestion}).`,
    idealSolution: problem.idealSolution,
  };
}

/**
 * Builds the LLM Prompt for code evaluation.
 */
function buildAssessmentPrompt(
  problem: Problem,
  userCode: string,
  testRun: TestRunResult,
  timeSpentMinutes: number
): string {
  return `
You are a Senior Full Stack Engineer & Technical Interviewer evaluating a candidate's code submission for a Live-Coding Interview.

Problem Title: "${problem.title}"
Target Role: ${problem.role} (${problem.level})
Time Limit: ${problem.timeLimit} minutes (Candidate spent: ${timeSpentMinutes} minutes)

Problem Description & Requirements:
${problem.description}

Candidate's Submitted Code:
\`\`\`javascript
${userCode}
\`\`\`

Automated Unit Test Results:
- Passed: ${testRun.passedCount} / ${testRun.totalCount}
${testRun.results.map((r) => `- [${r.passed ? 'PASS' : 'FAIL'}] ${r.name}: ${r.error || 'OK'}`).join('\n')}

Instructions:
Evaluate the candidate's code thoroughly on:
1. Correctness & Logical Errors: Check if all validation rules and business logic are correctly implemented.
2. Edge Cases: Check if missing/invalid request body params are handled gracefully.
3. Best Practices: Evaluate modularity, clean HTTP status code usage, proper array methods, and code readability.
4. Conceptual Bonus Question Evaluation: Read the comments in the candidate's submitted code. Evaluate how well they answered the bonus conceptual question.

Return ONLY a single valid JSON object matching this EXACT structure:
{
  "score": <number between 0 and 100>,
  "status": "<PASS | PARTIAL | FAIL>",
  "summary": "<2 sentence overview of candidate performance>",
  "errors": ["<list of specific logic errors or unhandled edge cases>"],
  "bestPractices": ["<list of actionable best practice recommendations>"],
  "edgeCasesPassed": ["<list of edge cases correctly handled>"],
  "edgeCasesMissed": ["<list of edge cases missed>"],
  "bonusEvaluation": "<detailed assessment of the candidate's text answer regarding the bonus question>",
  "idealSolution": "<the complete ideal refactored clean solution in JavaScript Express.js>"
}
`;
}

/**
 * Evaluates candidate code using Groq LLM with automatic graceful fallback.
 */
export async function evaluateCodeWithAI(params: {
  problem: Problem;
  userCode: string;
  timeSpentSeconds: number;
  testRun: TestRunResult;
  apiKey?: string;
}): Promise<AssessmentResult> {
  const { problem, userCode, timeSpentSeconds, testRun, apiKey } = params;

  if (!apiKey) {
    return buildFallbackAssessment(testRun, problem, 'no_api_key');
  }

  const groq = new Groq({ apiKey });
  const timeSpentMinutes = Math.round((timeSpentSeconds || 0) / 60);
  const prompt = buildAssessmentPrompt(problem, userCode, testRun, timeSpentMinutes);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical interviewer API that returns strictly raw JSON responses conforming to requested schemas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';
    const assessment: AssessmentResult = JSON.parse(responseText);
    return assessment;
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
      console.warn('[assess] Groq TPD rate limit reached — falling back to local evaluation.');
      return buildFallbackAssessment(testRun, problem, 'rate_limited');
    }
    throw error;
  }
}

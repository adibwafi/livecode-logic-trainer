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
 * Generates dynamic best practice hints based on problem definition and test outcomes.
 */
function generateBestPractices(
  failedTests: ReturnType<typeof runLocalTests>['results'],
  problem: Problem
): string[] {
  const list: string[] = [];

  if (problem.bestPractices && problem.bestPractices.length > 0) {
    list.push(...problem.bestPractices);
  } else {
    list.push('Pastikan setiap fungsi / endpoint memvalidasi parameter input dan request body secara ketat sebelum eksekusi.');
    list.push('Gunakan struktur data dan algoritma optimal dengan kompleksitas waktu & memori terbaik.');
    list.push('Implementasikan penanganan error (try/catch atau guard clauses) dengan feedback pesan yang jelas.');
  }

  if (failedTests.length > 0) {
    list.push(
      `Perhatikan edge case yang belum lolos pengujian: ${failedTests.map((r) => r.name).slice(0, 2).join('; ')}.`
    );
  }

  return list;
}

/**
 * Builds a rich fallback AssessmentResult from local test execution and problem definitions,
 * used when the Groq API key is absent or the daily token quota is exceeded or API fails.
 */
export function buildFallbackAssessment(
  testRun: TestRunResult,
  problem: Problem,
  reason: 'no_api_key' | 'rate_limited' | 'api_error'
): AssessmentResult {
  const score = Math.round((testRun.passedCount / Math.max(testRun.totalCount, 1)) * 100);
  const status: 'PASS' | 'PARTIAL' | 'FAIL' =
    score >= 90 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';

  const failedTests = testRun.results.filter((r) => !r.passed);
  const passedTests = testRun.results.filter((r) => r.passed);

  const note =
    reason === 'rate_limited'
      ? '⚠️ Groq AI token harian (TPD) tercapai — penilaian disajikan oleh Local Test Engine & Solusi Ideal Terverifikasi.'
      : reason === 'no_api_key'
      ? '⚠️ GROQ_API_KEY belum terpasang — evaluasi dijalankan melalui Local Test Engine & Template Solusi Terverifikasi.'
      : '⚠️ Terjadi kendala respon dari Groq AI — beralih otomatis ke evaluasi terstruktur Local Test Engine.';

  const summaryText =
    score >= 90
      ? `Luar biasa! Kode Anda berhasil melewati ${testRun.passedCount} dari ${testRun.totalCount} automated test cases. Solusi Anda sudah tepat secara logika dan efisien.`
      : score >= 50
      ? `Progres yang baik! Kode Anda melewati ${testRun.passedCount} dari ${testRun.totalCount} test cases. Periksa kembali ${failedTests.length} skenario pengujian yang belum terpenuhi.`
      : `Kode Anda melewati ${testRun.passedCount} dari ${testRun.totalCount} test cases. Tinjau kembali aturan validasi, penanganan nilai batas/edge cases, dan format nilai kembalian.`;

  return {
    score,
    status,
    summary: `${summaryText} (${note})`,
    errors:
      failedTests.length > 0
        ? failedTests.map((r) => `${r.name}: ${r.error || 'Assertion failed'}`)
        : [],
    bestPractices: generateBestPractices(failedTests, problem),
    edgeCasesPassed: passedTests.map((r) => r.name),
    edgeCasesMissed: failedTests.map((r) => r.name),
    bonusEvaluation: problem.bonusRubric
      ? `💡 Pertanyaan Bonus: "${problem.bonusQuestion}"\n\n📌 Poin Kunci Jawaban:\n${problem.bonusRubric.points.map(p => `• ${p}`).join('\n')}\n\nPastikan penjelasan ini dicantumkan dalam komentar kode Anda.`
      : `💡 Pertanyaan Bonus: "${problem.bonusQuestion}"\n\nPastikan Anda menyertakan penjelasan konseptual mengenai strategi concurrency/optimasi algoritma di dalam komentar kode.`,
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
You are a Senior Staff Engineer & Technical Interviewer conducting a Live-Coding Interview assessment.

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

Bonus Question Asked:
"${problem.bonusQuestion}"

Instructions:
1. Score the submission between 0 and 100 based on test results, code quality, correctness, and bonus question explanation.
2. Provide a list of specific issues/errors detected. If no issues, provide an empty array [].
3. Provide actionable best practices (3-5 points) specific to this problem.
4. Evaluate if the candidate answered the bonus conceptual question in their code comments.
5. Provide the ideal clean solution in the "idealSolution" field.

Return ONLY a single valid JSON object matching this EXACT structure with no extra markdown formatting outside JSON:
{
  "score": <number between 0 and 100>,
  "status": "<PASS | PARTIAL | FAIL>",
  "summary": "<2 sentence overview of candidate performance>",
  "errors": ["<list of specific logic errors or unhandled edge cases>"],
  "bestPractices": ["<list of actionable best practice recommendations>"],
  "edgeCasesPassed": ["<list of edge cases correctly handled>"],
  "edgeCasesMissed": ["<list of edge cases missed>"],
  "bonusEvaluation": "<detailed assessment of the candidate's answer regarding the bonus question>",
  "idealSolution": "<the complete ideal clean solution in JavaScript>"
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

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    return buildFallbackAssessment(testRun, problem, 'no_api_key');
  }

  const groq = new Groq({ apiKey });
  const timeSpentMinutes = Math.round((timeSpentSeconds || 0) / 60);
  const prompt = buildAssessmentPrompt(problem, userCode, testRun, timeSpentMinutes);

  const candidateModels = [
    process.env.GROQ_MODEL,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ].filter((m): m is string => Boolean(m && m.trim().length > 0));

  const uniqueModels = Array.from(new Set(candidateModels));

  for (const model of uniqueModels) {
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
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
      const cleanedJson = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const rawAssessment = JSON.parse(cleanedJson);

      const score = Math.max(0, Math.min(100, Math.round(Number(rawAssessment.score) || 0)));
      let status: 'PASS' | 'PARTIAL' | 'FAIL' = 'FAIL';
      const statusStr = String(rawAssessment.status || '').toUpperCase();
      if (statusStr === 'PASS' || (score >= 90 && !statusStr.includes('FAIL') && !statusStr.includes('PARTIAL') && !statusStr.includes('ISSUE'))) {
        status = 'PASS';
      } else if (statusStr.includes('PARTIAL') || statusStr.includes('ISSUE') || (score >= 50 && score < 90)) {
        status = 'PARTIAL';
      } else {
        status = 'FAIL';
      }

      const assessment: AssessmentResult = {
        score,
        status,
        summary:
          typeof rawAssessment.summary === 'string' && rawAssessment.summary.trim()
            ? rawAssessment.summary
            : `Evaluasi selesai dengan skor ${score}/100.`,
        errors: Array.isArray(rawAssessment.errors) ? rawAssessment.errors.map(String) : [],
        bestPractices:
          Array.isArray(rawAssessment.bestPractices) && rawAssessment.bestPractices.length > 0
            ? rawAssessment.bestPractices.map(String)
            : generateBestPractices(
                testRun.results.filter((r) => !r.passed),
                problem
              ),
        edgeCasesPassed: Array.isArray(rawAssessment.edgeCasesPassed)
          ? rawAssessment.edgeCasesPassed.map(String)
          : testRun.results.filter((r) => r.passed).map((r) => r.name),
        edgeCasesMissed: Array.isArray(rawAssessment.edgeCasesMissed)
          ? rawAssessment.edgeCasesMissed.map(String)
          : testRun.results.filter((r) => !r.passed).map((r) => r.name),
        bonusEvaluation:
          typeof rawAssessment.bonusEvaluation === 'string' && rawAssessment.bonusEvaluation.trim()
            ? rawAssessment.bonusEvaluation
            : `Pertanyaan Bonus: ${problem.bonusQuestion}`,
        idealSolution:
          typeof rawAssessment.idealSolution === 'string' && rawAssessment.idealSolution.trim()
            ? rawAssessment.idealSolution
            : problem.idealSolution,
      };

      return assessment;
    } catch (error: unknown) {
      if (isRateLimitError(error)) {
        console.warn('[assess] Groq TPD rate limit reached — falling back to local evaluation.');
        return buildFallbackAssessment(testRun, problem, 'rate_limited');
      }

      const isModelNotFoundError =
        (error as { status?: number })?.status === 404 ||
        String(error).toLowerCase().includes('model_not_found') ||
        String(error).toLowerCase().includes('does not exist');

      if (isModelNotFoundError) {
        console.warn(`[assess] Model "${model}" is not available for this API key, trying next model...`);
        continue;
      }

      console.warn(`[assess] Groq API error on model "${model}" — falling back to rich local evaluation:`, error);
      return buildFallbackAssessment(testRun, problem, 'api_error');
    }
  }

  console.warn('[assess] All Groq candidate models exhausted — falling back to rich local evaluation.');
  return buildFallbackAssessment(testRun, problem, 'api_error');
}

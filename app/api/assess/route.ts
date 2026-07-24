import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { runLocalTests } from '@/lib/evaluator';
import { PROBLEMS } from '@/lib/problems';
import { AssessmentResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { problemId, userCode, timeSpent } = await req.json();

    const problem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];

    // 1. Run isolated unit test runner first to gather concrete test execution facts
    const testRun = runLocalTests(userCode);

    // 2. Check for Groq API key
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Fallback evaluation if no GROQ_API_KEY is set
      const score = Math.round((testRun.passedCount / Math.max(testRun.totalCount, 1)) * 100);
      const status: 'PASS' | 'PARTIAL' | 'FAIL' =
        score >= 90 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';

      const fallbackResult: AssessmentResult = {
        score,
        status,
        summary: `Local execution passed ${testRun.passedCount} out of ${testRun.totalCount} automated logic checks. Note: Set GROQ_API_KEY in .env.local for AI deep-code review.`,
        errors: testRun.results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.error || 'Failed'}`),
        bestPractices: [
          'Ensure strict request body validation (e.g., validate userId and voucherCode presence).',
          'Use defensive programming when mutating in-memory array state.',
          'Return appropriate HTTP Status Codes (400 for Bad Request, 404 for Not Found, 200 for OK).'
        ],
        edgeCasesPassed: testRun.results.filter((r) => r.passed).map((r) => r.name),
        edgeCasesMissed: testRun.results.filter((r) => !r.passed).map((r) => r.name),
        bonusEvaluation:
          'Bonus Question: To evaluate your explanation of Postgres Race Conditions (SELECT FOR UPDATE, Unique Constraints, Atomic Updates), please configure GROQ_API_KEY.',
        idealSolution: problem.idealSolution
      };

      return NextResponse.json(fallbackResult);
    }

    // 3. LLM API Integration with Groq (Llama-3.3-70b-versatile)
    const groq = new Groq({ apiKey });

    const prompt = `
You are a Senior Full Stack Engineer & Technical Interviewer evaluating a candidate's code submission for a Live-Coding Interview.

Problem Title: "${problem.title}"
Target Role: ${problem.role} (${problem.level})
Time Limit: ${problem.timeLimit} minutes (Candidate spent: ${Math.round((timeSpent || 0) / 60)} minutes)

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
1. Correctness & Logical Errors: Check if all 3 validation rules (Voucher existence, User uniqueness, Quota > 0) are correctly implemented.
2. Edge Cases: Check if missing request body params (userId, voucherCode) or improper data types are handled.
3. Best Practices: Evaluate modularity, clean HTTP status code usage (200, 400, 404, 500), proper array methods (.find, .some, .push), and code readability.
4. Conceptual Bonus Question Evaluation: Read the comments in the candidate's submitted code. Did they correctly explain handling PostgreSQL race conditions using Database Transactions (SELECT FOR UPDATE), Unique Constraints on (user_id, voucher_code), or Atomic Update queries (quota = quota - 1)? Provide clear feedback on their bonus answer.

Return ONLY a single valid JSON object matching this EXACT structure:
{
  "score": <number between 0 and 100>,
  "status": "<PASS | PARTIAL | FAIL>",
  "summary": "<2 sentence overview of candidate performance>",
  "errors": ["<list of specific logic errors or unhandled edge cases>"],
  "bestPractices": ["<list of actionable best practice recommendations>"],
  "edgeCasesPassed": ["<list of edge cases correctly handled>"],
  "edgeCasesMissed": ["<list of edge cases missed>"],
  "bonusEvaluation": "<detailed assessment of the candidate's text answer regarding PostgreSQL race conditions>",
  "idealSolution": "<the complete ideal refactored clean solution in JavaScript Express.js>"
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer API that returns strictly raw JSON responses conforming to requested schemas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';

    const assessment: AssessmentResult = JSON.parse(responseText);

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Assessment API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process assessment via Groq',
        details: error.message
      },
      { status: 500 }
    );
  }
}

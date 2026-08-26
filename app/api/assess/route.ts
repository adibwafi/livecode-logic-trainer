import { NextRequest, NextResponse } from 'next/server';
import { runLocalTests } from '@/lib/evaluator';
import { PROBLEMS } from '@/lib/problems';
import { evaluateCodeWithAI } from '@/lib/ai-assessment';

// Maximum accepted code payload size (64 KB) to protect backend from abuse
const MAX_CODE_LENGTH = 65536;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request body' },
        { status: 400 }
      );
    }

    const { problemId, userCode, timeSpent } = body;

    // 1. Input Validation (Clean defensive programming)
    if (typeof userCode !== 'string' || userCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'userCode is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (userCode.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Submitted code exceeds maximum limit of ${MAX_CODE_LENGTH} characters` },
        { status: 413 }
      );
    }

    // 2. Problem Resolution
    const problem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];

    // 3. Isolated Unit Test Execution
    const testRun = runLocalTests(userCode);

    // 4. AI Deep Assessment with Fallback
    const assessment = await evaluateCodeWithAI({
      problem,
      userCode,
      timeSpentSeconds: typeof timeSpent === 'number' ? timeSpent : 0,
      testRun,
      apiKey: process.env.GROQ_API_KEY,
    });

    return NextResponse.json(assessment);
  } catch (error: unknown) {
    console.error('[POST /api/assess] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process assessment',
        details: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    );
  }
}

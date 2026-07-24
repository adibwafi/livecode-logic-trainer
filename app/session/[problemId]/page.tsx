'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PROBLEMS } from '@/lib/problems';
import SessionHeader from '@/components/SessionHeader';
import ProblemPanel from '@/components/ProblemPanel';
import EditorPanel from '@/components/EditorPanel';
import ConsolePanel from '@/components/ConsolePanel';
import ResultsModal from '@/components/ResultsModal';
import { runLocalTests } from '@/lib/evaluator';
import { AssessmentResult, TestRunResult } from '@/lib/types';

export default function ProblemSessionPage() {
  const params = useParams();
  const problemId = (params?.problemId as string) || 'voucher-redemption';
  const problem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];

  const [code, setCode] = useState<string>(problem.starterCode);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);

  const [testRun, setTestRun] = useState<TestRunResult | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Run local isolated tests
  const handleRunTests = useCallback(() => {
    const res = runLocalTests(code);
    setTestRun(res);
    setIsConsoleOpen(true);
  }, [code]);

  // Handle Assessment submission to backend API
  const handleSubmitAssessment = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          userCode: code,
          timeSpent: secondsSpent
        })
      });

      const data = await res.json();
      setAssessmentResult(data);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to evaluate code. Please check your internet connection or server.');
    } finally {
      setIsSubmitting(false);
    }
  }, [problem.id, code, secondsSpent]);

  // Timer finished event -> Auto Submit & Lock Editor
  const handleTimeUp = useCallback(() => {
    setIsReadOnly(true);
    handleSubmitAssessment();
  }, [handleSubmitAssessment]);

  const handleTimeUpdate = useCallback(
    (leftSec: number) => {
      setSecondsSpent(problem.timeLimit * 60 - leftSec);
    },
    [problem.timeLimit]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Session Top Bar Header */}
      <SessionHeader
        problem={problem}
        onTimeUp={handleTimeUp}
        isTimerPaused={isTimerPaused}
        onToggleTimerPause={() => setIsTimerPaused(!isTimerPaused)}
        onRunTests={handleRunTests}
        onSubmitAssessment={handleSubmitAssessment}
        isSubmitting={isSubmitting}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Main Split-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Markdown Problem Description (40% width) */}
        <div className="w-[42%] min-w-[320px] max-w-[600px] h-full flex flex-col border-r border-zinc-800/80">
          <ProblemPanel problem={problem} />
        </div>

        {/* Right Pane: Code Editor + Console (58% width) */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-zinc-950">
          <div className="flex-1 overflow-hidden">
            <EditorPanel
              code={code}
              onChange={setCode}
              isReadOnly={isReadOnly || isSubmitting}
              onReset={() => setCode(problem.starterCode)}
            />
          </div>

          {/* Bottom Console Panel */}
          <ConsolePanel
            testRun={testRun}
            onRunTests={handleRunTests}
            isOpen={isConsoleOpen}
            onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
          />
        </div>
      </div>

      {/* Results Assessment Modal Overlay */}
      {assessmentResult && (
        <ResultsModal
          result={assessmentResult}
          problem={problem}
          onClose={() => setAssessmentResult(null)}
          onRetry={() => {
            setAssessmentResult(null);
            setIsReadOnly(false);
          }}
        />
      )}
    </div>
  );
}

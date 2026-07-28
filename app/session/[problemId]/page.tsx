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
import { AssessmentResult, TestRunResult, RecruiterPersona } from '@/lib/types';
import { playTestRunSound, playSuccessSound, playErrorSound, playFanfareSound } from '@/lib/soundFX';


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

  const [persona, setPersona] = useState<RecruiterPersona>('indo-tech-lead');


  // Run local isolated tests with Web Audio cues
  const handleRunTests = useCallback(() => {
    playTestRunSound();
    const res = runLocalTests(code);
    setTestRun(res);
    setIsConsoleOpen(true);

    if (res.passedCount === res.totalCount && res.totalCount > 0) {
      setTimeout(() => playSuccessSound(), 120);
    } else {
      setTimeout(() => playErrorSound(), 120);
    }
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

      const data: AssessmentResult = await res.json();

      // Calculate achievement badges
      const achievements = [];
      const totalSec = problem.timeLimit * 60;

      if (secondsSpent > 0 && secondsSpent <= totalSec * 0.5) {
        achievements.push({
          id: 'speed-demon',
          title: '⚡ Speed Demon',
          description: 'Selesai dalam waktu kurang dari separuh alokasi!',
          icon: '⚡'
        });
      }

      if (testRun && testRun.passedCount === testRun.totalCount && testRun.totalCount > 0) {
        achievements.push({
          id: 'zero-bug',
          title: '🛡️ Zero Bug Ninja',
          description: '100% unit test lokal lulus tanpa cela!',
          icon: '🛡️'
        });
      }

      if (code.includes('JAWABAN') && code.length > 500) {
        achievements.push({
          id: 'architecture-guru',
          title: '🧠 Architecture Guru',
          description: 'Menjawab pertanyaan bonus arsitektur dengan komprehensif!',
          icon: '🧠'
        });
      }

      if (secondsSpent >= totalSec - 180) {
        achievements.push({
          id: 'clutch-master',
          title: '🔥 Clutch Master',
          description: 'Menyelesaikan koding di 3 menit terakhir!',
          icon: '🔥'
        });
      }

      data.achievements = achievements;
      setAssessmentResult(data);

      if (data.status === 'PASS' || data.score >= 80) {
        playFanfareSound();
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to evaluate code. Please check your internet connection or server.');
    } finally {
      setIsSubmitting(false);
    }
  }, [problem.id, problem.timeLimit, code, secondsSpent, testRun]);

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
    <div className="flex flex-col h-screen w-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans selection:bg-violet-100 selection:text-zinc-900">
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
        secondsSpent={secondsSpent}
        testRun={testRun}
        persona={persona}
        onPersonaChange={setPersona}
      />

      {/* Main Split-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Markdown Problem Description (40% width) */}
        <div className="w-[42%] min-w-[320px] max-w-[600px] h-full flex flex-col border-r border-zinc-200">
          <ProblemPanel problem={problem} />
        </div>

        {/* Right Pane: Code Editor + Console (58% width) */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
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

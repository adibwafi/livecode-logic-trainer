'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { PROBLEMS } from '@/lib/problems';
import SessionHeader from '@/components/SessionHeader';
import ProblemPanel from '@/components/ProblemPanel';
import EditorPanel from '@/components/EditorPanel';
import ConsolePanel from '@/components/ConsolePanel';
import ResultsModal from '@/components/ResultsModal';
import { runLocalTests } from '@/lib/evaluator';
import { AssessmentResult, TestRunResult, RecruiterPersona } from '@/lib/types';
import { playTestRunSound, playSuccessSound, playErrorSound, playFanfareSound } from '@/lib/soundFX';
import { useAppStore } from '@/lib/store';

// ─── Drag-to-resize hook ──────────────────────────────────────────────────────

function useResizableSplit(initialPercent = 42) {
  const [splitPercent, setSplitPercent] = useState(initialPercent);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(Math.max(raw, 25), 65));
    };

    const onUp = () => setIsDragging(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  return { splitPercent, isDragging, handleMouseDown, containerRef };
}

// ─── Worker-backed test runner ────────────────────────────────────────────────

function useWorkerRunner() {
  const workerRef = useRef<Worker | null>(null);

  const runViaWorker = useCallback(
    (code: string, problemId: string): Promise<TestRunResult> => {
      return new Promise((resolve, reject) => {
        // Kill stale worker
        if (workerRef.current) workerRef.current.terminate();

        const worker = new Worker('/workers/executor.worker.js');
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const { type, payload } = e.data;
          worker.terminate();
          workerRef.current = null;
          if (type === 'RESULT') resolve(payload as TestRunResult);
          else reject(new Error(payload.message));
        };
        worker.onerror = (err) => {
          worker.terminate();
          workerRef.current = null;
          reject(err);
        };

        worker.postMessage({ type: 'RUN', payload: { code, problemId } });
      });
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  return { runViaWorker };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProblemSessionPage() {
  const params = useParams();
  const problemId = (params?.problemId as string) || 'voucher-redemption';
  const problem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];

  // Zustand draft state
  const { setDraft, markComplete, drafts } = useAppStore();
  const savedDraft = drafts[problemId]?.code;

  const [code, setCode] = useState<string>(savedDraft ?? problem.starterCode);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      // Debounced draft save — 500ms
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        setDraft(problemId, newCode);
      }, 500);
    },
    [problemId, setDraft]
  );

  // Restore latest draft on problem change
  useEffect(() => {
    const draft = drafts[problemId]?.code;
    setCode(draft ?? problem.starterCode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);

  const [testRun, setTestRun] = useState<TestRunResult | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isWorkerRunning, setIsWorkerRunning] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const [persona, setPersona] = useState<RecruiterPersona>('indo-tech-lead');

  // Drag-to-resize split pane
  const { splitPercent, isDragging, handleMouseDown, containerRef } = useResizableSplit(42);

  // Worker runner
  const { runViaWorker } = useWorkerRunner();

  // Run local tests — try Web Worker first, fallback to synchronous
  const handleRunTests = useCallback(async () => {
    playTestRunSound();
    setIsWorkerRunning(true);
    setIsConsoleOpen(true);

    try {
      const res = await runViaWorker(code, problemId);
      setTestRun(res);
      if (res.passedCount === res.totalCount && res.totalCount > 0) {
        setTimeout(() => playSuccessSound(), 120);
      } else {
        setTimeout(() => playErrorSound(), 120);
      }
    } catch {
      // Worker failed — fallback to synchronous evaluator
      const res = runLocalTests(code);
      setTestRun(res);
      if (res.passedCount === res.totalCount && res.totalCount > 0) {
        setTimeout(() => playSuccessSound(), 120);
      } else {
        setTimeout(() => playErrorSound(), 120);
      }
    } finally {
      setIsWorkerRunning(false);
    }
  }, [code, problemId, runViaWorker]);

  // Handle Assessment submission to backend API
  const handleSubmitAssessment = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, userCode: code, timeSpent: secondsSpent }),
      });

      const data: AssessmentResult = await res.json();
      const totalSec = problem.timeLimit * 60;
      const achievements = [];

      if (secondsSpent > 0 && secondsSpent <= totalSec * 0.5) {
        achievements.push({ id: 'speed-demon', title: '⚡ Speed Demon', description: 'Selesai dalam waktu kurang dari separuh alokasi!', icon: '⚡' });
      }
      if (testRun && testRun.passedCount === testRun.totalCount && testRun.totalCount > 0) {
        achievements.push({ id: 'zero-bug', title: '🛡️ Zero Bug Ninja', description: '100% unit test lokal lulus tanpa cela!', icon: '🛡️' });
      }
      if (code.includes('JAWABAN') && code.length > 500) {
        achievements.push({ id: 'architecture-guru', title: '🧠 Architecture Guru', description: 'Menjawab pertanyaan bonus arsitektur dengan komprehensif!', icon: '🧠' });
      }
      if (secondsSpent >= totalSec - 180) {
        achievements.push({ id: 'clutch-master', title: '🔥 Clutch Master', description: 'Menyelesaikan koding di 3 menit terakhir!', icon: '🔥' });
      }

      data.achievements = achievements;
      setAssessmentResult(data);

      // Persist to Zustand store
      markComplete({
        problemId: problem.id,
        problemTitle: problem.title,
        secondsSpent,
        score: data.score,
        status: data.status,
      });

      if (data.status === 'PASS' || data.score >= 80) {
        playFanfareSound();
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to evaluate code. Please check your internet connection or server.');
    } finally {
      setIsSubmitting(false);
    }
  }, [problem.id, problem.title, problem.timeLimit, code, secondsSpent, testRun, markComplete]);

  const handleTimeUp = useCallback(() => {
    setIsReadOnly(true);
    handleSubmitAssessment();
  }, [handleSubmitAssessment]);

  const handleTimeUpdate = useCallback(
    (leftSec: number) => { setSecondsSpent(problem.timeLimit * 60 - leftSec); },
    [problem.timeLimit]
  );

  return (
    <div
      className="flex flex-col h-screen w-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans selection:bg-violet-100 selection:text-zinc-900"
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
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
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden select-none"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Left Pane: Problem Description */}
        <div
          className="h-full flex flex-col border-r border-zinc-200 overflow-hidden"
          style={{
            width: `${splitPercent}%`,
            minWidth: '280px',
            maxWidth: '65%',
            transition: isDragging ? 'none' : 'width 50ms ease',
          }}
        >
          <ProblemPanel problem={problem} />
        </div>

        {/* Drag Resizer Handle */}
        <button
          className={`resizer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500${isDragging ? ' is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
          aria-label="Drag to resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setCode(code); // keep code, adjust split via keyboard
            }
          }}
        />

        {/* Right Pane: Editor + Console */}
        <div
          className="flex-1 h-full flex flex-col overflow-hidden"
          style={{ minWidth: '35%' }}
        >
          {/* Editor wrapper — light chrome frame around dark Monaco */}
          <div className="flex-1 overflow-hidden border-l border-zinc-200 bg-zinc-50">
            <EditorPanel
              code={code}
              onChange={handleCodeChange}
              isReadOnly={isReadOnly || isSubmitting}
              onReset={() => {
                setCode(problem.starterCode);
                setDraft(problemId, problem.starterCode);
              }}
              isWorkerRunning={isWorkerRunning}
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

      {/* Results Assessment Modal — Framer Motion AnimatePresence */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

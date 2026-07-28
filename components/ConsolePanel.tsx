'use client';

import React from 'react';
import { TestRunResult } from '@/lib/types';
import { Terminal, CheckCircle2, XCircle, ChevronUp, ChevronDown, Play } from 'lucide-react';

interface ConsolePanelProps {
  testRun: TestRunResult | null;
  onRunTests: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ConsolePanel({
  testRun,
  onRunTests,
  isOpen,
  onToggle
}: ConsolePanelProps) {
  return (
    <div
      className={`border-t border-zinc-200 bg-white transition-all duration-300 flex flex-col ${
        isOpen ? 'h-64' : 'h-10'
      }`}
    >
      {/* Console Header Bar */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-200 cursor-pointer select-none text-xs font-mono"
      >
        <div className="flex items-center gap-2 text-zinc-800">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-semibold text-zinc-900 font-sans">Local Test Console</span>
          {testRun && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                testRun.passedCount === testRun.totalCount
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {testRun.passedCount} / {testRun.totalCount} Passed
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunTests();
              if (!isOpen) onToggle();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-sans font-semibold rounded-full text-xs transition-colors shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current" />
            Run Local Tests
          </button>

          <button className="text-zinc-500 hover:text-zinc-900">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Console Body Content */}
      {isOpen && (
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar bg-white">
          {!testRun ? (
            <div className="text-zinc-500 flex items-center justify-center h-full text-xs font-sans">
              Click &quot;Run Local Tests&quot; to execute isolated unit test cases against your Monaco code.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {testRun.results.map((res) => (
                  <div
                    key={res.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      res.passed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 overflow-hidden font-sans">
                      <div className="font-semibold text-zinc-900 text-xs">{res.name}</div>
                      {res.actualStatus && (
                        <div className="text-[11px] text-zinc-600 font-mono">
                          Status Received: <span className="font-bold text-zinc-900">{res.actualStatus}</span>
                        </div>
                      )}
                      {res.error && (
                        <div className="text-[11px] text-rose-700 truncate font-mono">{res.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {testRun.logs.length > 0 && (
                <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 space-y-1 font-mono text-xs shadow-inner">
                  <div className="text-[10px] text-zinc-400 uppercase font-sans font-bold">Execution Logs:</div>
                  {testRun.logs.map((log, i) => (
                    <div key={i} className="text-zinc-200">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

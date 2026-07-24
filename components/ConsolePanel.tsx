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
      className={`border-t border-zinc-800/80 bg-zinc-950 transition-all duration-300 flex flex-col ${
        isOpen ? 'h-64' : 'h-10'
      }`}
    >
      {/* Console Header Bar */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 cursor-pointer select-none text-xs font-mono"
      >
        <div className="flex items-center gap-2 text-zinc-300">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200 font-sans">Local Test Console</span>
          {testRun && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                testRun.passedCount === testRun.totalCount
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                  : 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
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
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 font-sans font-semibold rounded-full text-xs transition-colors shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            Run Local Tests
          </button>

          <button className="text-zinc-400 hover:text-zinc-100">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Console Body Content */}
      {isOpen && (
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar bg-zinc-950">
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
                        ? 'bg-zinc-900/40 border-zinc-800 text-zinc-200'
                        : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                    }`}
                  >
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 overflow-hidden font-sans">
                      <div className="font-semibold text-zinc-200 text-xs">{res.name}</div>
                      {res.actualStatus && (
                        <div className="text-[11px] text-zinc-400 font-mono">
                          Status Received: <span className="font-bold text-zinc-200">{res.actualStatus}</span>
                        </div>
                      )}
                      {res.error && (
                        <div className="text-[11px] text-rose-400 truncate font-mono">{res.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {testRun.logs.length > 0 && (
                <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 space-y-1 font-mono text-xs">
                  <div className="text-[10px] text-zinc-500 uppercase font-sans font-bold">Execution Logs:</div>
                  {testRun.logs.map((log, i) => (
                    <div key={i} className="text-zinc-300">
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

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
      className={`border-t border-slate-800 bg-slate-950 transition-all duration-300 flex flex-col ${
        isOpen ? 'h-64' : 'h-10'
      }`}
    >
      {/* Console Header Bar */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 cursor-pointer select-none text-xs font-mono"
      >
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Local Test Console</span>
          {testRun && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                testRun.passedCount === testRun.totalCount
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-bold rounded text-xs transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            Run Local Tests
          </button>

          <button className="text-slate-400 hover:text-white">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Console Body Content */}
      {isOpen && (
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar">
          {!testRun ? (
            <div className="text-slate-500 flex items-center justify-center h-full">
              Click &quot;Run Local Tests&quot; to execute isolated unit test cases against your Monaco code.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {testRun.results.map((res) => (
                  <div
                    key={res.id}
                    className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                      res.passed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 overflow-hidden">
                      <div className="font-semibold text-slate-200">{res.name}</div>
                      {res.actualStatus && (
                        <div className="text-[11px] text-slate-400">
                          Status Received: <span className="font-bold text-cyan-300">{res.actualStatus}</span>
                        </div>
                      )}
                      {res.error && (
                        <div className="text-[11px] text-rose-400 truncate">{res.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {testRun.logs.length > 0 && (
                <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-sans font-bold">Execution Logs:</div>
                  {testRun.logs.map((log, i) => (
                    <div key={i} className="text-emerald-400">
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

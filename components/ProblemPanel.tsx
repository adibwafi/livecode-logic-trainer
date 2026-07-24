'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Problem } from '@/lib/types';
import { BookOpen, HelpCircle, Lightbulb, Zap, Database, ShieldCheck } from 'lucide-react';

interface ProblemPanelProps {
  problem: Problem;
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'bonus' | 'hints'>('description');

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 text-slate-200 overflow-hidden select-text">
      {/* Panel Tab Navigation */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'description'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Problem Description
        </button>

        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'bonus'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Bonus Question 💡
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            activeTab === 'hints'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Rubric & Hints
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {activeTab === 'description' && (
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-cyan-300 prose-a:text-cyan-400 prose-code:text-emerald-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-800 text-sm">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'bonus' && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-base">
                <Database className="w-5 h-5" />
                PostgreSQL Race Condition Bonus Question
              </div>
              <p className="text-slate-300 leading-relaxed">
                In real-world production setups, in-memory arrays won't scale across multiple app instances, and concurrent requests will cause **overselling race conditions**.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Required Bonus Response in Code Comments
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Provide answers to these 3 strategies in your code comments block:
              </p>

              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                <li>
                  <strong className="text-amber-300">SELECT FOR UPDATE (Row Locking)</strong>: How does locking the voucher row within a DB transaction prevent double-reads?
                </li>
                <li>
                  <strong className="text-amber-300">Database Unique Constraints</strong>: How does a composite unique key on <code className="text-emerald-300">(user_id, voucher_code)</code> prevent duplicate claims?
                </li>
                <li>
                  <strong className="text-amber-300">Atomic Update Query</strong>: How does <code className="text-emerald-300">UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota &gt; 0</code> avoid race conditions?
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-base">
                <Zap className="w-5 h-5" />
                Evaluation Rubric
              </div>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                <li><strong className="text-emerald-300">Correct Status Codes</strong>: 400 for bad request/logic constraint violations, 404 for missing resources, 200 for success.</li>
                <li><strong className="text-emerald-300">Validation Order</strong>: Validate payload fields first, then check voucher existence, user uniqueness, and quota limit.</li>
                <li><strong className="text-emerald-300">In-Memory Mutation</strong>: Ensure you correctly update <code className="text-cyan-300">voucher.quota -= 1</code> and push to <code className="text-cyan-300">redeemedVouchers</code> array.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

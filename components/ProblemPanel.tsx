'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Problem } from '@/lib/types';
import { BookOpen, Database, Lightbulb, Zap } from 'lucide-react';

interface ProblemPanelProps {
  problem: Problem;
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'bonus' | 'hints'>('description');

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden select-text">
      {/* Panel Tab Navigation */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 text-xs font-medium">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'description'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Problem Description
        </button>

        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'bonus'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Bonus Question 💡
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'hints'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Rubric & Hints
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {activeTab === 'description' && (
          <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-headings:font-bold prose-p:text-zinc-300 prose-p:text-xs prose-p:leading-relaxed prose-code:text-zinc-200 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800 text-xs">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'bonus' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-100 text-sm">
                <Database className="w-4 h-4 text-zinc-400" />
                PostgreSQL Race Condition Bonus Question
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                In production, in-memory state won&apos;t scale across multiple app instances, causing **overselling race conditions** under concurrent requests.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
              <h4 className="font-semibold text-zinc-200">Required Bonus Explanation in Code Comments</h4>
              <p className="text-zinc-400 leading-relaxed font-normal">
                Detail these 3 database techniques in your solution code comments:
              </p>

              <ul className="space-y-2 text-zinc-300 list-disc list-inside font-normal">
                <li>
                  <strong className="text-zinc-100 font-semibold">SELECT FOR UPDATE (Row Locking)</strong>: Lock voucher row within DB transaction during check.
                </li>
                <li>
                  <strong className="text-zinc-100 font-semibold">Database Unique Constraints</strong>: Unique key on <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">(user_id, voucher_code)</code>.
                </li>
                <li>
                  <strong className="text-zinc-100 font-semibold">Atomic Update Query</strong>: <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota &gt; 0</code>.
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-100 text-sm">
                <Zap className="w-4 h-4 text-zinc-400" /> Evaluation Rubric
              </div>
              <ul className="space-y-2 text-zinc-400 list-disc list-inside font-normal">
                <li><strong className="text-zinc-200">HTTP Status Codes</strong>: 400 for bad request/logic violations, 404 for missing resources, 200 for success.</li>
                <li><strong className="text-zinc-200">Validation Order</strong>: Validate payload fields first, then voucher existence, user uniqueness, and quota availability.</li>
                <li><strong className="text-zinc-200">In-Memory Mutation</strong>: Decrement <code className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 rounded">voucher.quota -= 1</code> and record redemption in <code className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 rounded">redeemedVouchers</code>.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

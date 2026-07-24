'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Problem } from '@/lib/types';
import { BookOpen, Database, Lightbulb, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';

interface ProblemPanelProps {
  problem: Problem;
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'bonus' | 'hints'>('description');

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden select-text font-sans">
      {/* Panel Tab Navigation */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100/90 border-b border-zinc-200 text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'description'
              ? 'bg-zinc-900 text-white font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {t('problemDescription')}
        </button>

        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'bonus'
              ? 'bg-zinc-900 text-white font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          {t('bonusQuestion')}
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeTab === 'hints'
              ? 'bg-zinc-900 text-white font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {t('rubricHints')}
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-light">
        {activeTab === 'description' && (
          <div className="prose prose-slate max-w-none text-zinc-900 text-xs leading-relaxed prose-headings:text-zinc-950 prose-headings:font-bold prose-h2:text-sm prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-1.5 prose-h3:text-xs prose-p:text-zinc-800 prose-p:my-2 prose-code:text-zinc-900 prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-300 prose-code:font-mono prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800 font-normal">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'bonus' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Database className="w-4 h-4 text-amber-700" />
                Soal Bonus: Race Condition PostgreSQL
              </div>
              <p className="text-amber-900/90 leading-relaxed font-normal">
                Di produksi, state in-memory tidak akan berskala di berbagai instance aplikasi, menyebabkan <strong>race condition overselling</strong> saat ada request bersamaan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <h4 className="font-bold text-zinc-900 text-xs">Penjelasan Bonus yang Dibutuhkan dalam Komentar Kode</h4>
              <p className="text-zinc-700 leading-relaxed font-normal">
                Jelaskan strategi concurrency database berikut dalam komentar kode kamu:
              </p>

              <ul className="space-y-2 text-zinc-800 list-disc list-inside font-normal">
                <li>
                  <strong className="text-zinc-950 font-semibold">SELECT FOR UPDATE (Row Locking)</strong>: Kunci baris voucher dalam transaksi DB selama pengecekan.
                </li>
                <li>
                  <strong className="text-zinc-950 font-semibold">Database Unique Constraints</strong>: Unique index pada <code className="text-zinc-900 bg-zinc-200/80 px-1 py-0.5 rounded border border-zinc-300 font-mono">(user_id, voucher_code)</code>.
                </li>
                <li>
                  <strong className="text-zinc-950 font-semibold">Atomic Update Query</strong>: <code className="text-zinc-900 bg-zinc-200/80 px-1 py-0.5 rounded border border-zinc-300 font-mono">UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota &gt; 0</code>.
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <Zap className="w-4 h-4 text-emerald-700" /> Rubrik Penilaian
              </div>
              <ul className="space-y-2 text-emerald-950/90 list-disc list-inside font-normal">
                <li><strong className="text-emerald-950">HTTP Status Code</strong>: 400 untuk bad request/pelanggaran logika, 404 untuk resource tidak ditemukan, 200 untuk sukses.</li>
                <li><strong className="text-emerald-950">Urutan Validasi</strong>: Validasi field payload terlebih dahulu, lalu keberadaan voucher, keunikan pengguna, dan ketersediaan kuota.</li>
                <li><strong className="text-emerald-950">Mutasi In-Memory</strong>: Kurangi <code className="text-zinc-900 font-mono bg-zinc-200/80 px-1 py-0.5 rounded">voucher.quota -= 1</code> dan catat redemption di <code className="text-zinc-900 font-mono bg-zinc-200/80 px-1 py-0.5 rounded">redeemedVouchers</code>.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

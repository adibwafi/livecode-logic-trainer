'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Problem } from '@/lib/types';
import { BookOpen, Database, Lightbulb, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';

interface ProblemPanelProps {
  problem: Problem;
}

type ActiveTab = 'description' | 'bonus' | 'hints';

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('description');

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'description', label: t('problemDescription'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'bonus',       label: t('bonusQuestion'),      icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'hints',       label: t('rubricHints'),        icon: <Lightbulb className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="flex flex-col h-full overflow-hidden select-text font-sans"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* ── Tab Navigation ── */}
      <div
        className="flex items-center gap-1 px-3 py-2 text-xs font-medium shrink-0"
        style={{
          background: 'rgba(0,0,0,0.35)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full btn-glass transition-all duration-200 ${
              activeTab === id
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            style={
              activeTab === id
                ? {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }
            }
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

        {/* Description Tab — dark prose */}
        {activeTab === 'description' && (
          <div className="prose prose-invert max-w-none text-zinc-300 text-xs leading-relaxed prose-headings:text-zinc-100 prose-headings:font-bold prose-h2:text-sm prose-h2:border-b prose-h2:border-white/[0.07] prose-h2:pb-1.5 prose-h3:text-xs prose-p:text-zinc-400 prose-p:my-2 prose-code:text-zinc-200 prose-code:bg-white/[0.07] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/[0.10] prose-code:font-mono prose-pre:bg-black/50 prose-pre:text-zinc-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/[0.08] prose-ul:text-zinc-400 prose-li:my-1 font-normal animate-fade-in">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
        )}

        {/* Bonus Question Tab */}
        {activeTab === 'bonus' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div
              className="p-4 rounded-xl space-y-2"
              style={{
                background: 'rgba(120, 53, 15, 0.15)',
                border: '1px solid rgba(251,191,36,0.20)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Database className="w-4 h-4 text-amber-500" />
                Bonus: Race Condition PostgreSQL
              </div>
              <p className="text-amber-200/70 leading-relaxed font-normal">
                Di produksi, state in-memory tidak akan berskala di berbagai instance aplikasi, menyebabkan{' '}
                <strong className="text-amber-300">race condition overselling</strong> saat ada request bersamaan.
              </p>
            </div>

            <div
              className="p-4 rounded-xl space-y-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <h4 className="font-bold text-zinc-200 text-xs">Penjelasan Bonus yang Dibutuhkan dalam Komentar Kode</h4>
              <p className="text-zinc-400 leading-relaxed font-normal">
                Jelaskan strategi concurrency database berikut dalam komentar kode kamu:
              </p>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside font-normal">
                <li>
                  <strong className="text-zinc-100 font-semibold">SELECT FOR UPDATE (Row Locking)</strong>
                  : Kunci baris voucher dalam transaksi DB selama pengecekan.
                </li>
                <li>
                  <strong className="text-zinc-100 font-semibold">Database Unique Constraints</strong>
                  : Unique index pada{' '}
                  <code className="text-zinc-200 bg-white/[0.07] px-1 py-0.5 rounded border border-white/[0.10] font-mono">
                    (user_id, voucher_code)
                  </code>.
                </li>
                <li>
                  <strong className="text-zinc-100 font-semibold">Atomic Update Query</strong>
                  :{' '}
                  <code className="text-zinc-200 bg-white/[0.07] px-1 py-0.5 rounded border border-white/[0.10] font-mono">
                    UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota &gt; 0
                  </code>.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Hints / Rubric Tab */}
        {activeTab === 'hints' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div
              className="p-4 rounded-xl space-y-2"
              style={{
                background: 'rgba(6, 78, 59, 0.15)',
                border: '1px solid rgba(52,211,153,0.18)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <Zap className="w-4 h-4 text-emerald-500" /> Rubrik Penilaian
              </div>
              <ul className="space-y-2 text-emerald-200/70 list-disc list-inside font-normal">
                <li>
                  <strong className="text-emerald-200">HTTP Status Code</strong>: 400 untuk bad request/pelanggaran logika, 404 untuk resource tidak ditemukan, 200 untuk sukses.
                </li>
                <li>
                  <strong className="text-emerald-200">Urutan Validasi</strong>: Validasi field payload terlebih dahulu, lalu keberadaan voucher, keunikan pengguna, dan ketersediaan kuota.
                </li>
                <li>
                  <strong className="text-emerald-200">Mutasi In-Memory</strong>: Kurangi{' '}
                  <code className="text-zinc-200 font-mono bg-white/[0.07] px-1 py-0.5 rounded">voucher.quota -= 1</code>{' '}
                  dan catat redemption di{' '}
                  <code className="text-zinc-200 font-mono bg-white/[0.07] px-1 py-0.5 rounded">redeemedVouchers</code>.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

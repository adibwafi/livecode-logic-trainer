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
      className="flex flex-col h-full overflow-hidden select-text font-sans bg-white"
    >
      {/* ── Tab Navigation ── */}
      <div
        className="flex items-center gap-1 px-3 py-2 text-xs font-medium shrink-0 bg-zinc-50 border-b border-zinc-200"
      >
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full btn-glass transition-all duration-200 ${
              activeTab === id
                ? 'text-zinc-900 font-semibold bg-white border border-zinc-200 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent border border-transparent'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white">

        {/* Description Tab — light prose */}
        {activeTab === 'description' && (
          <div className="prose prose-zinc max-w-none text-zinc-700 text-xs leading-relaxed prose-headings:text-zinc-900 prose-headings:font-bold prose-h2:text-sm prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-1.5 prose-h3:text-xs prose-p:text-zinc-600 prose-p:my-2 prose-code:text-zinc-900 prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-200 prose-code:font-mono prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800 prose-ul:text-zinc-600 prose-li:my-1 font-normal animate-fade-in">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
        )}

        {/* Bonus Question Tab */}
        {activeTab === 'bonus' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div
              className="p-4 rounded-xl space-y-2 bg-amber-50 border border-amber-200/90 text-amber-900"
            >
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Database className="w-4 h-4 text-amber-600" />
                {problem.bonusRubric?.title || `Bonus: ${problem.title}`}
              </div>
              <p className="text-amber-800 leading-relaxed font-normal">
                {problem.bonusRubric?.subtitle || problem.bonusQuestion}
              </p>
            </div>

            <div
              className="p-4 rounded-xl space-y-3 bg-zinc-50 border border-zinc-200 text-zinc-800"
            >
              <h4 className="font-bold text-zinc-900 text-xs">Penjelasan Bonus yang Dibutuhkan dalam Komentar Kode</h4>
              <p className="text-zinc-600 leading-relaxed font-normal">
                Jelaskan strategi dan pertimbangan arsitektural berikut dalam komentar kode Anda:
              </p>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside font-normal">
                {problem.bonusRubric?.points && problem.bonusRubric.points.length > 0 ? (
                  problem.bonusRubric.points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {pt}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="leading-relaxed">
                      <strong className="text-zinc-900 font-semibold">Tuliskan solusi konseptual</strong> untuk pertanyaan: {problem.bonusQuestion}
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-zinc-900 font-semibold">Trade-off & Skalabilitas</strong>: Jelaskan perbandingan efisiensi performa dan implikasi arsitektur di sistem produksi.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Hints / Rubric Tab */}
        {activeTab === 'hints' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div
              className="p-4 rounded-xl space-y-2 bg-emerald-50 border border-emerald-200/90 text-emerald-900"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <Zap className="w-4 h-4 text-emerald-600" /> Rubrik & Petunjuk Solusi
              </div>
              <ul className="space-y-2 text-emerald-800 list-disc list-inside font-normal">
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {hint}
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <strong className="text-emerald-950 font-semibold">Validasi Input</strong>: Periksa kelengkapan dan tipe data parameter input sebelum melakukan pemrosesan.
                    </li>
                    <li>
                      <strong className="text-emerald-950 font-semibold">Penanganan Edge Cases</strong>: Tangani kondisi kosong, data tidak ditemukan, atau batasan batas atas/bawah.
                    </li>
                    <li>
                      <strong className="text-emerald-950 font-semibold">Format Kembalian</strong>: Pastikan tipe data dan struktur response/return value sesuai dengan spesifikasi soal.
                    </li>
                  </>
                )}
              </ul>
            </div>

            {problem.bestPractices && problem.bestPractices.length > 0 && (
              <div className="p-4 rounded-xl space-y-2 bg-zinc-50 border border-zinc-200 text-zinc-800">
                <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Rekomendasi Best Practice
                </div>
                <ul className="space-y-1.5 text-zinc-600 list-disc list-inside font-normal text-xs">
                  {problem.bestPractices.map((bp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

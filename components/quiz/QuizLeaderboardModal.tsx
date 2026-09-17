'use client';

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { LeaderboardEntry, QuizTrack } from '@/lib/quiz/types';
import { getLeaderboard } from '@/lib/quiz/leaderboard';
import { Trophy, X } from 'lucide-react';

interface QuizLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: QuizTrack;
  onStartTrack?: (track: QuizTrack) => void;
}

export function QuizLeaderboardModal({
  isOpen,
  onClose,
  initialTrack = 'backend',
  onStartTrack,
}: QuizLeaderboardModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<QuizTrack>(initialTrack);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEntries(getLeaderboard(selectedTrack));
    }
  }, [isOpen, selectedTrack]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Leaderboard Screening Nasional
              </h2>
              <p className="text-xs text-zinc-500">
                Peringkat skor technical test engineering pelamar tech top Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors btn-glass"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Selector Tabs */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-zinc-100 bg-white">
          <button
            onClick={() => setSelectedTrack('backend')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all btn-glass ${
              selectedTrack === 'backend'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            ☕ Backend Engineering
          </button>
          <button
            onClick={() => setSelectedTrack('frontend')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all btn-glass ${
              selectedTrack === 'frontend'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            ⚡ Frontend Engineering
          </button>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Belum ada data ranking untuk track ini. Jadilah yang pertama!
            </div>
          ) : (
            entries.map((item, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 md:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-white border-amber-300 shadow-xs'
                      : isTop2
                      ? 'bg-zinc-50 border-zinc-300'
                      : isTop3
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-white border-zinc-200/80'
                  }`}
                >
                  {/* Rank & Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isTop1
                          ? 'bg-amber-400 text-zinc-950 shadow-xs'
                          : isTop2
                          ? 'bg-zinc-300 text-zinc-900'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 truncate">
                          {item.name}
                        </span>
                        {item.companyTarget && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 truncate hidden sm:inline-block">
                            {item.companyTarget}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-700 font-semibold">{item.accuracy}% Akurasi</span>
                        <span>•</span>
                        <span>{item.correctCount}/{item.totalQuestions || 25} Benar</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span className="text-sm md:text-base font-black text-zinc-900 font-mono block">
                      {item.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                      pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {onStartTrack && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              Uji kemampuan Anda dan rebut posisi teratas!
            </span>
            <button
              onClick={() => {
                onClose();
                onStartTrack(selectedTrack);
              }}
              className="px-5 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 transition-all hover:scale-105 btn-glass"
            >
              Mulai Quiz Track Ini
            </button>
          </div>
        )}
      </m.div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems';
import {
  Code2,
  Clock,
  Zap,
  Sparkles,
  Database,
  ArrowRight,
  Target,
  Terminal,
  BrainCircuit,
  CheckCircle,
  Play
} from 'lucide-react';

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredProblems = selectedRole === 'ALL'
    ? PROBLEMS
    : PROBLEMS.filter((p) => p.role.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-100">
              LiveCode <span className="text-cyan-400">Logic Trainer</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              LLM AI Evaluator Enabled
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Live Coding Technical Interview Simulator
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight">
          Master JavaScript REST API Logic <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Under Real Time Constraints
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base text-slate-400 leading-relaxed">
          Practice 30–45 minute technical interview challenges for Mid-Level Full Stack, Backend, Frontend, and QA roles. Get instant AI code review, edge case analysis, and PostgreSQL race condition feedback.
        </p>
      </header>

      {/* Role Filters */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-semibold">
          {['ALL', 'Backend', 'Frontend', 'Full Stack', 'QA'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-xl transition-all ${
                selectedRole === role
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {role === 'ALL' ? 'All Engineering Roles' : `${role} Engineer`}
            </button>
          ))}
        </div>
      </section>

      {/* Problem Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                      {prob.role}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 font-semibold">
                      {prob.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-slate-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {prob.timeLimit} Mins
                  </div>
                </div>

                {/* Title & Category */}
                <div>
                  <h2 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {prob.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{prob.category}</p>
                </div>

                {/* Requirements highlights */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400" /> Core Task:
                  </div>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    <li>Endpoint: <code className="text-emerald-300">POST /redeem</code> with in-memory arrays</li>
                    <li>Rules: Voucher existence, user uniqueness, quota limit (&gt; 0)</li>
                    <li className="text-amber-300/90 font-medium">
                      Bonus: Explain Postgres Race Conditions (SELECT FOR UPDATE, Unique Constraints, Atomic Updates)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Monaco Editor IDE
                </div>

                <Link
                  href={`/session/${prob.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start 45-Min Challenge
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Application Features Section */}
      <section className="border-t border-slate-800/80 bg-slate-950/60 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-black text-center text-slate-100 mb-10">
            Engineered for High-Stakes Technical Assessment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 text-base">Real IDE Experience</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full Monaco Editor integration with VS Dark theme, JavaScript syntax highlighting, line numbers, auto-formatting, and keyboard shortcuts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 text-base">Enforced 45-Min Timer</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Simulates exact interview pressure. Auto-locks code editing and triggers submission when countdown reaches 00:00.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-100 text-base">LLM AI Code Assessor</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Deep evaluation of logic correctness, unhandled edge cases, status codes, engineering best practices, and Postgres race condition explanations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

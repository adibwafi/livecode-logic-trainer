# PROJECT_STATE.md — Single Source of Truth

## 1. EXECUTIVE SUMMARY & TECH STACK

### Core Purpose & Scope
**LiveCode Logic Trainer** is a specialized, interactive web application built for live-coding technical interview preparation. It enables software engineers (Backend, Frontend, Full Stack, QA) to practice JavaScript REST API logic under strict interview time constraints (**max 30 minutes**). The app features a split-pane IDE, countdown timer auto-submit, real-time local test execution, an AI-driven assessment engine powered by Groq (`llama-3.3-70b-versatile`), and an interactive **Fun Gamification Suite** (Recruiter Personas, Web Audio FX, Achievements) to eliminate interview anxiety.

### Complete Tech Stack & Key Configurations
- **Framework**: Next.js 16 (App Router, Turbopack, React 19).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`) with **Sana Labs Minimalist Dark Aesthetic** (`#09090b` obsidian background, subtle hairline borders, rounded-full pill badges, refined typography), `clsx`, `tailwind-merge`, `lucide-react` icons.
- **Code Editor**: `@monaco-editor/react` (VS Dark theme, JS syntax highlighting, formatting, read-only mode).
- **Markdown Rendering**: `react-markdown` with GFM support.
- **AI Assessment Engine**: `groq-sdk` calling model `llama-3.3-70b-versatile` with `response_format: { type: "json_object" }`.
- **Audio Synthesizer Engine**: Web Audio API oscillator/gain node synth (`lib/soundFX.ts`) for offline, zero-dependency sound cues.
- **SEO & Production Readiness**: Complete Next.js 16 Metadata (`title`, `description`, `keywords`, `openGraph`, `twitter`, `icons`) and separate `Viewport` configuration (`themeColor: "#09090b"`).
- **Database / Storage**: **NONE (Strictly In-Memory)**. Seed data and session states use JavaScript objects/arrays.
- **Visual FX**: `canvas-confetti` on successful assessment pass.
- **Environment Config**: `GROQ_API_KEY` defined in `.env.local` (ignored by git).

---

## 2. PROJECT STRUCTURE & ARCHITECTURE

### Directory Tree & Responsibilities
```
livecode-logic-trainer/
├── app/                            # Next.js App Router root
│   ├── page.tsx                    # Landing page, role filter, problem cards & gamification banner
│   ├── layout.tsx                  # Root HTML layout, SEO metadata, OpenGraph & themeColor
│   ├── globals.css                 # Tailwind CSS v4 directives, obsidian theme & custom scrollbars
│   ├── session/[problemId]/
│   │   └── page.tsx                # Interactive split-pane live coding session (30-min limit)
│   └── api/
│       └── assess/
│           └── route.ts            # POST /api/assess (Groq LLM + local evaluator route)
├── components/                     # Modular UI Components
│   ├── SessionHeader.tsx           # Navigation bar, recruiter HUD, timer, volume toggle & action buttons
│   ├── RecruiterMoodMeter.tsx      # Recruiter HUD widget (Indo Tech Lead, FAANG Lead, YC Founder)
│   ├── TimerBar.tsx                # Decoupled countdown timer (30-min strict limit)
│   ├── ProblemPanel.tsx            # Left panel: Markdown description, bonus question, rubric
│   ├── EditorPanel.tsx             # Right panel: Monaco Editor wrapper with format/reset
│   ├── ConsolePanel.tsx            # Bottom drawer: Local unit test runner & execution logs
│   └── ResultsModal.tsx            # Assessment modal: Score, badges, errors, best practices, ideal code
├── lib/                            # Core Logic & Utilities
│   ├── types.ts                    # TypeScript interfaces (Problem, AssessmentResult, Achievement, Persona)
│   ├── problems.ts                 # 12 In-memory problem seed definitions (Junior & Mid-Level across 4 roles)
│   ├── soundFX.ts                  # Web Audio API synthesizer for test run, chime, error & fanfare cues
│   └── evaluator.ts                # Isolated JS function sandbox & dynamic unit test assertion runner
├── .env.local                      # Secret keys (GROQ_API_KEY - Git Ignored)
├── .env.local.example              # Key template for development
├── README.md                       # Developer documentation & quickstart
└── PROJECT_STATE.md                # Single Source of Truth for AI Agents
```

### Architectural Patterns Applied
- **Next.js App Router Component Hierarchy**: Server components for route layout; `'use client'` explicitly declared on interactive client widgets (`EditorPanel`, `TimerBar`, `RecruiterMoodMeter`, `ResultsModal`).
- **Recruiter Persona HUD & Live Speech Commentary**: Interactive selector switching between *Indo Tech Lead ☕*, *FAANG Lead 🧐*, and *YC Founder 🚀*, generating context-aware motivational feedback based on timer progress and unit test status.
- **Offline Web Audio Synthesizer**: Zero external asset dependencies using `AudioContext` oscillators for instant sound feedback on test runs, passes, errors, and fanfares.
- **Achievement Badges Engine**: Calculates post-session awards (`⚡ Speed Demon`, `🛡️ Zero Bug Ninja`, `🧠 Architecture Guru`, `🔥 Clutch Master`).
- **Decoupled Timer State Management**: `TimerBar.tsx` uses decoupled ref callbacks and standalone `useEffect` listeners to eliminate React 19 `setState`-in-render warnings.
- **Dual-Engine Evaluation Strategy**:
  1. *Primary Engine*: Groq API (`llama-3.3-70b-versatile`) producing strict structured JSON evaluations.
  2. *Fallback / Auxiliary Engine*: `lib/evaluator.ts` running mocked Express `req`/`res` contexts via JavaScript `Function` constructor execution for zero-latency local feedback across all 12 problem endpoints.

---

## 3. CURRENT IMPLEMENTATION STATE & DATA FLOW

### Built Modules & Active Features
1. **Landing / Problem Discovery (`app/page.tsx`)**: Filterable catalog of **12 problems** (Junior & Mid-Level) across Backend, Frontend, Full Stack, and QA roles with Sana Labs obsidian design and gamification feature highlights.
2. **Problem Seed Catalog (`lib/problems.ts`)**:
   - `voucher-redemption`: E-commerce Voucher Redemption API (Backend • Mid-Level • 30m)
   - `rate-limiter-middleware`: In-Memory Sliding Window Rate Limiter (Backend • Mid-Level • 30m)
   - `cart-checkout-engine`: E-commerce Cart Checkout & Tax Engine (Full Stack • Mid-Level • 30m)
   - `order-inventory-reservation`: Flash Sale Inventory Stock Reservation (Backend • Mid-Level • 30m)
   - `auth-session-manager`: JWT Token Refresh & Auto-Logout State Engine (Frontend • Mid-Level • 30m)
   - `idempotent-payment-webhook`: Payment Gateway Idempotent Webhook Handler (Backend • Mid-Level • 30m)
   - `notification-batch-dispatcher`: Resilient Notification Dispatcher with Fallback (Full Stack • Mid-Level • 30m)
   - `order-state-machine-validator`: Order Lifecycle State Machine & Test Suite (QA • Mid-Level • 30m)
   - `user-registration-validator`: User Registration & Password Complexity Validator (Backend • Junior • 30m)
   - `pagination-search-filter`: API Data Filtering & Pagination Engine (Frontend • Junior • 30m)
   - `api-payload-schema-validator`: API Payload Schema & Type Assertion Engine (QA • Junior • 30m)
   - `multi-tenant-feature-flag`: Multi-Tenant Feature Flag & Percentage Rollout Engine (Full Stack • Mid-Level • 30m)
3. **Interactive Live Session (`app/session/[problemId]/page.tsx`)**:
   - Synchronized **30-minute** countdown timer with low-time visual warnings.
   - Recruiter Mood Meter HUD with speech bubbles and persona switcher.
   - Live Monaco code editor supporting standard JS / Express syntax.
4. **Local Test Runner & Audio FX (`components/ConsolePanel.tsx`, `lib/evaluator.ts`, `lib/soundFX.ts`)**: Runs mock payload assertions with sound effects across all 12 problem endpoints.
5. **AI Assessment Route & Badges (`app/api/assess/route.ts` & `components/ResultsModal.tsx`)**: Receives code, executes tests, calls Groq LLM, calculates achievement badges, and triggers celebratory confetti and fanfare audio on PASS.

---

## 4. REMAINING TASKS, TODOs & TECHNICAL DEBT

### Pending Enhancements & Future Features
- **Multi-File Problem Support**: Extend `EditorPanel` to support multiple tabs (e.g., `routes.js`, `controllers.js`, `models.js`).
- **User Progress Persistence**: Optional localStorage or IndexedDB persistence for solved problem history and streak stats.

---

## 5. AI AGENT CODING GUIDELINES

### Naming & Placement Conventions
- **Components**: PascalCase in `components/` (e.g., `RecruiterMoodMeter.tsx`, `ResultsModal.tsx`). Always add `'use client';` directive if hooks or DOM references are used.
- **API Routes**: App Router syntax in `app/api/<route-name>/route.ts`. Use standard `NextRequest` and `NextResponse`.
- **Logic & Types**: Exported type definitions strictly placed in `lib/types.ts`. Seed data in `lib/problems.ts`. Sound synthesis in `lib/soundFX.ts`.
- **Environment Keys**: NEVER hardcode API keys or secret strings in code files. Always read from `process.env.GROQ_API_KEY` and reference in `.env.local.example`.

### Workflow for Implementing New Features / Problems
1. **Define Types**: Update `lib/types.ts` if adding new data properties.
2. **Add Seed Problem**: Append new problem object to `PROBLEMS` array in `lib/problems.ts`.
3. **Update Evaluator**: Add specialized assertion functions in `lib/evaluator.ts` if new endpoint routes are introduced.
4. **Build Component / UI**: Add modular UI components in `components/` using Sana Labs minimalist styling.
5. **Verify Build**: Run `npm run build` to verify zero TypeScript or Turbopack errors.
6. **Git Commit**: Commit logical increments in English with descriptive message prefixes (`feat:`, `fix:`, `docs:`).

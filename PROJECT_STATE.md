# PROJECT_STATE.md — Single Source of Truth

## 1. EXECUTIVE SUMMARY & TECH STACK

### Core Purpose & Scope
**LiveCode Logic Trainer** is a specialized, interactive web application built for live-coding technical interview preparation. It enables software engineers (Backend, Frontend, Full Stack, QA, **DevOps**) to practice JavaScript REST API logic under strict interview time constraints (**max 30 minutes**). The app features a split-pane IDE, countdown timer auto-submit, real-time local test execution via **Web Worker sandbox**, a **Dual-Engine AI assessment system** (Groq primary + rich local fallback for rate-limited scenarios), and an interactive **Fun Gamification Suite** (Recruiter Personas, Web Audio FX, Achievements) to eliminate interview anxiety.

### Complete Tech Stack & Key Configurations
- **Framework**: Next.js 16 (App Router, Turbopack, React 19).
### Complete Tech Stack & Key Configurations
- **Framework**: Next.js 16 (App Router, Turbopack, React 19).
- **Telemetry & Analytics**: `@vercel/speed-insights` & `@vercel/analytics` integrated into `app/layout.tsx`.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`) with **Sana Labs Pure White Light Design System** — see §Design System below.
- **Code Editor**: `@monaco-editor/react` (`antigravity-dark` obsidian theme based on `vs-dark`, JS syntax highlighting, `fontLigatures`, `cursorBlinking: smooth`, `smoothScrolling`).
- **Markdown Rendering**: `react-markdown` with GFM support (`prose-zinc`).
- **AI Assessment Engine**: `groq-sdk` calling model `llama-3.3-70b-versatile` with `response_format: { type: "json_object" }`. Features **automatic rate-limit fallback** (TPD exhaustion detection) — returns rich local evaluation instead of HTTP 500.
- **Audio Synthesizer Engine**: Web Audio API oscillator/gain node synth (`lib/soundFX.ts`) for offline, zero-dependency sound cues.
- **SEO & Production Readiness**: Complete Next.js 16 Metadata (`title`, `description`, `keywords`, `openGraph`, `twitter`, `icons`) and separate `Viewport` configuration (`themeColor: "#ffffff"`).
- **Database / Storage**: **NONE (Strictly In-Memory)**. Seed data and session states use JavaScript objects/arrays.
- **Visual FX**: `canvas-confetti` on successful assessment pass (violet/emerald palette).
- **Environment Config**: `GROQ_API_KEY` defined in `.env.local` (ignored by git).

---

## 2. DESIGN SYSTEM — SANA LABS PURE WHITE LIGHT

### Motion Tokens (defined in `app/globals.css`)
```css
--ease-spring:    cubic-bezier(0.16, 1, 0.3, 1)   /* Spring — matches GSAP default */
--ease-out:       cubic-bezier(0.0, 0, 0.2, 1)
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1)
--duration-fast:  150ms
--duration-base:  250ms
--duration-slow:  400ms
--duration-xslow: 600ms
```

### Color System
```
--bg-base:     #ffffff   (pristine white — body & nav backgrounds)
--bg-surface:  #fafafa   (panel surfaces — ProblemPanel, ConsolePanel)
--bg-elevated: #f4f4f5   (elevated cards)
--border-subtle: rgba(0,0,0,0.06)
--border-mid:    rgba(0,0,0,0.10)
--border-strong: rgba(0,0,0,0.18)
```

### Glow Accent Variables
```
--glow-emerald: rgba(16,185,129,0.15)    -- success states
--glow-violet:  rgba(139,92,246,0.15)    -- hero accents, active filters
--glow-amber:   rgba(245,158,11,0.15)    -- warning timer, bonus tabs
--glow-rose:    rgba(244,63,94,0.18)     -- error/fail states
```

### Utility Classes
| Class | Purpose |
|---|---|
| `.glass-panel` | `bg-white/[0.025]` + `backdrop-blur(20px)` + subtle border |
| `.glass-card` | `bg-white/[0.035]` + hover lift + border transition |
| `.glow-badge` | Pill with glass bg, hairline border, hover brighten |
| `.glow-border-{color}` | Color-keyed box-shadow glow ring (emerald/violet/rose/amber) |
| `.glow-aura-{color}` | Timer state auras (rose/amber/zinc) |
| `.hover-lift` | `translateY(-1px)` + shadow on hover, resets on active |
| `.btn-glass` | Spring easing on all interactive transitions + `scale(0.97)` on active |
| `.gradient-text` | Static zinc gradient text |
| `.gradient-text-shimmer` | Animated shimmer gradient text |

### Keyframe Animations
| Keyframe | Usage |
|---|---|
| `slideUpFade` | Modal/panel entrance — scale(0.97)+translateY(8px) → 1/0 |
| `scaleIn` | Badge pop, icon pop — scale(0.85) → 1 |
| `glowPulse` | Ambient orbs, slow breathing glow |
| `dangerPulse` | Timer critical state — breathing red box-shadow |
| `textShimmer` | Hero gradient text animation |
| `badgeEntrance` | Achievement badge stagger entrance |

### Component Glassmorphism Summary
| Component | Background | Blur | Border |
|---|---|---|---|
| Navigation | `rgba(9,9,11,0.80)` | 24px | `rgba(255,255,255,0.06)` |
| SessionHeader | `rgba(9,9,11,0.75)` | 24px | `rgba(255,255,255,0.06)` |
| RecruiterMoodMeter | `rgba(255,255,255,0.04)` | 16px | `rgba(255,255,255,0.08)` |
| ProblemPanel | `var(--bg-surface)=#0c0c0f` | — | dark tabs |
| EditorPanel toolbar | `rgba(9,9,11,0.80)` | 16px | `rgba(255,255,255,0.06)` |
| ResultsModal backdrop | `rgba(9,9,11,0.88)` | 28px | — |
| ResultsModal container | `rgba(12,12,15,0.95)` | — | `rgba(255,255,255,0.08)` |

---

## 3. PROJECT STRUCTURE & ARCHITECTURE

### Directory Tree & Responsibilities
```
livecode-logic-trainer/
├── app/                            # Next.js App Router root
│   ├── page.tsx                    # Landing page, role filter, problem cards & gamification banner
│   ├── layout.tsx                  # Root HTML layout, SEO metadata, OpenGraph & themeColor
│   ├── globals.css                 # Tailwind CSS v4 directives, Sana Labs design system tokens
│   ├── session/[problemId]/
│   │   └── page.tsx                # Interactive split-pane live coding session (30-min limit)
│   └── api/
│       └── assess/
│           └── route.ts            # POST /api/assess (Groq LLM + local evaluator route)
├── components/                     # Modular UI Components
│   ├── SessionHeader.tsx           # Glass nav bar, recruiter HUD, timer, volume toggle & action buttons
│   ├── RecruiterMoodMeter.tsx      # Glass pill HUD (Indo Tech Lead, FAANG Lead, YC Founder) + animated commentary
│   ├── TimerBar.tsx                # Countdown timer with color-keyed glow aura states
│   ├── ProblemPanel.tsx            # Left dark panel: Markdown description, bonus, rubric
│   ├── EditorPanel.tsx             # Right panel: Monaco Editor with glass toolbar
│   ├── ConsolePanel.tsx            # Bottom drawer: Local unit test runner & execution logs
│   └── ResultsModal.tsx            # Assessment modal: status-keyed glow ring, staggered badges
├── lib/                            # Core Logic & Utilities
│   ├── types.ts                    # TypeScript interfaces (Problem, AssessmentResult, Achievement, Persona)
│   ├── problems.ts                 # 14 In-memory problem seed definitions (Junior, Mid-Level across 5 roles incl. DevOps)
│   ├── soundFX.ts                  # Web Audio API synthesizer for test run, chime, error & fanfare cues
│   └── evaluator.ts                # Isolated JS function sandbox & dynamic unit test assertion runner (14 problem suites)
├── public/
│   └── workers/
│       └── executor.worker.js      # Web Worker sandbox for secure client-side code execution (problem-specific dispatch)
├── .env.local                      # Secret keys (GROQ_API_KEY - Git Ignored)
├── .env.local.example              # Key template for development
├── README.md                       # Developer documentation & quickstart
└── PROJECT_STATE.md                # Single Source of Truth for AI Agents
```

### Architectural Patterns Applied
- **Next.js App Router Component Hierarchy**: Server components for route layout; `'use client'` explicitly declared on interactive client widgets (`EditorPanel`, `TimerBar`, `RecruiterMoodMeter`, `ResultsModal`, `ProblemPanel`).
- **Recruiter Persona HUD & Live Speech Commentary**: Interactive selector switching between *Indo Tech Lead ☕*, *FAANG Lead 🧐*, and *YC Founder 🚀*, generating context-aware motivational feedback. Commentary fades in via `animate-fade-in` keyed on commentary content for smooth transitions.
- **Offline Web Audio Synthesizer**: Zero external asset dependencies using `AudioContext` oscillators for instant sound feedback on test runs, passes, errors, and fanfares.
- **Achievement Badges Engine**: Calculates post-session awards (`⚡ Speed Demon`, `🛡️ Zero Bug Ninja`, `🧠 Architecture Guru`, `🔥 Clutch Master`) with staggered badge entrance animations.
- **Decoupled Timer State Management**: `TimerBar.tsx` uses decoupled ref callbacks and standalone `useEffect` listeners to eliminate React 19 `setState`-in-render warnings. Timer states drive color-keyed glow aura transitions via CSS `dangerPulse` / amber box-shadow.
- **Dual-Engine Evaluation Strategy**:
  1. *Primary Engine*: Groq API (`llama-3.3-70b-versatile`) producing strict structured JSON evaluations.
  2. *Rate Limit Fallback*: When Groq TPD (tokens per day) is exhausted, `app/api/assess/route.ts` detects the 429 error and automatically serves a rich `AssessmentResult` built from local test data — problem-specific score, passed/failed test details, best practices, and a clear `⚠️ Rate limit note`. No HTTP 500 exposed to client.
  3. *Auxiliary Engine*: `lib/evaluator.ts` running mocked Express `req`/`res` contexts via JavaScript `Function` constructor for zero-latency local feedback.
- **Web Worker Code Execution**: `public/workers/executor.worker.js` runs user code in a secure sandboxed Worker thread with:
  - Fixed `express is not a function` bug — `mockExpress` is now a proper **function** that returns `mockApp` when called (not a plain object).
  - Problem-specific test dispatch — routes test assertions based on `problemId` matching `postRoutes` paths.
  - 5-second watchdog timeout to prevent infinite loops.

---

## 4. CURRENT IMPLEMENTATION STATE & DATA FLOW

### Built Modules & Active Features
1. **Landing / Problem Discovery (`app/page.tsx`)**: Filterable catalog of **12 problems** (Junior & Mid-Level) across Backend, Frontend, Full Stack, and QA roles. Features dual ambient glow orbs, mesh grid overlay, violet-accented hero headline, glass filter pills with ring glow on active, glass problem cards with inset radial hover glow, and gradient Start Challenge CTA.
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
   - `docker-healthcheck-api`: Container Health Check & Readiness Probe API (DevOps • Mid-Level • 30m) **[NEW]**
   - `cicd-pipeline-gate`: CI/CD Quality Gate & Automated Deploy Guard (DevOps • Mid-Level • 30m) **[NEW]**
3. **Interactive Live Session (`app/session/[problemId]/page.tsx`)**:
   - Synchronized **30-minute** countdown timer with color-keyed glow aura warnings (amber → rose with `dangerPulse` breathing animation).
   - Recruiter Mood Meter glass pill HUD with animated commentary fade-in and emoji drop-shadow glow.
   - Live Monaco code editor with glass toolbar, smooth caret animation, and font ligatures.
4. **Local Test Runner & Audio FX**: Runs mock payload assertions with sound effects across all 12 problem endpoints.
5. **AI Assessment Route & Badges**: Receives code, executes tests, calls Groq LLM, calculates achievement badges, triggers celebratory confetti (violet/emerald palette) and fanfare audio on PASS. Results modal features status-keyed glow ring and staggered badge entrance animations.
6. **Vercel Telemetry & Performance Monitoring**: `@vercel/analytics` and `@vercel/speed-insights` integrated into root layout for Web Vitals and user interaction metrics tracking.

---

## 5. REMAINING TASKS, TODOs & TECHNICAL DEBT

### Pending Enhancements & Future Features
- **Multi-File Problem Support**: Extend `EditorPanel` to support multiple tabs (e.g., `routes.js`, `controllers.js`, `models.js`).
- **User Progress Persistence**: Optional localStorage or IndexedDB persistence for solved problem history and streak stats.

---

## 6. AI AGENT CODING GUIDELINES

### Naming & Placement Conventions
- **Components**: PascalCase in `components/` (e.g., `RecruiterMoodMeter.tsx`, `ResultsModal.tsx`). Always add `'use client';` directive if hooks or DOM references are used.
- **API Routes**: App Router syntax in `app/api/<route-name>/route.ts`. Use standard `NextRequest` and `NextResponse`.
- **Logic & Types**: Exported type definitions strictly placed in `lib/types.ts`. Seed data in `lib/problems.ts`. Sound synthesis in `lib/soundFX.ts`.
- **Environment Keys**: NEVER hardcode API keys or secret strings in code files. Always read from `process.env.GROQ_API_KEY` and reference in `.env.local.example`.

### Design System Guidelines for AI Agents
- **Always use CSS custom properties** (`var(--ease-spring)`, `var(--bg-surface)`) for motion and color tokens.
- **Glass components**: Use inline styles for `backdrop-filter` + `background: rgba(...)` to avoid Tailwind purging issues with dynamic opacity values.
- **Button interactions**: Apply `.btn-glass` class for spring-eased transitions. Use `.hover-lift` for interactive cards and CTA buttons.
- **Animations**: Use `.animate-fade-in` (slideUpFade) for panel transitions, `.animate-scale-in` for popups/badges, `.animate-badge-entrance` with `.stagger-{1-4}` for grids.

### Workflow for Implementing New Features / Problems
1. **Define Types**: Update `lib/types.ts` if adding new data properties.
2. **Add Seed Problem**: Append new problem object to `PROBLEMS` array in `lib/problems.ts`.
3. **Update Evaluator**: Add specialized assertion functions in `lib/evaluator.ts` if new endpoint routes are introduced.
4. **Build Component / UI**: Add modular UI components in `components/` using the Sana Labs obsidian design system (glass panels, spring easing, glow accents).
5. **Verify Build**: Run `npm run build` to verify zero TypeScript or Turbopack errors.
6. **Git Commit**: Commit logical increments in English with descriptive message prefixes (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`).

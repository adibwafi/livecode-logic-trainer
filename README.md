# LiveCode Logic Trainer 🚀

An interactive, timed web application designed for live-code technical interview preparation. Practice JavaScript REST API logic under real interview time constraints (**strictly capped at 30 minutes**) for Backend, Frontend, Full Stack, QA, and **DevOps** roles across Indonesian and global tech companies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-IDE-blue?style=for-the-badge&logo=visualstudiocode)
![Groq LLM](https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-orange?style=for-the-badge)

---

## 🎨 Design System — Sana Labs Cinematic Obsidian

The UI is built on a **cinematic dark-mode design language** inspired by Sana Labs' fluid visual identity:

- **Obsidian Backgrounds**: Deep `#09090b` base with `#0c0c0f` surface panels
- **Spring Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` — the same spring curve used by GSAP — on all interactive transitions, modal entrances, and state changes
- **Glassmorphism**: `backdrop-blur(16–28px)` panels with hairline `rgba(255,255,255,0.06–0.10)` borders
- **Color-Keyed Glow Auras**: Emerald (success), violet (active/accent), amber (warning), rose (error/fail)
- **Micro-interactions**: hover-lift, btn-glass spring scale, staggered badge entrance animations
- **Cinematic Keyframes**: `slideUpFade`, `scaleIn`, `dangerPulse` (timer breathing glow), `textShimmer`, `glowPulse` (ambient orbs)

---

## ⚡ Core Features

- **Split-Pane IDE UI**: Left dark panel for problem specifications & bonus architecture prompts (`react-markdown` with `prose-invert`); right panel for live coding with **Monaco Editor** (`vs-dark` theme, font ligatures, smooth caret, `scrolling smooth`).
- **Strict 30-Minute Countdown Timer**: Enforces 30-minute time limits. Color-keyed glow aura transitions: normal glass → amber warning glow → rose `dangerPulse` breathing animation at < 5 minutes. Automatically locks editor to Read-Only and submits code when time reaches `00:00`.
- **Recruiter Persona HUD & Live Speech**:
  - ☕ **Indo Tech Lead** (*Mas Mas Tech Lead Ramah*): Relaxed, encouraging feedback in Bahasa Indonesia.
  - 🧐 **Global FAANG Interviewer**: Strict focus on edge cases, boundary conditions, and algorithmic efficiency.
  - 🚀 **YC Startup Founder**: High-speed execution focus ("Ship fast, test quick!").
  - Commentary fades in smoothly via `animate-fade-in` keyed on content change.
- **Web Audio FX Engine**: Offline, zero-dependency Web Audio synthesizers for test run clicks, success major chimes, failure double tones, and victory fanfares (with Mute/Unmute toggle).
- **Achievement Badges System**: Unlockable post-assessment badges (`⚡ Speed Demon`, `🛡️ Zero Bug Ninja`, `🧠 Architecture Guru`, `🔥 Clutch Master`) with staggered entrance animations in the Results Modal.
- **Local Unit Test Console**: Execute isolated unit test cases against your Monaco code in real-time before final submission across all 14 problem endpoints.
- **Dual-Engine Assessment System**:
  - **Primary**: Groq LLM (`llama-3.3-70b-versatile`) for deep AI code review, edge case evaluation, and conceptual bonus scoring.
  - **Fallback (Rate Limit / No API Key)**: When Groq daily token quota (TPD) is exhausted or `GROQ_API_KEY` is not configured, the system **automatically falls back** to a rich local evaluation — returns problem-specific score, passed/failed test cases, best practice tips, and a detailed note explaining the AI fallback. No HTTP 500 errors.
  - Bonus topics: Argon2/bcrypt, Debouncing vs Throttling, QA EP & BVA, Feature Flags, PostgreSQL Race Conditions, Redis Rate Limiting, Idempotency, JWT Security, Webhook DLQ, Circuit Breakers, Pact Contract Testing, Kubernetes Probes, Blue-Green & Canary Deployments.
- **Vercel Telemetry & Speed Insights**: Integrated `@vercel/analytics` and `@vercel/speed-insights` for real-time web performance metrics and user traffic monitoring.
- **Results Modal**: Status-keyed glow ring (emerald/amber/rose), color-coded score with text-shadow glow, confetti (violet/emerald palette), glass tab navigation, staggered achievement badge entrance.

---

## 📚 Problem Catalog (Junior & Mid-Level, <= 30 Mins) — 14 Problems

### 🟢 Junior Level Problems
1. **User Registration & Password Complexity Validator** (`Backend Engineer` • `Junior` • 30 mins)
   - Endpoint: `POST /users/register`
   - Key Logic: Mandatory field validation, email syntax verification, password strength (>= 8 chars, 1 uppercase, 1 digit), age >= 18 check, duplicate email rejection (`HTTP 409`).
   - Bonus: Password security (Argon2 / bcrypt vs MD5, Salt, and Salt Rounds).

2. **API Data Filtering & Pagination Engine** (`Frontend Engineer` • `Junior` • 30 mins)
   - Endpoint: `POST /api/products/search`
   - Key Logic: Category matching, case-insensitive substring search, pagination metadata calculation (`totalItems`, `totalPages`), array slicing.
   - Bonus: Debouncing vs Throttling techniques for frontend live search inputs & infinite scroll listeners.

3. **API Payload Schema & Type Assertion Engine** (`QA Engineer` • `Junior` • 30 mins)
   - Endpoint: `POST /test/validate-payload`
   - Key Logic: String length & regex format validation (username 3-20 chars), email format check, enum role verification (`ADMIN`, `USER`, `GUEST`), non-empty array of strings check.
   - Bonus: QA Boundary Value Analysis (BVA) & Equivalence Partitioning (EP) testing methods.

### 🔵 Mid-Level Problems
4. **Multi-Tenant Feature Flag & Percentage Rollout Engine** (`Full Stack Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /features/evaluate`
   - Key Logic: Tenant override lookup, global feature toggle evaluation, hash-based user percentage rollout.
   - Bonus: Distributed Feature Flag Management (LaunchDarkly, Unleash, Redis caching).

5. **E-commerce Voucher Redemption API** (`Backend Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /redeem`
   - Key Logic: Quota decrement, duplicate redemption protection per user, missing parameter validation.
   - Bonus: PostgreSQL Race Condition handling (`SELECT FOR UPDATE`, Unique Constraints, Atomic Updates).

6. **In-Memory Sliding Window Rate Limiter** (`Backend Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /api/action`
   - Key Logic: 60-second sliding window, max 5 requests per IP (`HTTP 429`), timestamp garbage collection.
   - Bonus: Redis Distributed Rate Limiter (`INCR + EXPIRE` vs `ZSET`).

7. **E-commerce Cart Checkout & Tax Engine** (`Full Stack Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /cart/checkout`
   - Key Logic: Stock validation, category discount calculation with cap, PPN 11% tax computation.
   - Bonus: Payment gateway idempotency via `X-Idempotency-Key`.

8. **Flash Sale Inventory Stock Reservation** (`Backend Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /orders/reserve`
   - Key Logic: Available inventory calculation (`totalStock - reservedStock`), TTL reservation creation.
   - Bonus: Automated TTL release via Redis Keyspace Notifications vs BullMQ Delayed Job Queue.

9. **JWT Token Refresh & Auto-Logout State Engine** (`Frontend Engineer` • `Mid-Level` • 30 mins)
   - Endpoint: `POST /auth/refresh`
   - Key Logic: Handle token expiry (401), invalid token (403), generate fresh access token.
   - Bonus: XSS vs CSRF mitigation when storing JWTs (HttpOnly Cookie + SameSite vs LocalStorage).

10. **Payment Gateway Idempotent Webhook Handler** (`Backend Engineer` • `Mid-Level` • 30 mins)
    - Endpoint: `POST /webhook/payment`
    - Key Logic: Header signature verification (`x-signature`), duplicate event ID deduplication (`HTTP 200`).
    - Bonus: Webhook Dead Letter Queue (DLQ) & Exponential Backoff Retry strategies.

11. **Resilient Notification Dispatcher with Provider Fallback** (`Full Stack Engineer` • `Mid-Level` • 30 mins)
    - Endpoint: `POST /notifications/send`
    - Key Logic: SendGrid primary attempt, automatic Mailgun secondary fallback upon errors.
    - Bonus: Circuit Breaker pattern (CLOSED, OPEN, HALF-OPEN states).

12. **Order Lifecycle State Machine & Test Suite** (`QA Engineer` • `Mid-Level` • 30 mins)
    - Endpoint: `POST /orders/transition`
    - Key Logic: Finite State Machine transition validation (`CREATED -> PAID -> PROCESSING -> SHIPPED -> DELIVERED`).
    - Bonus: Integration Testing vs Consumer-Driven Contract Testing (Pact).

### 🚀 DevOps Engineer Problems (New!)
13. **Container Health Check & Readiness Probe API** (`DevOps Engineer` • `Mid-Level` • 30 mins)
    - Endpoints: `POST /health` (Liveness Probe) & `POST /readiness` (Readiness Probe)
    - Key Logic: Liveness detection with unhealthy state simulation, multi-dependency readiness check (`database`, `cache`), proper HTTP 200/503 responses.
    - Bonus: Kubernetes Liveness vs Readiness vs Startup Probe — YAML configuration & use cases.

14. **CI/CD Quality Gate & Automated Deploy Guard** (`DevOps Engineer` • `Mid-Level` • 30 mins)
    - Endpoint: `POST /pipeline/gate`
    - Key Logic: Three-gate pipeline validator — branch protection (only `main`/`master` to production), build status check, coverage threshold (80% production / 60% staging).
    - Bonus: Blue-Green Deployment, Canary Release, and Feature Flags as an emergency safety valve.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/adibwafi/livecode-logic-trainer.git
   cd livecode-logic-trainer
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Groq API Key (get a free key at [console.groq.com](https://console.groq.com/keys)):
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
   *(Note: If no API key is set, the app falls back to the built-in isolated local unit test evaluator).*

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Repository Structure

```
livecode-logic-trainer/
├── app/
│   ├── page.tsx                    # Landing page, role filter & glassmorphism problem cards
│   ├── layout.tsx                  # Root HTML layout, SEO metadata, OpenGraph & themeColor
│   ├── globals.css                 # Tailwind CSS v4 + Sana Labs motion tokens & utility classes
│   ├── session/[problemId]/
│   │   └── page.tsx                # Split-pane interactive session page
│   └── api/
│       └── assess/
│           └── route.ts            # POST /api/assess (Groq LLM & Evaluator API)
├── components/
│   ├── SessionHeader.tsx           # Glass nav, recruiter HUD, timer & audio toggle
│   ├── RecruiterMoodMeter.tsx      # Glass HUD pill, persona selector, animated commentary
│   ├── TimerBar.tsx                # Countdown timer with color-keyed glow aura states
│   ├── ProblemPanel.tsx            # Dark obsidian problem description & tabbed bonus/hints
│   ├── EditorPanel.tsx             # Monaco Editor with glass toolbar & spring interactions
│   ├── ConsolePanel.tsx            # Local isolated test runner drawer
│   └── ResultsModal.tsx            # Status-keyed glow modal, staggered achievement badges
├── lib/
│   ├── types.ts                    # TypeScript interface definitions
│   ├── problems.ts                 # 14 In-memory problem seed definitions (incl. 2 DevOps)
│   ├── soundFX.ts                  # Web Audio API sound synthesizer
│   └── evaluator.ts                # Isolated JS unit test runner
├── .env.local.example              # Environment variables template
└── PROJECT_STATE.md                # Single Source of Truth architectural spec (w/ design system)
```

---

## 📄 License

MIT License. Designed for live-code interview training & technical assessment.

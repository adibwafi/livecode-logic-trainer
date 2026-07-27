# LiveCode Logic Trainer 🚀

An interactive, timed web application designed for live-code technical interview preparation. Practice JavaScript REST API logic under real interview time constraints (**strictly capped at 30 minutes**) for Backend, Frontend, Full Stack, and QA roles across Indonesian and global tech companies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-IDE-blue?style=for-the-badge&logo=visualstudiocode)
![Groq LLM](https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-orange?style=for-the-badge)

---

## ⚡ Core Features

- **Split-Pane IDE UI**: Left panel for problem specifications & bonus architecture prompts (`react-markdown`); right panel for live coding with **Monaco Editor** (`vs-dark` theme, JavaScript syntax highlighting, line numbers, auto-formatting).
- **Strict 30-Minute Countdown Timer**: Enforces 30-minute time limits based on standard recruiter user interview constraints. Automatically locks editor to Read-Only and submits code when time reaches `00:00`.
- **Recruiter Persona HUD & Live Speech**:
  - ☕ **Indo Tech Lead** (*Mas Mas Tech Lead Ramah*): Relaxed, encouraging feedback in Bahasa Indonesia.
  - 🧐 **Global FAANG Interviewer**: Strict focus on edge cases, boundary conditions, and algorithmic efficiency.
  - 🚀 **YC Startup Founder**: High-speed execution focus ("Ship fast, test quick!").
- **Web Audio FX Engine**: Offline, zero-dependency Web Audio synthesizers for test run clicks, success major chimes, failure double tones, and victory fanfares (with Mute/Unmute toggle).
- **Achievement Badges System**: Unlockable post-assessment badges (`⚡ Speed Demon`, `🛡️ Zero Bug Ninja`, `🧠 Architecture Guru`, `🔥 Clutch Master`).
- **Local Unit Test Console**: Execute isolated unit test cases against your Monaco code in real-time before final submission.
- **Groq LLM Assessment Engine**: Evaluates code submissions using `llama-3.3-70b-versatile` for:
  - Logic correctness & unhandled edge cases
  - Engineering best practices (modularity, status codes `200`, `400`, `404`, `429`, `503`)
  - Conceptual bonus question evaluation (PostgreSQL Race Conditions, Redis Rate Limiting, Idempotency, JWT Security, Webhook DLQ, Circuit Breakers, Pact Contract Testing).
  - Production-grade ideal solution generation.

---

## 📚 Seed Problem Catalog (Mid-Level, <= 30 Mins)

1. **E-commerce Voucher Redemption API** (`Backend Engineer` • 30 mins)
   - Endpoint: `POST /redeem`
   - Key Logic: Quota decrement, duplicate redemption protection per user, missing parameter validation.
   - Bonus: PostgreSQL Race Condition handling (`SELECT FOR UPDATE`, Unique Constraints, Atomic Updates).

2. **In-Memory Sliding Window Rate Limiter** (`Backend Engineer` • 30 mins)
   - Endpoint: `POST /api/action`
   - Key Logic: 60-second sliding window, max 5 requests per IP (`HTTP 429`), timestamp garbage collection.
   - Bonus: Redis Distributed Rate Limiter (`INCR + EXPIRE` vs `ZSET`).

3. **E-commerce Cart Checkout & Tax Engine** (`Full Stack Engineer` • 30 mins)
   - Endpoint: `POST /cart/checkout`
   - Key Logic: Stock validation, category discount calculation with cap, PPN 11% tax computation.
   - Bonus: Payment gateway idempotency via `X-Idempotency-Key`.

4. **Flash Sale Inventory Stock Reservation** (`Backend Engineer` • 30 mins)
   - Endpoint: `POST /orders/reserve`
   - Key Logic: Available inventory calculation (`totalStock - reservedStock`), TTL reservation creation.
   - Bonus: Automated TTL release via Redis Keyspace Notifications vs BullMQ Delayed Job Queue.

5. **JWT Token Refresh & Auto-Logout State Engine** (`Frontend Engineer` • 30 mins)
   - Endpoint: `POST /auth/refresh`
   - Key Logic: Handle token expiry (401), invalid token (403), generate fresh access token.
   - Bonus: XSS vs CSRF mitigation when storing JWTs (HttpOnly Cookie + SameSite vs LocalStorage).

6. **Payment Gateway Idempotent Webhook Handler** (`Backend Engineer` • 30 mins)
   - Endpoint: `POST /webhook/payment`
   - Key Logic: Header signature verification (`x-signature`), duplicate event ID deduplication (`HTTP 200`).
   - Bonus: Webhook Dead Letter Queue (DLQ) & Exponential Backoff Retry strategies.

7. **Resilient Notification Dispatcher with Provider Fallback** (`Full Stack Engineer` • 30 mins)
   - Endpoint: `POST /notifications/send`
   - Key Logic: SendGrid primary attempt, automatic Mailgun secondary fallback upon errors.
   - Bonus: Circuit Breaker pattern (CLOSED, OPEN, HALF-OPEN states).

8. **Order Lifecycle State Machine & Test Suite** (`QA Engineer` • 30 mins)
   - Endpoint: `POST /orders/transition`
   - Key Logic: Finite State Machine transition validation (`CREATED -> PAID -> PROCESSING -> SHIPPED -> DELIVERED`).
   - Bonus: Integration Testing vs Consumer-Driven Contract Testing (Pact).

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
│   ├── page.tsx                    # Landing page, role filter & problem cards
│   ├── session/[problemId]/
│   │   └── page.tsx                # Split-pane interactive session page
│   └── api/
│       └── assess/
│           └── route.ts            # POST /api/assess (Groq LLM & Evaluator API)
├── components/
│   ├── SessionHeader.tsx           # Title, recruiter HUD, timer bar & audio toggle
│   ├── RecruiterMoodMeter.tsx      # Recruiter HUD widget & persona speech bubbles
│   ├── TimerBar.tsx                # Countdown timer with warning states (30m max)
│   ├── ProblemPanel.tsx            # Markdown problem description & bonus tabs
│   ├── EditorPanel.tsx             # Monaco Editor client wrapper
│   ├── ConsolePanel.tsx            # Local isolated test runner drawer
│   └── ResultsModal.tsx            # AI assessment report & achievement badges modal
├── lib/
│   ├── types.ts                    # TypeScript interface definitions
│   ├── problems.ts                 # 8 In-memory problem seed data
│   ├── soundFX.ts                  # Web Audio API sound synthesizer
│   └── evaluator.ts                # Isolated JS unit test runner
├── .env.local.example              # Environment variables template
└── PROJECT_STATE.md                # Single Source of Truth architectural spec
```

---

## 📄 License


MIT License. Designed for live-code interview training & technical assessment.

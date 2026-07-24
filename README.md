# LiveCode Logic Trainer 🚀

An interactive, timed web application designed for live-code technical interview preparation. Practice JavaScript REST API logic under real interview time constraints (30–45 minutes) for Backend, Frontend, Full Stack, and QA roles.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-IDE-blue?style=for-the-badge&logo=visualstudiocode)
![Groq LLM](https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-orange?style=for-the-badge)

---

## ⚡ Core Features

- **Split-Pane IDE UI**: Left panel for problem specifications & bonus questions (`react-markdown`); right panel for live coding with **Monaco Editor** (`vs-dark` theme, JavaScript syntax highlighting, line numbers, auto-formatting).
- **Configurable Countdown Timer**: Enforces 30 or 45-minute limits with visual warning states (cyan $\rightarrow$ amber $<10$m $\rightarrow$ flashing red $<5$m). Automatically locks editor to Read-Only and submits code when time reaches `00:00`.
- **Local Unit Test Console**: Execute isolated unit test cases against your Monaco code in real-time before final submission.
- **Groq LLM Assessment Engine**: Evaluates code submissions using `llama-3.3-70b-versatile` for:
  - Logic correctness & unhandled edge cases
  - Engineering best practices (modularity, error handling, status codes `200`, `400`, `404`)
  - **PostgreSQL Race Condition Bonus Evaluation**: Evaluates text comments explaining `SELECT FOR UPDATE`, Unique Constraints, and Atomic Updates.
  - Production-grade ideal solution generation.
- **Zero Database Infrastructure**: All problem seed data and initial state are maintained strictly in-memory using JavaScript objects & arrays.

---

## 🚀 Seed Problem

- **Title**: E-commerce Voucher Redemption API
- **Target Role**: Backend Engineer (Mid-Level)
- **Time Limit**: 45 Minutes
- **Endpoint**: `POST /redeem`
- **Initial Data State**: `vouchers = [{ code: "PROMO50", quota: 5 }, { code: "WELCOME", quota: 10 }]`, `redeemedVouchers = []`
- **Logic Rules**:
  1. Voucher must exist (`404 Not Found`).
  2. Voucher quota must be $> 0$ (`400 Bad Request`).
  3. One user can only redeem the same voucher once (`400 Bad Request`).
  4. Missing payload validation (`400 Bad Request`).
- **Bonus Question**: Explain handling PostgreSQL race conditions (`SELECT FOR UPDATE`, Unique Constraints, Atomic Updates).

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
│   ├── page.tsx                    # Landing page & problem selector
│   ├── session/[problemId]/
│   │   └── page.tsx                # Split-pane interactive session page
│   └── api/
│       └── assess/
│           └── route.ts            # POST /api/assess (Groq LLM & Evaluator API)
├── components/
│   ├── SessionHeader.tsx           # Title, role badge, timer bar, action triggers
│   ├── TimerBar.tsx                # Countdown timer with warning states
│   ├── ProblemPanel.tsx            # Markdown problem description & bonus tabs
│   ├── EditorPanel.tsx             # Monaco Editor client wrapper
│   ├── ConsolePanel.tsx            # Local isolated test runner drawer
│   └── ResultsModal.tsx            # Comprehensive AI assessment report modal
├── lib/
│   ├── types.ts                    # TypeScript interface definitions
│   ├── problems.ts                 # In-memory problem seed data
│   └── evaluator.ts                # Isolated JS unit test runner
├── .env.local.example              # Environment variables template
└── PROJECT_STATE.md                # Single Source of Truth architectural spec
```

---

## 📄 License

MIT License. Designed for live-code interview training & technical assessment.

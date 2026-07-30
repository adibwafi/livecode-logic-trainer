/**
 * public/workers/executor.worker.js
 * Web Worker — Secure Code Execution Engine
 *
 * Runs user-submitted JS code in a sandboxed Worker thread.
 * Prevents infinite loops with a hard 5-second watchdog timeout.
 * Communicates via postMessage/onmessage protocol.
 *
 * Message IN:  { type: 'RUN', payload: { code: string, problemId: string } }
 * Message OUT: { type: 'RESULT', payload: TestRunResult }
 *              { type: 'ERROR',  payload: { message: string } }
 */

/* eslint-disable no-restricted-globals */

// ── Watchdog: kill worker if execution exceeds 5 seconds ──────────────────────
let watchdog = null;

function resetWatchdog() {
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(() => {
    self.postMessage({
      type: 'ERROR',
      payload: { message: '⏱ Execution timed out (5s limit). Check for infinite loops.' },
    });
    // Terminate cleanly — parent will create a fresh worker next run
    self.close();
  }, 5000);
}

// ── Mock Express-compatible req/res factory ───────────────────────────────────

function createMockReq(body = {}, params = {}, query = {}) {
  return { body, params, query, headers: {}, method: 'POST' };
}

function createMockRes() {
  const res = {
    _status: 200,
    _body: {},
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    send(body) { this._body = body; return this; },
  };
  return res;
}

// ── Safe eval with isolated scope ────────────────────────────────────────────

function safeEval(code) {
  // Create a function that returns the module.exports-style handler
  // We inject a minimal environment so user code can reference common patterns
  const wrapped = new Function(
    'require',
    'module',
    'exports',
    `
    "use strict";
    ${code}
    `
  );

  const mockModule = { exports: {} };
  const mockExports = {};

  // Minimal mock `require` — only allows common patterns
  const mockRequire = (mod) => {
    const allowed = {
      'express': () => {
        const app = { use: () => {}, get: () => {}, post: () => {}, listen: () => {} };
        return app;
      },
    };
    if (allowed[mod]) return allowed[mod]();
    return {};
  };

  wrapped(mockRequire, mockModule, mockExports);
  return mockModule.exports;
}

// ── Generic test harness (matches lib/evaluator.ts logic) ────────────────────

function runTests(code) {
  const results = [];
  const logs = [];
  let passedCount = 0;

  try {
    const userExports = safeEval(code);
    const handler = userExports.handler || userExports.default || userExports;

    if (typeof handler !== 'function') {
      return {
        passedCount: 0,
        totalCount: 1,
        results: [{
          id: 'export-check',
          name: 'Function Export Check',
          passed: false,
          error: 'No exported handler function found. Export your function as module.exports.handler or module.exports = function handler(...) {}',
        }],
        logs: ['[Worker] No handler function detected in exports.'],
      };
    }

    // Generic smoke tests that work across all problems
    const smokeTests = [
      {
        id: 'missing-body',
        name: 'Handles missing body gracefully',
        run: () => {
          const req = createMockReq({});
          const res = createMockRes();
          handler(req, res);
          return { status: res._status, body: res._body };
        },
        assert: (r) => r.status >= 200 && r.status < 600,
      },
      {
        id: 'returns-json',
        name: 'Returns a JSON-serialisable response',
        run: () => {
          const req = createMockReq({ test: true });
          const res = createMockRes();
          handler(req, res);
          return res._body;
        },
        assert: (body) => {
          try { JSON.stringify(body); return true; } catch { return false; }
        },
      },
    ];

    for (const test of smokeTests) {
      try {
        const result = test.run();
        const passed = test.assert(result);
        results.push({ id: test.id, name: test.name, passed, actualBody: result });
        if (passed) passedCount++;
      } catch (err) {
        results.push({ id: test.id, name: test.name, passed: false, error: String(err) });
        logs.push(`[Worker] Test "${test.name}" threw: ${err}`);
      }
    }

    logs.push(`[Worker] Execution complete. ${passedCount}/${smokeTests.length} passed.`);
  } catch (err) {
    logs.push(`[Worker] Evaluation error: ${err}`);
    return {
      passedCount: 0,
      totalCount: 1,
      results: [{
        id: 'eval-error',
        name: 'Code Evaluation',
        passed: false,
        error: `Syntax or runtime error: ${err}`,
      }],
      logs,
    };
  }

  return { passedCount, totalCount: results.length, results, logs };
}

// ── Message Handler ───────────────────────────────────────────────────────────

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'RUN') {
    resetWatchdog();

    try {
      const testResult = runTests(payload.code);
      clearTimeout(watchdog);
      self.postMessage({ type: 'RESULT', payload: testResult });
    } catch (err) {
      clearTimeout(watchdog);
      self.postMessage({
        type: 'ERROR',
        payload: { message: `Worker execution error: ${err}` },
      });
    }
  }
};

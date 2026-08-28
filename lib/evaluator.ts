/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestRunResult, TestResultItem } from './types';

/**
 * Isolated unit test runner for JavaScript Live Coding Problem Solving & REST API Logic.
 */
export function runLocalTests(userCode: string): TestRunResult {
  const logs: string[] = [];
  const results: TestResultItem[] = [];

  const customLog = (...args: any[]) => {
    logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  };

  try {
    const postRoutes: Record<string, any> = {};

    const mockApp = {
      use: () => {},
      post: (path: string, ...handlers: any[]) => {
        const routeHandler = handlers[handlers.length - 1];
        postRoutes[path] = routeHandler;
      },
      get: () => {},
      listen: () => {}
    };

    const mockExpress = () => mockApp;
    mockExpress.json = () => () => {};

    const executor = new Function('require', 'console', 'process', 'module', 'exports', userCode);

    const mockModule = { exports: {} as any };
    const mockRequire = (mod: string) => {
      if (mod === 'express') return mockExpress;
      return {};
    };

    executor(
      mockRequire,
      { log: customLog, error: customLog, warn: customLog, info: customLog },
      { env: { NODE_ENV: 'test' } },
      mockModule,
      mockModule.exports
    );

    const activePaths = Object.keys(postRoutes);
    const exportsObj = mockModule.exports || {};

    const hasGetMoneySpent = typeof exportsObj?.getMoneySpent === 'function' || userCode.includes('getMoneySpent');
    const hasFindReconciledPairs = typeof exportsObj?.findReconciledPairs === 'function' || userCode.includes('findReconciledPairs');
    const hasDetectSpikes = typeof exportsObj?.detectSpikes === 'function' || userCode.includes('detectSpikes');
    const hasQueryCatalog = typeof exportsObj?.queryCatalog === 'function' || userCode.includes('queryCatalog');

    const isPureFunction = hasGetMoneySpent || hasFindReconciledPairs || hasDetectSpikes || hasQueryCatalog;

    if (activePaths.length === 0 && !isPureFunction) {
      return {
        passedCount: 0,
        totalCount: 1,
        results: [
          {
            id: 'err_no_handler',
            name: 'Solution Handler Check',
            passed: false,
            error: 'Could not find app.post(...) endpoint or exported problem solving function in submitted code.'
          }
        ],
        logs
      };
    }

    // Helper for assertions
    const assert = (id: string, name: string, cond: boolean, actualVal?: any, errorMsg?: string) => {
      results.push({
        id,
        name,
        passed: cond,
        actualBody: actualVal,
        error: cond ? undefined : errorMsg
      });
    };

    // ── 1. Electronics Shop (getMoneySpent) ──────────────────────────────────
    if (hasGetMoneySpent) {
      let fn = typeof exportsObj?.getMoneySpent === 'function' ? exportsObj.getMoneySpent : null;
      if (!fn) {
        try {
          const evalFn = new Function(`${userCode}; return typeof getMoneySpent === 'function' ? getMoneySpent : null;`);
          fn = evalFn();
        } catch { /* ignore */ }
      }

      if (typeof fn === 'function') {
        const out1 = fn([3, 1], [5, 2, 8], 10);
        assert('tc_sample_0', 'Sample Case 0: Budget 10 -> 9', out1 === 9, out1, `Expected 9, got ${out1}`);

        const out2 = fn([4], [5], 5);
        assert('tc_sample_1', 'Sample Case 1: Budget 5 -> -1 (Overbudget)', out2 === -1, out2, `Expected -1, got ${out2}`);

        const out3 = fn([40, 50, 60], [5, 8, 12, 20], 60);
        assert('tc_exact_budget', 'Exact Budget Match: Budget 60 -> 60', out3 === 60, out3, `Expected 60, got ${out3}`);

        const out4 = fn([15, 25, 40], [30, 45, 60], 100);
        assert('tc_large_options', 'Multiple Options: Budget 100 -> 100', out4 === 100, out4, `Expected 100, got ${out4}`);
      } else {
        assert('err_fn_missing', 'getMoneySpent Definition', false, undefined, 'function getMoneySpent is not exported or defined.');
      }
    }

    // ── 2. Transaction Pair Reconciliation (findReconciledPairs) ─────────────
    if (hasFindReconciledPairs) {
      let fn = typeof exportsObj?.findReconciledPairs === 'function' ? exportsObj.findReconciledPairs : null;
      if (!fn) {
        try {
          const evalFn = new Function(`${userCode}; return typeof findReconciledPairs === 'function' ? findReconciledPairs : null;`);
          fn = evalFn();
        } catch { /* ignore */ }
      }

      if (typeof fn === 'function') {
        const out1 = fn(
          [
            { id: "T1", amount: 300 },
            { id: "T2", amount: 700 },
            { id: "T3", amount: 500 },
            { id: "T4", amount: 500 }
          ],
          1000
        );
        const pass1 = Array.isArray(out1) && out1.length === 2;
        assert('tc_exact_pairs', 'Standard Pairs Match (Target 1000)', pass1, out1, `Expected 2 matched pairs`);

        const out2 = fn([{ id: "T1", amount: 200 }, { id: "T2", amount: 300 }], 1000);
        const pass2 = Array.isArray(out2) && out2.length === 0;
        assert('tc_no_match', 'No Matching Transactions -> Empty Array', pass2, out2, `Expected empty array []`);
      } else {
        assert('err_fn_missing', 'findReconciledPairs Definition', false, undefined, 'function findReconciledPairs is not exported or defined.');
      }
    }

    // ── 3. Traffic Spike Detector (detectSpikes) ─────────────────────────────
    if (hasDetectSpikes) {
      let fn = typeof exportsObj?.detectSpikes === 'function' ? exportsObj.detectSpikes : null;
      if (!fn) {
        try {
          const evalFn = new Function(`${userCode}; return typeof detectSpikes === 'function' ? detectSpikes : null;`);
          fn = evalFn();
        } catch { /* ignore */ }
      }

      if (typeof fn === 'function') {
        const out1 = fn([10, 11, 12, 13, 20, 21, 22, 23, 24, 25], 5, 4);
        const pass1 = Array.isArray(out1) && out1.length >= 2 && out1[0].count >= 4;
        assert('tc_spike_detected', 'Detect Spike (Threshold 4 in 5s)', pass1, out1, `Expected at least 2 spikes detected`);
      } else {
        assert('err_fn_missing', 'detectSpikes Definition', false, undefined, 'function detectSpikes is not exported or defined.');
      }
    }

    // ── 4. In-Memory Search & Pagination (queryCatalog) ──────────────────────
    if (hasQueryCatalog) {
      let fn = typeof exportsObj?.queryCatalog === 'function' ? exportsObj.queryCatalog : null;
      if (!fn) {
        try {
          const evalFn = new Function(`${userCode}; return typeof queryCatalog === 'function' ? queryCatalog : null;`);
          fn = evalFn();
        } catch { /* ignore */ }
      }

      if (typeof fn === 'function') {
        const items = [
          { id: "1", name: "Logitech MX Master Mouse", category: "ELECTRONICS", price: 100, stock: 5 },
          { id: "2", name: "Apple Magic Mouse", category: "ELECTRONICS", price: 80, stock: 0 },
          { id: "3", name: "Cotton T-Shirt", category: "FASHION", price: 20, stock: 10 }
        ];
        const out1 = fn(items, { keyword: "mouse", category: "ELECTRONICS" }, { page: 1, pageSize: 5 });
        const pass1 = out1?.data?.length === 2 && out1?.pagination?.totalItems === 2;
        assert('tc_search_filter', 'Filter by Keyword & Category with Pagination', pass1, out1, `Expected 2 matching items`);
      } else {
        assert('err_fn_missing', 'queryCatalog Definition', false, undefined, 'function queryCatalog is not exported or defined.');
      }
    }

    // ── REST API Simulation Helper ──────────────────────────────────────────
    const simulateRequest = (path: string, body: any, headers: any = {}) => {
      let statusCode = 200;
      let responseBody: any = null;

      const handler = postRoutes[path];
      if (!handler) {
        return { statusCode: 404, responseBody: { message: 'Route not registered' } };
      }

      const req = { body, headers, ip: '127.0.0.1' };
      const res = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { responseBody = data; return res; },
        send: (data: any) => { responseBody = data; return res; }
      };

      try {
        handler(req, res, () => {});
      } catch (err: any) {
        statusCode = 500;
        responseBody = { error: err.message };
      }

      return { statusCode, responseBody };
    };

    // ── 5. Voucher Redemption (/redeem) ─────────────────────────────────────
    if (activePaths.includes('/redeem')) {
      const r1 = simulateRequest('/redeem', { userId: 1 });
      assert('tc_missing_fields', 'Payload Validation — Missing Fields (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const r2 = simulateRequest('/redeem', { userId: 1, voucherCode: 'NONEXISTENT' });
      assert('tc_not_found', 'Voucher Existence — Non-existent (HTTP 404)', r2.statusCode === 404, r2.statusCode, `Expected 404, got ${r2.statusCode}`);

      const r3 = simulateRequest('/redeem', { userId: 101, voucherCode: 'PROMO50' });
      assert('tc_success', 'Successful Redemption (HTTP 200)', r3.statusCode === 200, r3.statusCode, `Expected 200, got ${r3.statusCode}`);

      const r4 = simulateRequest('/redeem', { userId: 101, voucherCode: 'PROMO50' });
      assert('tc_duplicate', 'Duplicate Claim Protection (HTTP 400)', r4.statusCode === 400, r4.statusCode, `Expected 400 for duplicate, got ${r4.statusCode}`);
    }

    // ── 6. Rate Limiter (/api/action) ───────────────────────────────────────
    if (activePaths.includes('/api/action')) {
      const r1 = simulateRequest('/api/action', {});
      assert('tc_rl_allow', 'Request 1 Allowed (HTTP 200)', r1.statusCode === 200, r1.statusCode, `Expected 200, got ${r1.statusCode}`);

      for (let i = 0; i < 4; i++) simulateRequest('/api/action', {});
      const r6 = simulateRequest('/api/action', {});
      assert('tc_rl_exceeded', 'Request 6 Exceeds Limit (HTTP 429)', r6.statusCode === 429, r6.statusCode, `Expected 429, got ${r6.statusCode}`);
    }

    // ── 7. Cart Checkout (/cart/checkout) ───────────────────────────────────
    if (activePaths.includes('/cart/checkout')) {
      const r1 = simulateRequest('/cart/checkout', { items: [] });
      assert('tc_cart_empty', 'Empty Items Array Check (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const r2 = simulateRequest('/cart/checkout', {
        items: [{ productId: 'P1', quantity: 2 }, { productId: 'P2', quantity: 1 }],
        voucherCode: 'TECH20'
      });
      assert('tc_cart_success', 'Valid Cart Checkout & Calculation (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.total > 0, r2.statusCode, `Expected 200 with total`);
    }

    // ── 8. Flash Sale Stock Reservation (/orders/reserve) ───────────────────
    if (activePaths.includes('/orders/reserve')) {
      const r1 = simulateRequest('/orders/reserve', { productId: 'PS5' });
      assert('tc_reserve_invalid', 'Missing Fields Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const r2 = simulateRequest('/orders/reserve', { userId: 'U1', productId: 'PS5', quantity: 2 });
      assert('tc_reserve_success', 'Valid Reservation Allocation (HTTP 201)', r2.statusCode === 201, r2.statusCode, `Expected 201, got ${r2.statusCode}`);

      const r3 = simulateRequest('/orders/reserve', { userId: 'U2', productId: 'PS5', quantity: 100 });
      assert('tc_reserve_conflict', 'Overstock Reservation Guard (HTTP 409)', r3.statusCode === 409, r3.statusCode, `Expected 409, got ${r3.statusCode}`);
    }

    // ── 9. Payment Webhook Idempotency (/webhook/payment) ───────────────────
    if (activePaths.includes('/webhook/payment')) {
      const r1 = simulateRequest('/webhook/payment', { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'wrong-key' });
      assert('tc_webhook_sig_fail', 'Unauthorized Signature Check (HTTP 401)', r1.statusCode === 401, r1.statusCode, `Expected 401, got ${r1.statusCode}`);

      const r2 = simulateRequest('/webhook/payment', { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'secret-webhook-key' });
      assert('tc_webhook_success', 'Valid First-Time Processing (HTTP 200)', r2.statusCode === 200, r2.statusCode, `Expected 200, got ${r2.statusCode}`);

      const r3 = simulateRequest('/webhook/payment', { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'secret-webhook-key' });
      assert('tc_webhook_idempotent', 'Idempotent Replay (HTTP 200 No-op)', r3.statusCode === 200, r3.statusCode, `Expected 200, got ${r3.statusCode}`);
    }

    // ── 10. HappyFresh Cart Promo (/cart/calculate) ─────────────────────────
    if (activePaths.includes('/cart/calculate')) {
      const r1 = simulateRequest('/cart/calculate', { items: [] });
      assert('tc_hf_cart_empty', 'Empty Items Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const r2 = simulateRequest('/cart/calculate', {
        items: [{ id: 'i1', price: 60000, quantity: 2 }],
        voucherCode: 'FRESH50'
      });
      assert('tc_hf_cart_calc', 'Valid Cart Calculation & Voucher (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.finalTotal > 0, r2.statusCode, `Expected 200 with finalTotal`);
    }

    // ── 11. HappyFresh Slot Reservation (/slots/reserve) ────────────────────
    if (activePaths.includes('/slots/reserve')) {
      const r1 = simulateRequest('/slots/reserve', { availableSlots: null });
      assert('tc_slots_invalid', 'Input Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const slots = [{ id: 'SLOT-01', startTime: '10:00', endTime: '12:00', capacity: 2 }];
      const requests = [
        { requestId: 'req-3', userId: 'u3', slotId: 'SLOT-01', timestamp: 1700000030 },
        { requestId: 'req-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
        { requestId: 'req-2', userId: 'u2', slotId: 'SLOT-01', timestamp: 1700000020 }
      ];
      const r2 = simulateRequest('/slots/reserve', { availableSlots: slots, bookingRequests: requests });
      const confirmed = r2.responseBody?.confirmedBookings || [];
      const passR2 = r2.statusCode === 200 && confirmed.length === 2 && confirmed[0].requestId === 'req-1';
      assert('tc_slots_chrono_capacity', 'Chronological Capacity Allocation (HTTP 200)', passR2, r2.statusCode, `Expected 2 confirmed bookings`);
    }

    // ── 12. HappyFresh Item Substitution (/items/substitute) ────────────────
    if (activePaths.includes('/items/substitute')) {
      const r1 = simulateRequest('/items/substitute', { targetItem: null });
      assert('tc_subst_invalid', 'Missing Payload Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

      const target = { id: 't1', name: 'Indomilk UHT 1L', category: 'Dairy', brand: 'Indomilk', price: 20000 };
      const catalog = [
        { id: 'p1', name: 'Ultra Milk 1L', category: 'Dairy', brand: 'Ultra', price: 21000, inStock: true },
        { id: 'p2', name: 'Indomilk Vanilla 1L', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: true }
      ];
      const r2 = simulateRequest('/items/substitute', { targetItem: target, catalog });
      const passR2 = r2.statusCode === 200 && r2.responseBody?.substitute?.id === 'p2';
      assert('tc_subst_score_oos', 'Heuristic Score Match (HTTP 200)', passR2, r2.statusCode, `Expected substitute p2`);
    }

  } catch (err: any) {
    customLog('Runtime Execution Error:', err.message);
    results.push({
      id: 'tc_runtime_error',
      name: 'Code Execution Check',
      passed: false,
      error: err.message
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    passedCount,
    totalCount: results.length,
    results,
    logs
  };
}

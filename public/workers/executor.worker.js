/**
 * public/workers/executor.worker.js
 * Web Worker — Secure Code Execution Engine for JavaScript Problem Solving
 */

// ── Watchdog: kill worker if execution exceeds 5 seconds ──────────────────────
let watchdog = null;

function resetWatchdog() {
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(() => {
    self.postMessage({
      type: 'ERROR',
      payload: { message: '⏱ Execution timed out (5s limit). Check for infinite loops.' },
    });
    self.close();
  }, 5000);
}

// ── Safe eval with isolated scope ────────────────────────────────────────────

function safeEval(code) {
  const logs = [];
  const customLog = (...args) => {
    logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  };

  const postRoutes = {};

  const mockApp = {
    use: () => {},
    get: () => {},
    listen: () => {},
    post: (path, ...handlers) => {
      const handler = handlers[handlers.length - 1];
      postRoutes[path] = handler;
    },
    set: () => {},
    delete: () => {},
    put: () => {},
    patch: () => {},
  };

  const mockExpress = function () { return mockApp; };
  mockExpress.json = () => (_req, _res, next) => { if (next) next(); };
  mockExpress.urlencoded = () => (_req, _res, next) => { if (next) next(); };
  mockExpress.static = () => (_req, _res, next) => { if (next) next(); };
  mockExpress.Router = function () {
    return {
      use: () => {},
      get: () => {},
      post: () => {},
      put: () => {},
      delete: () => {},
    };
  };

  const mockModule = { exports: {} };

  const mockRequire = (mod) => {
    if (mod === 'express') return mockExpress;
    if (mod === 'path') return { join: (...p) => p.join('/'), resolve: (...p) => p.join('/') };
    if (mod === 'fs') return { readFileSync: () => '', existsSync: () => false };
    if (mod === 'crypto') return { randomUUID: () => 'test-uuid-' + Date.now(), createHash: () => ({ update: () => ({ digest: () => 'mockhash' }) }) };
    return {};
  };

  const executor = new Function('require', 'module', 'exports', 'console', 'process', code);
  executor(
    mockRequire,
    mockModule,
    mockModule.exports,
    { log: customLog, error: customLog, warn: customLog, info: customLog },
    { env: { NODE_ENV: 'test' } }
  );

  return { postRoutes, exportsObj: mockModule.exports, logs };
}

// ── Simulate an HTTP request against a route handler ─────────────────────────

function simulateRequest(handler, body, headers) {
  if (!headers) headers = {};
  let statusCode = 200;
  let responseBody = null;

  const req = { body: body || {}, headers, ip: '127.0.0.1', params: {}, query: {} };
  const res = {
    _ended: false,
    status(code) { statusCode = code; return this; },
    json(data) { responseBody = data; this._ended = true; return this; },
    send(data) { responseBody = data; this._ended = true; return this; },
    end() { this._ended = true; return this; },
  };

  try {
    handler(req, res, () => {});
  } catch (err) {
    statusCode = 500;
    responseBody = { error: err.message };
  }

  return { statusCode, responseBody };
}

// ── Problem-specific test suites ─────────────────────────────────────────────

function runProblemTests(postRoutes, exportsObj, userCode) {
  const results = [];

  function assert(id, name, cond, actualStatus, errorMsg) {
    results.push({
      id,
      name,
      passed: cond,
      actualStatus,
      error: cond ? undefined : errorMsg,
    });
  }

  // ── 1. Electronics Shop (getMoneySpent) ──────────────────────────────────
  const hasGetMoneySpent = typeof exportsObj?.getMoneySpent === 'function' || (userCode && userCode.includes('getMoneySpent'));
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

  // ── 2. Transaction Pair Matcher (findReconciledPairs) ────────────────────
  const hasFindPairs = typeof exportsObj?.findReconciledPairs === 'function' || (userCode && userCode.includes('findReconciledPairs'));
  if (hasFindPairs) {
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
      assert('tc_exact_pairs', 'Standard Pairs Match (Target 1000)', Array.isArray(out1) && out1.length === 2, out1, `Expected 2 matched pairs`);
    } else {
      assert('err_fn_missing', 'findReconciledPairs Definition', false, undefined, 'function findReconciledPairs is not exported or defined.');
    }
  }

  // ── 3. Traffic Spike Detector (detectSpikes) ─────────────────────────────
  const hasDetectSpikes = typeof exportsObj?.detectSpikes === 'function' || (userCode && userCode.includes('detectSpikes'));
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
      assert('tc_spike_detected', 'Detect Spike (Threshold 4 in 5s)', Array.isArray(out1) && out1.length >= 2, out1, `Expected spikes detected`);
    } else {
      assert('err_fn_missing', 'detectSpikes Definition', false, undefined, 'function detectSpikes is not exported or defined.');
    }
  }

  // ── 4. In-Memory Search & Pagination (queryCatalog) ──────────────────────
  const hasQueryCatalog = typeof exportsObj?.queryCatalog === 'function' || (userCode && userCode.includes('queryCatalog'));
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
      assert('tc_search_filter', 'Filter by Keyword & Category with Pagination', out1?.data?.length === 2, out1, `Expected 2 matching items`);
    } else {
      assert('err_fn_missing', 'queryCatalog Definition', false, undefined, 'function queryCatalog is not exported or defined.');
    }
  }

  // ── 5. HTML5 Tag Hierarchy (validateHtmlStructure) ───────────────────────
  const hasValidateHtml = typeof exportsObj?.validateHtmlStructure === 'function' || (userCode && userCode.includes('validateHtmlStructure'));
  if (hasValidateHtml) {
    let fn = typeof exportsObj?.validateHtmlStructure === 'function' ? exportsObj.validateHtmlStructure : null;
    if (!fn) {
      try {
        const evalFn = new Function(`${userCode}; return typeof validateHtmlStructure === 'function' ? validateHtmlStructure : null;`);
        fn = evalFn();
      } catch { /* ignore */ }
    }

    if (typeof fn === 'function') {
      const out1 = fn("<div><p><span>Astra Portal</span></p></div>");
      assert('tc_valid_nested', 'Valid Nested HTML Hierarchy -> true', out1 === true, out1, `Expected true, got ${out1}`);

      const out2 = fn("<div><span>Astra</div></span>");
      assert('tc_mismatched_tags', 'Mismatched Tag Nesting -> false', out2 === false, out2, `Expected false, got ${out2}`);

      const out3 = fn('<div class="hero"><h1>Welcome</h1><img src="banner.jpg"/><br/></div>');
      assert('tc_self_closing', 'Self-Closing & Void Tags -> true', out3 === true, out3, `Expected true, got ${out3}`);

      const out4 = fn("<section><div><p>Incomplete</p></div>");
      assert('tc_unclosed_tag', 'Unclosed Tag at End of String -> false', out4 === false, out4, `Expected false, got ${out4}`);

      const out5 = fn("<DIV><p>Test</P></Div>");
      assert('tc_case_insensitive', 'Case-Insensitive Tag Names -> true', out5 === true, out5, `Expected true, got ${out5}`);
    } else {
      assert('err_fn_missing', 'validateHtmlStructure Definition', false, undefined, 'function validateHtmlStructure is not exported or defined.');
    }
  }

  // ── 6. Climbing the Leaderboard (climbingLeaderboard) ────────────────────
  const hasClimbingLeaderboard = typeof exportsObj?.climbingLeaderboard === 'function' || (userCode && userCode.includes('climbingLeaderboard'));
  if (hasClimbingLeaderboard) {
    let fn = typeof exportsObj?.climbingLeaderboard === 'function' ? exportsObj.climbingLeaderboard : null;
    if (!fn) {
      try {
        const evalFn = new Function(`${userCode}; return typeof climbingLeaderboard === 'function' ? climbingLeaderboard : null;`);
        fn = evalFn();
      } catch { /* ignore */ }
    }

    if (typeof fn === 'function') {
      const out1 = fn([100, 100, 50, 40, 40, 20, 10], [5, 25, 50, 120]);
      const pass1 = JSON.stringify(out1) === JSON.stringify([6, 4, 2, 1]);
      assert('tc_sample_0', 'HackerRank Sample 0: [5, 25, 50, 120] -> [6, 4, 2, 1]', pass1, out1, `Expected [6,4,2,1], got ${JSON.stringify(out1)}`);

      const out2 = fn([100, 90, 90, 80, 75, 60], [50, 65, 77, 90, 102]);
      const pass2 = JSON.stringify(out2) === JSON.stringify([6, 5, 4, 2, 1]);
      assert('tc_sample_1', 'HackerRank Sample 1: [50, 65, 77, 90, 102] -> [6, 5, 4, 2, 1]', pass2, out2, `Expected [6,5,4,2,1], got ${JSON.stringify(out2)}`);

      const out3 = fn([100, 90, 80], [80, 90, 100]);
      const pass3 = JSON.stringify(out3) === JSON.stringify([3, 2, 1]);
      assert('tc_exact_tie', 'Exact Ties: [80, 90, 100] -> [3, 2, 1]', pass3, out3, `Expected [3,2,1], got ${JSON.stringify(out3)}`);

      const out4 = fn([50, 40, 30], [5, 10, 20]);
      const pass4 = JSON.stringify(out4) === JSON.stringify([4, 4, 4]);
      assert('tc_all_lower', 'All Scores Lower Than Board -> [4, 4, 4]', pass4, out4, `Expected [4,4,4], got ${JSON.stringify(out4)}`);
    } else {
      assert('err_fn_missing', 'climbingLeaderboard Definition', false, undefined, 'function climbingLeaderboard is not exported or defined.');
    }
  }

  // ── 7. Vehicle Fleet Maintenance Slots (mergeServiceIntervals) ───────────
  const hasMergeIntervals = typeof exportsObj?.mergeServiceIntervals === 'function' || (userCode && userCode.includes('mergeServiceIntervals'));
  if (hasMergeIntervals) {
    let fn = typeof exportsObj?.mergeServiceIntervals === 'function' ? exportsObj.mergeServiceIntervals : null;
    if (!fn) {
      try {
        const evalFn = new Function(`${userCode}; return typeof mergeServiceIntervals === 'function' ? mergeServiceIntervals : null;`);
        fn = evalFn();
      } catch { /* ignore */ }
    }

    if (typeof fn === 'function') {
      const out1 = fn([[1, 3], [2, 6], [8, 10], [15, 18]]);
      const pass1 = JSON.stringify(out1) === JSON.stringify([[1, 6], [8, 10], [15, 18]]);
      assert('tc_standard_overlap', 'Standard Overlapping Intervals -> [[1,6], [8,10], [15,18]]', pass1, out1, `Expected [[1,6],[8,10],[15,18]], got ${JSON.stringify(out1)}`);

      const out2 = fn([[9, 11], [11, 13]]);
      const pass2 = JSON.stringify(out2) === JSON.stringify([[9, 13]]);
      assert('tc_touching_boundary', 'Touching Boundary Times (9-11 & 11-13) -> [[9, 13]]', pass2, out2, `Expected [[9,13]], got ${JSON.stringify(out2)}`);

      const out3 = fn([[14, 16], [9, 11], [10, 12]]);
      const pass3 = JSON.stringify(out3) === JSON.stringify([[9, 12], [14, 16]]);
      assert('tc_unsorted_input', 'Unsorted Random Order -> [[9, 12], [14, 16]]', pass3, out3, `Expected [[9,12],[14,16]], got ${JSON.stringify(out3)}`);

      const out4 = fn([[1, 10], [2, 5], [4, 8]]);
      const pass4 = JSON.stringify(out4) === JSON.stringify([[1, 10]]);
      assert('tc_complete_containment', 'Complete Containment -> [[1, 10]]', pass4, out4, `Expected [[1,10]], got ${JSON.stringify(out4)}`);

      const out5 = fn([[5, 8]]);
      const pass5 = JSON.stringify(out5) === JSON.stringify([[5, 8]]);
      assert('tc_empty_and_single', 'Single Interval Unchanged -> [[5, 8]]', pass5, out5, `Expected [[5,8]], got ${JSON.stringify(out5)}`);
    } else {
      assert('err_fn_missing', 'mergeServiceIntervals Definition', false, undefined, 'function mergeServiceIntervals is not exported or defined.');
    }
  }

  // ── 8. Voucher Redemption (/redeem) ──────────────────────────────────────
  if (postRoutes['/redeem']) {
    const h = postRoutes['/redeem'];
    const r1 = simulateRequest(h, { userId: 1 });
    assert('tc_missing_fields', 'Payload Validation — Missing Fields (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { userId: 1, voucherCode: 'NONEXISTENT' });
    assert('tc_not_found', 'Voucher Existence Check (HTTP 404)', r2.statusCode === 404, r2.statusCode, `Expected 404, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { userId: 101, voucherCode: 'PROMO50' });
    assert('tc_success', 'Successful Redemption (HTTP 200)', r3.statusCode === 200, r3.statusCode, `Expected 200, got ${r3.statusCode}`);

    const r4 = simulateRequest(h, { userId: 101, voucherCode: 'PROMO50' });
    assert('tc_duplicate', 'Duplicate Claim Protection (HTTP 400)', r4.statusCode === 400, r4.statusCode, `Expected 400 for duplicate, got ${r4.statusCode}`);
  }

  // ── 6. Rate Limiter (/api/action) ────────────────────────────────────────
  if (postRoutes['/api/action']) {
    const h = postRoutes['/api/action'];
    const r1 = simulateRequest(h, {});
    assert('tc_rl_allow', 'Request 1 Allowed (HTTP 200)', r1.statusCode === 200, r1.statusCode, `Expected 200, got ${r1.statusCode}`);

    for (let i = 0; i < 4; i++) simulateRequest(h, {});
    const r6 = simulateRequest(h, {});
    assert('tc_rl_exceeded', 'Request 6 Exceeds Rate Limit (HTTP 429)', r6.statusCode === 429, r6.statusCode, `Expected 429, got ${r6.statusCode}`);
  }

  // ── 7. Cart Checkout (/cart/checkout) ─────────────────────────────────────
  if (postRoutes['/cart/checkout']) {
    const h = postRoutes['/cart/checkout'];
    const r1 = simulateRequest(h, { items: [] });
    assert('tc_cart_empty', 'Empty Items Array Check (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { items: [{ productId: 'P1', quantity: 2 }, { productId: 'P2', quantity: 1 }], voucherCode: 'TECH20' });
    assert('tc_cart_success', 'Valid Cart Checkout & Calculation (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.total > 0, r2.statusCode, `Expected 200 with total`);
  }

  // ── 8. Flash Sale Reservation (/orders/reserve) ──────────────────────────
  if (postRoutes['/orders/reserve']) {
    const h = postRoutes['/orders/reserve'];
    const r1 = simulateRequest(h, { productId: 'PS5' });
    assert('tc_reserve_invalid', 'Missing Fields Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { userId: 'U1', productId: 'PS5', quantity: 2 });
    assert('tc_reserve_success', 'Valid Reservation Allocation (HTTP 201)', r2.statusCode === 201, r2.statusCode, `Expected 201, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { userId: 'U2', productId: 'PS5', quantity: 100 });
    assert('tc_reserve_conflict', 'Overstock Reservation Guard (HTTP 409)', r3.statusCode === 409, r3.statusCode, `Expected 409, got ${r3.statusCode}`);
  }

  // ── 9. Payment Webhook (/webhook/payment) ─────────────────────────────────
  if (postRoutes['/webhook/payment']) {
    const h = postRoutes['/webhook/payment'];
    const r1 = simulateRequest(h, { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'wrong' });
    assert('tc_webhook_sig_fail', 'Unauthorized Signature Check (HTTP 401)', r1.statusCode === 401, r1.statusCode, `Expected 401, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'secret-webhook-key' });
    assert('tc_webhook_success', 'Valid First-Time Processing (HTTP 200)', r2.statusCode === 200, r2.statusCode, `Expected 200, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { eventId: 'EVT_1', orderId: 'ORD_999', amount: 250000 }, { 'x-signature': 'secret-webhook-key' });
    assert('tc_webhook_idempotent', 'Idempotent Replay (HTTP 200 No-op)', r3.statusCode === 200, r3.statusCode, `Expected 200, got ${r3.statusCode}`);
  }

  // ── 10. HappyFresh Cart (/cart/calculate) ─────────────────────────────────
  if (postRoutes['/cart/calculate']) {
    const h = postRoutes['/cart/calculate'];
    const r1 = simulateRequest(h, { items: [] });
    assert('tc_hf_cart_empty', 'Empty Items Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { items: [{ id: 'i1', price: 60000, quantity: 2 }], voucherCode: 'FRESH50' });
    assert('tc_hf_cart_calc', 'Valid Cart Calculation (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.finalTotal > 0, r2.statusCode, `Expected 200 with finalTotal`);
  }

  // ── 11. HappyFresh Slots (/slots/reserve) ─────────────────────────────────
  if (postRoutes['/slots/reserve']) {
    const h = postRoutes['/slots/reserve'];
    const r1 = simulateRequest(h, { availableSlots: null });
    assert('tc_slots_invalid', 'Input Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const slots = [{ id: 'SLOT-01', startTime: '10:00', endTime: '12:00', capacity: 2 }];
    const requests = [
      { requestId: 'req-3', userId: 'u3', slotId: 'SLOT-01', timestamp: 1700000030 },
      { requestId: 'req-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
      { requestId: 'req-2', userId: 'u2', slotId: 'SLOT-01', timestamp: 1700000020 },
    ];
    const r2 = simulateRequest(h, { availableSlots: slots, bookingRequests: requests });
    const confirmed = r2.responseBody?.confirmedBookings || [];
    assert('tc_slots_chrono_capacity', 'Chronological Capacity Allocation (HTTP 200)', r2.statusCode === 200 && confirmed.length === 2, r2.statusCode, `Expected 2 confirmed bookings`);
  }

  // ── 12. HappyFresh Substitute (/items/substitute) ─────────────────────────
  if (postRoutes['/items/substitute']) {
    const h = postRoutes['/items/substitute'];
    const r1 = simulateRequest(h, { targetItem: null });
    assert('tc_subst_invalid', 'Missing Payload Validation (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const target = { id: 't1', name: 'Indomilk UHT 1L', category: 'Dairy', brand: 'Indomilk', price: 20000 };
    const catalog = [
      { id: 'p1', name: 'Ultra Milk 1L', category: 'Dairy', brand: 'Ultra', price: 21000, inStock: true },
      { id: 'p2', name: 'Indomilk Vanilla 1L', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: true }
    ];
    const r2 = simulateRequest(h, { targetItem: target, catalog });
    assert('tc_subst_score_oos', 'Heuristic Score Match (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.substitute?.id === 'p2', r2.statusCode, `Expected substitute p2`);
  }

  return results;
}

// ── Main test runner ──────────────────────────────────────────────────────────

function runTests(code) {
  const logs = [];

  try {
    const { postRoutes, exportsObj, logs: execLogs } = safeEval(code);
    logs.push(...execLogs);

    const activePaths = Object.keys(postRoutes);
    const hasPureFn = typeof exportsObj?.getMoneySpent === 'function' ||
      typeof exportsObj?.findReconciledPairs === 'function' ||
      typeof exportsObj?.detectSpikes === 'function' ||
      typeof exportsObj?.queryCatalog === 'function' ||
      typeof exportsObj?.validateHtmlStructure === 'function' ||
      typeof exportsObj?.climbingLeaderboard === 'function' ||
      typeof exportsObj?.mergeServiceIntervals === 'function' ||
      code.includes('getMoneySpent') ||
      code.includes('findReconciledPairs') ||
      code.includes('detectSpikes') ||
      code.includes('queryCatalog') ||
      code.includes('validateHtmlStructure') ||
      code.includes('climbingLeaderboard') ||
      code.includes('mergeServiceIntervals');

    if (activePaths.length === 0 && !hasPureFn) {
      return {
        passedCount: 0,
        totalCount: 1,
        results: [{
          id: 'err_no_route',
          name: 'Solution Handler Check',
          passed: false,
          error: 'Could not find app.post(...) handler or exported problem solving function in submitted code.',
        }],
        logs,
      };
    }

    const results = runProblemTests(postRoutes, exportsObj, code);
    const passedCount = results.filter(r => r.passed).length;

    logs.push(`[Worker] Execution complete. ${passedCount}/${results.length} passed.`);
    return { passedCount, totalCount: results.length, results, logs };

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

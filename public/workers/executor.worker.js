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

/**
 * Executes user code inside a new Function sandbox.
 * Returns an object containing:
 *   - postRoutes: map of path -> handler (for app.post(...) calls)
 *   - logs: console output captured during execution
 */
function safeEval(code) {
  const logs = [];
  const customLog = (...args) => {
    logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  };

  const postRoutes = {};

  // Build mock Express app object
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

  // FIX: mockExpress must be a FUNCTION that returns mockApp when called.
  // Previously `allowed['express']` was `() => app` (a plain object),
  // so `const app = express()` threw "express is not a function".
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

  return { postRoutes, logs };
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
  const next = () => {};

  try {
    handler(req, res, next);
  } catch (err) {
    statusCode = 500;
    responseBody = { error: err.message };
  }

  return { statusCode, responseBody };
}

// ── Problem-specific test suites ─────────────────────────────────────────────

function runProblemTests(postRoutes) {
  const results = [];

  // Helper to push a test result
  function assert(id, name, cond, actualStatus, errorMsg) {
    results.push({
      id,
      name,
      passed: cond,
      actualStatus,
      error: cond ? undefined : errorMsg,
    });
  }

  // ── Voucher Redemption (/redeem) ──────────────────────────────────────────
  if (postRoutes['/redeem']) {
    const h = postRoutes['/redeem'];
    const r1 = simulateRequest(h, { userId: 1 });
    assert('tc_missing_fields', 'Request Validation (Missing fields → HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { userId: 1, voucherCode: 'NONEXISTENT' });
    assert('tc_not_found', 'Voucher Existence Check (Non-existent → HTTP 404)', r2.statusCode === 404, r2.statusCode, `Expected 404, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { userId: 101, voucherCode: 'PROMO50' });
    assert('tc_success', 'Valid Redemption (PROMO50 → HTTP 200)', r3.statusCode === 200, r3.statusCode, `Expected 200, got ${r3.statusCode}`);

    const r4 = simulateRequest(h, { userId: 101, voucherCode: 'PROMO50' });
    assert('tc_duplicate', 'Duplicate Redemption Protection (User 101 PROMO50 again → HTTP 400)', r4.statusCode === 400, r4.statusCode, `Expected 400 for duplicate, got ${r4.statusCode}`);
  }

  // ── Rate Limiter (/api/action) ──────────────────────────────────────────
  if (postRoutes['/api/action']) {
    const h = postRoutes['/api/action'];
    const r1 = simulateRequest(h, {});
    assert('tc_rl_allow', 'Request 1 Allowed (HTTP 200)', r1.statusCode === 200, r1.statusCode, `Expected 200, got ${r1.statusCode}`);

    for (let i = 0; i < 4; i++) simulateRequest(h, {});
    const r6 = simulateRequest(h, {});
    assert('tc_rl_exceeded', 'Request 6 Exceeds Rate Limit (HTTP 429)', r6.statusCode === 429, r6.statusCode, `Expected 429, got ${r6.statusCode}`);
  }

  // ── Cart Checkout (/cart/checkout) ───────────────────────────────────────
  if (postRoutes['/cart/checkout']) {
    const h = postRoutes['/cart/checkout'];
    const r1 = simulateRequest(h, { items: [] });
    assert('tc_cart_empty', 'Empty Items Array Check (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { items: [{ productId: 'P1', quantity: 2 }, { productId: 'P2', quantity: 1 }], voucherCode: 'TECH20' });
    assert('tc_cart_success', 'Valid Cart Checkout & Discount Calculation (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.total > 0, r2.statusCode, `Expected 200 with total, got ${r2.statusCode}`);
  }

  // ── Order Inventory Reservation (/orders/reserve) ────────────────────────
  if (postRoutes['/orders/reserve']) {
    const h = postRoutes['/orders/reserve'];
    const r1 = simulateRequest(h, { userId: 'U1', itemId: 'ITEM_100', quantity: 2 });
    assert('tc_reserve_success', 'Inventory Reservation Success (HTTP 201)', r1.statusCode === 201, r1.statusCode, `Expected 201, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { userId: 'U2', itemId: 'ITEM_100', quantity: 99 });
    assert('tc_reserve_insufficient', 'Insufficient Inventory Check (HTTP 400)', r2.statusCode === 400, r2.statusCode, `Expected 400, got ${r2.statusCode}`);
  }

  // ── JWT Auth Refresh (/auth/refresh) ─────────────────────────────────────
  if (postRoutes['/auth/refresh']) {
    const h = postRoutes['/auth/refresh'];
    const r1 = simulateRequest(h, {});
    assert('tc_auth_missing', 'Missing Refresh Token Check (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { refreshToken: 'REFRESH_EXPIRED' });
    assert('tc_auth_expired', 'Expired Refresh Token Check (HTTP 401)', r2.statusCode === 401, r2.statusCode, `Expected 401, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { refreshToken: 'REFRESH_VALID_123' });
    assert('tc_auth_success', 'Valid Refresh Token Renewal (HTTP 200)', r3.statusCode === 200 && Boolean(r3.responseBody?.accessToken), r3.statusCode, `Expected 200 with accessToken, got ${r3.statusCode}`);
  }

  // ── Idempotent Webhook (/webhook/payment) ────────────────────────────────
  if (postRoutes['/webhook/payment']) {
    const h = postRoutes['/webhook/payment'];
    const r1 = simulateRequest(h, { eventId: 'E1', orderId: 'O1', status: 'SUCCESS' }, { 'x-signature': 'WRONG' });
    assert('tc_webhook_sig', 'Signature Verification Check (HTTP 401)', r1.statusCode === 401, r1.statusCode, `Expected 401, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { eventId: 'EVT_998811', orderId: 'ORD_1001', status: 'SUCCESS' }, { 'x-signature': 'VALID_SIGNATURE_KEY' });
    assert('tc_webhook_success', 'Valid Webhook Order Update (HTTP 200)', r2.statusCode === 200, r2.statusCode, `Expected 200, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { eventId: 'EVT_998811', orderId: 'ORD_1001', status: 'SUCCESS' }, { 'x-signature': 'VALID_SIGNATURE_KEY' });
    assert('tc_webhook_idempotent', 'Duplicate Event Idempotency Check (HTTP 200)', r3.statusCode === 200, r3.statusCode, `Expected 200 for duplicate event, got ${r3.statusCode}`);
  }

  // ── Notification Dispatcher (/notifications/send) ────────────────────────
  if (postRoutes['/notifications/send']) {
    const h = postRoutes['/notifications/send'];
    const r1 = simulateRequest(h, { to: 'a@b.com', subject: 'Hi', body: 'Test' });
    assert('tc_notify_primary', 'Primary Provider Dispatch (SendGrid → HTTP 200)', r1.statusCode === 200 && r1.responseBody?.provider === 'SendGrid', r1.statusCode, `Expected SendGrid HTTP 200, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { to: 'a@b.com', subject: 'Hi', body: 'Test', forcePrimaryError: true });
    assert('tc_notify_fallback', 'Secondary Provider Fallback (Mailgun → HTTP 200)', r2.statusCode === 200 && r2.responseBody?.provider === 'Mailgun', r2.statusCode, `Expected Mailgun fallback HTTP 200, got ${r2.statusCode}`);
  }

  // ── Order State Machine (/orders/transition) ─────────────────────────────
  if (postRoutes['/orders/transition']) {
    const h = postRoutes['/orders/transition'];
    const r1 = simulateRequest(h, { currentStatus: 'PAID', targetStatus: 'PROCESSING' });
    assert('tc_fsm_valid', 'Valid FSM Transition (PAID → PROCESSING, HTTP 200)', r1.statusCode === 200 && r1.responseBody?.allowed === true, r1.statusCode, `Expected 200 allowed:true, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { currentStatus: 'CANCELLED', targetStatus: 'SHIPPED' });
    assert('tc_fsm_illegal', 'Illegal FSM Transition (CANCELLED → SHIPPED, HTTP 400)', r2.statusCode === 400 && r2.responseBody?.allowed === false, r2.statusCode, `Expected 400 allowed:false, got ${r2.statusCode}`);
  }

  // ── User Registration (/users/register) ──────────────────────────────────
  if (postRoutes['/users/register']) {
    const h = postRoutes['/users/register'];
    const r1 = simulateRequest(h, {});
    assert('tc_reg_missing', 'Missing Registration Fields (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { email: 'invalid', password: 'weak', age: 20 });
    assert('tc_reg_complexity', 'Email Format & Password Complexity (HTTP 400)', r2.statusCode === 400, r2.statusCode, `Expected 400, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { email: 'newuser@example.com', password: 'Password123!', age: 20 });
    assert('tc_reg_success', 'Valid User Registration (HTTP 201)', r3.statusCode === 201, r3.statusCode, `Expected 201, got ${r3.statusCode}`);

    const r4 = simulateRequest(h, { email: 'existing@example.com', password: 'Password123!', age: 25 });
    assert('tc_reg_duplicate', 'Duplicate Email Rejection (HTTP 409)', r4.statusCode === 409, r4.statusCode, `Expected 409, got ${r4.statusCode}`);
  }

  // ── Products Search (/api/products/search) ────────────────────────────────
  if (postRoutes['/api/products/search']) {
    const h = postRoutes['/api/products/search'];
    const r1 = simulateRequest(h, { page: 0, limit: -5 });
    assert('tc_search_invalid', 'Invalid Pagination Parameters (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { query: 'phone', category: 'ELECTRONICS', page: 1, limit: 2 });
    assert('tc_search_success', 'Filtered Data & Pagination Metadata (HTTP 200)', r2.statusCode === 200 && Array.isArray(r2.responseBody?.data) && Boolean(r2.responseBody?.pagination), r2.statusCode, `Expected 200 with data+pagination, got ${r2.statusCode}`);
  }

  // ── Schema Validator (/test/validate-payload) ─────────────────────────────
  if (postRoutes['/test/validate-payload']) {
    const h = postRoutes['/test/validate-payload'];
    const r1 = simulateRequest(h, { username: 'a', email: 'bad', role: 'INVALID', tags: [] });
    assert('tc_schema_invalid', 'Invalid Payload Schema Rejection (HTTP 400)', r1.statusCode === 400 && r1.responseBody?.valid === false, r1.statusCode, `Expected 400 valid:false, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { username: 'dev_alex', email: 'alex@dev.com', role: 'ADMIN', tags: ['js', 'ts'] });
    assert('tc_schema_valid', 'Valid Payload Schema Verification (HTTP 200)', r2.statusCode === 200 && r2.responseBody?.valid === true, r2.statusCode, `Expected 200 valid:true, got ${r2.statusCode}`);
  }

  // ── Multi-Tenant Feature Flag (/features/evaluate) ───────────────────────
  if (postRoutes['/features/evaluate']) {
    const h = postRoutes['/features/evaluate'];
    const r1 = simulateRequest(h, {});
    assert('tc_flag_missing', 'Missing Parameters Check (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { tenantId: 't1', userId: 'u1', flagKey: 'UNKNOWN_FLAG' });
    assert('tc_flag_not_found', 'Non-existent Feature Flag (HTTP 404)', r2.statusCode === 404, r2.statusCode, `Expected 404, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { tenantId: 'tenant_acme', userId: 'user_42', flagKey: 'new_checkout_v2' });
    assert('tc_flag_evaluation', 'Feature Flag Tenant Override Evaluation (HTTP 200)', r3.statusCode === 200 && typeof r3.responseBody?.enabled === 'boolean', r3.statusCode, `Expected 200 with enabled boolean, got ${r3.statusCode}`);
  }

  // ── DevOps: Docker Health Check (/health) ────────────────────────────────
  if (postRoutes['/health'] || (postRoutes['/healthz'])) {
    const route = postRoutes['/health'] || postRoutes['/healthz'];
    const r1 = simulateRequest(route, {});
    assert('tc_health_ok', 'Health Check Endpoint Returns 200', r1.statusCode === 200, r1.statusCode, `Expected 200, got ${r1.statusCode}`);

    const r2 = simulateRequest(route, { forceUnhealthy: true });
    const isHealthFail = r2.statusCode === 503 || r2.statusCode === 500;
    assert('tc_health_unhealthy', 'Unhealthy State Returns 503', isHealthFail, r2.statusCode, `Expected 503, got ${r2.statusCode}`);
  }

  // ── DevOps: CI/CD Quality Gate (/pipeline/gate) ──────────────────────────
  if (postRoutes['/pipeline/gate']) {
    const h = postRoutes['/pipeline/gate'];
    const r1 = simulateRequest(h, {});
    assert('tc_gate_missing', 'Missing Pipeline Params (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { coverage: 45, branch: 'main', buildStatus: 'SUCCESS' });
    assert('tc_gate_low_coverage', 'Low Coverage Blocks Deploy (HTTP 422)', r2.statusCode === 422, r2.statusCode, `Expected 422 for low coverage, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { coverage: 85, branch: 'main', buildStatus: 'SUCCESS' });
    assert('tc_gate_pass', 'Valid Quality Gate Pass (HTTP 200)', r3.statusCode === 200 && r3.responseBody?.approved === true, r3.statusCode, `Expected 200 approved:true, got ${r3.statusCode}`);

    const r4 = simulateRequest(h, { coverage: 85, branch: 'main', buildStatus: 'FAILED' });
    assert('tc_gate_build_fail', 'Failed Build Blocks Deploy (HTTP 422)', r4.statusCode === 422 && r4.responseBody?.approved === false, r4.statusCode, `Expected 422 approved:false, got ${r4.statusCode}`);
  }

  // ── DevOps: Env Config Validator (/config/validate) ──────────────────────
  if (postRoutes['/config/validate']) {
    const h = postRoutes['/config/validate'];
    const r1 = simulateRequest(h, {});
    assert('tc_config_missing', 'Missing Config Body (HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const r2 = simulateRequest(h, { env: 'production', config: { DATABASE_URL: '', JWT_SECRET: 'x', PORT: '3000' } });
    assert('tc_config_empty_secret', 'Empty Required Config Value (HTTP 422)', r2.statusCode === 422, r2.statusCode, `Expected 422 for empty DATABASE_URL, got ${r2.statusCode}`);

    const r3 = simulateRequest(h, { env: 'production', config: { DATABASE_URL: 'postgres://db:5432/prod', JWT_SECRET: 'super-secure-key-abc123', PORT: '3000' } });
    assert('tc_config_valid', 'Valid Production Config (HTTP 200)', r3.statusCode === 200 && r3.responseBody?.valid === true, r3.statusCode, `Expected 200 valid:true, got ${r3.statusCode}`);
  }

  // ── HappyFresh: Complex Cart & Promo Engine (/cart/calculate) ────────────
  if (postRoutes['/cart/calculate']) {
    const h = postRoutes['/cart/calculate'];
    const r1 = simulateRequest(h, { items: "not-an-array" });
    assert('tc_cart_invalid', 'Input Validation (Non-array items → HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const items = [
      { id: '1', name: 'Greenfields Milk 1L', category: 'Dairy', price: 35000, quantity: 2, inStock: true },
      { id: '2', name: 'Indomilk Chocolate 1L', category: 'Dairy', price: 20000, quantity: 1, inStock: false },
      { id: '3', name: 'Wagyu Beef 200g', category: 'Meat', price: 250000, quantity: 1, inStock: true }
    ];
    const r2 = simulateRequest(h, { items, promoRules: [] });
    const passedR2 = r2.statusCode === 200 && r2.responseBody?.subtotal === 320000 && r2.responseBody?.total === 320000 && Array.isArray(r2.responseBody?.outOfStockItems) && r2.responseBody?.outOfStockItems.length === 1;
    assert('tc_cart_subtotal_oos', 'Subtotal & Out-Of-Stock Exclusion (HTTP 200)', passedR2, r2.statusCode, `Expected subtotal:320000 & 1 OOS item, got subtotal:${r2.responseBody?.subtotal}`);

    const promos = [
      { id: 'p-dairy', type: 'CATEGORY_PERCENTAGE', category: 'Dairy', discountPercentage: 10 },
      { id: 'p-flat', type: 'MIN_SPEND_FLAT', minSpend: 300000, discountAmount: 50000 }
    ];
    const r3 = simulateRequest(h, { items, promoRules: promos });
    const passedR3 = r3.statusCode === 200 && r3.responseBody?.discount === 50000 && r3.responseBody?.total === 270000 && r3.responseBody?.appliedPromo?.id === 'p-flat';
    assert('tc_cart_best_promo', 'Best-Value Promo Selection (Non-stackable Max Discount)', passedR3, r3.statusCode, `Expected discount:50000 and total:270000, got discount:${r3.responseBody?.discount}`);
  }

  // ── HappyFresh: Delivery Slot Reservation (/slots/reserve) ───────────────
  if (postRoutes['/slots/reserve']) {
    const h = postRoutes['/slots/reserve'];
    const r1 = simulateRequest(h, { availableSlots: null });
    assert('tc_slots_invalid', 'Input Validation (Missing arrays → HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const slots = [{ id: 'SLOT-01', startTime: '10:00', endTime: '12:00', capacity: 2 }];
    const requests = [
      { requestId: 'req-3', userId: 'u3', slotId: 'SLOT-01', timestamp: 1700000030 },
      { requestId: 'req-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
      { requestId: 'req-2', userId: 'u2', slotId: 'SLOT-01', timestamp: 1700000020 },
    ];
    const r2 = simulateRequest(h, { availableSlots: slots, bookingRequests: requests });
    const confirmed = r2.responseBody?.confirmedBookings || [];
    const failed = r2.responseBody?.failedBookings || [];
    const passedR2 = r2.statusCode === 200 && confirmed.length === 2 && confirmed[0].requestId === 'req-1' && failed.length === 1 && failed[0].reason === 'SLOT_FULL';
    assert('tc_slots_chrono_capacity', 'Chronological Sort & Capacity Guard (HTTP 200)', passedR2, r2.statusCode, `Expected 2 confirmed (req-1 first) and 1 failed SLOT_FULL`);

    const r3 = simulateRequest(h, {
      availableSlots: slots,
      bookingRequests: [
        { requestId: 'req-dup-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
        { requestId: 'req-dup-2', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000015 },
        { requestId: 'req-invalid', userId: 'u2', slotId: 'SLOT-99', timestamp: 1700000020 }
      ]
    });
    const failedR3 = r3.responseBody?.failedBookings || [];
    const hasDup = failedR3.some(f => f.reason === 'DUPLICATE_USER_IN_SLOT');
    const hasNotFound = failedR3.some(f => f.reason === 'SLOT_NOT_FOUND');
    assert('tc_slots_dup_and_notfound', 'Duplicate User & Invalid Slot Error Handlers', r3.statusCode === 200 && hasDup && hasNotFound, r3.statusCode, `Expected DUPLICATE_USER_IN_SLOT and SLOT_NOT_FOUND`);
  }

  // ── HappyFresh: Item Substitution (/items/substitute) ────────────────────
  if (postRoutes['/items/substitute']) {
    const h = postRoutes['/items/substitute'];
    const r1 = simulateRequest(h, { targetItem: null });
    assert('tc_subst_invalid', 'Input Validation (Missing body → HTTP 400)', r1.statusCode === 400, r1.statusCode, `Expected 400, got ${r1.statusCode}`);

    const target = { id: 't1', name: 'Indomilk UHT 1L', category: 'Dairy', brand: 'Indomilk', price: 20000 };
    const catalog = [
      { id: 'p1', name: 'Ultra Milk 1L', category: 'Dairy', brand: 'Ultra', price: 21000, inStock: true },
      { id: 'p2', name: 'Indomilk Vanilla 1L', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: true },
      { id: 'p3', name: 'Indomilk OOS', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: false }
    ];
    const r2 = simulateRequest(h, { targetItem: target, catalog });
    const passedR2 = r2.statusCode === 200 && r2.responseBody?.substitute?.id === 'p2' && r2.responseBody?.score === 100;
    assert('tc_subst_score_oos', 'Heuristic Scoring Match (Category + Price + Brand = 100)', passedR2, r2.statusCode, `Expected substitute p2 with score 100, got ${r2.responseBody?.substitute?.id}`);

    const r3 = simulateRequest(h, { targetItem: target, catalog: [{ id: 'p_oil', name: 'Bimoli 2L', category: 'Pantry', brand: 'Bimoli', price: 35000, inStock: true }] });
    const passedR3 = r3.statusCode === 200 && r3.responseBody?.substitute === null;
    assert('tc_subst_threshold', 'Threshold Guard (Returns null when score < 50)', passedR3, r3.statusCode, `Expected null substitute for low score candidate`);
  }

  // ── Fallback: generic route check ────────────────────────────────────────
  if (results.length === 0) {
    const activePaths = Object.keys(postRoutes);
    results.push({
      id: 'tc_route_generic',
      name: `Endpoint Handler Execution (${activePaths.join(', ')})`,
      passed: activePaths.length > 0,
      error: activePaths.length === 0 ? 'No app.post() route found in submitted code.' : undefined,
    });
  }

  return results;
}

// ── Main test runner ──────────────────────────────────────────────────────────

function runTests(code) {
  const logs = [];

  try {
    const { postRoutes, logs: execLogs } = safeEval(code);
    logs.push(...execLogs);

    const activePaths = Object.keys(postRoutes);

    if (activePaths.length === 0) {
      return {
        passedCount: 0,
        totalCount: 1,
        results: [{
          id: 'err_no_route',
          name: 'Express Endpoint Handler Check',
          passed: false,
          error: 'Could not find app.post(...) handler in submitted code. Make sure you define at least one POST route.',
        }],
        logs,
      };
    }

    const results = runProblemTests(postRoutes);
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

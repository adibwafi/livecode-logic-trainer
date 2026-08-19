/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestRunResult, TestResultItem } from './types';

/**
 * Isolated unit test runner for JS REST API logic.
 * Dynamic assertion runner for Express endpoints across seed problems.
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

    const mockModule = { exports: {} };
    const mockRequire = (mod: string) => {
      if (mod === 'express') return mockExpress;
      return {};
    };

    executor(
      mockRequire,
      { log: customLog, error: customLog, warn: customLog },
      { env: { NODE_ENV: 'test' } },
      mockModule,
      mockModule.exports
    );

    const activePaths = Object.keys(postRoutes);

    if (activePaths.length === 0) {
      return {
        passedCount: 0,
        totalCount: 1,
        results: [
          {
            id: 'err_no_route',
            name: 'Express Endpoint Handler Check',
            passed: false,
            error: 'Could not find app.post(...) handler in submitted code.'
          }
        ],
        logs
      };
    }

    const simulateRequest = (path: string, body: any, headers: any = {}) => {
      let statusCode = 200;
      let responseBody: any = null;

      const handler = postRoutes[path];
      if (!handler) {
        return { statusCode: 404, responseBody: { message: 'Route not registered' } };
      }

      const req = {
        body,
        headers,
        ip: '127.0.0.1'
      };

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          responseBody = data;
          return res;
        },
        send: (data: any) => {
          responseBody = data;
          return res;
        }
      };

      const next = () => {};

      try {
        handler(req, res, next);
      } catch (err: any) {
        statusCode = 500;
        responseBody = { error: err.message };
      }

      return { statusCode, responseBody };
    };

    // Evaluate Voucher Redemption problem (/redeem)
    if (postRoutes['/redeem']) {
      {
        const r1 = simulateRequest('/redeem', { userId: 1 });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_missing_fields',
          name: 'Request Validation (Missing fields -> HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/redeem', { userId: 1, voucherCode: 'NONEXISTENT' });
        const passed = r2.statusCode === 404;
        results.push({
          id: 'tc_not_found',
          name: 'Voucher Existence Check (Non-existent -> HTTP 404)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 404, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/redeem', { userId: 101, voucherCode: 'PROMO50' });
        const passed = r3.statusCode === 200;
        results.push({
          id: 'tc_success',
          name: 'Valid Redemption (PROMO50 -> HTTP 200)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 200, got ${r3.statusCode}`
        });
      }
      {
        const r4 = simulateRequest('/redeem', { userId: 101, voucherCode: 'PROMO50' });
        const passed = r4.statusCode === 400;
        results.push({
          id: 'tc_duplicate',
          name: 'Duplicate Redemption Protection (User 101 PROMO50 again -> HTTP 400)',
          passed,
          actualStatus: r4.statusCode,
          error: passed ? undefined : `Expected HTTP 400 for duplicate redemption, got ${r4.statusCode}`
        });
      }
    }

    // Evaluate Rate Limiter problem (/api/action)
    if (postRoutes['/api/action']) {
      {
        const r1 = simulateRequest('/api/action', {});
        const passed = r1.statusCode === 200;
        results.push({
          id: 'tc_rl_allow',
          name: 'Request 1 Allowed (HTTP 200)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 200, got ${r1.statusCode}`
        });
      }
      {
        for (let i = 0; i < 4; i++) simulateRequest('/api/action', {});
        const r6 = simulateRequest('/api/action', {});
        const passed = r6.statusCode === 429;
        results.push({
          id: 'tc_rl_exceeded',
          name: 'Request 6 Exceeds Rate Limit (HTTP 429)',
          passed,
          actualStatus: r6.statusCode,
          error: passed ? undefined : `Expected HTTP 429, got ${r6.statusCode}`
        });
      }
    }

    // Evaluate Cart Checkout problem (/cart/checkout)
    if (postRoutes['/cart/checkout']) {
      {
        const r1 = simulateRequest('/cart/checkout', { items: [] });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_cart_empty',
          name: 'Empty Items Array Check (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/cart/checkout', {
          items: [{ productId: 'P1', quantity: 2 }, { productId: 'P2', quantity: 1 }],
          voucherCode: 'TECH20'
        });
        const passed = r2.statusCode === 200 && r2.responseBody?.total > 0;
        results.push({
          id: 'tc_cart_success',
          name: 'Valid Cart Checkout & Discount Calculation (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with totals, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate Order Inventory Reservation (/orders/reserve)
    if (postRoutes['/orders/reserve']) {
      {
        const r1 = simulateRequest('/orders/reserve', { userId: 'U1', itemId: 'ITEM_100', quantity: 2 });
        const passed = r1.statusCode === 201;
        results.push({
          id: 'tc_reserve_success',
          name: 'Inventory Reservation Success (HTTP 201)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 201, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/orders/reserve', { userId: 'U2', itemId: 'ITEM_100', quantity: 99 });
        const passed = r2.statusCode === 400;
        results.push({
          id: 'tc_reserve_insufficient',
          name: 'Insufficient Inventory Check (HTTP 400)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate JWT Token Refresh (/auth/refresh)
    if (postRoutes['/auth/refresh']) {
      {
        const r1 = simulateRequest('/auth/refresh', {});
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_auth_missing',
          name: 'Missing Refresh Token Check (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/auth/refresh', { refreshToken: 'REFRESH_EXPIRED' });
        const passed = r2.statusCode === 401;
        results.push({
          id: 'tc_auth_expired',
          name: 'Expired Refresh Token Check (HTTP 401)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 401, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/auth/refresh', { refreshToken: 'REFRESH_VALID_123' });
        const passed = r3.statusCode === 200 && Boolean(r3.responseBody?.accessToken);
        results.push({
          id: 'tc_auth_success',
          name: 'Valid Refresh Token Token Renewal (HTTP 200)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with new accessToken, got ${r3.statusCode}`
        });
      }
    }

    // Evaluate Idempotent Webhook (/webhook/payment)
    if (postRoutes['/webhook/payment']) {
      {
        const r1 = simulateRequest('/webhook/payment', { eventId: 'E1', orderId: 'O1', status: 'SUCCESS' }, { 'x-signature': 'WRONG' });
        const passed = r1.statusCode === 401;
        results.push({
          id: 'tc_webhook_sig',
          name: 'Signature Verification Check (HTTP 401)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 401, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/webhook/payment', { eventId: 'EVT_998811', orderId: 'ORD_1001', status: 'SUCCESS' }, { 'x-signature': 'VALID_SIGNATURE_KEY' });
        const passed = r2.statusCode === 200;
        results.push({
          id: 'tc_webhook_success',
          name: 'Valid Webhook Order Update (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 200, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/webhook/payment', { eventId: 'EVT_998811', orderId: 'ORD_1001', status: 'SUCCESS' }, { 'x-signature': 'VALID_SIGNATURE_KEY' });
        const passed = r3.statusCode === 200;
        results.push({
          id: 'tc_webhook_idempotent',
          name: 'Duplicate Event Idempotency Check (HTTP 200)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 200 for duplicated event, got ${r3.statusCode}`
        });
      }
    }

    // Evaluate Resilient Notification Dispatcher (/notifications/send)
    if (postRoutes['/notifications/send']) {
      {
        const r1 = simulateRequest('/notifications/send', { to: 'a@b.com', subject: 'Hi', body: 'Test' });
        const passed = r1.statusCode === 200 && r1.responseBody?.provider === 'SendGrid';
        results.push({
          id: 'tc_notify_primary',
          name: 'Primary Provider Dispatch (SendGrid -> HTTP 200)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected SendGrid dispatch HTTP 200, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/notifications/send', { to: 'a@b.com', subject: 'Hi', body: 'Test', forcePrimaryError: true });
        const passed = r2.statusCode === 200 && r2.responseBody?.provider === 'Mailgun';
        results.push({
          id: 'tc_notify_fallback',
          name: 'Secondary Provider Fallback Dispatch (Mailgun -> HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected Mailgun fallback HTTP 200, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate Order State Machine (/orders/transition)
    if (postRoutes['/orders/transition']) {
      {
        const r1 = simulateRequest('/orders/transition', { currentStatus: 'PAID', targetStatus: 'PROCESSING' });
        const passed = r1.statusCode === 200 && r1.responseBody?.allowed === true;
        results.push({
          id: 'tc_fsm_valid',
          name: 'Valid FSM State Transition (PAID -> PROCESSING -> HTTP 200)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with allowed: true, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/orders/transition', { currentStatus: 'CANCELLED', targetStatus: 'SHIPPED' });
        const passed = r2.statusCode === 400 && r2.responseBody?.allowed === false;
        results.push({
          id: 'tc_fsm_illegal',
          name: 'Illegal FSM State Transition Protection (CANCELLED -> SHIPPED -> HTTP 400)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 400 with allowed: false, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate User Registration Validator (/users/register)
    if (postRoutes['/users/register']) {
      {
        const r1 = simulateRequest('/users/register', {});
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_reg_missing',
          name: 'Missing Registration Fields Check (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/users/register', { email: 'invalid', password: 'weak', age: 20 });
        const passed = r2.statusCode === 400;
        results.push({
          id: 'tc_reg_complexity',
          name: 'Email Format & Password Complexity Check (HTTP 400)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/users/register', { email: 'newuser@example.com', password: 'Password123!', age: 20 });
        const passed = r3.statusCode === 201;
        results.push({
          id: 'tc_reg_success',
          name: 'Valid User Registration (HTTP 201)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 201, got ${r3.statusCode}`
        });
      }
      {
        const r4 = simulateRequest('/users/register', { email: 'existing@example.com', password: 'Password123!', age: 25 });
        const passed = r4.statusCode === 409;
        results.push({
          id: 'tc_reg_duplicate',
          name: 'Duplicate Email Rejection (HTTP 409)',
          passed,
          actualStatus: r4.statusCode,
          error: passed ? undefined : `Expected HTTP 409, got ${r4.statusCode}`
        });
      }
    }

    // Evaluate Products Search & Pagination (/api/products/search)
    if (postRoutes['/api/products/search']) {
      {
        const r1 = simulateRequest('/api/products/search', { page: 0, limit: -5 });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_search_invalid_page',
          name: 'Invalid Pagination Parameters Check (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/api/products/search', { query: 'phone', category: 'ELECTRONICS', page: 1, limit: 2 });
        const passed = r2.statusCode === 200 && Array.isArray(r2.responseBody?.data) && Boolean(r2.responseBody?.pagination);
        results.push({
          id: 'tc_search_success',
          name: 'Filtered Data & Pagination Metadata Response (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with data array and pagination metadata, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate Payload Schema Validator (/test/validate-payload)
    if (postRoutes['/test/validate-payload']) {
      {
        const r1 = simulateRequest('/test/validate-payload', { username: 'a', email: 'bad', role: 'INVALID', tags: [] });
        const passed = r1.statusCode === 400 && r1.responseBody?.valid === false;
        results.push({
          id: 'tc_schema_invalid',
          name: 'Invalid Payload Schema Rejection (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400 with valid: false, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/test/validate-payload', { username: 'dev_alex', email: 'alex@dev.com', role: 'ADMIN', tags: ['js', 'ts'] });
        const passed = r2.statusCode === 200 && r2.responseBody?.valid === true;
        results.push({
          id: 'tc_schema_valid',
          name: 'Valid Payload Schema Verification (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with valid: true, got ${r2.statusCode}`
        });
      }
    }

    // Evaluate Multi-Tenant Feature Flag (/features/evaluate)
    if (postRoutes['/features/evaluate']) {
      {
        const r1 = simulateRequest('/features/evaluate', {});
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_flag_missing_params',
          name: 'Missing Parameters Check (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/features/evaluate', { tenantId: 't1', userId: 'u1', flagKey: 'UNKNOWN_FLAG' });
        const passed = r2.statusCode === 404;
        results.push({
          id: 'tc_flag_not_found',
          name: 'Non-existent Feature Flag Check (HTTP 404)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 404, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/features/evaluate', { tenantId: 'tenant_acme', userId: 'user_42', flagKey: 'new_checkout_v2' });
        const passed = r3.statusCode === 200 && typeof r3.responseBody?.enabled === 'boolean' && Boolean(r3.responseBody?.reason);
        results.push({
          id: 'tc_flag_evaluation_success',
          name: 'Feature Flag Tenant Override & Rollout Evaluation (HTTP 200)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with enabled boolean and reason, got ${r3.statusCode}`
        });
      }
    }



    // Evaluate DevOps: Docker Health Check (/health and /readiness)
    if (postRoutes['/health']) {
      {
        const r1 = simulateRequest('/health', {});
        const passed = r1.statusCode === 200 && r1.responseBody?.status === 'UP';
        results.push({
          id: 'tc_health_ok',
          name: 'Liveness Probe — Healthy State (HTTP 200)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with status "UP", got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/health', { forceUnhealthy: true });
        const passed = r2.statusCode === 503 && r2.responseBody?.status === 'DOWN';
        results.push({
          id: 'tc_health_unhealthy',
          name: 'Liveness Probe — Unhealthy State (HTTP 503)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 503 with status "DOWN", got ${r2.statusCode}`
        });
      }
    }

    if (postRoutes['/readiness']) {
      {
        const r1 = simulateRequest('/readiness', { dbStatus: 'UP', cacheStatus: 'UP' });
        const passed = r1.statusCode === 200 && r1.responseBody?.status === 'READY';
        results.push({
          id: 'tc_ready_ok',
          name: 'Readiness Probe — All Services UP (HTTP 200)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 200 with status "READY", got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/readiness', { dbStatus: 'DOWN', cacheStatus: 'UP' });
        const passed = r2.statusCode === 503 && r2.responseBody?.status === 'NOT_READY';
        results.push({
          id: 'tc_ready_not_ready',
          name: 'Readiness Probe — Database DOWN (HTTP 503)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 503 with status "NOT_READY", got ${r2.statusCode}`
        });
      }
    }

    // Evaluate DevOps: CI/CD Quality Gate (/pipeline/gate)
    if (postRoutes['/pipeline/gate']) {
      {
        const r1 = simulateRequest('/pipeline/gate', {});
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_gate_missing',
          name: 'Missing Pipeline Parameters (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400, got ${r1.statusCode}`
        });
      }
      {
        const r2 = simulateRequest('/pipeline/gate', { branch: 'feature/xyz', buildStatus: 'SUCCESS', coverage: 85, environment: 'production' });
        const passed = r2.statusCode === 422 && r2.responseBody?.approved === false;
        results.push({
          id: 'tc_gate_wrong_branch',
          name: 'Branch Protection — feature branch to production (HTTP 422)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected HTTP 422 approved:false for non-main branch, got ${r2.statusCode}`
        });
      }
      {
        const r3 = simulateRequest('/pipeline/gate', { branch: 'main', buildStatus: 'SUCCESS', coverage: 45, environment: 'production' });
        const passed = r3.statusCode === 422 && r3.responseBody?.approved === false;
        results.push({
          id: 'tc_gate_low_coverage',
          name: 'Coverage Gate — Below 80% threshold (HTTP 422)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected HTTP 422 for low coverage, got ${r3.statusCode}`
        });
      }
      {
        const r4 = simulateRequest('/pipeline/gate', { branch: 'main', buildStatus: 'SUCCESS', coverage: 85, environment: 'production' });
        const passed = r4.statusCode === 200 && r4.responseBody?.approved === true;
        results.push({
          id: 'tc_gate_pass',
          name: 'All Quality Gates Pass — Deployment Approved (HTTP 200)',
          passed,
          actualStatus: r4.statusCode,
          error: passed ? undefined : `Expected HTTP 200 approved:true, got ${r4.statusCode}`
        });
      }
      {
        const r5 = simulateRequest('/pipeline/gate', { branch: 'main', buildStatus: 'FAILED', coverage: 85, environment: 'production' });
        const passed = r5.statusCode === 422 && r5.responseBody?.approved === false;
        results.push({
          id: 'tc_gate_build_fail',
          name: 'Build Failure Blocks Deploy (HTTP 422)',
          passed,
          actualStatus: r5.statusCode,
          error: passed ? undefined : `Expected HTTP 422 for failed build, got ${r5.statusCode}`
        });
      }
    }

    // ── HappyFresh Cart & Promo Engine (/cart/calculate) ────────────────────────
    if (activePaths.includes('/cart/calculate')) {
      {
        const r1 = simulateRequest('/cart/calculate', { items: "not-an-array" });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_cart_invalid',
          name: 'Input Validation — Non-array items (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400 for invalid items array, got ${r1.statusCode}`
        });
      }
      {
        const items = [
          { id: '1', name: 'Greenfields Milk 1L', category: 'Dairy', price: 35000, quantity: 2, inStock: true },
          { id: '2', name: 'Indomilk Chocolate 1L', category: 'Dairy', price: 20000, quantity: 1, inStock: false },
          { id: '3', name: 'Wagyu Beef 200g', category: 'Meat', price: 250000, quantity: 1, inStock: true }
        ];
        const r2 = simulateRequest('/cart/calculate', { items, promoRules: [] });
        const passed = r2.statusCode === 200 && r2.responseBody?.subtotal === 320000 && r2.responseBody?.total === 320000 && Array.isArray(r2.responseBody?.outOfStockItems) && r2.responseBody?.outOfStockItems.length === 1;
        results.push({
          id: 'tc_cart_subtotal_oos',
          name: 'Subtotal & Out-Of-Stock Exclusion (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected subtotal:320000 & 1 OOS item, got subtotal:${r2.responseBody?.subtotal}`
        });
      }
      {
        const items = [
          { id: '1', name: 'Greenfields Milk 1L', category: 'Dairy', price: 35000, quantity: 2, inStock: true },
          { id: '3', name: 'Wagyu Beef 200g', category: 'Meat', price: 250000, quantity: 1, inStock: true }
        ];
        const promos = [
          { id: 'p-dairy', type: 'CATEGORY_PERCENTAGE', category: 'Dairy', discountPercentage: 10 }, // 7,000
          { id: 'p-flat', type: 'MIN_SPEND_FLAT', minSpend: 300000, discountAmount: 50000 } // 50,000
        ];
        const r3 = simulateRequest('/cart/calculate', { items, promoRules: promos });
        const passed = r3.statusCode === 200 && r3.responseBody?.discount === 50000 && r3.responseBody?.total === 270000 && r3.responseBody?.appliedPromo?.id === 'p-flat';
        results.push({
          id: 'tc_cart_best_promo',
          name: 'Best-Value Promo Selection (Non-stackable Max Discount)',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected discount:50000 and total:270000, got discount:${r3.responseBody?.discount}`
        });
      }
    }

    // ── HappyFresh Slot Reservation (/slots/reserve) ────────────────────────────
    if (activePaths.includes('/slots/reserve')) {
      {
        const r1 = simulateRequest('/slots/reserve', { availableSlots: null });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_slots_invalid',
          name: 'Input Validation — Missing arrays (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400 for invalid body, got ${r1.statusCode}`
        });
      }
      {
        const slots = [{ id: 'SLOT-01', startTime: '10:00', endTime: '12:00', capacity: 2 }];
        const requests = [
          { requestId: 'req-3', userId: 'u3', slotId: 'SLOT-01', timestamp: 1700000030 },
          { requestId: 'req-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
          { requestId: 'req-2', userId: 'u2', slotId: 'SLOT-01', timestamp: 1700000020 },
        ];
        const r2 = simulateRequest('/slots/reserve', { availableSlots: slots, bookingRequests: requests });
        const confirmed = r2.responseBody?.confirmedBookings || [];
        const failed = r2.responseBody?.failedBookings || [];
        const passed = r2.statusCode === 200 && confirmed.length === 2 && confirmed[0].requestId === 'req-1' && failed.length === 1 && failed[0].reason === 'SLOT_FULL';
        results.push({
          id: 'tc_slots_chrono_capacity',
          name: 'Chronological Sort & Capacity Overbooking Guard (HTTP 200)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected 2 confirmed (req-1 first) and 1 failed SLOT_FULL`
        });
      }
      {
        const slots = [{ id: 'SLOT-01', startTime: '10:00', endTime: '12:00', capacity: 3 }];
        const requests = [
          { requestId: 'req-dup-1', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000010 },
          { requestId: 'req-dup-2', userId: 'u1', slotId: 'SLOT-01', timestamp: 1700000015 },
          { requestId: 'req-invalid', userId: 'u2', slotId: 'SLOT-99', timestamp: 1700000020 }
        ];
        const r3 = simulateRequest('/slots/reserve', { availableSlots: slots, bookingRequests: requests });
        const failed = r3.responseBody?.failedBookings || [];
        const hasDup = failed.some((f: any) => f.reason === 'DUPLICATE_USER_IN_SLOT');
        const hasNotFound = failed.some((f: any) => f.reason === 'SLOT_NOT_FOUND');
        const passed = r3.statusCode === 200 && hasDup && hasNotFound;
        results.push({
          id: 'tc_slots_dup_and_notfound',
          name: 'Duplicate User & Invalid Slot Error Handlers',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected DUPLICATE_USER_IN_SLOT and SLOT_NOT_FOUND failure reasons`
        });
      }
    }

    // ── HappyFresh Item Substitution (/items/substitute) ────────────────────────
    if (activePaths.includes('/items/substitute')) {
      {
        const r1 = simulateRequest('/items/substitute', { targetItem: null });
        const passed = r1.statusCode === 400;
        results.push({
          id: 'tc_subst_invalid',
          name: 'Input Validation — Missing targetItem/catalog (HTTP 400)',
          passed,
          actualStatus: r1.statusCode,
          error: passed ? undefined : `Expected HTTP 400 for invalid body, got ${r1.statusCode}`
        });
      }
      {
        const target = { id: 't1', name: 'Indomilk UHT 1L', category: 'Dairy', brand: 'Indomilk', price: 20000 };
        const catalog = [
          { id: 'p1', name: 'Ultra Milk 1L', category: 'Dairy', brand: 'Ultra', price: 21000, inStock: true }, // 80 pts
          { id: 'p2', name: 'Indomilk Vanilla 1L', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: true }, // 100 pts
          { id: 'p3', name: 'Indomilk OOS', category: 'Dairy', brand: 'Indomilk', price: 20000, inStock: false } // OOS
        ];
        const r2 = simulateRequest('/items/substitute', { targetItem: target, catalog });
        const passed = r2.statusCode === 200 && r2.responseBody?.substitute?.id === 'p2' && r2.responseBody?.score === 100;
        results.push({
          id: 'tc_subst_score_oos',
          name: 'Heuristic Scoring Match (Category + Price + Brand = 100)',
          passed,
          actualStatus: r2.statusCode,
          error: passed ? undefined : `Expected substitute p2 with score 100, got ${r2.responseBody?.substitute?.id} score:${r2.responseBody?.score}`
        });
      }
      {
        const target = { id: 't1', name: 'Indomilk UHT 1L', category: 'Dairy', brand: 'Indomilk', price: 20000 };
        const catalog = [
          { id: 'p_oil', name: 'Bimoli 2L', category: 'Pantry', brand: 'Bimoli', price: 35000, inStock: true }
        ];
        const r3 = simulateRequest('/items/substitute', { targetItem: target, catalog });
        const passed = r3.statusCode === 200 && r3.responseBody?.substitute === null;
        results.push({
          id: 'tc_subst_threshold',
          name: 'Threshold Guard — Returns null when score < 50',
          passed,
          actualStatus: r3.statusCode,
          error: passed ? undefined : `Expected null substitute for low score candidate, got ${JSON.stringify(r3.responseBody?.substitute)}`
        });
      }
    }

    if (results.length === 0) {
      results.push({
        id: 'tc_route_generic',
        name: `Endpoint Handler Execution (${activePaths.join(', ')})`,
        passed: true
      });
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

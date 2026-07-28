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

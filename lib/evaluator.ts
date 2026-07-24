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

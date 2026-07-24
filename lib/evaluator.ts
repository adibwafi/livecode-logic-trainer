import { TestRunResult, TestResultItem } from './types';

/**
 * Isolated unit test runner for JS REST API logic.
 * Safely evaluates user code in dynamic JS context without external dependencies.
 */
export function runLocalTests(userCode: string): TestRunResult {
  const logs: string[] = [];
  const results: TestResultItem[] = [];

  const customLog = (...args: any[]) => {
    logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  };

  try {
    // 1. Create a mocked Express sandbox environment
    let postHandler: any = null;

    const mockApp = {
      use: () => {},
      post: (path: string, handler: any) => {
        if (path === '/redeem') {
          postHandler = handler;
        }
      },
      listen: () => {}
    };

    const mockExpress = () => mockApp;
    mockExpress.json = () => () => {};

    // 2. Wrap user code in a function context
    const executor = new Function('require', 'console', 'process', 'module', 'exports', userCode);
    
    const mockModule = { exports: {} };
    const mockRequire = (mod: string) => {
      if (mod === 'express') return mockExpress;
      return {};
    };

    executor(mockRequire, { log: customLog, error: customLog, warn: customLog }, { env: { NODE_ENV: 'test' } }, mockModule, mockModule.exports);

    if (!postHandler) {
      return {
        passedCount: 0,
        totalCount: 4,
        results: [
          {
            id: 'err_no_route',
            name: 'POST /redeem endpoint check',
            passed: false,
            error: 'Could not find app.post("/redeem", ... handler) in submitted code.'
          }
        ],
        logs
      };
    }

    // Helper to simulate request
    const simulateRequest = (body: any) => {
      let statusCode = 200;
      let responseBody: any = null;

      const req = { body };
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

      postHandler(req, res);
      return { statusCode, responseBody };
    };

    // Test Case 1: Missing Fields Validation
    {
      const res1 = simulateRequest({ userId: 1 });
      const passed = res1.statusCode === 400;
      results.push({
        id: 'tc_missing_fields',
        name: 'Request Validation (Missing fields -> HTTP 400)',
        passed,
        actualStatus: res1.statusCode,
        actualBody: res1.responseBody,
        error: passed ? undefined : `Expected HTTP 400, got ${res1.statusCode}`
      });
    }

    // Test Case 2: Voucher Not Found (HTTP 404)
    {
      const res2 = simulateRequest({ userId: 1, voucherCode: 'NONEXISTENT' });
      const passed = res2.statusCode === 404;
      results.push({
        id: 'tc_not_found',
        name: 'Voucher Existence Check (Non-existent -> HTTP 404)',
        passed,
        actualStatus: res2.statusCode,
        actualBody: res2.responseBody,
        error: passed ? undefined : `Expected HTTP 404, got ${res2.statusCode}`
      });
    }

    // Test Case 3: Successful Voucher Redemption (PROMO50)
    {
      const res3 = simulateRequest({ userId: 101, voucherCode: 'PROMO50' });
      const passed = res3.statusCode === 200;
      results.push({
        id: 'tc_success',
        name: 'Valid Redemption (PROMO50 -> HTTP 200)',
        passed,
        actualStatus: res3.statusCode,
        actualBody: res3.responseBody,
        error: passed ? undefined : `Expected HTTP 200, got ${res3.statusCode}`
      });
    }

    // Test Case 4: Prevent Duplicate Redemption by Same User
    {
      const res4 = simulateRequest({ userId: 101, voucherCode: 'PROMO50' });
      const passed = res4.statusCode === 400;
      results.push({
        id: 'tc_duplicate',
        name: 'Duplicate Redemption Protection (User 101 PROMO50 again -> HTTP 400)',
        passed,
        actualStatus: res4.statusCode,
        actualBody: res4.responseBody,
        error: passed ? undefined : `Expected HTTP 400 for duplicate redemption, got ${res4.statusCode}`
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

  const passedCount = results.filter(r => r.passed).length;
  return {
    passedCount,
    totalCount: results.length,
    results,
    logs
  };
}

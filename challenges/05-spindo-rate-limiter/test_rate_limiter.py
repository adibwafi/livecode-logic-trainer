"""
Unit Tests for Challenge 05: SPINDO Sliding Window Rate Limiter
"""
import unittest
from rate_limiter import SlidingWindowRateLimiter


class TestSlidingWindowRateLimiter(unittest.TestCase):
    def test_basic_allow_and_exhaustion(self):
        # 3 requests per 10 seconds
        limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=10)
        client = "192.168.1.50_HYDROTEST_SENSOR"

        # Req 1 at t=100
        ok, rem, retry = limiter.is_allowed(client, current_time=100.0)
        self.assertTrue(ok)
        self.assertEqual(rem, 2)
        self.assertEqual(retry, 0.0)

        # Req 2 at t=101
        ok, rem, retry = limiter.is_allowed(client, current_time=101.0)
        self.assertTrue(ok)
        self.assertEqual(rem, 1)

        # Req 3 at t=102
        ok, rem, retry = limiter.is_allowed(client, current_time=102.0)
        self.assertTrue(ok)
        self.assertEqual(rem, 0)

        # Req 4 at t=103 (Should be rate limited)
        ok, rem, retry = limiter.is_allowed(client, current_time=103.0)
        self.assertFalse(ok)
        self.assertEqual(rem, 0)
        # Oldest was at 100, window 10 -> expires at 110. Current is 103 -> retry after 7.0s
        self.assertEqual(retry, 7.0)

    def test_sliding_window_eviction(self):
        limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=5)
        client = "192.168.1.51"

        # Req 1 at t=10
        limiter.is_allowed(client, current_time=10.0)
        # Req 2 at t=12
        limiter.is_allowed(client, current_time=12.0)

        # Req 3 at t=14 (blocked)
        ok, _, _ = limiter.is_allowed(client, current_time=14.0)
        self.assertFalse(ok)

        # Req 4 at t=15.1 (t=10 has expired because window is 5s -> window_start = 10.1)
        ok, rem, _ = limiter.is_allowed(client, current_time=15.1)
        self.assertTrue(ok)
        self.assertEqual(rem, 0)  # Contains t=12 and t=15.1

    def test_client_isolation(self):
        limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=5)
        c1 = "CLIENT_A"
        c2 = "CLIENT_B"

        ok1, _, _ = limiter.is_allowed(c1, current_time=10.0)
        ok2, _, _ = limiter.is_allowed(c2, current_time=10.0)
        self.assertTrue(ok1)
        self.assertTrue(ok2)

        # C1 blocked, C2 blocked on 2nd req
        self.assertFalse(limiter.is_allowed(c1, current_time=11.0)[0])
        self.assertFalse(limiter.is_allowed(c2, current_time=11.0)[0])

    def test_reset_client(self):
        limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=10)
        client = "CLIENT_RESET"

        limiter.is_allowed(client, current_time=10.0)
        self.assertFalse(limiter.is_allowed(client, current_time=11.0)[0])

        limiter.reset_client(client)
        # After reset, request should succeed immediately
        ok, rem, _ = limiter.is_allowed(client, current_time=11.0)
        self.assertTrue(ok)
        self.assertEqual(rem, 0)


if __name__ == "__main__":
    unittest.main()

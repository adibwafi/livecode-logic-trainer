"""
Case Study 05: In-Memory Sliding Window Rate Limiter
PT Steel Pipe Industry of Indonesia Tbk (SPINDO) - Backend Track
"""
import time
from collections import defaultdict, deque
from typing import Tuple, Dict, Optional


class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter using double-ended queues (deque)
    to achieve O(1) eviction of expired timestamps per client.
    """
    def __init__(self, max_requests: int, window_seconds: int):
        if max_requests <= 0 or window_seconds <= 0:
            raise ValueError("max_requests and window_seconds must be positive integers.")
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clients: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, client_id: str, current_time: Optional[float] = None) -> Tuple[bool, int, float]:
        """
        Determines whether client_id is allowed to execute a request.
        
        Returns:
            (is_allowed: bool, remaining_requests: int, retry_after_seconds: float)
        """
        now = current_time if current_time is not None else time.time()
        window_start = now - self.window_seconds
        client_timestamps = self._clients[client_id]

        # 1. Evict expired timestamps outside the sliding window (O(K) where K is expired count)
        while client_timestamps and client_timestamps[0] <= window_start:
            client_timestamps.popleft()

        # 2. Check if current usage is within quota
        if len(client_timestamps) < self.max_requests:
            client_timestamps.append(now)
            remaining = self.max_requests - len(client_timestamps)
            return True, remaining, 0.0
        else:
            # Calculate when the oldest request in the window expires
            oldest_timestamp = client_timestamps[0]
            retry_after = round(oldest_timestamp + self.window_seconds - now, 2)
            remaining = 0
            return False, remaining, max(0.0, retry_after)

    def reset_client(self, client_id: str) -> None:
        """Removes all request history for a specific client."""
        if client_id in self._clients:
            del self._clients[client_id]

    def get_active_client_count(self) -> int:
        """Returns the number of clients with active recorded requests in memory."""
        return sum(1 for q in self._clients.values() if len(q) > 0)

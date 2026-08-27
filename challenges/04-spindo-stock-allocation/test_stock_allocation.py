"""
Unit Tests for Challenge 04: SPINDO Stock Allocation
"""
import unittest
from concurrent.futures import ThreadPoolExecutor
from stock_allocation import (
    PipeInventory,
    MockDatabaseSession,
    allocate_pipe_stock
)


class TestSpindoStockAllocation(unittest.TestCase):
    def setUp(self):
        self.store = {
            "PIPE-SCH40-4IN": PipeInventory(
                sku="PIPE-SCH40-4IN",
                pipe_type="ERW Carbon Steel Pipe 4 Inch",
                total_stock=500,
                reserved_stock=100
            ),
            "PIPE-GI-2IN": PipeInventory(
                sku="PIPE-GI-2IN",
                pipe_type="Galvanized Iron Pipe 2 Inch",
                total_stock=50,
                reserved_stock=50
            )
        }

    def test_successful_allocation(self):
        session = MockDatabaseSession(self.store)
        res = allocate_pipe_stock(session, "ORD-001", "PIPE-SCH40-4IN", 150)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["allocated_qty"], 150)
        self.assertEqual(res["remaining_available_stock"], 250)
        self.assertEqual(self.store["PIPE-SCH40-4IN"].reserved_stock, 250)

    def test_insufficient_stock_rollback(self):
        session = MockDatabaseSession(self.store)
        res = allocate_pipe_stock(session, "ORD-002", "PIPE-SCH40-4IN", 450)
        self.assertEqual(res["status"], "FAILED")
        self.assertIn("Insufficient stock", res["reason"])
        # Ensure reserved_stock is not mutated
        self.assertEqual(self.store["PIPE-SCH40-4IN"].reserved_stock, 100)

    def test_product_not_found(self):
        session = MockDatabaseSession(self.store)
        res = allocate_pipe_stock(session, "ORD-003", "NON-EXISTING-SKU", 10)
        self.assertEqual(res["status"], "FAILED")
        self.assertIn("not found", res["reason"])

    def test_invalid_quantity(self):
        session = MockDatabaseSession(self.store)
        res = allocate_pipe_stock(session, "ORD-004", "PIPE-SCH40-4IN", 0)
        self.assertEqual(res["status"], "FAILED")

    def test_concurrency_race_condition_safety(self):
        """Simulates 10 concurrent allocation requests attempting to claim 50 units each from 400 available."""
        # Available stock = 500 - 100 = 400
        # 10 workers requesting 50 each = 500 total (only 8 requests should succeed, 2 should fail)
        results = []

        def worker(order_idx: int):
            session = MockDatabaseSession(self.store)
            return allocate_pipe_stock(session, f"ORD-CONC-{order_idx}", "PIPE-SCH40-4IN", 50)

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(worker, i) for i in range(10)]
            results = [f.result() for f in futures]

        success_count = sum(1 for r in results if r["status"] == "SUCCESS")
        failed_count = sum(1 for r in results if r["status"] == "FAILED")

        self.assertEqual(success_count, 8)
        self.assertEqual(failed_count, 2)
        self.assertEqual(self.store["PIPE-SCH40-4IN"].reserved_stock, 500)
        self.assertEqual(self.store["PIPE-SCH40-4IN"].available_stock, 0)


if __name__ == "__main__":
    unittest.main()

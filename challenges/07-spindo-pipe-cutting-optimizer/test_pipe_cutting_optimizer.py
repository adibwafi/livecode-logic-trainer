"""
Unit Tests for Challenge 07: SPINDO Pipe Cutting Optimizer
"""
import unittest
from pipe_cutting_optimizer import CutRequest, optimize_pipe_cutting


class TestPipeCuttingOptimizer(unittest.TestCase):
    def test_single_pipe_fit(self):
        requests = [
            CutRequest(order_id="ORD-1", length_mm=2000, quantity=2),
            CutRequest(order_id="ORD-2", length_mm=1500, quantity=1),
        ]
        # Total needed: (2000+5)*2 + (1500+5)*1 = 4010 + 1505 = 5515 mm <= 6000 mm
        res = optimize_pipe_cutting(stock_length_mm=6000, blade_kerf_mm=5, cut_requests=requests)
        self.assertEqual(res["total_raw_pipes_used"], 1)
        self.assertEqual(res["total_cuts_produced"], 3)
        self.assertEqual(res["total_scrap_length_mm"], 6000 - 5515)

    def test_multi_pipe_allocation(self):
        requests = [
            CutRequest(order_id="ORD-BIG", length_mm=4000, quantity=3), # Each needs 4005mm
            CutRequest(order_id="ORD-SML", length_mm=1500, quantity=3), # Each needs 1505mm
        ]
        # Stock: 6000mm.
        # Pipe 1: 4000 (used: 4005, remaining: 1995) -> fits one 1500 (used: 4005+1505=5510, rem: 490)
        # Pipe 2: 4000 (used: 4005) -> fits one 1500 (used: 5510, rem: 490)
        # Pipe 3: 4000 (used: 4005) -> fits one 1500 (used: 5510, rem: 490)
        # Total raw pipes = 3
        res = optimize_pipe_cutting(stock_length_mm=6000, blade_kerf_mm=5, cut_requests=requests)
        self.assertEqual(res["total_raw_pipes_used"], 3)
        self.assertEqual(res["total_cuts_produced"], 6)
        self.assertLess(res["scrap_percentage"], 10.0)

    def test_oversized_cut_raises_error(self):
        requests = [
            CutRequest(order_id="INVALID", length_mm=7000, quantity=1)
        ]
        with self.assertRaises(ValueError):
            optimize_pipe_cutting(stock_length_mm=6000, blade_kerf_mm=5, cut_requests=requests)


if __name__ == "__main__":
    unittest.main()

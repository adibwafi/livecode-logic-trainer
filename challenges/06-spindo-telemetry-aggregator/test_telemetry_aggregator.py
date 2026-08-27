"""
Unit Tests for Challenge 06: SPINDO Telemetry Batch Processor
"""
import unittest
from telemetry_aggregator import TelemetryBatchProcessor


class TestTelemetryBatchProcessor(unittest.TestCase):
    def setUp(self):
        self.tolerances = {
            "weld_temp_celsius": (1350.0, 1450.0),
            "forming_pressure_bar": (180.0, 220.0),
            "line_speed_mpm": (30.0, 60.0)
        }
        self.processor = TelemetryBatchProcessor(self.tolerances)

    def test_summary_calculation(self):
        readings = [
            {"timestamp": 100, "metric_name": "line_speed_mpm", "value": 40.0},
            {"timestamp": 101, "metric_name": "line_speed_mpm", "value": 50.0},
            {"timestamp": 102, "metric_name": "line_speed_mpm", "value": 60.0},
        ]
        res = self.processor.process_batch(readings)
        speed_stats = res["metrics_summary"]["line_speed_mpm"]
        self.assertEqual(speed_stats["min"], 40.0)
        self.assertEqual(speed_stats["max"], 60.0)
        self.assertEqual(speed_stats["avg"], 50.0)
        self.assertEqual(speed_stats["count"], 3)
        self.assertEqual(len(res["anomalies"]), 0)

    def test_tolerance_violation_detection(self):
        readings = [
            {"timestamp": 100, "metric_name": "weld_temp_celsius", "value": 1400.0}, # Normal
            {"timestamp": 101, "metric_name": "weld_temp_celsius", "value": 1320.0}, # Below min (1350)
            {"timestamp": 102, "metric_name": "forming_pressure_bar", "value": 245.0}, # Above max (220)
        ]
        res = self.processor.process_batch(readings)
        anomalies = res["anomalies"]
        # Out of bounds: 2 anomalies (1 below min, 1 above max) + 1 sudden drop (1400 -> 1320 is drop 80°C in 1s)
        self.assertTrue(any(a["violation_type"] == "BELOW_MIN" for a in anomalies))
        self.assertTrue(any(a["violation_type"] == "ABOVE_MAX" for a in anomalies))
        self.assertTrue(any(a["violation_type"] == "SUDDEN_TEMP_DROP" for a in anomalies))

    def test_corrupt_data_filtering(self):
        readings = [
            {"timestamp": 100, "metric_name": "line_speed_mpm", "value": 45.0},
            {"corrupt": "no metric name"},
            {"timestamp": 102, "metric_name": "line_speed_mpm", "value": "invalid_string_value"},
            None
        ]
        res = self.processor.process_batch(readings)
        self.assertEqual(res["total_valid_samples"], 1)
        self.assertEqual(res["metrics_summary"]["line_speed_mpm"]["count"], 1)


if __name__ == "__main__":
    unittest.main()

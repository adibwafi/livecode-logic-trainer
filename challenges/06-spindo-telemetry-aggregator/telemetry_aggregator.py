"""
Case Study 06: IoT Pipe Welding Telemetry Stream & Anomaly Detector
PT Steel Pipe Industry of Indonesia Tbk (SPINDO) - Backend Track
"""
from typing import List, Dict, Tuple, Any, Optional
from collections import defaultdict


class TelemetryBatchProcessor:
    """
    Processes batches of manufacturing sensor readings,
    computes window statistics, and flags quality tolerance violations.
    """
    def __init__(self, tolerance_ranges: Dict[str, Tuple[float, float]]):
        """
        tolerance_ranges: Mapping of metric_name -> (min_allowed, max_allowed)
        """
        self.tolerance_ranges = tolerance_ranges

    def process_batch(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes an unsorted/sorted batch of telemetry records.
        """
        if not readings:
            return {
                "metrics_summary": {},
                "anomalies": [],
                "total_valid_samples": 0
            }

        # 1. Filter out invalid/corrupt payload records
        valid_readings = []
        for r in readings:
            if not isinstance(r, dict):
                continue
            if "timestamp" not in r or "metric_name" not in r or "value" not in r:
                continue
            if not isinstance(r["value"], (int, float)) or not isinstance(r["timestamp"], (int, float)):
                continue
            valid_readings.append(r)

        # Sort chronologically by timestamp
        valid_readings.sort(key=lambda x: x["timestamp"])

        grouped_by_metric = defaultdict(list)
        for r in valid_readings:
            grouped_by_metric[r["metric_name"]].append(r)

        metrics_summary: Dict[str, Dict[str, Any]] = {}
        anomalies: List[Dict[str, Any]] = []

        # 2. Calculate summary statistics & tolerance bound checks
        for metric_name, records in grouped_by_metric.items():
            values = [r["value"] for r in records]
            min_val = min(values)
            max_val = max(values)
            avg_val = round(sum(values) / len(values), 2)

            metrics_summary[metric_name] = {
                "count": len(values),
                "min": min_val,
                "max": max_val,
                "avg": avg_val
            }

            # Check bounds if tolerance is configured for this metric
            if metric_name in self.tolerance_ranges:
                lower, upper = self.tolerance_ranges[metric_name]
                for r in records:
                    val = r["value"]
                    if val < lower:
                        dev = round(lower - val, 2)
                        anomalies.append({
                            "timestamp": r["timestamp"],
                            "metric_name": metric_name,
                            "value": val,
                            "violation_type": "BELOW_MIN",
                            "severity": "CRITICAL" if dev > (0.1 * lower) else "WARNING",
                            "message": f"{metric_name} value {val} is below allowed min {lower}"
                        })
                    elif val > upper:
                        dev = round(val - upper, 2)
                        anomalies.append({
                            "timestamp": r["timestamp"],
                            "metric_name": metric_name,
                            "value": val,
                            "violation_type": "ABOVE_MAX",
                            "severity": "CRITICAL" if dev > (0.1 * upper) else "WARNING",
                            "message": f"{metric_name} value {val} is above allowed max {upper}"
                        })

        # 3. Detect sudden drop anomalies for temperature (rapid gradient drop > 50°C in <= 5s)
        temp_records = grouped_by_metric.get("weld_temp_celsius", [])
        for i in range(1, len(temp_records)):
            prev = temp_records[i - 1]
            curr = temp_records[i]
            time_diff = curr["timestamp"] - prev["timestamp"]
            temp_drop = prev["value"] - curr["value"]

            if 0 <= time_diff <= 5.0 and temp_drop >= 50.0:
                anomalies.append({
                    "timestamp": curr["timestamp"],
                    "metric_name": "weld_temp_celsius",
                    "value": curr["value"],
                    "violation_type": "SUDDEN_TEMP_DROP",
                    "severity": "CRITICAL",
                    "message": f"Rapid temperature drop of {round(temp_drop, 2)}°C detected within {time_diff}s"
                })

        return {
            "metrics_summary": metrics_summary,
            "anomalies": anomalies,
            "total_valid_samples": len(valid_readings)
        }

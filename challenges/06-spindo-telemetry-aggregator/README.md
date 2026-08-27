# Case Study 06: IoT Pipe Welding Telemetry Stream & Anomaly Detector

## 🏭 Background & Context (SPINDO ERW Pipe Welding Line)
Di lini produksi pipa baja ERW (*Electric Resistance Welded*) PT SPINDO Unit Karawang & Surabaya, mesin *High-Frequency Induction Welding* terus menghasilkan ribuan pembacaan sensor telemetry per menit. Parameter kritis pengelasan harus dimonitor secara real-time:
1. `weld_temp_celsius` (Suhu las, toleransi standar ASTM/API: 1350°C – 1450°C)
2. `forming_pressure_bar` (Tekanan rol pembentuk: 180 – 220 bar)
3. `line_speed_mpm` (Kecepatan pipa: 30 – 60 meter/menit)
4. `wall_thickness_mm` (Ketebalan dinding ultrasonik)

Kegagalan mendeteksi anomali suhu (*cold weld*) dapat mengakibatkan pipa pecah saat uji tekanan air (*Hydrostatic Test*), menimbulkan kerugian material hingga ratusan juta rupiah.

Anda diminta membuat engine pemrosesan batch telemetry di backend Python yang mampu menghitung statistik agregat dan mendeteksi anomali kualitas pipa secara instan.

---

## 🎯 Requirements

1. **Class `TelemetryBatchProcessor`**:
   - `__init__(self, tolerance_ranges: Dict[str, Tuple[float, float]])`
   - Menyimpan batas bawah (*lower bound*) dan batas atas (*upper bound*) untuk tiap jenis metrik sensor.

2. **Method `process_batch(self, readings: List[Dict]) -> Dict[str, Any]`**:
   - Validasi data readings: lewati data corrupt yang tidak memiliki `timestamp`, `metric_name`, atau `value`.
   - Mengelompokkan data per `metric_name`.
   - Menghitung statistik per metrik:
     - `min`: Nilai minimum.
     - `max`: Nilai maksimum.
     - `avg`: Rata-rata nilai (dibulatkan ke 2 desimal).
     - `count`: Total sampel valid.
   - Menghasilkan daftar **Anomali Batas Toleransi (*Out of Bounds*)**:
     - Jika `value < lower_bound` atau `value > upper_bound`.
     - Output alert mencakup: `timestamp`, `metric_name`, `value`, `violation_type` (`"BELOW_MIN"` / `"ABOVE_MAX"`), `severity` (`"WARNING"` / `"CRITICAL"`).
   - Menghasilkan daftar **Anomali Sudden Drop (Gradien Suhu Turun Drastis)**:
     - Untuk metrik `weld_temp_celsius`, jika terdapat penurunan > 50°C antara 2 pembacaan berurutan dalam selang waktu <= 5 detik, trigger alert `"SUDDEN_TEMP_DROP"`.

---

## 📥 Input / Output Schema

### Example Input:
```python
tolerances = {
    "weld_temp_celsius": (1350.0, 1450.0),
    "forming_pressure_bar": (180.0, 220.0),
    "line_speed_mpm": (30.0, 60.0),
}
processor = TelemetryBatchProcessor(tolerances)

readings = [
    {"timestamp": 1700000000, "metric_name": "weld_temp_celsius", "value": 1400.0},
    {"timestamp": 1700000002, "metric_name": "weld_temp_celsius", "value": 1340.0}, # Out of bounds (< 1350) & Drop 60°C!
    {"timestamp": 1700000001, "metric_name": "forming_pressure_bar", "value": 230.0}, # Above max (> 220)
]
result = processor.process_batch(readings)
```

---

## 🧪 Running the Tests
```bash
python3 challenges/06-spindo-telemetry-aggregator/test_telemetry_aggregator.py
```

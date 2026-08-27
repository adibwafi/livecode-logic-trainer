# Case Study 05: In-Memory Sliding Window Rate Limiter

## 🏭 Background & Context (SPINDO Factory IoT & API Protection)
Di pabrik pipa baja PT SPINDO, ribuan sensor IoT gerbang pabrik, mesin hydrotest, dan scanner barcode handheld mengirim request secara berkala ke API backend internal. Ketika salah satu sensor mengalami *network glitch* atau loop tak terbatas, perangkat tersebut dapat mengirimkan ribuan request per detik (spamming/storming) yang berisiko menumbangkan server ERP.

Anda diminta membuat middleware / in-memory rate limiter dengan algoritma **Sliding Window Log** untuk membatasi request per klien/sensor IP.

---

## 🎯 Requirements

1. **Kelas `SlidingWindowRateLimiter`**:
   - `__init__(self, max_requests: int, window_seconds: int)`
   - Menggunakan struktur data `collections.deque` untuk menyimpan timestamp request per `client_id` (O(1) popleft).

2. **Method `is_allowed(self, client_id: str) -> tuple[bool, int, float]`**:
   - Membersihkan timestamp lama yang sudah melewati `window_start = current_time - window_seconds`.
   - Mengembalikan tuple 3 elemen:
     1. `is_allowed` (bool): `True` jika masih diizinkan, `False` jika kuota habis.
     2. `remaining_requests` (int): Sisa kuota dalam window saat ini.
     3. `retry_after_seconds` (float): Detik yang harus ditunggu sebelum request berikutnya diizinkan (jika ditolak, dibulatkan ke 2 desimal; `0.0` jika diizinkan).

3. **Method `reset_client(self, client_id: str) -> None`**:
   - Menghapus riwayat request untuk client tertentu (whitelist / administrative reset).

4. **Method `get_active_client_count(self) -> int`**:
   - Mengembalikan jumlah client unik yang saat ini sedang aktif dalam window.

---

## 📥 Input / Output Schema

### Example Usage:
```python
limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=2)
client_ip = "192.168.1.100_GATE_SENSOR"

allowed, remaining, retry = limiter.is_allowed(client_ip)
# -> (True, 2, 0.0)

allowed, remaining, retry = limiter.is_allowed(client_ip)
# -> (True, 1, 0.0)

allowed, remaining, retry = limiter.is_allowed(client_ip)
# -> (True, 0, 0.0)

allowed, remaining, retry = limiter.is_allowed(client_ip)
# -> (False, 0, 1.95)
```

---

## 🧪 Running the Tests
```bash
python3 challenges/05-spindo-rate-limiter/test_rate_limiter.py
```

# Case Study 07: 1D Pipe Cutting Stock & Scrap Minimization Engine

## 🏭 Background & Context (SPINDO Finishing & Cutting Line)
Di divisi finishing pabrik pipa baja PT SPINDO, pipa induk diproduksi dalam panjang standar (misalnya **6.000 mm / 6 meter** atau **12.000 mm / 12 meter**). Pelanggan proyek industri sering memesan kombinasi potongan dengan panjang non-standar (misalnya: 3 pcs @ 2.400 mm, 4 pcs @ 1.750 mm, 6 pcs @ 800 mm).

Setiap kali pemotongan dilakukan, terdapat kehilangan panjang akibat ketebalan bilah gergaji (*blade kerf cut loss*, misalnya **5 mm** per potongan).

Tugas Anda adalah membuat algoritma optimasi pemotongan pipa 1D (*One-Dimensional Cutting Stock Problem*) menggunakan pendekatan **First-Fit Decreasing (FFD)** untuk:
1. Meminimalkan jumlah pipa induk (*raw stock pipes*) yang harus diambil dari gudang.
2. Meminimalkan total sisa potongan terbuang (*scrap metal waste*).

---

## 🎯 Requirements

1. **Struktur Data `CutRequest`**:
   - `order_id`: str (ID pesanan)
   - `length_mm`: int (Panjang yang diminta dalam milimeter)
   - `quantity`: int (Jumlah batang)

2. **Fungsi `optimize_pipe_cutting`**:
   ```python
   def optimize_pipe_cutting(
       stock_length_mm: int,
       blade_kerf_mm: int,
       cut_requests: List[CutRequest]
   ) -> Dict[str, Any]
   ```
   - **Ekspansi & Pengurutan**: Pecah setiap pesanan menjadi potongan individual dan urutkan secara *descending* (panjang terbesar ke terkecil) agar potongan besar teralokasi lebih dulu.
   - **Validasi**: Jika ada pesanan dengan `length_mm > stock_length_mm`, lempar `ValueError` ("Requested piece exceeds raw stock length").
   - **Perhitungan Kerf**: Setiap potongan yang dimasukkan ke dalam pipa induk mengonsumsi `length_mm + blade_kerf_mm` (kecuali potongan terakhir pada batang jika dioptimalkan, namun untuk konsistensi perhitungan, setiap pemotongan dikenakan kerf).
   - **Alokasi First-Fit**: Masukkan potongan ke pipa pertama yang memiliki sisa ruang mencukupi. Jika tidak ada yang muat, buka pipa induk baru.
   - **Metrik Output**:
     - `total_raw_pipes_used`: Jumlah pipa induk yang digunakan.
     - `cutting_plans`: List alokasi per pipa (`pipe_index`, `cuts_allocated`, `used_length_mm`, `scrap_length_mm`).
     - `total_scrap_length_mm`: Total sisa scrap dari seluruh pipa yang dibuka.
     - `scrap_percentage`: Persentase sisa terhadap total panjang pipa yang dibuka.

---

## 📥 Input / Output Schema

### Example Usage:
```python
requests = [
    CutRequest(order_id="ORD-A", length_mm=2500, quantity=2),
    CutRequest(order_id="ORD-B", length_mm=1800, quantity=3),
]
# Stock pipe: 6000 mm, Kerf: 5 mm
result = optimize_pipe_cutting(stock_length_mm=6000, blade_kerf_mm=5, cut_requests=requests)
```

---

## 🧪 Running the Tests
```bash
python3 challenges/07-spindo-pipe-cutting-optimizer/test_pipe_cutting_optimizer.py
```

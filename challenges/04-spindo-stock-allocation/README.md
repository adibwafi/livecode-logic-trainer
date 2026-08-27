# Case Study 04: Race Condition & Atomic Stock Allocation

## 🏭 Background & Context (PT SPINDO Manufacturing)
Di PT Steel Pipe Industry of Indonesia Tbk (SPINDO), pesanan pipa baja dari berbagai distributor dan proyek konstruksi B2B sering masuk ke sistem ERP/Inventory secara bersamaan (high-concurrency). Jika dua sales engineer atau distributor memesan sisa stok pipa yang sama (misalnya: Pipa Baja ERW SCH 40 4 Inch) di milidetik yang sama, sistem inventory tidak boleh sampai mengalami **over-selling** atau **inconsistent stock state**.

Tugas Anda adalah mengimplementasikan fungsi alokasi stok yang atomik dan aman terhadap *race condition* menggunakan konsep database locking (**Pessimistic Locking / `SELECT ... FOR UPDATE`**), validasi stok, dan *transaction rollback*.

---

## 🎯 Requirements

1. **Entity Model `PipeInventory`**:
   - `sku` (str, Primary Key / Unique identifier, misal: `"PIPE-SCH40-4IN"`)
   - `pipe_type` (str, misal: `"ERW Black Pipe"`)
   - `total_stock` (int, total fisik di gudang)
   - `reserved_stock` (int, kuota yang sudah dialokasikan ke order aktif)
   - `available_stock` (computed: `total_stock - reserved_stock`)

2. **Fungsi Alokasi `allocate_pipe_stock`**:
   ```python
   def allocate_pipe_stock(session, order_id: str, pipe_sku: str, qty_requested: int) -> dict
   ```
   - **Validasi Input**: Jika `qty_requested <= 0`, lempar `ValueError` atau batalkan transaksi.
   - **Pessimistic Lock**: Lock row inventory dengan `with_for_update()` untuk mencegah transaksi konkuren memodifikasi data sebelum commit.
   - **Cek Keberadaan Produk**: Jika SKU tidak ada, lempar `ProductNotFoundError` dan return status `FAILED` / `NOT_FOUND`.
   - **Cek Ketersediaan Stok**: Jika `available_stock < qty_requested`, lempar `InsufficientStockError`, lakukan rollback, dan return status `FAILED` dengan detail alasan.
   - **Alokasi Sukses**: Tambah `reserved_stock += qty_requested`, commit transaksi, dan kembalikan response dictionary dengan status `SUCCESS`.

3. **Exception Hierarchy**:
   - `InventoryAllocationError(Exception)`
   - `InsufficientStockError(InventoryAllocationError)`
   - `ProductNotFoundError(InventoryAllocationError)`

---

## 📥 Input / Output Schema

### Input:
```python
allocate_pipe_stock(
    session=db_session,
    order_id="ORD-2026-0801",
    pipe_sku="PIPE-SCH40-4IN",
    qty_requested=150
)
```

### Output (Success):
```python
{
    "status": "SUCCESS",
    "order_id": "ORD-2026-0801",
    "sku": "PIPE-SCH40-4IN",
    "allocated_qty": 150,
    "remaining_available_stock": 350
}
```

### Output (Failed / Insufficient):
```python
{
    "status": "FAILED",
    "order_id": "ORD-2026-0801",
    "sku": "PIPE-SCH40-4IN",
    "reason": "Insufficient stock for PIPE-SCH40-4IN. Requested: 600, Available: 500"
}
```

---

## 🧪 Running the Tests
```bash
python3 challenges/04-spindo-stock-allocation/test_stock_allocation.py
```

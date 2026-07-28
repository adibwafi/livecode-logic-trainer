import { Problem } from './types';

export const PROBLEMS: Problem[] = [
  {
    id: "voucher-redemption",
    title: "E-commerce Voucher Redemption API",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Logika REST API & Validasi Data",
    description: `## 1. Studi Kasus
Sebuah aplikasi e-commerce memiliki fitur redeem voucher promosi. Untuk melindungi margin bisnis, **setiap voucher hanya dapat digunakan 1 kali oleh setiap pengguna**, dan setiap voucher memiliki kuota yang terbatas.

Anda diminta membuat logika endpoint REST API Express.js untuk:
\`\`\`http
POST /redeem
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "userId": 1,
  "voucherCode": "PROMO50"
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "message": "Voucher redeemed successfully"
}
\`\`\`

---

## 3. Data Awal In-Memory
**TIDAK PERLU** menggunakan database eksternal. Cukup gunakan variabel in-memory array/object berikut:

\`\`\`javascript
const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];
\`\`\`

---

## 4. Requirement & Aturan Validasi
1. **Validasi Field**: Jika \`userId\` atau \`voucherCode\` tidak diisi di request body, kembalikan \`HTTP 400\` dengan pesan error.
2. **Aturan 1 (Voucher Harus Ada)**: Jika \`voucherCode\` tidak ditemukan di array \`vouchers\`, kembalikan \`HTTP 404\` dengan pesan *"Voucher tidak ditemukan"*.
3. **Aturan 2 (Klaim Ganda)**: Satu user hanya boleh me-redeem voucher yang sama **satu kali**. Jika user sudah pernah klaim, kembalikan \`HTTP 400\` dengan pesan *"Anda sudah pernah mengklaim voucher ini"*.
4. **Aturan 3 (Batas Kuota)**: Voucher tidak boleh diredeem jika kuotanya habis (\`quota <= 0\`). Kembalikan \`HTTP 400\` dengan pesan *"Kuota voucher sudah habis"*.
5. **Update State Data**: Jika semua validasi lolos:
   - Kurangi kuota voucher sebanyak 1 (\`voucher.quota -= 1\`).
   - Simpan catatan klaim \`{ userId, voucherCode }\` ke dalam array \`redeemedVouchers\`.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Penanganan Race Condition di PostgreSQL**
> *Di bagian komentar kode solusi Anda, jelaskan bagaimana cara mencegah race condition (misalnya overselling kuota saat banyak request masuk bersamaan) jika API ini dimigrasi menggunakan PostgreSQL.*
>
> *Jelaskan 3 pendekatan berikut:*
> - **Database Transaction & Row Locking**: \`SELECT FOR UPDATE\`
> - **Unique Constraint**: Unique index pada kolom \`(user_id, voucher_code)\`
> - **Atomic Update Query**: \`UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota > 0;\`
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// 1. Data Awal In-Memory
const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];

// 2. Implementasi Endpoint REST API
app.post('/redeem', (req, res) => {
  const { userId, voucherCode } = req.body;

  // TODO: Tuliskan logika validasi & redeem di sini
  // 1. Validasi kelengkapan payload (userId & voucherCode)
  // 2. Cek keberadaan voucher (HTTP 404)
  // 3. Cek apakah user sudah pernah klaim voucher ini (HTTP 400)
  // 4. Cek ketersediaan kuota > 0 (HTTP 400)
  // 5. Update kuota dan simpan riwayat klaim (HTTP 200)

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (Race Conditions di PostgreSQL):
 * Tuliskan penjelasan Anda di bawah ini:
 *
 * 1. Transaksi & Lock Baris (SELECT FOR UPDATE):
 *
 * 2. Unique Constraint pada (user_id, voucher_code):
 *
 * 3. Atomic Update Query:
 */

const PORT = 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log('Server berjalan di port ' + PORT));
}

module.exports = app;
`,
    bonusQuestion: "Jelaskan cara penanganan Race Condition di PostgreSQL (SELECT FOR UPDATE, Unique Constraint, Atomic Update).",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];

app.post('/redeem', (req, res) => {
  const { userId, voucherCode } = req.body;

  // 1. Validasi Body Request
  if (!userId || !voucherCode) {
    return res.status(400).json({ message: "userId dan voucherCode harus diisi" });
  }

  // 2. Cek Keberadaan Voucher
  const voucher = vouchers.find(v => v.code === voucherCode);
  if (!voucher) {
    return res.status(404).json({ message: "Voucher tidak ditemukan" });
  }

  // 3. Cek Klaim Ganda User
  const hasRedeemed = redeemedVouchers.some(
    r => r.userId === userId && r.voucherCode === voucherCode
  );
  if (hasRedeemed) {
    return res.status(400).json({ message: "Anda sudah pernah mengklaim voucher ini" });
  }

  // 4. Cek Kuota
  if (voucher.quota <= 0) {
    return res.status(400).json({ message: "Kuota voucher sudah habis" });
  }

  // 5. Update State Data
  voucher.quota -= 1;
  redeemedVouchers.push({ userId, voucherCode });

  return res.status(200).json({ message: "Voucher redeemed successfully" });
});

/*
 * JAWABAN BONUS - RACE CONDITION POSTGRESQL:
 *
 * 1. SELECT FOR UPDATE (Row-level Locking):
 *    Gunakan Database Transaction. Kunci baris voucher dengan query:
 *    SELECT quota FROM vouchers WHERE code = $1 FOR UPDATE;
 *    Transaksi lain harus menunggu sampai transaksi ini selesei/commit, mencegah klaim melebihi kuota.
 *
 * 2. UNIQUE CONSTRAINT pada (user_id, voucher_code):
 *    Tambahkan Unique Index pada tabel redeemed_vouchers:
 *    ALTER TABLE redeemed_vouchers ADD CONSTRAINT uq_user_voucher UNIQUE (user_id, voucher_code);
 *    Jika ada dua request bersamaan dari user yang sama, request kedua pasti ditolak oleh database.
 *
 * 3. ATOMIC UPDATE QUERY:
 *    Gunakan query atomic tanpa perlu lock manual:
 *    UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota > 0 RETURNING quota;
 *    Query ini menjamin pengurangan kuota hanya berhasil jika kuota > 0 saat baris diperbarui.
 */

const PORT = 3000;
app.listen(PORT, () => console.log('Server berjalan di port ' + PORT));

module.exports = app;`,
    testCases: [
      {
        id: "tc_success",
        name: "Redeem Berhasil (PROMO50)",
        input: { userId: 1, voucherCode: "PROMO50" },
        expectedStatus: 200
      },
      {
        id: "tc_not_found",
        name: "Voucher Tidak Ditemukan (HTTP 404)",
        input: { userId: 1, voucherCode: "INVALID99" },
        expectedStatus: 404
      },
      {
        id: "tc_duplicate_redemption",
        name: "Cegah Klaim Ganda User Sama (HTTP 400)",
        input: { userId: 1, voucherCode: "PROMO50" },
        expectedStatus: 400,
        setupFn: "already_redeemed"
      },
      {
        id: "tc_missing_params",
        name: "Validasi Field Kosong (HTTP 400)",
        input: { userId: 1, voucherCode: "" },
        expectedStatus: 400
      }
    ]
  },
  {
    id: "rate-limiter-middleware",
    title: "In-Memory Sliding Window Rate Limiter",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Middleware & Algoritma",
    description: `## 1. Studi Kasus
Penyalahgunaan API dan serangan spam dapat membebani server aplikasi. Tugas Anda adalah membuat middleware **Sliding Window Rate Limiter In-Memory** untuk Express.js guna melindungi endpoint API sensitif.

\`\`\`http
POST /api/action
\`\`\`

---

## 2. Requirement & Aturan
1. **Window Size**: 60 detik (60.000 milidetik).
2. **Batas Request**: Maksimal **5 request per menit** per IP client.
3. **HTTP 429 Too Many Requests**: Jika IP melebihi 5 request dalam jendela 60 detik, tolak request dengan \`HTTP 429\` dan pesan *"Rate limit exceeded. Try again later."*.
4. **Manajemen Memori**: Hapus timestamp lama (lebih dari 60 detik) dari log array IP setiap kali ada request untuk mencegah kebocoran memori (memory leak).
5. **Format Client IP**: Ambil IP dari \`req.headers['x-forwarded-for'] || req.ip || '127.0.0.1'\`.

---

## 3. Data Awal In-Memory
\`\`\`javascript
const ipRequestLogs = {}; // Format: { "192.168.1.1": [timestamp1, timestamp2, ...] }
\`\`\`

---

## 4. Pertanyaan Bonus Konseptual 💡
> **Distributed Rate Limiting Menggunakan Redis**
> *Di bagian komentar kode solusi Anda, jelaskan cara migrasi rate limiter ini agar berjalan di arsitektur multi-instance server terdistribusi menggunakan Redis.*
> *Bandingkan:*
> - **Redis Fixed Window**: INCR + EXPIRE
> - **Redis Sliding Window Log**: ZADD + ZREMRANGEBYSCORE + ZCARD
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// In-Memory Storage: IP -> Array timestamp request
const ipRequestLogs = {};

// Middleware Rate Limiter
function rateLimiter(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
  const WINDOW_MS = 60 * 1000; // 60 detik
  const MAX_REQUESTS = 5;

  // TODO: Implementasi Sliding Window Rate Limiting
  // 1. Inisialisasi array log jika IP baru
  // 2. Filter timestamp yang lebih tua dari (Date.now() - WINDOW_MS)
  // 3. Jika jumlah request aktif >= MAX_REQUESTS -> kembalikan HTTP 429
  // 4. Catat timestamp saat ini (Date.now()) lalu panggil next()

  next();
}

app.post('/api/action', rateLimiter, (req, res) => {
  return res.status(200).json({ message: "Request allowed" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan Distributed Rate Limiting dengan Redis di bawah ini:
 *
 * 1. Redis Fixed Window (INCR + EXPIRE):
 *
 * 2. Redis Sliding Window (ZADD + ZREMRANGEBYSCORE + ZCARD):
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan Distributed Rate Limiting menggunakan Redis: Fixed Window (INCR) vs Sliding Window Log (ZSET).",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const ipRequestLogs = {};

function rateLimiter(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
  const now = Date.now();
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 5;

  if (!ipRequestLogs[clientIp]) {
    ipRequestLogs[clientIp] = [];
  }

  // Hapus timestamp kadaluarsa di luar sliding window 60 detik
  ipRequestLogs[clientIp] = ipRequestLogs[clientIp].filter(
    (ts) => now - ts < WINDOW_MS
  );

  if (ipRequestLogs[clientIp].length >= MAX_REQUESTS) {
    return res.status(429).json({ message: "Rate limit exceeded. Try again later." });
  }

  ipRequestLogs[clientIp].push(now);
  next();
}

app.post('/api/action', rateLimiter, (req, res) => {
  return res.status(200).json({ message: "Request allowed" });
});

/*
 * JAWABAN BONUS - DISTRIBUTED RATE LIMITER REDIS:
 *
 * 1. REDIS FIXED WINDOW (INCR + EXPIRE):
 *    Gunakan key: INCR rate:ip:menit_timestamp
 *    Gunakan EXPIRE rate:ip:menit_timestamp 60
 *    Sangat cepat O(1), namun dapat terjadi perlonjakan request 2x lipat di batas pergantian menit.
 *
 * 2. REDIS SLIDING WINDOW (SORTED SET):
 *    ZADD rate:ip <now_ms> <uuid_atau_now_ms>
 *    ZREMRANGEBYSCORE rate:ip 0 <now_ms - 60000>
 *    count = ZCARD rate:ip
 *    EXPIRE rate:ip 60
 *    Jika count > MAX -> tolak dengan HTTP 429
 *    Memberikan pembatasan rate yang sangat mulus & konsisten di seluruh instance server terdistribusi.
 */

module.exports = app;`,
    testCases: [
      {
        id: "tc_allowed",
        name: "Request Pertama Diizinkan (HTTP 200)",
        input: { userId: 1, voucherCode: "" },
        expectedStatus: 200
      }
    ]
  },
  {
    id: "cart-checkout-engine",
    title: "E-commerce Cart Checkout & Tax Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Logika Bisnis & Perhitungan State",
    description: `## 1. Studi Kasus
Buatlah logika checkout keranjang belanja untuk toko online. Endpoint menerima payload barang belanjaan, memvalidasi stok produk, menerapkan voucher diskon khusus kategori, menghitung **PPN 11%**, dan mengembalikan rincian tagihan.

\`\`\`http
POST /cart/checkout
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "items": [
    { "productId": "P1", "quantity": 2 },
    { "productId": "P2", "quantity": 1 }
  ],
  "voucherCode": "TECH20"
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "subtotal": 2050,
  "discount": 150,
  "netSubtotal": 1900,
  "tax": 209,
  "total": 2109
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const products = [
  { id: "P1", name: "Laptop", price: 1000, category: "ELECTRONICS", stock: 3 },
  { id: "P2", name: "Mouse",  price: 50,   category: "ELECTRONICS", stock: 10 },
  { id: "P3", name: "Shirt",  price: 30,   category: "FASHION",     stock: 5 }
];

const vouchers = [
  { code: "TECH20", category: "ELECTRONICS", discountPercent: 20, maxDiscount: 150 }
];
\`\`\`

---

## 4. Aturan Perhitungan & Requirement
1. **Validasi Payload**: Jika \`items\` tidak ada atau array kosong → kembalikan \`HTTP 400\` *"Items array is required"*.
2. **Cek Stok**: Jika \`quantity > product.stock\` → kembalikan \`HTTP 400\` *"Product X out of stock"*.
3. **Subtotal**: Total harga (price × quantity) dari seluruh item.
4. **Diskon Voucher**: 20% khusus item kategori \`ELECTRONICS\`, dengan **batas diskon maksimal (maxDiscount) = 150**.
5. **PPN 11%**: \`tax = (subtotal - discount) × 0.11\`
6. **Pengurangan Stok**: Kurangi stok produk (\`product.stock -= quantity\`) setelah transaksi berhasil.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Idempotency pada Payment Gateway**
> *Di komentar kode solusi Anda, jelaskan bagaimana cara menjamin Idempotency menggunakan header \`X-Idempotency-Key\` untuk mencegah penagihan ganda (double charge) saat koneksi jaringan terputus dan user melakukan retry.*
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: "P1", name: "Laptop", price: 1000, category: "ELECTRONICS", stock: 3 },
  { id: "P2", name: "Mouse",  price: 50,   category: "ELECTRONICS", stock: 10 },
  { id: "P3", name: "Shirt",  price: 30,   category: "FASHION",     stock: 5 }
];

const vouchers = [
  { code: "TECH20", category: "ELECTRONICS", discountPercent: 20, maxDiscount: 150 }
];

app.post('/cart/checkout', (req, res) => {
  const { items, voucherCode } = req.body;

  // TODO: Implementasi Engine Checkout
  // 1. Validasi payload items (wajib array tidak kosong)
  // 2. Cek ketersediaan stok untuk setiap produk
  // 3. Hitung subtotal harga
  // 4. Terapkan diskon voucher untuk produk kategori ELECTRONICS (maksimal 150)
  // 5. Hitung pajak PPN 11% dari (subtotal - discount)
  // 6. Kurangi stok produk dan kembalikan rincian harga

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan Idempotency API dengan X-Idempotency-Key di bawah ini:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan cara menjamin Idempotency API (X-Idempotency-Key) pada integrasi payment gateway untuk mencegah penagihan ganda.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: "P1", name: "Laptop", price: 1000, category: "ELECTRONICS", stock: 3 },
  { id: "P2", name: "Mouse",  price: 50,   category: "ELECTRONICS", stock: 10 },
  { id: "P3", name: "Shirt",  price: 30,   category: "FASHION",     stock: 5 }
];

const vouchers = [
  { code: "TECH20", category: "ELECTRONICS", discountPercent: 20, maxDiscount: 150 }
];

app.post('/cart/checkout', (req, res) => {
  const { items, voucherCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items array is required" });
  }

  const voucher = vouchers.find(v => v.code === voucherCode) || null;
  let subtotal = 0;
  let eligibleSubtotal = 0;
  const itemDetails = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ message: "Product " + item.productId + " not found" });
    }
    if (item.quantity > product.stock) {
      return res.status(400).json({ message: "Product " + product.name + " out of stock" });
    }
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    if (voucher && product.category === voucher.category) {
      eligibleSubtotal += lineTotal;
    }
    itemDetails.push({ product, quantity: item.quantity });
  }

  let discount = 0;
  if (voucher) {
    const rawDiscount = (eligibleSubtotal * voucher.discountPercent) / 100;
    discount = Math.min(rawDiscount, voucher.maxDiscount);
  }

  const netSubtotal = subtotal - discount;
  const tax = Math.round(netSubtotal * 0.11 * 100) / 100;
  const total = Math.round((netSubtotal + tax) * 100) / 100;

  for (const { product, quantity } of itemDetails) {
    product.stock -= quantity;
  }

  return res.status(200).json({ subtotal, discount, netSubtotal, tax, total });
});

/*
 * JAWABAN BONUS - IDEMPOTENCY KEY DESIGN:
 *
 * 1. Client mengirimkan header: X-Idempotency-Key: <UUID>
 * 2. Server mencari UUID tersebut di Redis/Database:
 *    - JIKA TIDAK DITEMUKAN: Simpan record status=PENDING, proses transaksi pembayaran, ubah status=COMPLETED, cache payload response.
 *    - JIKA DITEMUKAN + COMPLETED: Langsung kembalikan response dari cache tanpa memproses ulang pembayaran.
 *    - JIKA DITEMUKAN + PENDING: Kembalikan HTTP 409 Conflict (transaksi sedang diproses).
 * 3. Pasang TTL pada key idempotency (misal 24 jam).
 * 4. Mencegah penagihan ganda ketika client mengirim ulang request akibat jaringan terputus.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "order-inventory-reservation",
    title: "Flash Sale Inventory Stock Reservation",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "High Concurrency & TTL State",
    description: `## 1. Studi Kasus
Saat event Flash Sale dengan trafik tinggi, platform e-commerce menggunakan **reservasi stok sementara** (TTL = 5 menit). Ketika pengguna memasukkan produk ke keranjang, stok direservasi secara sementara. Jika checkout tidak diselesaikan dalam 5 menit, masa reservasi habis dan stok otomatis dikembalikan ke inventori publik.

\`\`\`http
POST /orders/reserve
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "userId": "USER_101",
  "itemId": "ITEM_100",
  "quantity": 2
}
\`\`\`

### Response Berhasil (HTTP 201):
\`\`\`json
{
  "message": "Stock reserved successfully",
  "reservationId": "RES_1721839000000",
  "expiresInSeconds": 300
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const inventory = [
  { itemId: "ITEM_100", totalStock: 10, reservedStock: 0 }
];

const reservations = [];
\`\`\`

---

## 4. Requirement & Aturan Validasi
1. **Validasi Body**: \`userId\`, \`itemId\`, dan \`quantity\` ($> 0$) wajib diisi → \`HTTP 400\` jika tidak valid.
2. **Cek Produk**: Jika \`itemId\` tidak ada di inventory → \`HTTP 404\` *"Item not found"*.
3. **Hitung Stok Tersedia**: \`availableStock = totalStock - reservedStock\`. Jika \`quantity > availableStock\` → \`HTTP 400\` *"Insufficient available inventory"*.
4. **Catat Reservasi**: Buat objek \`{ reservationId: "RES_" + Date.now(), userId, itemId, quantity, expiresAt: Date.now() + 300000, status: "ACTIVE" }\`
5. **Update State**: Tambahkan \`inventory.reservedStock += quantity\`

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Pelepasan Reservasi Kadaluarsa di Production**
>
> *Di komentar kode solusi Anda, jelaskan cara otomatis melepas stok reservasi yang kadaluarsa menggunakan:*
> - **Redis Keyspace Notifications** (notify-keyspace-events KEA → dengarkan event expired)
> - **Delayed Job Queue** (BullMQ dengan delayed job 5 menit)
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const inventory = [
  { itemId: "ITEM_100", totalStock: 10, reservedStock: 0 }
];

const reservations = [];

app.post('/orders/reserve', (req, res) => {
  const { userId, itemId, quantity } = req.body;

  // TODO: Implementasi Reservasi Stok Inventori
  // 1. Validasi request payload (userId, itemId, quantity > 0)
  // 2. Cari item di inventori (404 jika tidak ditemukan)
  // 3. Hitung availableStock = totalStock - reservedStock
  // 4. Jika quantity > availableStock -> HTTP 400
  // 5. Tambah reservedStock, catat reservasi, kembalikan HTTP 201

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan cara penanganan kadaluarsa reservasi stok TTL di production:
 *
 * 1. Redis Keyspace Notifications:
 *
 * 2. BullMQ Delayed Job Queue:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan cara otomatis melepaskan reservasi stok yang kadaluarsa menggunakan Redis keyspace notifications atau BullMQ delayed job.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const inventory = [
  { itemId: "ITEM_100", totalStock: 10, reservedStock: 0 }
];

const reservations = [];

app.post('/orders/reserve', (req, res) => {
  const { userId, itemId, quantity } = req.body;

  if (!userId || !itemId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: "userId, itemId, dan quantity bernilai positif harus diisi" });
  }

  const item = inventory.find(i => i.itemId === itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const availableStock = item.totalStock - item.reservedStock;
  if (quantity > availableStock) {
    return res.status(400).json({ message: "Insufficient available inventory" });
  }

  item.reservedStock += quantity;

  const reservationId = "RES_" + Date.now();
  const expiresAt = Date.now() + (5 * 60 * 1000);

  reservations.push({
    reservationId,
    userId,
    itemId,
    quantity,
    expiresAt,
    status: "ACTIVE"
  });

  return res.status(201).json({
    message: "Stock reserved successfully",
    reservationId,
    expiresInSeconds: 300
  });
});

/*
 * JAWABAN BONUS - KADALUARSA TTL RESERVASI:
 *
 * 1. REDIS KEYSPACE NOTIFICATIONS:
 *    Simpan key: SET reservation:RES_123 <payload> EX 300
 *    Aktifkan: CONFIG SET notify-keyspace-events KEA
 *    Worker mendengarkan event: __keyevent@0__:expired
 *    Saat event dipicu: kurangi reservedStock kembali di database.
 *
 * 2. BULLMQ DELAYED JOB QUEUE:
 *    await queue.add('expire-reservation', { reservationId, itemId, quantity }, { delay: 300000 });
 *    Worker memproses job: jika reservasi.status !== 'COMPLETED', kembalikan reservedStock.
 *    Kelebihan: Bertahan dari restart Redis, dapat di-retry, dan mudah di-monitor.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "auth-session-manager",
    title: "JWT Token Refresh & Auto-Logout State Engine",
    role: "Frontend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Frontend State & Auth Token Rotation",
    description: `## 1. Studi Kasus
Dalam aplikasi Single Page Application (SPA), ketika access token kadaluarsa (HTTP 401), sistem harus secara otomatis mencoba memperbarui token via endpoint refresh token sebelum mengulangi request awal. Jika refresh token juga kadaluarsa atau tidak valid, sistem harus melakukan auto-logout dan membersihkan state sesi.

Tugas Anda adalah membuat middleware/handler Express untuk endpoint:
\`\`\`http
POST /auth/refresh
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "refreshToken": "REFRESH_VALID_123"
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "accessToken": "NEW_ACCESS_TOKEN_999",
  "expiresIn": 900
}
\`\`\`

---

## 3. Aturan & Requirement Validasi
1. **Validasi Body**: Jika \`refreshToken\` tidak diisi → \`HTTP 400\` *"Refresh token is required"*.
2. **Cek Validitas Refresh Token**:
   - Token \`"REFRESH_EXPIRED"\` → \`HTTP 401\` *"Refresh token expired. Please login again."*
   - Token selain \`"REFRESH_VALID_123"\` → \`HTTP 403\` *"Invalid refresh token"*.
3. **Generate Token Baru**: Jika token valid, kembalikan \`HTTP 200\` dengan token baru \`"NEW_ACCESS_TOKEN_" + Date.now()\`.

---

## 4. Pertanyaan Bonus Konseptual 💡
> **Mitigasi Serangan XSS vs CSRF pada Penyimpanan JWT**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - Risiko menyimpan JWT di \`localStorage\` / \`sessionStorage\` (Vulnerable terhadap XSS).
> - Keunggulan \`HttpOnly\`, \`Secure\`, dan \`SameSite=Strict\` Cookie untuk mencegah CSRF & XSS.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  // TODO: Implementasi Handler Token Refresh
  // 1. Validasi keberadaan refreshToken (HTTP 400 jika tidak ada)
  // 2. Cek token kadaluarsa "REFRESH_EXPIRED" -> HTTP 401
  // 3. Cek token tidak valid (bukan "REFRESH_VALID_123") -> HTTP 403
  // 4. Kembalikan token baru (HTTP 200)

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan XSS vs CSRF pada penyimpanan JWT di bawah ini:
 *
 * 1. LocalStorage vs XSS:
 *
 * 2. HttpOnly Cookie & SameSite vs CSRF:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan mitigasi serangan XSS vs CSRF pada penyimpanan JWT (HttpOnly Cookie vs Memory/LocalStorage + SameSite flag).",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  if (refreshToken === "REFRESH_EXPIRED") {
    return res.status(401).json({ message: "Refresh token expired. Please login again." });
  }

  if (refreshToken !== "REFRESH_VALID_123") {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  return res.status(200).json({
    accessToken: "NEW_ACCESS_TOKEN_" + Date.now(),
    expiresIn: 900
  });
});

/*
 * JAWABAN BONUS - XSS VS CSRF JWT STORAGE:
 *
 * 1. LOCALSTORAGE & XSS:
 *    Menyimpan JWT di LocalStorage sangat rentan terhadap Cross-Site Scripting (XSS). Jika penyerang berhasil menyuntikkan skrip JS (misal via paket npm yang terinfeksi atau input yang tidak disanitasi), skrip dapat membaca localStorage.getItem('token') dan mengirimnya ke server penyerang.
 *
 * 2. HTTPONLY COOKIE & SAMESITE:
 *    - HttpOnly: Mencegah JavaScript browser membaca cookie token, sepenuhnya menutup celah pencurian token via XSS.
 *    - SameSite=Strict / Lax: Memastikan cookie tidak ikut dikirim saat terjadi cross-site request dari website lain, mencegah Cross-Site Request Forgery (CSRF).
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "idempotent-payment-webhook",
    title: "Payment Gateway Idempotent Webhook Handler",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Webhooks & Idempotency",
    description: `## 1. Studi Kasus
Payment gateway mengirimkan webhook event (\`payment.success\`) untuk memperbarui status transaksi di database Anda. Karena kegagalan jaringan, payment gateway sering melakukan retry webhook yang sama berkali-kali. API Anda harus menjamin **Idempotency** (event ID yang sama tidak boleh diproses 2 kali) dan memverifikasi **Signature Webhook**.

Endpoint:
\`\`\`http
POST /webhook/payment
\`\`\`

---

## 2. Spesifikasi Input & Output

### Header:
\`\`\`http
x-signature: VALID_SIGNATURE_KEY
\`\`\`

### Request Body:
\`\`\`json
{
  "eventId": "EVT_998811",
  "orderId": "ORD_1001",
  "status": "SUCCESS",
  "amount": 250000
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const processedEventIds = new Set();
const orders = [
  { orderId: "ORD_1001", status: "PENDING_PAYMENT", amount: 250000 }
];
\`\`\`

---

## 4. Aturan Validasi & Requirement
1. **Verifikasi Signature**: Jika header \`x-signature\` !== \`"VALID_SIGNATURE_KEY"\` → \`HTTP 401\` *"Unauthorized webhook signature"*.
2. **Validasi Payload**: Jika \`eventId\`, \`orderId\`, atau \`status\` kosong → \`HTTP 400\` *"Invalid webhook payload"*.
3. **Cek Duplikasi Event (Idempotency)**: Jika \`processedEventIds.has(eventId)\` → \`HTTP 200\` *"Event already processed"*. (Penting: Tetap kembalikan HTTP 200 agar payment gateway tidak retry terus menerus!).
4. **Update Status Order**: Cari order berdasarkan \`orderId\`. Ubah \`order.status = status\` dan masukkan \`eventId\` ke \`processedEventIds\`. Kembalikan \`HTTP 200\` *"Order updated successfully"*.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Strategi Webhook Dead Letter Queue (DLQ) & Exponential Backoff**
> *Di bagian komentar kode solusi Anda, jelaskan penanganan kegagalan webhook pihak ketiga menggunakan Message Queue (BullMQ/Kafka), Dead Letter Queue (DLQ), dan Retry backoff (1s, 5s, 30s, 5m).*
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const processedEventIds = new Set();
const orders = [
  { orderId: "ORD_1001", status: "PENDING_PAYMENT", amount: 250000 }
];

app.post('/webhook/payment', (req, res) => {
  const signature = req.headers['x-signature'];
  const { eventId, orderId, status, amount } = req.body;

  // TODO: Implementasi Webhook Handler
  // 1. Verifikasi header x-signature (HTTP 401 jika salah)
  // 2. Validasi kelengkapan payload (eventId, orderId, status) -> HTTP 400
  // 3. Cek apakah eventId sudah pernah diproses -> HTTP 200 (Idempotent response)
  // 4. Update status order dan catat eventId -> HTTP 200

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan Webhook DLQ & Retry Backoff di bawah ini:
 *
 * 1. Exponential Backoff Retry:
 *
 * 2. Dead Letter Queue (DLQ) & Manual Alerting:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan strategi Webhook Dead Letter Queue (DLQ) & Exponential Backoff Retry saat server penerima mengalami downtime.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const processedEventIds = new Set();
const orders = [
  { orderId: "ORD_1001", status: "PENDING_PAYMENT", amount: 250000 }
];

app.post('/webhook/payment', (req, res) => {
  const signature = req.headers['x-signature'];
  if (signature !== "VALID_SIGNATURE_KEY") {
    return res.status(401).json({ message: "Unauthorized webhook signature" });
  }

  const { eventId, orderId, status } = req.body;
  if (!eventId || !orderId || !status) {
    return res.status(400).json({ message: "Invalid webhook payload" });
  }

  if (processedEventIds.has(eventId)) {
    return res.status(200).json({ message: "Event already processed" });
  }

  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = status;
  }

  processedEventIds.add(eventId);
  return res.status(200).json({ message: "Order updated successfully" });
});

/*
 * JAWABAN BONUS - WEBHOOK DLQ & RETRY BACKOFF:
 *
 * 1. EXPONENTIAL BACKOFF RETRY:
 *    Saat mengirim webhook ke server merchant yang gagal (HTTP 5xx / Timeout), jangan langsung menyerah. Lakukan percobaan ulang secara bertahap: misal retry 1 (setelah 5s), retry 2 (setelah 30s), retry 3 (setelah 5 menit), retry 4 (setelah 1 jam).
 *
 * 2. DEAD LETTER QUEUE (DLQ):
 *    Jika setelah N kali percobaan webhook tetap gagal, pindahkan message ke Dead Letter Queue (DLQ). Tim engineering dapat menganalisis log error, memperbaiki bug/downtime server, lalu melakukan "replay" message dari DLQ tanpa merusak urutan event lain.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "notification-batch-dispatcher",
    title: "Resilient Notification Dispatcher with Provider Fallback",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Resilient Microservices & Fallback Logic",
    description: `## 1. Studi Kasus
Dalam sistem pengiriman email transaksi (OTP / Invoice), keandalan layanan adalah hal utama. Aplikasi harus mencoba mengirimkan email via **Primary Provider (SendGrid)**. Jika SendGrid mengalami error (misal maintenance/downtime), sistem harus **otomatis fallback ke Secondary Provider (Mailgun)** secara transparan.

Endpoint:
\`\`\`http
POST /notifications/send
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "to": "user@example.com",
  "subject": "Kode OTP Anda",
  "body": "Kode OTP: 492019",
  "forcePrimaryError": false
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "status": "SENT",
  "provider": "SendGrid",
  "messageId": "MSG_SG_1002"
}
\`\`\`

---

## 3. Requirement & Aturan Validasi
1. **Validasi Payload**: Jika \`to\`, \`subject\`, atau \`body\` kosong → \`HTTP 400\` *"Missing required email fields"*.
2. **Logika Dispatch Primary (SendGrid)**:
   - Jika \`forcePrimaryError === true\` (simulasi SendGrid down), gagal dengan error 500 dan masuk ke fallback.
   - Jika normal, kirim via SendGrid → \`HTTP 200\` dengan \`{ status: "SENT", provider: "SendGrid", messageId: "SG_" + Date.now() }\`.
3. **Logika Fallback Secondary (Mailgun)**:
   - Jika Primary gagal, eksekusi pengiriman via Mailgun → \`HTTP 200\` dengan \`{ status: "SENT", provider: "Mailgun", messageId: "MG_" + Date.now() }\`.
   - Jika kedua provider dipaksa gagal (\`forcePrimaryError === true\` & \`forceSecondaryError === true\`), kembalikan \`HTTP 503\` *"All email providers unavailable"*.

---

## 4. Pertanyaan Bonus Konseptual 💡
> **Pola Circuit Breaker pada Microservices**
> *Di bagian komentar kode solusi Anda, jelaskan 3 status Circuit Breaker (CLOSED, OPEN, HALF-OPEN) untuk mengisolasi kegagalan service dependen.*
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/notifications/send', (req, res) => {
  const { to, subject, body, forcePrimaryError, forceSecondaryError } = req.body;

  // TODO: Implementasi Dispatcher dengan Fallback
  // 1. Validasi field wajib (to, subject, body) -> HTTP 400
  // 2. Coba kirim via SendGrid (jika tidak forcePrimaryError)
  // 3. Jika SendGrid gagal, coba kirim via Mailgun (jika tidak forceSecondaryError)
  // 4. Jika kedua provider gagal -> HTTP 503

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan status Circuit Breaker di bawah ini:
 *
 * 1. CLOSED:
 *
 * 2. OPEN:
 *
 * 3. HALF-OPEN:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan pola Circuit Breaker (CLOSED, OPEN, HALF-OPEN) untuk mencegah cascading failure pada microservices dependensi pihak ketiga.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/notifications/send', (req, res) => {
  const { to, subject, body, forcePrimaryError, forceSecondaryError } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ message: "Missing required email fields" });
  }

  // Attempt Primary Provider (SendGrid)
  if (!forcePrimaryError) {
    return res.status(200).json({
      status: "SENT",
      provider: "SendGrid",
      messageId: "SG_" + Date.now()
    });
  }

  // Fallback to Secondary Provider (Mailgun)
  if (!forceSecondaryError) {
    return res.status(200).json({
      status: "SENT",
      provider: "Mailgun",
      messageId: "MG_" + Date.now()
    });
  }

  return res.status(503).json({ message: "All email providers unavailable" });
});

/*
 * JAWABAN BONUS - CIRCUIT BREAKER PATTERN:
 *
 * 1. CLOSED State (Normal Operation):
 *    Semua request dikirimkan langsung ke service utama. Kegagalan diukur secara statistik. Jika persentase failure melebihi ambang batas (threshold, misal 50%), state berubah menjadi OPEN.
 *
 * 2. OPEN State (Trip / Fail Fast):
 *    Request ke service utama langsung ditolak secara instan tanpa menunggu timeout, sehingga menghemat daya komputasi dan mencegah cascading failure.
 *
 * 3. HALF-OPEN State (Trial & Recovery):
 *    Setelah jeda waktu tertentu (cooldown period, misal 30 detik), Circuit Breaker mengizinkan sebagian kecil request lalu-lalang untuk menguji kesehatan service utama. Jika berhasil, state kembali ke CLOSED. Jika masih gagal, kembali ke OPEN.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "order-state-machine-validator",
    title: "Order Lifecycle State Machine & Test Suite",
    role: "QA Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "API Automation & State Machine Testing",
    description: `## 1. Studi Kasus
Dalam sistem e-commerce, status pesanan mengikuti diagram Finite State Machine (FSM) yang ketat. Sebagai QA Engineer / Backend Test Engineer, Anda bertugas membuat API validator transition status order dan menangani skenario illegal transition.

Endpoint:
\`\`\`http
POST /orders/transition
\`\`\`

---

## 2. Spesifikasi State Machine
Status yang valid:
- \`CREATED\` → transisi ke: \`PAID\` atau \`CANCELLED\`
- \`PAID\` → transisi ke: \`PROCESSING\` atau \`CANCELLED\`
- \`PROCESSING\` → transisi ke: \`SHIPPED\`
- \`SHIPPED\` → transisi ke: \`DELIVERED\`
- \`DELIVERED\` / \`CANCELLED\` → Terminal state (tidak bisa transisi lagi ke mana pun).

---

## 3. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "currentStatus": "PAID",
  "targetStatus": "PROCESSING"
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "allowed": true,
  "message": "Transition from PAID to PROCESSING is valid"
}
\`\`\`

### Response Transisi Ilegal (HTTP 400):
\`\`\`json
{
  "allowed": false,
  "message": "Illegal transition from CANCELLED to SHIPPED"
}
\`\`\`

---

## 4. Aturan Validasi
1. **Validasi Body**: Jika \`currentStatus\` atau \`targetStatus\` kosong → \`HTTP 400\` *"currentStatus and targetStatus are required"*.
2. **Validasi Status Dikenal**: Jika status tidak ada di FSM → \`HTTP 400\` *"Unknown status provided"*.
3. **Validasi Transisi**: Cek apakah transisi dari \`currentStatus\` ke \`targetStatus\` diizinkan menurut aturan FSM.
   - Jika Valid → \`HTTP 200\` dengan \`allowed: true\`.
   - Jika Tidak Valid (Illegal Transition) → \`HTTP 400\` dengan \`allowed: false\`.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Integration Testing vs Contract Testing (Pact)**
> *Di bagian komentar kode solusi Anda, jelaskan perbedaan strategi Integration Testing vs Consumer-Driven Contract Testing (Pact) dalam menguji interaksi antar microservice.*
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED_TRANSITIONS = {
  CREATED: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

app.post('/orders/transition', (req, res) => {
  const { currentStatus, targetStatus } = req.body;

  // TODO: Implementasi FSM Validator
  // 1. Validasi kelengkapan body (HTTP 400)
  // 2. Cek apakah status dikenali (HTTP 400)
  // 3. Cek apakah targetStatus ada di array ALLOWED_TRANSITIONS[currentStatus]
  // 4. Jika valid -> HTTP 200; Jika ilegal -> HTTP 400

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS:
 * Jelaskan Contract Testing (Pact) vs Integration Testing di bawah ini:
 *
 * 1. Integration Testing:
 *
 * 2. Consumer-Driven Contract Testing (Pact):
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan strategi Integration Testing vs End-to-End (E2E) Contract Testing dengan Pact pada arsitektur microservices.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED_TRANSITIONS = {
  CREATED: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

app.post('/orders/transition', (req, res) => {
  const { currentStatus, targetStatus } = req.body;

  if (!currentStatus || !targetStatus) {
    return res.status(400).json({ message: "currentStatus and targetStatus are required" });
  }

  if (!ALLOWED_TRANSITIONS[currentStatus] || !ALLOWED_TRANSITIONS[targetStatus] && targetStatus !== "CANCELLED" && targetStatus !== "PAID" && targetStatus !== "PROCESSING" && targetStatus !== "SHIPPED" && targetStatus !== "DELIVERED") {
    return res.status(400).json({ message: "Unknown status provided" });
  }

  const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  const isAllowed = validNextStates.includes(targetStatus);

  if (isAllowed) {
    return res.status(200).json({
      allowed: true,
      message: "Transition from " + currentStatus + " to " + targetStatus + " is valid"
    });
  }

  return res.status(400).json({
    allowed: false,
    message: "Illegal transition from " + currentStatus + " to " + targetStatus
  });
});

/*
 * JAWABAN BONUS - CONTRACT TESTING VS INTEGRATION TESTING:
 *
 * 1. INTEGRATION TESTING:
 *    Menguji beberapa service nyata sekaligus secara langsung. Seringkali lambat, sulit dikonfigurasi di CI/CD, dan rentan terhadap flaky tests jika salah satu service sedang down atau database kotor.
 *
 * 2. CONSUMER-DRIVEN CONTRACT TESTING (PACT):
 *    - Consumer (Frontend/Service A) mendefinisikan ekspektasi request/response dalam file "Contract" (Pact JSON).
 *    - Provider (Backend/Service B) menguji kodenya secara mandiri terhadap Contract tanpa perlu menjalankan Consumer secara nyata.
 *    - Hasilnya: Eksekusi tes sangat cepat O(ms), memberikan jaminan tidak adanya breaking change API sebelum deploy ke production.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "user-registration-validator",
    title: "User Registration & Password Complexity Validator",
    role: "Backend Engineer",
    level: "Junior",
    timeLimit: 30,
    category: "Form Validation & Data Sanitization",
    description: `## 1. Studi Kasus
Fitur pendaftaran pengguna baru (*User Registration*) membutuhkan validasi data input yang ketat pada layer backend sebelum data disimpan ke basis data. Anda diminta membuat logika endpoint REST API Express.js untuk:

\`\`\`http
POST /users/register
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "email": "user@example.com",
  "password": "Password123!",
  "age": 20
}
\`\`\`

### Response Berhasil (HTTP 201):
\`\`\`json
{
  "message": "User registered successfully",
  "userId": "USR_101"
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const registeredUsers = [
  { id: "USR_100", email: "existing@example.com", age: 25 }
];
\`\`\`

---

## 4. Requirement & Aturan Validasi
1. **Validasi Field Wajib**: Jika \`email\`, \`password\`, atau \`age\` tidak diisi → \`HTTP 400\` dengan pesan *"Missing required registration fields"*.
2. **Validasi Format Email**: Harus mengandung karakter \`@\` dan \`.\` → \`HTTP 400\` dengan pesan *"Invalid email format"*.
3. **Validasi Kompleksitas Password**:
   - Panjang minimal **8 karakter**.
   - Harus memiliki minimal **1 huruf kapital (A-Z)**.
   - Harus memiliki minimal **1 angka (0-9)**.
   - Jika tidak memenuhi → \`HTTP 400\` dengan pesan *"Password does not meet complexity requirements"*.
4. **Validasi Usia Minimum**: User harus berusia minimal **18 tahun** (\`age >= 18\`) → \`HTTP 400\` dengan pesan *"User must be at least 18 years old"*.
5. **Cek Email Duplikat**: Jika email sudah ada di \`registeredUsers\` → \`HTTP 409\` dengan pesan *"Email already registered"*.
6. **Registrasi Berhasil**: Tambahkan data user ke array \`registeredUsers\` dan kembalikan \`HTTP 201\` dengan \`userId\` baru (*"USR_" + Date.now()*).

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Keamanan Password: Hashing & Salt Rounds**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - Mengapa password TIDAK BOLEH disimpan dalam bentuk plaintext di database.
> - Perbedaan algoritma hashing **Argon2 / bcrypt** dibanding MD5/SHA-256.
> - Peran **Salt** dan **Cost Factor (Salt Rounds)** dalam mencegah Rainbow Table Attack.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const registeredUsers = [
  { id: "USR_100", email: "existing@example.com", age: 25 }
];

app.post('/users/register', (req, res) => {
  const { email, password, age } = req.body;

  // TODO: Implementasi Validasi Registrasi User
  // 1. Validasi field kelengkapan payload (email, password, age) -> HTTP 400
  // 2. Validasi format email (mengandung '@' dan '.') -> HTTP 400
  // 3. Validasi password (min 8 char, 1 uppercase, 1 digit) -> HTTP 400
  // 4. Validasi age >= 18 -> HTTP 400
  // 5. Cek duplikasi email -> HTTP 409
  // 6. Simpan user baru -> HTTP 201

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (Password Hashing & Security):
 *
 * 1. Bahaya Plaintext Password:
 *
 * 2. Argon2 / bcrypt vs MD5/SHA-256:
 *
 * 3. Fungsi Salt & Salt Rounds (Cost Factor):
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan keamanan password (Argon2/bcrypt vs MD5, Salt, dan Salt Rounds) untuk mencegah Rainbow Table & Brute-Force Attacks.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const registeredUsers = [
  { id: "USR_100", email: "existing@example.com", age: 25 }
];

app.post('/users/register', (req, res) => {
  const { email, password, age } = req.body;

  if (!email || !password || age === undefined || age === null) {
    return res.status(400).json({ message: "Missing required registration fields" });
  }

  if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const isPasswordValid =
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Password does not meet complexity requirements" });
  }

  if (typeof age !== 'number' || age < 18) {
    return res.status(400).json({ message: "User must be at least 18 years old" });
  }

  const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const userId = "USR_" + Date.now();
  registeredUsers.push({ id: userId, email, age });

  return res.status(201).json({
    message: "User registered successfully",
    userId
  });
});

/*
 * JAWABAN BONUS - PASSWORD SECURITY & HASHING:
 *
 * 1. BAHAYA PLAINTEXT PASSWORD:
 *    Jika database bocor (data breach), penyerang akan langsung mendapatkan password mentah milik user. Karena 80% user menggunakan password yang sama di banyak layanan, peretas bisa mengambil alih akun email, perbankan, dan sosial media korban (Credential Stuffing).
 *
 * 2. ARGON2 / BCRYPT VS MD5/SHA-256:
 *    MD5 dan SHA-256 dirancang cepat O(1) untuk integritas file, sehingga GPU modern dapat menebak milyaran kombinasi hash per detik. Sebaliknya, bcrypt dan Argon2 adalah "slow hashing algorithms" yang sengaja mengonsumsi waktu CPU & memori (Memory-hard) untuk memperlambat serangan brute force.
 *
 * 3. SALT & COST FACTOR (SALT ROUNDS):
 *    - Salt: String acak unik yang ditambahkan ke password sebelum di-hash, menggagalkan serangan Rainbow Table (tabel hash terkompilasi).
 *    - Cost Factor (misal saltRounds = 10-12): Mengatur tingkat kesulitan perhitungan hash. Nilai 10 berarti ~100ms per hash, membuat GPU peretas kewalahan.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "pagination-search-filter",
    title: "API Data Filtering & Pagination Engine",
    role: "Frontend Engineer",
    level: "Junior",
    timeLimit: 30,
    category: "State Querying & Data Pagination",
    description: `## 1. Studi Kasus
Di aplikasi e-commerce modern, pencarian dan pemfilteran katalog produk dilakukan melalui API backend yang mendukung **filtering** dan **pagination** untuk menghemat penggunaan bandwidth data.

Anda diminta membuat endpoint REST API Express.js untuk:
\`\`\`http
POST /api/products/search
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "query": "phone",
  "category": "ELECTRONICS",
  "page": 1,
  "limit": 2
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "data": [
    { "id": "P1", "name": "Smartphone X", "category": "ELECTRONICS", "price": 800 }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 1,
    "totalPages": 1
  }
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const catalog = [
  { id: "P1", name: "Smartphone X", category: "ELECTRONICS", price: 800 },
  { id: "P2", name: "Laptop Pro", category: "ELECTRONICS", price: 1500 },
  { id: "P3", name: "Wireless Headphones", category: "ELECTRONICS", price: 200 },
  { id: "P4", name: "Running Shoes", category: "FASHION", price: 120 },
  { id: "P5", name: "Denim Jacket", category: "FASHION", price: 90 }
];
\`\`\`

---

## 4. Requirement & Aturan Validasi
1. **Validasi Parameter Pagination**: \`page\` (default: 1) dan \`limit\` (default: 10). Jika \`page < 1\` atau \`limit < 1\` → \`HTTP 400\` *"Invalid pagination parameters"*.
2. **Filtering Kategori**: Jika \`category\` diisi, filter produk yang memiliki \`product.category === category\` (exact match).
3. **Filtering Keyword Search**: Jika \`query\` diisi, filter produk yang nama produknya mengandung substring \`query\` (case-insensitive search).
4. **Kalkulasi Metadata Pagination**:
   - \`totalItems\`: Jumlah total produk yang lolos filter.
   - \`totalPages\`: \`Math.ceil(totalItems / limit)\` (jika totalItems 0, totalPages = 0).
   - Slice data sesuai offset \`(page - 1) * limit\` hingga \`page * limit\`.
5. **Kembalikan Response**: \`HTTP 200\` dengan objek \`{ data: [...], pagination: { page, limit, totalItems, totalPages } }\`.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Debouncing vs Throttling pada Search Input Component**
> *Di bagian komentar kode solusi Anda, jelaskan perbedaan teknik optimization frontend:*
> - **Debouncing**: Penundaan eksekusi hingga user berhenti mengetik selama X ms (misal 300ms).
> - **Throttling**: Pengaturan eksekusi fungsi maksimal 1 kali setiap X ms.
> - Kapan waktu terbaik menggunakan Debouncing vs Throttling di aplikasi Web?
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const catalog = [
  { id: "P1", name: "Smartphone X", category: "ELECTRONICS", price: 800 },
  { id: "P2", name: "Laptop Pro", category: "ELECTRONICS", price: 1500 },
  { id: "P3", name: "Wireless Headphones", category: "ELECTRONICS", price: 200 },
  { id: "P4", name: "Running Shoes", category: "FASHION", price: 120 },
  { id: "P5", name: "Denim Jacket", category: "FASHION", price: 90 }
];

app.post('/api/products/search', (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.body;

  // TODO: Implementasi Logika Filter & Pagination
  // 1. Validasi page >= 1 dan limit >= 1 (HTTP 400 jika tidak valid)
  // 2. Filter catalog berdasarkan category (jika ada) dan query substring (case-insensitive)
  // 3. Hitung totalItems dan totalPages
  // 4. Potong (slice) data sesuai page & limit
  // 5. Kembalikan HTTP 200 dengan payload data dan pagination

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (Debouncing vs Throttling):
 *
 * 1. Debouncing Definition & Mechanism:
 *
 * 2. Throttling Definition & Mechanism:
 *
 * 3. Best Use Cases for Debouncing vs Throttling:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan teknik optimasi UI Debouncing vs Throttling pada input pencarian live search dan infinite scroll event handlers.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const catalog = [
  { id: "P1", name: "Smartphone X", category: "ELECTRONICS", price: 800 },
  { id: "P2", name: "Laptop Pro", category: "ELECTRONICS", price: 1500 },
  { id: "P3", name: "Wireless Headphones", category: "ELECTRONICS", price: 200 },
  { id: "P4", name: "Running Shoes", category: "FASHION", price: 120 },
  { id: "P5", name: "Denim Jacket", category: "FASHION", price: 90 }
];

app.post('/api/products/search', (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.body;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return res.status(400).json({ message: "Invalid pagination parameters" });
  }

  let filtered = [...catalog];

  if (category && typeof category === 'string') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  }

  const totalItems = filtered.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limitNum);

  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

  return res.status(200).json({
    data: paginatedData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages
    }
  });
});

/*
 * JAWABAN BONUS - DEBOUNCING VS THROTTLING:
 *
 * 1. DEBOUNCING:
 *    Mencegah pemanggilan fungsi berulang kali sampai jeda waktu tertentu setelah event terakhir terjadi (misal 300ms). Setiap tombol ditekan, timer di-reset.
 *    - Use Case: Live Search Input Bar, Auto-save form draft.
 *
 * 2. THROTTLING:
 *    Memastikan fungsi hanya dijalankan maksimal 1 kali dalam interval waktu yang ditentukan (misal 100ms), mengabaikan panggilan di tengah jeda.
 *    - Use Case: Window Resize Listener, Scroll Position Tracker (Infinite Scroll), Button Double Click Prevention.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "api-payload-schema-validator",
    title: "API Payload Schema & Type Assertion Engine",
    role: "QA Engineer",
    level: "Junior",
    timeLimit: 30,
    category: "API Automation & Schema Assertions",
    description: `## 1. Studi Kasus
Sebagai QA Automation Engineer atau Software Engineer in Test, Anda bertugas membuat API schema validator & test suite assertion untuk memvalidasi kontrak payload JSON (*request body*) sebelum diproses oleh downstream microservice.

Endpoint:
\`\`\`http
POST /test/validate-payload
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body Valid:
\`\`\`json
{
  "username": "dev_alex",
  "email": "alex@dev.com",
  "role": "ADMIN",
  "tags": ["js", "ts"]
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "valid": true,
  "message": "Payload schema validation passed"
}
\`\`\`

### Response Gagal Validasi (HTTP 400):
\`\`\`json
{
  "valid": false,
  "errors": [
    "username must be 3-20 alphanumeric characters",
    "role must be one of: ADMIN, USER, GUEST"
  ]
}
\`\`\`

---

## 3. Aturan Schema & Validasi
1. \`username\`: Harus bertipe string, panjang **3 hingga 20 karakter**, hanya boleh mengandung huruf, angka, dan underscore (\`^[a-zA-Z0-9_]{3,20}$\`).
2. \`email\`: Harus bertipe string dan mengandung karakter \`@\` dan \`.\`.
3. \`role\`: Harus bernilai salah satu dari enum berikut: \`"ADMIN"\`, \`"USER"\`, \`"GUEST"\`.
4. \`tags\`: Harus bertipe array, tidak boleh kosong (\`length > 0\`), dan seluruh elemennya bertipe string non-kosong.
5. Jika ada minimal 1 aturan yang melanggar → \`HTTP 400\` dengan \`{ valid: false, errors: [...] }\`.
6. Jika semua aturan sesuai → \`HTTP 200\` dengan \`{ valid: true, message: "Payload schema validation passed" }\`.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Metode Pengujian QA: Equivalence Partitioning & Boundary Value Analysis**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - **Equivalence Partitioning (EP)**: Pembagian input ke dalam kelas valid dan invalid.
> - **Boundary Value Analysis (BVA)**: Pengujian nilai batas (misal untuk username min 3, max 20, nilai apa saja yang harus diuji: 2, 3, 4, 19, 20, 21).
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED_ROLES = ["ADMIN", "USER", "GUEST"];

app.post('/test/validate-payload', (req, res) => {
  const { username, email, role, tags } = req.body;

  // TODO: Implementasi Schema Validator
  // 1. Inisialisasi array errors = []
  // 2. Validasi username (string 3-20 char alphanumeric & _)
  // 3. Validasi email (string dengan '@' dan '.')
  // 4. Validasi role (harus salah satu dari ALLOWED_ROLES)
  // 5. Validasi tags (array non-empty berisi string)
  // 6. Jika errors.length > 0 -> HTTP 400 { valid: false, errors }
  // 7. Jika valid -> HTTP 200 { valid: true, message: "Payload schema validation passed" }

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (EP & BVA Testing Techniques):
 *
 * 1. Equivalence Partitioning (EP):
 *
 * 2. Boundary Value Analysis (BVA) pada String Length (3-20 char):
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan teknik pengujian QA Boundary Value Analysis (BVA) & Equivalence Partitioning (EP) untuk menguji skenario batas sistem.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED_ROLES = ["ADMIN", "USER", "GUEST"];

app.post('/test/validate-payload', (req, res) => {
  const { username, email, role, tags } = req.body;
  const errors = [];

  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    errors.push("username must be 3-20 alphanumeric characters");
  }

  if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    errors.push("email must be a valid email address");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    errors.push("role must be one of: ADMIN, USER, GUEST");
  }

  if (!Array.isArray(tags) || tags.length === 0 || !tags.every(t => typeof t === 'string' && t.trim().length > 0)) {
    errors.push("tags must be a non-empty array of strings");
  }

  if (errors.length > 0) {
    return res.status(400).json({ valid: false, errors });
  }

  return res.status(200).json({
    valid: true,
    message: "Payload schema validation passed"
  });
});

/*
 * JAWABAN BONUS - QA EP & BVA TEST TECHNIQUES:
 *
 * 1. EQUIVALENCE PARTITIONING (EP):
 *    Membagi domain input ke dalam kelompok (partition) yang diperlakukan sama oleh sistem:
 *    - Valid Partition: username "dev_alex" (harus lolos).
 *    - Invalid Partition: username null, integer 12345, atau objek {} (harus ditolak).
 *
 * 2. BOUNDARY VALUE ANALYSIS (BVA):
 *    Kesalahan terbanyak terjadi pada batas nilai. Untuk rentang 3 s.d 20 karakter:
 *    - Test Case 1: Length = 2 (Min - 1) -> Invalid (Tolak)
 *    - Test Case 2: Length = 3 (Min Boundary) -> Valid (Terima)
 *    - Test Case 3: Length = 4 (Min + 1) -> Valid (Terima)
 *    - Test Case 4: Length = 19 (Max - 1) -> Valid (Terima)
 *    - Test Case 5: Length = 20 (Max Boundary) -> Valid (Terima)
 *    - Test Case 6: Length = 21 (Max + 1) -> Invalid (Tolak)
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "multi-tenant-feature-flag",
    title: "Multi-Tenant Feature Flag & Percentage Rollout Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Feature Toggles & Dynamic Configuration",
    description: `## 1. Studi Kasus
Dalam pengembangan aplikasi SaaS Multi-Tenant, **Feature Flags / Toggles** digunakan untuk merilis fitur baru secara bertahap (*Canary Release*), mengaktifkan eksperimen A/B testing, atau memberikan fitur khusus untuk tenant tertentu (VIP).

Anda diminta membuat endpoint REST API Express.js untuk:
\`\`\`http
POST /features/evaluate
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "tenantId": "tenant_acme",
  "userId": "user_42",
  "flagKey": "new_checkout_v2"
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "enabled": true,
  "reason": "TENANT_OVERRIDE"
}
\`\`\`

---

## 3. Data Awal In-Memory
\`\`\`javascript
const featureFlags = [
  {
    flagKey: "new_checkout_v2",
    enabled: true,
    rolloutPercentage: 50,
    tenantOverrides: {
      "tenant_acme": true,
      "tenant_beta": false
    }
  },
  {
    flagKey: "dark_mode",
    enabled: false,
    rolloutPercentage: 100,
    tenantOverrides: {}
  }
];
\`\`\`

---

## 4. Requirement & Aturan Evaluasi
1. **Validasi Payload**: Jika \`tenantId\`, \`userId\`, atau \`flagKey\` kosong → \`HTTP 400\` *"tenantId, userId, and flagKey are required"*.
2. **Cek Keberadaan Flag**: Jika \`flagKey\` tidak ada di array \`featureFlags\` → \`HTTP 404\` *"Feature flag not found"*.
3. **Hierarki Evaluasi 1 (Tenant Override)**:
   - Jika \`tenantId\` terdaftar di \`flag.tenantOverrides\` (boolean): Kembalikan \`HTTP 200\` dengan \`enabled\` bernilai override tersebut, dan \`reason: "TENANT_OVERRIDE"\`.
4. **Hierarki Evaluasi 2 (Global Toggle)**:
   - Jika \`flag.enabled === false\`: Kembalikan \`HTTP 200\` dengan \`enabled: false\` dan \`reason: "GLOBAL_TOGGLE"\`.
5. **Hierarki Evaluasi 3 (Percentage Rollout)**:
   - Hitung nilai hash deterministik dari \`userId\` (misal jumlah ASCII char code % 100).
   - Jika \`hashValue < flag.rolloutPercentage\`: Kembalikan \`enabled: true\`, \`reason: "PERCENTAGE_ROLLOUT"\`.
   - Selain itu: Kembalikan \`enabled: false\`, \`reason: "PERCENTAGE_ROLLOUT"\`.

---

## 5. Pertanyaan Bonus Konseptual 💡
> **Manajemen Feature Flag di Scaled Microservices**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - Penggunaan platform Feature Flag terpusat (seperti LaunchDarkly / Unleash).
> - Strategi caching di Redis & in-memory memory sync untuk evaluasi flag dengan latency sub-millisecond.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const featureFlags = [
  {
    flagKey: "new_checkout_v2",
    enabled: true,
    rolloutPercentage: 50,
    tenantOverrides: {
      "tenant_acme": true,
      "tenant_beta": false
    }
  },
  {
    flagKey: "dark_mode",
    enabled: false,
    rolloutPercentage: 100,
    tenantOverrides: {}
  }
];

app.post('/features/evaluate', (req, res) => {
  const { tenantId, userId, flagKey } = req.body;

  // TODO: Implementasi Evaluasi Feature Flag
  // 1. Validasi kelengkapan body (tenantId, userId, flagKey) -> HTTP 400
  // 2. Cari flag berdasarkan flagKey -> HTTP 404 jika tidak ada
  // 3. Evaluasi Tenant Override (jika tenantId ada di tenantOverrides) -> reason: TENANT_OVERRIDE
  // 4. Evaluasi Global Toggle (jika enabled === false) -> reason: GLOBAL_TOGGLE
  // 5. Evaluasi Rollout Percentage berdasarkan hash userId -> reason: PERCENTAGE_ROLLOUT

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (Feature Flags at Scale):
 *
 * 1. Enterprise Feature Flag Platforms (Unleash / LaunchDarkly):
 *
 * 2. Low-Latency Caching & In-Memory Sync Strategies:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan strategi manajemen Feature Flags pada arsitektur Microservices (LaunchDarkly, Unleash, Redis caching, dan zero-downtime canary deployment).",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const featureFlags = [
  {
    flagKey: "new_checkout_v2",
    enabled: true,
    rolloutPercentage: 50,
    tenantOverrides: {
      "tenant_acme": true,
      "tenant_beta": false
    }
  },
  {
    flagKey: "dark_mode",
    enabled: false,
    rolloutPercentage: 100,
    tenantOverrides: {}
  }
];

function getUserIdHash(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash += userId.charCodeAt(i);
  }
  return hash % 100;
}

app.post('/features/evaluate', (req, res) => {
  const { tenantId, userId, flagKey } = req.body;

  if (!tenantId || !userId || !flagKey) {
    return res.status(400).json({ message: "tenantId, userId, and flagKey are required" });
  }

  const flag = featureFlags.find(f => f.flagKey === flagKey);
  if (!flag) {
    return res.status(404).json({ message: "Feature flag not found" });
  }

  if (flag.tenantOverrides && tenantId in flag.tenantOverrides) {
    return res.status(200).json({
      enabled: Boolean(flag.tenantOverrides[tenantId]),
      reason: "TENANT_OVERRIDE"
    });
  }

  if (!flag.enabled) {
    return res.status(200).json({
      enabled: false,
      reason: "GLOBAL_TOGGLE"
    });
  }

  const userHash = getUserIdHash(String(userId));
  const isEnabled = userHash < flag.rolloutPercentage;

  return res.status(200).json({
    enabled: isEnabled,
    reason: "PERCENTAGE_ROLLOUT"
  });
});

/*
 * JAWABAN BONUS - FEATURE FLAGS AT SCALE:
 *
 * 1. PLATFORM CENTRALIZED FEATURE FLAGS:
 *    Platform seperti LaunchDarkly atau Unleash menyediakan Dashboard GUI bagi Product Manager/DevOps untuk mengontrol fitur tanpa perlu redeploy kode. SDK terhubung via Streaming WebSocket/SSE untuk menerima pembaruan flag secara instan.
 *
 * 2. LOW-LATENCY CACHING STRATEGY:
 *    Untuk menghindari panggilan database pada setiap HTTP request, SDK menyimpan aturan flag di Local Memory (O(1) lookup). Ketika ada perubahan flag di Dashboard, event Pub/Sub (Redis / SSE) memperbarui cache lokal server secara otomatis tanpa Downtime.
 */

module.exports = app;`,
    testCases: []
  }
];



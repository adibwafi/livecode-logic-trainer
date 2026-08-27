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
  },
  {
    id: "docker-healthcheck-api",
    title: "Container Health Check & Readiness Probe API",
    role: "DevOps Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Container Orchestration & Observability",
    description: `## 1. Studi Kasus
Dalam ekosistem Kubernetes dan Docker, setiap service container **wajib** mengekspos endpoint health check agar orkestrator dapat menentukan apakah pod siap menerima traffic (Readiness Probe) atau masih bisa dijalankan (Liveness Probe).

Anda diminta membuat dua endpoint health check untuk Express.js API:
\`\`\`http
POST /health      — Liveness Probe (apakah container masih hidup?)
POST /readiness   — Readiness Probe (apakah container siap menerima request?)
\`\`\`

---

## 2. Spesifikasi Input & Output

### POST /health — Liveness Probe

#### Response Sehat (HTTP 200):
\`\`\`json
{
  "status": "UP",
  "uptime": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

#### Response Tidak Sehat (HTTP 503) — saat \`forceUnhealthy: true\` di body:
\`\`\`json
{
  "status": "DOWN",
  "error": "Application is in an unhealthy state"
}
\`\`\`

### POST /readiness — Readiness Probe

#### Response Ready (HTTP 200):
\`\`\`json
{
  "status": "READY",
  "checks": {
    "database": "UP",
    "cache": "UP"
  }
}
\`\`\`

#### Response Not Ready (HTTP 503) — saat \`dbStatus: "DOWN"\` di body:
\`\`\`json
{
  "status": "NOT_READY",
  "checks": {
    "database": "DOWN",
    "cache": "UP"
  }
}
\`\`\`

---

## 3. Requirement & Aturan Validasi

### Endpoint \`/health\` (Liveness):
1. Jika request body mengandung \`{ forceUnhealthy: true }\` → kembalikan \`HTTP 503\` dengan status \`"DOWN"\`.
2. Dalam kondisi normal → kembalikan \`HTTP 200\` dengan \`{ status: "UP", uptime: process.uptime(), timestamp: new Date().toISOString() }\`.

### Endpoint \`/readiness\` (Readiness):
1. Terima parameter \`dbStatus\` dan \`cacheStatus\` dari request body (default keduanya \`"UP"\`).
2. Jika salah satu status bernilai \`"DOWN"\` → kembalikan \`HTTP 503\` dengan status \`"NOT_READY"\`.
3. Jika keduanya \`"UP"\` → kembalikan \`HTTP 200\` dengan status \`"READY"\`.

---

## 4. Pertanyaan Bonus Konseptual 💡
> **Kubernetes Probes: Liveness vs Readiness vs Startup**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - **Liveness Probe**: Kapan Kubernetes merestart container (loop/deadlock)?
> - **Readiness Probe**: Kapan Kubernetes mengalihkan traffic dari pod?
> - **Startup Probe**: Mengapa dibutuhkan untuk aplikasi dengan startup time lama?
> - Konfigurasi YAML Kubernetes untuk ketiga probe ini.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// Simulasi status dependency
// Dalam production, ini akan mengecek koneksi database/cache nyata

app.post('/health', (req, res) => {
  const { forceUnhealthy } = req.body;

  // TODO: Implementasi Liveness Probe
  // 1. Jika forceUnhealthy === true -> HTTP 503 dengan status "DOWN"
  // 2. Kondisi normal -> HTTP 200 dengan status "UP", uptime, timestamp

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

app.post('/readiness', (req, res) => {
  const { dbStatus = 'UP', cacheStatus = 'UP' } = req.body;

  // TODO: Implementasi Readiness Probe
  // 1. Cek status semua dependency (database, cache)
  // 2. Jika salah satu DOWN -> HTTP 503 dengan status "NOT_READY"
  // 3. Jika semua UP -> HTTP 200 dengan status "READY"

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (Kubernetes Probes):
 *
 * 1. Liveness Probe — Restart Container:
 *
 * 2. Readiness Probe — Redirect Traffic:
 *
 * 3. Startup Probe — Slow Start Apps:
 *
 * 4. Kubernetes YAML Configuration:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan perbedaan Kubernetes Liveness, Readiness, dan Startup Probe beserta konfigurasi YAML dan use case production-nya.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/health', (req, res) => {
  const { forceUnhealthy } = req.body;

  if (forceUnhealthy === true) {
    return res.status(503).json({
      status: "DOWN",
      error: "Application is in an unhealthy state"
    });
  }

  return res.status(200).json({
    status: "UP",
    uptime: process.uptime ? process.uptime() : 0,
    timestamp: new Date().toISOString()
  });
});

app.post('/readiness', (req, res) => {
  const { dbStatus = 'UP', cacheStatus = 'UP' } = req.body;

  const checks = {
    database: dbStatus,
    cache: cacheStatus
  };

  const isReady = Object.values(checks).every(s => s === 'UP');

  if (!isReady) {
    return res.status(503).json({
      status: "NOT_READY",
      checks
    });
  }

  return res.status(200).json({
    status: "READY",
    checks
  });
});

/*
 * JAWABAN BONUS — KUBERNETES PROBES:
 *
 * 1. LIVENESS PROBE:
 *    Kubernetes mengirim request ke /health secara periodik.
 *    Jika container merespons HTTP 5xx atau tidak merespons (timeout),
 *    Kubernetes merestart container untuk memulihkan dari deadlock atau memory corruption.
 *
 * 2. READINESS PROBE:
 *    Kubernetes mengirim request ke /readiness sebelum mengalihkan traffic.
 *    Jika pod belum siap (koneksi DB belum established, warming up cache),
 *    Kubernetes mengeluarkan pod dari load balancer sehingga tidak ada request yang diarahkan ke pod tersebut.
 *
 * 3. STARTUP PROBE:
 *    Untuk aplikasi yang membutuhkan waktu startup lama (misal JVM app, ML model loading),
 *    Startup Probe memberikan window waktu yang lebih panjang sebelum Liveness Probe aktif,
 *    mencegah Kubernetes merestart container yang masih dalam proses inisialisasi.
 *
 * 4. KONFIGURASI YAML KUBERNETES:
 *    livenessProbe:
 *      httpGet:
 *        path: /health
 *        port: 3000
 *      initialDelaySeconds: 10
 *      periodSeconds: 10
 *      failureThreshold: 3
 *    readinessProbe:
 *      httpGet:
 *        path: /readiness
 *        port: 3000
 *      initialDelaySeconds: 5
 *      periodSeconds: 5
 *      failureThreshold: 2
 *    startupProbe:
 *      httpGet:
 *        path: /health
 *        port: 3000
 *      failureThreshold: 30
 *      periodSeconds: 10
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "cicd-pipeline-gate",
    title: "CI/CD Quality Gate & Automated Deploy Guard",
    role: "DevOps Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "CI/CD Automation & Quality Assurance",
    description: `## 1. Studi Kasus
Dalam pipeline CI/CD modern (GitHub Actions, GitLab CI, Jenkins), setiap deployment ke environment \`production\` atau \`staging\` harus melewati **Quality Gate** otomatis. Quality Gate memastikan bahwa kode yang akan di-deploy memenuhi standar minimum: test coverage, build status, dan kondisi branch yang diizinkan.

Anda diminta membuat endpoint REST API Express.js sebagai Quality Gate engine:
\`\`\`http
POST /pipeline/gate
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "branch": "main",
  "buildStatus": "SUCCESS",
  "coverage": 85,
  "environment": "production"
}
\`\`\`

### Response Approved (HTTP 200):
\`\`\`json
{
  "approved": true,
  "environment": "production",
  "checks": {
    "branch": "PASS",
    "build": "PASS",
    "coverage": "PASS"
  },
  "message": "All quality gates passed. Deployment approved."
}
\`\`\`

### Response Blocked (HTTP 422):
\`\`\`json
{
  "approved": false,
  "environment": "production",
  "checks": {
    "branch": "PASS",
    "build": "PASS",
    "coverage": "FAIL"
  },
  "failureReasons": ["Coverage 45% is below minimum threshold of 80%"]
}
\`\`\`

---

## 3. Requirement & Aturan Validasi

1. **Validasi Payload**: Jika \`branch\`, \`buildStatus\`, \`coverage\`, atau \`environment\` tidak diisi → \`HTTP 400\` *"Missing required pipeline parameters"*.

2. **Gate 1 — Branch Protection** (environment \`production\` saja):
   - Hanya branch \`main\` atau \`master\` yang boleh deploy ke production.
   - Branch lain → \`HTTP 422\` dengan \`checks.branch: "FAIL"\` dan reason *"Only main/master branch can deploy to production"*.

3. **Gate 2 — Build Status Check**:
   - Hanya \`buildStatus === "SUCCESS"\` yang diizinkan.
   - Status lain (FAILED, RUNNING, CANCELLED) → \`HTTP 422\` dengan \`checks.build: "FAIL"\`.

4. **Gate 3 — Coverage Threshold**:
   - Minimum coverage **80%** untuk environment \`production\`, **60%** untuk \`staging\`.
   - Jika \`coverage\` di bawah threshold → \`HTTP 422\` dengan \`checks.coverage: "FAIL"\`.

5. **Semua Gate Lulus**: Kembalikan \`HTTP 200\` dengan \`approved: true\`.

---

## 4. Pertanyaan Bonus Konseptual 💡
> **GitOps & Deployment Strategies**
> *Di bagian komentar kode solusi Anda, jelaskan:*
> - **Blue-Green Deployment**: Cara mengurangi downtime dengan dua environment identik.
> - **Canary Deployment**: Cara merilis fitur ke sebagian kecil user (misal 5%) sebelum full rollout.
> - **Feature Flags sebagai Safety Valve**: Cara menonaktifkan fitur bermasalah di production tanpa redeploy.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// Quality Gate Configuration
const COVERAGE_THRESHOLDS = {
  production: 80,
  staging: 60,
  development: 0
};

const PROTECTED_BRANCHES = ['main', 'master'];

app.post('/pipeline/gate', (req, res) => {
  const { branch, buildStatus, coverage, environment } = req.body;

  // TODO: Implementasi CI/CD Quality Gate Engine
  // 1. Validasi payload lengkap (HTTP 400 jika ada yang kosong)
  // 2. Gate 1: Cek branch protection untuk production (HTTP 422 jika gagal)
  // 3. Gate 2: Cek build status harus "SUCCESS" (HTTP 422 jika gagal)
  // 4. Gate 3: Cek coverage >= threshold sesuai environment (HTTP 422 jika gagal)
  // 5. Jika semua gate lulus -> HTTP 200 approved: true

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

/*
 * JAWABAN PERTANYAAN BONUS (GitOps & Deployment Strategies):
 *
 * 1. Blue-Green Deployment:
 *
 * 2. Canary Deployment:
 *
 * 3. Feature Flags sebagai Safety Valve:
 */

module.exports = app;
`,
    bonusQuestion: "Jelaskan strategi Blue-Green Deployment, Canary Release, dan penggunaan Feature Flags sebagai mekanisme rollback instan di production.",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const COVERAGE_THRESHOLDS = {
  production: 80,
  staging: 60,
  development: 0
};

const PROTECTED_BRANCHES = ['main', 'master'];

app.post('/pipeline/gate', (req, res) => {
  const { branch, buildStatus, coverage, environment } = req.body;

  // 1. Validasi Payload
  if (!branch || !buildStatus || coverage === undefined || coverage === null || !environment) {
    return res.status(400).json({ message: "Missing required pipeline parameters" });
  }

  const checks = { branch: 'PASS', build: 'PASS', coverage: 'PASS' };
  const failureReasons = [];
  const threshold = COVERAGE_THRESHOLDS[environment] ?? 80;

  // 2. Gate 1: Branch Protection (hanya untuk production)
  if (environment === 'production' && !PROTECTED_BRANCHES.includes(branch)) {
    checks.branch = 'FAIL';
    failureReasons.push(\`Only main/master branch can deploy to production. Current branch: "\${branch}"\`);
  }

  // 3. Gate 2: Build Status
  if (buildStatus !== 'SUCCESS') {
    checks.build = 'FAIL';
    failureReasons.push(\`Build status is "\${buildStatus}". Only SUCCESS builds can be deployed.\`);
  }

  // 4. Gate 3: Coverage Threshold
  const coverageNum = Number(coverage);
  if (isNaN(coverageNum) || coverageNum < threshold) {
    checks.coverage = 'FAIL';
    failureReasons.push(\`Coverage \${coverageNum}% is below minimum threshold of \${threshold}% for \${environment}\`);
  }

  // 5. Evaluasi Final
  if (failureReasons.length > 0) {
    return res.status(422).json({
      approved: false,
      environment,
      checks,
      failureReasons
    });
  }

  return res.status(200).json({
    approved: true,
    environment,
    checks,
    message: "All quality gates passed. Deployment approved."
  });
});

/*
 * JAWABAN BONUS — DEPLOYMENT STRATEGIES & GITOPS:
 *
 * 1. BLUE-GREEN DEPLOYMENT:
 *    Maintain dua environment identik: "Blue" (production aktif) dan "Green" (versi baru).
 *    Deploy versi baru ke Green, jalankan smoke test, lalu alihkan load balancer dari Blue ke Green secara instan.
 *    Jika ada masalah, rollback hanya perlu mengalihkan traffic kembali ke Blue (zero-downtime rollback).
 *
 * 2. CANARY DEPLOYMENT:
 *    Deploy versi baru hanya ke sebagian kecil pod/server (misal 5%).
 *    Monitor error rate, latency, dan business metrics selama beberapa menit/jam.
 *    Jika sehat, secara bertahap naikkan persentase traffic (5% -> 25% -> 100%).
 *    Jika ada anomali, rollback hanya mengurangi persentase canary ke 0%.
 *    Tools: Kubernetes Argo Rollouts, Flagger, NGINX weighted routing.
 *
 * 3. FEATURE FLAGS SEBAGAI SAFETY VALVE:
 *    Deploy kode baru dengan fitur dinonaktifkan via Feature Flag (flag.enabled = false).
 *    Aktifkan fitur secara bertahap melalui dashboard Feature Flag (LaunchDarkly/Unleash) TANPA redeploy.
 *    Jika fitur bermasalah di production, nonaktifkan flag secara instan — rollback dalam hitungan detik.
 *    Ideal untuk: A/B Testing, Canary Feature Release, Dark Launch, Emergency Kill Switch.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "happyfresh-cart-engine",
    title: "🛒 HappyFresh: Complex Cart & Promo Calculation Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "E-Grocery Promo Engine & Basket Calculations",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🛒 1. Studi Kasus
Di HappyFresh, mesin kalkulasi keranjang belanja memproses ribuan keranjang per menit dari mitra supermarket (Super Indo, Grand Lucky, Lotte Mart).

Ketika pelanggan melakukan checkout, sistem harus menghitung subtotal, memfilter item yang habis (**Out-of-Stock / OOS**), dan mengevaluasi aturan promo promosi yang berlaku. Karena promosi bersifat **non-stackable (mutually exclusive)**, sistem harus memilih **satu promosi dengan nilai diskon tertinggi** untuk pelanggan.

Anda diminta membuat logika endpoint REST API Express.js untuk:
\`\`\`http
POST /cart/calculate
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "items": [
    { "id": "1", "name": "Greenfields Fresh Milk 1L", "category": "Dairy", "price": 35000, "quantity": 2, "inStock": true },
    { "id": "2", "name": "Indomilk UHT Chocolate 1L", "category": "Dairy", "price": 20000, "quantity": 1, "inStock": false },
    { "id": "3", "name": "Wagyu Beef Ribeye 200g", "category": "Meat", "price": 250000, "quantity": 1, "inStock": true }
  ],
  "promoRules": [
    { "id": "promo-dairy-10", "name": "10% Off Dairy", "type": "CATEGORY_PERCENTAGE", "category": "Dairy", "discountPercentage": 10 },
    { "id": "promo-flat-50k", "name": "Rp 50k Off Orders > Rp 300k", "type": "MIN_SPEND_FLAT", "minSpend": 300000, "discountAmount": 50000 }
  ]
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "subtotal": 320000,
  "discount": 50000,
  "total": 270000,
  "appliedPromo": {
    "id": "promo-flat-50k",
    "name": "Rp 50k Off Orders > Rp 300k",
    "type": "MIN_SPEND_FLAT",
    "minSpend": 300000,
    "discountAmount": 50000
  },
  "outOfStockItems": [
    { "id": "2", "name": "Indomilk UHT Chocolate 1L", "category": "Dairy", "price": 20000, "quantity": 1, "inStock": false }
  ]
}
\`\`\`

---

## 3. Requirement & Aturan Bisnis
1. **Validasi Request**:
   - Jika \`items\` bukan array atau tidak disertakan, kembalikan \`HTTP 400\` dengan \`{ "error": "Invalid items array" }\`.
2. **Filter Out-of-Stock (OOS)**:
   - Item dengan \`inStock === false\` tidak boleh dimasukkan ke dalam perhitungan subtotal atau promo. Item OOS harus dikumpulkan ke dalam array \`outOfStockItems\`.
3. **Kalkulasi Subtotal**:
   - Subtotal dihitung dari \`sum(price * quantity)\` untuk semua item yang in-stock (\`inStock === true\`).
4. **Evaluasi Promo Rules**:
   - \`CATEGORY_PERCENTAGE\`: Diskon \`discountPercentage%\` untuk item dalam kategori terkait. Jika ada \`maxDiscount\`, diskon tidak boleh melebihi nilai cap tersebut.
   - \`MIN_SPEND_FLAT\`: Diskon tetap \`discountAmount\` jika \`subtotal >= minSpend\`.
5. **Best-Value Promo Selection (Non-Stacking)**:
   - Bandingkan semua promo yang memenuhi syarat. Ambil **satu promo dengan nilai potongan terbesar**.
   - Jika tidak ada promo yang berlaku atau \`promoRules\` kosong, \`discount: 0\` dan \`appliedPromo: null\`.
6. **Total**:
   - \`total = max(0, subtotal - discount)\`.`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// POST /cart/calculate
app.post('/cart/calculate', (req, res) => {
  const { items, promoRules = [] } = req.body;

  // TODO: 1. Validasi items array (HTTP 400 jika invalid)
  // TODO: 2. Pisahkan in-stock vs out-of-stock items
  // TODO: 3. Hitung subtotal in-stock items
  // TODO: 4. Evaluasi promo rules dan pilih promo dengan potongan terbesar (non-stackable)
  // TODO: 5. Hitung total = subtotal - discount

  return res.status(200).json({
    subtotal: 0,
    discount: 0,
    total: 0,
    appliedPromo: null,
    outOfStockItems: []
  });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menangani promo multi-tier (misal diskon bertingkat Rp 20rb min 150rb, Rp 50rb min 300rb) dan flash-sale item pricing dengan ACID transaction di PostgreSQL?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/cart/calculate', (req, res) => {
  const { items, promoRules = [] } = req.body;

  // 1. Validasi items array
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid items array" });
  }

  // 2. Filter in-stock vs out-of-stock
  const inStockItems = [];
  const outOfStockItems = [];

  for (const item of items) {
    if (item.inStock === true && (item.quantity || 0) > 0 && (item.price || 0) >= 0) {
      inStockItems.push(item);
    } else {
      outOfStockItems.push(item);
    }
  }

  // 3. Hitung Subtotal
  const subtotal = inStockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 4. Evaluasi Promosi (Best-Value Rule)
  let bestDiscount = 0;
  let appliedPromo = null;

  if (Array.isArray(promoRules)) {
    for (const rule of promoRules) {
      let currentDiscount = 0;

      if (rule.type === 'CATEGORY_PERCENTAGE') {
        const eligibleCategoryTotal = inStockItems
          .filter(item => item.category?.toLowerCase() === rule.category?.toLowerCase())
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);

        currentDiscount = Math.round((eligibleCategoryTotal * (rule.discountPercentage || 0)) / 100);
        if (rule.maxDiscount && currentDiscount > rule.maxDiscount) {
          currentDiscount = rule.maxDiscount;
        }
      } else if (rule.type === 'MIN_SPEND_FLAT') {
        if (subtotal >= (rule.minSpend || 0)) {
          currentDiscount = rule.discountAmount || 0;
        }
      }

      if (currentDiscount > bestDiscount) {
        bestDiscount = currentDiscount;
        appliedPromo = rule;
      }
    }
  }

  // Discount tidak boleh melebihi subtotal
  const finalDiscount = Math.min(bestDiscount, subtotal);
  const total = Math.max(0, subtotal - finalDiscount);

  return res.status(200).json({
    subtotal,
    discount: finalDiscount,
    total,
    appliedPromo,
    outOfStockItems
  });
});

/*
 * JAWABAN BONUS — POSTGRESQL TRANSACTION & PROMO ENGINE:
 * 1. ACID TRANSACTIONS: Gunakan 'SELECT ... FOR UPDATE' pada tabel flash_sale_inventory
 *    untuk lock row stok saat checkout agar tidak terjadi overselling.
 * 2. PROMO REDEMPTION LEDGER: Catat voucher_redemptions dengan Unique Constraint (user_id, promo_id)
 *    untuk mencegah race-condition double dip promo.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "happyfresh-slot-reservation",
    title: "🚚 HappyFresh: Delivery Slot Reservation & Anti-Overbooking",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Concurrency, Queue Simulation & Dispatch Slots",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🚚 1. Studi Kasus
Slot pengantaran kurir van HappyFresh (misal \`10:00 - 12:00\`) memiliki kapasitas armada terbatas (misal 2 pesanan per slot). Pada jam sibuk, ratusan pesanan masuk bersamaan. 

Sistem reservasi slot harus memproses permintaan secara kronologis (berdasarkan \`timestamp\`), mencegah overbooking (\`SLOT_FULL\`), memvalidasi slot (\`SLOT_NOT_FOUND\`), mencegah klaim ganda oleh user yang sama (\`DUPLICATE_USER_IN_SLOT\`), dan menghasilkan laporan utilisasi slot.

Anda diminta membuat logika endpoint REST API Express.js untuk:
\`\`\`http
POST /slots/reserve
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "availableSlots": [
    { "id": "SLOT-08-10", "startTime": "08:00", "endTime": "10:00", "capacity": 2 },
    { "id": "SLOT-10-12", "startTime": "10:00", "endTime": "12:00", "capacity": 3 }
  ],
  "bookingRequests": [
    { "requestId": "req-3", "userId": "user-C", "slotId": "SLOT-08-10", "timestamp": 1700000030 },
    { "requestId": "req-1", "userId": "user-A", "slotId": "SLOT-08-10", "timestamp": 1700000010 },
    { "requestId": "req-2", "userId": "user-B", "slotId": "SLOT-08-10", "timestamp": 1700000020 }
  ]
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "confirmedBookings": [
    { "requestId": "req-1", "userId": "user-A", "slotId": "SLOT-08-10", "bookedAt": 1700000010 },
    { "requestId": "req-2", "userId": "user-B", "slotId": "SLOT-08-10", "bookedAt": 1700000020 }
  ],
  "failedBookings": [
    { "requestId": "req-3", "userId": "user-C", "slotId": "SLOT-08-10", "reason": "SLOT_FULL", "timestamp": 1700000030 }
  ],
  "slotUtilization": {
    "SLOT-08-10": { "capacity": 2, "bookedCount": 2, "remainingCapacity": 0 },
    "SLOT-10-12": { "capacity": 3, "bookedCount": 0, "remainingCapacity": 3 }
  }
}
\`\`\`

---

## 3. Requirement & Aturan Validasi
1. **Validasi Request**: Jika \`availableSlots\` atau \`bookingRequests\` bukan array, kembalikan \`HTTP 400\`.
2. **Urutan Kronologis**: Urutkan \`bookingRequests\` berdasarkan \`timestamp\` secara ascending (terlama ke terbaru).
3. **Pencegahan Overbooking**: Jika slot sudah mencapai kapasitas, permintaan berikutnya ditolak dengan \`reason: "SLOT_FULL"\`.
4. **Slot Tidak Ada**: Jika \`slotId\` tidak terdaftar di \`availableSlots\`, tolak dengan \`reason: "SLOT_NOT_FOUND"\`.
5. **Klaim Ganda**: Jika \`userId\` yang sama mencoba memesan slot yang sama lebih dari 1x, tolak dengan \`reason: "DUPLICATE_USER_IN_SLOT"\`.
6. **Laporan Utilisasi**: Kembalikan ringkasan kapasitas & sisa kuota untuk setiap slot di \`slotUtilization\`.`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// POST /slots/reserve
app.post('/slots/reserve', (req, res) => {
  const { availableSlots, bookingRequests } = req.body;

  // TODO: 1. Validasi request body (HTTP 400 jika invalid)
  // TODO: 2. Urutkan bookingRequests secara kronologis (timestamp asc)
  // TODO: 3. Lakukan proses booking, catat confirmed & failed
  // TODO: 4. Hitung utilisasi slot

  return res.status(200).json({
    confirmedBookings: [],
    failedBookings: [],
    slotUtilization: {}
  });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menangani distributed lock pada Redis Redlock atau PostgreSQL Advisory Lock untuk ribuan konkurensi reservasi slot pengantaran?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/slots/reserve', (req, res) => {
  const { availableSlots, bookingRequests } = req.body;

  // 1. Validasi
  if (!Array.isArray(availableSlots) || !Array.isArray(bookingRequests)) {
    return res.status(400).json({ error: "Invalid availableSlots or bookingRequests array" });
  }

  // Inisialisasi peta slot dan user tracking
  const slotMap = new Map();
  const slotBookedUsers = new Map(); // slotId -> Set<userId>

  for (const slot of availableSlots) {
    slotMap.set(slot.id, {
      capacity: slot.capacity || 0,
      bookedCount: 0,
      remainingCapacity: slot.capacity || 0
    });
    slotBookedUsers.set(slot.id, new Set());
  }

  // 2. Sort requests secara kronologis (timestamp asc)
  const sortedRequests = [...bookingRequests].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const confirmedBookings = [];
  const failedBookings = [];

  // 3. Proses requests
  for (const reqItem of sortedRequests) {
    const { requestId, userId, slotId, timestamp } = reqItem;
    const slotInfo = slotMap.get(slotId);

    // Kasus 1: Slot tidak ditemukan
    if (!slotInfo) {
      failedBookings.push({
        requestId,
        userId,
        slotId,
        reason: "SLOT_NOT_FOUND",
        timestamp
      });
      continue;
    }

    // Kasus 2: Duplicate booking oleh user yang sama di slot yang sama
    const userSet = slotBookedUsers.get(slotId);
    if (userSet.has(userId)) {
      failedBookings.push({
        requestId,
        userId,
        slotId,
        reason: "DUPLICATE_USER_IN_SLOT",
        timestamp
      });
      continue;
    }

    // Kasus 3: Slot sudah penuh
    if (slotInfo.bookedCount >= slotInfo.capacity) {
      failedBookings.push({
        requestId,
        userId,
        slotId,
        reason: "SLOT_FULL",
        timestamp
      });
      continue;
    }

    // Sukses: Konfirmasi booking
    slotInfo.bookedCount += 1;
    slotInfo.remainingCapacity = slotInfo.capacity - slotInfo.bookedCount;
    userSet.add(userId);

    confirmedBookings.push({
      requestId,
      userId,
      slotId,
      bookedAt: timestamp
    });
  }

  // 4. Bangun slotUtilization object
  const slotUtilization = {};
  slotMap.forEach((info, id) => {
    slotUtilization[id] = {
      capacity: info.capacity,
      bookedCount: info.bookedCount,
      remainingCapacity: info.remainingCapacity
    };
  });

  return res.status(200).json({
    confirmedBookings,
    failedBookings,
    slotUtilization
  });
});

/*
 * JAWABAN BONUS — DISTRIBUTED LOCKS:
 * 1. REDIS REDLOCK: Gunakan SET slot_lock:{slotId} my_random_token NX PX 5000
 *    sebelum memverifikasi dan mendeskresi kuota slot di Redis.
 * 2. POSTGRESQL ADVISORY LOCK: pg_try_advisory_xact_lock(hashtext('slot_' || slot_id))
 *    untuk lock non-blocking spesifik slot selama transaksi database.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "happyfresh-item-substitution",
    title: "🥦 HappyFresh: Picker Item Substitution Scoring Engine",
    role: "Frontend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Data Transformation, Search & Heuristic Scoring",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🥦 1. Studi Kasus
Ketika personal shopper (Picker) HappyFresh di supermarket menemukan item kosong di rak (Out-of-Stock), aplikasi picker harus merekomendasikan produk alternatif terbaik kepada pelanggan secara instan.

Rekomendasi dihitung menggunakan sistem scoring berbasis aturan:
- **Kategori Sama Tepat**: **+50 poin** (case-insensitive).
- **Harga dalam Rentang ±10%**: **+30 poin** (rentang \`[targetPrice * 0.9, targetPrice * 1.1]\`).
- **Brand / Merek Sama**: **+20 poin** (case-insensitive).

Anda diminta membuat logika endpoint REST API Express.js untuk:
\`\`\`http
POST /items/substitute
\`\`\`

---

## 2. Spesifikasi Input & Output

### Request Body:
\`\`\`json
{
  "targetItem": {
    "id": "target-1",
    "name": "Indomilk UHT Chocolate 1L",
    "category": "Dairy",
    "brand": "Indomilk",
    "price": 20000
  },
  "catalog": [
    { "id": "p-1", "name": "Ultra Milk Chocolate 1L", "category": "Dairy", "brand": "Ultra Jaya", "price": 21000, "inStock": true },
    { "id": "p-2", "name": "Indomilk UHT Vanilla 1L", "category": "Dairy", "brand": "Indomilk", "price": 20000, "inStock": true },
    { "id": "p-3", "name": "Indomilk Sweetened Condensed Milk 370g", "category": "Canned Goods", "brand": "Indomilk", "price": 14000, "inStock": true }
  ],
  "minScoreThreshold": 50
}
\`\`\`

### Response Berhasil (HTTP 200):
\`\`\`json
{
  "substitute": {
    "id": "p-2",
    "name": "Indomilk UHT Vanilla 1L",
    "category": "Dairy",
    "brand": "Indomilk",
    "price": 20000,
    "inStock": true
  },
  "score": 100,
  "matchReasons": [
    "Exact Category Match (+50)",
    "Price Proximity Match (+30)",
    "Brand Match (+20)"
  ]
}
\`\`\`

---

## 3. Requirement & Aturan Scoring
1. **Validasi Request**: Jika \`targetItem\` atau \`catalog\` bukan objek/array yang valid, kembalikan \`HTTP 400\`.
2. **Filter Eksklusi**:
   - Produk dengan \`inStock === false\` tidak boleh dipilih.
   - Produk target itu sendiri (matching \`id\`) tidak boleh direkomendasikan.
3. **Ambang Batas (Threshold)**:
   - Default \`minScoreThreshold\` adalah **50**.
   - Jika tidak ada kandidat yang mencapai skor minimal, kembalikan \`{ "substitute": null, "score": 0, "matchReasons": [] }\`.
4. **Tie-Breaker Deterministik**:
   - Jika ada produk dengan skor tertinggi yang sama:
     1. Pilih produk dengan **selisih harga terkecil** (\`Math.abs(price - targetPrice)\`).
     2. Jika selisih harga sama, pilih produk dengan **nama urutan alfabetik pertama** (\`localeCompare\`).`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// POST /items/substitute
app.post('/items/substitute', (req, res) => {
  const { targetItem, catalog, minScoreThreshold = 50 } = req.body;

  // TODO: 1. Validasi input
  // TODO: 2. Filter in-stock catalog & exclude targetItem.id
  // TODO: 3. Hitung score: Category (+50), Price ±10% (+30), Brand (+20)
  // TODO: 4. Terapkan tie-breaker & threshold

  return res.status(200).json({
    substitute: null,
    score: 0,
    matchReasons: []
  });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara mengoptimalkan pencarian substitusi produk di jutaan SKU katalog e-grocery menggunakan Vector Search (pgvector / embeddings)?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/items/substitute', (req, res) => {
  const { targetItem, catalog, minScoreThreshold = 50 } = req.body;

  if (!targetItem || !Array.isArray(catalog)) {
    return res.status(400).json({ error: "Invalid targetItem or catalog" });
  }

  const targetPrice = targetItem.price || 0;
  const minPrice = targetPrice * 0.9;
  const maxPrice = targetPrice * 1.1;

  let bestCandidate = null;
  let highestScore = -1;
  let bestReasons = [];

  for (const product of catalog) {
    // Eksklusi item OOS dan targetItem itu sendiri
    if (!product.inStock || product.id === targetItem.id) {
      continue;
    }

    let score = 0;
    const reasons = [];

    // 1. Category match (+50)
    if (product.category && targetItem.category &&
        product.category.trim().toLowerCase() === targetItem.category.trim().toLowerCase()) {
      score += 50;
      reasons.push("Exact Category Match (+50)");
    }

    // 2. Price proximity ±10% (+30)
    if (product.price >= minPrice && product.price <= maxPrice) {
      score += 30;
      reasons.push("Price Proximity Match (+30)");
    }

    // 3. Brand match (+20)
    if (product.brand && targetItem.brand &&
        product.brand.trim().toLowerCase() === targetItem.brand.trim().toLowerCase()) {
      score += 20;
      reasons.push("Brand Match (+20)");
    }

    // Cek apakah memenuhi threshold
    if (score < minScoreThreshold) {
      continue;
    }

    // Evaluasi Best Candidate dengan Tie-Breakers
    if (score > highestScore) {
      highestScore = score;
      bestCandidate = product;
      bestReasons = reasons;
    } else if (score === highestScore && bestCandidate) {
      const currentDiff = Math.abs((product.price || 0) - targetPrice);
      const bestDiff = Math.abs((bestCandidate.price || 0) - targetPrice);

      if (currentDiff < bestDiff) {
        bestCandidate = product;
        bestReasons = reasons;
      } else if (currentDiff === bestDiff) {
        if (product.name.localeCompare(bestCandidate.name) < 0) {
          bestCandidate = product;
          bestReasons = reasons;
        }
      }
    }
  }

  if (!bestCandidate) {
    return res.status(200).json({
      substitute: null,
      score: 0,
      matchReasons: []
    });
  }

  return res.status(200).json({
    substitute: bestCandidate,
    score: highestScore,
    matchReasons: bestReasons
  });
});

/*
 * JAWABAN BONUS — VECTOR EMBEDDINGS & HYBRID SEARCH:
 * 1. HYBRID SEARCH: Gabungkan Dense Vector Search (OpenAI text-embedding-3 / BGE embeddings)
 *    dengan Sparse BM25 lexical search di PostgreSQL (pgvector + pg_trgm).
 * 2. ATTRIBUTE HARD FILTERING: Pre-filter kategori & supermarket store branch sebelum similarity distance calculation.
 */

module.exports = app;`,
    testCases: []
  },
  {
    id: "spindo-stock-allocation",
    title: "🏭 SPINDO: Race Condition & Atomic Pipe Stock Allocation",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Database Transaction, Pessimistic Locking & ACID Safety",
    company: "SPINDO",
    badge: "🏭 SPINDO Track (Python)",
    description: `## 🏭 1. Studi Kasus
Di PT Steel Pipe Industry of Indonesia Tbk (SPINDO), pesanan pipa baja dari distributor datang bersamaan. Anda harus memastikan alokasi stok pipa baja di gudang tidak terjadi *over-selling* atau *race condition* saat beberapa transaksi masuk di milidetik yang sama.

Anda diminta mengimplementasikan fungsi alokasi stok transaksi aman:
\`\`\`python
def allocate_pipe_stock(session: Session, order_id: str, pipe_sku: str, qty_requested: int) -> dict
\`\`\`

---

## 2. Model & Persyaratan Bisnis
1. **Model \`PipeInventory\`**:
   - \`sku\` (Primary Key): Kode unik pipa (misal: \`"PIPE-SCH40-4IN"\`)
   - \`total_stock\`: Total fisik di gudang
   - \`reserved_stock\`: Stok yang sudah dipesan/dialokasikan
   - \`available_stock\`: \`total_stock - reserved_stock\`
2. **Pessimistic Locking**: Gunakan \`SELECT ... FOR UPDATE\` (\`with_for_update()\`) untuk mengunci row sebelum membaca ketersediaan stok.
3. **Validasi Ketersediaan**:
   - Jika stok tidak cukup (\`available_stock < qty_requested\`), lakukan \`session.rollback()\` dan kembalikan status \`FAILED\`.
   - Jika SKU tidak ditemukan, lakukan rollback dan kembalikan \`FAILED\`.
4. **Alokasi Sukses**: Tambah \`reserved_stock += qty_requested\`, commit transaksi, dan return status \`SUCCESS\`.`,
    starterCode: `from sqlmodel import SQLModel, Field, Session, select
from typing import Optional, Dict, Any
from sqlalchemy.exc import SQLAlchemyError

class PipeInventory(SQLModel, table=True):
    __tablename__ = "pipe_inventories"
    
    sku: str = Field(primary_key=True, index=True)
    pipe_type: str
    total_stock: int = Field(default=0, ge=0)
    reserved_stock: int = Field(default=0, ge=0)

    @property
    def available_stock(self) -> int:
        return self.total_stock - self.reserved_stock

def allocate_pipe_stock(session: Session, order_id: str, pipe_sku: str, qty_requested: int) -> Dict[str, Any]:
    # TODO: Implementasikan SELECT ... FOR UPDATE & Atomic Allocation
    pass`,
    bonusQuestion: "Bagaimana cara menangani deadlock jika 2 transaksi mengalokasikan multiple SKUs dalam urutan berlawanan (misal Tx A: SKU 1 -> SKU 2, Tx B: SKU 2 -> SKU 1)?",
    idealSolution: `from sqlmodel import SQLModel, Field, Session, select
from typing import Optional, Dict, Any
from sqlalchemy.exc import SQLAlchemyError

class PipeInventory(SQLModel, table=True):
    __tablename__ = "pipe_inventories"
    
    sku: str = Field(primary_key=True, index=True)
    pipe_type: str
    total_stock: int = Field(default=0, ge=0)
    reserved_stock: int = Field(default=0, ge=0)

    @property
    def available_stock(self) -> int:
        return self.total_stock - self.reserved_stock

class InventoryAllocationError(Exception):
    pass

class InsufficientStockError(InventoryAllocationError):
    pass

class ProductNotFoundError(InventoryAllocationError):
    pass

def allocate_pipe_stock(
    session: Session,
    order_id: str,
    pipe_sku: str,
    qty_requested: int
) -> Dict[str, Any]:
    """
    Mengalokasikan stok pipa secara atomik dan thread-safe menggunakan SELECT ... FOR UPDATE.
    """
    if qty_requested <= 0:
        return {"status": "FAILED", "order_id": order_id, "sku": pipe_sku, "reason": "Qty must be > 0"}

    try:
        statement = (
            select(PipeInventory)
            .where(PipeInventory.sku == pipe_sku)
            .with_for_update()
        )
        inventory = session.exec(statement).first()
        if not inventory:
            raise ProductNotFoundError(f"Pipe with SKU '{pipe_sku}' not found.")

        if inventory.available_stock < qty_requested:
            raise InsufficientStockError(
                f"Insufficient stock for {pipe_sku}. Requested: {qty_requested}, Available: {inventory.available_stock}"
            )

        inventory.reserved_stock += qty_requested
        session.add(inventory)
        session.commit()
        session.refresh(inventory)

        return {
            "status": "SUCCESS",
            "order_id": order_id,
            "sku": pipe_sku,
            "allocated_qty": qty_requested,
            "remaining_available_stock": inventory.available_stock
        }
    except (InsufficientStockError, ProductNotFoundError) as e:
        session.rollback()
        return {"status": "FAILED", "order_id": order_id, "sku": pipe_sku, "reason": str(e)}
    except SQLAlchemyError as e:
        session.rollback()
        return {"status": "ERROR", "order_id": order_id, "sku": pipe_sku, "reason": str(e)}`,
    testCases: []
  },
  {
    id: "spindo-sliding-rate-limiter",
    title: "🛡️ SPINDO: In-Memory Sliding Window Rate Limiter",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Algoritma Backend, Time-Window & Memory Management",
    company: "SPINDO",
    badge: "🏭 SPINDO Track (Python)",
    description: `## 🏭 1. Studi Kasus
Aplikasi internal pabrik SPINDO diakses oleh ribuan sensor IoT dan klien mobile di pabrik. Anda diminta membuat middleware rate limiter untuk melindungi server API dari request berlebihan (*spamming/bursting*).

---

## 2. Requirement & Algoritma
1. **Class \`SlidingWindowRateLimiter(max_requests, window_seconds)\`**:
   - Simpan timestamp per \`client_id\` menggunakan struktur data \`collections.deque\` untuk amortized \`O(1)\` eviction.
2. **Method \`is_allowed(client_id: str) -> tuple[bool, int, float]\`**:
   - Bersihkan timestamp usang di luar window waktu: \`timestamp <= current_time - window_seconds\`.
   - Jika jumlah request dalam window < \`max_requests\`: izinkan request, return \`(True, remaining, 0.0)\`.
   - Jika kuota habis: tolak request, hitung estimasi \`retry_after_seconds\`, return \`(False, 0, retry_after)\`.
3. **Method \`reset_client(client_id: str) -> None\`**:
   - Reset limit untuk IP atau sensor tertentu.`,
    starterCode: `import time
from collections import defaultdict, deque
from typing import Tuple, Dict

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clients: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, client_id: str) -> Tuple[bool, int, float]:
        # TODO: Implementasikan sliding window log menggunakan deque
        pass`,
    bonusQuestion: "Bagaimana cara menskalakan rate limiter ini ke multi-instance backend server menggunakan Redis dan Lua Scripting?",
    idealSolution: `import time
from collections import defaultdict, deque
from typing import Tuple, Dict

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clients: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, client_id: str) -> Tuple[bool, int, float]:
        current_time = time.time()
        window_start = current_time - self.window_seconds
        client_timestamps = self._clients[client_id]

        while client_timestamps and client_timestamps[0] <= window_start:
            client_timestamps.popleft()

        if len(client_timestamps) < self.max_requests:
            client_timestamps.append(current_time)
            remaining = self.max_requests - len(client_timestamps)
            return True, remaining, 0.0
        else:
            oldest_timestamp = client_timestamps[0]
            retry_after = round(oldest_timestamp + self.window_seconds - current_time, 2)
            return False, 0, max(0.0, retry_after)

    def reset_client(self, client_id: str) -> None:
        if client_id in self._clients:
            del self._clients[client_id]`,
    testCases: []
  },
  {
    id: "spindo-sensor-telemetry-aggregator",
    title: "📡 SPINDO: IoT Pipe Welding Telemetry Stream & Anomaly Detector",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "FastAPI / Time-Series Stream Processing & Quality Control",
    company: "SPINDO",
    badge: "🏭 SPINDO Track (Python)",
    description: `## 🏭 1. Studi Kasus
Di lini produksi pipa baja ERW (*Electric Resistance Welded*) PT SPINDO, mesin pengelasan induksi frekuensi tinggi memonitor suhu pengelasan (\`weld_temp_celsius\`), tekanan forming (\`forming_pressure_bar\`), dan kecepatan laju pipa (\`line_speed_mpm\`).

Anda diminta membangun engine \`TelemetryBatchProcessor\` yang memproses batch log sensor, menghitung statistik summary, dan mendeteksi anomali cacat pipa secara instan.

---

## 2. Requirement
1. **Validasi & Pembersihan**: Filter payload corrupt yang tidak memiliki \`timestamp\`, \`metric_name\`, atau \`value\` numerik.
2. **Statistik Summary**: Hitung \`min\`, \`max\`, \`avg\`, dan \`count\` per metrik.
3. **Out-of-Bounds Detection**: Cek terhadap batas toleransi (\`lower_bound\`, \`upper_bound\`).
4. **Sudden Temperature Drop**: Deteksi penurunan suhu las > 50°C dalam rentang waktu <= 5 detik.`,
    starterCode: `from typing import List, Dict, Tuple, Any
from collections import defaultdict

class TelemetryBatchProcessor:
    def __init__(self, tolerance_ranges: Dict[str, Tuple[float, float]]):
        self.tolerance_ranges = tolerance_ranges

    def process_batch(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        # TODO: Implementasikan batch aggregation & anomaly detection
        pass`,
    bonusQuestion: "Bagaimana arsitektur streaming processing (Kafka / Celery / TimescaleDB) untuk memproses 50.000 events/detik dari seluruh lini pabrik?",
    idealSolution: `from typing import List, Dict, Tuple, Any
from collections import defaultdict

class TelemetryBatchProcessor:
    def __init__(self, tolerance_ranges: Dict[str, Tuple[float, float]]):
        self.tolerance_ranges = tolerance_ranges

    def process_batch(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not readings:
            return {"metrics_summary": {}, "anomalies": [], "total_valid_samples": 0}

        valid_readings = [
            r for r in readings
            if isinstance(r, dict) and "timestamp" in r and "metric_name" in r
            and isinstance(r.get("value"), (int, float)) and isinstance(r.get("timestamp"), (int, float))
        ]
        valid_readings.sort(key=lambda x: x["timestamp"])

        grouped = defaultdict(list)
        for r in valid_readings:
            grouped[r["metric_name"]].append(r)

        metrics_summary = {}
        anomalies = []

        for metric, records in grouped.items():
            vals = [r["value"] for r in records]
            metrics_summary[metric] = {
                "count": len(vals), "min": min(vals), "max": max(vals), "avg": round(sum(vals) / len(vals), 2)
            }
            if metric in self.tolerance_ranges:
                lower, upper = self.tolerance_ranges[metric]
                for r in records:
                    v = r["value"]
                    if v < lower:
                        anomalies.append({"timestamp": r["timestamp"], "metric_name": metric, "value": v, "violation_type": "BELOW_MIN"})
                    elif v > upper:
                        anomalies.append({"timestamp": r["timestamp"], "metric_name": metric, "value": v, "violation_type": "ABOVE_MAX"})

        temp_records = grouped.get("weld_temp_celsius", [])
        for i in range(1, len(temp_records)):
            prev, curr = temp_records[i - 1], temp_records[i]
            if 0 <= curr["timestamp"] - prev["timestamp"] <= 5.0 and prev["value"] - curr["value"] >= 50.0:
                anomalies.append({"timestamp": curr["timestamp"], "metric_name": "weld_temp_celsius", "value": curr["value"], "violation_type": "SUDDEN_TEMP_DROP"})

        return {"metrics_summary": metrics_summary, "anomalies": anomalies, "total_valid_samples": len(valid_readings)}`,
    testCases: []
  },
  {
    id: "spindo-pipe-cutting-optimizer",
    title: "✂️ SPINDO: 1D Pipe Cutting Stock & Scrap Minimization Engine",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "Algoritma Optimasi Produksi, Heuristik 1D Bin Packing & ERP BOM",
    company: "SPINDO",
    badge: "🏭 SPINDO Track (Python)",
    description: `## 🏭 1. Studi Kasus
Di divisi finishing pabrik pipa baja PT SPINDO, pipa induk diproduksi dalam panjang standar (misal 6.000 mm atau 12.000 mm). Pelanggan memesan kombinasi potongan dengan panjang non-standar (misal: 3 batang @ 2.400 mm, 4 batang @ 1.750 mm). Setiap pemotongan mengonsumsi \`blade_kerf_mm\` (misal 5 mm).

Tugas Anda adalah mengimplementasikan algoritma optimasi pemotongan pipa 1D (*Cutting Stock Problem*) dengan metode **First-Fit Decreasing (FFD)** untuk meminimalkan sisa pipa yang terbuang (*scrap metal waste*).

---

## 2. Requirement
1. Urutkan potongan dari yang terpanjang ke terpendek (*descending*).
2. Gunakan pipa yang sudah dibuka jika sisa panjang muat (\`remaining_space >= cut_length + blade_kerf\`).
3. Jika tidak muat di pipa manapun, buka pipa induk baru.
4. Hitung persentase sisa limbah (*scrap percentage*).`,
    starterCode: `from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class CutRequest:
    order_id: str
    length_mm: int
    quantity: int

def optimize_pipe_cutting(
    stock_length_mm: int,
    blade_kerf_mm: int,
    cut_requests: List[CutRequest]
) -> Dict[str, Any]:
    # TODO: Implementasikan First-Fit Decreasing (FFD) 1D Cutting Stock
    pass`,
    bonusQuestion: "Bagaimana cara memformulasikan persoalan cutting stock ini menggunakan Integer Linear Programming (ILP) dengan library PuLP / SciPy?",
    idealSolution: `from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class CutRequest:
    order_id: str
    length_mm: int
    quantity: int

class StockPipe:
    def __init__(self, pipe_index: int, capacity_mm: int, blade_kerf_mm: int):
        self.pipe_index = pipe_index
        self.capacity_mm = capacity_mm
        self.blade_kerf_mm = blade_kerf_mm
        self.allocated_cuts = []
        self.used_length_mm = 0

    @property
    def remaining_space_mm(self) -> int:
        return self.capacity_mm - self.used_length_mm

    def can_fit(self, cut_len: int) -> bool:
        return self.remaining_space_mm >= (cut_len + self.blade_kerf_mm)

    def add_cut(self, order_id: str, cut_len: int):
        self.allocated_cuts.append({"order_id": order_id, "length_mm": cut_len})
        self.used_length_mm += (cut_len + self.blade_kerf_mm)

def optimize_pipe_cutting(
    stock_length_mm: int,
    blade_kerf_mm: int,
    cut_requests: List[CutRequest]
) -> Dict[str, Any]:
    pieces = []
    for req in cut_requests:
        if req.length_mm > stock_length_mm:
            raise ValueError(f"Requested length {req.length_mm} exceeds stock length {stock_length_mm}")
        for _ in range(req.quantity):
            pieces.append((req.order_id, req.length_mm))

    pieces.sort(key=lambda x: x[1], reverse=True)
    pipes: List[StockPipe] = []

    for order_id, length_mm in pieces:
        placed = False
        for p in pipes:
            if p.can_fit(length_mm):
                p.add_cut(order_id, length_mm)
                placed = True
                break
        if not placed:
            new_p = StockPipe(len(pipes) + 1, stock_length_mm, blade_kerf_mm)
            new_p.add_cut(order_id, length_mm)
            pipes.append(new_p)

    total_scrap = sum(p.remaining_space_mm for p in pipes)
    total_supplied = len(pipes) * stock_length_mm
    scrap_pct = round((total_scrap / total_supplied) * 100, 2) if total_supplied > 0 else 0.0

    return {
        "stock_pipe_length_mm": stock_length_mm,
        "total_raw_pipes_used": len(pipes),
        "total_cuts_produced": len(pieces),
        "total_scrap_length_mm": total_scrap,
        "scrap_percentage": scrap_pct,
        "cutting_plans": [
            {"pipe_index": p.pipe_index, "cuts": p.allocated_cuts, "used_length_mm": p.used_length_mm, "scrap_length_mm": p.remaining_space_mm}
            for p in pipes
        ]
    }`,
    testCases: []
  }
];




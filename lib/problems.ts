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
  }
];

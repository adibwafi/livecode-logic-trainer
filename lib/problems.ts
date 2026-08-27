import { Problem } from './types';

export const PROBLEMS: Problem[] = [
  // ─── 1. E-COMMERCE VOUCHER REDEMPTION API ──────────────────────────────────────
  {
    id: "voucher-redemption",
    title: "E-commerce Voucher Redemption API",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Logika REST API & Validasi Data",
    badge: "⭐ LiveCode Standard (20m)",
    description: `## 1. Studi Kasus
Sebuah aplikasi e-commerce memiliki fitur redeem voucher promosi. Untuk melindungi margin bisnis, **setiap voucher hanya dapat digunakan 1 kali oleh setiap pengguna**, dan setiap voucher memiliki kuota yang terbatas.

Anda diminta membuat logika endpoint REST API Express.js untuk:
\`\`\`http
POST /redeem
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami aturan validasi, status code HTTP, dan skenario kegagalan.
> - **15 Menit Koding**: Mengimplementasikan pengecekan in-memory dan status code 200/400/404.

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
> *Jelaskan bagaimana cara mencegah race condition (overselling kuota saat concurrent requests) menggunakan \`SELECT FOR UPDATE\` atau \`Atomic UPDATE query\`.*
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
  // 1. Validasi kelengkapan payload (userId & voucherCode) -> HTTP 400
  // 2. Cek keberadaan voucher -> HTTP 404
  // 3. Cek apakah user sudah pernah klaim voucher ini -> HTTP 400
  // 4. Cek ketersediaan kuota > 0 -> HTTP 400
  // 5. Update kuota dan simpan riwayat klaim -> HTTP 200

  return res.status(500).json({ message: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menangani race condition pada kuota voucher di level database SQL ketika 1000 request masuk bersamaan?",
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

  if (!userId || !voucherCode) {
    return res.status(400).json({ error: "userId and voucherCode are required" });
  }

  const voucher = vouchers.find(v => v.code === voucherCode);
  if (!voucher) {
    return res.status(404).json({ error: "Voucher tidak ditemukan" });
  }

  const alreadyRedeemed = redeemedVouchers.some(
    r => r.userId === userId && r.voucherCode === voucherCode
  );
  if (alreadyRedeemed) {
    return res.status(400).json({ error: "Anda sudah pernah mengklaim voucher ini" });
  }

  if (voucher.quota <= 0) {
    return res.status(400).json({ error: "Kuota voucher sudah habis" });
  }

  voucher.quota -= 1;
  redeemedVouchers.push({ userId, voucherCode });

  return res.status(200).json({ message: "Voucher redeemed successfully" });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_missing_fields",
        name: "Payload Validation — Missing Fields (HTTP 400)",
        input: { userId: 1 },
        expectedStatus: 400
      },
      {
        id: "tc_not_found",
        name: "Voucher Existence — Non-existent Voucher (HTTP 404)",
        input: { userId: 1, voucherCode: "NONEXISTENT" },
        expectedStatus: 404
      },
      {
        id: "tc_success",
        name: "Successful Redemption — PROMO50 (HTTP 200)",
        input: { userId: 101, voucherCode: "PROMO50" },
        expectedStatus: 200
      },
      {
        id: "tc_duplicate",
        name: "Duplicate Claim Protection (HTTP 400)",
        input: { userId: 101, voucherCode: "PROMO50" },
        expectedStatus: 400
      }
    ]
  },

  // ─── 2. HACKERRANK ELECTRONICS SHOP (OPTIMAL BUDGET) ─────────────────────────
  {
    id: "electronics-shop",
    title: "🛒 HackerRank: Electronics Shop (Optimal Budget Purchasing)",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Problem Solving, Two Pointers & Budget Optimization",
    badge: "⭐ HackerRank LiveCode (20m)",
    description: `## 1. Problem Statement
Seorang pembeli ingin membeli **1 unit keyboard** dan **1 unit USB drive** dengan budget tertentu $b$. Diberikan daftar harga keyboard dan daftar harga USB drive, cari total biaya tertinggi yang dapat dibelanjakan tanpa melebihi budget $b$.

Jika tidak ada kombinasi 1 keyboard dan 1 USB drive yang muat dalam budget, kembalikan **\`-1\`**.

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami constraints ($N, M \\le 1000$), menentukan pendekatan Two-Pointers vs Nested Loop.
> - **15 Menit Koding**: Implementasi fungsi \`getMoneySpent\` & validasi edge cases.

---

## 2. Function Description
Lengkapi fungsi \`getMoneySpent\` pada editor:

\`\`\`javascript
function getMoneySpent(keyboards, drives, b)
\`\`\`

### Parameter:
- \`int keyboards[n]\`: array integer berisi harga masing-masing model keyboard.
- \`int drives[m]\`: array integer berisi harga masing-masing model USB drive.
- \`int b\`: integer budget maksimal pembeli.

### Return:
- \`int\`: total pengeluaran maksimal $(\\le b)$, atau \`-1\` jika tidak memungkinkan membeli kedua barang.

---

## 3. Contoh & Penjelasan

### Contoh 1:
- \`b = 10\`, \`keyboards = [3, 1]\`, \`drives = [5, 2, 8]\`
- Kombinasi: $3+5=8$, $3+2=5$, $3+8=11$ (lewat), $1+5=6$, $1+2=3$, $1+8=9$.
- Termahal $\\le 10$ adalah **\`9\`** ($1 + 8$).

### Contoh 2:
- \`b = 5\`, \`keyboards = [4]\`, \`drives = [5]\`
- Termurah $4 + 5 = 9 > 5$. Tidak ada kombinasi yang muat.
- Return **\`-1\`**.
`,
    starterCode: `/**
 * Complete the 'getMoneySpent' function below.
 *
 * @param {number[]} keyboards - Array harga keyboard
 * @param {number[]} drives - Array harga USB drive
 * @param {number} b - Budget maksimal
 * @returns {number} - Maksimum biaya yang dapat dibeli (<= b), atau -1 jika tidak ada
 */
function getMoneySpent(keyboards, drives, b) {
  // TODO: Tuliskan logika problem solving di sini
  // Alokasi: 5 menit pahami soal, 15 menit livecoding!

  return -1;
}

module.exports = { getMoneySpent };`,
    bonusQuestion: "Bagaimana cara mengoptimalkan pencarian kombinasi termahal menggunakan teknik Two Pointers O(N log N + M log M) dibanding Brute Force O(N*M)?",
    idealSolution: `function getMoneySpent(keyboards, drives, b) {
  let maxSpent = -1;

  // Sort keyboards descending, drives ascending
  const sortedKeyboards = [...keyboards].sort((x, y) => y - x);
  const sortedDrives = [...drives].sort((x, y) => x - y);

  let k = 0;
  let d = 0;

  while (k < sortedKeyboards.length && d < sortedDrives.length) {
    const total = sortedKeyboards[k] + sortedDrives[d];

    if (total <= b) {
      if (total > maxSpent) {
        maxSpent = total;
      }
      d++; // Coba drive lebih mahal
    } else {
      k++; // Terlalu mahal, kurangi harga keyboard
    }
  }

  return maxSpent;
}

module.exports = { getMoneySpent };`,
    testCases: [
      {
        id: "tc_sample_0",
        name: "Sample 0: Budget 10, Keyboards [3,1], Drives [5,2,8] -> 9",
        input: { keyboards: [3, 1], drives: [5, 2, 8], b: 10 },
        expectedOutput: 9
      },
      {
        id: "tc_sample_1",
        name: "Sample 1: Budget 5, Keyboards [4], Drives [5] -> -1 (Overbudget)",
        input: { keyboards: [4], drives: [5], b: 5 },
        expectedOutput: -1
      },
      {
        id: "tc_exact_budget",
        name: "Exact Budget Match: b = 60 -> 60",
        input: { keyboards: [40, 50, 60], drives: [5, 8, 12, 20], b: 60 },
        expectedOutput: 60
      },
      {
        id: "tc_large_options",
        name: "Multiple Options: b = 100 -> 100",
        input: { keyboards: [15, 25, 40], drives: [30, 45, 60], b: 100 },
        expectedOutput: 100
      }
    ]
  },

  // ─── 3. FINTECH: TRANSACTION PAIR RECONCILIATION ────────────────────────────
  {
    id: "transaction-pair-matcher",
    title: "💳 Fintech: Transaction Pair Reconciliation",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Problem Solving, Hash Map & Financial Reconciliation",
    badge: "⭐ Problem Solving (20m)",
    description: `## 1. Studi Kasus
Di sistem perbankan / payment gateway, rekonsiliasi harian mencocokkan transaksi **Debit** (pengeluaran) dengan transaksi **Kredit** (pemasukan) yang memiliki jumlah yang saling melengkapi ke nilai \`targetSum\`.

Anda diminta membuat fungsi rekonsiliasi:
\`\`\`javascript
function findReconciledPairs(transactions, targetSum)
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami problem $O(N)$ Hash Map lookup vs $O(N^2)$ brute force.
> - **15 Menit Koding**: Menuliskan algoritma pencocokan pasangan id transaksi tanpa duplikasi penggunaan.

---

## 2. Requirement
1. Input: array of transaction objects: \`[{ id: "TX1", amount: 400 }, { id: "TX2", amount: 600 }, ...]\` dan integer \`targetSum\`.
2. Temukan pasangan transaksi \`[idA, idB]\` di mana \`amountA + amountB === targetSum\`.
3. Setiap transaksi hanya boleh dipasangkan **1 kali** (tidak boleh double count).
4. Kembalikan array berisi pasangan transaksi yang berhasil direkonsiliasi.
`,
    starterCode: `/**
 * @param {Array<{id: string, amount: number}>} transactions
 * @param {number} targetSum
 * @returns {Array<[string, string]>} Array of matched transaction ID pairs
 */
function findReconciledPairs(transactions, targetSum) {
  // TODO: Tuliskan algoritma rekonsiliasi O(N) menggunakan Hash Map di sini
  // Alokasi: 5 menit pahami soal, 15 menit livecoding!

  return [];
}

module.exports = { findReconciledPairs };`,
    bonusQuestion: "Bagaimana cara menangani rekonsiliasi skala besar (10 juta transaksi) yang tidak muat di memory sebuah server tunggal?",
    idealSolution: `function findReconciledPairs(transactions, targetSum) {
  const pairs = [];
  const map = new Map(); // amount -> Array of txId

  for (const tx of transactions) {
    const complement = targetSum - tx.amount;

    if (map.has(complement) && map.get(complement).length > 0) {
      const matchedId = map.get(complement).pop();
      pairs.push([matchedId, tx.id]);
    } else {
      if (!map.has(tx.amount)) {
        map.set(tx.amount, []);
      }
      map.get(tx.amount).push(tx.id);
    }
  }

  return pairs;
}

module.exports = { findReconciledPairs };`,
    testCases: [
      {
        id: "tc_exact_pairs",
        name: "Standard Pairs Match (Target 1000)",
        input: {
          transactions: [
            { id: "T1", amount: 300 },
            { id: "T2", amount: 700 },
            { id: "T3", amount: 500 },
            { id: "T4", amount: 500 }
          ],
          targetSum: 1000
        },
        expectedOutput: [["T1", "T2"], ["T3", "T4"]]
      },
      {
        id: "tc_no_match",
        name: "No Matching Transactions -> Empty Array",
        input: {
          transactions: [{ id: "T1", amount: 200 }, { id: "T2", amount: 300 }],
          targetSum: 1000
        },
        expectedOutput: []
      }
    ]
  },

  // ─── 4. OBSERVABILITY: SLIDING WINDOW SPIKE DETECTOR ─────────────────────────
  {
    id: "traffic-spike-detector",
    title: "📈 Observability: Sliding Window Traffic Spike Detector",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Algoritma Backend, Sliding Window & Time Series",
    badge: "⭐ Problem Solving (20m)",
    description: `## 1. Studi Kasus
Untuk mendeteksi potensi serangan DDoS atau lonjakan trafik mendadak (*traffic spike*), server monitoring menganalisis array timestamp request log yang terurut: \`[t1, t2, t3, ...]\` (dalam detik).

Anda diminta membuat fungsi:
\`\`\`javascript
function detectSpikes(timestamps, windowSeconds, threshold)
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami sliding window dua pointer $(L, R)$ untuk efisiensi $O(N)$.
> - **15 Menit Koding**: Implementasi window scanning dan deteksi interval lonjakan.

---

## 2. Requirement
1. Hitung jumlah request dalam setiap interval rentang waktu sebesar \`windowSeconds\` (misal $[t, t + windowSeconds]$).
2. Jika jumlah request dalam rentang tersebut $\\ge threshold$, catat interval tersebut \`{ startTime, endTime, count }\`.
3. Kembalikan array berisi semua puncak spike yang terdeteksi (tanpa duplicate start times).
`,
    starterCode: `/**
 * @param {number[]} timestamps - Array timestamp terurut (dalam detik)
 * @param {number} windowSeconds - Durasi jendela waktu (detik)
 * @param {number} threshold - Ambang batas minimum jumlah request untuk dianggap spike
 * @returns {Array<{startTime: number, endTime: number, count: number}>}
 */
function detectSpikes(timestamps, windowSeconds, threshold) {
  // TODO: Implementasikan deteksi lonjakan menggunakan Two Pointers Sliding Window O(N)
  // Alokasi: 5 menit pahami soal, 15 menit livecoding!

  return [];
}

module.exports = { detectSpikes };`,
    bonusQuestion: "Bagaimana cara menerapkan algoritma ini secara real-time streaming pada Apache Flink atau Redis Sliding Log?",
    idealSolution: `function detectSpikes(timestamps, windowSeconds, threshold) {
  const spikes = [];
  if (!timestamps || timestamps.length === 0) return spikes;

  let left = 0;

  for (let right = 0; right < timestamps.length; right++) {
    while (timestamps[right] - timestamps[left] > windowSeconds) {
      left++;
    }

    const count = right - left + 1;
    if (count >= threshold) {
      const startTime = timestamps[left];
      const endTime = timestamps[right];

      // Hindari duplikasi spike dengan startTime yang sama
      const alreadyLogged = spikes.some(s => s.startTime === startTime);
      if (!alreadyLogged) {
        spikes.push({ startTime, endTime, count });
      }
    }
  }

  return spikes;
}

module.exports = { detectSpikes };`,
    testCases: [
      {
        id: "tc_spike_detected",
        name: "Detect Spike (Threshold 4 in 5s)",
        input: {
          timestamps: [10, 11, 12, 13, 20, 21, 22, 23, 24, 25],
          windowSeconds: 5,
          threshold: 4
        },
        expectedOutput: [
          { startTime: 10, endTime: 13, count: 4 },
          { startTime: 20, endTime: 23, count: 4 }
        ]
      }
    ]
  },

  // ─── 5. IN-MEMORY SLIDING WINDOW RATE LIMITER (REST API) ───────────────────────
  {
    id: "rate-limiter-middleware",
    title: "In-Memory Sliding Window Rate Limiter",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Middleware & Algoritma",
    badge: "⭐ LiveCode Standard (20m)",
    description: `## 1. Studi Kasus
Penyalahgunaan API dan serangan spam dapat membebani server aplikasi. Tugas Anda adalah membuat middleware **Sliding Window Rate Limiter In-Memory** untuk Express.js guna melindungi endpoint API sensitif.

Endpoint yang dilindungi:
\`\`\`http
POST /api/action
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami sliding window time check (hapus timestamp usang $> 60s$).
> - **15 Menit Koding**: Implementasi map IP client, pembersihan sliding window, dan HTTP 429.

---

## 2. Aturan Bisnis
- Batas: Maksimal **5 request** per IP per jendela waktu **60 detik**.
- Jika request ke-6 masuk dalam 60 detik dari request pertama: kembalikan \`HTTP 429 Too Many Requests\` dengan JSON \`{ "error": "Rate limit exceeded. Try again later." }\`.
- Jika request masih dalam batas ($\le 5$): kembalikan \`HTTP 200 OK\` dengan \`{ "message": "Action successful", "remaining": X }\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// In-Memory store untuk melacak riwayat timestamp per IP: { "ip_address": [t1, t2, ...] }
const requestLogs = {};

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000;

app.post('/api/action', (req, res) => {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();

  // TODO: Implementasikan sliding window rate limiter di sini
  // 1. Inisialisasi array jika IP belum ada
  // 2. Filter timestamp yang sudah di luar WINDOW_MS
  // 3. Cek apakah jumlah request aktif >= MAX_REQUESTS -> HTTP 429
  // 4. Catat timestamp baru dan kembalikan HTTP 200

  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara mengimplementasikan distributed rate limiter di Kubernetes multi-pod cluster menggunakan Redis Token Bucket?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const requestLogs = {};
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000;

app.post('/api/action', (req, res) => {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();

  if (!requestLogs[ip]) {
    requestLogs[ip] = [];
  }

  // Filter out timestamps outside current sliding window
  requestLogs[ip] = requestLogs[ip].filter(t => now - t < WINDOW_MS);

  if (requestLogs[ip].length >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }

  requestLogs[ip].push(now);
  const remaining = MAX_REQUESTS - requestLogs[ip].length;

  return res.status(200).json({ message: "Action successful", remaining });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_rl_allow",
        name: "Request 1 Allowed (HTTP 200)",
        input: {},
        expectedStatus: 200
      },
      {
        id: "tc_rl_exceeded",
        name: "Request 6 Exceeds Limit (HTTP 429)",
        input: {},
        expectedStatus: 429
      }
    ]
  },

  // ─── 6. CART CHECKOUT & TAX ENGINE (REST API) ────────────────────────────────
  {
    id: "cart-checkout-engine",
    title: "E-commerce Cart Checkout & Tax Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Logika Bisnis & Perhitungan State",
    badge: "⭐ LiveCode Standard (20m)",
    description: `## 1. Studi Kasus
Buatlah logika checkout keranjang belanja untuk toko online. Endpoint menerima payload barang belanjaan, memvalidasi stok produk, menerapkan voucher diskon khusus kategori, menghitung **PPN 11%**, dan mengembalikan rincian tagihan.

\`\`\`http
POST /cart/checkout
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami urutan kalkulasi: Subtotal -> Diskon -> PPN 11% -> Total.
> - **15 Menit Koding**: Implementasi verifikasi stok, pemotongan stok, dan response breakdown.

---

## 2. Requirement
1. Validasi: Jika \`items\` kosong atau tidak ada, return \`HTTP 400\`.
2. Validasi Stok: Jika jumlah item melebihi \`stock\` produk, return \`HTTP 400\` (*"Stok tidak mencukupi"*).
3. Promo \`TECH20\`: Diskon 20% khusus item dengan kategori \`ELECTRONICS\` (maksimal diskon Rp 200.000).
4. Pajak: PPN 11% dikenakan pada subtotal setelah diskon.
5. Kurangi stok produk jika transaksi valid dan return \`HTTP 200\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: "P1", name: "Laptop", price: 1000, category: "ELECTRONICS", stock: 3 },
  { id: "P2", name: "Mouse",  price: 50,   category: "ELECTRONICS", stock: 10 },
  { id: "P3", name: "Shirt",  price: 30,   category: "FASHION",     stock: 5 }
];

app.post('/cart/checkout', (req, res) => {
  const { items, voucherCode } = req.body;

  // TODO: Tuliskan logika checkout & perhitungan pajak di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara memastikan integritas kalkulasi harga finansial agar tidak terjadi rounding floating point bug di JavaScript?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: "P1", name: "Laptop", price: 1000, category: "ELECTRONICS", stock: 3 },
  { id: "P2", name: "Mouse",  price: 50,   category: "ELECTRONICS", stock: 10 },
  { id: "P3", name: "Shirt",  price: 30,   category: "FASHION",     stock: 5 }
];

app.post('/cart/checkout', (req, res) => {
  const { items, voucherCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array cannot be empty" });
  }

  let subtotal = 0;
  let electronicsSubtotal = 0;

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return res.status(404).json({ error: \`Product \${item.productId} not found\` });
    if (prod.stock < item.quantity) return res.status(400).json({ error: \`Insufficient stock for \${prod.name}\` });

    const itemTotal = prod.price * item.quantity;
    subtotal += itemTotal;
    if (prod.category === 'ELECTRONICS') electronicsSubtotal += itemTotal;
  }

  let discount = 0;
  if (voucherCode === 'TECH20') {
    discount = Math.min(electronicsSubtotal * 0.2, 200);
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.11 * 100) / 100;
  const total = taxableAmount + tax;

  // Deduct stock
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) prod.stock -= item.quantity;
  }

  return res.status(200).json({
    subtotal,
    discount,
    taxableAmount,
    tax,
    total
  });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_cart_empty",
        name: "Empty Items Array Check (HTTP 400)",
        input: { items: [] },
        expectedStatus: 400
      },
      {
        id: "tc_cart_success",
        name: "Valid Checkout & Calculation (HTTP 200)",
        input: {
          items: [{ productId: "P1", quantity: 2 }, { productId: "P2", quantity: 1 }],
          voucherCode: "TECH20"
        },
        expectedStatus: 200
      }
    ]
  },

  // ─── 7. FLASH SALE INVENTORY RESERVATION (REST API) ──────────────────────────
  {
    id: "order-inventory-reservation",
    title: "Flash Sale Inventory Stock Reservation",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "High Concurrency & TTL State",
    badge: "⭐ LiveCode Standard (20m)",
    description: `## 1. Studi Kasus
Saat Flash Sale dengan trafik tinggi, platform e-commerce menggunakan **reservasi stok sementara** (TTL = 5 menit) untuk mencegah overselling.

\`\`\`http
POST /orders/reserve
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami logika auto-expiration stok reservasi yang sudah kedaluwarsa.
> - **15 Menit Koding**: Implementasi pembersihan reservasi expired dan alokasi stok baru.

---

## 2. Requirement
1. Jika \`productId\` atau \`quantity\` missing/invalid, return \`HTTP 400\`.
2. Bersihkan reservasi stok yang sudah expired (\`expiresAt <= now\`) dan kembalikan ke stok tersedia.
3. Cek ketersediaan stok: jika \`availableStock < quantity\`, return \`HTTP 409 Conflict\`.
4. Jika stok cukup, catat reservasi baru dengan TTL 300 detik dan return \`HTTP 201 Created\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const inventory = {
  "PS5": { totalStock: 10, availableStock: 10 }
};

const reservations = [];
const RESERVATION_TTL_MS = 5 * 60 * 1000;

app.post('/orders/reserve', (req, res) => {
  const { userId, productId, quantity } = req.body;

  // TODO: Tuliskan logika reservasi stok dan cleanup TTL di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana merancang arsitektur Flash Sale 100.000 QPS menggunakan Redis Lua Scripting dan Kafka Queue?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const inventory = {
  "PS5": { totalStock: 10, availableStock: 10 }
};

const reservations = [];
const RESERVATION_TTL_MS = 5 * 60 * 1000;

app.post('/orders/reserve', (req, res) => {
  const { userId, productId, quantity } = req.body;
  const now = Date.now();

  if (!userId || !productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const product = inventory[productId];
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Cleanup expired reservations
  for (let i = reservations.length - 1; i >= 0; i--) {
    const r = reservations[i];
    if (r.productId === productId && r.status === 'PENDING' && r.expiresAt <= now) {
      r.status = 'EXPIRED';
      product.availableStock += r.quantity;
    }
  }

  if (product.availableStock < quantity) {
    return res.status(409).json({ error: "Stok tidak mencukupi untuk reservasi" });
  }

  product.availableStock -= quantity;
  const reservationId = "RES_" + now + "_" + Math.floor(Math.random() * 1000);
  const reservation = {
    reservationId,
    userId,
    productId,
    quantity,
    status: 'PENDING',
    expiresAt: now + RESERVATION_TTL_MS
  };
  reservations.push(reservation);

  return res.status(201).json({
    message: "Reservation successful",
    reservationId,
    expiresAt: new Date(reservation.expiresAt).toISOString()
  });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_reserve_invalid",
        name: "Missing Fields Validation (HTTP 400)",
        input: { productId: "PS5" },
        expectedStatus: 400
      },
      {
        id: "tc_reserve_success",
        name: "Valid Reservation Allocation (HTTP 201)",
        input: { userId: "U1", productId: "PS5", quantity: 2 },
        expectedStatus: 201
      },
      {
        id: "tc_reserve_conflict",
        name: "Overstock Reservation Guard (HTTP 409)",
        input: { userId: "U2", productId: "PS5", quantity: 100 },
        expectedStatus: 409
      }
    ]
  },

  // ─── 8. PAYMENT GATEWAY IDEMPOTENT WEBHOOK HANDLER ────────────────────────────
  {
    id: "idempotent-payment-webhook",
    title: "Payment Gateway Idempotent Webhook Handler",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Webhooks & Idempotency",
    badge: "⭐ LiveCode Standard (20m)",
    description: `## 1. Studi Kasus
Payment gateway mengirimkan webhook event (\`payment.success\`) untuk memperbarui status transaksi. Karena kegagalan jaringan, webhook sering melakukan retry berkali-kali. API Anda harus menjamin **Idempotency** (event ID yang sama tidak boleh diproses 2 kali).

\`\`\`http
POST /webhook/payment
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami verifikasi header \`X-Signature\` dan idempotency status cache.
> - **15 Menit Koding**: Implementasi pemrosesan sekali bayar dan status return idempotensi.

---

## 2. Requirement
1. Verifikasi Header: Jika header \`x-signature\` !== \`"secret-webhook-key"\`, return \`HTTP 401 Unauthorized\`.
2. Idempotency Check: Jika \`eventId\` sudah pernah diproses (\`status === 'PROCESSED'\`), return \`HTTP 200\` dengan pesan *"Event already processed (Idempotent replay)"*.
3. Jika event baru: perbarui status pesanan menjadi \`PAID\`, simpan \`eventId\` ke set/array histori, dan return \`HTTP 200\` (*"Payment processed successfully"*).
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

const processedEvents = new Set();
const orders = {
  "ORD_999": { status: "UNPAID", amount: 250000 }
};

app.post('/webhook/payment', (req, res) => {
  const signature = req.headers['x-signature'];
  const { eventId, orderId, amount } = req.body;

  // TODO: Tuliskan verifikasi signature & idempotent webhook handler di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menangani distributed lock pada webhook processing menggunakan Redis SETNX untuk mencegah race condition antar worker?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const processedEvents = new Set();
const orders = {
  "ORD_999": { status: "UNPAID", amount: 250000 }
};

app.post('/webhook/payment', (req, res) => {
  const signature = req.headers['x-signature'];
  const { eventId, orderId, amount } = req.body;

  if (signature !== 'secret-webhook-key') {
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (!eventId || !orderId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (processedEvents.has(eventId)) {
    return res.status(200).json({ message: "Event already processed (Idempotent replay)" });
  }

  const order = orders[orderId];
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = 'PAID';
  processedEvents.add(eventId);

  return res.status(200).json({ message: "Payment processed successfully", orderId });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_webhook_sig_fail",
        name: "Unauthorized Signature Check (HTTP 401)",
        input: { eventId: "EVT_1", orderId: "ORD_999", amount: 250000 },
        expectedStatus: 401
      },
      {
        id: "tc_webhook_success",
        name: "Valid First-Time Processing (HTTP 200)",
        input: { eventId: "EVT_1", orderId: "ORD_999", amount: 250000 },
        expectedStatus: 200
      },
      {
        id: "tc_webhook_idempotent",
        name: "Idempotent Replay (HTTP 200 No-op)",
        input: { eventId: "EVT_1", orderId: "ORD_999", amount: 250000 },
        expectedStatus: 200
      }
    ]
  },

  // ─── 9. HAPPYFRESH: COMPLEX CART & PROMO ENGINE ──────────────────────────────
  {
    id: "happyfresh-cart-engine",
    title: "🛒 HappyFresh: Complex Cart & Promo Calculation Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "E-Grocery Promo Engine & Basket Calculations",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🛒 1. Studi Kasus
Di HappyFresh, perhitungan keranjang belanja (*grocery cart*) melibatkan validasi stok multi-item dari supermarket mitra, diskon per item/kategori, dan voucher promosi bertingkat.

\`\`\`http
POST /cart/calculate
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami aturan diskon: item promo -> subtotal -> voucher code -> ongkir (gratis jika $\ge 150.000$).
> - **15 Menit Koding**: Implementasi kalkulasi lengkap & breakdown tagihan.

---

## 2. Requirement
1. Jika \`items\` kosong, return \`HTTP 400\`.
2. Hitung subtotal belanja.
3. Ongkos Kirim: Standard Rp 15.000. Gratis ongkir (Rp 0) jika subtotal $\ge$ Rp 150.000.
4. Voucher:
   - \`FRESH50\`: Diskon 50% maksimal Rp 30.000 dengan minimum belanja Rp 100.000.
   - \`VEGGIE10\`: Diskon Rp 10.000 tanpa minimum belanja.
5. Return rincian: \`{ subtotal, voucherDiscount, deliveryFee, finalTotal }\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/cart/calculate', (req, res) => {
  const { items, voucherCode } = req.body;

  // TODO: Tuliskan logika kalkulasi e-grocery cart di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana arsitektur microservices untuk promo engine yang menangani 50+ variasi voucher yang saling bertumpuk (stackable)?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/cart/calculate', (req, res) => {
  const { items, voucherCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required and cannot be empty" });
  }

  let subtotal = 0;
  for (const item of items) {
    if (!item.price || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: "Invalid item price or quantity" });
    }
    subtotal += item.price * item.quantity;
  }

  const deliveryFee = subtotal >= 150000 ? 0 : 15000;

  let voucherDiscount = 0;
  if (voucherCode === 'FRESH50') {
    if (subtotal >= 100000) {
      voucherDiscount = Math.min(subtotal * 0.5, 30000);
    }
  } else if (voucherCode === 'VEGGIE10') {
    voucherDiscount = Math.min(subtotal, 10000);
  }

  const finalTotal = Math.max(0, subtotal - voucherDiscount) + deliveryFee;

  return res.status(200).json({
    subtotal,
    deliveryFee,
    voucherDiscount,
    finalTotal
  });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_hf_cart_empty",
        name: "Empty Items Validation (HTTP 400)",
        input: { items: [] },
        expectedStatus: 400
      },
      {
        id: "tc_hf_cart_calc",
        name: "Valid Cart Calculation & Voucher (HTTP 200)",
        input: {
          items: [{ id: "i1", price: 60000, quantity: 2 }],
          voucherCode: "FRESH50"
        },
        expectedStatus: 200
      }
    ]
  },

  // ─── 10. HAPPYFRESH: DELIVERY SLOT RESERVATION ───────────────────────────────
  {
    id: "happyfresh-slot-reservation",
    title: "🚚 HappyFresh: Delivery Slot Reservation & Anti-Overbooking",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Concurrency, Queue Simulation & Dispatch Slots",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🚚 1. Studi Kasus
Di HappyFresh, pelanggan memilih slot waktu pengiriman pesanan belanjaan (misal 10:00 - 12:00). Setiap slot memiliki batas kapasitas armada kurir (*rider dispatch capacity*).

\`\`\`http
POST /slots/reserve
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami urutan pemrosesan booking secara kronologis berdasarkan \`timestamp\`.
> - **15 Menit Koding**: Implementasi pembagian kuota slot dan pelaporan konfirmasi booking.

---

## 2. Requirement
1. Urutkan booking requests berdasarkan \`timestamp\` secara ascending (FIFO).
2. Cegah user memesan slot yang sama lebih dari 1 kali (\`DUPLICATE_USER_IN_SLOT\`).
3. Alokasikan booking hingga kuota slot terpenuhi. Jika slot penuh, tandai kegagalan (\`SLOT_FULL\`).
4. Return: \`{ confirmedBookings, failedBookings }\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/slots/reserve', (req, res) => {
  const { availableSlots, bookingRequests } = req.body;

  // TODO: Tuliskan logika reservasi slot dan anti-overbooking di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menangani alokasi slot pengiriman skala besar menggunakan Redis distributed lock Redlock?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/slots/reserve', (req, res) => {
  const { availableSlots, bookingRequests } = req.body;

  if (!Array.isArray(availableSlots) || !Array.isArray(bookingRequests)) {
    return res.status(400).json({ error: "availableSlots and bookingRequests must be arrays" });
  }

  const slotMap = new Map();
  availableSlots.forEach(s => {
    slotMap.set(s.id, { ...s, currentBookings: [] });
  });

  const sortedRequests = [...bookingRequests].sort((a, b) => a.timestamp - b.timestamp);

  const confirmedBookings = [];
  const failedBookings = [];

  for (const reqItem of sortedRequests) {
    const slot = slotMap.get(reqItem.slotId);

    if (!slot) {
      failedBookings.push({ ...reqItem, reason: 'SLOT_NOT_FOUND' });
      continue;
    }

    if (slot.currentBookings.includes(reqItem.userId)) {
      failedBookings.push({ ...reqItem, reason: 'DUPLICATE_USER_IN_SLOT' });
      continue;
    }

    if (slot.currentBookings.length >= slot.capacity) {
      failedBookings.push({ ...reqItem, reason: 'SLOT_FULL' });
      continue;
    }

    slot.currentBookings.push(reqItem.userId);
    confirmedBookings.push({ ...reqItem, status: 'CONFIRMED' });
  }

  return res.status(200).json({ confirmedBookings, failedBookings });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_slots_invalid",
        name: "Input Validation (HTTP 400)",
        input: { availableSlots: null },
        expectedStatus: 400
      },
      {
        id: "tc_slots_chrono_capacity",
        name: "Chronological Capacity Allocation (HTTP 200)",
        input: {
          availableSlots: [{ id: "SLOT-01", startTime: "10:00", endTime: "12:00", capacity: 2 }],
          bookingRequests: [
            { requestId: "req-3", userId: "u3", slotId: "SLOT-01", timestamp: 1700000030 },
            { requestId: "req-1", userId: "u1", slotId: "SLOT-01", timestamp: 1700000010 },
            { requestId: "req-2", userId: "u2", slotId: "SLOT-01", timestamp: 1700000020 }
          ]
        },
        expectedStatus: 200
      }
    ]
  },

  // ─── 11. HAPPYFRESH: PICKER ITEM SUBSTITUTION ENGINE ─────────────────────────
  {
    id: "happyfresh-item-substitution",
    title: "🥦 HappyFresh: Picker Item Substitution Scoring Engine",
    role: "Frontend Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Data Transformation, Search & Heuristic Scoring",
    company: "HappyFresh",
    badge: "🥑 HappyFresh Special",
    description: `## 🥦 1. Studi Kasus
Ketika belanjaan yang dipesan pelanggan habis (*Out of Stock*), aplikasi Personal Shopper HappyFresh memberikan rekomendasi barang pengganti terbaik berdasarkan skor heuristik kesamaan.

\`\`\`http
POST /items/substitute
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami bobot skor: Kategori (+50), Rentang Harga $\pm 10\%$ (+30), Brand (+20).
> - **15 Menit Koding**: Implementasi filter stok dan perangkingan skor substitusi.

---

## 2. Requirement & Scoring Rule
- Hanya pertimbangkan produk dengan \`inStock === true\`.
- **Kategori sama**: +50 poin.
- **Harga mirip** ($\pm 10\%$ dari harga target): +30 poin.
- **Brand sama**: +20 poin.
- Jika skor tertinggi $< 50$, return \`substitute: null\`.
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/items/substitute', (req, res) => {
  const { targetItem, catalog } = req.body;

  // TODO: Tuliskan logika scoring rekomendasi barang substitusi di sini
  return res.status(500).json({ error: "Belum diimplementasikan" });
});

module.exports = app;`,
    bonusQuestion: "Bagaimana cara menggabungkan Semantic Vector Search (embeddings) dan Lexical BM25 untuk rekomendasi barang pengganti di katalog supermarket besar?",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/items/substitute', (req, res) => {
  const { targetItem, catalog } = req.body;

  if (!targetItem || !Array.isArray(catalog)) {
    return res.status(400).json({ error: "targetItem and catalog array are required" });
  }

  const scoredCandidates = [];

  for (const item of catalog) {
    if (!item.inStock || item.id === targetItem.id) continue;

    let score = 0;
    if (item.category === targetItem.category) score += 50;

    const priceDiffRatio = Math.abs(item.price - targetItem.price) / targetItem.price;
    if (priceDiffRatio <= 0.10) score += 30;

    if (item.brand === targetItem.brand) score += 20;

    if (score >= 50) {
      scoredCandidates.push({
        item,
        score,
        priceDiff: Math.abs(item.price - targetItem.price)
      });
    }
  }

  if (scoredCandidates.length === 0) {
    return res.status(200).json({ substitute: null, score: 0 });
  }

  scoredCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.priceDiff !== b.priceDiff) return a.priceDiff - b.priceDiff;
    return a.item.name.localeCompare(b.item.name);
  });

  const best = scoredCandidates[0];
  return res.status(200).json({
    substitute: best.item,
    score: best.score
  });
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_subst_invalid",
        name: "Missing Payload Validation (HTTP 400)",
        input: { targetItem: null },
        expectedStatus: 400
      },
      {
        id: "tc_subst_score_oos",
        name: "Heuristic Score Match (HTTP 200)",
        input: {
          targetItem: { id: "t1", name: "Indomilk UHT 1L", category: "Dairy", brand: "Indomilk", price: 20000 },
          catalog: [
            { id: "p1", name: "Ultra Milk 1L", category: "Dairy", brand: "Ultra", price: 21000, inStock: true },
            { id: "p2", name: "Indomilk Vanilla 1L", category: "Dairy", brand: "Indomilk", price: 20000, inStock: true }
          ]
        },
        expectedStatus: 200
      }
    ]
  },

  // ─── 12. PRACTICAL SEARCH & PAGINATION ENGINE (PURE FUNCTION) ───────────────
  {
    id: "catalog-search-pagination",
    title: "🔍 E-commerce: Multi-Field Search & Pagination Engine",
    role: "Full Stack Engineer",
    level: "Mid-Level",
    timeLimit: 20,
    category: "Problem Solving, Data Slicing & Query Filtering",
    badge: "⭐ Problem Solving (20m)",
    description: `## 1. Studi Kasus
Di aplikasi web modern, pencarian katalog produk memerlukan pemfilteran multi-kriteria (*keyword, kategori, rentang harga, ketersediaan stok*) dan pemotongan halaman data (*pagination*) secara presisi.

Anda diminta membuat fungsi pencarian katalog:
\`\`\`javascript
function queryCatalog(items, filters, pagination)
\`\`\`

> ⏱️ **Alokasi Waktu Live Coding (20 Menit)**:
> - **5 Menit Pertama**: Memahami filter pipeline (keyword case-insensitive, category, minPrice/maxPrice, inStock) dan pagination offset.
> - **15 Menit Koding**: Implementasi array filtering, sorting, dan kalkulasi pagination metadata.

---

## 2. Requirement
1. **Filters**:
   - \`keyword\`: Cocokkan substring pada \`name\` (case-insensitive).
   - \`category\`: Kategori produk harus sama persis jika diberikan.
   - \`minPrice\` & \`maxPrice\`: Batas harga inklusif.
   - \`inStockOnly\`: Jika \`true\`, hanya sertakan item dengan \`stock > 0\`.
2. **Pagination**:
   - \`page\` (default 1), \`pageSize\` (default 10).
3. **Return Format**:
\`\`\`javascript
{
  data: [...], // Array of items on requested page
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 42,
    totalPages: 5
  }
}
\`\`\`
`,
    starterCode: `/**
 * @param {Array<object>} items - Array of product objects
 * @param {object} filters - { keyword?, category?, minPrice?, maxPrice?, inStockOnly? }
 * @param {object} pagination - { page?: number, pageSize?: number }
 * @returns {object} { data, pagination: { currentPage, pageSize, totalItems, totalPages } }
 */
function queryCatalog(items, filters = {}, pagination = {}) {
  // TODO: Implementasikan multi-field search & pagination di sini
  // Alokasi: 5 menit pahami soal, 15 menit livecoding!

  return {
    data: [],
    pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 }
  };
}

module.exports = { queryCatalog };`,
    bonusQuestion: "Bagaimana optimasi query indexing pada Elasticsearch atau PostgreSQL GIN Trigram index untuk pencarian multi-field dengan jutaan records?",
    idealSolution: `function queryCatalog(items, filters = {}, pagination = {}) {
  let result = [...items];

  // 1. Keyword search (case-insensitive)
  if (filters.keyword && typeof filters.keyword === 'string') {
    const kw = filters.keyword.trim().toLowerCase();
    result = result.filter(item => item.name && item.name.toLowerCase().includes(kw));
  }

  // 2. Category filter
  if (filters.category) {
    result = result.filter(item => item.category === filters.category);
  }

  // 3. Price range filter
  if (typeof filters.minPrice === 'number') {
    result = result.filter(item => item.price >= filters.minPrice);
  }
  if (typeof filters.maxPrice === 'number') {
    result = result.filter(item => item.price <= filters.maxPrice);
  }

  // 4. In-Stock filter
  if (filters.inStockOnly) {
    result = result.filter(item => item.stock > 0);
  }

  const totalItems = result.length;
  const page = Math.max(1, pagination.page || 1);
  const pageSize = Math.max(1, pagination.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginatedData = result.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages
    }
  };
}

module.exports = { queryCatalog };`,
    testCases: [
      {
        id: "tc_search_filter",
        name: "Filter by Keyword & Category with Pagination",
        input: {
          items: [
            { id: "1", name: "Logitech MX Master", category: "ELECTRONICS", price: 100, stock: 5 },
            { id: "2", name: "Apple Magic Mouse", category: "ELECTRONICS", price: 80, stock: 0 },
            { id: "3", name: "Cotton T-Shirt", category: "FASHION", price: 20, stock: 10 }
          ],
          filters: { keyword: "mouse", category: "ELECTRONICS" },
          pagination: { page: 1, pageSize: 5 }
        },
        expectedOutput: {
          data: [{ id: "2", name: "Apple Magic Mouse", category: "ELECTRONICS", price: 80, stock: 0 }],
          pagination: { currentPage: 1, pageSize: 5, totalItems: 1, totalPages: 1 }
        }
      }
    ]
  }
];

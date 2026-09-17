import { QuizQuestion } from './types';

export const BACKEND_QUESTION_BANK: QuizQuestion[] = [
  // ─── 1. Console Log & Event Loop Traps ───
  {
    id: 'be-001',
    track: 'backend',
    category: 'Node.js Event Loop',
    companyTag: 'Tokopedia OA',
    difficulty: 'Mid',
    question: 'Berapakah urutan output console.log dari snippet Node.js berikut?',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: '1 -> 5 -> 3 -> 4 -> 2' },
      { id: 'B', label: '1 -> 5 -> 4 -> 3 -> 2' },
      { id: 'C', label: '1 -> 5 -> 2 -> 4 -> 3' },
      { id: 'D', label: '1 -> 4 -> 3 -> 5 -> 2' },
    ],
    correctOptionId: 'B',
    explanation: 'Urutan eksekusi Node.js: Synchronous code (1, 5) langsung dieksekusi. Kemudian microtask queue diproses: process.nextTick() memiliki prioritas tertinggi sebelum Promise microtasks, sehingga 4 dicetak lalu 3. Terakhir macrotask (timer) memproses callback setTimeout (2).'
  },
  {
    id: 'be-002',
    track: 'backend',
    category: 'Node.js Async / Await',
    companyTag: 'GoTo Screening',
    difficulty: 'Mid',
    question: 'Apa output dari kode async/await bertingkat berikut saat dieksekusi?',
    codeSnippet: `async function async1() {
  console.log('A');
  await async2();
  console.log('B');
}
async function async2() {
  console.log('C');
}
console.log('D');
async1();
console.log('E');`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'D -> A -> C -> E -> B' },
      { id: 'B', label: 'D -> E -> A -> C -> B' },
      { id: 'C', label: 'D -> A -> C -> B -> E' },
      { id: 'D', label: 'A -> C -> D -> E -> B' },
    ],
    correctOptionId: 'A',
    explanation: 'Pertama `D` dicetak synchronously. Pemanggilan `async1()` langsung mengeksekusi synchronous body (`A`), lalu memanggil `async2()` yang mencetak `C`. Setelah `await async2()`, kelanjutan fungsi (`B`) dimasukkan ke Microtask queue. Eksekusi synchronous kembali ke top-level mencetak `E`. Setelah call stack kosong, microtask selesai dan mencetak `B`.'
  },
  {
    id: 'be-003',
    track: 'backend',
    category: 'Node.js Error Handling',
    companyTag: 'Traveloka Core',
    difficulty: 'Mid-Senior',
    question: 'Apa yang terjadi pada proses Node.js saat kode berikut dieksekusi di Node v18+?',
    codeSnippet: `async function fetchData() {
  throw new Error('Database connection failed');
}

function init() {
  try {
    fetchData();
  } catch (err) {
    console.log('Caught locally');
  }
}
init();`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Mencetak "Caught locally" karena berada di dalam blok try/catch.' },
      { id: 'B', label: 'Error diabaikan secara silent dan proses tetap berjalan normal.' },
      { id: 'C', label: 'Terjadi UnhandledPromiseRejection dan proses Node.js crash (exit code 1).' },
      { id: 'D', label: 'Fungsi mengembalikan undefined tanpa melempar error.' },
    ],
    correctOptionId: 'C',
    explanation: '`fetchData()` mengembalikan Promise yang ditolak (rejected). Karena pemanggilannya tidak menggunakan `await` di dalam `init()`, error tidak dilempar secara synchronous sehingga blok `try/catch` tidak menangkapnya. Di Node.js v16+, unhandled promise rejection menyebabkan process crash dengan exit code non-zero jika tidak ada handler `unhandledRejection`.'
  },
  {
    id: 'be-004',
    track: 'backend',
    category: 'Node.js Event Loop',
    companyTag: 'Shopee Backend OA',
    difficulty: 'Mid',
    question: 'Di dalam modul I/O (misal fs.readFile callback), apa perbedaan eksekusi antara setImmediate() dan setTimeout(..., 0)?',
    codeSnippet: `const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Selalu mencetak "timeout" baru "immediate".' },
      { id: 'B', label: 'Selalu mencetak "immediate" baru "timeout".' },
      { id: 'C', label: 'Urutan acak tidak deterministik tergantung CPU clock.' },
      { id: 'D', label: 'Kedua callback dijalankan secara paralel di thread pool.' },
    ],
    correctOptionId: 'B',
    explanation: 'Dalam siklus I/O callback (Poll phase), fase berikutnya pada event loop Node.js adalah Check phase di mana callback `setImmediate()` dijalankan. Timer phase baru akan dieksekusi pada iterasi event loop berikutnya, sehingga `immediate` selalu dicetak sebelum `timeout`.'
  },

  // ─── 2. Database Indexing & Performance (PostgreSQL / MySQL) ───
  {
    id: 'be-005',
    track: 'backend',
    category: 'Database Indexing',
    companyTag: 'Tokopedia High Concurrency',
    difficulty: 'Mid-Senior',
    question: 'Tabel `orders` memiliki Composite B-Tree Index: `(store_id, status, created_at)`. Query mana yang TIDAK DAPAT memanfaatkan index ini secara efisien (Full Table Scan)?',
    options: [
      { id: 'A', label: 'SELECT * FROM orders WHERE store_id = 10 AND status = "PAID";' },
      { id: 'B', label: 'SELECT * FROM orders WHERE store_id = 10 ORDER BY status;' },
      { id: 'C', label: 'SELECT * FROM orders WHERE status = "PAID" AND created_at > "2026-01-01";' },
      { id: 'D', label: 'SELECT * FROM orders WHERE store_id = 10 AND status = "PAID" AND created_at > "2026-01-01";' },
    ],
    correctOptionId: 'C',
    explanation: 'B-Tree Composite Index mengikuti Leftmost Prefix Rule. Index pada (store_id, status, created_at) hanya bisa digunakan jika query menyertakan kolom awalan pertama (`store_id`). Query C mencari berdasarkan `status` dan `created_at` tanpa `store_id`, sehingga database optimizer terpaksa melakukan sequential / full table scan.'
  },
  {
    id: 'be-006',
    track: 'backend',
    category: 'SQL Performance',
    companyTag: 'Blibli Core Tech',
    difficulty: 'Mid',
    question: 'Apa dampak dan solusi paling tepat untuk masalah N+1 Query pada ORM (seperti Prisma, TypeORM, atau Hibernate)?',
    options: [
      { id: 'A', label: 'Menambah B-Tree index pada primary key tabel anak.' },
      { id: 'B', label: 'Menggunakan Eager Loading dengan JOIN / batch loading (WHERE IN) atau DataLoader.' },
      { id: 'C', label: 'Menaikkan database connection pool size hingga 500 koneksi.' },
      { id: 'D', label: 'Menjalankan query di background thread asynchronous.' },
    ],
    correctOptionId: 'B',
    explanation: 'N+1 query terjadi saat 1 query mengambil list N entitas, lalu kode melakukan 1 query tambahan untuk setiap entitas untuk mengambil data relasinya (total 1 + N query). Solusinya adalah melakukan JOIN eager loading, batching dengan `IN (...)`, atau menggunakan pattern DataLoader untuk memadatkan query.'
  },
  {
    id: 'be-007',
    track: 'backend',
    category: 'Database Indexing',
    companyTag: 'BCA Digital (blu)',
    difficulty: 'Senior',
    question: 'Mengapa index tipe B-Tree umumnya menjadi default database relational dibandingkan Hash Index?',
    options: [
      { id: 'A', label: 'B-Tree membutuhkan memori jauh lebih sedikit daripada Hash index.' },
      { id: 'B', label: 'B-Tree mendukung range query (<, >, BETWEEN, ORDER BY), sedangkan Hash index hanya mendukung exact equality (=).' },
      { id: 'C', label: 'B-Tree menjamin kecepatan O(1) untuk semua query exact match.' },
      { id: 'D', label: 'Hash index tidak dapat disimpan di persistent disk storage.' },
    ],
    correctOptionId: 'B',
    explanation: 'Hash index menghitung hash key sehingga lookup exact equality sangat cepat O(1), tetapi tidak menyimpan urutan data terurut. B-Tree menyimpan data dalam struktur pohon berurut logaritmik O(log N) sehingga sangat fleksibel untuk filter range (`>`, `<`, `BETWEEN`), prefix search (`LIKE "abc%"`), dan operasi sorting (`ORDER BY`).'
  },
  {
    id: 'be-008',
    track: 'backend',
    category: 'Database Optimization',
    companyTag: 'Traveloka OA',
    difficulty: 'Mid-Senior',
    question: 'Mengapa penggunaan OFFSET besar pada pagination (misal `SELECT * FROM flights ORDER BY id LIMIT 20 OFFSET 500000`) menjadi sangat lambat?',
    options: [
      { id: 'A', label: 'Database lock tabel flights selama proses offset berlangsung.' },
      { id: 'B', label: 'Database harus membaca dan membuang 500.000 baris pertama sebelum mengembalikan 20 baris berikutnya.' },
      { id: 'C', label: 'Index B-Tree tidak bisa membaca angka id di atas 100.000.' },
      { id: 'D', label: 'Koneksi database kehabisan buffer packet network.' },
    ],
    correctOptionId: 'B',
    explanation: 'OFFSET pagination memaksa storage engine membaca 500.000 row dari disk/cache dan membuangnya ke memori sebelum mengambil 20 baris target. Solusi enterprise adalah Keyset Pagination (Cursor-based) seperti `WHERE id > last_seen_id ORDER BY id LIMIT 20` yang langsung melompat via index O(log N).'
  },

  // ─── 3. Transactions, ACID & Concurrency Control ───
  {
    id: 'be-009',
    track: 'backend',
    category: 'Concurrency Control',
    companyTag: 'DANA Fintech Screening',
    difficulty: 'Senior',
    question: 'Pada sistem transfer saldo e-wallet dengan volume tinggi, bagaimana cara mencegah race condition "Double Spending" secara Optimistic Locking?',
    options: [
      { id: 'A', label: 'Menggunakan SELECT FOR UPDATE untuk mengunci baris database secara eksklusif.' },
      { id: 'B', label: 'Menambahkan kolom `version` dan melakukan UPDATE ... WHERE id = x AND version = expected_version.' },
      { id: 'C', label: 'Menonaktifkan database transaction agar proses eksekusi berjalan instan.' },
      { id: 'D', label: 'Memproses seluruh transaksi transfer dalam single-threaded Node.js worker.' },
    ],
    correctOptionId: 'B',
    explanation: 'Optimistic locking tidak mengunci row saat pembacaan, melainkan memverifikasi versi row saat commit (`UPDATE wallets SET balance = balance - 100, version = version + 1 WHERE id = 123 AND version = current_version`). Jika rows affected = 0, berarti data telah diubah transaksi lain dan aplikasi dapat me-retry.'
  },
  {
    id: 'be-010',
    track: 'backend',
    category: 'ACID & Isolation Levels',
    companyTag: 'Bank Mandiri Digital',
    difficulty: 'Senior',
    question: 'Fenomena di mana Transaksi A membaca sekelompok baris, lalu Transaksi B meng-INSERT baris baru yang cocok dengan kriteria filter tersebut dan COMMIT, sehingga Transaksi A melihat baris tambahan saat query ulang, disebut:',
    options: [
      { id: 'A', label: 'Dirty Read' },
      { id: 'B', label: 'Non-repeatable Read' },
      { id: 'C', label: 'Phantom Read' },
      { id: 'D', label: 'Lost Update' },
    ],
    correctOptionId: 'C',
    explanation: 'Phantom Read adalah anomali di mana baris baru yang memenuhi kondisi klausa WHERE muncul pada pembacaan berikutnya dalam transaksi yang sama. Masalah ini dicegah pada tingkat isolasi SERIALIZABLE (atau Repeatable Read dengan Next-Key Locking di InnoDB MySQL).'
  },
  {
    id: 'be-011',
    track: 'backend',
    category: 'Concurrency Control',
    companyTag: 'Shopee Flash Sale',
    difficulty: 'Senior',
    question: 'Saat flash sale dengan 10.000 request per detik berebut 100 unit stok barang, mengapa UPDATE stock = stock - 1 WHERE id = 1 AND stock > 0 adalah pendekatan atomik yang aman di PostgreSQL/MySQL?',
    options: [
      { id: 'A', label: 'Karena database otomatis menerapkan row-level exclusive lock pada baris yang di-update hingga transaksi selesai.' },
      { id: 'B', label: 'Karena operasi UPDATE dijalankan di memori RAM tanpa menyentuh disk.' },
      { id: 'C', label: 'Karena database membuat replika read-only untuk setiap concurrent user.' },
      { id: 'D', label: 'Karena query ini mengabaikan ACID demi throughput maksimal.' },
    ],
    correctOptionId: 'A',
    explanation: 'Database relational menerapkan row-level write lock pada baris yang dimodifikasi. Setiap concurrent request akan menunggu lock secara berurutan. Klausa `AND stock > 0` menjamin bahwa ketika stok habis (0), query selanjutnya menghasilkan 0 rows affected tanpa race condition over-selling.'
  },

  // ─── 4. HTTP Protocols & RESTful APIs ───
  {
    id: 'be-012',
    track: 'backend',
    category: 'HTTP & REST',
    companyTag: 'Xendit Payment Gateway',
    difficulty: 'Mid',
    question: 'Manakah HTTP method yang menurut spesifikasi RFC 9110 bersifat IDEMPOTENT?',
    options: [
      { id: 'A', label: 'POST dan PATCH' },
      { id: 'B', label: 'GET, PUT, DELETE, dan HEAD' },
      { id: 'C', label: 'Hanya GET dan POST' },
      { id: 'D', label: 'Semua HTTP method bersifat idempotent' },
    ],
    correctOptionId: 'B',
    explanation: 'Idempotent berarti memanggil request yang sama N kali memberikan efek akhir pada server yang sama seperti memanggilnya 1 kali. GET, HEAD, PUT (replace), dan DELETE bersifat idempotent menurut standar RFC. POST dan PATCH tidak dijamin idempotent.'
  },
  {
    id: 'be-013',
    track: 'backend',
    category: 'HTTP Status Codes',
    companyTag: 'Tokopedia OA',
    difficulty: 'Junior-Mid',
    question: 'Klien mengirim request untuk membuat akun baru dengan email "user@tokopedia.com", namun email tersebut sudah terdaftar di sistem. HTTP status code manakah yang paling semantik dan standar?',
    options: [
      { id: 'A', label: '400 Bad Request' },
      { id: 'B', label: '409 Conflict' },
      { id: 'C', label: '422 Unprocessable Entity' },
      { id: 'D', label: '403 Forbidden' },
    ],
    correctOptionId: 'B',
    explanation: 'HTTP 409 Conflict secara spesifik mengindikasikan bahwa request tidak dapat diproses karena terjadi konflik dengan state sumber daya saat ini di server (misalnya pelanggaran unique constraint pada email yang sudah ada).'
  },
  {
    id: 'be-014',
    track: 'backend',
    category: 'HTTP & Security',
    companyTag: 'GoTo Screening',
    difficulty: 'Mid',
    question: 'Apa perbedaan mendasar antara HTTP Status 401 Unauthorized dan 403 Forbidden?',
    options: [
      { id: 'A', label: '401 untuk error server, 403 untuk error klien.' },
      { id: 'B', label: '401 mengindikasikan kredensial autentikasi tidak valid/hilang; 403 mengindikasikan identitas terverifikasi tetapi tidak memiliki izin (otorisasi).' },
      { id: 'C', label: '401 digunakan untuk HTTPS, 403 digunakan untuk HTTP biasa.' },
      { id: 'D', label: '401 berarti rate-limit tercapai, 403 berarti IP diblokir.' },
    ],
    correctOptionId: 'B',
    explanation: '401 (Authentication failure) meminta pengguna memasukkan kredensial yang valid (Who are you?). 403 (Authorization failure) berarti server tahu siapa pengguna tersebut, namun pengguna tidak memiliki hak akses untuk resource tersebut (You cannot do this).'
  },

  // ─── 5. Caching & In-Memory Storage (Redis) ───
  {
    id: 'be-015',
    track: 'backend',
    category: 'Caching & Redis',
    companyTag: 'Traveloka Core',
    difficulty: 'Senior',
    question: 'Apa yang dimaksud dengan "Cache Stampede" (Thundering Herd) dan bagaimana cara mitigasi terbaiknya?',
    options: [
      { id: 'A', label: 'Redis kehabisan kapasitas RAM sehingga me-restart node secara otomatis.' },
      { id: 'B', label: 'Saat key cache populer expire bersamaan, ratusan request bersamaan membombardir database utama.' },
      { id: 'C', label: 'Klien mengirim data invalid yang tidak pernah ada di database.' },
      { id: 'D', label: 'Data di Redis berbeda dengan data di database karena replikasi asinkron.' },
    ],
    correctOptionId: 'B',
    explanation: 'Cache stampede terjadi saat hot cache key kadaluarsa, menyebabkan banyak thread serentak query ke database untuk meregenerasi cache. Mitigasinya: Distributed Mutex/Locking (hanya 1 thread rebuild cache), Probabilistic Early Expiration (XFetch), atau background periodic cache warming.'
  },
  {
    id: 'be-016',
    track: 'backend',
    category: 'Caching & Redis',
    companyTag: 'Tokopedia High Concurrency',
    difficulty: 'Mid-Senior',
    question: 'Bagaimana cara mencegah "Cache Penetration" saat hacker membanjiri sistem dengan request ID produk yang memang tidak ada di database?',
    options: [
      { id: 'A', label: 'Menaikkan connection pool Redis.' },
      { id: 'B', label: 'Menyimpan null/empty value dengan short TTL di cache atau menggunakan Bloom Filter di depan cache.' },
      { id: 'C', label: 'Menghapus cache secara berkala setiap 5 menit.' },
      { id: 'D', label: 'Mengganti Redis dengan MongoDB in-memory cluster.' },
    ],
    correctOptionId: 'B',
    explanation: 'Cache Penetration terjadi saat request menanyakan key yang tidak ada di cache maupun DB, sehingga semua request tembus langsung ke DB. Mitigasi: Cache empty/null value dengan TTL singkat atau gunakan Bloom Filter yang sangat efisien memori untuk menolak key yang pasti tidak ada sebelum query DB.'
  },
  {
    id: 'be-017',
    track: 'backend',
    category: 'Redis Internals',
    companyTag: 'Shopee Backend OA',
    difficulty: 'Mid',
    question: 'Mengapa Redis standar (core engine) mampu mencapai 100.000+ operations per second meskipun arsitektur utamanya single-threaded?',
    options: [
      { id: 'A', label: 'Karena seluruh data dikompresi dengan algoritma GZIP.' },
      { id: 'B', label: 'Operasi di memory (RAM), struktur data efisien, dan Non-blocking I/O multiplexing (epoll/kqueue) tanpa thread context switching overhead.' },
      { id: 'C', label: 'Redis menggunakan GPU acceleration untuk eksekusi perintah query.' },
      { id: 'D', label: 'Redis mengabaikan verifikasi tipe data dan hashing.' },
    ],
    correctOptionId: 'B',
    explanation: 'Redis mengeksekusi perintah murni di RAM tanpa disk I/O latency, mengeliminasi CPU context switching antar thread, dan memanfaatkan I/O multiplexing (seperti epoll) untuk menangani ribuan socket koneksi klien secara concurrent.'
  },

  // ─── 6. Distributed Systems, Kafka & Microservices ───
  {
    id: 'be-018',
    track: 'backend',
    category: 'Distributed Systems',
    companyTag: 'GoTo Microservices',
    difficulty: 'Senior',
    question: 'Di Apache Kafka, bagaimana cara memastikan bahwa seluruh event pesanan dari user yang sama (`order_created`, `order_paid`, `order_delivered`) diproses secara berurutan (in-order)?',
    options: [
      { id: 'A', label: 'Mengatur total partition Kafka topic menjadi 100 partition.' },
      { id: 'B', label: 'Menggunakan `userId` atau `orderId` sebagai Partition Key pesan Kafka.' },
      { id: 'C', label: 'Menambahkan timestamp manual di body JSON payload pesan.' },
      { id: 'D', label: 'Menggunakan Consumer Group dengan 50 consumer thread berbeda.' },
    ],
    correctOptionId: 'B',
    explanation: 'Kafka hanya menjamin urutan pesan (total ordering) di dalam partisi yang SAMA. Dengan menggunakan key yang konsisten (seperti `orderId` atau `userId`), Kafka hashing algorithm memastikan semua pesan dengan key tersebut selalu masuk ke partisi yang sama dan diproses berurutan.'
  },
  {
    id: 'be-019',
    track: 'backend',
    category: 'Microservices Architecture',
    companyTag: 'Traveloka Systems',
    difficulty: 'Senior',
    question: 'Dalam arsitektur Microservices tanpa 2-Phase Commit (2PC), pola arsitektur apa yang digunakan untuk mengelola transaksi terdistribusi antar service dengan kompensasi rollback?',
    options: [
      { id: 'A', label: 'Saga Pattern (Choreography atau Orchestration)' },
      { id: 'B', label: 'B-Tree Federation Pattern' },
      { id: 'C', label: 'Proxy Chaining Pattern' },
      { id: 'D', label: 'Single Database Shared Schema' },
    ],
    correctOptionId: 'A',
    explanation: 'Saga Pattern memecah transaksi global menjadi serangkaian transaksi lokal di setiap microservice. Jika salah satu step gagal, Saga mengeksekusi serangkaian Compensating Transactions (rollback logic) untuk membatalkan perubahan yang sudah terjadi di step sebelumnya.'
  },
  {
    id: 'be-020',
    track: 'backend',
    category: 'Payment Reliability',
    companyTag: 'Xendit Payment Gateway',
    difficulty: 'Mid-Senior',
    question: 'Saat mengintegrasikan Webhook pembayaran bank yang menerapkan retry hingga 5 kali, mekanisme apa yang WAJIB diterapkan backend untuk mencegah user di-kreditkan saldo berulang kali?',
    options: [
      { id: 'A', label: 'Rate Limiting pada IP address Webhook bank.' },
      { id: 'B', label: 'Idempotency Key / Deduping Table berdasarkan `payment_reference_id` yang unik di database.' },
      { id: 'C', label: 'Menolak semua request webhook kedua dan seterusnya dengan status 500.' },
      { id: 'D', label: 'Memproses webhook hanya pada jam kerja 09:00 - 17:00.' },
    ],
    correctOptionId: 'B',
    explanation: 'Network retry tidak terhindarkan di distributed payments. Backend wajib memeriksa apakah `payment_reference_id` atau `idempotency_key` sudah pernah sukses diproses di tabel transaksi. Jika sudah, backend langsung mengembalikan HTTP 200 OK tanpa mengulang penambahan saldo.'
  },

  // ─── 7. Security & Authentication ───
  {
    id: 'be-021',
    track: 'backend',
    category: 'Auth & Security',
    companyTag: 'Tokopedia OA',
    difficulty: 'Mid',
    question: 'Pernyataan mana yang BENAR mengenai struktur JSON Web Token (JWT)?',
    options: [
      { id: 'A', label: 'Payload JWT dienkripsi secara default sehingga data sensitif seperti password aman disimpan di dalamnya.' },
      { id: 'B', label: 'Payload JWT hanya di-encode dengan Base64Url (bisa dibaca publik tanpa secret key), namun integritasnya dilindungi Signature kriptografi.' },
      { id: 'C', label: 'JWT tidak dapat digunakan tanpa menghubungi database session table pada setiap request.' },
      { id: 'D', label: 'Header JWT tidak dapat dibaca oleh browser atau klien.' },
    ],
    correctOptionId: 'B',
    explanation: 'JWT (Header.Payload.Signature) menggunakan encoding Base64Url biasa pada payload, bukan enkripsi. Siapa pun dapat membaca data payload di jwt.io. Signature memastikan payload tidak diotak-atik (tampered) oleh penyerang tanpa rahasia private/secret key.'
  },
  {
    id: 'be-022',
    track: 'backend',
    category: 'API Security',
    companyTag: 'Blibli Core Tech',
    difficulty: 'Mid-Senior',
    question: 'Apa tujuan browser mengirimkan HTTP Request dengan method OPTIONS (Preflight Request) sebelum request utama CORS dikirimkan?',
    options: [
      { id: 'A', label: 'Menghitung waktu round-trip latency antara browser dan server.' },
      { id: 'B', label: 'Meminta izin server apakah Origin, Method, atau Custom Header request non-simple diperbolehkan sebelum request riil dieksekusi.' },
      { id: 'C', label: 'Mengunduh sertifikat SSL/TLS dari domain target.' },
      { id: 'D', label: 'Memeriksa apakah server mendukung HTTP/3 QUIC.' },
    ],
    correctOptionId: 'B',
    explanation: 'Untuk request non-simple (misal memakai `Content-Type: application/json` atau custom auth header), browser otomatis mengirim HTTP OPTIONS preflight untuk memverifikasi apakah server mengizinkan cross-origin request tersebut via header `Access-Control-Allow-Origin` dan `Access-Control-Allow-Headers`.'
  },

  // ─── 8. Golang / Concurrency & Backend Fundamentals ───
  {
    id: 'be-023',
    track: 'backend',
    category: 'Go Concurrency',
    companyTag: 'Tokopedia Go Track',
    difficulty: 'Mid-Senior',
    question: 'Pada bahasa Go, apa yang terjadi jika goroutine mencoba membaca dari unbuffered channel yang tidak ada goroutine lain yang menulis ke channel tersebut?',
    codeSnippet: `ch := make(chan int)
val := <-ch
fmt.Println(val)`,
    codeLanguage: 'go',
    options: [
      { id: 'A', label: 'Variabel val otomatis bernilai 0 (zero value) tanpa error.' },
      { id: 'B', label: 'Goroutine akan mengalami blocking permanen hingga terjadi fatal error: all goroutines are asleep - deadlock!' },
      { id: 'C', label: 'Fungsi mengembalikan runtime error panic: nil pointer dereference.' },
      { id: 'D', label: 'Channel otomatis ditutup dan program selesai.' },
    ],
    correctOptionId: 'B',
    explanation: 'Unbuffered channel di Go membutuhkan pengirim dan penerima yang siap secara sinkron. Jika goroutine utama membaca channel tanpa ada goroutine lain yang mengirim data, Go runtime mendeteksi kondisi kebuntuan dan melempar `fatal error: all goroutines are asleep - deadlock!`.'
  },
  {
    id: 'be-024',
    track: 'backend',
    category: 'Go Memory & Pointers',
    companyTag: 'GoTo Screening',
    difficulty: 'Mid',
    question: 'Apa output dari potongan kode Go berikut?',
    codeSnippet: `package main
import "fmt"

func update(nums []int) {
  nums[0] = 99
  nums = append(nums, 100)
}

func main() {
  arr := []int{1, 2, 3}
  update(arr)
  fmt.Println(arr)
}`,
    codeLanguage: 'go',
    options: [
      { id: 'A', label: '[99 2 3]' },
      { id: 'B', label: '[1 2 3]' },
      { id: 'C', label: '[99 2 3 100]' },
      { id: 'D', label: '[1 2 3 100]' },
    ],
    correctOptionId: 'A',
    explanation: 'Slice header (pointer ke array, len, cap) dioper secara pass-by-value. Mengubah elemen `nums[0] = 99` memodifikasi underlying array yang sama. Namun operasi `append` di dalam fungsi mengubah copy slice header lokal (panjang bertambah) sehingga `arr` di `main` tetap memiliki panjang 3: `[99, 2, 3]`.'
  },
  {
    id: 'be-025',
    track: 'backend',
    category: 'System Design & Scalability',
    companyTag: 'Shopee High Throughput',
    difficulty: 'Senior',
    question: 'Algoritma hashing apa yang digunakan pada Distributed Caching / Memcached cluster untuk meminimalkan re-mapping keys saat jumlah server cache ditambah atau dikurangi?',
    options: [
      { id: 'A', label: 'Consistent Hashing (dengan Virtual Nodes/Ring)' },
      { id: 'B', label: 'Modulo Hashing (Hash(key) % N)' },
      { id: 'C', label: 'SHA-256 Checksum Hashing' },
      { id: 'D', label: 'Round Robin Load Balancing' },
    ],
    correctOptionId: 'A',
    explanation: 'Jika menggunakan modulo `hash(key) % N`, menambah 1 server (N -> N+1) menyebabkan hampir 100% key ter-remap ke server yang salah (cache miss masif). Consistent Hashing memetakan key dan server ke sebuah cincin lingkaran (ring), sehingga hanya $K/N$ key yang berpindah saat node bertambah/berkurang.'
  },

  // ─── Extra Bank Soal (Randomized Pool) ───
  {
    id: 'be-026',
    track: 'backend',
    category: 'Database Transactions',
    companyTag: 'BCA Digital',
    difficulty: 'Mid-Senior',
    question: 'Apa perbedaan antara COMMIT dan ROLLBACK pada transaksi database relational?',
    options: [
      { id: 'A', label: 'COMMIT menyimpan perubahan secara permanen ke database; ROLLBACK membatalkan seluruh perubahan yang belum di-commit.' },
      { id: 'B', label: 'COMMIT mengunci tabel; ROLLBACK membuka kunci tabel.' },
      { id: 'C', label: 'COMMIT menghapus log transaksi; ROLLBACK mereplikasi log ke slave.' },
      { id: 'D', label: 'COMMIT hanya bekerja pada memory cache; ROLLBACK menulis ke disk.' },
    ],
    correctOptionId: 'A',
    explanation: 'Sifat Atomicity pada ACID menjamin bahwa transaksi bersifat all-or-nothing. Jika terjadi kegagalan atau error bisnis, perintah ROLLBACK mengembalikan database ke keadaan persis sebelum transaksi dimulai, sedangkan COMMIT mengabadikan perubahan.'
  },
  {
    id: 'be-027',
    track: 'backend',
    category: 'Node.js Streams',
    companyTag: 'Tokopedia OA',
    difficulty: 'Mid-Senior',
    question: 'Saat meng-upload atau memproses file CSV 5GB di Node.js, mengapa menggunakan Stream (misal fs.createReadStream) jauh lebih disarankan daripada fs.readFile?',
    options: [
      { id: 'A', label: 'fs.readFile mengenkripsi file sehingga CPU menjadi 100% overload.' },
      { id: 'B', label: 'fs.readFile memuat seluruh 5GB file ke RAM sekaligus (menyebabkan JavaScript heap out of memory crash).' },
      { id: 'C', label: 'fs.createReadStream otomatis mengonversi CSV menjadi SQL insert statement.' },
      { id: 'D', label: 'Node.js melarang penggunaan fs.readFile untuk file berekstensi .csv.' },
    ],
    correctOptionId: 'B',
    explanation: '`fs.readFile` membaca seluruh isi file ke dalam satu buffer di memori. Node.js V8 memiliki batas memory heap default (~1.4GB - 2GB), sehingga membaca file 5GB akan langsung menyebabkan crash `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.'
  },
  {
    id: 'be-028',
    track: 'backend',
    category: 'API Rate Limiting',
    companyTag: 'Traveloka Core',
    difficulty: 'Mid-Senior',
    question: 'Algoritma rate limiting mana yang memungkinkan sejumlah "burst" request dalam waktu singkat tetapi tetap mempertahankan rata-rata throughput yang stabil?',
    options: [
      { id: 'A', label: 'Token Bucket / Leaky Bucket' },
      { id: 'B', label: 'Fixed Window Counter' },
      { id: 'C', label: 'Round Robin Counter' },
      { id: 'D', label: 'Consistent Ring Bucket' },
    ],
    correctOptionId: 'A',
    explanation: 'Token Bucket mengumpulkan token secara berkala dengan laju konstan hingga kapasitas tertentu. Klien dapat menghabiskan akumulasi token sekaligus saat traffic burst, namun setelah token habis, request akan dibatasi sesuai laju regenerasi token.'
  },
  {
    id: 'be-029',
    track: 'backend',
    category: 'Database Deadlocks',
    companyTag: 'DANA Fintech Screening',
    difficulty: 'Senior',
    question: 'Kondisi berikut terjadi di database: Transaksi 1 mengunci Akun A lalu mencoba mengunci Akun B; secara bersamaan Transaksi 2 mengunci Akun B lalu mencoba mengunci Akun A. Kondisi ini disebut apa dan bagaimana cara pencegahannya?',
    options: [
      { id: 'A', label: 'Race Condition; dicegah dengan menonaktifkan Foreign Key.' },
      { id: 'B', label: 'Deadlock; dicegah dengan memastikan penguncian resource selalu dilakukan dalam urutan ID yang sama dan konsisten.' },
      { id: 'C', label: 'Phantom Read; dicegah dengan index UNIQUE.' },
      { id: 'D', label: 'Dirty Read; dicegah dengan Read Uncommitted level.' },
    ],
    correctOptionId: 'B',
    explanation: 'Ini adalah Deadlock klasik (circular wait). Cara mencegahnya pada kode aplikasi adalah menerapkan urutan penguncian yang deterministik (misalnya selalu mengunci ID yang lebih kecil terlebih dahulu: `sort([idA, idB])` sebelum melakukan `SELECT FOR UPDATE`).'
  },
  {
    id: 'be-030',
    track: 'backend',
    category: 'Microservices Communication',
    companyTag: 'Shopee OA',
    difficulty: 'Mid-Senior',
    question: 'Kelebihan utama menggunakan gRPC (Protocol Buffers via HTTP/2) dibandingkan REST API (JSON via HTTP/1.1) untuk komunikasi antar-service internal adalah:',
    options: [
      { id: 'A', label: 'Payload binary compact efisien, strict schema typing, multiplexing connection, dan latency sangat rendah.' },
      { id: 'B', label: 'gRPC dapat dibuka langsung di address bar browser tanpa perlu format khusus.' },
      { id: 'C', label: 'gRPC tidak memerlukan koneksi TCP/IP untuk bertukar data.' },
      { id: 'D', label: 'gRPC otomatis menyimpan cache response di browser user.' },
    ],
    correctOptionId: 'A',
    explanation: 'Protocol Buffers menghasilkan serialisasi biner yang jauh lebih kecil dan cepat di-parse dibanding JSON teks. Dipadukan dengan HTTP/2 multiplexing (mengirim banyak request concurrent lewat 1 koneksi TCP), gRPC sangat ideal untuk inter-service latency rendah.'
  },
  {
    id: 'be-031',
    track: 'backend',
    category: 'SQL Performance',
    companyTag: 'Tokopedia OA',
    difficulty: 'Mid',
    question: 'Kapan index B-Tree pada kolom `is_active` (tipe BOOLEAN dengan 95% bernilai TRUE dan 5% FALSE) TIDAK akan digunakan oleh query optimizer saat mencari `WHERE is_active = true`?',
    options: [
      { id: 'A', label: 'Karena low cardinality; membaca 95% data via index scan lebih lambat daripada sequential table scan.' },
      { id: 'B', label: 'Database relational melarang index pada tipe data boolean.' },
      { id: 'C', label: 'Karena B-Tree hanya dapat mengindeks data teks string.' },
      { id: 'D', label: 'Karena klausa WHERE memerlukan minimal dua kondisi filter.' },
    ],
    correctOptionId: 'A',
    explanation: 'Query optimizer memperhitungkan Selectivity dan Cardinality. Jika sebuah nilai mencakup 90-95% dari seluruh tabel, melakukan index lookup lalu random I/O ke heap table justru lebih mahal daripada Sequential Scan langsung.'
  },
  {
    id: 'be-032',
    track: 'backend',
    category: 'API Design',
    companyTag: 'GoTo Screening',
    difficulty: 'Junior-Mid',
    question: 'HTTP status code manakah yang harus dikembalikan server saat client berhasil membuat data baru (misal registrasi atau create order)?',
    options: [
      { id: 'A', label: '200 OK' },
      { id: 'B', label: '201 Created' },
      { id: 'C', label: '204 No Content' },
      { id: 'D', label: '202 Accepted' },
    ],
    correctOptionId: 'B',
    explanation: 'Status 201 Created adalah status code standar untuk mengonfirmasi bahwa request berhasil dan telah menciptakan resource baru di server (seringkali disertai header `Location`).'
  },
  {
    id: 'be-033',
    track: 'backend',
    category: 'Node.js Memory Leak',
    companyTag: 'Blibli Core Tech',
    difficulty: 'Mid-Senior',
    question: 'Manakah pola kode Node.js berikut yang PALING sering menyebabkan memory leak di production server?',
    options: [
      { id: 'A', label: 'Menambahkan event listener `emitter.on(...)` berulang kali di dalam request handler tanpa pernah memanggil `removeListener`.' },
      { id: 'B', label: 'Menggunakan `const` alih-alih `let` untuk deklarasi variabel.' },
      { id: 'C', label: 'Membuat array dengan panjang 100 elemen di dalam fungsi lokal.' },
      { id: 'D', label: 'Mengembalikan Promise dari async function.' },
    ],
    correctOptionId: 'A',
    explanation: 'EventEmitter menyimpan referensi ke callback function di listener array. Jika event listener global didaftarkan pada setiap HTTP request masuk tanpa dibersihkan, referensi closure tersebut tidak dapat di-garbage collect oleh V8 engine, mengakibatkan heap memory membengkak hingga crash.'
  },
  {
    id: 'be-034',
    track: 'backend',
    category: 'Security & Hashing',
    companyTag: 'Fintech Security',
    difficulty: 'Mid',
    question: 'Mengapa algoritma MD5 atau SHA-256 mentah TIDAK BOLEH digunakan untuk menyimpan password user di database, dan disarankan memakai Argon2 atau Bcrypt?',
    options: [
      { id: 'A', label: 'MD5 dan SHA-256 terlalu lambat untuk verifikasi login.' },
      { id: 'B', label: 'MD5/SHA-256 adalah general-purpose hash yang sangat cepat dihitung oleh GPU (miliaran hash/detik), sehingga rentan brute-force dan rainbow table.' },
      { id: 'C', label: 'Bcrypt menghasilkan output string yang lebih pendek daripada MD5.' },
      { id: 'D', label: 'SHA-256 hanya bisa digunakan pada sistem operasi Linux 32-bit.' },
    ],
    correctOptionId: 'B',
    explanation: 'Password hashing membutuhkan fungsi "slow/work-factor adjustable" (key derivation function) seperti Bcrypt atau Argon2. Algoritma SHA-256 sengaja didesain super cepat untuk checksum data, sehingga hardware GPU modern mampu menebak miliaran kombinasi per detik jika DB bocor.'
  },
  {
    id: 'be-035',
    track: 'backend',
    category: 'Distributed Tracing',
    companyTag: 'Traveloka Systems',
    difficulty: 'Mid-Senior',
    question: 'Saat melacak request pengguna yang melewati puluhan microservices berbeda (Observability/Tracing), identifier apa yang disematkan pada HTTP Header setiap hop?',
    options: [
      { id: 'A', label: 'Correlation ID / Trace ID (OpenTelemetry W3C traceparent)' },
      { id: 'B', label: 'Database Table Primary Key' },
      { id: 'C', label: 'Client IP Address' },
      { id: 'D', label: 'JWT Signature String' },
    ],
    correctOptionId: 'A',
    explanation: 'Correlation ID atau Trace ID (standar W3C Trace Context `traceparent`) dioper dari API gateway ke seluruh downstream services melalui HTTP Header agar log dari semua service dapat diagregasi dalam satu tampilan trace di Jaeger atau Datadog.'
  }
];

# INTERVIEW_PLAYBOOK_STATE.md — Technical & User Interview Master Playbook

> **Target Roles**: Backend Engineer & Full Stack Engineer  
> **Primary Tech Stack**: Python (FastAPI), TypeScript (Next.js / React), PostgreSQL, Redis, Docker, System Architecture  
> **Document Purpose**: Single Source of Truth (SSOT) untuk persiapan, simulasi prediktif, dan response framing pada User & Technical Interview. Dokumen ini dapat di-attach langsung ke AI (Antigravity / Gemini Desktop / Claude) untuk menjalankan simulasi wawancara interaktif.

---

## 1. CANDIDATE PROFILE & CONTEXT INJECTION

```yaml
candidate_context:
  name: "Software Engineer (Backend / Full Stack Specialist)"
  core_strengths:
    - "Clean Architecture, SOLID Principles, and Modular Monolith / Microservices"
    - "High-performance REST API engineering with Python (FastAPI) and Node.js/TypeScript"
    - "Modern Full Stack architecture using Next.js (App Router, RSC, SSR/ISR)"
    - "Database design, transaction integrity (ACID), and query tuning (PostgreSQL)"
    - "Domain expertise: ERP, POS, E-Commerce, Logic Assessment Engine, LMS"
  communication_framework: "STAR Method (Situation, Task, Action, Result) + Why-How-Impact Structure"
```

---

## 2. BACKEND ENGINEER INTERVIEW PLAYBOOK

### Q1: SOLID Principles dalam Real-World Backend Engineering
**Tujuan Interviewer:** Menguji pemahaman arsitektur software yang scalable, maintainable, dan testable.

* **Single Responsibility Principle (SRP):**
  * *Konsep:* Satu class / module hanya memiliki satu alasan untuk berubah (satu aktor bisnis).
  * *Praktik:* Pisahkan `OrderService` (orchestration bisnis), `PaymentGatewayAdapter` (komunikasi ke payment gateway), `OrderRepository` (I/O database), dan `InvoiceNotificationService` (email/WhatsApp). Hindari model "Fat Controller" / "Fat Model" yang melakukan validasi, query, payment, dan generate PDF dalam satu fungsi.
* **Open/Closed Principle (OCP):**
  * *Konsep:* Terbuka untuk ekstensi, tertutup untuk modifikasi langsung kode inti.
  * *Praktik:* Implementasi **Strategy Pattern** untuk Payment Processor. Definisikan interface `PaymentProvider`. Jika ada metode pembayaran baru (e.g. QRIS, Virtual Account, Credit Card), buat class baru yang mengimplementasikan interface tanpa perlu mengubah kode `checkout()` inti.
* **Liskov Substitution Principle (LSP):**
  * *Konsep:* Subclass harus dapat menggantikan Parent class tanpa merusak ekspektasi perilaku program.
  * *Praktik:* Jika `BaseRepository` memiliki method `delete(id)`, implementasi `ReadOnlyRepository` tidak boleh melempar `NotImplementedError` atau crash saat dipanggil. Sebaiknya pisahkan menjadi `ReadableRepository` dan `WritableRepository`.
* **Interface Segregation Principle (ISP):**
  * *Konsep:* Client tidak boleh dipaksa bergantung pada method/interface yang tidak digunakannya.
  * *Praktik:* Buat interface/Protocol kecil dan spesifik. Daripada membuat `IUserService` raksasa dengan 30 method, pecah menjadi `IUserAuthenticator`, `IUserProfileReader`, `IUserRoleManager`.
* **Dependency Inversion Principle (DIP):**
  * *Konsep:* High-level module tidak boleh bergantung pada Low-level module; keduanya harus bergantung pada abstraksi (Interface / Abstract Base Class).
  * *Praktik:* Menggunakan **FastAPI Dependency Injection** (`Depends()`). `OrderService` bergantung pada abstraksi `AbstractOrderRepository`, bukan langsung hardcoded instance `SQLAlchemyPostgresRepository`. Hal ini memudahkan *unit testing* dengan *mock repository* tanpa database asli.

---

### Q2: Domain Knowledge: ERP & POS (Point of Sale)
**Tujuan Interviewer:** Menguji pemahaman domain bisnis transaksional, konsistensi data, dan arsitektur ritel/enterprise.

* **Apa itu ERP (Enterprise Resource Planning)?**
  * Sistem terintegrasi yang mengelola seluruh proses inti bisnis multi-departemen: Inventory/Warehouse, Purchasing, Sales, Accounting/Ledger, HR, dan Manufacturing.
  * *Karakteristik Teknis:* Multi-company, multi-currency, role-based access control (RBAC) granular, audit logging ketat, double-entry bookkeeping (debit = credit), serta complex batch processing (reconciliation, closing period).
* **Apa itu POS (Point of Sale)?**
  * Sistem checkout garda depan di gerai/toko fisik untuk mencatat penjualan langsung, cetak struk, scan barcode, split payment, dan update inventaris secara real-time.
  * *Karakteristik Teknis:* Membutuhkan response time sub-second, offline-first capability (bisa transaksi saat internet toko drop lalu sync ke cloud), hardware integration (ESC/POS printer, barcode scanner, cash drawer, EDC).
* **Tantangan Kritis & Solusi Teknis:**
  1. **Race Condition Stock / Overselling:**
     * *Problem:* 2 kasir menjual barang terakhir di milidetik yang sama.
     * *Solusi:* Gunakan **Pessimistic Locking** (`SELECT ... FOR UPDATE`) atau **Atomic Database Updates** (`UPDATE products SET stock = stock - 1 WHERE id = 10 AND stock >= 1;`). Jika rows affected = 0, tolak transaksi.
  2. **Idempotency Transaksi Finansial:**
     * *Solusi:* Header `Idempotency-Key` (UUIDv4) disimpan di Redis dengan distributed lock agar retry network tidak memotong saldo/stock dua kali.

---

### Q3: Bagaimana Menilai & Membangun REST API yang Baik?
**Tujuan Interviewer:** Mengevaluasi standar engineering, keamanan, reliabilitas, dan developer experience (DX).

1. **Semantic HTTP & Predictable Status Codes:**
   * `200 OK` (Fetch/Update berhasil), `201 Created` (Resource baru + header `Location`), `204 No Content` (Delete berhasil).
   * `400 Bad Request` (Payload malformed), `401 Unauthorized` (Token invalid/missing), `403 Forbidden` (Token valid tapi role tidak punya izin), `404 Not Found`, `409 Conflict` (Duplicate entry/state conflict), `422 Unprocessable Entity` (Schema validation error).
   * `500 Internal Server Error`, `503 Service Unavailable`.
2. **Contract & Schema Validation:**
   * Menggunakan schema strictly typed (Pydantic di FastAPI / Zod di Node.js).
   * Otomatisasi OpenAPI 3.0 / Swagger documentation.
   * Semantic Versioning pada URI (`/api/v1/orders`) atau Header (`Accept: application/vnd.app.v1+json`).
3. **Idempotency & Safety:**
   * GET, HEAD, OPTIONS harus Safe (tidak mengubah state server).
   * PUT dan DELETE harus Idempotent.
   * POST non-idempotent dilindungi dengan header `Idempotency-Key`.
4. **Standardized Error Responses:**
   * Mengadopsi **RFC 7807 (Problem Details for HTTP APIs)**:
     ```json
     {
       "type": "https://api.example.com/errors/insufficient-stock",
       "title": "Insufficient Stock",
       "status": 409,
       "detail": "Product SKU-123 only has 2 items left, requested 5",
       "instance": "/api/v1/orders/checkout",
       "timestamp": "2026-08-27T10:00:00Z"
     }
     ```
5. **Observability & Security:**
   * Structured JSON Logging dengan `Correlation-ID` / `Trace-ID` yang di-pass antar service.
   * Rate limiting (Token Bucket / Leaky Bucket via Redis).
   * Least-privilege authentication (JWT dengan short expiry + Refresh Token rotation).

---

### Q4: Mengoptimasi API agar Terhindar dari Timeout (504 Gateway Timeout)
**Tujuan Interviewer:** Menguji troubleshooting performa, scaling strategi, dan concurrency.

```
                  [Client Request]
                         │
                  [API Gateway / Nginx] (Timeouts: 30s)
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    [Read Path]                  [Heavy Write / Processing Path]
    • Redis Cache-Aside          • Fast ACK with 202 Accepted
    • Cursor Pagination          • Push to Message Broker (Celery/RabbitMQ)
    • DB Index Tuning            • Async Background Worker
    • PgBouncer Connection Pool  • Webhook / SSE / Polling for status
```

* **Langkah Optimasi Menyeluruh:**
  1. **Database Query Optimization:**
     * Eksekusi `EXPLAIN (ANALYZE, BUFFERS)` untuk mendeteksi *Seq Scan*, disk spill, atau slow joins.
     * Buat Index yang tepat: B-Tree untuk equality/range, Composite Index untuk filter multi-kolom (ikuti rule *Equality -> Range -> Sort*), Partial Index untuk filtering status aktif (`WHERE status = 'ACTIVE'`).
     * Atasi **N+1 Problem**: Gunakan Eager Loading (`selectinload` / `joinedload` di SQLAlchemy).
     * Connection Pooling: Pasang **PgBouncer** untuk mencegah overhead pembuatan TCP handshake Postgres yang mahal.
  2. **Asynchronous Decoupling (Background Jobs):**
     * Jangan lakukan I/O lambat (generate PDF, kirim email, broadcast webhook, third-party payment settlement) di dalam lifecycle HTTP request-response.
     * Return response langsung `202 Accepted` dengan `job_id`, dan serahkan pekerjaan berat ke **Celery / ARQ / Redis Queue / RabbitMQ**.
  3. **Multi-tier Caching:**
     * Gunakan **Cache-Aside Pattern** dengan Redis untuk endpoint data yang sering dibaca namun jarang berubah.
     * Pasang TTL yang terukur dan cegah *Cache Stampede* menggunakan mutex lock / probabilistic early expiration.
  4. **Pagination & Field Filtering:**
     * Ganti Offset Pagination (`OFFSET 100000 LIMIT 20` yang melakukan full scan) dengan **Cursor-based / Keyset Pagination** (`WHERE id > :last_seen_id ORDER BY id ASC LIMIT 20`).
  5. **Client Timeout & Circuit Breaker:**
     * Atur timeout strict saat memanggil 3rd party API (e.g. `timeout=5.0s` di `httpx`).
     * Pasang **Circuit Breaker** (jika 3rd party down 5 kali beruntun, langsung fail-fast tanpa menunggu timeout).

---

### Q5: PostgreSQL vs Database Lain — Keunggulan & Mengapa Memilihnya
**Tujuan Interviewer:** Menguji kedalaman database engineering candidate.

* **Keunggulan Unik PostgreSQL:**
  1. **MVCC (Multi-Version Concurrency Control) yang Superior:**
     * Readers tidak pernah mem-block Writers, dan Writers tidak mem-block Readers. Menjamin throughput read/write tinggi pada sistem multi-user (seperti POS/ERP).
  2. **Kepatuhan ACID & Data Integrity:**
     * Mendukung Foreign Keys, Check Constraints, Table Partitioning native, dan transactional DDL (bisa `ROLLBACK` migration tabel yang gagal di tengah jalan).
  3. **Advanced Indexing Types:**
     * **B-Tree** (default), **GIN** (Generalized Inverted Index — luar biasa untuk array & JSONB), **GiST** (Geometri/Search), **BRIN** (Block Range Index — hemat storage untuk time-series data terurut jutaan row).
  4. **JSONB Support (Best of Both Relational & Document):**
     * `JSONB` menyimpan data biner terindeks, mendukung indexing kolom di dalam payload JSON via GIN Index. Kita mendapatkan fleksibilitas dokumen NoSQL tanpa kehilangan konsistensi ACID relational.
  5. **Ekosistem Extensions yang Tak Tertandingi:**
     * `pgvector` (Vector search untuk AI/LLM), `PostGIS` (Sistem GIS/geospasial kelas dunia), `pg_trgm` (Fuzzy string search & autocomplete), `timescaledb` (Time-series).
* **Perbandingan Langsung:**
  * *vs MySQL:* PostgreSQL jauh lebih unggul dalam complex queries, window functions, CTEs (`WITH RECURSIVE`), subquery planner, dan handling tipe data kompleks (array, composite types, JSONB operations).
  * *vs MongoDB:* PostgreSQL menjamin integritas finansial tanpa risiko orphaned data akibat ketiadaan Foreign Key constraints.

---

### Q6: Kenapa FastAPI & Apa Keunggulannya Dibanding Framework Python Lain?
**Tujuan Interviewer:** Memahami alasan pemilihan framework, keunggulan performa, dan modern Python features.

* **Keunggulan Utama FastAPI:**
  1. **ASGI Native & Asyncio Concurrency:**
     * Berjalan di atas **Starlette** dan **Uvicorn**. Mendukung non-blocking asynchronous I/O (`async def` / `await`), mampu menangani ribuan concurrent connections per detik dengan memory footprint rendah.
  2. **Pydantic v2 Integration (Rust Engine):**
     * Core Pydantic ditulis ulang dalam Rust. Validasi schema request/response, serialisasi, dan parsing tipe data terjadi dengan kecepatan native compiled code.
  3. **Automatic OpenAPI (Swagger UI & ReDoc) Generation:**
     * Cukup definisikan tipe data Python (Type Hints), dokumentasi interaktif otomatis ter-generate di `/docs` dan `/redoc` tanpa konfigurasi manual tambahan.
  4. **First-Class Dependency Injection System (`Depends`):**
     * Memungkinkan decoupling arsitektur (auth checks, db sessions, security scopes, services) dengan sintaks yang sangat deklaratif, bersih, dan mudah di-mock saat unit test.
  5. **Developer Experience & Type Safety:**
     * Full auto-completion di IDE, meminimalkan human-error bug hingga 40% saat development.
* **Perbandingan:**
  * *vs Flask:* Flask bersifat synchronous (WSGI by default), membutuhkan banyak plugin pihak ketiga (Marshmallow, Flasgger) untuk menyamai fitur native FastAPI.
  * *vs Django:* Django adalah full-stack "batteries-included" monolith yang berat. Untuk microservices dan headless REST/GraphQL APIs, FastAPI jauh lebih ringan, modular, dan cepat.

---

## 3. FULL STACK ENGINEER INTERVIEW PLAYBOOK

### Q1: Framework Evaluasi & Presentasi Proyek (STAR Method)
**Tujuan Interviewer:** Menilai pengalaman teknis nyata, problem-solving, dan delivery impact.

```
[S - Situation]  → Konteks sistem, skala pengguna, bisnis constraint, dan masalah utama.
[T - Task]       → Tanggung jawab teknis spesifik yang harus diselesaikan.
[A - Action]     → Keputusan arsitektur, teknologi yang dipilih, dan langkah implementasi konkret.
[R - Result]     → Dampak kuantitatif (e.g. latency turun 60%, 99.9% uptime, revenue impact).
```

* **Contoh Jawaban High-Level:**
  > *"Pada proyek platform e-learning & assessment real-time, kami menghadapi masalah tingginya latency evaluasi submission kode dan bounce rate halaman landing akibat bundle JS yang besar (Situation). Tanggung jawab saya adalah merancang ulang arsitektur full stack dari monolithic SPA menjadi Next.js App Router dengan backend FastAPI (Task). Saya mengimplementasikan hybrid rendering (SSG untuk landing, ISR untuk katalog kursus, CSR + Web Worker sandbox untuk editor interaktif) serta mengoptimalkan database queries dengan indexing PostgreSQL dan Redis caching (Action). Hasilnya, First Contentful Paint turun dari 3.2 detik menjadi 0.8 detik, Core Web Vitals hijau 100%, dan server mampu menangani 5.000 concurrent user tanpa degradasi performa (Result)."*

---

### Q2: Next.js — Keunggulan Unik Dibanding Framework Lain (Vite/CRA, Remix, Nuxt)
**Tujuan Interviewer:** Menguji pemahaman arsitektur modern web, React 19, dan rendering pipeline.

* **Keunggulan Unik Next.js (App Router & React Server Components):**
  1. **React Server Components (RSC) by Default:**
     * Komponen server dirender di server dan tidak mengirimkan JavaScript bundle ke client. Mengurangi ukuran bundle JS client secara drastis, meningkatkan TTI (Time to Interactive), dan memungkinkan akses database/API langsung secara aman dari server component.
  2. **Hybrid Rendering Paradigm:**
     * Memberikan fleksibilitas dalam satu aplikasi: satu route bisa SSG, route lain SSR, halaman katalog ISR, dan dashboard CSR.
  3. **Built-in Production Optimizations:**
     * `next/image` (otomatis resize, konversi ke WebP/AVIF, lazy load).
     * `next/font` (zero layout shift, hosting font lokal otomatis).
     * `next/script` (prioritisasi loading 3rd party scripts).
     * Automatic Route Prefetching saat komponen `<Link>` masuk ke viewport.
  4. **Server Actions & Route Handlers:**
     * Server Actions memungkinkan mutasi data langsung dari form komponen tanpa perlu menulis boilerplate API endpoint terpisah, dengan full end-to-end TypeScript safety.
  5. **Edge Middleware:**
     * Menjalankan logic autentikasi, geo-routing, dan A/B testing di CDN Edge sebelum request menyentuh origin server.

---

### Q3: Deep Dive Rendering Strategies: CSR vs SSR vs SSG vs ISR
**Tujuan Interviewer:** Memastikan kandidat tidak salah memilih strategi rendering untuk use-case bisnis tertentu.

| Strategi | Kapan Dijalankan? | Mekanisme Kerja | Kelebihan | Kekurangan | Use Case Ideal |
|---|---|---|---|---|---|
| **CSR** *(Client-Side)* | Browser Runtime | Server kirim HTML kosong + bundle JS. Browser download JS lalu render DOM. | Interaksi cepat setelah load, server load sangat ringan. | SEO buruk, initial load (FCP) lambat, ketergantungan pada device client. | Admin Dashboard, Internal CMS, SaaS Tools di balik login. |
| **SSR** *(Server-Side)* | Setiap Request Masuk | Server merender HTML lengkap berisi data dinamis per HTTP request. | SEO sempurna, data selalu 100% up-to-date real-time. | TTFB lebih lambat, server compute load tinggi jika traffic masif. | Feed Sosial Media, Halaman Checkout Transaksi, Search Results. |
| **SSG** *(Static Gen)* | Build Time | HTML di-generate satu kali saat `next build` dan di-distribusikan ke CDN. | Super cepat (TTFB sub-50ms), hosting murah, tahan traffic spike masif. | Build time lama untuk jutaan halaman, data stale jika tidak di-rebuild. | Landing Page, Blog / Docs, Terms of Service, Privacy Policy. |
| **ISR** *(Incremental)* | Build + Background Revalidation | Static HTML disajikan dari CDN; setelah interval `revalidate: N` detik, Next.js rebuild halaman di background saat request masuk. | Kecepatan CDN SSG dengan kesegaran data dinamis tanpa rebuild seluruh web. | Ada kemungkinan user pertama melihat *stale data* sebelum revalidation selesai. | Katalog E-commerce, Halaman Detail Produk, Kursus / Assessment. |

---

### Q4: PostgreSQL vs MongoDB dalam Full Stack Architecture
**Tujuan Interviewer:** Menguji trade-off pemilihan database relational vs non-relational berdasarkan kebutuhan integritas bisnis.

```
                  ┌────────────────────────────────────────┐
                  │    PILIHAN DATABASE & ARSITEKTUR       │
                  └────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       POSTGRESQL (RELATIONAL)        │  │         MONGODB (DOCUMENT)           │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ • Strict ACID & Transaction Ledger   │  │ • Dynamic Polymorphic Schemas        │
│ • Foreign Keys & Referential Checks  │  │ • Rapid Prototyping (No Migrations)  │
│ • Complex Multi-table JOINs          │  │ • High-write Unstructured Logs       │
│ • JSONB for Semi-Structured Data     │  │ • Horizontal Auto-Sharding Native    │
│ • Ideal: ERP, POS, Billing, LMS      │  │ • Ideal: IoT Events, Chat, Realtime  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

* **Mengapa Memilih PostgreSQL dibanding MongoDB untuk Core Business Apps?**
  1. **Integritas Relasi & Constraint:**
     * Pada sistem POS/ERP/E-Commerce, data saling terhubung erat (`User` -> `Order` -> `OrderItem` -> `Inventory` -> `JournalLedger`). PostgreSQL menjamin tidak ada "data yatim" (orphaned records) berkat foreign key constraints dan cascading rules.
  2. **Complex Queries & Aggregations:**
     * PostgreSQL memiliki query planner canggih untuk multi-table joins, subqueries, Window Functions, dan CTEs yang sangat penting untuk reporting finansial dan analitik.
  3. **Fleksibilitas JSONB Tanpa Kehilangan ACID:**
     * Jika membutuhkan schema fleksibel (e.g. metadata kustom produk), kita cukup menggunakan kolom `JSONB` di PostgreSQL. Kita mendapatkan fitur NoSQL dokumen di dalam database yang memiliki garansi ACID.
* **Kapan MongoDB Lebih Tepat?**
  * Ketika struktur data sering berubah drastis tanpa skema pasti (unstructured telemetry, IoT sensor data, social media activity feed).
  * Kebutuhan horizontal scaling / auto-sharding out-of-the-box untuk traffic write yang luar biasa tinggi tanpa kompleksitas database clustering relational.

---

## 4. PREDICTIVE INTERVIEW SIMULATION PROMPTS (READY-TO-ATTACH)

Gunakan prompt di bawah ini saat melampirkan file ini ke Antigravity / Gemini Desktop untuk menjalankan roleplay interview yang sangat realistis:

### Prompt Template: Simulasi User & Technical Interview
```markdown
Halo Gemini / Antigravity! Saya melampirkan file INTERVIEW_PLAYBOOK_STATE.md ini sebagai referensi utama keahlian dan profil teknis saya.

TOLONG BERTINDAK SEBAGAI:
- Lead Engineering Manager / Principal Architect di perusahaan Tech Tier-1 (strict, analitis, menghargai fundamental kuat dan real-world production experience).

INSTRUKSI SIMULASI:
1. Mulai wawancara dengan menyapa saya dan tanyakan 1 pertanyaan pertama (pilih apakah Role Backend atau Full Stack berdasarkan permintaan saya).
2. Tunggu jawaban saya. Setelah saya menjawab, berikan:
   - Skor Jawaban (1 - 10)
   - Evaluasi Kritis (kekuatan & celah yang belum terjawab)
   - Jawaban Ideal / Senior-level refinement
3. Berikan pertanyaan lanjutan (follow-up deep dive) yang menantang edge cases (misal: concurrency, deadlock, memory leak, caching invalidation, atau SEO trade-off).
4. Lanjutkan pertanyaan satu per satu hingga selesai 5-6 ronde wawancara.

Saya ingin bersiap untuk role: [PILIH: BACKEND ENGINEER / FULL STACK ENGINEER]. Silakan ajukan pertanyaan pertama Anda!
```

---

## 5. QUICK REFERENCE CHEAT SHEET

| Topik | Kata Kunci Kritis (Drop these terms in Interview) |
|---|---|
| **SOLID** | SRP (Single Reason to Change), OCP (Strategy Pattern / Polymorphism), LSP (Substitutability Contract), ISP (Granular Protocols), DIP (Inversion of Control, FastAPI `Depends()`). |
| **ERP / POS** | Ledger Immutability, Double-Entry, Pessimistic Locking (`SELECT FOR UPDATE`), Atomic Stock Check, Idempotency-Key, Offline-First Sync. |
| **API Quality** | Semantic HTTP, RFC 7807 Problem Details, Idempotency, OpenAPI 3.0, Rate Limiting, Correlation-ID Tracing. |
| **API Timeout Fix** | `EXPLAIN ANALYZE`, Composite/Partial Index, N+1 Eager Loading, Redis Cache-Aside, Async Broker (Celery/RabbitMQ), Cursor Pagination, PgBouncer. |
| **PostgreSQL** | MVCC, ACID Compliance, `JSONB` + GIN Index, Advanced Indexing (BRIN, GiST), Extensions (`pgvector`, `PostGIS`), Transactional DDL. |
| **FastAPI** | ASGI, Starlette/Uvicorn, Pydantic v2 (Rust Core), Async/Await Non-blocking I/O, Autodoc OpenAPI, Dependency Injection. |
| **Next.js** | React Server Components (RSC), Hybrid Rendering, Server Actions, Zero-bundle JS, `next/image` & `next/font`, Edge Middleware. |
| **Rendering** | CSR (Client SPA), SSR (Dynamic per-request), SSG (Build-time static), ISR (Stale-while-revalidate background refresh). |
| **Postgres vs Mongo** | Referential Integrity (Foreign Keys), ACID Transaction vs Document Polymorphism, Window Functions vs Horizontal Sharding. |

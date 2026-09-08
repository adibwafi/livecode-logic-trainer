# Case Study 04: HackerRank Pokemon 1-151 Dynamic Fetcher & Pagination (React useEffect)

## ⚡ Latar Belakang & Konteks Live Coding
Dalam proses seleksi teknis posisi **Frontend Engineer (HTML5 / React)** di **Astra International** dan berbagai enterprise global yang menggunakan platform **HackerRank**, soal ini merupakan template uji kompetensi hands-on yang paling sering diujikan.

Bukan sekadar soal manipulasi string atau algoritma array murni, soal ini menguji **kemampuan fundamental arsitektur Frontend modern**:
1. Penanganan siklus hidup komponen (*lifecycle*) & *side-effects* menggunakan React Hook `useEffect`.
2. Asynchronous HTTP request ke REST API dinamis dengan parameter URL / ID.
3. State management terintegrasi (`data`, `loading`, `error`, `currentId`).
4. Boundary guards & UI state (*disabled buttons* pada batas minimum dan maksimum).
5. **Jebakan Utama (Seniority Indicator)**: Pencegahan *Race Condition* dan *Memory Leak* saat navigasi cepat menggunakan `AbortController`.

---

## 🎯 Spesifikasi Kebutuhan & User Story

### 1. Initial State & Rentang ID
- Rentang ID Pokemon yang valid adalah generasi pertama: **1 sampai 151**.
- State awal ID saat halaman pertama kali dimuat adalah **`1`** (Bulbasaur).
- Saat komponen pertama kali di-mount, aplikasi harus secara otomatis mem-fetch data Pokemon untuk ID awal (`1`).

### 2. Dynamic Fetching (`useEffect`)
- Setiap kali nilai `currentId` berubah, picu pemanggilan HTTP GET ke API endpoint:
  ```http
  GET https://pokeapi.co/api/v2/pokemon/:id
  ```
  *(atau dummy API endpoint yang disediakan dalam platform interview).*
- Sebelum request dikirim:
  - Ubah `loading` menjadi `true`.
  - Bersihkan pesan error sebelumnya (`error = null`).
- Jika request berhasil:
  - Simpan payload data Pokemon ke dalam state.
  - Ubah `loading` menjadi `false`.
- Jika request gagal (HTTP 4xx/5xx atau network failure):
  - Simpan pesan error ke dalam state.
  - Ubah `loading` menjadi `false`.

### 3. Navigasi & Kontrol Interaktif (Boundary Guards)
- **Tombol "Before" / "Previous"**:
  - Mengurangi `currentId` sebesar 1 (`currentId - 1`).
  - **Wajib di-disable (`disabled={true}`)** apabila:
    1. `currentId <= 1` (sudah mencapai batas minimum Pokemon pertama).
    2. Proses fetching sedang berlangsung (`loading === true`).
- **Tombol "Next"**:
  - Menambah `currentId` sebesar 1 (`currentId + 1`).
  - **Wajib di-disable (`disabled={true}`)** apabila:
    1. `currentId >= 151` (sudah mencapai batas maksimum Pokemon ke-151 / Mew).
    2. Proses fetching sedang berlangsung (`loading === true`).

### 4. Tampilan Antarmuka (HTML5 / TSX)
- **Indikator Loading**: Saat `loading === true`, tampilkan elemen loading atau skeleton indicator dengan teks seperti `"Loading Pokemon..."` dan atribut semantic `aria-busy="true"`.
- **Indikator Error**: Jika terjadi kegagalan fetch, tampilkan pesan error yang informatif beserta tombol retry bila diperlukan.
- **Card Data Pokemon**:
  - Nama Pokemon (format huruf kapital/title case, e.g. "Bulbasaur").
  - Nomor ID berformat resmi (e.g. `#001` atau `ID: 1`).
  - Gambar sprite atau official artwork (`sprites.front_default` atau `sprites.other['official-artwork'].front_default`).
  - Elemen badge untuk daftar tipe (`types`, e.g. Grass, Poison).
  - Statistik dasar (HP, Attack, Defense) atau tinggi & berat badan (*height* & *weight*).

---

## 🛑 Jebakan Live Coding HackerRank (Critical Interview Pitfalls)

| No | Jebakan / Kesalahan Umum | Konsekuensi di HackerRank | Solusi Terbaik |
|---|---|---|---|
| 1 | **Lupa Dependency Array `[currentId]`** | Infinite loop atau state stale (fetch hanya jalan sekali dan tombol Next/Before tidak memicu fetch ulang). | Cantumkan `[currentId]` secara eksplisit pada array dependency `useEffect`. |
| 2 | **Mengabaikan Race Condition** | Jika user klik Next 3x dengan cepat, request ke-2 bisa selesai lebih lambat dari request ke-3, menyebabkan data Pokemon yang tampil tidak sesuai dengan tombol ID. | Gunakan `AbortController` di dalam `useEffect` dan batalkan request sebelumnya pada return cleanup function. |
| 3 | **Off-by-One Boundary Error** | Tombol "Before" masih aktif saat ID = 1 atau "Next" masih aktif saat ID = 151, memicu HTTP 404 pada API eksternal. | Buat helper `canGoPrev = currentId > 1 && !loading` dan `canGoNext = currentId < 151 && !loading`. |
| 4 | **Tombol Tidak Disabled Saat Loading** | User dapat melakukan spam click sehingga membebani network dan mengacaukan antrian UI state. | Pasang prop `disabled={!canGoNext || loading}` pada kedua tombol navigasi. |

---

## 🏛️ Arsitektur Solusi & Pola Implementasi (React 19 / Next.js)

### Pola `useEffect` dengan AbortController
```tsx
useEffect(() => {
  // 1. Buat instance AbortController untuk membatalkan in-flight request
  const controller = new AbortController();
  const { signal } = controller;

  const fetchPokemonData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentId}`, { signal });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data Pokemon #${currentId} (Status: ${response.status})`);
      }
      const data: Pokemon = await response.json();
      setPokemon(data);
    } catch (err: unknown) {
      // Abaikan error jika sengaja di-abort oleh cleanup function
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Terjadi kesalahan saat memuat data');
    } finally {
      // Pastikan loading dimatikan jika bukan karena abort
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  fetchPokemonData();

  // 2. Cleanup function: dipanggil otomatis ketika currentId berubah atau unmount
  return () => {
    controller.abort();
  };
}, [currentId]);
```

---

## 🧪 Skenario Pengujian Unit Test

1. **Initial Mount**: Komponen memuat Pokemon ID 1 (`Bulbasaur`) dan tombol Previous dalam kondisi disabled.
2. **Next Navigation**: Menekan tombol Next mengubah state ID menjadi 2 (`Ivysaur`), memicu fetch baru, dan mengaktifkan tombol Previous.
3. **Previous Navigation**: Menekan tombol Previous dari ID 2 mengembalikan ID ke 1.
4. **Upper Boundary Check**: Ketika mencapai ID 151 (`Mew`), tombol Next otomatis disabled.
5. **Loading Interlock**: Selama proses fetch aktif, kedua tombol navigasi tidak dapat diklik.
6. **Error Resiliency**: Jika API mengembalikan error HTTP 500/404, pesan error tampil di layar tanpa menyebabkan crash pada aplikasi.

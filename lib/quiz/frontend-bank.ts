import { QuizQuestion } from './types';

export const FRONTEND_QUESTION_BANK: QuizQuestion[] = [
  // ─── 1. JavaScript Quirks & Console Log Traps ───
  {
    id: 'fe-001',
    track: 'frontend',
    category: 'JS Quirks & Coercion',
    companyTag: 'Tokopedia Frontend OA',
    difficulty: 'Mid',
    question: 'Berapakah output dari evaluasi ekspresi JavaScript berikut?',
    codeSnippet: `console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log(true + false);`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: '""\n"[object Object]"\n"[object Object]"\n1' },
      { id: 'B', label: '[]\n{}\n{}\n0' },
      { id: 'C', label: 'undefined\nNaN\nNaN\nfalse' },
      { id: 'D', label: '""\n"{}"\n"{}"\n1' },
    ],
    correctOptionId: 'A',
    explanation: 'Dalam JS: `[] + []` mengubah kedua array menjadi string kosong `"" + "" = ""`.\n`[] + {}` mengonversi array ke `""` dan object ke `"[object Object]"`.\n`{} + []` dalam konteks ekspresi menghasilkan `"[object Object]"`.\n`true + false` melakukan number coercion menjadi `1 + 0 = 1`.'
  },
  {
    id: 'fe-002',
    track: 'frontend',
    category: 'Closures & Scoping',
    companyTag: 'Traveloka OA',
    difficulty: 'Junior-Mid',
    question: 'Apa output dari perulangan `var` vs `let` dengan `setTimeout` berikut?',
    codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('A:', i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('B:', j), 0);
}`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'A: 0, 1, 2 lalu B: 0, 1, 2' },
      { id: 'B', label: 'A: 3, 3, 3 lalu B: 0, 1, 2' },
      { id: 'C', label: 'A: 3, 3, 3 lalu B: 3, 3, 3' },
      { id: 'D', label: 'A: 0, 1, 2 lalu B: 3, 3, 3' },
    ],
    correctOptionId: 'B',
    explanation: '`var` memiliki function scope (bukan block scope), sehingga ketiga callback setTimeout merujuk ke variabel `i` yang sama pada akhir loop bernilai 3. Sebaliknya, `let` memiliki block scope yang menciptakan binding leksikal baru untuk variabel `j` pada setiap iterasi loop (0, 1, 2).'
  },
  {
    id: 'fe-003',
    track: 'frontend',
    category: 'JavaScript `this` Context',
    companyTag: 'Shopee Frontend OA',
    difficulty: 'Mid',
    question: 'Apa output console.log dari pemanggilan method object berikut?',
    codeSnippet: `const candidate = {
  name: 'Andi',
  greetNormal: function() {
    return 'Halo ' + this.name;
  },
  greetArrow: () => {
    return 'Halo ' + this.name;
  }
};

const fn = candidate.greetNormal;
console.log(candidate.greetNormal());
console.log(candidate.greetArrow());
console.log(fn());`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Halo Andi\nHalo undefined\nHalo undefined' },
      { id: 'B', label: 'Halo Andi\nHalo Andi\nHalo Andi' },
      { id: 'C', label: 'Halo Andi\nHalo undefined\nHalo Andi' },
      { id: 'D', label: 'Halo Andi\nHalo Andi\nHalo undefined' },
    ],
    correctOptionId: 'A',
    explanation: '1) `candidate.greetNormal()` dipanggil dengan receiver `candidate`, sehingga `this` merujuk ke object (`Halo Andi`).\n2) Arrow function tidak memiliki binding `this` sendiri, melainkan mewarisi `this` dari enclosing lexical scope (global/window di mana `this.name` bernilai undefined).\n3) `fn()` dipanggil tanpa context receiver, sehingga `this` di strict mode adalah undefined atau global window.'
  },
  {
    id: 'fe-004',
    track: 'frontend',
    category: 'Floating Point Precision',
    companyTag: 'Blibli Frontend Tech',
    difficulty: 'Junior-Mid',
    question: 'Mengapa `console.log(0.1 + 0.2 === 0.3)` bernilai `false` di JavaScript?',
    options: [
      { id: 'A', label: 'Karena JavaScript mengonversi angka desimal ke string secara implisit.' },
      { id: 'B', label: 'Karena JavaScript menggunakan standar IEEE 754 floating point 64-bit yang tidak dapat merepresentasikan pecahan basis-2 (biner) 0.1 dan 0.2 secara persis (hasilnya 0.30000000000000004).' },
      { id: 'C', label: 'Karena operator `===` membandingkan memori address alih-alih nilai angka.' },
      { id: 'D', label: 'Karena angka 0.3 dibulatkan ke atas menjadi 1 oleh V8 engine.' },
    ],
    correctOptionId: 'B',
    explanation: 'Di JavaScript (dan mayoritas bahasa komputer), angka disimpan dalam standar IEEE 754 binary floating point. Pecahan 1/10 dan 2/10 menghasilkan representasi biner berulang tak hingga, sehingga penjumlahan `0.1 + 0.2` menghasilkan `0.30000000000000004` yang tidak identik dengan `0.3`.'
  },
  {
    id: 'fe-005',
    track: 'frontend',
    category: 'Event Loop & Microtasks',
    companyTag: 'GoTo Frontend Screening',
    difficulty: 'Mid-Senior',
    question: 'Berapakah urutan console output dari script browser berikut?',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve()
  .then(() => {
    console.log('3');
    return '4';
  })
  .then((val) => console.log(val));
console.log('5');`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: '1 -> 5 -> 3 -> 4 -> 2' },
      { id: 'B', label: '1 -> 3 -> 4 -> 5 -> 2' },
      { id: 'C', label: '1 -> 5 -> 2 -> 3 -> 4' },
      { id: 'D', label: '1 -> 2 -> 3 -> 4 -> 5' },
    ],
    correctOptionId: 'A',
    explanation: 'Eksekusi synchronous berjalan duluan: `1` lalu `5`. Setelah call stack kosong, event loop memproses antrean Microtasks (Promise then chain): `3` lalu `4`. Baru setelah semua microtasks tuntas, macrotask timer `2` dieksekusi.'
  },

  // ─── 2. React 18 & 19 Core Mental Models ───
  {
    id: 'fe-006',
    track: 'frontend',
    category: 'React State Batching',
    companyTag: 'Tokopedia React Specialist',
    difficulty: 'Mid',
    question: 'Pada React 18/19, apa yang dicetak ke console saat tombol diklik satu kali?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount((prev) => prev + 1);
    console.log('Count:', count);
  };

  return <button onClick={handleClick}>Increment</button>;
}`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Count: 0 (dan setelah render nilai count di UI menjadi 2)' },
      { id: 'B', label: 'Count: 3 (dan setelah render nilai count di UI menjadi 3)' },
      { id: 'C', label: 'Count: 0 (dan setelah render nilai count di UI menjadi 3)' },
      { id: 'D', label: 'Count: 1 (dan setelah render nilai count di UI menjadi 2)' },
    ],
    correctOptionId: 'A',
    explanation: '1) State setter tidak mengubah variabel `count` yang ada di closure render saat ini secara langsung, sehingga `console.log(count)` tetap mencetak nilai lama `0`.\n2) Dua panggilan pertama `setCount(0 + 1)` sama-sama mengantrekan nilai `1`. Panggilan updater ketiga `setCount(prev => prev + 1)` menerima `1` dan menghasilkan `2`. Total akhir state = 2.'
  },
  {
    id: 'fe-007',
    track: 'frontend',
    category: 'React useEffect Hook',
    companyTag: 'Traveloka Core Frontend',
    difficulty: 'Mid-Senior',
    question: 'Kapan cleanup function pada `useEffect` berikut ini dieksekusi?',
    codeSnippet: `useEffect(() => {
  const handler = () => console.log(query);
  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler);
  };
}, [query]);`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Hanya satu kali saat komponen unmount dari DOM.' },
      { id: 'B', label: 'Sebelum effect berikutnya dijalankan ulang ketika nilai `query` berubah, dan saat komponen unmount.' },
      { id: 'C', label: 'Setiap kali ada event resize di window browser.' },
      { id: 'D', label: 'Tepat sebelum komponen melakukan initial render pertama.' },
    ],
    correctOptionId: 'B',
    explanation: 'React membersihkan efek dari render sebelumnya (menjalankan cleanup function) SEBELUM menjalankan effect berikutnya saat nilai dependensi `[query]` berubah. Cleanup juga dipanggil ketika komponen unmount sepenuhnya.'
  },
  {
    id: 'fe-008',
    track: 'frontend',
    category: 'React Performance',
    companyTag: 'Astra International Screening',
    difficulty: 'Mid',
    question: 'Apa bahaya membalut fungsi di dalam `useCallback` TANPA menyertakan `React.memo` pada komponen anak yang menerima props fungsi tersebut?',
    options: [
      { id: 'A', label: 'Menyebabkan infinite loop re-render pada komponen induk.' },
      { id: 'B', label: 'Komponen anak tetap akan di-render ulang setiap kali komponen induk render, sehingga `useCallback` menjadi komputasi sia-sia tanpa optimasi render.' },
      { id: 'C', label: 'React akan melempar peringatan hydration error di Next.js.' },
      { id: 'D', label: 'State komponen anak akan ter-reset ke nilai default.' },
    ],
    correctOptionId: 'B',
    explanation: 'Secara default di React, saat parent render, semua child components akan ikut render ulang terlepas dari apakah props-nya berubah atau tidak. `useCallback` menjaga referensi fungsi tetap sama, tetapi optimasi skip render hanya terjadi jika child component di-memoize dengan `React.memo`.'
  },
  {
    id: 'fe-009',
    track: 'frontend',
    category: 'React Key Prop',
    companyTag: 'Shopee Frontend OA',
    difficulty: 'Junior-Mid',
    question: 'Mengapa menggunakan `index` array sebagai `key` pada list dinamis yang dapat di-sort, ditambah, atau dihapus adalah bad practice di React?',
    options: [
      { id: 'A', label: 'React melarang angka sebagai nilai key (hanya menerima UUID string).' },
      { id: 'B', label: 'Dapat menyebabkan bug tampilan state internal komponen anak yang tertukar/keliru saat elemen di-reorder atau dihapus.' },
      { id: 'C', label: 'Menurunkan score Google Lighthouse SEO.' },
      { id: 'D', label: 'Memicu memory leak pada browser event listener.' },
    ],
    correctOptionId: 'B',
    explanation: 'Algoritma rekonsiliasi React menggunakan `key` untuk mencocokkan virtual DOM node dengan DOM fisik. Jika item pertama dihapus, item kedua kini memiliki index 0 sehingga React mengira item lama masih ada, menyebabkan input value atau animasi lokal tidak sinkron.'
  },

  // ─── 3. DOM & Browser Internals ───
  {
    id: 'fe-010',
    track: 'frontend',
    category: 'DOM Event Propagation',
    companyTag: 'Tokopedia Frontend OA',
    difficulty: 'Mid',
    question: 'Elemen `<button>` berada di dalam `<div>`. Jika kedua elemen memiliki click listener biasa (default `useCapture: false`), urutan fase dan event manakah yang terpanggil saat button diklik?',
    options: [
      { id: 'A', label: 'Fase Bubbling: button handler dieksekusi terlebih dahulu, baru kemudian div handler.' },
      { id: 'B', label: 'Fase Capturing: div handler dieksekusi terlebih dahulu, baru kemudian button handler.' },
      { id: 'C', label: 'Kedua handler berjalan paralel tanpa urutan pasti.' },
      { id: 'D', label: 'Hanya button handler yang terpanggil; div handler diabaikan.' },
    ],
    correctOptionId: 'A',
    explanation: 'Event propagation DOM memiliki 3 fase: 1. Capturing (turun dari window ke target), 2. Target, 3. Bubbling (naik dari target kembali ke window). Karena `addEventListener` secara default mendaftarkan listener pada fase Bubbling, button (target) dieksekusi lebih dulu lalu naik ke parent `div`.'
  },
  {
    id: 'fe-011',
    track: 'frontend',
    category: 'DOM Events',
    companyTag: 'GoTo Screening',
    difficulty: 'Junior-Mid',
    question: 'Apa perbedaan mendasar antara `event.stopPropagation()` dan `event.preventDefault()`?',
    options: [
      { id: 'A', label: '`stopPropagation()` menghentikan perambatan event ke parent elemen di DOM tree; `preventDefault()` membatalkan aksi bawaan browser (misal reload saat submit form atau link href).' },
      { id: 'B', label: '`stopPropagation()` menghapus event listener; `preventDefault()` menyembunyikan elemen dari layar.' },
      { id: 'C', label: 'Kedua method adalah sinonim identik di standar W3C DOM.' },
      { id: 'D', label: '`preventDefault()` hanya bekerja pada event click mouse.' },
    ],
    correctOptionId: 'A',
    explanation: '`event.preventDefault()` mencegah aksi default browser (seperti submit form atau klik tag `<a>`), namun event tetap bubble ke atas. `event.stopPropagation()` menghentikan event merambat ke node parent di DOM hierarchy.'
  },
  {
    id: 'fe-012',
    track: 'frontend',
    category: 'Browser Rendering Pipeline',
    companyTag: 'Traveloka Web Performance',
    difficulty: 'Mid-Senior',
    question: 'Operasi CSS manakah yang memicu "Reflow" (Layout recalculation) yang paling mahal bagi performa browser, bukan sekadar "Repaint" atau "Composite"?',
    options: [
      { id: 'A', label: 'Mengubah `opacity` dari 0 ke 1.' },
      { id: 'B', label: 'Mengubah `transform: translate3d(10px, 0, 0)`.' },
      { id: 'C', label: 'Mengubah property `width`, `height`, atau `fontSize` elemen di DOM.' },
      { id: 'D', label: 'Mengubah `background-color`.' },
    ],
    correctOptionId: 'C',
    explanation: 'Reflow terjadi saat geometri atau posisi elemen berubah (seperti `width`, `height`, `margin`, `fontSize`). Browser harus menghitung ulang dimensi seluruh dokumen. Sebaliknya, `transform` dan `opacity` ditangani langsung oleh GPU compositor layer tanpa memicu layout recalculation.'
  },

  // ─── 4. CSS Specificity & Layout Models ───
  {
    id: 'fe-013',
    track: 'frontend',
    category: 'CSS Specificity',
    companyTag: 'Blibli Frontend Tech',
    difficulty: 'Mid',
    question: 'Hitung Specificity score dari selector CSS berikut: `#nav .menu-item:hover a`',
    options: [
      { id: 'A', label: 'ID: 1, Class/Pseudo-class: 2, Element: 1 -> (1, 2, 1)' },
      { id: 'B', label: 'ID: 1, Class: 1, Pseudo-class: 0, Element: 2 -> (1, 1, 2)' },
      { id: 'C', label: 'ID: 0, Class: 3, Element: 1 -> (0, 3, 1)' },
      { id: 'D', label: 'ID: 1, Class: 1, Element: 1 -> (1, 1, 1)' },
    ],
    correctOptionId: 'A',
    explanation: 'Perhitungan bobot Specificity: #nav = 1 ID (1,0,0); .menu-item = 1 Class (0,1,0); :hover = 1 Pseudo-class (0,1,0); a = 1 Element (0,0,1). Dijumlahkan menjadi (1, 2, 1) atau setara nilai 121.'
  },
  {
    id: 'fe-014',
    track: 'frontend',
    category: 'CSS Stacking Context',
    companyTag: 'DANA Frontend Screening',
    difficulty: 'Mid-Senior',
    question: 'Elemen modal memiliki `z-index: 9999` namun tetap tertutup oleh navbar yang hanya memiliki `z-index: 10`. Apa kemungkinan terbesar penyebabnya?',
    options: [
      { id: 'A', label: 'Nilai z-index di browser dibatasi maksimal 100.' },
      { id: 'B', label: 'Parent container modal memiliki Stacking Context tersendiri (misal opacity < 1 atau transform) dengan z-index lebih rendah dari navbar.' },
      { id: 'C', label: 'CSS tidak mendukung z-index pada elemen modal.' },
      { id: 'D', label: 'Modal menggunakan flexbox display.' },
    ],
    correctOptionId: 'B',
    explanation: 'Z-index hanya dapat dibandingkan di dalam Stacking Context yang sama. Jika parent dari modal membuat stacking context baru (misalnya lewat `opacity < 1`, `transform`, `filter`, atau `position: relative` dengan `z-index` rendah), maka `z-index: 9999` milik anak terkunci di level parent tersebut.'
  },

  // ─── 5. Web Performance & Optimization ───
  {
    id: 'fe-015',
    track: 'frontend',
    category: 'Optimization Techniques',
    companyTag: 'Tokopedia Search Bar',
    difficulty: 'Junior-Mid',
    question: 'Untuk fitur live search auto-suggest (mengetik di input pencarian), teknik manakah yang paling ideal untuk mengurangi jumlah request API yang berlebihan ke backend?',
    options: [
      { id: 'A', label: 'Throttling (mengeksekusi request setiap X milidetik secara konstan).' },
      { id: 'B', label: 'Debouncing (menunggu jeda diam user selesai mengetik selama X milidetik sebelum memanggil API).' },
      { id: 'C', label: 'Polling periodik setiap 100ms.' },
      { id: 'D', label: 'Mematikan fitur input onKeyDown.' },
    ],
    correctOptionId: 'B',
    explanation: 'Debouncing menunda eksekusi fungsi sampai user berhenti melakukan aktivitas selama durasi waktu tertentu (misal 300ms setelah keystroke terakhir). Throttle lebih cocok untuk event terus menerus seperti scroll atau window resize.'
  },
  {
    id: 'fe-016',
    track: 'frontend',
    category: 'Core Web Vitals',
    companyTag: 'Traveloka Core Web Vitals',
    difficulty: 'Mid-Senior',
    question: 'Metrik Core Web Vitals manakah yang mengukur stabilitas visual (mencegah layout bergeser tiba-tiba saat gambar atau banner iklan dimuat)?',
    options: [
      { id: 'A', label: 'LCP (Largest Contentful Paint)' },
      { id: 'B', label: 'CLS (Cumulative Layout Shift)' },
      { id: 'C', label: 'INP (Interaction to Next Paint)' },
      { id: 'D', label: 'TTFB (Time to First Byte)' },
    ],
    correctOptionId: 'B',
    explanation: 'Cumulative Layout Shift (CLS) mengukur pergeseran layout tak terduga yang terjadi selama siklus hidup halaman. Cara mencegahnya adalah selalu memberikan atribut `width` dan `height` atau aspect-ratio pada gambar dan banner dinamis.'
  },

  // ─── 6. TypeScript & Modern Frontend Architecture ───
  {
    id: 'fe-017',
    track: 'frontend',
    category: 'TypeScript Essentials',
    companyTag: 'Shopee Frontend OA',
    difficulty: 'Mid',
    question: 'Apa perbedaan mendasar antara tipe `unknown` dan `any` di TypeScript?',
    options: [
      { id: 'A', label: '`unknown` adalah type-safe counterpart dari `any`; Anda tidak dapat mengakses properti atau memanggil fungsi pada variabel bertipe `unknown` sebelum melakukan type checking (narrowing).' },
      { id: 'B', label: '`unknown` hanya dapat diisi nilai null atau undefined.' },
      { id: 'C', label: '`any` memicu compiler error jika diberi string.' },
      { id: 'D', label: 'Keduanya adalah sinonim identik yang dapat saling menggantikan.' },
    ],
    correctOptionId: 'A',
    explanation: '`any` menonaktifkan seluruh sistem pemeriksaan tipe TypeScript (escape hatch). Sedangkan `unknown` mewakili nilai apa pun tetapi memaksa developer melakukan verifikasi tipe (misal `typeof x === "string"` atau instance check) sebelum dapat menggunakannya.'
  },
  {
    id: 'fe-018',
    track: 'frontend',
    category: 'Next.js & SSR Hydration',
    companyTag: 'Tokopedia Web Platform',
    difficulty: 'Mid-Senior',
    question: 'Apa penyebab utama "Hydration Mismatch Error" di Next.js saat komponen di-render?',
    options: [
      { id: 'A', label: 'HTML yang dihasilkan oleh server berbeda dengan HTML yang dihasilkan saat render pertama di client browser (misal memakai `window.innerWidth` atau `new Date()` tanpa perlakuan khusus).' },
      { id: 'B', label: 'File CSS gagal di-load dari CDN.' },
      { id: 'C', label: 'Database backend mengembalikan response terlalu lambat.' },
      { id: 'D', label: 'Versi Node.js di server lebih baru dari browser klien.' },
    ],
    correctOptionId: 'A',
    explanation: 'Hydration adalah proses React memasang event listeners ke DOM HTML statis yang dikirim server. Jika server HTML merender teks yang berbeda dengan output render client browser saat mount (misal mengakses local storage atau waktu lokal), React mendeteksi ketidakcocokan pohon DOM dan melempar Hydration Mismatch warning/error.'
  },

  // ─── Extra Randomized Bank Soal ───
  {
    id: 'fe-019',
    track: 'frontend',
    category: 'JavaScript Prototype',
    companyTag: 'GoTo Frontend Screening',
    difficulty: 'Mid-Senior',
    question: 'Apa output dari pemeriksaan operator `instanceof` berikut?',
    codeSnippet: `function Person(name) {
  this.name = name;
}
const user = new Person('Budi');
console.log(user instanceof Person);
console.log(user instanceof Object);
console.log(Person instanceof Object);`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'true\ntrue\ntrue' },
      { id: 'B', label: 'true\nfalse\ntrue' },
      { id: 'C', label: 'true\ntrue\nfalse' },
      { id: 'D', label: 'false\ntrue\ntrue' },
    ],
    correctOptionId: 'A',
    explanation: '`user` adalah instance dari `Person`. Karena rantai prototipe `Person.prototype` mewarisi `Object.prototype`, maka `user instanceof Object` juga true. Fungsi `Person` sendiri adalah function object di JavaScript, sehingga `Person instanceof Object` juga bernilai true.'
  },
  {
    id: 'fe-020',
    track: 'frontend',
    category: 'Web Storage',
    companyTag: 'Fintech Mobile Web',
    difficulty: 'Junior-Mid',
    question: 'Manakah pernyataan yang BENAR mengenai perbedaan `localStorage` dan `sessionStorage`?',
    options: [
      { id: 'A', label: '`localStorage` otomatis terhapus saat tab ditutup; `sessionStorage` bertahan selamanya.' },
      { id: 'B', label: 'Data di `sessionStorage` hanya bertahan selama tab/window browser yang bersangkutan terbuka; `localStorage` bertahan permanen hingga dibersihkan secara eksplisit.' },
      { id: 'C', label: '`sessionStorage` dapat dibaca oleh domain lain yang berbeda.' },
      { id: 'D', label: '`localStorage` otomatis dikirimkan ke server di setiap HTTP request header.' },
    ],
    correctOptionId: 'B',
    explanation: '`sessionStorage` di-scoped per session/tab dan hilang saat tab browser ditutup. `localStorage` bersifat persisten tanpa batas waktu sampai aplikasi atau pengguna memanggil `removeItem`/`clear`. Storage ini tidak dikirim ke server (berbeda dengan Cookies).'
  },
  {
    id: 'fe-021',
    track: 'frontend',
    category: 'CSS Box Model',
    companyTag: 'Traveloka UI Engineering',
    difficulty: 'Junior-Mid',
    question: 'Jika sebuah div memiliki properti `box-sizing: border-box; width: 200px; padding: 20px; border: 5px solid black;`, berapakah total lebar fisik elemen yang dirender di layar?',
    options: [
      { id: 'A', label: '250px' },
      { id: 'B', label: '200px' },
      { id: 'C', label: '225px' },
      { id: 'D', label: '150px' },
    ],
    correctOptionId: 'B',
    explanation: 'Pada model `box-sizing: border-box`, nilai `width` sudah mencakup content, padding, dan border. Ruang content otomatis mengecil menjadi 200 - (2x20) - (2x5) = 150px, sehingga total lebar fisik elemen tetap persis 200px.'
  },
  {
    id: 'fe-022',
    track: 'frontend',
    category: 'React useRef Hook',
    companyTag: 'Astra Tech Track',
    difficulty: 'Mid',
    question: 'Apa perbedaan mendasar antara menyimpan nilai di dalam `useState` dibandingkan `useRef` di komponen React?',
    options: [
      { id: 'A', label: 'Mengubah nilai `.current` pada `useRef` TIDAK memicu re-render komponen; sedangkan memanggil state setter `useState` memicu re-render.' },
      { id: 'B', label: '`useRef` hanya bisa menyimpan DOM element dan tidak bisa menyimpan angka/string.' },
      { id: 'C', label: '`useState` nilainya hilang saat re-render; `useRef` tidak.' },
      { id: 'D', label: '`useRef` bersifat asynchronous sedangkan `useState` synchronous.' },
    ],
    correctOptionId: 'A',
    explanation: '`useRef` mengembalikan mutable object `{ current: ... }` yang bertahan sepanjang siklus hidup komponen. Memodifikasi properti `.current` tidak memicu re-render, menjadikannya ideal untuk menyimpan timer ID, DOM reference, atau nilai pelacak instan.'
  },
  {
    id: 'fe-023',
    track: 'frontend',
    category: 'JavaScript Equality',
    companyTag: 'Tokopedia OA',
    difficulty: 'Junior-Mid',
    question: 'Apa hasil output dari `console.log(NaN === NaN)` dan `console.log(Object.is(NaN, NaN))`?',
    options: [
      { id: 'A', label: 'false lalu true' },
      { id: 'B', label: 'true lalu true' },
      { id: 'C', label: 'false lalu false' },
      { id: 'D', label: 'true lalu false' },
    ],
    correctOptionId: 'A',
    explanation: 'Menurut spesifikasi IEEE 754 dan JavaScript, `NaN` adalah satu-satunya nilai yang tidak sama dengan dirinya sendiri menggunakan operator `===` (`NaN === NaN` adalah false). Untuk memeriksa equality secara deterministik, ES6 memperkenalkan `Object.is(NaN, NaN)` yang menghasilkan `true`.'
  },
  {
    id: 'fe-024',
    track: 'frontend',
    category: 'Security (XSS)',
    companyTag: 'Fintech Frontend Security',
    difficulty: 'Mid-Senior',
    question: 'Mengapa penggunaan `dangerouslySetInnerHTML` di React berbahaya jika konten HTML berasal dari input pengguna yang belum di-sanitize?',
    options: [
      { id: 'A', label: 'Membuka celah keamanan Cross-Site Scripting (XSS) di mana script berbahaya penyerang dapat dieksekusi di browser korban.' },
      { id: 'B', label: 'Menyebabkan server Next.js crash.' },
      { id: 'C', label: 'Memicu SQL Injection pada REST API backend.' },
      { id: 'D', label: 'Menghapus token session cookie secara otomatis.' },
    ],
    correctOptionId: 'A',
    explanation: 'Secara default React melakukan escaping pada string untuk mencegah XSS. Jika menggunakan `dangerouslySetInnerHTML` dengan input user yang tidak disanitasi (misal dengan DOMPurify), penyerang dapat menyisipkan payload tag `<script>` atau `<img onerror="...">` untuk mencuri cookie atau token akun korban.'
  },
  {
    id: 'fe-025',
    track: 'frontend',
    category: 'Web Workers',
    companyTag: 'Shopee High Performance',
    difficulty: 'Mid-Senior',
    question: 'Kapan saat yang tepat untuk memindahkan tugas komputasi ke Web Worker di browser?',
    options: [
      { id: 'A', label: 'Saat ingin memanipulasi elemen DOM dan CSS secara langsung.' },
      { id: 'B', label: 'Saat ada komputasi CPU berat (misal kompresi gambar, enkripsi data besar) agar Main Thread tidak freeze dan UI tetap responsif 60 FPS.' },
      { id: 'C', label: 'Saat ingin mengakses objek `window` dan `document` dari background thread.' },
      { id: 'D', label: 'Saat ingin menggantikan seluruh fungsi Redux/Zustand store.' },
    ],
    correctOptionId: 'B',
    explanation: 'Main thread browser mengeksekusi JavaScript, layout rendering, dan interaksi pengguna. Menjalankan komputasi CPU berat di main thread akan menyebabkan browser "hang" (UI freeze). Web Worker berjalan di thread terpisah tanpa akses ke DOM, ideal untuk kalkulasi berat.'
  },
  {
    id: 'fe-026',
    track: 'frontend',
    category: 'CSS Flexbox vs Grid',
    companyTag: 'Blibli Frontend Tech',
    difficulty: 'Junior-Mid',
    question: 'Kapan CSS Grid lebih disarankan daripada Flexbox?',
    options: [
      { id: 'A', label: 'Saat mendesain layout 2 dimensi (mengontrol baris dan kolom secara bersamaan).' },
      { id: 'B', label: 'Hanya untuk layout di layar smartphone layar kecil.' },
      { id: 'C', label: 'Saat ingin membuat teks menjadi bold.' },
      { id: 'D', label: 'Saat tidak ingin menggunakan responsive breakpoint media query.' },
    ],
    correctOptionId: 'A',
    explanation: 'Flexbox dirancang untuk layout 1 dimensi (baik baris horizontal atau kolom vertikal). CSS Grid dirancang untuk tata letak 2 dimensi di mana penempatan elemen dikontrol pada sumbu baris (row) dan kolom (column) secara serentak.'
  },
  {
    id: 'fe-027',
    track: 'frontend',
    category: 'JavaScript Hoisting',
    companyTag: 'GoTo Screening',
    difficulty: 'Mid',
    question: 'Apa output dari kode JavaScript berikut?',
    codeSnippet: `console.log(a);
console.log(b);
var a = 10;
let b = 20;`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'undefined lalu melempar ReferenceError: Cannot access "b" before initialization' },
      { id: 'B', label: 'undefined lalu undefined' },
      { id: 'C', label: '10 lalu 20' },
      { id: 'D', label: 'ReferenceError pada variabel a' },
    ],
    correctOptionId: 'A',
    explanation: 'Variabel `var` di-hoist dan diinisialisasi dengan nilai `undefined`. Variabel `let` dan `const` juga di-hoist tetapi berada di Temporal Dead Zone (TDZ) sampai baris deklarasinya dieksekusi, sehingga mengaksesnya sebelum inisialisasi menghasilkan ReferenceError.'
  },
  {
    id: 'fe-028',
    track: 'frontend',
    category: 'React Concurrency & Transitions',
    companyTag: 'Traveloka Web Platform',
    difficulty: 'Senior',
    question: 'Apa fungsi dari hook `useTransition` pada React 18/19?',
    options: [
      { id: 'A', label: 'Menambahkan animasi CSS slide dan fade pada elemen.' },
      { id: 'B', label: 'Menandai update state sebagai "non-urgent transition" sehingga update prioritas tinggi (seperti ketikan user di input) tidak terhambat.' },
      { id: 'C', label: 'Menggantikan fungsi useEffect untuk fetch data.' },
      { id: 'D', label: 'Menghubungkan aplikasi dengan Google Analytics transition event.' },
    ],
    correctOptionId: 'B',
    explanation: '`useTransition` memungkinkan developer memprioritaskan interaksi pengguna mendesak (ketikan, klik tab) dengan menandai komputasi berat (filter list 5000 item) sebagai transisi berprioritas rendah yang dapat diinterupsi oleh React concurrency engine.'
  },
  {
    id: 'fe-029',
    track: 'frontend',
    category: 'Browser Caching',
    companyTag: 'Tokopedia Performance',
    difficulty: 'Mid-Senior',
    question: 'Apa arti dari header response HTTP `Cache-Control: max-age=31536000, immutable` pada asset file bundle JavaScript di production?',
    options: [
      { id: 'A', label: 'Browser menyimpan cache selama 1 tahun dan TIDAK PERNAH mengirim request revalidasi conditional ke server selama file masih dalam cache.' },
      { id: 'B', label: 'Browser dilarang menyimpan cache asset tersebut.' },
      { id: 'C', label: 'Asset di-download ulang setiap kali user melakukan refresh halaman.' },
      { id: 'D', label: 'File bundle otomatis dihapus setelah 31 hari.' },
    ],
    correctOptionId: 'A',
    explanation: 'Direktif `immutable` memberitahu browser bahwa konten file yang memiliki content-hash (misal `main.a8b1c.js`) tidak akan pernah berubah. Browser tidak perlu mengirim request conditional `304 Not Modified` saat user me-reload halaman, menghemat round-trip latency network.'
  },
  {
    id: 'fe-030',
    track: 'frontend',
    category: 'Async / Await Error Handling',
    companyTag: 'DANA Frontend Screening',
    difficulty: 'Junior-Mid',
    question: 'Apa output dari kode penanganan error berikut?',
    codeSnippet: `async function test() {
  try {
    return await Promise.reject('Error Alpha');
  } catch (err) {
    return 'Caught: ' + err;
  }
}
test().then(console.log);`,
    codeLanguage: 'javascript',
    options: [
      { id: 'A', label: 'Caught: Error Alpha' },
      { id: 'B', label: 'UnhandledPromiseRejection: Error Alpha' },
      { id: 'C', label: 'undefined' },
      { id: 'D', label: 'null' },
    ],
    correctOptionId: 'A',
    explanation: 'Kata kunci `await` menunggu penyelesaian Promise yang di-reject, lalu melempar exception di dalam blok `try`. Blok `catch` menangkap error tersebut dan mengembalikan string `"Caught: Error Alpha"` yang kemudian dicetak oleh `.then()`.'
  }
];

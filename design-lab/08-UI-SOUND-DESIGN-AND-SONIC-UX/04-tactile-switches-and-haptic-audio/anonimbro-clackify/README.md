# CLACKIFY® — UNIT D-01

**Mechanical Switch Emulation Engine · Ultra-Low Latency Keystroke Audio Subsystem**

Implementasi eksekusi dari `PRD.md` (Clackify) sebagai prototipe web yang **berfungsi penuh** —
bukan mockup. Setiap tombol yang kamu tekan langsung memicu sample audio switch mekanik
**hasil rekaman asli** (MIT — kbsim & mechvibes, lihat `CREDITS.md`), diputar lewat Web Audio API
dengan buffer sekecil mungkin. Bila aset rekaman tidak tersedia, pack otomatis jatuh ke profil
sintesis cadangan di `synth.js`.

Desain antarmuka mengikuti skill **industrial-brutalist-ui**, arketipe
**Tactical Telemetry & CRT Terminal** (dark substrate — konsisten, tanpa mode terang).

---

## 1. Cara Menjalankan

**Opsi A — langsung:** buka `index.html` di browser (double-click). Semua aset lokal,
tidak ada dependensi build.

**Opsi B — lewat server lokal (disarankan):**

```bash
cd "18-clackify"
python -m http.server 8090
# buka http://localhost:8090
```

Saat halaman terbuka: boot sequence berjalan, sample bank dirender (±0.5–1.5 detik),
lalu klik **▶ ENGAGE AUDIO SUBSYSTEM** (browser mewajibkan satu gesture pengguna sebelum
audio bisa berbunyi). Setelah itu **semua tombol** yang kamu tekan akan berbunyi.

> Font diambil dari Google Fonts; tanpa internet UI tetap berfungsi dengan fallback
> system font (Arial Black / Consolas).

**Opsi C — mode "ketik di mana saja" (bridge lokal):** browser hanya boleh membaca
ketikan saat halamannya sendiri yang fokus. Supaya suara clack tetap berbunyi saat kamu
mengetik di Word/VSCode/terminal, jalankan helper kecil (Python murni, tanpa install apa pun):

```bash
python bridge/clack-bridge.py        # atau: klik dua kali bridge/START-BRIDGE.bat
```

Lalu di panel **02 / CONTROL MODULE** klik **[ CONNECT BRIDGE ]**. Tab Clackify boleh
duduk di belakang atau jendela browser diminimize — audio tetap jalan. Detail & batasnya
di **§6**.

---

## 2. Peta Fitur: PRD → Implementasi

| # | Requirement (PRD) | Status di build ini |
|---|---|---|
| 3.1 | Low-Level Keystroke Hook Engine | In-page: `window.keydown/keyup`. Global (semua aplikasi): helper `bridge/clack-bridge.py` dengan Win32 `WH_KEYBOARD_LL` → SSE localhost → halaman. Lihat §6 |
| 3.1 | Zero keystroke logging | Ring buffer 6 slot di RAM, tombol FLUSH, tidak ada `localStorage`/`fetch`/disk |
| 3.2 | Ultra-low latency audio | `AudioContext({latencyHint:'interactive'})`, buffer sesingkat yang diizinkan hardware (ditampilkan live di TELEMETRY), sample bank pra-render di RAM → **0 sintesis saat keypress** |
| 3.2 | Polifoni penuh | 1 `AudioBufferSource` per event, cap 48 voices, tanpa cut-off (0 event jatuh pada uji 200 WPM) |
| 3.3 | 10 curated sound packs | SW-01 Cherry MX Red, SW-02 Cherry MX Blue, SW-03 Cherry MX Brown, SW-04 EG Crystal Purple, SW-05 NK Cream, SW-06 Alpaca Linear, SW-07 Holy Panda, SW-08 Kailh Box Turquoise, SW-09 Topre, SW-10 IBM Model M — **120 buffer** (10 pack × 6 key class × press/release) dirender saat boot dari **rekaman asli** |
| 3.3 | Per-key differentiation | 6 key class: `char / space / enter / backspace / mod / nav` dengan modifier pitch, decay, gain, dan komponen terpisah (click/body/texture/metal) |
| 3.4 | System tray & volume | Simulasi tray menu + control module; hotkey `Ctrl+Alt+C` bekerja in-page **dan** global lewat bridge |
| 6 | Dropdown soundpack | Radio matrix SW-01…SW-10 (baris satu baris: nama + profil) + tabel SAMPLE BANK MATRIX |
| 6 | Slider master volume | `MASTER VOLUME` (0–100, curve x^1.5) |
| 6 | Pitch variation ±2% | `PITCH VARIATION` slider 0–2%, diterapkan via `playbackRate` per event + gain jitter |
| 6 | Headphone-only checkbox | `HP GATE` dengan deteksi device via `enumerateDevices()`; blocked/unverified/disabled |
| 7 | Key repeat suppression | Event `repeat` dibuang saat flag aktif (hitung `SUPPRESSED`) |
| 7 | Mute during sensitive inputs | Guard aktif otomatis saat fokus di field `password`/`[data-sensitive]` (ada test field di panel DATA INTEGRITY) |
| 4 | Zero audio lag < 15 ms | Telemetry jujur: `baseLatency + outputLatency + dispatch`, indikator **TOTAL LATENCY** (hijau saat < 15 ms) |
| 4 | Low CPU overhead | Handler cost terukur di telemetry `PROC / HANDLER` (% dari frame budget 16.67 ms) |
| 5 | Tech stack native (Rust/Tauri) | Prototipe ini web-native; arsitektur audio & event-nya 1:1 dengan rancangan Rust (lihat §5) |

---

## 3. Hotkey (in-page)

| Hotkey | Fungsi |
|---|---|
| `Ctrl+Alt+C` | Power on/off |
| `Ctrl+Alt+1..9/0` | Pilih sound pack SW-01…SW-10 (`1`…`9`, lalu `0` = SW-10) |
| `Ctrl+Alt+M` | Toggle sensitive-input guard |
| `Esc` (saat range ter-arm) | Lepas fokus typing range |

> Catatan: di browser, hotkey hanya aktif saat tab ini fokus. Build native mendaftarkannya
> sebagai global shortcut OS-level.

---

## 4. Struktur Proyek

```
18-clackify/
├── PRD.md                  # dokumen asli
├── README.md               # dokumen ini
├── CREDITS.md              # sumber + lisensi sample suara (MIT) & cara pengolahan
├── index.html              # seluruh struktur UI (semantik: data/samp/kbd/output/dl)
└── assets/
    ├── css/style.css       # sistem visual industrial-brutalist (dark substrate)
    └── js/
        ├── samples.js      # 106 payload MP3 base64 — REKAMAN ASLI 10 pack (MIT)
        ├── synth.js        # perakitan bank (rekaman asli) + fallback sintesis 10 pack × 6 key class
        ├── engine.js       # playback engine + telemetri latensi
        └── app.js          # boot, key capture, visualizer, WPM test, UI wiring
```

---

## 5. Arsitektur & Alur Data

```
[User menekan tombol keyboard]
        │  keydown event (timeStamp OS)
        ▼
[app.js onKeyDown] ─── hotkey? ──► [power / pack / guard]
        │  klasifikasi key class + gate check
        ▼
[engine.trigger(kc, phase)]
        │  pilih AudioBuffer dari RAM (pra-render saat boot)
        ▼
[BufferSource → GainNode → MasterGain → Analyser → Destination]
        │  playbackRate = 1 ± pitchVar%   (resampling acak)
        ▼
[Headphone user — total latensi ditampilkan live di panel TELEMETRY]
```

**Dari mana suaranya?** Semua suara di `assets/js/samples.js` adalah **rekaman switch asli**
dari dua repo MIT: [tplai/kbsim](https://github.com/tplai/kbsim) (© Thomas Lai) dan
[hainguyents13/mechvibes](https://github.com/hainguyents13/mechvibes) (© Hai Nguyen).
Pemetaan pack, cara pemotongan (press/release, noise gate adaptif, level release −9 dB),
dan notice lisensi lengkap ada di **`CREDITS.md`**. Ringkasnya: 106 payload MP3 mono 44.1 kHz
(~1.6–2.2 KB per clip) ditanam sebagai base64 → tetap jalan dari `file://`, tanpa server,
tanpa dependensi build, dan tanpa file audio terpisah di repo.

**Fallback:** `synth.js` masih menyimpan profil sintesis lama. Kalau `samples.js` hilang atau
gagal di-decode, pack yang bersangkutan otomatis dirender dari layer prosedural, jadi aplikasi
tidak pernah diam. Sumber yang benar-benar dipakai bisa dicek lewat
`window.CLACK.synth.source` (`'samples'` / `'synth'`).

**Pemetaan ke arsitektur Rust/Tauri (Milestone 1–3 di PRD):**

| Lapisan | Prototipe ini | Native (Rust) |
|---|---|---|
| Global key hook | in-page `keydown` + helper bridge (`WH_KEYBOARD_LL` via ctypes) | `rdev` / Win32 `WH_KEYBOARD_LL` / IOHIDManager |
| Audio engine | Web Audio API (`latencyHint:'interactive'`) | `cpal` + `kira`, WASAPI exclusive/shared 64–128 samples |
| Sample bank | `OfflineAudioContext` → `AudioBuffer` | `kira` static sound data, preloaded ke RAM |
| Tray UI | Control module + tray preview | Tauri v2 system tray + popup preferences |
| Hotkey | In-page `Ctrl+Alt+*` | Global hotkey OS-level |

---

## 6. Bridge — Suara di Luar Browser

**Masalah:** halaman web tidak boleh membaca ketikan global (batas keamanan browser — kalau
bisa, itu definisi keylogger). Tanpa bantuan, suara hanya berbunyi saat tab Clackify yang fokus.

**Solusi:** helper lokal kecil membaca keyboard lewat hook OS, lalu mengirim kode tombolnya ke
halaman lewat SSE di localhost. Halaman memainkan suaranya — **dan halaman boleh duduk di tab
belakang atau jendela terminimize**, karena AudioContext tetap berjalan (terverifikasi: audio
thread memproses 127 blok saat tab hidden, peak output terukur 0.90).

```
[keyboard fisik — aplikasi apa pun]
      │  WH_KEYBOARD_LL (low-level global hook)
      ▼
[bridge/clack-bridge.py]  ── SSE http://127.0.0.1:8091/events ──▶  [tab Clackify di belakang]
      │                                                                     │
      └─ Ctrl+Alt+P = jeda                                                  ▼
                                                              [AudioContext → speaker]
```

### Menjalankan

| Perintah | Fungsi |
|---|---|
| `python bridge/clack-bridge.py` | mode normal (hook + SSE di port 8091) |
| `bridge\START-BRIDGE.bat` | sama, untuk klik-dua-kali di Windows |
| `python bridge/clack-bridge.py --selftest` | uji tabel pemetaan 119 tombol lalu keluar |
| `--port 8092` | ganti port |
| `--no-hook` | server SSE saja (tanpa hook) |
| `--dev-inject` | tambah `POST /inject` untuk QA otomatis |

Setelah helper jalan, klik **[ CONNECT BRIDGE ]** di panel `02 / CONTROL MODULE`. Status di UI:
`LIVE` + jumlah event + Δ rata-rata hook→audio (terukur ~6–10 ms di uji lokal).

### Yang perlu kamu tahu (jujur)

- **Browser harus tetap terbuka** (boleh di belakang/minimize). Tutup browser = tidak ada suara.
- **Satu instance saja.** Menjalankan helper dua kali akan gagal bind port — memang disengaja,
  karena dua hook berarti suara dobel.
- **Hotkey jadi global.** `Ctrl+Alt+C` / `1..9/0` / `M` kini bekerja juga saat kamu mengetik di
  aplikasi lain — persis perilaku yang PRD minta untuk build native.
- **Anti-dobel:** saat halaman Clackify sendiri yang fokus, event dari helper diabaikan (keydown
  asli halaman sudah membunyikannya). Counter `DEDUPED` di UI menunjukkan berapa yang dilewati.
- **Privasi:** helper melihat semua ketikan mesin ini — konsekuensi tak terhindarkan dari "suara
  di semua aplikasi", sama seperti build native nanti. Yang dikirim hanya **kode tombol**
  (`KeyA`, `Space`), bukan isi dokumen; tidak ada yang ditulis ke disk; tidak ada koneksi keluar.
  Jeda cepat: **Ctrl+Alt+P** (helper berhenti meneruskan sampai ditekan lagi).
- **Sensitive guard** tetap berlaku untuk field di dalam halaman; untuk aplikasi lain, jeda
  manual (Ctrl+Alt+P) adalah pengamanmu.

---

## 7. Desain — Ringkasan Sistem Visual

- **Arketipe:** Tactical Telemetry / CRT Terminal (satu substrat, dark, tanpa mode terang).
- **Substrat:** `#0A0A0A` / `#0E0E0E` · **Phosphor:** `#EAEAEA` · **Hazard red:** `#E61919`.
- **Hijau terminal `#4AF626` dipakai persis satu elemen:** readout **TOTAL LATENCY**.
- **Tipografi:** Archivo Black (macro, `clamp()` s/d 12.4rem, tracking −0.05em) ×
  JetBrains Mono (micro, uppercase, tracking lebar) × Playfair Display italic sebagai
  watermark halftone (dither mask) — kontras tekstural yang dipakai sangat hemat.
- **Grid:** CSS Grid dengan `gap:1px` + background kontras untuk garis pemisah setipis mungkin;
  semua sudut 90°; tanpa border-radius, tanpa shadow lembut, tanpa gradient dekoratif.
- **Degradasi analog:** scanlines CRT (`repeating-linear-gradient`), grain SVG `feTurbulence`
  di root, halftone mask pada serif, phosphor glow 0-blur hanya pada elemen aktif.

---

## 8. QA / Debug Hook

Console browser menyediakan `window.CLACK`:

```js
CLACK.press('KeyA', 'a');       // simulasi keydown
CLACK.release('KeyA', 'a');     // simulasi keyup
CLACK.selectPack('modelm');     // ganti bank
CLACK.state;                    // counters + flags
CLACK.test;                     // state typing test (wi/ci/correct/errors)
CLACK.engine;                   // ctx, analyser, activeVoices, dropped
CLACK_BRIDGE.state;             // status bridge: events/skipped/deltas
CLACK_BRIDGE.connect();         // sambung ke helper tanpa klik tombol
CLACK_BRIDGE.setForceBackground(true);  // QA: paksa mode "di belakang"
window.__errs;                  // error collector
```

**Hasil QA terakhir** (headless Chrome 1680×1200 / 900×1200 / 430×932):

- 0 error runtime, 0 warning console, **120 buffer** bank utuh (10 pack × 6 kelas × 2 fase), tiap pack
  terbukti bersuara dan **10/10 fingerprint unik** (durasi/RMS/ZCR/slope — tidak ada dua pack yang identik).

**QA jalur rekaman asli** (qa35/qa36/qa37, headless Chrome):

- **10/10 pack memakai rekaman asli** (`window.CLACK.synth.source` = `samples`), **120/120 buffer** utuh,
  tiap pack bersuara: peak press **0.63–0.80**, release **0.13–0.29**.
- Level release terukur **−8.6 … −12.2 dB** di bawah press (keyup memang selalu lebih pelan);
  angka ini dibaca dari AudioBuffer hasil render, bukan nilai desain.
- **`file://` (klik dua kali `index.html`)** — 106 payload MP3 termuat, 10/10 pack dari rekaman,
  120 buffer, keypress bersuara (press 0.80 / release 0.27), **0 error**, tanpa server & tanpa build step.
- Nama pack baru (EG CRYSTAL PURPLE · KAILH BOX TURQUOISE · TOPRE ELECTRO-CAPACITIVE) **tidak terpotong**;
  baris 29 px seragam, overflow horizontal 0 px di 4 viewport (1680 / 1366 / 1024 / 900).
- Boot ≈ 3.5 s untuk 120 buffer dari 106 payload (satu render offline per pack, 12 slot dipotong dari
  satu pass) — turun dari 5.2 s pada implementasi 12-render-per-pack.
- Ditemukan & diperbaiki saat QA: kunci cache decode memakai `panjang + 32 karakter awal` base64 →
  semua payload MP3 berukuran sama punya header LAME identik sehingga 4 pack berbagi buffer yang sama.
  Kunci sekarang memakai md5 payload dari `samples.js`.
- Hotkey `Ctrl+Alt+1..9/0` memilih bank 1…10 dengan benar (radio matrix + ticker ikut sinkron).
- **Hanya suara switch, tanpa SFX lain:** satu-satunya sumber bunyi adalah keydown/keyup
  (press + release). Mengganti pack (klik baris) **senyap total — peak 0** di 10/10 baris;
  tidak ada preview, beep, atau nada UI. Semua komponen metalik memakai noise band-pass pendek,
  bukan sine — diukur dengan Goertzel: pack **3.8–23.4** vs sine 1 kHz murni **140.7**.
- Uji tekanan: 40 trigger sinkron → 0 event jatuh, peak 40 voices; burst 200 WPM → 0 jatuh.
- Urutan boot log deterministik; overflow horizontal **0 px** di 5 viewport (360 / 430 / 834 / 1280 / 1680).
  Akar masalahnya bracket sudut panel yang menonjol 1 px — diperbaiki di sumbernya, bukan ditutup `overflow:hidden`.
- Bracket sudut diverifikasi lewat hitung piksel: L merah utuh **9×9 px** (17 piksel) di panel paling kanan sekalipun.
- Trace oscilloscope + auto-range terverifikasi pada sinyal aktif (peak 0.87, gain ×0.95–×3.2).
- Slider: thumb terukur **0.00 px** dari pusat track (analisis piksel, bukan perkiraan mata).

**QA bridge** (helper + hook OS asli, headless Chrome):

- Hook `WH_KEYBOARD_LL` terpasang; 3 tap tombol lewat OS → **tepat 6 event** (down/up), pemetaan 1:1 tanpa duplikat.
- Tab di belakang: 12 event injeksi → 12 diputar, peak audio **0.90** (diukur di audio thread, bukan rAF).
- Anti-dobel saat halaman fokus: 3 event → 3 `DEDUPED`, **peak 0** (tidak ada suara dobel).
- Δ hook→audio terukur **6–10 ms**; instance kedua ditolak (gagal bind port) — mencegah dua hook aktif.
- 0 error runtime di semua skenario.

---

*© 1968–2026 CLACKIFY SYSTEMS DIV. — dokumen internal. Tidak ada keystroke yang
disimpan, ditulis ke disk, atau dikirim ke jaringan. /// END OF TRANSMISSION \\\*

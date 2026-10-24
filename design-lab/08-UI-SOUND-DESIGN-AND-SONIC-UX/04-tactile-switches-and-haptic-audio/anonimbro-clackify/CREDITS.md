# CLACKIFY® — SOUND CREDITS / KREDIT SUARA

Seluruh isi `assets/js/samples.js` adalah **rekaman switch asli** (bukan sintesis) yang
diambil dari dua proyek open-source berlisensi **MIT**. Tidak ada sample berbayar,
tidak ada sample dari pustaka komersial, dan tidak ada file audio lain di repo ini.

## 1. Sumber

| Repo | Lisensi | Pemegang hak cipta | Dipakai untuk |
|---|---|---|---|
| [tplai/kbsim](https://github.com/tplai/kbsim) | MIT | © Thomas Lai | SW-03, SW-05, SW-06, SW-07, SW-08, SW-09, SW-10 |
| [hainguyents13/mechvibes](https://github.com/hainguyents13/mechvibes) | MIT | © Hai Nguyen | SW-01, SW-02, SW-04 |

Keduanya memberi izin tanpa syarat untuk memakai, menyalin, memodifikasi, dan
mendistribusikan materi, dengan syarat notice hak cipta + izin disertakan — notice itu
ada di bagian 5 dokumen ini.

## 2. Pemetaan pack aplikasi → pack sumber

| App | Nama pack | Sumber | Pack sumber | Kelas tombol dari |
|---|---|---|---|---|
| SW-01 | CHERRY MX RED | mechvibes | `cherrymx-red-abs` | `sound.ogg` + `defines` |
| SW-02 | CHERRY MX BLUE | mechvibes | `cherrymx-blue-abs` | `sound.ogg` + `defines` |
| SW-03 | CHERRY MX BROWN | kbsim | `mxbrown` | `press/` + `release/` |
| SW-04 | EG CRYSTAL PURPLE | mechvibes | `eg-crystal-purple` | `purple.ogg` + `defines` |
| SW-05 | NK CREAM | kbsim | `cream` | `press/` + `release/` |
| SW-06 | ALPACA LINEAR | kbsim | `alpaca` | `press/` + `release/` |
| SW-07 | HOLY PANDA | kbsim | `holypanda` | `press/` + `release/` |
| SW-08 | KAILH BOX TURQUOISE | kbsim | `turquoise` | `press/` + `release/` |
| SW-09 | TOPRE ELECTRO-CAPACITIVE | kbsim | `topre` | `press/` + `release/` |
| SW-10 | IBM MODEL M | kbsim | `buckling` | `press/` + `release/` |

Enam kelas tombol per pack: `char` (huruf/angka), `mod` (Shift/Ctrl/Alt), `nav` (arrow/
navigasi), `space`, `enter`, `backspace` — masing-masing punya rekaman **press** dan
**release** terpisah, jadi 10 pack × 6 kelas × 2 fase = **120 buffer**.

## 3. Cara pengolahan (dari rekaman mentah ke `samples.js`)

1. **kbsim** — file `press/` dan `release/` per tombol sudah terpisah. Tiap clip
   dipangkas senyapnya, diberi *noise gate* adaptif (`max(peak − 30 dB, floor + 3 dB)`,
   blok 2 ms, smoothing 3 blok) agar ekor ruangan tidak ikut terbawa, lalu dinormalisasi:
   press → peak 0.90, release → peak 0.90 − 9 dB (keyup memang selalu lebih pelan).
2. **mechvibes** — tiap pack berupa satu file panjang (`sound.ogg`) dengan tabel
   `defines` berisi `[offset, durasi]` per tombol. Segmen dipotong sesuai tabel, lalu
   dipisah menjadi press dan release memakai analisis selubung: **press** = grup puncak
   pertama, **release** = grup puncak tertinggi di jendela `[press_end + 30 ms,
   press_end + 170 ms]`. Level release mengikuti selisih terukur terhadap press
   (dibatasi −14…−6 dB) supaya tetap realistis per switch.
3. Semua clip dikodekan ulang ke **MP3 mono 44.1 kHz** (± 1.6–2.2 KB per clip, total
   ~176 KB base64 untuk 106 payload unik) dan disimpan sebagai tabel base64 di
   `assets/js/samples.js` — jadi aplikasi tetap berjalan dari `file://` tanpa server
   dan tanpa dependensi build.

## 4. Telemetri di UI

Angka `BODY`, `CLICK`, dan label `RELEASE` di panel SAMPLE BANK MATRIX **diukur dari
rekaman asli** (bukan nilai desain): energi band Goertzel (60 Hz–11 kHz, jendela Hann)
untuk body/click, dan selisih level release-vs-press untuk label release.

## 5. Notice lisensi (MIT)

```
MIT License

Copyright (c) Thomas Lai            — https://github.com/tplai/kbsim
Copyright (c) Hai Nguyen            — https://github.com/hainguyents13/mechvibes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 6. Fallback tanpa aset

`assets/js/synth.js` menyimpan profil sintesis lama sebagai **fallback**: kalau
`samples.js` tidak ada atau gagal di-decode, setiap pack otomatis dirender dari layer
prosedural sehingga aplikasi tetap berbunyi. Status sumber per pack bisa dilihat di
`window.CLACK.synth.source` (`'samples'` atau `'synth'`).

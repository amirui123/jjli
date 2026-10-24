# Product Requirements Document (PRD) — Clackify

## 1. Executive Summary & Problem Statement
Penggemar *mechanical keyboard* (keyboard mekanik) sangat menggemari kepuasan pendengaran (*auditory feedback*) dari suara ketikan switch mekanik favorit mereka (seperti suara "thock" dari switch tactile Holy Panda, suara "clack" dari Gateron Yellow, atau suara klik tajam Cherry MX Blue). Namun, ketika sedang bekerja di tempat umum (kafe, perpustakaan, kantor bersama, atau saat meeting online), membawa keyboard mekanik berukuran penuh sangat merepotkan, dan suaranya berisiko mengganggu orang lain. Sementara itu, mengetik di keyboard membrane laptop bawaan terasa hambar dan membosankan.

**Clackify** adalah aplikasi desktop companion *ultra-low latency* yang berjalan di latar belakang (system tray), menangkap penekanan tombol keyboard fisik laptop di tingkat OS, dan memainkan sample audio berkualitas studio dari berbagai jenis switch mekanik legendaris langsung ke headphone pengguna secara instan tanpa delay yang terasa.

---

## 2. Target Personas & User Stories
### 2.1 User Personas
* **Dion (Mechanical Keyboard Enthusiast & Vibe Coder):** Punya koleksi 5 custom keyboard di rumah. Terpaksa bekerja dari kafe hanya dengan laptop MacBook, dan sangat merindukan suara switch favoritnya saat ngoding.
* **Sarah (Remote Frontend Dev):** Bekerja di ruangan bersama pasangan, tidak bisa menggunakan keyboard berisik aslinya tetapi butuh kepuasan suara switch untuk menjaga ritme mengetik cepat.

### 2.2 User Stories
* *Sebagai Vibe Coder*, saya ingin memakai headphone dan mendengar suara "thock" yang renyah setiap kali saya menekan tombol keyboard laptop saya tanpa mengganggu orang di sebelah saya.
* *Sebagai User*, saya ingin latensi suara di bawah 15 milidetik sehingga otak saya merasakan suara tersebut sinkron sempurna dengan sentuhan jari saya.
* *Sebagai Gamer/Typist*, saya ingin tombol spasi, backspace, dan enter memiliki suara unik yang lebih berat (*stabilizer sound*) layaknya keyboard mekanik sungguhan.

---

## 3. Scope & Functional Requirements (MVP)
### 3.1 Core Features
1. **Low-Level Keystroke Hook Engine:**
   * Menangkap global key-down dan key-up event pada level OS (Windows Win32 Hook / macOS IOHidManager / Linux X11/Wayland).
   * Menghormati privasi penuh: hanya membaca event penekanan untuk memicu trigger audio, **tanpa pernah menyimpan log keystroke ke file atau jaringan**.
2. **Ultra-Low Latency Audio Playback Engine:**
   * Menggunakan audio playback native (WASAPI di Windows, CoreAudio di macOS) dengan buffer size kecil (64-128 samples) untuk menghasilkan latensi suara total < 12ms.
   * Mendukung polifoni penuh (mengetik cepat multi-key tanpa suara terpotong atau tumpang-tindih cacat).
3. **Curated Sound Packs & Per-Key Differentiation:**
   * Menyertakan 5 paket suara audio switch beresolusi tinggi (lossless FLAC/WAV):
     * *Alpaca Linear (Creamy Clack)*
     * *Holy Panda (Deep Thock)*
     * *Cherry MX Blue (Crisp Click)*
     * *Topre Electro-Capacitive (Muted Thud)*
     * *IBM Model M Buckling Spring (Vintage Metallic)*
   * Suara terpisah untuk tombol karakter, Spasi (*spacebar thud*), Enter, Backspace, dan tombol modifier (Shift/Ctrl).
4. **System Tray & Volume Control:**
   * Berjalan senyap di system tray dengan menu klik kanan: ganti sound pack, atur slider volume, dan tombol on/off cepat (`Ctrl+Alt+C`).

---

## 4. Non-Functional Requirements
* **Zero Audio Lag:** Audio output latency dari ketukan jari hingga terdengar di telinga < 15 milidetik.
* **Low CPU Overhead:** Penggunaan CPU di bawah 0.8% saat mengetik cepat 120 WPM.
* **Security & Whitelist:** Aplikasi harus ditandatangani secara digital agar tidak memicu alarm false-positive antivirus (karena sifat global key hook).

---

## 5. Technical Architecture & Data Flow
### 5.1 Tech Stack
* **Core Application:** Rust (menggunakan framework desktop `Tauri` versi 2.0 untuk frontend tray UI).
* **Global Keyboard Listener:** `rdev` (Rust global event listener cross-platform) atau hook native OS API.
* **Audio Engine:** `cpal` (Cross-Platform Audio Library di Rust) + `rodio` / `kira` (sound engine khusus game audio dengan fokus zero-latency playback).

### 5.2 Data Flow
```
[User menekan tombol keyboard di Laptop]
                   │
                   ▼ (Hardware Interrupt)
[OS Global Keyboard Hook (Win32 / CoreAudio)]
                   │
                   ▼ (Key Type: Space / Alphanumeric / Enter)
[Clackify Rust Core Event Dispatcher]
                   │
                   ▼
[Kira / CPAL Audio Engine] ──► [Sample Buffer Cache di RAM]
                   │ (WASAPI / CoreAudio Low-Latency Stream)
                   ▼
[Headphone User: Suara "Thock" Instan (<15ms)]
```

---

## 6. Interface Specifications
* **Tray Icon:** Logo switch keyboard mini di taskbar.
* **Popup Preferences Window (Tauri):**
  * Dropdown Pemilihan Switch Soundpack.
  * Slider Master Volume.
  * Opsi "Pitch Variation" (variasi mikro pitch acak +/- 2% agar suara ketikan beruntun terdengar alami dan tidak robotik).
  * Checkbox: "Play sound only when headphone is connected".

---

## 7. Edge Cases & Mitigations
* **Pengetikan Berulang Cepat (Key Hold / Repeat):** Sistem harus membatasi suara berulang jika tombol ditahan (*key repeat suppression*) agar tidak memicu suara tembakan rentetan berisik saat menahan tombol panah.
* **Aplikasi Mengakses Layar Password:** Meskipun Clackify tidak menyimpan keystroke, untuk menjaga persepsi keamanan, sediakan mode "Mute during sensitive inputs" yang dapat diaktifkan pengguna.

---

## 8. MVP Roadmap & Milestone Deliverables
* **Milestone 1:** Prototype audio engine di Rust (`cpal`) dengan pemutaran sample berlatensi rendah (<15ms).
* **Milestone 2:** Implementasi global keyhook cross-platform dan mapping suara khusus spasi/enter.
* **Milestone 3:** Bundle 5 soundpack berkualitas tinggi, pembuatan Tauri System Tray UI, dan installer Windows (.msi) & macOS (.dmg) v0.1.0.

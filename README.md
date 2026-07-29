# Panduan Penggunaan BSQ Prasurvey PWA & Integrasi Google Sheets

Aplikasi PWA BSQ Prasurvey ini dirancang khusus untuk mempermudah pencatatan transaksi harian nasabah BCA KCP Jembatan Dua, membuat pesan WhatsApp otomatis sesuai jam (Pagi/Siang/Sore), serta mengirimkan rekap transaksi langsung ke **Google Sheets** Anda.

---

## 🚀 Fitur Utama
1. **Form Input Transaksi Intuitif:** Input Sapaan (Bapak/Ibu), Nama Nasabah, CIS, No. Telp/WA, Jenis Transaksi (`Tarik Tunai`, `Tarik Setor`, `Pemindahan Langsung`, `OR`, `KU`, atau ketik manual), serta Nama Teller.
2. **Auto-Greeting Sesuai Jam:** Mengatur otomatis salam pembuka:
   - `04.00 - 11.00`: Selamat Pagi
   - `11.00 - 15.00`: Selamat Siang
   - `15.00 - 23.59`: Selamat Sore
3. **WhatsApp Direct Link:** Sekali klik "Kirim ke WhatsApp", aplikasi WhatsApp (HP / WhatsApp Web) langsung terbuka dengan nomor nasabah & draft pesan lengkap terisi.
4. **Sinkronisasi Google Sheets Otomatis:** Setiap kali Anda memproses transaksi, data otomatis terisi di baris baru Google Sheets secara *real-time*.
5. **Progressive Web App (PWA):** Dapat diakses dari Laptop/PC maupun di-install di HP Android (Add to Home Screen).

---

## 🛠️ CARA MENGHUBUNGKAN APLIKASI KE GOOGLE SHEETS

Agar data transaksi yang di-input di HP/PC otomatis masuk ke file Google Spreadsheet Anda, ikuti langkah mudah berikut:

### Langkah 1: Buka Google Sheets Anda
1. Buka file Google Spreadsheet Anda (bisa buat spreadsheet baru atau copy dari `Template Excel Dummy BSQ.xlsx`).
2. Buat nama kolom di **Baris 1** persis seperti ini:
   `TANGGAL | NO | NAMA NASABAH | CIS | JENIS TRANSAKSI | NO TELP | USAHA 1 | RESPON 1 | USAHA 2 | RESPON 2 | KETERANGAN | TELLER | PETUGAS BSQ`

### Langkah 2: Pasang Google Apps Script
1. Di Google Sheets, klik menu **Ekstensi** (Extensions) ➔ **Apps Script**.
2. Hapus semua teks yang ada di editor Apps Script.
3. Buka file `google_apps_script.js` yang ada di aplikasi ini, **Salin Semuanya (Ctrl+A ➔ Ctrl+C)** dan **Tempelkan (Ctrl+V)** ke editor Apps Script.
4. Klik ikon **Simpan** (💾) di bagian atas.

### Langkah 3: Deploy / Terbitkan Script
1. Klik tombol **Terapkan** (Deploy) biru di kanan atas ➔ Pilih **Penerapan Baru** (New deployment).
2. Di sebelah *Pilih jenis*, klik ikon roda gigi (⚙️) ➔ Pilih **Aplikasi Web** (Web app).
3. Isi setelan berikut:
   - **Deskripsi:** `BSQ Web App API`
   - **Jalankan sebagai (Execute as):** `Saya (email@gmail.com)`
   - **Yang memiliki akses (Who has access):** **`Siapa saja` (Anyone)** ⚠️ *Penting agar HP/PWA bisa mengirim data*.
4. Klik **Terapkan** (Deploy).
5. Izinkan akses Google (Klik *Authorize access* ➔ Pilih akun Google Anda ➔ Klik *Advanced* ➔ Klik *Go to Apps Script (unsafe)* ➔ Klik *Allow*).
6. **Salin URL Aplikasi Web** yang diberikan (URL diawali `https://script.google.com/macros/s/.../exec`).

### Langkah 4: Masukkan URL ke Aplikasi PWA
1. Buka Aplikasi PWA BSQ.
2. Klik tombol **⚙️ (Pengaturan)** di pojok kanan bawah.
3. Tempelkan URL yang sudah disalin tadi ke dalam kolom input.
4. Klik **Simpan URL**.

Selesai! Sekarang setiap kali Anda klik tombol **Kirim ke WhatsApp** atau **Simpan ke Google Sheets**, data akan otomatis ter-update di Google Spreadsheet Anda! 

---

## 📱 Cara Install di HP Android
1. Buka browser **Google Chrome** di HP Android Anda.
2. Buka link aplikasi PWA ini.
3. Klik titik tiga (⋮) di pojok kanan atas Chrome.
4. Pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
5. Icon aplikasi **BSQ Prasurvey** akan muncul di layar utama HP Anda dan siap digunakan kapan saja!

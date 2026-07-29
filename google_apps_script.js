/**
 * GOOGLE APPS SCRIPT FOR BSQ PRASURVEY GOOGLE SHEETS
 * 
 * LANGKAH CARA MEMASANG DI GOOGLE SHEETS:
 * 1. Buka Google Sheets Anda (sesuai template Dummy BSQ).
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus semua kode default yang ada, lalu Paste kode ini seluruhnya.
 * 4. Klik ikon Simpan (Disk) di bagian atas.
 * 5. Klik tombol 'Terapkan' (Deploy) -> 'Penerapan baru' (New deployment).
 * 6. Pilih Jenis Penerapan: Klik ikon Roda Gigi (Settings) -> Pilih 'Aplikasi Web' (Web app).
 * 7. Isi Deskripsi: BSQ Web App API
 * 8. Pada 'Jalankan sebagai' (Execute as): Pilih 'Saya' (Me).
 * 9. Pada 'Yang memiliki akses' (Who has access): Pilih 'Siapa saja' (Anyone). **PENTING**
 * 10. Klik 'Terapkan' (Deploy), lalu izinkan akses Google jika ada pop-up.
 * 11. Salin URL Aplikasi Web (berakhir dengan /exec) dan tempelkan ke aplikasi PWA (Menu Pengaturan ⚙️).
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Cek Tanggal dan No Urut Terakhir
    var lastRow = sheet.getLastRow();
    var noUrut = 1;
    var isNewDate = false;

    if (lastRow >= 3) {
      // Cari baris terakhir yang terisi data
      var prevDateVal = sheet.getRange(lastRow, 1).getValue();
      var prevNo = sheet.getRange(lastRow, 2).getValue();
      
      // Jika baris terakhir kosong (akibat skip row sebelumnya), cek 1 baris di atasnya
      if ((!prevDateVal || String(prevDateVal).trim() === "") && lastRow > 3) {
        lastRow = lastRow - 1;
        prevDateVal = sheet.getRange(lastRow, 1).getValue();
        prevNo = sheet.getRange(lastRow, 2).getValue();
      }

      // Format prevDateVal ke DD/MM/YYYY jika dalam bentuk Date object
      var formattedPrevDate = "";
      if (prevDateVal instanceof Date) {
        var d = ("0" + prevDateVal.getDate()).slice(-2);
        var m = ("0" + (prevDateVal.getMonth() + 1)).slice(-2);
        var y = prevDateVal.getFullYear();
        formattedPrevDate = d + "/" + m + "/" + y;
      } else {
        // Ubah strip (-) menjadi slash (/) jika berupa teks
        formattedPrevDate = String(prevDateVal).trim().replace(/-/g, "/");
      }

      // Format input dari app.js (DD-MM-YYYY) diubah ke DD/MM/YYYY
      var currentDateInput = String(data.tanggal || "").trim().replace(/-/g, "/");

      // Cek apakah tanggal berbeda dengan transaksi sebelumnya
      if (formattedPrevDate && formattedPrevDate !== currentDateInput) {
        isNewDate = true;
        noUrut = 1; // Reset nomor urut dari 1
      } else if (!isNaN(prevNo) && prevNo !== "") {
        noUrut = Number(prevNo) + 1; // Lanjutkan nomor urut
      }
    }

    // Jika ganti tanggal, tambahkan 1 baris kosong (skip one row) terlebih dahulu
    if (isNewDate) {
      // Menggunakan spasi agar Google Sheets tidak menganggapnya baris kosong dan menimpanya
      sheet.appendRow([" ", "", "", "", "", "", "", "", "", "", "", "", ""]);
    }

    // Format Nama Nasabah
    var namaLengkap = data.nama || "";

    // Susun baris baru sesuai urutan kolom Template BSQ:
    // Kolom 1: TANGGAL
    // Kolom 2: NO
    // Kolom 3: NAMA NASABAH
    // Kolom 4: CIS
    // Kolom 5: JENIS TRANSAKSI
    // Kolom 6: NO TELP
    // Kolom 7: USAHA 1 (WA)
    // Kolom 8: RESPON 1
    // Kolom 9: USAHA 2 (TELP)
    // Kolom 10: RESPON 2
    // Kolom 11: KETERANGAN
    // Kolom 12: TELLER
    // Kolom 13: PETUGAS BSQ

    var newRow = [
      currentDateInput || "",      // Kolom A: TANGGAL
      noUrut,                      // Kolom B: NO
      namaLengkap,                 // Kolom C: NAMA NASABAH
      "'" + (data.cis || ""),      // Kolom D: CIS (diberi tanda petik agar tidak di-format scientific/number)
      data.jenisTransaksi || "",   // Kolom E: JENIS TRANSAKSI
      "'" + (data.noTelp || ""),   // Kolom F: NO TELP
      "Done",                      // Kolom G: USAHA 1 (WA)
      "",                          // Kolom H: RESPON
      "",                          // Kolom I: USAHA 2 (TELP)
      "",                          // Kolom J: RESPON
      "",                          // Kolom K: KETERANGAN
      data.teller || "",           // Kolom L: TELLER
      ""                           // Kolom M: PETUGAS BSQ
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ result: "success", rowAdded: newRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Jika tidak ada parameter data, tampilkan status API
    if (!e.parameter || !e.parameter.data) {
      return ContentService.createTextOutput(JSON.stringify({ status: "active", message: "API BSQ Prasurvey Aktif & Siap Menerima Data." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.parameter.data);

    // Cek Tanggal dan No Urut Terakhir
    var lastRow = sheet.getLastRow();
    var noUrut = 1;
    var isNewDate = false;

    if (lastRow >= 3) {
      var prevDateVal = sheet.getRange(lastRow, 1).getValue();
      var prevNo = sheet.getRange(lastRow, 2).getValue();

      if ((!prevDateVal || String(prevDateVal).trim() === "") && lastRow > 3) {
        lastRow = lastRow - 1;
        prevDateVal = sheet.getRange(lastRow, 1).getValue();
        prevNo = sheet.getRange(lastRow, 2).getValue();
      }

      var formattedPrevDate = "";
      if (prevDateVal instanceof Date) {
        var d = ("0" + prevDateVal.getDate()).slice(-2);
        var m = ("0" + (prevDateVal.getMonth() + 1)).slice(-2);
        var y = prevDateVal.getFullYear();
        formattedPrevDate = d + "/" + m + "/" + y;
      } else {
        formattedPrevDate = String(prevDateVal).trim().replace(/-/g, "/");
      }

      var currentDateInput = String(data.tanggal || "").trim().replace(/-/g, "/");

      if (formattedPrevDate && formattedPrevDate !== currentDateInput) {
        isNewDate = true;
        noUrut = 1;
      } else if (!isNaN(prevNo) && prevNo !== "") {
        noUrut = Number(prevNo) + 1;
      }
    }

    if (isNewDate) {
      sheet.appendRow([" ", "", "", "", "", "", "", "", "", "", "", "", ""]);
    }

    var namaLengkap = data.nama || "";

    var newRow = [
      currentDateInput || "",
      noUrut,
      namaLengkap,
      "'" + (data.cis || ""),
      data.jenisTransaksi || "",
      "'" + (data.noTelp || ""),
      "Done",
      "",
      "",
      "",
      "",
      data.teller || "",
      ""
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ result: "success", rowAdded: noUrut }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// BSQ Prasurvey PWA — Application Logic v2
// BCA KCP Jembatan Dua
// ============================================

// Storage Keys
const STORAGE_KEY_SHEETS_URL = 'bsq_sheets_url';
const STORAGE_KEY_HISTORY = 'bsq_tx_history';

// DOM Elements
const timeIcon = document.getElementById('timeIcon');
const greetingText = document.getElementById('greetingText');

const bsqForm = document.getElementById('bsqForm');
const txDate = document.getElementById('txDate');
const customerName = document.getElementById('customerName');
const cisNumber = document.getElementById('cisNumber');
const phoneNumber = document.getElementById('phoneNumber');
const txType = document.getElementById('txType');
const customTxGroup = document.getElementById('customTxGroup');
const customTxType = document.getElementById('customTxType');
const tellerName = document.getElementById('tellerName');

const btnReset = document.getElementById('btnReset');

const previewSection = document.getElementById('previewSection');
const messagePreview = document.getElementById('messagePreview');
const statusBadge = document.getElementById('statusBadge');
const btnSendWA = document.getElementById('btnSendWA');
const btnCopy = document.getElementById('btnCopy');
const btnSaveSheets = document.getElementById('btnSaveSheets');

const settingsModal = document.getElementById('settingsModal');
const sheetsUrlInput = document.getElementById('sheetsUrlInput');
const sheetsStatus = document.getElementById('sheetsStatus');
const btnOpenSettings = document.getElementById('btnOpenSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnTestSheets = document.getElementById('btnTestSheets');

const historyTableBody = document.getElementById('historyTableBody');
const btnClearHistory = document.getElementById('btnClearHistory');
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastText = document.getElementById('toastText');

let currentData = null;
let currentMessage = '';

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initDefaultDate();
    updateTimeGreeting();
    loadSheetsUrl();
    renderHistory();
    setInterval(updateTimeGreeting, 60000);
});

// Set default date to Today (Local Timezone)
function initDefaultDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    txDate.value = `${y}-${m}-${d}`;
}

// ============================================
// Time-based Greeting
// ============================================
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
        return { text: 'Selamat Pagi', icon: '🌅' };
    } else if (hour >= 11 && hour < 15) {
        return { text: 'Selamat Siang', icon: '☀️' };
    } else {
        return { text: 'Selamat Sore', icon: '🌆' };
    }
}

function updateTimeGreeting() {
    const greeting = getGreeting();
    greetingText.textContent = greeting.text;
    timeIcon.textContent = greeting.icon;
}

// ============================================
// Date Formatting (DD-MM-YYYY)
// ============================================
function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// ============================================
// Toggle Custom Transaction Input
// ============================================
txType.addEventListener('change', () => {
    if (txType.value === 'Lainnya') {
        customTxGroup.classList.remove('hidden');
        customTxType.required = true;
        customTxType.focus();
    } else {
        customTxGroup.classList.add('hidden');
        customTxType.required = false;
    }
});

// ============================================
// Form Submit — Generate Preview
// ============================================
bsqForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateDataAndPreview();
});

function generateDataAndPreview() {
    const salutation = document.querySelector('input[name="salutation"]:checked').value;
    const name = customerName.value.trim();
    const cis = cisNumber.value.trim();
    const phoneRaw = phoneNumber.value.trim();
    const selectedTx = txType.value;
    const customTx = customTxType.value.trim();
    const teller = tellerName.value.trim();
    const dateVal = txDate.value;

    const finalTx = (selectedTx === 'Lainnya') ? (customTx || 'Lainnya') : selectedTx;
    const formattedDate = formatDateDDMMYYYY(dateVal);
    const greeting = getGreeting().text;

    currentData = {
        salutation,
        name,
        cis,
        phone: phoneRaw,
        txType: finalTx,
        teller,
        date: dateVal,
        formattedDate,
        greeting,
        timestamp: new Date().getTime(),
        sheetsSynced: false
    };
    // Emoji constants (using Unicode code points to avoid encoding issues)
    const emoji_pray = String.fromCodePoint(0x1F64F);
    const emoji_angel = String.fromCodePoint(0x1F607);
    const emoji_smile = String.fromCodePoint(0x1F60A);

    // Build WhatsApp Message Template
    currentMessage = `${greeting} ${salutation} ${name},
Terimakasih atas kepercayaan dan kesetiaannya telah menjadi nasabah PT Bank Central Asia Tbk KCP JEMBATAN DUA.

Sebelumnya pada tgl ${formattedDate} telah melakukan transaksi (${finalTx}) Dengan Teller ${teller} Di BCA KCP Jembatan Dua, bagaimana transaksi dicabang kami serta bagaimana dengan pelayanan kami apakah *SANGAT MEMUASKAN*?

Jika ada kritik & saran boleh disampaikan disini agar layanan kami bisa menjadi lebih baik kedepannya. 
Apabila ada kendala/pertanyaan lainnya silahkan menghubungi kami kembali, dengan senang hati kami akan membantu Anda...
Terima kasih${emoji_pray}${emoji_pray}
Have a Great Day ${emoji_angel}${emoji_smile}`;

    messagePreview.textContent = currentMessage;
    statusBadge.textContent = '✅ Siap Dikirimkan';
    statusBadge.classList.add('ready');

    // Enable action buttons
    btnSendWA.disabled = false;
    btnCopy.disabled = false;
    btnSaveSheets.disabled = false;

    showToast('Preview pesan berhasil dibuat!', '✅');

    // Auto-scroll to preview on mobile
    if (window.innerWidth <= 868) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// Reset Form
// ============================================
btnReset.addEventListener('click', () => {
    bsqForm.reset();
    initDefaultDate();
    customTxGroup.classList.add('hidden');
    messagePreview.textContent = 'Silakan isi form di samping untuk membuat draft pesan WA...';
    statusBadge.textContent = 'Belum Diisi';
    statusBadge.classList.remove('ready');
    currentData = null;
    currentMessage = '';

    // Disable action buttons
    btnSendWA.disabled = true;
    btnCopy.disabled = true;
    btnSaveSheets.disabled = true;
});

// ============================================
// Phone Number Formatter (to 628...)
// ============================================
function formatPhoneWhatsApp(phone) {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
    }
    return clean;
}

// ============================================
// Send via WhatsApp
// ============================================
btnSendWA.addEventListener('click', () => {
    if (!currentData || !currentMessage) {
        showToast('Silakan isi form dan buat preview terlebih dahulu!', '⚠️');
        return;
    }

    const waPhone = formatPhoneWhatsApp(currentData.phone);
    const encodedMessage = encodeURIComponent(currentMessage);
    const waUrl = `https://wa.me/${waPhone}?text=${encodedMessage}`;

    // Auto save to history
    saveToHistory(currentData);

    // Auto save to Google Sheets if URL configured
    saveToGoogleSheets(currentData);

    // Open WhatsApp
    window.open(waUrl, '_blank');
});

// ============================================
// Copy Message to Clipboard
// ============================================
btnCopy.addEventListener('click', () => {
    if (!currentMessage) {
        showToast('Pesan belum dibuat!', '⚠️');
        return;
    }
    navigator.clipboard.writeText(currentMessage)
        .then(() => showToast('Pesan berhasil disalin ke clipboard!', '📋'))
        .catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = currentMessage;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Pesan berhasil disalin!', '📋');
        });
});

// ============================================
// Save to Google Sheets (Manual)
// ============================================
btnSaveSheets.addEventListener('click', () => {
    if (!currentData) {
        showToast('Silakan isi form terlebih dahulu!', '⚠️');
        return;
    }
    saveToGoogleSheets(currentData, true);
});

// ============================================
// LocalStorage & History Functions
// ============================================
function getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
}

function saveToHistory(item) {
    let history = getHistory();
    const existingIndex = history.findIndex(h => h.timestamp === item.timestamp);
    if (existingIndex >= 0) {
        history[existingIndex] = item;
    } else {
        history.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Belum ada data transaksi hari ini</td></tr>`;
        return;
    }

    historyTableBody.innerHTML = history.map((item, index) => {
        let badgeClass = 'badge-pending';
        let badgeText = 'Pending';
        if (item.sheetsSynced === true) {
            badgeClass = 'badge-sent';
            badgeText = '✅ Terkirim';
        } else if (item.sheetsSynced === 'failed') {
            badgeClass = 'badge-failed';
            badgeText = '❌ Gagal';
        }

        return `
        <tr>
            <td>${history.length - index}</td>
            <td>${item.formattedDate || item.date}</td>
            <td>${item.name}</td>
            <td>${item.cis || '-'}</td>
            <td>${item.txType}</td>
            <td>${item.phone}</td>
            <td>${item.teller}</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
        </tr>
    `;
    }).join('');
}

btnClearHistory.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin membersihkan riwayat hari ini?')) {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        renderHistory();
        showToast('Riwayat berhasil dibersihkan', '🗑️');
    }
});

// ============================================
// Google Sheets Sync — via GET Request
// ============================================
function loadSheetsUrl() {
    const savedUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
    if (savedUrl) {
        sheetsUrlInput.value = savedUrl;
    }
}

function saveToGoogleSheets(item, manualTrigger = false) {
    const sheetsUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
    if (!sheetsUrl) {
        if (manualTrigger) {
            showToast('URL Google Sheets belum diatur. Klik ⚙️ untuk mengatur.', '⚠️');
            settingsModal.classList.remove('hidden');
        }
        return;
    }

    const payload = {
        tanggal: item.formattedDate,
        nama: item.name,
        salutation: item.salutation,
        cis: item.cis,
        jenisTransaksi: item.txType,
        noTelp: item.phone,
        teller: item.teller
    };

    // Send via GET request with data as query parameter
    const dataParam = encodeURIComponent(JSON.stringify(payload));
    const requestUrl = `${sheetsUrl}?data=${dataParam}`;

    fetch(requestUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(result => {
            if (result.result === 'success') {
                item.sheetsSynced = true;
                saveToHistory(item);
                showToast('Data berhasil dikirim ke Google Sheets!', '📊');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        })
        .catch(err => {
            console.error('Google Sheets Error:', err);
            item.sheetsSynced = 'failed';
            saveToHistory(item);
            if (manualTrigger) {
                showToast('Gagal mengirim ke Google Sheets. Periksa URL.', '❌');
            }
        });
}

// ============================================
// Test Google Sheets Connection
// ============================================
btnTestSheets.addEventListener('click', () => {
    const url = sheetsUrlInput.value.trim();
    if (!url) {
        sheetsStatus.textContent = '⚠️ Masukkan URL terlebih dahulu.';
        sheetsStatus.className = 'sheets-status error';
        return;
    }

    sheetsStatus.textContent = '⏳ Menguji koneksi...';
    sheetsStatus.className = 'sheets-status success';
    sheetsStatus.style.display = 'block';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('HTTP error');
            return response.json();
        })
        .then(result => {
            if (result.status === 'active' || result.result === 'success') {
                sheetsStatus.textContent = '✅ Koneksi berhasil! API aktif.';
                sheetsStatus.className = 'sheets-status success';
            } else {
                sheetsStatus.textContent = '⚠️ Response tidak dikenali.';
                sheetsStatus.className = 'sheets-status error';
            }
        })
        .catch(err => {
            sheetsStatus.textContent = '❌ Gagal terhubung. Pastikan URL benar dan script sudah di-deploy.';
            sheetsStatus.className = 'sheets-status error';
        });
});

// ============================================
// Modal Settings
// ============================================
btnOpenSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
btnCloseSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

// Close modal by clicking overlay/backdrop
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

btnSaveSettings.addEventListener('click', () => {
    const url = sheetsUrlInput.value.trim();
    if (url) {
        localStorage.setItem(STORAGE_KEY_SHEETS_URL, url);
        showToast('URL Google Sheets berhasil disimpan!', '💾');
    } else {
        localStorage.removeItem(STORAGE_KEY_SHEETS_URL);
        showToast('URL Google Sheets dihapus.', '🗑️');
    }
    settingsModal.classList.add('hidden');
});

// ============================================
// Toast Notification — Animated
// ============================================
let toastTimeout = null;

function showToast(msg, icon = '✅') {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toastIcon.textContent = icon;
    toastText.textContent = msg;
    toast.classList.remove('hidden');

    // Trigger reflow before adding show class for animation
    void toast.offsetWidth;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 400);
    }, 3000);
}

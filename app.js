// ============================================
// BSQ Prasurvey PWA — Application Logic v3
// BCA KCP Jembatan Dua
// ============================================

// Storage Keys
const STORAGE_KEY_SHEETS_URL = 'bsq_sheets_url';
const STORAGE_KEY_HISTORY = 'bsq_tx_history';
const STORAGE_KEY_HISTORY_DATE = 'bsq_tx_history_date';

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

const settingsModal = document.getElementById('settingsModal');
const sheetsUrlInput = document.getElementById('sheetsUrlInput');
const sheetsStatus = document.getElementById('sheetsStatus');
const btnOpenSettings = document.getElementById('btnOpenSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnTestSheets = document.getElementById('btnTestSheets');

const historyTableBody = document.getElementById('historyTableBody');
const btnClearHistory = document.getElementById('btnClearHistory');
const historyActions = document.getElementById('historyActions');
const btnSaveAllToSheets = document.getElementById('btnSaveAllToSheets');

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const btnCloseEdit = document.getElementById('btnCloseEdit');
const btnCancelEdit = document.getElementById('btnCancelEdit');

const recapText = document.getElementById('recapText');
const btnCopyRecap = document.getElementById('btnCopyRecap');

const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastText = document.getElementById('toastText');

let currentData = null;
let currentMessage = '';
let editingIndex = -1;

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initDefaultDate();
    updateTimeGreeting();
    loadSheetsUrl();
    checkDailyReset();
    renderHistory();
    generateDailyRecap();
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
// Get Today's Date String (YYYY-MM-DD)
// ============================================
function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ============================================
// Daily Auto-Reset
// ============================================
function checkDailyReset() {
    const today = getTodayString();
    const savedDate = localStorage.getItem(STORAGE_KEY_HISTORY_DATE);

    if (savedDate && savedDate !== today) {
        // Different day — clear history
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        localStorage.setItem(STORAGE_KEY_HISTORY_DATE, today);
    } else if (!savedDate) {
        localStorage.setItem(STORAGE_KEY_HISTORY_DATE, today);
    }
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
// CIS Number — Prevent non-numeric input
// ============================================
cisNumber.addEventListener('keydown', (e) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) return;
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
    // Block non-numeric
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});

// Prevent scroll from changing value
cisNumber.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

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
// Send via WhatsApp — NO auto-save to Sheets
// ============================================
btnSendWA.addEventListener('click', () => {
    if (!currentData || !currentMessage) {
        showToast('Silakan isi form dan buat preview terlebih dahulu!', '⚠️');
        return;
    }

    const waPhone = formatPhoneWhatsApp(currentData.phone);
    const encodedMessage = encodeURIComponent(currentMessage);
    const waUrl = `https://wa.me/${waPhone}?text=${encodedMessage}`;

    // Save to local history as PENDING (NOT to Sheets)
    saveToHistory(currentData);

    // Open WhatsApp
    window.open(waUrl, '_blank');

    showToast('Data masuk riwayat. Pastikan data benar sebelum simpan ke Sheet.', '📋');
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
    // Save today's date
    localStorage.setItem(STORAGE_KEY_HISTORY_DATE, getTodayString());
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    renderHistory();
    generateDailyRecap();
}

function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Belum ada data transaksi hari ini</td></tr>`;
        historyActions.style.display = 'none';
        return;
    }

    // Check if there are any pending items
    const hasPending = history.some(item => item.sheetsSynced === false);
    historyActions.style.display = hasPending ? 'flex' : 'none';

    historyTableBody.innerHTML = history.map((item, index) => {
        let badgeClass = 'badge-pending';
        let badgeText = '⏳ Pending';
        if (item.sheetsSynced === true) {
            badgeClass = 'badge-sent';
            badgeText = '✅ Terkirim';
        } else if (item.sheetsSynced === 'failed') {
            badgeClass = 'badge-failed';
            badgeText = '❌ Gagal';
        }

        const isSynced = item.sheetsSynced === true;
        const rowNumber = history.length - index;

        return `
        <tr class="${isSynced ? 'row-synced' : ''}">
            <td>${rowNumber}</td>
            <td>${item.formattedDate || item.date}</td>
            <td>${item.name}</td>
            <td>${item.cis || '-'}</td>
            <td>${item.txType}</td>
            <td>${item.phone}</td>
            <td>${item.teller}</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
            <td class="action-cell">
                ${!isSynced ? `
                    <button class="btn-action btn-action-edit" onclick="openEditModal(${index})" title="Edit">✏️</button>
                    <button class="btn-action btn-action-delete" onclick="deleteHistoryItem(${index})" title="Hapus">🗑️</button>
                ` : `
                    <span class="action-locked">🔒</span>
                `}
            </td>
        </tr>
    `;
    }).join('');
}

// ============================================
// Delete History Item
// ============================================
function deleteHistoryItem(index) {
    if (!confirm('Hapus data transaksi ini?')) return;
    let history = getHistory();
    if (history[index].sheetsSynced === true) {
        showToast('Data yang sudah terkirim tidak bisa dihapus.', '⚠️');
        return;
    }
    history.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    renderHistory();
    generateDailyRecap();
    showToast('Data berhasil dihapus.', '🗑️');
}

// ============================================
// Edit History Item — Modal
// ============================================
function openEditModal(index) {
    const history = getHistory();
    const item = history[index];

    if (item.sheetsSynced === true) {
        showToast('Data yang sudah terkirim tidak bisa diedit.', '⚠️');
        return;
    }

    editingIndex = index;

    document.getElementById('editName').value = item.name;
    document.getElementById('editCis').value = item.cis || '';
    document.getElementById('editPhone').value = item.phone;
    document.getElementById('editTxType').value = item.txType;
    document.getElementById('editTeller').value = item.teller;

    editModal.classList.remove('hidden');
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editingIndex = -1;
}

btnCloseEdit.addEventListener('click', closeEditModal);
btnCancelEdit.addEventListener('click', closeEditModal);

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (editingIndex < 0) return;

    let history = getHistory();
    const item = history[editingIndex];

    item.name = document.getElementById('editName').value.trim();
    item.cis = document.getElementById('editCis').value.trim();
    item.phone = document.getElementById('editPhone').value.trim();
    item.txType = document.getElementById('editTxType').value.trim();
    item.teller = document.getElementById('editTeller').value.trim();

    history[editingIndex] = item;
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));

    closeEditModal();
    renderHistory();
    generateDailyRecap();
    showToast('Data berhasil diperbarui!', '✅');
});

// ============================================
// Batch Save All Pending Data to Google Sheets
// ============================================
btnSaveAllToSheets.addEventListener('click', async () => {
    const sheetsUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
    if (!sheetsUrl) {
        showToast('URL Google Sheets belum diatur. Klik ⚙️ untuk mengatur.', '⚠️');
        settingsModal.classList.remove('hidden');
        return;
    }

    let history = getHistory();
    const pendingItems = history.filter(item => item.sheetsSynced === false || item.sheetsSynced === 'failed');

    if (pendingItems.length === 0) {
        showToast('Tidak ada data pending untuk disimpan.', 'ℹ️');
        return;
    }

    if (!confirm(`Simpan ${pendingItems.length} data ke Google Sheets? Pastikan semua data sudah benar.`)) {
        return;
    }

    // Disable button during save
    btnSaveAllToSheets.disabled = true;
    btnSaveAllToSheets.textContent = '⏳ Menyimpan...';

    let successCount = 0;
    let failCount = 0;

    // Process in chronological order (oldest first = end of array first)
    // History is stored newest-first, so reverse for chronological sending
    const sortedPendingIndices = [];
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].sheetsSynced === false || history[i].sheetsSynced === 'failed') {
            sortedPendingIndices.push(i);
        }
    }

    for (const idx of sortedPendingIndices) {
        const item = history[idx];
        const payload = {
            tanggal: item.formattedDate,
            nama: item.name,
            salutation: item.salutation,
            cis: item.cis,
            jenisTransaksi: item.txType,
            noTelp: item.phone,
            teller: item.teller
        };

        try {
            const dataParam = encodeURIComponent(JSON.stringify(payload));
            const requestUrl = `${sheetsUrl}?data=${dataParam}`;
            const response = await fetch(requestUrl);

            if (!response.ok) throw new Error('Network error');

            const result = await response.json();
            if (result.result === 'success') {
                history[idx].sheetsSynced = true;
                successCount++;
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Google Sheets Error:', err);
            history[idx].sheetsSynced = 'failed';
            failCount++;
        }
    }

    // Save updated history
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    renderHistory();
    generateDailyRecap();

    // Re-enable button
    btnSaveAllToSheets.disabled = false;
    btnSaveAllToSheets.textContent = '💾 Simpan Seluruh Data ke Sheet';

    if (failCount === 0) {
        showToast(`${successCount} data berhasil disimpan ke Google Sheets!`, '📊');
    } else {
        showToast(`${successCount} berhasil, ${failCount} gagal. Coba lagi untuk data yang gagal.`, '⚠️');
    }
});

// ============================================
// Clear History
// ============================================
btnClearHistory.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin membersihkan riwayat hari ini?')) {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        renderHistory();
        generateDailyRecap();
        showToast('Riwayat berhasil dibersihkan', '🗑️');
    }
});

// ============================================
// Google Sheets Settings
// ============================================
function loadSheetsUrl() {
    const savedUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
    if (savedUrl) {
        sheetsUrlInput.value = savedUrl;
    }
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
// Daily Recap — Generate Formatted Text
// ============================================
function generateDailyRecap() {
    const history = getHistory();

    if (history.length === 0) {
        recapText.textContent = 'Belum ada data transaksi untuk direkap.';
        return;
    }

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const todayFormatted = `${dd}-${mm}-${yyyy}`;

    let recap = `BSQ Teller ${todayFormatted}\n\n`;

    // Build recap in chronological order (oldest first)
    const chronological = [...history].reverse();
    chronological.forEach((item, idx) => {
        recap += `${idx + 1}. ${item.name} - ${item.txType} ${item.phone}\n`;
    });

    recap += `\nauto generated by Lim`;

    recapText.textContent = recap;
}

// ============================================
// Copy Daily Recap to Clipboard
// ============================================
btnCopyRecap.addEventListener('click', () => {
    const text = recapText.textContent;
    if (!text || text === 'Belum ada data transaksi untuk direkap.') {
        showToast('Belum ada data untuk disalin.', '⚠️');
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => showToast('Rekapan berhasil disalin ke clipboard!', '📋'))
        .catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Rekapan berhasil disalin!', '📋');
        });
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

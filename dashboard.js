// buka/tutup sidebar
const sidebar = document.querySelector('.sidebar');
const toggle = sidebar.querySelector('.toggle');

toggle.addEventListener('click', () => {
    sidebar.classList.toggle('close');
});
(function () {
// ----- Buka & tutup modal -----
function bukaModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('tampil');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';      // halaman di belakang tidak ikut scroll
}

function tutupModal(modal) {
    modal.classList.remove('tampil');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Tombol pembuka: semua elemen yang punya data-buka
document.querySelectorAll('[data-buka]').forEach(function (tombol) {
    tombol.addEventListener('click', function () {
        bukaModal(tombol.dataset.buka);
    });
});

// Tombol tutup (X dan Batal)
document.querySelectorAll('[data-tutup]').forEach(function (tombol) {
    tombol.addEventListener('click', function () {
        tutupModal(tombol.closest('.modal-latar'));
    });
});

// Klik area gelap di luar kotak = tutup
document.querySelectorAll('.modal-latar').forEach(function (latar) {
    latar.addEventListener('click', function (e) {
        if (e.target === latar) tutupModal(latar);
    });
});

// Tekan Esc = tutup
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-latar.tampil').forEach(tutupModal);
    }
});

// ----- Isi pilihan bulan otomatis -----
const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const pilihBulan = document.getElementById('pm-bulan');
const sekarang = new Date();
namaBulan.forEach(function (bulan, i) {
    const opsi = document.createElement('option');
    opsi.textContent = bulan + ' ' + sekarang.getFullYear();
    if (i === sekarang.getMonth()) opsi.selected = true;   // default bulan ini
    pilihBulan.appendChild(opsi);
});

// ----- Tanggal default = hari ini -----
const hariIni = sekarang.toISOString().slice(0, 10);
document.getElementById('pm-tanggal').value = hariIni;
document.getElementById('pg-tanggal').value = hariIni;

// ----- Format nominal: 50000 -> 50.000 -----
document.querySelectorAll('#pm-nominal, #pg-nominal').forEach(function (input) {
    input.addEventListener('input', function () {
        const angka = input.value.replace(/\D/g, '');            // buang selain angka
        input.value = angka ? Number(angka).toLocaleString('id-ID') : '';
    });
});

// ----- Simpan (sementara masih console.log) -----
document.getElementById('form-pemasukan').addEventListener('submit', function (e) {
    e.preventDefault();                                          // cegah reload halaman
    const data = {
        anggota: document.getElementById('pm-anggota').value,
        tanggal: document.getElementById('pm-tanggal').value,
        nominal: Number(document.getElementById('pm-nominal').value.replace(/\./g, '')),
        bulan: document.getElementById('pm-bulan').value
    };
    console.log('Pemasukan:', data);
    // TODO: simpan ke localStorage / backend, lalu refresh tabel
    this.reset();
    tutupModal(document.getElementById('modal-pemasukan'));
});

document.getElementById('form-pengeluaran').addEventListener('submit', function (e) {
    e.preventDefault();
    const data = {
        jenis: document.getElementById('pg-jenis').value,
        keperluan: document.getElementById('pg-keperluan').value,
        tanggal: document.getElementById('pg-tanggal').value,
        nominal: Number(document.getElementById('pg-nominal').value.replace(/\./g, '')),
        keterangan: document.getElementById('pg-ket').value
    };
    console.log('Pengeluaran:', data);
    this.reset();
    tutupModal(document.getElementById('modal-pengeluaran'));
});
})();
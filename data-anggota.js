// =====================================================
// 1. Ambil elemen yang dibutuhkan
// =====================================================
const modal        = document.getElementById('modal-anggota');
const form         = document.getElementById('form-anggota');
const tbody        = document.getElementById('isi-tabel');
const jumlah       = document.getElementById('jumlah-anggota');
const kolomCari    = document.getElementById('kolom-cari');
const pesanKosong  = document.getElementById('pesan-kosong');
const infoPaging   = document.getElementById('info-paging');
const tombolPaging = document.getElementById('tombol-paging');
const toastEl      = document.getElementById('toast');

// Nama "laci" tempat daftar anggota disimpan di browser
const kunciSimpan = 'dataAnggota';

// Berapa baris per halaman
const PER_HALAMAN = 5;

// Daftar anggota awal (dipakai kalau belum ada yang tersimpan di browser)
const dataAwal = [
    { nim: '3312601044', nama: 'Ariel', jabatan: 'Ketua Kelas', kelas: 'IF-1B' }
];

// Penanda mode ubah: berisi NIM anggota yang sedang diubah (null = sedang menambah)
let nimDiedit = null;

// Halaman tabel yang sedang dibuka
let halaman = 1;

// =====================================================
// 2. Penyimpanan (localStorage)
// =====================================================
function ambilTersimpan() {
    try {
        const teks = localStorage.getItem(kunciSimpan);
        if (teks === null) {
            return dataAwal.slice();
        }
        return JSON.parse(teks);
    } catch (err) {
        return dataAwal.slice();
    }
}

// Mengembalikan true kalau berhasil, false kalau gagal
function simpan() {
    try {
        localStorage.setItem(kunciSimpan, JSON.stringify(daftar));
        return true;
    } catch (err) {
        return false;
    }
}

// Seluruh data anggota disimpan di sini; tabel selalu digambar ulang dari array ini
let daftar = ambilTersimpan();

// =====================================================
// 3. Notifikasi (toast) berhasil / gagal
// =====================================================
let waktuToast = null;

function tampilToast(pesan, jenis) {
    toastEl.textContent = pesan;
    toastEl.className = 'toast show ' + jenis;     // jenis: 'sukses' atau 'gagal'

    clearTimeout(waktuToast);
    waktuToast = setTimeout(function () {
        toastEl.classList.remove('show');
    }, 2500);
}

// =====================================================
// 4. Pesan error di bawah kolom
// =====================================================
function tampilError(namaField, pesan) {
    const grup = form.elements[namaField].closest('.form-group');
    grup.classList.add('error');
    document.getElementById('err-' + namaField).textContent = pesan;
}

function bersihkanError() {
    form.querySelectorAll('.form-group.error').forEach(function (g) {
        g.classList.remove('error');
    });
    form.querySelectorAll('.pesan-error').forEach(function (p) {
        p.textContent = '';
    });
}

// Error satu kolom hilang begitu pengguna mulai mengetik lagi
form.addEventListener('input', function (e) {
    const grup = e.target.closest('.form-group');
    if (grup === null) return;

    grup.classList.remove('error');
    const pesan = grup.querySelector('.pesan-error');
    if (pesan !== null) pesan.textContent = '';
});

// Kolom NIM hanya menerima angka
form.elements.nim.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
});

// =====================================================
// 5. Buka dan tutup modal
// =====================================================
function bukaModal() {
    modal.classList.add('show');
    form.elements.nim.focus();
}

function tutupModal() {
    modal.classList.remove('show');
    form.reset();                      // kosongkan isian (Kelas kembali ke "IF-1B")
    bersihkanError();

    // kembalikan form ke mode "tambah anggota"
    nimDiedit = null;
    document.getElementById('judul-modal').textContent = 'Tambah Data Anggota';
    form.elements.nim.readOnly = false;
}

document.getElementById('btn-buka-modal').addEventListener('click', bukaModal);
document.getElementById('btn-tutup-modal').addEventListener('click', tutupModal);
document.getElementById('btn-batal').addEventListener('click', tutupModal);

// klik area gelap di luar modal = tutup
modal.addEventListener('click', function (e) {
    if (e.target === modal) tutupModal();
});

// tekan Esc = tutup
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tutupModal();
});

// =====================================================
// 6. Membuat baris tabel
// =====================================================
// Ambil inisial untuk avatar: "Budi Utomo" -> "BU"
function ambilInisial(nama) {
    const kata  = nama.trim().split(/\s+/);
    const awal  = kata[0][0];
    const akhir = kata.length > 1 ? kata[kata.length - 1][0] : '';
    return (awal + akhir).toUpperCase();
}

function buatBaris(data) {
    const tr = document.createElement('tr');
    tr.dataset.nim = data.nim;

    // kerangka statis (aman, tidak berisi input pengguna)
    tr.innerHTML = `
        <td class="td-nim"></td>
        <td>
            <div class="nama-cell">
                <span class="avatar-kecil"></span>
                <span class="td-nama"></span>
            </div>
        </td>
        <td class="td-kelas"></td>
        <td class="td-jabatan"></td>
        <td class="col-aksi">
            <div class="aksi-btn">
                <a href="#" title="Ubah" class="edit"><i class="bx bx-pencil"></i></a>
                <a href="#" title="Hapus" class="hapus"><i class="bx bx-trash"></i></a>
            </div>
        </td>
    `;

    // isi data pakai textContent (aman dari kode berbahaya)
    tr.querySelector('.td-nim').textContent       = data.nim;
    tr.querySelector('.avatar-kecil').textContent = ambilInisial(data.nama);
    tr.querySelector('.td-nama').textContent      = data.nama;
    tr.querySelector('.td-kelas').textContent     = data.kelas;
    tr.querySelector('.td-jabatan').textContent   = data.jabatan;

    return tr;
}

// =====================================================
// 7. Menggambar tabel (pencarian + pagination)
// =====================================================
function tampilkan() {
    const kata = kolomCari.value.trim().toLowerCase();

    // a. saring berdasarkan NIM atau nama
    const hasil = daftar.filter(function (a) {
        return a.nim.toLowerCase().includes(kata) ||
               a.nama.toLowerCase().includes(kata);
    });

    // b. hitung halaman
    const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
    if (halaman > totalHalaman) halaman = totalHalaman;
    if (halaman < 1) halaman = 1;

    const mulai = (halaman - 1) * PER_HALAMAN;
    const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

    // c. gambar ulang baris tabel
    tbody.innerHTML = '';
    tampil.forEach(function (a) {
        tbody.appendChild(buatBaris(a));
    });

    // d. jumlah anggota di judul
    jumlah.textContent = daftar.length;

    // e. pesan kosong: dibedakan antara "belum ada data" dan "pencarian tidak cocok"
    if (daftar.length === 0) {
        pesanKosong.textContent = 'Belum ada data anggota.';
        pesanKosong.hidden = false;
    } else if (hasil.length === 0) {
        pesanKosong.textContent = 'Data tidak ditemukan';
        pesanKosong.hidden = false;
    } else {
        pesanKosong.hidden = true;
    }

    // f. teks "Menampilkan 1-5 dari 5 data"
    if (hasil.length === 0) {
        infoPaging.textContent = 'Menampilkan 0 dari 0 data';
    } else {
        infoPaging.textContent = 'Menampilkan ' + (mulai + 1) + '-' +
                                 (mulai + tampil.length) + ' dari ' +
                                 hasil.length + ' data';
    }

    buatPaging(totalHalaman);
}

function buatTombolHalaman(isi, tujuan, nonaktif, aktif, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'paging-item' + (aktif ? ' aktif' : '');
    b.innerHTML = isi;
    b.disabled = nonaktif;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', function () {
        halaman = tujuan;
        tampilkan();
    });
    return b;
}

function buatPaging(totalHalaman) {
    tombolPaging.innerHTML = '';

    tombolPaging.appendChild(
        buatTombolHalaman('<i class="bx bx-chevron-left"></i>', halaman - 1, halaman === 1, false, 'Halaman sebelumnya')
    );

    for (let i = 1; i <= totalHalaman; i++) {
        tombolPaging.appendChild(
            buatTombolHalaman(String(i), i, false, i === halaman, 'Halaman ' + i)
        );
    }

    tombolPaging.appendChild(
        buatTombolHalaman('<i class="bx bx-chevron-right"></i>', halaman + 1, halaman === totalHalaman, false, 'Halaman berikutnya')
    );
}

// =====================================================
// 8. Simpan form (tambah / ubah)
// =====================================================
form.addEventListener('submit', function (e) {
    e.preventDefault();      // cegah halaman reload
    bersihkanError();

    const modeUbah = (nimDiedit !== null);

    const data = {
        nim:     form.elements.nim.value.trim(),
        nama:    form.elements.nama.value.trim(),
        jabatan: form.elements.jabatan.value,
        kelas:   form.elements.kelas.value
    };

    // ----- validasi -----
    let adaError = false;

    if (data.nim === '') {
        tampilError('nim', 'Kolom ini wajib diisi');
        adaError = true;
    } else if (!/^\d{10}$/.test(data.nim)) {
        tampilError('nim', 'NIM harus berupa 10 digit angka');
        adaError = true;
    } else if (!modeUbah && daftar.some(function (a) { return a.nim === data.nim; })) {
        tampilError('nim', 'NIM ini sudah terdaftar');
        adaError = true;
    }

    if (data.nama === '') {
        tampilError('nama', 'Kolom ini wajib diisi');
        adaError = true;
    }

    if (adaError) {
        tampilToast('Data gagal disimpan. Periksa kembali isian.', 'gagal');
        return;
    }

    // ----- simpan -----
    const cadangan = daftar.slice();         // untuk dibatalkan kalau penyimpanan gagal

    if (modeUbah) {
        daftar = daftar.map(function (a) {
            return a.nim === nimDiedit ? data : a;
        });
    } else {
        daftar.push(data);
        kolomCari.value = '';                // hapus pencarian supaya anggota baru terlihat
        halaman = Math.ceil(daftar.length / PER_HALAMAN);   // lompat ke halaman terakhir
    }

    if (!simpan()) {
        daftar = cadangan;
        tampilToast('Data gagal disimpan.', 'gagal');
        return;
    }

    tutupModal();
    tampilkan();
    tampilToast(modeUbah ? 'Data berhasil diubah' : 'Data berhasil disimpan', 'sukses');
});

// =====================================================
// 9. Tombol edit dan hapus di kolom Aksi
// =====================================================
tbody.addEventListener('click', function (e) {

    // ----- hapus -----
    const tombolHapus = e.target.closest('.hapus');
    if (tombolHapus !== null) {
        e.preventDefault();

        const nim = tombolHapus.closest('tr').dataset.nim;
        const anggota = daftar.find(function (a) { return a.nim === nim; });
        if (anggota === undefined) return;

        // aturan: anggota yang sudah punya transaksi tidak boleh dihapus
        if (hitungPemakaianAnggota(nim) > 0) {
            tampilToast('Tidak dapat dihapus karena sudah dipakai oleh transaksi.', 'gagal');
            return;
        }

        // dialog konfirmasi
        if (!confirm('Hapus anggota ' + anggota.nama + ' (' + anggota.nim + ')?')) {
            return;
        }

        const cadangan = daftar.slice();
        daftar = daftar.filter(function (a) { return a.nim !== nim; });

        if (!simpan()) {
            daftar = cadangan;
            tampilToast('Data gagal dihapus.', 'gagal');
            return;
        }

        tampilkan();
        tampilToast('Data berhasil dihapus', 'sukses');
        return;
    }

    // ----- edit -----
    const tombolEdit = e.target.closest('.edit');
    if (tombolEdit !== null) {
        e.preventDefault();

        const nim = tombolEdit.closest('tr').dataset.nim;
        const anggota = daftar.find(function (a) { return a.nim === nim; });
        if (anggota === undefined) return;

        // isi form dengan data anggota itu
        form.elements.nim.value     = anggota.nim;
        form.elements.nama.value    = anggota.nama;
        form.elements.jabatan.value = anggota.jabatan;
        form.elements.kelas.value   = anggota.kelas;

        // ubah form menjadi mode ubah: judul diganti, NIM dikunci
        nimDiedit = nim;
        document.getElementById('judul-modal').textContent = 'Ubah Data Anggota';
        form.elements.nim.readOnly = true;

        bukaModal();
    }
});

// =====================================================
// 10. Pencarian NIM atau nama
// =====================================================
kolomCari.addEventListener('input', function () {
    halaman = 1;          // setiap pencarian baru mulai dari halaman 1
    tampilkan();
});

// =====================================================
// 11. Tampilkan tabel saat halaman dibuka
// =====================================================
tampilkan();

// Kolom pencarian di topbar: tekan Enter untuk mencari di halaman Data Transaksi (FR-05)
document.getElementById('cari-atas').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        window.location.href = 'data-transaksi.html?q=' + encodeURIComponent(this.value);
    }
});
